# Build from the monorepo root: docker build -f apps/web/Dockerfile .
# (Dokploy: set this as the Dockerfile path, leave the build context/path at the repo root —
# needed so pnpm can see the workspace lockfile and packages/shared.)

FROM node:24-bookworm-slim AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @resume-ai/shared build

# VITE_* vars are inlined into the client bundle at build time, so they must be passed
# as a build arg (Dokploy: set this as a "Build Arg" on the app, not just a runtime env var).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm --filter @resume-ai/web build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template

# The API's address as reached FROM THIS CONTAINER, used only to proxy the
# per-evaluation share-link previews (see nginx.conf.template) — not the
# same as VITE_API_BASE_URL, which is the API's address as reached from the
# browser. On Dokploy, override this at runtime with the API app's internal
# address (or its public URL if the two apps aren't on the same network).
ENV API_INTERNAL_URL=http://api:4000

EXPOSE 80
