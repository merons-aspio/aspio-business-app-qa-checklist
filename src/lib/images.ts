/**
 * Screenshot storage: images are shrunk to JPEG and kept in IndexedDB
 * (database `aspio-qa-shots`, object store `s`, keyPath `id`).
 *
 * Storage keys and record shapes are unchanged from the original app.
 */
import { esc } from "./dom";

export const imgCache: Record<string, any> = {};
let idbp: Promise<IDBDatabase> | null = null;

function idb(): Promise<IDBDatabase> {
  if (idbp) return idbp;
  idbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open("aspio-qa-shots", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("s", { keyPath: "id" });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) {
      rej(e);
    }
  });
  return idbp;
}

async function idbTx(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<any> {
  const db = await idb();
  return new Promise((res, rej) => {
    const t = db.transaction("s", mode);
    const r = fn(t.objectStore("s"));
    t.oncomplete = () => res(r && r.result);
    t.onerror = () => rej(t.error);
  });
}

async function imgPut(o: any): Promise<void> {
  imgCache[o.id] = o;
  try {
    await idbTx("readwrite", (s) => s.put(o));
  } catch (e) {}
}

export async function imgGet(id: string): Promise<any> {
  if (imgCache[id]) return imgCache[id];
  try {
    const o = await idbTx("readonly", (s) => s.get(id));
    if (o) imgCache[id] = o;
    return o || null;
  } catch (e) {
    return null;
  }
}

export async function imgDel(id: string): Promise<void> {
  delete imgCache[id];
  try {
    await idbTx("readwrite", (s) => s.delete(id));
  } catch (e) {}
}

function shrink(file: File): Promise<{ url: string; w: number; h: number }> {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file),
      im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1400 / Math.max(im.width, im.height)),
        w = Math.max(1, Math.round(im.width * k)),
        h = Math.max(1, Math.round(im.height * k)),
        c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const x = c.getContext("2d");
      x.fillStyle = "#fff";
      x.fillRect(0, 0, w, h);
      x.drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(u);
      res({ url: c.toDataURL("image/jpeg", 0.82), w, h });
    };
    im.onerror = () => {
      URL.revokeObjectURL(u);
      rej(new Error("not an image"));
    };
    im.src = u;
  });
}

export async function addImgs(files: Iterable<any>): Promise<string[]> {
  const out: string[] = [];
  for (const f of files) {
    if (!f || !f.type.startsWith("image/")) continue;
    try {
      const s = await shrink(f),
        o = { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...s };
      await imgPut(o);
      out.push(o.id);
    } catch (e) {}
  }
  return out;
}

export function pastedImages(e: any): { files: File[]; hasText: boolean } {
  const it = [...(e.clipboardData ? e.clipboardData.items : [])];
  return {
    files: it
      .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
      .map((i) => i.getAsFile())
      .filter(Boolean),
    hasText: it.some((i) => i.type === "text/plain"),
  };
}

export const thumbs = (ids: string[], rm = true): string =>
  ids
    .map(
      (id) =>
        `<figure class="shot"><img alt="Screenshot (click to enlarge)" data-lb="${esc(id)}">${
          rm ? `<button type="button" class="rm" data-rm="${esc(id)}" aria-label="Remove screenshot">✕</button>` : ""
        }</figure>`
    )
    .join("");

export async function fillThumbs(root: ParentNode): Promise<void> {
  for (const im of root.querySelectorAll<any>("img[data-lb]:not([src])")) {
    const o = await imgGet(im.dataset.lb);
    if (o) im.src = o.url;
    else im.closest(".shot").remove();
  }
}

export async function loadAll(R: any[]): Promise<void> {
  for (const x of R) for (const id of x.imgs || []) await imgGet(id);
}
