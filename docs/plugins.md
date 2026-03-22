# Plugin API Guide

This document describes how to create plugins, themes, or integrations for the Buildings.com platform.

## Plugin Structure

- Place your plugin in the `/contrib` directory.
- Each plugin should be in its own folder: `/contrib/my-plugin/`
- Include a `README.md` describing your plugin, usage, and configuration.

## Plugin API (Example)

```ts
// contrib/my-plugin/index.ts
import { registerPlugin } from 'buildings-core';

export default registerPlugin({
  name: 'My Plugin',
  version: '1.0.0',
  init(app) {
    // Add routes, UI, or hooks
    app.addRoute('/my-plugin', MyPluginPage);
  },
});
```

## Plugin Capabilities

- Add new routes/pages
- Extend UI (widgets, dashboards, settings)
- Integrate with external APIs
- Add admin tools or reports

## Guidelines

- Do not access or modify core/private logic.
- Follow code style and security best practices.
- Submit your plugin as a PR to `/contrib`.

## Questions?

Open an issue or contact maintainers for help.
