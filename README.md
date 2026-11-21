# aspio-business-app-qa-checklist

Aspio Business App QA Checklist

## Development

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Fallback (pre-migration)

The original pre-Vite files are preserved in `backup-pre-migration/`:

- `backup-pre-migration/index.html`
- `backup-pre-migration/style.css`
- `backup-pre-migration/app.js`

To roll back, copy those three files over `index.html`, `css/style.css`, and `js/app.js` (the originals in `css/` and `js/` are still untouched).
