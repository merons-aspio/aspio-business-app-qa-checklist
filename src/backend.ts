import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import "./backend.css";
import {
  firebaseConfigured,
  firebaseDisabled,
  firebaseEnabled,
  getFirebase,
} from "./firebase";
import { initMcp, isMcpAdmin, teardownMcp } from "./mcp";
import {
  flushPending,
  startSync,
  stopSync,
  type SyncHandlers,
  type SyncStatus,
} from "./sync";

const ALLOWED_DOMAIN = "aspio.se";

const STATUS_LABEL: Record<SyncStatus, string> = {
  local: "Local only",
  connecting: "Connecting…",
  synced: "Synced",
  saving: "Saving…",
  offline: "Offline",
  error: "Sync error",
};

let gate: HTMLElement | null = null;
let bar: HTMLElement | null = null;
let toastEl: HTMLElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

let currentUser: User | null = null;
let localMode = false;
let syncing = false;
let status: SyncStatus = "local";
let syncHandlers: SyncHandlers | null = null;

function ensureGate() {
  if (gate) return gate;
  gate = document.createElement("div");
  gate.id = "authGate";
  gate.className = "auth-gate";
  gate.hidden = true;
  gate.innerHTML = `
    <div class="auth-card" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-mark">Aspio</div>
      <h2 id="authTitle">QA Checklist</h2>
      <p class="auth-copy">Sign in with your Aspio Google account to keep the checklist in sync with your team.</p>
      <button type="button" class="auth-btn" id="authGoogle">
        <span class="gdot" aria-hidden="true">G</span> Sign in with Google
      </button>
      <p class="auth-error" id="authError" hidden></p>
      <button type="button" class="auth-link" id="authLocal">Continue without sync</button>
      <p class="auth-foot">Restricted to <b>@${ALLOWED_DOMAIN}</b> accounts. Screenshots stay on this device.</p>
    </div>`;
  document.body.appendChild(gate);

  gate.querySelector<HTMLButtonElement>("#authGoogle")?.addEventListener("click", () => {
    void googleSignIn();
  });
  gate.querySelector<HTMLButtonElement>("#authLocal")?.addEventListener("click", () => {
    stopSync();
    syncing = false;
    localMode = true;
    hideGate();
    status = "local";
    renderBar();
    toast("Local-only mode. Changes stay in this browser.");
  });
  return gate;
}

function showGate() {
  ensureGate();
  gate!.hidden = false;
  document.documentElement.classList.add("auth-locked");
}

function hideGate() {
  if (gate) gate.hidden = true;
  document.documentElement.classList.remove("auth-locked");
}

function showAuthError(message: string) {
  ensureGate();
  const el = gate!.querySelector<HTMLElement>("#authError");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function friendlyAuthError(err: any): string {
  const code = String(err?.code || "");
  if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
    return "Firebase Authentication is not enabled for this project yet. Enable Google sign-in in the Firebase console, then try again.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Authentication → Settings → Authorized domains.";
  }
  if (code === "auth/popup-blocked") {
    return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
  }
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "Sign-in was cancelled.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }
  return err?.message || "Sign-in failed. Please try again.";
}

async function googleSignIn() {
  const fb = getFirebase();
  if (!fb) {
    showAuthError("Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.");
    return;
  }
  // Already signed in but syncing failed earlier: retry with the same account
  // instead of opening a popup that would not change the auth state.
  if (currentUser) {
    localMode = false;
    await activateUser(currentUser);
    return;
  }
  const btn = gate?.querySelector<HTMLButtonElement>("#authGoogle");
  const err = gate?.querySelector<HTMLElement>("#authError");
  if (btn) btn.disabled = true;
  if (err) err.hidden = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(fb.auth, provider);
  } catch (e) {
    showAuthError(friendlyAuthError(e));
  } finally {
    if (btn) btn.disabled = false;
  }
}

function ensureBar() {
  if (bar) return bar;
  bar = document.createElement("div");
  bar.id = "accountBar";
  bar.className = "account-bar";
  bar.hidden = true;
  document.body.appendChild(bar);
  bar.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-account-action]")) return;
    if (!localMode && currentUser) {
      void signOut(getFirebase()!.auth);
      return;
    }
    localMode = false;
    if (currentUser) void activateUser(currentUser);
    else showGate();
  });
  return bar;
}

function renderBar() {
  const el = ensureBar();
  if (!firebaseEnabled) {
    el.hidden = false;
    el.dataset.status = "local";
    el.innerHTML = `<span class="dot"></span><span class="who">Local only</span>`;
    return;
  }
  if (localMode) {
    el.hidden = false;
    el.dataset.status = "local";
    el.innerHTML = `<span class="dot"></span><span class="who">Local only</span><button type="button" class="account-btn" data-account-action>Sign in</button>`;
    return;
  }
  if (!currentUser) {
    el.hidden = true;
    return;
  }
  const email = currentUser.email || "";
  const name = email.split("@")[0] || email;
  el.hidden = false;
  el.dataset.status = status;
  el.innerHTML = `
    <span class="dot" title="${escapeAttr(STATUS_LABEL[status])}"></span>
    <span class="who" title="${escapeAttr(email)}">${escapeHtml(name)}</span>
    <span class="state">${escapeHtml(STATUS_LABEL[status])}</span>
    <button type="button" class="account-btn" data-account-action>Sign out</button>`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

function escapeAttr(s: string) {
  return escapeHtml(s);
}

function toast(message: string) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "sync-toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl?.classList.remove("show");
  }, 4500);
}

async function activateUser(user: User) {
  const email = (user.email || "").toLowerCase();
  if (!email.endsWith("@" + ALLOWED_DOMAIN) && email !== "meronsolomondana@gmail.com") {
    await signOut(getFirebase()!.auth);
    showGate();
    showAuthError(`This checklist is restricted to @${ALLOWED_DOMAIN} accounts.`);
    return;
  }
  hideGate();
  if (syncing && currentUser?.uid === user.uid) return;
  stopSync();
  syncing = true;
  currentUser = user;
  status = "connecting";
  renderBar();
  try {
    await startSync(syncHandlers!, user);
    // Load MCP panel for the admin account after sync is established.
    if (isMcpAdmin(user)) void initMcp(user);
  } catch (e: any) {
    console.warn("[auth] sync failed to start", e);
    stopSync();
    syncing = false;
    currentUser = user;
    status = "error";
    renderBar();
    showGate();
    showAuthError(
      "Could not open the shared checklist. Check your connection and Firestore rules, then try again."
    );
  }
}

export async function initBackend(handlers: SyncHandlers) {
  syncHandlers = {
    ...handlers,
    onStatus: (s) => {
      status = s;
      renderBar();
      handlers.onStatus(s);
    },
    onNotice: (message) => {
      toast(message);
      handlers.onNotice(message);
    },
  };

  ensureBar();
  ensureGate();
  renderBar();

  if (!firebaseEnabled) {
    if (firebaseDisabled || !firebaseConfigured) {
      console.info(
        "[backend] Firebase is not configured. Running in local-only mode; data stays in this browser."
      );
    }
    return;
  }

  const fb = getFirebase();
  if (!fb) {
    showGate();
    showAuthError("Firebase could not be initialised. Check the VITE_FIREBASE_* values in .env.local.");
    return;
  }

  showGate();

  onAuthStateChanged(fb.auth, (user) => {
    if (localMode) {
      currentUser = user;
      renderBar();
      return;
    }
    if (!user) {
      currentUser = null;
      syncing = false;
      stopSync();
      teardownMcp();
      status = "local";
      renderBar();
      showGate();
      return;
    }
    void activateUser(user);
  });

  window.addEventListener("beforeunload", () => flushPending());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPending();
  });
}
