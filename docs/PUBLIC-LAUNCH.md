# Public launch

## Discovery and sharing

Public catalogue pages allow indexing. Account, Creator, API and portfolio routes remain excluded. The deployment removes the historical public `X-Robots-Tag` hold from the web document root, leaving private application headers intact. The sitemap contains public catalogue entries and the privacy/terms pages.

Open Graph and Twitter metadata use the supplied raster brand cover at `/og-cover.jpg`. Detail pages carry their own titles, descriptions and canonical URLs. Icons and the header use the static brand symbol; the animated avatar is unchanged.

## Traffic analytics

Cloudflare Web Analytics is configured for manual snippet installation. The public identifier lives in the GitHub Variable `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`; it is not an API credential. The script loads after hydration on public catalogue pages and tracks SPA navigation. Crossing from public links to account/private surfaces loads a new document to end public measurement. Fresh private pages do not load the beacon.

View reports in Cloudflare → Web Analytics → agentrepo.dev. Use visits, page views, referrers, country, device/browser and performance metrics. Traffic at Cloudflare’s edge includes automated requests and differs from browser measurements; blockers, script failures and sampling can affect the figures. This integration does not send account IDs, form bodies, email addresses or custom session recordings. Cloudflare’s beacon removes query strings and fragments from reported URLs; check actual payloads when changing the integration.

## AI contact replies

The existing portfolio contact workflow stores the request, generates one bounded reply, renders a PDF locally and sends the reply plus a notification through Spacemail. The application fixes recipients, templates and attachments; model output never controls these fields or generates HTML.

DeepSeek uses JSON mode with a strict Zod schema containing only `reply`. Input is limited to 3,000 characters, output to 512 tokens / 1,400 characters, with thinking disabled. There is one initial attempt and at most three retries; SDK retries are disabled so budgets do not multiply. Empty, malformed, unexpected or truncated output is rejected. Exhaustion uses a deterministic fallback and still delivers a report; SMTP/PDF failures mark the workflow failed. Suspicious-message checks are a heuristic, not a guarantee against prompt injection.

Actions Secrets store `DEEPSEEK_API_KEY` and `SPACEMAIL_PASS`. Variables store `DEEPSEEK_MODEL`, `SPACEMAIL_USER` and `CONTACT_FORM_NOTIFICATION_EMAIL`. The backend-ai deploy writes only these settings and the SMTP endpoint into a private `0600` runtime file over SSH stdin. Other runtime settings remain unchanged. No credentials belong in the bundle or repository.

The reply and internal notification are separate SMTP deliveries; a partial delivery failure must be investigated before manually repeating the workflow to avoid duplicates. HTTP acceptance or SMTP acceptance alone does not prove inbox delivery; inspect the workflow status and mailbox when validating releases.
