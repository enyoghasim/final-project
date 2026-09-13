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
