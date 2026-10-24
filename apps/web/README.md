# web

Next.js Public Web App.

## Private blog review

Verified administrators signed in on the web see **Review drafts** on `/blog`.
`/blog/review` lists unpublished posts, including administrator-created drafts;
`/blog/review/<id>` renders the same article component as the public page with a
private preview banner and an explicit publish button. The admin blog table also
links to these previews. The web's Supabase credential stays server-side; the
backend verifies provider identity and the existing local administrator role on
every preview and publication, without creating a separate admin session.
Review operations use POST bodies, never credential-bearing URLs. Responses are
private/no-store, excluded from analytics and marked noindex/nofollow. Publication
invalidates the public catalogue cache. Anonymous and non-admin users cannot read
drafts; public blog endpoints, sitemap and search remain published-only.

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

## Bilingual catalogue

The existing EN/ES selector also selects skills, agent guides and blog bodies,
including file previews and downloads. API read inputs accept optional `locale`.
Omitting it preserves the original registry bytes for existing CLI integrity
locks; selecting a translation never rewrites executable files. Markdown paths
can have translated bodies while retaining their original tree and filenames.
Missing translations show the original with an explicit language notice.
Catalogue summaries exclude translation maps and full bodies; premium
projections protect all language variants. Public search uses both language
vectors and returns titles/excerpts in the requested language.

## Owner-private skills (administrator pilot)

Verified web administrators can open **My private skills** from `/skills`.
`/skills/private` supports creating, reading, editing, copying and downloading
personal Markdown documents. There is no publish action. A dedicated
`PrivateSkill` table keeps these records separate from public working copies,
immutable versions, search, catalogue, CLI registry and download metrics.

Every private operation revalidates the provider credential and exact local
administrator link, deriving the owner ID server-side. Another administrator
cannot access the owner's records by ID. Legacy administrator sessions alone
cannot identify an owner. Database RLS and revoked anonymous/authenticated grants
block direct Supabase data API access; the backend retains its existing trusted
database role. Revisions prevent overwriting concurrent edits. Private routes
and API responses are no-store/noindex and omitted from public analytics.
No personal preferences are seeded or committed; owners create them privately.

## Pinned skill URLs

Public skill links use `/skills/<slug>/<version>`, including catalogue cards,
home entries, search results, the Writer recommendation and every history row.
Bare `/skills/<slug>` links resolve to the current latest release; existing
`?version=x.y.z` links resolve to the corresponding version path. These redirects
are temporary so the bare alias can follow later releases. `/latest` is also a
moving alias. Canonical and Open Graph URLs identify the exact release.

The version route reads only the published snapshot. Missing, invalid or
mismatched snapshots render not-found, even if the parent still has a working
copy. Preview, raw/copy and download all use that snapshot; language selection
uses its saved translations. The page shows the snapshot's publication date.
Private skills keep their existing owner-protected routes.

Public skill routing checks the selected snapshot (or latest-tag metadata for aliases) before rendering. Floating
aliases return HTTP 307; unavailable releases return an uncached HTTP 404 page
before the root loading boundary can stream a 200 response. An unavailable
metadata service returns HTTP 503 with Retry-After instead of a false 404.

## Crawler-readable public content

Public routes render their primary content in visible server HTML without a
root loading/Suspense boundary. This prevents clients without JavaScript from
receiving only a loading placeholder with the real content in hidden streamed
blocks. Client navigation, search and the animated avatar remain interactive.
The home introduces the whole catalogue in EN/ES before the latest feed and
includes WebSite/WebApplication JSON-LD with stable public identifiers. JSON-LD
serialization escapes HTML script boundaries; it contains no adoption or rating
claims. Browser regressions cover home, catalogues and details with JavaScript
disabled. This improves readability; indexing and search placement remain up to
the search engines.
