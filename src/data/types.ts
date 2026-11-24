/** Shapes for the static checklist data and the data kept in browser storage. */

/** A row from the embedded raw checklist JSON (`DATA.critical`). */
export type RawCriticalCase = [string, string, string, string, string];

/** A row from the embedded raw checklist JSON (`DATA.cases`). */
export interface RawCase {
  id: string;
  module: string;
  check: string;
  steps: string;
  expected: string;
  priority: string;
  status?: string;
}

export interface RawData {
  cases: RawCase[];
  critical: RawCriticalCase[];
}

/** Normalised checklist entry used by every renderer and export. */
export interface ChecklistItem {
  id: string;
  module: string;
  check: string;
  steps: string;
  expected: string;
  priority: string;
  /** 0 = release sign-off, 1 = basic functionality, 2 = business workflows. */
  grp?: number;
  status?: string;
}

/** Per-test state persisted in localStorage. */
export interface TestState {
  status: string;
  notes: string;
  done: number[];
  imgs?: string[];
  updatedBy?: string;
}

/** "Other bugs" entry (not part of the static checklist). */
export interface ExtraBug {
  id: string;
  title: string;
  sev: string;
  area: string;
  steps: string;
  exp: string;
  act: string;
  link: string;
  imgs: string[];
}

/** New-feature issue entry. */
export interface FeatureIssue {
  id: string;
  title: string;
  details: string;
  sev: string;
  link: string;
  labels: string[];
  imgs: string[];
}
