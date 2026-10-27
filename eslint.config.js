import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  { ignores: ["dist/**", ".impeccable/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["server/**/*.ts"], languageOptions: { globals: globals.node } },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
);
