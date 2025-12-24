# Frontend Starter

A ready-to-code boilerplate with sensible defaults:

- Vite + React + TypeScript
- Tailwind (with a dark-mode palette + cyan accent)
- ESLint + Prettier
- React Router (SPA routing)
- Cloudflare Worker API under `/api` (plus optional D1)

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Full Stack Dev (Vite + Worker)

```bash
npm run dev:full
```

- Frontend: `http://localhost:3000`
- Worker: `http://localhost:8787`
- Vite proxies `/api/*` to the local Worker
- The SPA “API Demo” page lives at `/api-demo` (Worker endpoints are under `/api/*`)

## Theme

- Toggle cycles: System → Light → Dark
- Preference stored in `localStorage` under `theme`

## Worker API

- `GET /api/health` → `{ ok: true, now: string }`
- `POST /api/echo` → echoes JSON body
- `GET /api/todos` / `POST /api/todos` (optional, requires D1)

## Optional: D1 Setup (`/api/todos`)

1. Uncomment the `[[d1_databases]]` block in `wrangler.toml` and `wrangler.dev.toml`.
2. Create a database:

   ```bash
   npx wrangler d1 create app-db
   ```

3. Run migrations:

   ```bash
   npx wrangler d1 execute app-db --local --file=migrations/0001_schema.sql
   ```

## Deploy (Cloudflare)

```bash
npm run deploy:cf
```

## Configuration

- Copy `.dev.vars.example` to `.dev.vars` for local Worker secrets.
- Update `wrangler.toml` with your project name and bindings.

## Commands

| Command                           | Description                 |
| --------------------------------- | --------------------------- |
| `npm run dev`                     | Vite dev server             |
| `npm run dev:worker`              | Worker dev server           |
| `npm run dev:full`                | Run Worker + Vite together  |
| `npm run build`                   | Production build to `dist/` |
| `npm run preview`                 | Preview `dist/` locally     |
| `npm run deploy:cf`               | Deploy to Cloudflare        |
| `npm run typecheck`               | TypeScript typecheck        |
| `npm run lint` / `lint:fix`       | ESLint                      |
| `npm run format` / `format:check` | Prettier                    |

## Contributing

- Keep changes small and focused.
- Run `npm run lint` and `npm run format:check` before opening a PR.
- Update docs if behavior or commands change.

## License

MIT
