# super-octo-rotary-phone

## Overview

Buildings.com is an AI-native and legacy building management platform for commercial and residential properties. It provides secure, scalable, and privacy-focused solutions for property owners, managers, and residents.

- SaaS and On-Premise deployment
- AI-driven automation and analytics
- Legacy system integration
- Privacy and security by design

## Security & Privacy

Buildings.com is built with privacy and security as core principles:
- End-to-end encryption for sensitive data
- Role-based access control
- Compliance with industry standards
- Regular security audits
- On-premise deployment for maximum data control

## Getting Started

- See `ON_PREMISE_DOCKER.md` for Docker build/run instructions
- See `docs/overview.md` for full documentation
- See `docs/api-reference.md` for API Reference (auto-updated)
- See `docs/security.md` for security details

## Mobile Apps (Android and iOS)

This repository supports user-facing Android and iOS apps through Capacitor.

### 1) Configure mobile web endpoint

Set `CAP_SERVER_URL` to the web endpoint the app should load:

- Development example: `http://10.0.2.2:3000` (Android emulator)
- Production example: `https://your-domain.example.com`

To launch the mobile-first login and dashboard shell, point to `/mobile`:

- Development shell: `http://10.0.2.2:3000/mobile`
- Production shell: `https://your-domain.example.com/mobile`

Capacitor reads this value from `capacitor.config.ts`.

### 2) Create native projects

- `npm run mobile:add:android`
- `npm run mobile:add:ios`

### 3) Sync web and native config

- `npm run mobile:sync`

### 4) Open and build apps

- Android: `npm run mobile:open:android`
- iOS: `npm run mobile:open:ios`

Notes:
- iOS build and signing require macOS with Xcode.
- Android build requires Android Studio and SDK/NDK tooling.

## Monorepo Hybrid Blueprint

The repository now supports an npm-workspaces monorepo layout for a SaaS and On-Prem hybrid model:

- `apps/saas-web` - SaaS web app target (migration target)
- `apps/on-prem-app` - Dockerized on-prem runtime
- `packages/ui` - shared UI package
- `packages/core-ai` - shared AI mode logic and orchestration helpers
- `packages/database` - shared database contracts/schemas

Current state:
- Existing production app code still runs from repository root.
- New workspace folders are scaffolded so migration can happen incrementally without downtime.

## Hybrid Runtime Modes

Set AI behavior using environment profiles:

- `npm run env:cloud` sets `AI_MODE=cloud`
- `npm run env:local` sets `AI_MODE=local`

The `.env.example` now includes `AI_MODE` and `OLLAMA_BASE_URL` to support both cloud and local model execution.

## On-Prem Local Stack

Spin up an on-prem reference stack (app + PostgreSQL + Ollama):

- `npm run onprem:up`
- `npm run onprem:down`

This uses `apps/on-prem-app/docker-compose.yml` and the on-prem Dockerfile at `apps/on-prem-app/Dockerfile`.

## Handshake UX (Cloud + Local Data)

For customers using SaaS UI with local data sources, the recommended flow is:

1. User signs into cloud UI.
2. Local agent (MCP core) runs in customer environment.
3. UI displays data source state (Cloud Storage or Local Server Connected).
4. Document/search requests route through the selected source with policy checks.

## Contributing

We welcome contributions! Please read the following before submitting a PR:
- Follow the code style and structure in the repo
- All new API endpoints should be documented in `docs/api-reference.md` (auto-updated by CI)
- Ensure all code is secure and privacy-focused
- Run `pnpm run lint` and `pnpm test` before pushing
- For desktop (Tauri) and mobile (Capacitor) builds, see the respective folders and docs

## CI/CD & Versioning

- Automated builds, version bumps, and release tagging via GitHub Actions
- API Reference is auto-updated on every commit
- Linux desktop app (Tauri) and mobile apps (Capacitor) are scaffolded and in progress

## Contact

For questions or support, open an issue or contact the maintainers.
