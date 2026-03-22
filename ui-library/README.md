# UI Library Structure

This is a reusable UI component library for your product. It supports theme switching (light/dark) and UI mode switching (full/simple), and is organized for easy enhancement and exploration.

## Structure

- `src/components/` — Atomic and composite UI components (Button, Card, ThemeSwitch, UiModeSwitch, etc.)
- `src/theme/` — ThemeProvider and theme logic
- `src/hooks/` — Custom hooks for UI logic
- `src/utils/` — Utility functions
- `src/styles/` — Shared styles (CSS/SCSS/Tailwind config)
- `src/docs/` — Usage examples and documentation
- `__tests__/` — Component tests
- `src/index.ts` — Exports all components/providers

## Usage Example

```tsx
import { ThemeProvider, ThemeSwitch, UiModeSwitch, Button, Card } from 'ui-library/src';

function App() {
  return (
    <ThemeProvider>
      <ThemeSwitch />
      <UiModeSwitch />
      <Card title="Welcome">
        <Button>Click Me</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Extending
- Add new components to `src/components/`
- Add new themes or UI modes in `src/theme/`
- Add hooks to `src/hooks/`
- Add tests to `__tests__/`

---

This structure is ready for further enhancement and scalable for future UI needs.
