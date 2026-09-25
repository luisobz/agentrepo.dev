# Deploy — Spaceship (cPanel + Passenger)

Guía del pipeline de despliegue (`.github/workflows/deploy.yml`) y de la
configuración necesaria en el hosting.

## Modelo de hosting

- Todo lo que cuelga del docroot `agentrepo.dev/` del hosting es **público**.
- El código de las apps Node vive **fuera** del docroot, bajo
  `~/backend/agentrepo.dev/<app>/`.
- Cada app se da de alta en cPanel → **Setup Node.js App** indicando:
  - *Application root*: la carpeta del código (p. ej. `backend/agentrepo.dev/web`).
  - *Application URL*: la ruta pública que Passenger enruta hacia la app.
  - *Application startup file*: ver tabla.
  - Variables de entorno de la app.
- Passenger reinicia la app cuando cambia `tmp/restart.txt` (el pipeline lo toca al final de cada deploy).

## Apps y arranque

| App | Application root (default) | Startup file | URL pública sugerida |
|---|---|---|---|
| `web` (Next.js) | `backend/agentrepo.dev/web` | `apps/web/server.js` | `agentrepo.dev/` |
| `admin` (Next.js) | `backend/agentrepo.dev/admin` | `apps/admin/server.js` | `agentrepo.dev/admin` (o subdominio) |
| `backend-web` (NestJS + tRPC) | `backend/agentrepo.dev/backend-web` | `src/main.js` | `agentrepo.dev/web/api/v1` |
| `backend-ai` (NestJS interno) | `backend/agentrepo.dev/backend-ai` | `src/main.js` | ruta no pública / oculta |

Notas importantes:

- **NO uses "Run NPM Install" en cPanel.** Los bundles que sube el pipeline son
  **autocontenidos**: incluyen `node_modules` completo y el cliente Prisma ya
  generado (compilador WASM, independiente de plataforma). Ejecutar npm install
  en el servidor convertiría `node_modules` en un symlink del virtualenv de
  CloudLinux y rompería el bundle.
- Passenger intercepta el `listen()` de Node, así que el puerto interno que
  configuran `WEB_PORT`/`BACKEND_WEB_PORT`/… es irrelevante en producción.
- El frontend compone la URL de tRPC como `NEXT_PUBLIC_API_URL + /api/trpc`.
  `NEXT_PUBLIC_API_URL` debe ser la base pública donde respondas `backend-web`
  (p. ej. `https://agentrepo.dev/web/api/v1`). Esta variable se **inyecta en
  build** (variable de Actions, no del hosting).
- `backend-web` habla con `backend-ai` por HTTP local (`BACKEND_AI_SERVICE_URL`,
  normalmente `http://127.0.0.1:<puerto interno>` o la URL oculta), protegido
  con `INTERNAL_COMMUNICATION_API_SECRET`.

## Configuración en GitHub (Settings → Secrets and variables → Actions)

### Secrets

| Secret | Uso |
|---|---|
| `SSH_HOST` | Host SSH del hosting |
| `SSH_USER` | Usuario SSH |
| `SSH_KEY` | Clave privada (formato OpenSSH) |
| `SSH_KNOWN_HOSTS` | Clave pública del host SSH en formato `known_hosts`, verificada contra la huella del proveedor. Incluye el puerto si no es 22. |
| `DATABASE_URL` | Postgres de producción (Supabase). Obligatorio para migrar y desplegar los backends. |

### Variables

| Variable | Default | Uso |
|---|---|---|
| `SSH_PORT` | `22` | Puerto SSH |
| `NODE_VERSION` | `24` | Node en CI |
| `NEXT_PUBLIC_API_URL` | `https://agentrepo.dev/web/api/v1` | Base pública de backend-web (build de web y admin) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | Supabase (build de web) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | Supabase (build de web) |
| `NEXT_PUBLIC_SENTRY_DSN` | — | Sentry del navegador (build de web y admin) |
| `WEB_PATH` | `backend/agentrepo.dev/web` | Destino rsync (relativo al home SSH) |
| `ADMIN_PATH` | `backend/agentrepo.dev/admin` | Destino rsync |
| `BACKEND_WEB_PATH` | `backend/agentrepo.dev/backend-web` | Destino rsync |
| `BACKEND_AI_PATH` | `backend/agentrepo.dev/backend-ai` | Destino rsync |

## Variables de entorno en el hosting (por app)

Configúralas en cPanel → Setup Node.js App → Environment variables.
`NODE_ENV=production` en todas. `SENTRY_DSN` (opcional) activa Sentry en
cualquiera de las cuatro apps; sin él, la telemetría queda desactivada.

- **web**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SECRET_KEY` (las `NEXT_PUBLIC_*` de runtime sólo afectan al
  servidor; las del cliente quedan fijadas en build).
- **admin**: `AUTH_SECRET` (≥ 32 chars aleatorios), `NEXT_PUBLIC_API_URL`.
- **backend-web**: `DATABASE_URL`, `AUTH_SECRET` (el mismo que admin),
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `WEB_APP_URL`, `ADMIN_APP_URL` (orígenes HTTPS exactos para CORS),
  `BACKEND_AI_SERVICE_URL`, `INTERNAL_COMMUNICATION_API_SECRET`. El login del panel admin valida
  email+contraseña contra Supabase Auth (ya no hay `ADMIN_PASSWORD`); el
  usuario admin se aprovisiona con la seed de producción cifrada
  (`SEED_ENCRYPTION_KEY`, ver `packages/database/README.md`).
- **backend-ai**: `DATABASE_URL`, `INTERNAL_COMMUNICATION_API_SECRET`, `DEEPSEEK_API_KEY`,
  `DEEPSEEK_MODEL`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`,
  `LANGFUSE_BASE_URL`, `SPACEMAIL_HOST`, `SPACEMAIL_PORT`, `SPACEMAIL_USER`,
  `SPACEMAIL_PASS`, `R2_*` (si se usa almacenamiento de PDFs).

Las claves de Supabase son las nuevas API keys (`sb_publishable_...` /
`sb_secret_...`); las legacy JWT (`anon` / `service_role`) deben desactivarse
en el dashboard una vez migrado.

El `DATABASE_URL` de producción verifica TLS contra el certificado del
proyecto Supabase (`sslmode=verify-full&sslrootcert=<path>`); el path del
`sslrootcert` debe existir en la máquina que ejecuta el comando (en el
hosting: `/home/lyqyxfejgb/cert/agentrepo.dev/supabase-agentrepo.crt`; el
secret `DATABASE_URL` de CI para `migrate` debe usar un path válido en el
runner o `sslmode=require`).

Los backends cargan un `.env` local si existe en su *Application root*; el
pipeline nunca sobreescribe ese fichero (`--exclude '.env'`), así que también
puedes gestionar las variables ahí por SSH.

## Cómo se dispara

- **Tag `vX.Y.Z`** → despliega todo (migraciones + 4 apps).
- **Actions → Deploy (tag) → Run workflow** → eliges qué desplegar
  (`all`, `web`, `admin`, `backend-web`, `backend-ai`, `migrate`).

Orden: `migrate` corre primero; las apps sólo se despliegan si las migraciones
terminaron bien. Si falta el secret `DATABASE_URL`, el despliegue completo
falla antes de subir las apps. Un despliegue selectivo de `web` o `admin`
no ejecuta migraciones.

## Qué sube exactamente el pipeline

- **web/admin**: salida `standalone` de Next.js (server.js + `node_modules`
  mínimo trazado) + `.next/static` + `public`.
- **backend-web/backend-ai**: `nx run <app>:prune` genera `dist/` con
  `package.json` podado, `pnpm-lock.yaml` y `workspace_modules/` (los paquetes
  `@agentrepo/*` compilados); el pipeline instala dentro las dependencias de
  producción y genera el cliente Prisma. El *startup file* queda en
  `src/main.js`.
- `rsync --delete` con exclusiones de `.env`, `tmp/` y logs: lo que no está en
  el bundle se elimina del servidor, salvo esas rutas.

## Primer despliegue (checklist)

1. Crea las 4 apps Node en cPanel con los *Application root* de la tabla
   (las carpetas se crean solas si no existen; también las crea el rsync).
2. Configura las variables de entorno de cada app en cPanel.
3. Añade los secrets/variables en GitHub.
   Verifica la huella SSH con el proveedor antes de copiarla a `SSH_KNOWN_HOSTS`;
   no confíes sólo en la salida de `ssh-keyscan`.
4. Lanza el workflow a mano (`only: all`) o publica un tag `v0.1.0`.
5. Aprovisiona el usuario administrador con la seed de producción
   (`packages/database/README.md`): prepara el archivo cifrado
   `prod.seed.data.enc`, `SEED_ENCRYPTION_KEY`, las credenciales de Supabase
   y ejecuta `NODE_ENV=production pnpm db:seed` contra la BD de producción.
   El pipeline sólo ejecuta migraciones; no crea usuarios.
6. Comprueba `https://agentrepo.dev/web/api/v1/api/health`, la home,
   el login del panel y una llamada de backend a backend.
