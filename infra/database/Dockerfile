# Etapa 1: construir dependencias
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar manifiestos necesarios
COPY package.json pnpm-lock.yaml* ./
COPY packages/database/package.json ./packages/database/package.json
COPY packages/database ./packages/database/
COPY packages/config ./packages/config/
COPY tsconfig.base.json ./

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --filter @agentrepo/database --frozen-lockfile --prod

# Etapa final: imagen ligera con prisma y migraciones
FROM node:20-alpine
WORKDIR /app

# Copiar node_modules desde el builder
COPY --from=builder /app/node_modules ./node_modules
# Copiar los archivos necesarios para ejecutar migraciones
COPY packages/database/prisma ./prisma
COPY packages/database/package.json ./package.json
COPY infra/database/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
