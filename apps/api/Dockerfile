# Build from the monorepo root: docker build -f apps/api/Dockerfile .
# (Dokploy: set this as the Dockerfile path, leave the build context/path at the repo root —
# needed so pnpm can see the workspace lockfile and packages/shared.)

FROM node:24-bookworm-slim AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @resume-ai/shared build
RUN pnpm --filter @resume-ai/api build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app
# fontconfig + a real font are required for @resvg/resvg-js to render text
# when generating per-evaluation OG share images — bookworm-slim ships neither.
RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --create-home --uid 1001 --gid nodejs api
COPY --from=builder /app .
RUN chown -R api:nodejs /app
USER api

ENV NODE_ENV=production
EXPOSE 4000
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
