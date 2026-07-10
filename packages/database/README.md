# Database seeds

Ubicación de seeds y cómo usarlas.

- El runner principal es `src/seeds/index.ts` (ejecutado con `tsx` vía `prisma db seed`, ver `prisma.config.ts`). Detecta `NODE_ENV` y delega a la seed correspondiente.
- `src/seeds/dev.seed.ts` — datos mínimos para uso local: roles, tres usuarios (admin/editor/member), un Skill y un BlogPost de ejemplo. El usuario `admin@agentrepo.dev` se registra también en Supabase Auth (si `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SECRET_KEY` están definidas) con la contraseña `DEV_ADMIN_PASSWORD` (o un default dev-only) para poder entrar al panel admin.
- `src/seeds/prod.seed.ts` — seed de producción. La lógica es pública; los **datos** sensibles viven cifrados en `src/seeds/prod.seed.data.enc` (AES-256-GCM con `SEED_ENCRYPTION_KEY`), de modo que pueden commitearse a este repositorio público.

## Uso local (desarrollo)

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed      # NODE_ENV=development → dev.seed.ts
```

## Seed de producción (datos cifrados)

```bash
# 1. Obtener/editar los datos en claro (fichero gitignored)
pnpm db:seed:decrypt        # o copia prod.seed.data.example.json → prod.seed.data.json

# 2. Recifrar tras editar (esto es lo que se commitea)
pnpm db:seed:encrypt

# 3. Ejecutar contra producción (Supabase)
NODE_ENV=production pnpm db:seed
```

Requiere en el entorno: `SEED_ENCRYPTION_KEY`, `DATABASE_URL` (Supabase, con `sslrootcert`), `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SECRET_KEY`. La seed crea/actualiza cada usuario en Supabase Auth (contraseña incluida) y su fila + rol en la BD.

## Protecciones

- `prod.seed.data.json` (en claro) está en `.gitignore` y el hook pre-commit (`scripts/check-secrets-staged.mjs`) bloquea cualquier intento de commitearlo, igual que certificados (`.crt`, `.key`, `.pem`, …) o un `.enc` sin cifrar de verdad (comprueba la cabecera `AGENTREPO-SEED-ENC-V1`).
- Nunca commitees `SEED_ENCRYPTION_KEY`; vive en `.env` (local) o en los secretos del CI.
