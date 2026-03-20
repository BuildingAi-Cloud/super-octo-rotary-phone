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
