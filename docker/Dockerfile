# ==============================================================================
# Multi-stage Dockerfile for Sentinel backend services (api, webhooks, reactor, watcher)
# ==============================================================================

# --- Base ---
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps

# Copy workspace config (including .npmrc for pnpm hoist settings)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./

# Copy all package.json files to leverage Docker cache
COPY packages/common/package.json packages/common/
COPY packages/domain/package.json packages/domain/
COPY packages/application/package.json packages/application/
COPY packages/infrastructure/package.json packages/infrastructure/
COPY apps/api/package.json apps/api/
COPY apps/webhooks/package.json apps/webhooks/
COPY apps/reactor/package.json apps/reactor/
COPY apps/watcher/package.json apps/watcher/

RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# Clean up source files but keep prisma schemas (needed for migrations) and generated
RUN cp -r packages/infrastructure/src/prisma /tmp/prisma-backup \
    && rm -rf packages/*/src apps/*/src .turbo **/tsconfig* **/*.tsbuildinfo \
    && mkdir -p packages/infrastructure/src \
    && mv /tmp/prisma-backup packages/infrastructure/src/prisma

# APP is set via docker-compose (api, webhooks, reactor, watcher)
ARG APP
ENV APP=${APP}

CMD node apps/${APP}/dist/index.js
