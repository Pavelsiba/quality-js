// Правила хуков React. rules-of-hooks ловит реальные баги (порядок хуков), exhaustive-deps — полезный, но
// шумный сигнал, поэтому warn. Проекты гоняют eslint с --max-warnings 0, так что warn блокирует наравне с error:
// либо чинить, либо точечный disable с причиной в комментарии.
import reactHooks from "eslint-plugin-react-hooks"

/** @returns {import("eslint").Linter.Config[]} */
export const react = () => [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
]
