#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting local PostgreSQL database container (infra/database/docker-compose.dev.yml)...${NC}"
docker compose -f infra/database/docker-compose.dev.yml up -d

echo -e "${BLUE}⏳ Waiting for PostgreSQL to be healthy and ready to accept connections...${NC}"
until docker exec agentrepo-postgres pg_isready -U postgres >/dev/null 2>&1; do
  echo -e "${YELLOW}🕒 Database is starting up... waiting 2s...${NC}"
  sleep 2
done

echo -e "${GREEN}✅ Database is ready!${NC}"

echo -e "${BLUE}📦 Generating Prisma client...${NC}"
pnpm db:generate || npx prisma generate

echo -e "${BLUE}🔄 Running database migrations...${NC}"
pnpm db:migrate || npx prisma migrate dev

echo -e "${GREEN}✨ Local database environment is fully set up and ready!${NC}"
