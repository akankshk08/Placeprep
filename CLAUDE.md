# Project rules: PlacePrep (React + Vite static site on GitHub Pages)

The owner is not a programmer: security and quality are on by default.

## How the site works
- Static React app, no backend. Deployed by `.github/workflows/static.yml` on push to `main`.
- AI features call Google Gemini directly from the browser with the **user's own key**, stored in `localStorage` (`gemini_api_key`). All Gemini calls go through `src/api/gemini.js`.
- User data (tracker, bookmarks, cached sections) lives only in `localStorage`.

## Security (never break)
- Never put a real API key in the code, in `.env` committed to git, or in `VITE_*` variables in CI. `VITE_*` values are public in the built site.
- Never render HTML from AI output or user input (`dangerouslySetInnerHTML`, `innerHTML`). Render as text.
- Every link whose URL comes from AI output or user data must go through `safeUrl()` in `src/lib/safeUrl.js`.
- The Content Security Policy is in `vite.config.js`. If you add a new outside host (API, CDN, iframe), add it there deliberately; don't loosen it with `*` or `'unsafe-eval'`.
- Don't load scripts from CDNs; bundle them with npm.
- Read `localStorage` with try/catch; corrupted data must not crash the app.
- New npm package? Confirm it is real and widely used, and explain why first.

## Code
- Smallest change that solves the task; touch only needed files.
- Aim for files under ~300 lines; reuse helpers in `src/lib/` and `src/api/`.
- Every AI fetch shows loading, error and empty states.
- After changes run `npm run build` and `npm audit --omit=dev`, and report real results.
