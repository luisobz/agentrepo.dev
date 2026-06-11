# ── Stage 1: build ───────────────────────────────────────────────
FROM node:26-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first (layer cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the app + prune for production
RUN pnpm nx run backend-ai:prune

# ── Stage 2: production ─────────────────────────────────────────
FROM node:26-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy pruned output (includes package.json, pnpm-lock.yaml, workspace_modules)
COPY --from=builder /app/apps/backend-ai/dist ./

# Install only production dependencies from the pruned lockfile
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && pnpm install --frozen-lockfile --prod

EXPOSE 4001

CMD ["node", "main.js"]
