# Repository Guidelines

## Project Structure

- `App.tsx`, `index.tsx`, `types.ts`: SPA entry points and shared types.
- `components/`: React UI components (PascalCase filenames, e.g., `Button.tsx`).
- `hooks/`: Reusable React hooks (`useSomething.ts`).
- `services/`: Client-side API wrappers and provider integrations.
- `lib/`: Core utilities (markdown, storage, parsing).
- `worker/`: Cloudflare Worker backend (routes, D1 access, AI proxying).
- `migrations/`: D1 SQL schema and migrations.
- `public/`: Static assets served by Vite/Workers.

## Build, Test, and Development Commands

- `npm install`: Install root dependencies.
- `npm run dev`: Vite dev server at `http://localhost:3000`.
- `npm run dev:full`: Runs Worker + Vite for full-stack dev.
- `npm run dev:worker`: Local Cloudflare Worker using `wrangler.dev.toml`.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Serve `dist/` locally for final checks.
- `npm run deploy:cf`: Deploy SPA + Worker to Cloudflare.
- `npm run lint` / `npm run lint:fix`: ESLint checks (and autofix).
- `npm run format` / `npm run format:check`: Prettier formatting.

## Coding Style & Naming

- TypeScript + React (function components, hooks-first).
- Indentation: 2 spaces; no semicolons; max line length ~100 chars.
- Prefer double quotes and trailing commas where valid (see `.prettierrc`).
- Components: PascalCase exports; hooks start with `use`; constants in `SCREAMING_SNAKE_CASE`.
- Avoid `any`; if needed, justify in code review (`@typescript-eslint/no-explicit-any` warns).

## Testing Guidelines

No formal test suite is set up yet. New features should include tests when adding a framework; favor colocated files like `Component.test.tsx` or `*.spec.ts` once established.

## Commit & Pull Request Guidelines

- Use Conventional Commits seen in history: `feat:`, `fix:`, `refactor:`, `chore:` (and scoped variants if helpful).
- PRs should include: clear description, rationale, screenshots/GIFs for UI changes, and any relevant Worker/D1 migration notes.
- Link issues or discussion threads when applicable.

## Security & Configuration

- Local secrets live in `.dev.vars` (copy from `.dev.vars.example`); never commit real keys.
- Cloudflare secrets should be set with `wrangler secret put <NAME>`.
