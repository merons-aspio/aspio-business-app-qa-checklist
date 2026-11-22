import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebase } from "./firebase";

const MCP_ADMIN = "meron.s@aspio.se";
const LS_KEY = "aspio-mcp-key";

export function isMcpAdmin(user: User | null): boolean {
  return (user?.email?.toLowerCase() ?? "") === MCP_ADMIN;
}

let tabBtn: HTMLButtonElement | null = null;
let panel: HTMLElement | null = null;
let initialized = false;
let currentUser: User | null = null;

export async function initMcp(user: User): Promise<void> {
  if (!isMcpAdmin(user)) return;
  currentUser = user;
  if (!initialized) {
    injectTab();
    injectPanel();
    initialized = true;
  }
  await loadKeyState();
}

export function teardownMcp(): void {
  tabBtn?.remove();
  panel?.remove();
  tabBtn = null;
  panel = null;
  initialized = false;
  currentUser = null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildMcpUrl(token: string): string {
  const host = window.location.origin;
  return `${host}/api/mcp?key=${encodeURIComponent(token)}`;
}

// ── Firestore key management ──────────────────────────────────────────────────

async function loadKeyState(): Promise<void> {
  const fb = getFirebase();
  if (!fb) { renderNoFirebase(); return; }
  try {
    const snap = await getDoc(doc(fb.db, "mcpKeys", "meron"));
    const hasDoc = snap.exists();
    const localToken = localStorage.getItem(LS_KEY) ?? "";
    renderPanel(hasDoc, localToken);
  } catch (err) {
    console.warn("[mcp] loadKeyState failed", err);
    renderError("Could not load key state from Firestore.");
  }
}

async function generateKey(): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const hash = await sha256hex(token);
  await setDoc(doc(fb.db, "mcpKeys", "meron"), {
    keyHash: hash,
    createdAt: serverTimestamp(),
  });
  localStorage.setItem(LS_KEY, token);
  renderPanel(true, token);
}

async function testConnection(token: string): Promise<void> {
  const statusEl = document.getElementById("mcpTestStatus");
  if (!statusEl) return;
  statusEl.textContent = "Testing…";
  statusEl.className = "mcp-status mcp-status--pending";
  try {
    const url = buildMcpUrl(token);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as any;
    const count = json?.result?.tools?.length ?? 0;
    statusEl.textContent = `✓ Connected — ${count} tool${count !== 1 ? "s" : ""} available`;
    statusEl.className = "mcp-status mcp-status--ok";
  } catch (err: any) {
    statusEl.textContent = `✗ Failed: ${err?.message ?? String(err)}`;
    statusEl.className = "mcp-status mcp-status--fail";
  }
}

// ── DOM injection ─────────────────────────────────────────────────────────────

function injectTab(): void {
  const tabs = document.querySelector<HTMLElement>(".tabs");
  if (!tabs) return;
  tabBtn = document.createElement("button");
  tabBtn.type = "button";
  tabBtn.dataset.tab = "mcp";
  tabBtn.setAttribute("aria-selected", "false");
  tabBtn.textContent = "⚙ MCP Server";
  tabBtn.addEventListener("click", () => {
    document.querySelectorAll<HTMLButtonElement>(".tabs button").forEach((b) =>
      b.setAttribute("aria-selected", "false")
    );
    tabBtn!.setAttribute("aria-selected", "true");
    showMcpPanel();
  });
  tabs.appendChild(tabBtn);
}

function injectPanel(): void {
  panel = document.createElement("div");
  panel.id = "pgMcp";
  panel.hidden = true;
  panel.innerHTML = `
    <main class="wrap" style="padding-top:24px">
      <div class="gh"><h2>MCP Server</h2><span>Admin only · meron.s@aspio.se</span></div>
      <section class="panel" id="mcpPanel">
        <p style="color:var(--mut);font-size:13px;margin:0 0 14px">
          Your personal MCP endpoint is live and ready to connect.
        </p>
        <div id="mcpContent"><div class="mcp-loading">Loading…</div></div>
      </section>
    </main>`;
  document.body.appendChild(panel);
}

function showMcpPanel(): void {
  ["pgCheck", "pgFeat", "pgLast", "pgDevelop", "pgMarketplace"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  if (panel) panel.hidden = false;
  window.scrollTo({ top: 0 });
}

// ── Render ────────────────────────────────────────────────────────────────────

function renderNoFirebase(): void {
  const el = document.getElementById("mcpContent");
  if (el) el.innerHTML = `<p style="color:var(--fail)">Firebase not configured.</p>`;
}

function renderError(msg: string): void {
  const el = document.getElementById("mcpContent");
  if (el) el.innerHTML = `<p style="color:var(--fail)">${esc(msg)}</p>`;
}

function renderPanel(hasDoc: boolean, localToken: string): void {
  const content = document.getElementById("mcpContent");
  if (!content) return;

  const url = localToken ? buildMcpUrl(localToken) : "";

  const noKey = !hasDoc;
  const keyHidden = hasDoc && !localToken;

  const claudeJson = esc(
    JSON.stringify(
      { mcpServers: { "aspio-qa": { command: "mcp-remote", args: [url || "https://<your-domain>/api/mcp?key=<secret>"] } } },
      null,
      2
    )
  );
  const displayUrl = esc(url || "https://<your-domain>/api/mcp?key=<secret>");

  content.innerHTML = `
    <div class="lbl" style="margin-top:0">Secret MCP URL</div>
    ${noKey ? `<p class="mcp-no-key">No key yet. Generate one to get started.</p>` : ""}
    ${keyHidden ? `<p class="mcp-no-key">Key exists (secret hidden) — regenerate to reveal a new one.</p>` : ""}
    ${!noKey ? `
      <div class="mcp-url-row">
        <input class="field" id="mcpUrlField" type="text" readonly
               value="${displayUrl}"
               style="font-family:monospace;font-size:12px" />
        <button class="btn sec" id="mcpCopyUrl" type="button">Copy</button>
      </div>` : ""}
    <div class="mcp-actions">
      <button class="btn sec" id="mcpGenKey" type="button">${noKey ? "Generate key" : "Regenerate key"}</button>
      ${!noKey && localToken ? `<button class="btn sec" id="mcpTestBtn" type="button">Test connection</button>
      <span id="mcpTestStatus" class="mcp-status"></span>` : ""}
    </div>

    <div class="mcp-accordions">
      <details class="mcp-detail">
        <summary>Claude Desktop setup</summary>
        <div class="mcp-detail-body">
          <ol>
            <li>Install mcp-remote: <code>npm install -g mcp-remote</code></li>
            <li>Open Claude Desktop → Settings → Developer → Edit Config</li>
            <li>Add to <code>mcpServers</code>:</li>
          </ol>
          <pre class="mcp-pre" id="mcpClaudeJson">${claudeJson}</pre>
          <button class="btn sec mcp-copy-pre" type="button" data-target="mcpClaudeJson">Copy JSON</button>
          <ol start="4"><li>Restart Claude Desktop</li></ol>
        </div>
      </details>

      <details class="mcp-detail">
        <summary>ChatGPT / OpenAI setup</summary>
        <div class="mcp-detail-body">
          <ol>
            <li>Go to ChatGPT → Settings → Connected apps → Add custom connector</li>
            <li>Paste the MCP URL directly (ChatGPT supports Streamable HTTP natively):</li>
          </ol>
          <pre class="mcp-pre" id="mcpChatGptUrl">${displayUrl}</pre>
          <button class="btn sec mcp-copy-pre" type="button" data-target="mcpChatGptUrl">Copy URL</button>
          <ol start="3"><li>Authorize when prompted</li></ol>
        </div>
      </details>

      <details class="mcp-detail">
        <summary>Available tools (6)</summary>
        <div class="mcp-detail-body">
          <ul class="mcp-tools-list">
            <li><code>qa_list_tests</code> — List all test IDs and statuses (optional status filter)</li>
            <li><code>qa_get_test</code> — Get full details of one test by ID</li>
            <li><code>qa_update_test</code> — Update a test's status and/or notes</li>
            <li><code>qa_list_bugs</code> — List all logged bugs</li>
            <li><code>qa_add_bug</code> — Add a new bug report</li>
            <li><code>qa_summary</code> — Return pass/fail/blocked/not-tested counts</li>
          </ul>
        </div>
      </details>
    </div>`;

  document.getElementById("mcpGenKey")?.addEventListener("click", async () => {
    const btn = document.getElementById("mcpGenKey") as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = "Generating…";
    try {
      await generateKey();
    } catch (err: any) {
      renderError("Failed to generate key: " + (err?.message ?? String(err)));
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("mcpCopyUrl")?.addEventListener("click", async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById("mcpCopyUrl") as HTMLButtonElement;
      const orig = btn.textContent!;
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = orig; }, 1800);
    } catch { /* blocked */ }
  });

  document.getElementById("mcpTestBtn")?.addEventListener("click", () => {
    if (localToken) testConnection(localToken);
  });

  document.querySelectorAll<HTMLButtonElement>(".mcp-copy-pre").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = btn.dataset.target;
      if (!target) return;
      const pre = document.getElementById(target);
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.textContent ?? "");
        const orig = btn.textContent!;
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = orig; }, 1800);
      } catch { /* blocked */ }
    });
  });
}
