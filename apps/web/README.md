# web

Next.js Public Web App.

## Administrator shortcut

The desktop header and mobile menu display an admin-panel shortcut only after
`/auth/admin-access` verifies the current HttpOnly Supabase token against the
backend's existing local admin role and exact provider identity. This read-only
check creates neither users nor admin sessions. Responses are private/no-store;
logout and window focus refresh visibility. The admin application independently
requires its own authenticated admin session (GitHub login supported).

## Project references and guides

Skills, agents and blog details display labelled related links (web, GitHub, X,
documentation, community, video and other references). Creator supports the same
editor; submitted links follow the usual admin review process. Project agents
with an upstream repository display the readable guide before a collapsible
files/downloads section. Initial editorial guides and metadata live in
`content/agents/`; their version numbers describe the AgentRepo guide, not upstream.
