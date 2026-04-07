# Contributing to Buildings.com

Thank you for your interest in contributing! This project is partly open source. Please read the guidelines below to understand what you can contribute and how to get started.

## What is Public vs. Private?

- **Public:**
  - UI (web app), API routes, documentation, plugins, themes, and integrations in `/contrib`.
  - All public code is open for issues and pull requests.
- **Private:**
  - Core business logic, proprietary models, billing, licensing, and security logic in `/packages/core` and `/packages/integrations`.
  - These are not open for contributions or public review.

## How to Contribute

1. **Fork the repository** and create your branch from `master`.
2. **Work on public code only** (see above).
3. **Write clear, well-documented code** and include tests if possible.
4. **Open a pull request** with a clear description of your changes.
5. **Participate in code review** and address feedback.

## Multi-Repository Routing (Mandatory)

All contributors must route changes to the correct repository:

- Development website: `https://github.com/BuildingAi-Cloud/super-octo-rotary-phone.git`
- Beta testing website: `https://github.com/BuildingAi-Cloud/Website-Beta.git`
- Mobile app (Android APK track): `https://github.com/BuildingAi-Cloud/symmetrical-palm-tree.git`

Required checks before any push:

1. `npm run build`
2. `npm run lint`
3. `npm test`

Review the full process in `README-MULTI-REPO.md`.

## Plugin/Extension Contributions

- Add new plugins, themes, or integrations in the `/contrib` directory.
- Follow the plugin API documentation in `/docs/plugins.md`.
- Submit a PR with your plugin and a short README.

## Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Public code is licensed under MIT. Private code is proprietary and not distributed.

## Questions?

Open an issue or contact the maintainers for help.
