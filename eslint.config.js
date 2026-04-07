import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"

export default [
  // Global ignores — keep ESLint out of build artifacts and submodules
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "super-octo-rotary-phone/**",
      "submodule-backup/**",
      "ui-library/**",
      "src-tauri/**",
      "web-llm-chat-main/**",
      "src/**",
      "public/**",
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript + React rules for all source files
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        // Browser
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        FormData: "readonly",
        URLSearchParams: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Promise: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        alert: "readonly",
        confirm: "readonly",
        crypto: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        IntersectionObserver: "readonly",
        CustomEvent: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        Element: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        DOMParser: "readonly",
        File: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        // Node
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        global: "readonly",
        // Next.js / React
        React: "readonly",
      },
    },
    rules: {
      // Turn off base rule — TypeScript handles undefined variables
      "no-undef": "off",
      // Prefer the TypeScript-aware version
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-require-imports": "warn",
      // React — JSX transform handles the React import automatically
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Hooks — rules-of-hooks must be an error; exhaustive-deps is a warning
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]
