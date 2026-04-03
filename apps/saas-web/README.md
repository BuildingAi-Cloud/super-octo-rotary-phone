# BuildSync SaaS Web App

This folder is the monorepo target for the hosted SaaS Next.js application.

Current status:
- The active app source is still located at the repository root.
- This folder exists to support a non-breaking migration into apps/saas-web.

Recommended migration path:
1. Move app runtime files from the repository root into this folder.
2. Keep shared logic in packages/ui, packages/core-ai, and packages/database.
3. Update deployment pipelines to use apps/saas-web as the web app root.
