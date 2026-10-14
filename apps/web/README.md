# web

Next.js Public Web App.

## Administrator shortcut

The desktop header and mobile menu display an admin-panel shortcut only after
`/auth/admin-access` verifies the current HttpOnly Supabase token against the
backend's existing local admin role and exact provider identity. This read-only
check creates neither users nor admin sessions. Responses are private/no-store;
logout and window focus refresh visibility. The shortcut starts a browser-bound SSO bridge to reuse the existing web session.
The admin app stores a private host-only HttpOnly nonce; only its SHA-256 hash
crosses domains. The backend verifies the existing admin role, encrypts a
60-second ticket with a domain-separated AES-GCM key, and the admin callback
checks the private nonce and revalidates the identity/role before issuing its
own host-only session. No shared-domain auth cookies or plaintext URL tokens.
Auth responses are private/no-store with no-referrer; the nonce is cleared on
both success and failure. Anonymous visitors retain the GitHub/email login.

## Project references and guides

Skills, agents and blog details display labelled related links (web, GitHub, X,
documentation, community, video and other references). Creator supports the same
editor; submitted links follow the usual admin review process. Project agents
with an upstream repository display the readable guide before a collapsible
files/downloads section. Initial editorial guides and metadata live in
`content/agents/`; their version numbers describe the AgentRepo guide, not upstream.

## CLI guide and navigation

`/cli` documents the released CLI tarball, project `agent.json`, tool selection,
lockfiles, read-only snapshots and integrity limits in English and Spanish.
Commands and manifests have copy buttons. Skills, Agents, Blog and CLI form the
main navigation; Playground and Portfolio live only in a secondary footer row.
The CLI package version and release URL are pinned explicitly in the guide.

## Public navigation performance

The header shares one admin-access check across desktop/mobile and retains it
across client navigation. Login/logout and window focus revalidate visibility;
privileged API operations still authorize server-side independently.
Middleware skips anonymous auth and uses signature-verified getClaims for
session refresh and display metadata. Creator and protected APIs keep their
existing user/role checks. See Supabase SSR auth-method documentation.
Public pages use anonymous cached `*.catalog` summary endpoints, excluding
snapshot bodies and file trees; detail APIs remain compatible. Catalogue SQL
reads run list/count concurrently, with no changes to write transactions.
The CLI guide documents global CLI 0.2.1 and the interactive entry point.

CLI releases use their own cli-vX.Y.Z tags and workflow; platform releases do not package the CLI.

## Skill documents

The rendered skill view recognises YAML frontmatter as metadata. Raw, Copy and
Download preserve the complete original document, including frontmatter. Other
Markdown viewers retain their existing rendering behaviour.
