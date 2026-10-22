# AgentRepo threat model

## Scope and architecture

AgentRepo is a public catalogue of AI skills, agent project guides/source files,
and articles, with moderated contributions and a project-local skill installer.
The repository is an Nx/pnpm TypeScript monorepo. It is a small, actively developed
project; no large deployment base or downstream adoption is assumed here.

| Component                 | Responsibility and security-relevant code                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`                | Next.js public catalogue, Markdown/file viewers, contributor authentication and Creator BFF. See `src/app/auth`, `src/app/api/creator/submit`, `src/lib/limited-json.ts`.                |
| `apps/admin`              | Separate Next.js administrative origin, session cookies, OAuth/SSO bridge and authenticated tRPC proxy. See `src/middleware.ts`, `src/lib/auth`, `src/app/api/auth`, `src/app/api/trpc`. |
| `apps/backend-web`        | NestJS/Express HTTP entry point, tRPC composition root and authorization context. See `src/main.ts`, `src/trpc/trpc-context.ts`.                                                         |
| `apps/backend-ai`         | NestJS internal contact-processing workflow, authenticated by a shared service key. See `src/workflow/internal-key.guard.ts` and `contact-workflow.controller.ts`.                       |
| `packages/domain`         | Framework-independent catalogue, file-tree/path validation, publication and premium-content rules.                                                                                       |
| `packages/application`    | Authentication, publishing, identity resolution, contact and playground use cases; ports for storage, AI and email.                                                                      |
| `packages/infrastructure` | Prisma repositories, Supabase identity verification, DeepSeek/LangChain adapters, PDF/email generation and internal HTTP client.                                                         |
| `packages/trpc`           | Input schemas, public/contributor/admin procedures, pagination and process-local rate limits.                                                                                            |
| `packages/cli`            | Node installer: manifest/lock parsing, registry requests, filesystem installation, integrity verification and restoration.                                                               |

PostgreSQL is accessed through Prisma. Supabase Auth supplies contributor identity
and verifies administrator login/provider tokens. The application's local role
mapping is separate from an Auth account or PostgreSQL role. Administrator login
must find the exact linked provider identity with the local administrator role;
GitHub sign-in alone must not grant administrator privileges.

The web/admin servers and API are separate trust domains even when hosted by one
operator. CI builds all applications, the platform deployment workflow runs
migrations and deployments, and `release-cli.yml` publishes independent CLI
archives. The scanner image is an analysis environment, not a deployment image.

## Assets and adversaries

Protect administrator authority, contributor identity, unpublished proposals,
contact messages/addresses, restricted catalogue bodies, immutable version
snapshots, consumer lockfiles/project files, application availability and paid
AI/email budgets. Server-side authentication keys, provider credentials, SMTP
passwords, database credentials and CI/deployment permissions are high-value
assets. They are not supplied to this image.

Consider anonymous Internet clients, a legitimately authenticated contributor,
a malicious package/manifest or registry response on a CLI user's machine,
malicious Markdown/source documents, compromised dependencies and hostile model
output. An already authorized administrator can intentionally publish/edit
content; that intended capability is not by itself an authorization bypass.

## Trust boundaries and untrusted inputs

1. Browser to Next.js BFF: cookies, request Origin/Host, callbacks/return paths,
   request streams, JSON, locale, filenames and source text are untrusted.
2. Next.js to backend-web: server-selected upstream URLs and bearer tokens cross
   a process boundary. The backend must authorize direct calls too; hiding a UI
   button or relying on CORS is insufficient.
3. Backend to identity provider and database: externally verified identity must
   not be replaced by an email/client-supplied role; database queries must retain
   publication, premium and author restrictions.
4. backend-web to backend-ai: the internal shared key and validated payload guard
   a workflow that can generate paid requests, PDFs and outbound email.
5. Application to AI/SMTP/observability providers: prompts, model replies,
   recipient metadata and errors must not expose credentials or private records.
6. Registry to CLI to agent consumer: downloaded text is untrusted even if its
   version/hash is consistent. An agent may later interpret it as instructions.
7. Repository/dependencies to CI and releases: package lifecycle scripts, native
   modules, workflow inputs, source archives and release artifacts are executable
   supply-chain inputs.

## Authentication, sessions and user isolation

Inspect `packages/application/src/auth`, `packages/trpc/src/lib/auth`,
`packages/infrastructure/src/auth/supabase` and both applications' auth routes.
Public contributor sessions and administrator sessions have distinct purposes.
Admin cookies use host-only production cookie names and HttpOnly access/refresh
values. The BFF promotes the access cookie to a bearer header; the backend
verifies its HMAC/type/expiry. Access tokens last 15 minutes. Refresh tokens are
opaque, stored hashed, rotated with a 30-second concurrency grace and a seven-day
lifetime; session-family reuse/revocation logic is in the auth use cases/repository.
Do not assume every admin API call re-queries the role or refresh-session record:
short-lived access tokens represent an already issued admin capability.

The SSO handoff uses a 60-second AES-GCM ticket bound to a private host-only nonce
via its hash; callbacks revalidate the provider token and local role. Review
nonce binding, replay, expiration, cookie attributes, origin checks and redirect
normalization. OAuth callbacks are intentionally cross-site: assess their
PKCE/state/cookie binding rather than requiring an Origin header on every GET.

`adminProcedure` enforces backend administrator authorization. `creatorProcedure`
requires resolved contributor identity; `creator.ts` fixes author ID server-side
and sets proposals unpublished/non-premium regardless of client intent. Catalogue
public procedures must exclude drafts and redact premium bodies in all language,
search, history and version projections. This is a shared catalogue, not an
enterprise tenant/workspace product; test identity A/B isolation of private data
where it exists without inventing a tenant model. Contributors must not acquire
admin access, publish directly, impersonate another author or read others' drafts.

## Priority attack surfaces and existing controls

These controls are observed implementation, not a claim that the whole system is
secure. The following are investigation targets, not confirmed vulnerabilities.

### Web/API injection and resource abuse

- **XSS:** `packages/ui/src/components/content/markdown-content.tsx` uses
  ReactMarkdown with `skipHtml`, not MDX execution. Source views render text.
  Inspect URL transforms, related/image links, translations, admin previews and
  any `dangerouslySetInnerHTML` sink for a reachable untrusted source. Demonstrate
  script execution in the victim origin; HTML-looking text alone is insufficient.
- **CSRF:** inspect trusted-origin checks on cookie-authenticated mutations in
  web/admin routes and BFF proxy, SameSite cookies and OAuth/SSO binding. Direct
  bearer-token APIs have a different CSRF model; CORS is not authorization.
- **SQL injection:** Prisma normally binds values. Full-text search uses tagged
  SQL plus `Prisma.raw` for internally selected table/field identifiers in
  `prisma-global-search.repository.ts`; trace user input through `full-text.ts`,
  locale and filters before alleging an injectable identifier or query.
- **SSRF:** upstream Auth/AI/internal API/SMTP URLs come from operator configuration.
  Creator repository/related links are metadata; submitting one does not cause a
  server-side repository clone or URL fetch. Distinguish browser image requests
  from server fetches. A report must identify an actual attacker-controlled URL
  reaching a server fetch/redirect, including schemes, credentials and private IPs.
- **Command injection:** uploaded sources and generated components are not passed
  to a shell/compiler by the backend. Audit build/package/DB scripts separately:
  establish whether an untrusted party can supply command arguments or workflow
  inputs under the claimed privilege context.
- **DoS/cost abuse:** backend JSON parsing has a bounded, non-inflating body parser;
  the Creator BFF also counts actual streamed bytes before JSON parsing. Pagination,
  content budgets and process-local rate limiters constrain some paths. They are
  not distributed quotas across workers/restarts. Consider batch amplification,
  parser complexity, oversized responses and bypasses with a concrete resource
  budget. Reverse-proxy IP trust is deployment-sensitive (`trust proxy = 1`).

### Uploaded files, ZIP Slip and path traversal

`apps/web/src/components/creator/agent-package.ts` parses ZIPs only in a browser
worker (`read-agent-upload.ts`); the worker is terminated after 20 seconds. Archive
checks cover entry/path metadata, encryption, special files/symlinks, CRC,
expanded-byte counts and UTF-8 text. Current budgets are 4 MB compressed, 200
source files, 100 KB/file and 1 MB total expanded text. Nested/binary/disallowed
files are rejected by the shared validation rules.

The server receives JSON paths/text, not a ZIP archive. It independently validates
paths, counts, depth, duplicates/collisions and UTF-8 size using
`packages/domain/src/catalog/agent-files.ts` and Creator schemas. Stored file trees
are database JSON, not server filesystem extraction. Absolute paths, traversal,
Windows separators and reserved/generated/private path names must not cross the
boundary. Client validation can be bypassed; server validation is the relevant
barrier. This is avoidance of server-side archive execution, not a claimed server
sandbox. Test direct malformed JSON and both parsers; report a server write only
if a reachable write exists. Browser resource exhaustion is a distinct impact.

### Skill distribution and local installer

The CLI reads `agent.json`, `agent-lock.json`, local target directories and remote
registry envelopes. See `packages/cli/src/{manifest,registry,install}.mjs` and the
filesystem helpers. It validates exact versions/slugs and HTTPS registry URLs,
rejects redirects, bounds registry responses/timeouts, and checks symlinks and
managed-file ownership before writes. Review lock/manifest mismatch, TOCTOU,
path confinement, rollback and `reset --hard` preservation of unrelated files.
Tests use injected/local fixtures rather than the public registry.

Snapshots and resolved locale hashes pin content across reinstalls; later
translations must not silently change a locked fallback. POSIX read-only modes
help prevent accidental edits. The owner/root can change permissions, and hashes
are not publisher signatures. A first-time malicious approved skill or a new
registry chosen by the user is not made safe by hashing. The CLI never executes
skill content; downstream agent interpretation is the prompt-injection boundary.
A report should distinguish intended local manifest control from writing outside
the chosen project or silently substituting a pinned snapshot.

### AI, email and PDFs

Contact messages and playground prompts/model output are untrusted. Contact
analysis requests bounded JSON, validates it with a strict Zod schema and bounds
retries/output; templates add the email/PDF presentation. Check escaping,
recipient/header handling, attachment data and accidental credential/context
exfiltration in prompts, errors or tracing. Schema-valid prose can still contain
misleading instructions: JSON validity does not prevent prompt injection.
The implemented contact model has no shell, arbitrary browsing or deployment
tools. Demonstrate a crossed privilege/data boundary, not merely a model ignoring
a writing preference. Mock providers for safe reproduction; never send real mail
or bill a live model account.

The playground real flow is token-gated and uses atomic token consumption for
execution. Generated code receives coarse static checks, is stored as text and
shown in an escaped code view; its deployment URL is illustrative, not a real
hosting deployment. Static checks are not a security sandbox or a general proof
that JavaScript is safe. Audit token accounting, subscriptions, storage limits
and authorization independently of generation. Demo previews are fixed UI.

### Supply chain, secrets and privileged administration

Review the frozen pnpm graph, dependency lifecycle scripts, native engines,
GitHub Actions permissions/trigger trust, release tarball contents and untrusted
PR handling. Existing dependency mitigations are documented in
`docs/security/dependency-mitigations.md`; upstream advisories alone do not prove
an exploitable project bug. Do not disable audit or security checks to make a
reproducer pass. The scanner build pins Node and pnpm, retains development tools
and fetches Prisma/Chromium while online.

An admin takeover could publish poisoned skills, replace head metadata, disclose
contact/private content and manage playground tokens. Publishing/version/retag
use cases must preserve their intended snapshot invariants. Validate whether a
candidate affects an existing fixed release, a new version, or only editable
metadata before asserting supply-chain compromise.

Provider, database, SMTP and deployment keys are server-side secrets; public
Supabase publishable keys and analytics identifiers are not equivalent to admin
credentials. Check that private keys never enter client bundles, cookies readable
by JS, public API errors, logs or catalogue projections. The web's legal contact
is public information, not a secret. Never use real credentials for this audit.

## Severity and report quality

Severity depends on demonstrated exploitability, prerequisites and blast radius.
Use Critical/High/Medium/Low with a reason, not a keyword-only CVSS assignment.

| Severity | Project-specific examples, if demonstrated                                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Critical | Unauthenticated arbitrary server code execution; broad database/credential compromise; unauthenticated privilege gain enabling persistent malicious catalogue publication with a demonstrated consumer-impact chain.                                                                 |
| High     | Non-admin publication/admin takeover; cross-user private message/draft disclosure; stored script execution in an administrator session; exploitable SQL injection or SSRF exposing privileged data. Post-auth does not automatically reduce a contributor-to-admin attack to Medium. |
| Medium   | Bounded authenticated data tampering, exploitable CSRF with limited impact, meaningful limited-scope cost/availability abuse, or a constrained cross-user leak without privileged data.                                                                                              |
| Low      | Small confidentiality/integrity exposure or hardening issue with demonstrated limited impact. An untested suspicion is not a confirmed Low vulnerability; label it unconfirmed.                                                                                                      |

A dependency CVE without a reachable sink, a regex bypass without execution,
self-XSS requiring deliberate console execution, or hostile text that only prints
as text is not sufficient evidence of the claimed exploit. Group reports sharing
a root cause; distinguish independent trust-boundary failures.

For each finding provide the reviewed commit, file/function, attacker capability,
entry point and sink, minimal synthetic input, exact local commands, expected and
observed result, affected versions, impact and mitigating controls. Label clearly:
confirmed by a reproducer, inferred from source, or not reproduced. Include a
minimal patch and regression test failing before/passing after. Preserve existing
validation, authorization, immutable-version and API compatibility guarantees.
Keep reports private to the configured maintainer contact, per the program terms.

## Safe offline reproduction and exclusions

Run `bash .oss-scanner/check.sh` from `/src` in the prepared image. It regenerates
Prisma Client, runs lint/unit tests without Nx task-cache reuse, executes the
existing deployment-safety checks and runs desktop/mobile Playwright tests.
Playwright starts only local fixture servers; it does not log in to Supabase.
All current tests and production dependencies remain unmodified.

The image includes PostgreSQL tools for optional disposable local DB experiments.
Prisma generation does not connect to a database. Standard tests do not migrate or
seed one; database-backed Auth/RLS/provider behavior is therefore not established
by a passing unit suite. Use synthetic rows and a loopback-only temporary cluster
if reproducing a database-specific issue. Never run production seed scripts.
Browser, Prisma engines and package-manager caches are installed during the
online build. Services requiring Supabase OAuth, DeepSeek, SMTP, tracing or real
hosting/deployment keys are not exercised live; use existing mocks/ports.
The image's dummy database URL is local only and grants no external access.

Only this repository's first-party behavior is in scope. Upstream agent projects
linked by the catalogue, cloud providers' infrastructure, other repositories,
real user data, live credentials and production websites/services are excluded
from dynamic testing. Do not fetch or execute arbitrary catalogue packages,
exploit third-party hosts, publish test entries, send email, deploy code, or use
mounted host files/Docker sockets. Dependency integration flaws in first-party
code remain in scope, but report upstream-only bugs to their own maintainers.
No report should claim acceptance by Anthropic or a completed external pentest
based solely on this build and threat model.
