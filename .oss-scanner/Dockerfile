# Scanner build environment, not a production runtime image.
FROM node:24.13.0-bookworm@sha256:1de022d8459f896fff2e7b865823699dc7a8d5567507e8b87b14a7442e07f206

ENV DEBIAN_FRONTEND=noninteractive \
    CI=true \
    HUSKY=0 \
    NX_DAEMON=false \
    NX_NO_CLOUD=true \
    NEXT_TELEMETRY_DISABLED=1 \
    npm_config_update_notifier=false \
    PLAYWRIGHT_BROWSERS_PATH=/opt/playwright \
    NODE_OPTIONS=--max-old-space-size=4096 \
    DATABASE_URL=postgresql://scanner:scanner@127.0.0.1:5432/scanner?schema=public \
    NEXT_PUBLIC_API_URL=http://localhost:4000 \
    NEXT_PUBLIC_SUPABASE_URL="" \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="" \
    NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=11111111111111111111111111111111

# Native modules, Prisma/OpenSSL, local DB experiments and code inspection.
# No database cluster is started or seeded during the build or standard tests.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates curl git python3 build-essential openssl rsync postgresql postgresql-contrib \
    && rm -rf /var/lib/apt/lists/* \
    && npm install --global pnpm@10.33.4 \
    && mkdir -p /src /opt/playwright \
    && chown node:node /src /opt/playwright

WORKDIR /src
COPY --chown=node:node . /src
USER node

# The normal postinstall generates Prisma Client and downloads its native engine.
# Keep the pnpm store and Prisma caches in the image for subsequent offline work.
RUN pnpm install --frozen-lockfile

USER root
RUN pnpm exec playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/* \
    && chmod -R a+rX /opt/playwright
USER node

# Nx builds internal dependencies before the applications. No production services.
RUN pnpm exec nx run-many --target=build --all --parallel=2

# Fail the image build if a regression or missing offline dependency is detected.
RUN --network=none bash .oss-scanner/check.sh

CMD ["bash"]
