# admin

Next.js Admin panel for managing Skills, Agents and Blog posts.

## Routes

- `/login` — password login (`ADMIN_PASSWORD` env). Sets an HttpOnly cookie with an HMAC-signed session token (secret: `NEXTAUTH_SECRET`).
- `/admin` — dashboard with content counts. All `/admin/*` routes are protected by `src/middleware.ts` (cookie presence) and the `/admin` layout (signature verification).
- `/admin/skills`, `/admin/agents`, `/admin/blog` — table listings with search, pagination, edit and delete.
- `…/new` and `…/[id]` — create/edit forms. Markdown content uses a Monaco editor; the Agent FileTree uses a Monaco JSON editor validated against `fileTreeSchema` from `@agentrepo/trpc`.

## API access

The browser never talks to the backend directly: `src/app/api/trpc/[trpc]/route.ts` proxies to `${NEXT_PUBLIC_API_URL}/api/trpc`, promoting the session cookie to an `Authorization: Bearer` header that `backend-web` verifies per request. The tRPC client (`components/providers/trpc-provider.tsx`) points at `/api/trpc` and uses the `superjson` transformer (must match the server).

## Env

- `ADMIN_PASSWORD` — login password (required).
- `NEXTAUTH_SECRET` — shared HMAC secret with `backend-web`.
- `NEXT_PUBLIC_API_URL` — backend base URL (default `http://localhost:4000`).
