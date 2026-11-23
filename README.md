# aspio-business-app-qa-checklist

Aspio Business App QA Checklist — a Vite + TypeScript + Tailwind app with an
optional Firebase backend for shared, real-time team sync.

The checklist works fully offline/local-only. When Firebase is configured and a
user signs in with an `@aspio.se` Google account, tests, notes, logged bugs,
new-feature issues, labels and sign-off fields are shared through Firestore.
Screenshots stay in this browser's IndexedDB and are never uploaded.

## Development

```bash
npm install
npm run dev       # start the Vite dev server
npm run typecheck # TypeScript only
npm run build     # DOM check + app/API type-check + production build to dist/
npm run preview   # serve the production build
npm run verify    # DOM check + app and API type-checks (good CI/pre-push gate)
```

`npm run build` also runs `scripts/check-dom.mjs`, which fails if `index.html`
has duplicate IDs or if `src/` references an element ID that does not exist.
That turns startup crashes such as `$(...).onchange` on a missing element into
a build error instead of a blank production page.

> Firebase SDK 11 is pinned on purpose: newer SDKs require Node 24, while this
> project targets Node 22.

## Firebase setup

The project is already wired for Firebase project `qa-checklist-f4f61`
(`.firebaserc`, `firebase.json`, `firestore.rules`). Complete these console
steps once:

1. Open the [Firebase console](https://console.firebase.google.com/project/qa-checklist-f4f61/overview).
2. **Firestore Database** → *Create database* → start in **production mode**
   and pick a region close to the team.
3. **Authentication** → *Get started* → **Sign-in method** → enable **Google**
   and choose a support email.
4. **Authentication** → *Settings* → **Authorized domains**. `localhost` is
   added by default. Add the production domains you will use, e.g.
   `qa-checklist-f4f61.web.app`, `qa-checklist-f4f61.firebaseapp.com`, and any
   custom domain.
5. **Project settings** → *Your apps* → Web app → copy the config values into
   `.env.local` (see below).
6. Deploy the security rules:

   ```bash
   npx firebase login
   npm run deploy:rules
   ```

The rules only allow verified Google accounts whose email ends in `@aspio.se`.
The app also enforces the domain client-side and signs out any other account.

### Environment variables

Copy the template and fill in the web app config (or create `.env.local`
manually):

```bash
cp .env.example .env.local
```

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=qa-checklist-f4f61.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qa-checklist-f4f61
VITE_FIREBASE_STORAGE_BUCKET=qa-checklist-f4f61.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_FIREBASE_EMULATORS=false
VITE_FIREBASE_DISABLED=false
```

`.env.local` is gitignored. Never commit real project credentials.

Useful switches:

| Variable | Effect |
| --- | --- |
| `VITE_FIREBASE_DISABLED=true` | Force local-only mode. No sign-in gate, no sync. |
| `VITE_USE_FIREBASE_EMULATORS=true` | Connect to the local Auth/Firestore emulators. Only honored by `npm run dev`; production builds ignore it. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server-only. Service-account JSON for the `/api/mcp` function. Never expose it in the browser. |

If the `VITE_FIREBASE_*` values are missing, the app automatically runs in
local-only mode and shows a "Local only" chip. Existing localStorage data is
untouched.

### Local emulators

```bash
npm run emulators
# in another terminal, with VITE_USE_FIREBASE_EMULATORS=true in .env.local
npm run dev
```

The Auth emulator runs on `127.0.0.1:9099`, Firestore on `127.0.0.1:8080`, and
the emulator UI on `http://127.0.0.1:4000`. The Firestore emulator requires
Java 11+ on the machine. Sign-in uses the emulator's fake Google account
chooser; use an `@aspio.se` email there.

### Deploy

Firebase Hosting:

```bash
npm run deploy   # build + deploy Hosting and Firestore rules
```

Or separately:

```bash
npm run build
npx firebase deploy --only hosting
npm run deploy:rules
```

### Vercel

`vercel.json` builds the static app with `@vercel/static-build` (output `dist/`)
and the hosted MCP endpoint in `api/mcp.ts` with `@vercel/node`. The project
targets Node 22 (`engines.node`), matching Firebase SDK 11.

1. Import the repository into Vercel and keep the repository root as the
   project root. The existing `vercel.json` handles build and routing; no
   dashboard override is needed.
2. Add these **Environment Variables** (Production and Preview) before the
   first deploy:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_USE_FIREBASE_EMULATORS=false`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — full service-account JSON on one line,
     used only by `/api/mcp`
3. `VITE_*` values are inlined at build time, so changing them requires a new
   deployment.
4. In Firebase Console → Authentication → Settings → **Authorized domains**,
   add the Vercel production domain (for example
   `aspio-business-app-qa-checklist.vercel.app`) and any custom domain.
5. Deploy. `firebase-admin` is a runtime dependency because the API function
   imports it; keep it in `dependencies`, not `devDependencies`.
6. Optional: verify locally before pushing with `npm run build`.

The fallback route serves `index.html` for app paths, while `/api/mcp` and
Vite's hashed assets are served directly.

## How sync works

Firestore layout:

```text
qaRuns/current
  tests/{testId}    status, notes, done[], updatedBy, updatedAt
  bugs/{bugId}      title, severity, area, steps, expected, actual, link
  issues/{issueId}  title, details, severity, link, labels[]
  meta/settings     labels[], tester, build, date, decision, pmNotes, featureName
```

- One document per test keeps concurrent edits small and conflict-free at the
  field level.
- On first sign-in, if the shared run does not exist, this browser's existing
  checklist is imported automatically.
- Before any shared data can replace local data, a one-time backup is written to
  `localStorage` under `aspio-qa-pre-sync-backup`.
- The app waits for the first **server** snapshot before treating remote data as
  authoritative, so an empty local Firestore cache cannot wipe local work.
- Screenshots remain in IndexedDB (`aspio-qa-shots` / store `s`). Bug and issue
  records merge the local screenshot IDs back in after each remote update.
- Firestore offline persistence is enabled, so edits made while briefly offline
  are queued and sent when the connection returns.
- The Reset button clears the shared run's tests, bugs and issues for everyone;
  labels and sign-off fields are kept, matching the local reset behavior.

## Fallback and rollback

The original pre-Vite files are preserved in `backup-pre-migration/`:

- `backup-pre-migration/index.html`
- `backup-pre-migration/style.css`
- `backup-pre-migration/app.js`

To roll back to the pre-migration app, copy those three files over
`index.html`, `css/style.css`, and `js/app.js` (the originals in `css/` and
`js/` are still untouched).

For a local-only session without changing files, set
`VITE_FIREBASE_DISABLED=true` in `.env.local` and restart the dev server. The
pre-migration Git branch is `pre-vite-migration`.
