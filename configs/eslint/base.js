// База для проектов на ESLint: typescript-eslint recommended и стиль через @stylistic — те же правила, что в
// `configs/biome/base.jsonc` (двойные кавычки, без `;` и висячих запятых, 2 пробела, `type` вместо `interface`).
import stylistic from "@stylistic/eslint-plugin"
import tseslint from "typescript-eslint"

/** @returns {import("eslint").Linter.Config[]} */
export const base = () => [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/arrow-parens": ["error", "always"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"]
    }
  }
]
