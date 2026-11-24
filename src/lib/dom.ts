/** Small DOM and formatting helpers shared by the app modules. */

export const esc = (s: unknown): string =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

/** Typed-loose querySelector: returns `any` so existing call sites stay unchanged. */
export const $ = (s: string): any => document.querySelector<any>(s);

/** Split a numbered steps string ("1. Do x 2. Do y") into individual steps. */
export const stepsOf = (s: unknown): string[] =>
  String(s || "")
    .split(/(?:^|\s)\d+\.\s+/)
    .map((x) => x.trim().replace(/\.$/, ""))
    .filter(Boolean);

/** Stable colour hue (0-359) for a label string. */
export const hue = (s: unknown): number => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
