import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebase } from "./firebase";

const MCP_ADMIN = "meron.s@aspio.se";
const DOC_PATH = ["mcpConfig", "server"] as const;

export function isMcpAdmin(user: User | null): boolean {
  return (user?.email?.toLowerCase() ?? "") === MCP_ADMIN;
}

// ── DOM refs ────────────────────────────────────────────────────────────────

let tabBtn: HTMLButtonElement | null = null;
let panel: HTMLElement | null = null;
let initialized = false;

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Called after sign-in. If the user is the MCP admin, inject the tab button
 * and panel, then load the config from Firestore.
 */
export async function initMcp(user: User): Promise<void> {
  if (!isMcpAdmin(user)) return;
  if (!initialized) {
    injectTab();
    injectPanel();
    initialized = true;
  }
  await loadConfig();
}

/**
 * Called on sign-out / local-only mode. Hides and removes the MCP tab.
 */
export function teardownMcp(): void {
  tabBtn?.remove();
  panel?.remove();
  tabBtn = null;
  panel = null;
  initialized = false;
}

// ── Firestore helpers ────────────────────────────────────────────────────────

async function loadConfig(): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  try {
    const snap = await getDoc(doc(fb.db, ...DOC_PATH));
    const data = snap.exists() ? snap.data() : null;
    renderConfig(data);
  } catch (err) {
    console.warn("[mcp] could not load config", err);
    renderError("Could not load MCP config from Firestore.");
  }
}

async function saveConfig(url: string, notes: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase not available");
  await setDoc(doc(fb.db, ...DOC_PATH), {
    url: url.trim(),
    notes: notes.trim(),
    updatedAt: serverTimestamp(),
  });
}

// ── DOM injection ────────────────────────────────────────────────────────────

function injectTab(): void {
  const tabs = document.querySelector<HTMLElement>(".tabs");
  if (!tabs) return;
  tabBtn = document.createElement("button");
  tabBtn.type = "button";
  tabBtn.dataset.tab = "mcp";
  tabBtn.setAttribute("aria-selected", "false");
  tabBtn.textContent = "⚙ MCP Config";
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
      <div class="gh"><h2>MCP Server Configuration</h2><span>Admin only · stored in Firestore</span></div>
      <section class="panel" id="mcpPanel">
        <p style="color:var(--mut);font-size:13px;margin:0 0 14px">
          This configuration is only visible to you. The URL and notes are stored
          securely in Firestore and never included in the client bundle.
        </p>
        <div id="mcpContent"><div class="mcp-loading">Loading…</div></div>
      </section>
    </main>`;
  document.body.appendChild(panel);
}

function showMcpPanel(): void {
  // Hide all other pages
  ["pgCheck", "pgFeat", "pgLast", "pgDevelop", "pgMarketplace"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  if (panel) panel.hidden = false;
  window.scrollTo({ top: 0 });
}

// ── Render helpers ───────────────────────────────────────────────────────────

function esc(s: string): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

function renderConfig(data: Record<string, any> | null): void {
  const content = document.getElementById("mcpContent");
  if (!content) return;

  const url = data?.url ?? "";
  const notes = data?.notes ?? "";

  content.innerHTML = `
    <div class="lbl" style="margin-top:0">MCP Server URL</div>
    <div class="mcp-url-row">
      <input class="field" id="mcpUrl" type="url" placeholder="https://your-mcp-server.example.com/sse"
             value="${esc(url)}" autocomplete="off" spellcheck="false">
      <button class="btn sec" id="mcpCopy" type="button" title="Copy URL">Copy</button>
    </div>
    <div class="lbl">Notes / instructions</div>
    <textarea id="mcpNotes" placeholder="API key, usage notes, endpoint details…" style="min-height:100px">${esc(notes)}</textarea>
    <div class="row2" style="margin-top:12px">
      <button class="btn" id="mcpSave" type="button">Save</button>
      <span id="mcpMsg" style="font-size:13px;color:var(--mut);align-self:center"></span>
    </div>
    ${url ? `
    <div class="lbl">Quick reference</div>
    <div class="mcp-ref">
      <p>Add to your Kiro <code>mcp.json</code>:</p>
      <pre class="mcp-pre" id="mcpSnippet">${esc(buildSnippet(url))}</pre>
      <button class="btn sec" id="mcpCopySnippet" type="button">Copy JSON snippet</button>
    </div>` : ""}`;

  document.getElementById("mcpCopy")?.addEventListener("click", () => copyText(url, "mcpCopy", "Copied!"));
  document.getElementById("mcpCopySnippet")?.addEventListener("click", () =>
    copyText(buildSnippet(url), "mcpCopySnippet", "Copied!")
  );
  document.getElementById("mcpSave")?.addEventListener("click", async () => {
    const urlEl = document.getElementById("mcpUrl") as HTMLInputElement;
    const notesEl = document.getElementById("mcpNotes") as HTMLTextAreaElement;
    const msg = document.getElementById("mcpMsg")!;
    const saveBtn = document.getElementById("mcpSave") as HTMLButtonElement;
    saveBtn.disabled = true;
    msg.textContent = "Saving…";
    try {
      await saveConfig(urlEl.value, notesEl.value);
      msg.style.color = "var(--pass)";
      msg.textContent = "Saved ✓";
      setTimeout(() => {
        msg.textContent = "";
        msg.style.color = "";
      }, 3000);
      // Re-render with updated snippet
      renderConfig({ url: urlEl.value, notes: notesEl.value });
    } catch (err: any) {
      msg.style.color = "var(--fail)";
      msg.textContent = "Error: " + (err?.message ?? "unknown");
    } finally {
      saveBtn.disabled = false;
    }
  });
}

function renderError(message: string): void {
  const content = document.getElementById("mcpContent");
  if (content) content.innerHTML = `<p style="color:var(--fail)">${esc(message)}</p>`;
}

function buildSnippet(url: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        "aspio-mcp": {
          url: url,
          disabled: false,
        },
      },
    },
    null,
    2
  );
}

async function copyText(text: string, btnId: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById(btnId) as HTMLButtonElement | null;
    if (btn) {
      const orig = btn.textContent!;
      btn.textContent = label;
      setTimeout(() => {
        btn.textContent = orig;
      }, 1800);
    }
  } catch {
    /* clipboard blocked — silently ignore */
  }
}
