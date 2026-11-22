import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { timingSafeEqual } from 'crypto';

const MCP_KEY_DOC = 'meron';

// Guard singleton initialization
function ensureAdminApp() {
  if (getApps().length > 0) return;
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!sa) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not set');
  initializeApp({ credential: cert(JSON.parse(sa)) });
}

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function validateToken(token: string): Promise<boolean> {
  ensureAdminApp();
  const db = getFirestore();
  const snap = await db.collection('mcpKeys').doc(MCP_KEY_DOC).get();
  if (!snap.exists) return false;
  const stored = snap.data()?.keyHash as string | undefined;
  if (!stored) return false;
  const incoming = await sha256hex(token);
  try {
    return timingSafeEqual(Buffer.from(incoming, 'hex'), Buffer.from(stored, 'hex'));
  } catch {
    return false;
  }
}

const TOOLS = [
  { name: 'qa_list_tests', description: 'List all test IDs and statuses', inputSchema: { type: 'object', properties: { filter: { type: 'string', enum: ['Failed','Blocked','Not tested','Passed'], description: 'Optional status filter' } }, required: [] } },
  { name: 'qa_get_test', description: 'Get full details of one test', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'qa_update_test', description: "Update a test's status and/or notes", inputSchema: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string' }, notes: { type: 'string' } }, required: ['id','status'] } },
  { name: 'qa_list_bugs', description: 'List all logged bugs', inputSchema: { type: 'object', properties: {}, required: [] } },
  { name: 'qa_add_bug', description: 'Add a new bug report', inputSchema: { type: 'object', properties: { title: { type: 'string' }, sev: { type: 'string' }, area: { type: 'string' }, steps: { type: 'string' } }, required: ['title','sev'] } },
  { name: 'qa_summary', description: 'Return pass/fail/blocked/not-tested counts', inputSchema: { type: 'object', properties: {}, required: [] } },
];

async function handleToolCall(name: string, args: Record<string, any>): Promise<string> {
  ensureAdminApp();
  const db = getFirestore();
  const RUN = 'current';

  if (name === 'qa_list_tests') {
    const snap = await db.collection('qaRuns').doc(RUN).collection('tests').get();
    let tests = snap.docs.map(d => ({ id: d.data().testId || d.id, status: d.data().status || 'Not tested' }));
    if (args.filter) tests = tests.filter(t => t.status === args.filter);
    return JSON.stringify(tests, null, 2);
  }
  if (name === 'qa_get_test') {
    const id = String(args.id).replace(/\//g, '__').slice(0, 1400);
    const snap = await db.collection('qaRuns').doc(RUN).collection('tests').doc(id).get();
    if (!snap.exists) return JSON.stringify({ error: 'Test not found' });
    return JSON.stringify(snap.data(), null, 2);
  }
  if (name === 'qa_update_test') {
    const id = String(args.id).replace(/\//g, '__').slice(0, 1400);
    const ref = db.collection('qaRuns').doc(RUN).collection('tests').doc(id);
    await ref.set({ testId: id, status: args.status, notes: args.notes || '', updatedAt: new Date().toISOString() }, { merge: true });
    return JSON.stringify({ ok: true, id, status: args.status });
  }
  if (name === 'qa_list_bugs') {
    const snap = await db.collection('qaRuns').doc(RUN).collection('bugs').get();
    return JSON.stringify(snap.docs.map(d => ({ ...d.data(), id: d.data().bugId || d.id })), null, 2);
  }
  if (name === 'qa_add_bug') {
    const id = `bug-${Date.now()}`;
    await db.collection('qaRuns').doc(RUN).collection('bugs').doc(id).set({
      bugId: id, title: args.title, sev: args.sev, area: args.area || '', steps: args.steps || '', createdAt: new Date().toISOString()
    });
    return JSON.stringify({ ok: true, id });
  }
  if (name === 'qa_summary') {
    const snap = await db.collection('qaRuns').doc(RUN).collection('tests').get();
    const counts: Record<string, number> = { Passed: 0, Failed: 0, Blocked: 0, 'Not tested': 0, Other: 0 };
    snap.docs.forEach(d => {
      const s: string = d.data().status || 'Not tested';
      if (s in counts) counts[s]++; else counts.Other++;
    });
    return JSON.stringify(counts, null, 2);
  }
  throw new Error(`Unknown tool: ${name}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract token from ?key= or Authorization: Bearer
  const token = (req.query.key as string | undefined) ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let authed = false;
  try {
    authed = await validateToken(token);
  } catch (err: any) {
    return res.status(500).json({ error: 'Auth check failed: ' + String(err?.message || err) });
  }
  if (!authed) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body as any;
  const { jsonrpc, id, method, params } = body || {};
  const rpcId = id ?? null;

  if (method === 'initialize') {
    return res.status(200).json({
      jsonrpc: '2.0', id: rpcId,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'aspio-qa', version: '1.0.0' },
        capabilities: { tools: {} }
      }
    });
  }

  if (method === 'tools/list') {
    return res.status(200).json({
      jsonrpc: '2.0', id: rpcId,
      result: { tools: TOOLS }
    });
  }

  if (method === 'tools/call') {
    const toolName = params?.name as string;
    const toolArgs = (params?.arguments || {}) as Record<string, any>;
    try {
      const text = await handleToolCall(toolName, toolArgs);
      return res.status(200).json({
        jsonrpc: '2.0', id: rpcId,
        result: { content: [{ type: 'text', text }] }
      });
    } catch (err: any) {
      return res.status(200).json({
        jsonrpc: '2.0', id: rpcId,
        error: { code: -32603, message: String(err?.message || err) }
      });
    }
  }

  return res.status(200).json({
    jsonrpc: '2.0', id: rpcId,
    error: { code: -32601, message: 'Method not found' }
  });
}
