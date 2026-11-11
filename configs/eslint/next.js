// Новые правила ESLint-ветки. У ESLint нет уровня `info`, а `warn` блокирует под `--max-warnings 0`, поэтому новое
// правило в минорной версии не попадает в `base()` / `react()`: проект включает `next()` сам, когда готов.
// В мажорной версии правила переезжают в `base()` / `react()` уровнем `error`, а `next()` пустеет.
//
// Сейчас: длина функции, как `noExcessiveLinesPerFunction` в Biome. 80 строк без пустых и комментариев,
// в `*.tsx` / `*.jsx` — 150 (как в `react` у Biome), в `*.test.*` и `*.spec.*` не проверяется.
const options = (max) => ({ max, skipBlankLines: true, skipComments: true })

/** @returns {import("eslint").Linter.Config[]} */
export const next = () => [
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    ignores: ["**/*.test.*", "**/*.spec.*"],
    rules: { "max-lines-per-function": ["warn", options(80)] }
  },
  {
    files: ["**/*.{jsx,tsx}"],
    ignores: ["**/*.test.*", "**/*.spec.*"],
    rules: { "max-lines-per-function": ["warn", options(150)] }
  }
]
