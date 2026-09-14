# Resume AI

AI-based resume evaluation and skill gap detection. Upload a resume (PDF/DOCX)
and a job description; get a match score, matched/missing skills, and
recommendations, backed by GPT.

## Stack

- pnpm workspaces monorepo, TypeScript throughout
- `apps/web` — React 18 + Vite + Tailwind + React Router + React Query
- `apps/api` — Express + Mongoose (MongoDB) + JWT auth
- `packages/shared` — zod schemas / types shared by web and api

## Getting started

```bash
pnpm install
cp .env.example apps/api/.env
cp .env.example apps/web/.env   # then trim to VITE_API_BASE_URL only
pnpm dev
```

This starts the API on `http://localhost:4000` and the web app on
`http://localhost:5173`.

## Scripts

- `pnpm dev` — run both apps in parallel
- `pnpm build` — build shared package, then both apps
- `pnpm lint` — lint apps and shared package
- `pnpm test` — run all tests
- `pnpm typecheck` — typecheck all workspaces
- `pnpm --filter @resume-ai/api seed -- --email=you@example.com --password=yourpassword [--name="Full Name"]` —
  create (or reset the password of) a user directly in the database. Use this to provision
  accounts while `DISABLE_SIGNUP` is `true`.

## Signups

Public signup is **disabled by default** (`DISABLE_SIGNUP=true`). The web app hides the
"Sign up" link and the API rejects `POST /api/auth/signup` with 403 while it's set. Set
`DISABLE_SIGNUP=false` on the API to allow self-service signup, or use the seed script above
to create accounts manually.

## Deployment (Dokploy)

`apps/api` and `apps/web` each deploy as a separate Dokploy application, built from their own
Dockerfile with the build context set to the repo root (needed so pnpm can see the workspace
lockfile and `packages/shared`):

- **apps/api** — `apps/api/Dockerfile`. Runtime env vars: `PORT`, `MONGODB_URI`, `JWT_SECRET`,
  `JWT_EXPIRES_IN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `CORS_ORIGIN`, `DISABLE_SIGNUP`. After the
  first deploy, run the seed script inside the running container (Dokploy's terminal/exec, or
  `docker exec <container> node dist/scripts/seed.js --email=... --password=...`) to create an
  admin account.
- **apps/web** — `apps/web/Dockerfile`, served by nginx. `VITE_API_BASE_URL` must be set as a
  **build arg** (Vite inlines `VITE_*` vars at build time, not runtime).

`docker-compose.yml` at the repo root is for local development only (spins up MongoDB); Dokploy
provisions its own database service instead of using that file.
