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
RUN pnpm nx run admin:build

# ── Stage 2: production ─────────────────────────────────────────
FROM node:26-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy the Next.js standalone output
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3001

CMD ["node", "apps/admin/server.js"]
