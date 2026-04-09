# ==============================================================================
# Multi-stage Dockerfile for Sentinel backend services (api, webhooks, reactor)
# Usage: docker compose build --build-arg APP=api
# ==============================================================================

# --- Base ---
FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files to leverage Docker cache
COPY packages/common/package.json packages/common/
COPY packages/domain/package.json packages/domain/
COPY packages/application/package.json packages/application/
COPY packages/infrastructure/package.json packages/infrastructure/
COPY apps/api/package.json apps/api/
COPY apps/webhooks/package.json apps/webhooks/
COPY apps/reactor/package.json apps/reactor/

RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

# Remove dev dependencies
RUN CI=true pnpm prune --prod --ignore-scripts

# --- Production ---
FROM node:22-slim AS production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Run as non-root
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Copy built application
COPY --from=build /app /app

# Clean up unnecessary files
RUN rm -rf packages/*/src apps/*/src .turbo **/tsconfig* **/*.tsbuildinfo

USER appuser

# APP is set via docker-compose (api, webhooks, reactor)
ARG APP
ENV APP=${APP}

CMD node apps/${APP}/dist/index.js
