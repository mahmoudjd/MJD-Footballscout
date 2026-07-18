import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      "postcss.config.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
      "@next/next/no-img-element": "warn",
      "no-extra-boolean-cast": "off",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{jsx,tsx}"],
    ignores: ["src/components/ui/input.tsx", "src/components/ui/textarea.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: "Use the shared Select component from @/components/ui/select.",
        },
        {
          selector: "JSXOpeningElement[name.name='input']",
          message: "Use the shared Input component from @/components/ui/input.",
        },
        {
          selector: "JSXOpeningElement[name.name='textarea']",
          message: "Use the shared Textarea component from @/components/ui/textarea.",
        },
      ],
    },
  },
  eslintConfigPrettier,
]
