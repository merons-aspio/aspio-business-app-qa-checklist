# aspio-business-app-qa-checklist

Aspio Business App QA Checklist.

Open `index.html` in a browser. Results, notes, findings and screenshots are stored locally in this browser.

## Findings & bugs

Every page (Main checklist, New features, Last week's changes, Develop branch and Staging release) has its own **Findings & bugs** section. Use **+ Add finding / bug** in the header or the section button to log:

- Page/context, title, severity and module/area
- Steps to reproduce, expected result and actual result
- Labels and screenshots (paste or upload)
- Evidence link or ticket ID

Findings can be edited or deleted from the page they belong to. The old main-page "Other bugs" log and New features "Issues & notes log" are migrated automatically into the unified findings store on first load.

## Export behavior

The export dialog has independent page and status checkboxes:

- **Pages**: Main checklist, New features, Last week's changes, Develop branch, Staging release and Logged findings & bugs.
- **Statuses**: Passed, Failed, Blocked, N/A and Not tested, plus All/None, Failed only, Failed + Blocked and Passed only presets.
- **Only include cases I've worked on** limits checklist cases to ones with a status, ticked step, note or screenshot.
- **Apply current page's search, module and priority filters** applies the current page's filters to that page.
- **Only findings with label** filters the findings log.

Status filters apply to checklist cases only; findings are included whenever **Logged findings & bugs** is checked. Exports default to the page you opened them from, so main and staging exports stay isolated unless you select another page explicitly. CSV, PDF and print use the same final set.

## Staging release page

The **Staging release** tab contains the release checklist for `main...origin/staging`:

- 22 Critical cases, 24 Medium cases, 25 core smoke cases and 5 cross-cutting cases.
- Search, module, priority and status filters.
- Staging URL, build, tester, date, decision and notes fields.
- Test data, execution order, sign-off checklist and known limitations.

When exporting from the Staging release page, Failed + Blocked is preselected if any staging case is failed or blocked. The page's search, module and priority filters are applied when **Apply current page's search, module and priority filters** is checked.
