import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  onSnapshotsInSync,
  runTransaction,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebase } from "./firebase";

export type SyncStatus = "local" | "connecting" | "synced" | "saving" | "offline" | "error";

export interface LocalData {
  saved: Record<string, any>;
  extra: any[];
  fIssues: any[];
  labels: string[];
  meta: Record<string, string>;
}

export interface SyncHandlers {
  getLocalData: () => LocalData;
  applyTests: (tests: Record<string, any>) => void;
  applyTest: (id: string, data: any, removed: boolean) => void;
  applyBugs: (bugs: any[]) => void;
  applyIssues: (issues: any[]) => void;
  applyLabels: (labels: string[]) => void;
  applyMeta: (meta: Record<string, any>) => void;
  onStatus: (status: SyncStatus) => void;
  onNotice: (message: string) => void;
}

const RUN = "current";
const BACKUP_KEY = "aspio-qa-pre-sync-backup";

let db: Firestore | null = null;
let user: User | null = null;
let handlers: SyncHandlers | null = null;
let unsubs: Unsubscribe[] = [];
let timers = new Map<string, { t: ReturnType<typeof setTimeout>; fn: () => void }>();
let netCleanup: Array<() => void> = [];
let pendingWrites = 0;
let stopped = true;
let generation = 0;

const safeId = (id: string) => String(id).replace(/\//g, "__").slice(0, 1400);

const runRef = () => doc(db as Firestore, "qaRuns", RUN);
const testsRef = () => collection(db as Firestore, "qaRuns", RUN, "tests");
const bugsRef = () => collection(db as Firestore, "qaRuns", RUN, "bugs");
const issuesRef = () => collection(db as Firestore, "qaRuns", RUN, "issues");
const metaRef = () => doc(db as Firestore, "qaRuns", RUN, "meta", "settings");

function setStatus(status: SyncStatus) {
  handlers?.onStatus(status);
}

function beginWrite() {
  pendingWrites++;
  setStatus("saving");
}

function endWrite(ok: boolean) {
  pendingWrites = Math.max(0, pendingWrites - 1);
  if (!ok) setStatus("error");
  else if (pendingWrites === 0) setStatus(navigator.onLine ? "synced" : "offline");
}

function write(p: Promise<void>) {
  beginWrite();
  p.then(() => endWrite(true)).catch((err) => {
    console.warn("[sync] write failed", err);
    endWrite(false);
  });
}

function schedule(key: string, delay: number, fn: () => void) {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing.t);
  if (delay <= 0) {
    timers.delete(key);
    fn();
    return;
  }
  const t = setTimeout(() => {
    timers.delete(key);
    fn();
  }, delay);
  timers.set(key, { t, fn });
}

function clearTimers() {
  timers.forEach(({ t }) => clearTimeout(t));
  timers = new Map();
}

function dbReady(): { db: Firestore; user: User } | null {
  if (!db || !user || stopped) return null;
  return { db, user };
}

/* ===== Auth lifecycle ===== */

export async function startSync(
  h: SyncHandlers,
  signedInUser: User
): Promise<() => void> {
  stopSync();
  const gen = ++generation;
  handlers = h;
  user = signedInUser;
  stopped = false;

  const fb = getFirebase();
  if (!fb) {
    setStatus("local");
    stopped = true;
    return stopSync;
  }
  db = fb.db;
  setStatus("connecting");

  try {
    await ensureRunAndImport();
  } catch (err) {
    console.warn("[sync] could not prepare the shared run", err);
    // Do not subscribe after a failed handshake: the first snapshot could be
    // empty and would clear local data that was never imported.
    stopSync();
    throw err;
  }

  if (stopped || gen !== generation) return stopSync;

  let initialTests = false;
  unsubs.push(
    onSnapshot(
      testsRef(),
      (snap) => {
        if (stopped) return;
        if (!initialTests) {
          // The first snapshot can come from the local cache and may be empty
          // or stale. Wait for the server snapshot before treating remote data
          // as authoritative, otherwise local data would be cleared.
          if (snap.metadata.fromCache) {
            setStatus(navigator.onLine ? "connecting" : "offline");
            return;
          }
          initialTests = true;
          const map: Record<string, any> = {};
          snap.forEach((d) => {
            const data = d.data();
            map[data.testId || d.id] = data;
          });
          handlers?.applyTests(map);
          setStatus(pendingWrites ? "saving" : "synced");
          return;
        }
        snap.docChanges().forEach((change) => {
          const data = change.doc.data();
          handlers?.applyTest(data.testId || change.doc.id, data, change.type === "removed");
        });
      },
      (err) => {
        console.warn("[sync] tests listener failed", err);
        setStatus("error");
      }
    )
  );

  let initialBugs = false;
  unsubs.push(
    onSnapshot(
      bugsRef(),
      (snap) => {
        if (stopped) return;
        if (!initialBugs) {
          if (snap.metadata.fromCache) return;
          initialBugs = true;
        }
        handlers?.applyBugs(
          snap.docs.map((d) => ({ ...d.data(), id: d.data().bugId || d.id }))
        );
      },
      (err) => {
        console.warn("[sync] bugs listener failed", err);
        setStatus("error");
      }
    )
  );

  let initialIssues = false;
  unsubs.push(
    onSnapshot(
      issuesRef(),
      (snap) => {
        if (stopped) return;
        if (!initialIssues) {
          if (snap.metadata.fromCache) return;
          initialIssues = true;
        }
        handlers?.applyIssues(
          snap.docs.map((d) => ({ ...d.data(), id: d.data().issueId || d.id }))
        );
      },
      (err) => {
        console.warn("[sync] issues listener failed", err);
        setStatus("error");
      }
    )
  );

  let initialMeta = false;
  unsubs.push(
    onSnapshot(
      metaRef(),
      (snap) => {
        if (stopped || !snap.exists()) return;
        if (!initialMeta) {
          if (snap.metadata.fromCache) return;
          initialMeta = true;
        }
        const data = snap.data();
        if (Array.isArray(data.labels)) handlers?.applyLabels(data.labels);
        handlers?.applyMeta(data);
      },
      (err) => {
        console.warn("[sync] meta listener failed", err);
        setStatus("error");
      }
    )
  );

  unsubs.push(
    onSnapshotsInSync(db, () => {
      if (!stopped && pendingWrites === 0) {
        setStatus(navigator.onLine ? "synced" : "offline");
      }
    })
  );

  const online = () => setStatus(pendingWrites ? "saving" : "synced");
  const offline = () => setStatus("offline");
  window.addEventListener("online", online);
  window.addEventListener("offline", offline);
  netCleanup = [
    () => window.removeEventListener("online", online),
    () => window.removeEventListener("offline", offline),
  ];

  return stopSync;
}

export function stopSync() {
  generation++;
  stopped = true;
  clearTimers();
  netCleanup.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      /* noop */
    }
  });
  netCleanup = [];
  unsubs.forEach((u) => {
    try {
      u();
    } catch (e) {
      /* noop */
    }
  });
  unsubs = [];
  pendingWrites = 0;
  db = null;
  user = null;
  handlers = null;
}

/** Flush debounced writes (used when the tab is hidden or closed). */
export function flushPending() {
  const pending = [...timers.values()];
  timers = new Map();
  pending.forEach(({ t, fn }) => {
    clearTimeout(t);
    fn();
  });
}

/* ===== First-run import ===== */

async function ensureRunAndImport() {
  if (!db || !user) return;
  const ref = runRef();
  const local = handlers?.getLocalData();
  const hasLocal = Boolean(
    local &&
      (Object.keys(local.saved).length || local.extra.length || local.fIssues.length)
  );

  // Keep a one-time copy of this browser's data before the shared workspace
  // can replace it, whether we import it or the remote run already exists.
  if (hasLocal && local) backupLocal(local);

  const claimed = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return false;
    tx.set(ref, {
      name: "Current QA run",
      createdAt: serverTimestamp(),
      createdBy: user?.email || "",
    });
    return true;
  });

  if (claimed) {
    if (hasLocal && local) {
      await importLocal(local);
      handlers?.onNotice("Imported this browser's checklist into the shared workspace.");
    }
  }
}

function backupLocal(local: LocalData) {
  try {
    if (localStorage.getItem(BACKUP_KEY)) return;
    localStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), ...local })
    );
  } catch (e) {
    /* storage full or unavailable */
  }
}

async function importLocal(local: LocalData) {
  if (!db || !user) return;
  let batch = writeBatch(db);
  let count = 0;
  const commit = async () => {
    if (!count) return;
    await batch.commit();
    batch = writeBatch(db as Firestore);
    count = 0;
  };

  for (const [id, st] of Object.entries(local.saved)) {
    batch.set(doc(db, "qaRuns", RUN, "tests", safeId(id)), {
      testId: id,
      status: st.status || "Not tested",
      notes: st.notes || "",
      done: Array.isArray(st.done) ? st.done : [],
      updatedBy: user.email || "",
      updatedAt: serverTimestamp(),
    });
    if (++count >= 400) await commit();
  }

  for (const b of local.extra) {
    batch.set(doc(db, "qaRuns", RUN, "bugs", safeId(b.id)), {
      bugId: b.id,
      title: b.title || "",
      sev: b.sev || "",
      area: b.area || "",
      steps: b.steps || "",
      exp: b.exp || "",
      act: b.act || "",
      link: b.link || "",
      updatedBy: user.email || "",
      updatedAt: serverTimestamp(),
    });
    if (++count >= 400) await commit();
  }

  for (const f of local.fIssues) {
    batch.set(doc(db, "qaRuns", RUN, "issues", safeId(f.id)), {
      issueId: f.id,
      title: f.title || "",
      details: f.details || "",
      sev: f.sev || "",
      link: f.link || "",
      labels: Array.isArray(f.labels) ? f.labels : [],
      updatedBy: user.email || "",
      updatedAt: serverTimestamp(),
    });
    if (++count >= 400) await commit();
  }

  batch.set(
    metaRef(),
    {
      labels: local.labels,
      ...local.meta,
      updatedBy: user.email || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await batch.commit();
}

/* ===== Writes from the app ===== */

export function syncTest(id: string, data: any, changed: string[] = []) {
  const ctx = dbReady();
  if (!ctx) return;
  const relevant = changed.some((k) => k === "status" || k === "notes" || k === "done");
  if (!relevant) return;
  const notesOnly = changed.every((k) => k === "notes");
  schedule(`test:${id}`, notesOnly ? 350 : 0, () => {
    write(
      setDoc(doc(ctx.db, "qaRuns", RUN, "tests", safeId(id)), {
        testId: id,
        status: data.status || "Not tested",
        notes: data.notes || "",
        done: Array.isArray(data.done) ? data.done : [],
        updatedBy: ctx.user.email || "",
        updatedAt: serverTimestamp(),
      })
    );
  });
}

export function syncBug(bug: any) {
  const ctx = dbReady();
  if (!ctx) return;
  write(
    setDoc(doc(ctx.db, "qaRuns", RUN, "bugs", safeId(bug.id)), {
      bugId: bug.id,
      title: bug.title || "",
      sev: bug.sev || "",
      area: bug.area || "",
      steps: bug.steps || "",
      exp: bug.exp || "",
      act: bug.act || "",
      link: bug.link || "",
      updatedBy: ctx.user.email || "",
      updatedAt: serverTimestamp(),
    })
  );
}

export function syncBugDelete(id: string) {
  const ctx = dbReady();
  if (!ctx) return;
  write(deleteDoc(doc(ctx.db, "qaRuns", RUN, "bugs", safeId(id))));
}

export function syncIssue(issue: any) {
  const ctx = dbReady();
  if (!ctx) return;
  write(
    setDoc(doc(ctx.db, "qaRuns", RUN, "issues", safeId(issue.id)), {
      issueId: issue.id,
      title: issue.title || "",
      details: issue.details || "",
      sev: issue.sev || "",
      link: issue.link || "",
      labels: Array.isArray(issue.labels) ? issue.labels : [],
      updatedBy: ctx.user.email || "",
      updatedAt: serverTimestamp(),
    })
  );
}

export function syncIssueDelete(id: string) {
  const ctx = dbReady();
  if (!ctx) return;
  write(deleteDoc(doc(ctx.db, "qaRuns", RUN, "issues", safeId(id))));
}

export function syncLabels(labels: string[]) {
  const ctx = dbReady();
  if (!ctx) return;
  schedule("labels", 400, () => {
    write(
      setDoc(
        metaRef(),
        {
          labels: Array.isArray(labels) ? labels.slice() : [],
          updatedBy: ctx.user.email || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );
  });
}

export function syncMeta(field: string, value: string) {
  const ctx = dbReady();
  if (!ctx) return;
  schedule(`meta:${field}`, 450, () => {
    write(
      setDoc(
        metaRef(),
        {
          [field]: value,
          updatedBy: ctx.user.email || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    );
  });
}

export async function syncReset() {
  const ctx = dbReady();
  if (!ctx) return;
  beginWrite();
  try {
    await Promise.all([
      clearCollection("tests"),
      clearCollection("bugs"),
      clearCollection("issues"),
    ]);
    endWrite(true);
  } catch (err) {
    console.warn("[sync] reset failed", err);
    endWrite(false);
  }
}

async function clearCollection(name: "tests" | "bugs" | "issues") {
  if (!db) return;
  const snap = await getDocs(collection(db, "qaRuns", RUN, name));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

