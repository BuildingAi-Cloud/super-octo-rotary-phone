# Hybrid Deployment Model (SaaS + On-Prem)

This guide defines the 2026 BuildSync hybrid operating model for privacy-sensitive customers.

## Architecture

Monorepo layout:

- apps/saas-web
- apps/on-prem-app
- packages/ui
- packages/core-ai
- packages/database

## Deployment Matrix

- SaaS hosting: Vercel, AWS, or equivalent managed platform
- On-prem hosting: Docker Desktop, OrbStack, or customer-managed servers
- SaaS database: managed PostgreSQL (e.g., Supabase)
- On-prem database: local PostgreSQL container
- SaaS AI: hosted API providers
- On-prem AI: Ollama local models

## Distribution Strategy

On-prem distribution should use container artifacts via GitHub Container Registry:

- image: ghcr.io/buildingai-cloud/buildsync-onprem
- customer update model: pull signed image by tag
- source protection: ship images, not repository source

## Local On-Prem Startup

1. Copy apps/on-prem-app/.env.example to apps/on-prem-app/.env when customization is needed.
2. Run docker compose with apps/on-prem-app/docker-compose.yml.
3. Validate app, database, and Ollama service health.

## Universal Environment Keys

The same image supports SaaS and On-Prem behavior using environment values:

- APP_MODE: saas or on-prem
- LICENSE_KEY: on-prem entitlement token
- AI_PROVIDER: ollama, anthropic, or openai
- OLLAMA_BASE_URL: local inference endpoint for AI_PROVIDER=ollama
- DB_URL: database connection URL
- LOCAL_STORAGE_PATH: mounted path for local property records

For customer deployments, map host docs folder to `/data/properties` and set `LOCAL_STORAGE_PATH=/data/properties`.

## Signed License Validation (On-Prem)

On-Prem mode uses a signed key format:

- `payload.signature` (both Base64URL)
- payload JSON includes: product, customer, seats, expires_at, capabilities

Validation flow:

1. `license-init` container runs before main app.
2. Signature verified with embedded public key (`/app/config/license_public.pem`) or `LICENSE_PUBLIC_KEY`.
3. Validation metadata is written to `LICENSE_STATE_PATH`.
4. Main app starts only if init validation succeeds.

Degraded state policy:

- Expired or invalid key: read-only mode, AI actions disabled.
- Seat limit and heartbeat issues: non-destructive warnings and restricted write/AI operations.

## Handshake UX Pattern

The cloud app can connect to customer-local sources through a local agent.

Recommended UI control:

- Data source options:
  - Cloud Storage
  - Local Server (Connected)

When local mode is selected:

1. Route document/query requests to the local agent.
2. Keep metadata and access logs synchronized with cloud control plane.
3. Enforce org policy and legal retention rules at query time.
