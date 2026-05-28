# Database seeds

Ubicación de seeds y cómo usarlas.

- El runner principal es `prisma/seeds/index.ts`. Detecta `NODE_ENV` y delega a la seed correspondiente.
- La seed de desarrollo está en `prisma/seeds/dev.seed.ts` y contiene datos mínimos pensados solo para uso local.
- `packages/database/package.json` define la seed para Prisma: `ts-node prisma/seeds/index.ts`.

Uso local (desarrollo):

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed      # ejecuta prisma db seed -> ts-node prisma/seeds/index.ts
```

Uso en contenedor (migraciones + seeds):

```bash
docker build -t agentrepo-db-migrations -f infra/database/Dockerfile .
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=prod \
  -e EXECUTE_SEED=true \
  agentrepo-db-migrations
```

Notas sobre producción:

- Aquí no incluimos ninguna seed de producción (por seguridad). Las seeds para `pre`/`prod` suelen contener datos sensibles o transformaciones irreversibles y deben mantenerse en un repositorio privado o dentro del pipeline CI (accedidas mediante secretos).
- Para ejecutar una seed de producción deberías:
  - Mantener el script de seed en un repositorio privado o como paso del pipeline CI.
  - Pasar `DATABASE_URL` (preferiblemente la connection string directa de Supabase para migraciones) y configurar `EXECUTE_SEED=true` en el job seguro.
  - Evitar commitear credentials o datos sensibles en este repositorio público.

Si quieres, puedo añadir una plantilla de CI (GitHub Actions) que construya la imagen de migraciones y la ejecute contra Supabase usando secretos del repositorio.
