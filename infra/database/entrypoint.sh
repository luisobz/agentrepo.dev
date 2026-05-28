#!/bin/sh
set -e

DB_RESET=${DB_RESET:-false}
EXECUTE_SEED=${EXECUTE_SEED:-true}

echo "DATABASE_URL=$DATABASE_URL"

if [ "$DB_RESET" = "true" ] && { [ "$NODE_ENV" = "dev" ] || [ "$NODE_ENV" = "pre" ]; }; then
  echo "Resetting DB..."
  npx prisma migrate reset --force --schema=./prisma/schema.prisma
  echo "DB reset complete"
fi

echo "Running migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "Migrations complete"

if [ "$EXECUTE_SEED" = "true" ]; then
  case "$NODE_ENV" in
    "dev"|"pre"|"prod")
      echo "Running DB seeds for $NODE_ENV..."
      npx prisma db seed -- --environment "$NODE_ENV" || true
      echo "Seeds complete"
      ;;
    *)
      echo "Unknown NODE_ENV: $NODE_ENV, skipping seeds"
      ;;
  esac
else
  echo "Skipping seeds"
fi

echo "Exiting"
