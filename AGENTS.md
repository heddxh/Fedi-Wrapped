# AGENTS.md – Fedi-Wrapped

## Commands
- **Dev (full-stack):** `npm run start:dev` (Vite on :3000, Express on :3001)
- **Dev (frontend only):** `npm run dev`
- **Dev (server only):** `npm run dev:server`
- **Build:** `npm run build` (Vite production build to `dist/`)
- **No test framework configured.**

## Architecture
- **Frontend:** React 18 + TypeScript SPA, Vite bundler, Tailwind CSS. Path alias `@/` → `src/`.
- **Backend:** Express server (`server/index.js`, plain JS) proxying Gemini AI for sentiment analysis. API routes: `POST /api/analyze`, `POST /api/regenerate`.
- **Data flow:** Frontend fetches Mastodon/Fediverse data via `src/services/mastodon.ts`, computes stats in `src/utils/stats.ts`, calls backend `/api/analyze` for AI vibe analysis.
- **Key dirs:** `src/components/` (UI), `src/pages/` (LoginPage, LoadingPage), `src/services/` (API clients, export parser), `src/types/` (shared interfaces), `src/utils/` (stats, helpers), `src/constants/`.

## Code Style
- TypeScript (frontend), plain ESM JS (server). `"type": "module"` in package.json.
- Functional React components with hooks. State managed via `useState`/`useRef` in App.tsx.
- Imports: use `@/` alias for src paths. Barrel exports via `index.ts` files.
- UI: Tailwind utility classes inline, lucide-react icons, recharts for charts, html-to-image for export.
- Chinese (zh-CN) UI strings hardcoded in components.
- Types defined in `src/types/index.ts` — key interfaces: `Account`, `Status`, `YearStats`, `WrappedData`.
- Error handling: try/catch with user-facing Chinese error messages; `console.error` for logging.
