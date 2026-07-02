# admin

Next.js Admin panel for managing Skills, Agents and Blog posts.

## Routes

- `/login` — password login (`ADMIN_PASSWORD` env, timing-safe compare, rate limited). Sets three cookies signed with `AUTH_SECRET`: a short-lived HttpOnly access token (15 min), a long-lived HttpOnly refresh token (7 days) and a JS-readable info cookie with non-sensitive session metadata. Cookie names use the `__Host-` prefix in production.
- `/api/auth/refresh` — rotates the access + refresh pair; `src/middleware.ts` detours expired sessions through it transparently.
- `/admin` — dashboard with content counts. All `/admin/*` routes are protected by `src/middleware.ts` (signature verification at the edge, auto-refresh) and the `/admin` layout (server-side verification).
- `/admin/skills`, `/admin/agents`, `/admin/blog` — table listings with search, pagination, edit and delete.
- `…/new` and `…/[id]` — create/edit forms. Markdown content uses a Monaco editor; the Agent FileTree uses a Monaco JSON editor validated against `fileTreeSchema` from `@agentrepo/trpc`.

## API access

The browser never talks to the backend directly: `src/app/api/trpc/[trpc]/route.ts` proxies to `${NEXT_PUBLIC_API_URL}/api/trpc`, promoting the HttpOnly access cookie to an `Authorization: Bearer` header that `backend-web` verifies per request; an expired access token is re-minted inline from a valid refresh token. The tRPC client (`components/providers/trpc-provider.tsx`) points at `/api/trpc` and uses the `superjson` transformer (must match the server).

## Env

- `ADMIN_PASSWORD` — login password (required).
- `AUTH_SECRET` — shared HMAC secret with `backend-web`.
- `NEXT_PUBLIC_API_URL` — backend base URL (default `http://localhost:4000`).
