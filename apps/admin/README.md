# admin

Next.js Admin panel for managing Skills, Agents and Blog posts.

## Routes

- `/login` — email+password login, rate limited; `backend-web` (`adminAuth` tRPC router) verifies the credentials against Supabase Auth, requires the `admin` role in the DB and issues the session. Sets three cookies: a short-lived HttpOnly access token (15 min, HMAC-signed with `AUTH_SECRET`), a long-lived HttpOnly **opaque** refresh token (7 days, stored hashed in the `AdminSession` table) and a JS-readable info cookie with non-sensitive session metadata. Cookie names use the `__Host-` prefix in production.
- `/api/auth/refresh` — rotates the pair against the backend; `src/middleware.ts` detours expired sessions through it transparently. Reusing an already-rotated refresh token (outside a 30s race-grace window) revokes the whole session family; logout revokes it immediately.
- `/admin` — dashboard with content counts. All `/admin/*` routes are protected by `src/middleware.ts` (signature verification at the edge, auto-refresh) and the `/admin` layout (server-side verification).
- `/admin/skills`, `/admin/agents`, `/admin/blog` — table listings with search, pagination, edit and delete.
- `…/new` and `…/[id]` — create/edit forms. Markdown content uses a Monaco editor; the Agent FileTree uses a Monaco JSON editor validated against `fileTreeSchema` from `@agentrepo/trpc`.

## API access

The browser never talks to the backend directly: `src/app/api/trpc/[trpc]/route.ts` proxies to `${NEXT_PUBLIC_API_URL}/api/trpc`, promoting the HttpOnly access cookie to an `Authorization: Bearer` header that `backend-web` verifies per request; an expired access token is re-minted inline from a valid refresh token. The tRPC client (`components/providers/trpc-provider.tsx`) points at `/api/trpc` and uses the `superjson` transformer (must match the server).

## Env

- `AUTH_SECRET` — shared HMAC secret with `backend-web` (verifies access tokens). Login credentials live in Supabase Auth; `backend-web` owns login and session storage. Admin users are provisioned by the seeds (`DEV_ADMIN_PASSWORD` in dev, encrypted `prod.seed.data.enc` in production).
- `NEXT_PUBLIC_API_URL` — backend base URL (default `http://localhost:4000`).
