// Типы для `export { default } from "@pavelsiba/quality-js/commitlint"` в commitlint.config.js
// проекта: без них редактор и tsc с allowJs ругаются TS7016. Форма — без @commitlint/types,
// чтобы проекту не ставить ещё одну зависимость.
declare const config: {
  readonly extends: readonly string[]
  readonly plugins: readonly unknown[]
  readonly rules: Readonly<Record<string, unknown>>
}

export default config
