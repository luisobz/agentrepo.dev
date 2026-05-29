# ── Stage 1: build ───────────────────────────────────────────────
FROM node:26-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first (layer cache)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the Next.js app
RUN pnpm nx run web:build

# ── Stage 2: production ─────────────────────────────────────────
FROM node:26-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy the Next.js standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
