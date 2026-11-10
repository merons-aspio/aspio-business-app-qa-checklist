# aspio-business-app-qa-checklist

Aspio Business App QA Checklist.

Open `index.html` in a browser. Results, notes and screenshots are stored locally.

## Staging release page

The **Staging release** tab contains the release checklist for `main...origin/staging`:

- 22 Critical cases, 24 Medium cases, 25 core smoke cases and 5 cross-cutting cases.
- Search, module, priority and status filters.
- Staging URL, build, tester, date, decision and notes fields.
- Test data, execution order, sign-off checklist and known limitations.

### Export behavior

The export dialog can include the Staging release page. When exporting from that page:

- **Failed** exports only failed cases.
- **Checked only** exports cases with a status, a ticked step, a note or a screenshot.
- **All tests** plus **Only include cases I've worked on** exports only worked-on cases; turn that option off to export every case.
- The page's search, module and priority filters are applied when **Also apply my current staging search, module and priority filters** is checked.

CSV, PDF and print use the same filtered set.
