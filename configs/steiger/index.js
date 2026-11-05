// Конфиг steiger (линтер архитектуры FSD): рекомендованные правила плюс исключения под файловый роутинг
// TanStack. Подключение: `export { default } from "@pavelsiba/quality-js/steiger"` в steiger.config.js.
import fsd from "@feature-sliced/steiger-plugin"
import { defineConfig } from "steiger"

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // routeTree.gen.ts генерирует роутер; server/ — вне слоёв FSD (см. configs/eslint/fsd.js)
    ignores: ["**/routeTree.gen.ts", "**/server/**"]
  },
  {
    rules: {
      // Не поблажка, а слепота: steiger не знает слоя `routes` (его модель — app/pages/widgets/features/
      // entities/shared), поэтому импорты из файлового роутинга для него не существуют. Включи правило —
      // и слайсы, которые потребляют роуты, получат «This slice has no references» (11 срабатываний
      // на more-shop, среди них site-header, который тянет каждая страница).
      "fsd/insignificant-slice": "off"
    }
  }
])
