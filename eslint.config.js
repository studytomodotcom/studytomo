import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules",
      "dist",
      ".turbo",
      ".next",
      "apps/frontend/.next",
      "apps/worker/temp",
      "**/*.min.js",
      "**/build/**",
      "**/chunks/**",
      "**/static/**",
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-unused-vars": "warn",
      "no-undef": "off", // disable false errors from generated code
      "no-empty": "off", // disable warnings for compiled chunks
    },
  },
];
