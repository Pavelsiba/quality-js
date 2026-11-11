# Changelog

## [2.6.0](https://github.com/Pavelsiba/quality-js/compare/v2.5.1...v2.6.0) (2026-11-11)

### Новое

* **biome:** добавлены конфиги css и tailwind, подключаемые отдельно от base ([3f9a372](https://github.com/Pavelsiba/quality-js/commit/3f9a372324fa8a11b8c35a7ecf77bb41bc7122f2))

### Исправления

* lib в tsconfig bundler поднят до ESNext, peer conventionalcommits сужен до <10 ([64ee6fb](https://github.com/Pavelsiba/quality-js/commit/64ee6fbe77c9c387516f42251eb0f5f615ccc674)), closes [#8](https://github.com/Pavelsiba/quality-js/issues/8) [#10](https://github.com/Pavelsiba/quality-js/issues/10) [#11](https://github.com/Pavelsiba/quality-js/issues/11)

## [2.5.1](https://github.com/Pavelsiba/quality-js/compare/v2.5.0...v2.5.1) (2026-11-06)

### Исправления

* **biome:** ослаблены правила base, дававшие ложные срабатывания на существующих проектах ([6a0fc14](https://github.com/Pavelsiba/quality-js/commit/6a0fc14e61d7775dc20e57ba4e531ec367418091)), closes [#3](https://github.com/Pavelsiba/quality-js/issues/3) [#4](https://github.com/Pavelsiba/quality-js/issues/4) [#1](https://github.com/Pavelsiba/quality-js/issues/1) [#2](https://github.com/Pavelsiba/quality-js/issues/2)

## [2.5.0](https://github.com/Pavelsiba/quality-js/compare/v2.4.0...v2.5.0) (2026-11-05)

### Новое

* **eslint:** добавлены фабрики ESLint и конфиг steiger ([ca5f890](https://github.com/Pavelsiba/quality-js/commit/ca5f89045a5f8636e1e52ff8a5237a13e2cc923c))
* **release:** добавлены экспорт release и переиспользуемый workflow безопасности ([b5e0586](https://github.com/Pavelsiba/quality-js/commit/b5e05868681f037f0fb0fb379180646095461a75))

## [2.4.0](https://github.com/Pavelsiba/quality-js/compare/v2.3.0...v2.4.0) (2026-11-05)

### Новое

* **biome:** добавлены плагины GritQL для Vitest уровнем info ([edfaceb](https://github.com/Pavelsiba/quality-js/commit/edfaceb6b5d09e06a726ac247694ff6cd7ece5ec))

## [2.3.0](https://github.com/Pavelsiba/quality-js/compare/v2.2.0...v2.3.0) (2026-11-05)

### Новое

* **biome:** добавлены плагины GritQL остатка безопасности уровнем info ([706bce0](https://github.com/Pavelsiba/quality-js/commit/706bce058a449f876473e17f79977a79489709c8))

## [2.2.0](https://github.com/Pavelsiba/quality-js/compare/v2.1.0...v2.2.0) (2026-11-05)

### Новое

* **biome:** добавлены плагины GritQL для тестов уровнем info ([6b54a37](https://github.com/Pavelsiba/quality-js/commit/6b54a37a3bcebb41f00b03991619b32fe23672f5))

## [2.1.0](https://github.com/Pavelsiba/quality-js/compare/v2.0.0...v2.1.0) (2026-11-05)

### Новое

* **biome:** добавлены плагины GritQL безопасности Node уровнем info ([2f8e49d](https://github.com/Pavelsiba/quality-js/commit/2f8e49d718c953d77eded7606f1b414f368515f8))

## [2.0.0](https://github.com/Pavelsiba/quality-js/compare/v1.0.2...v2.0.0) (2026-11-05)

### ⚠ BREAKING CHANGES

* удалены папка markdownlint/ и экспорт @pavelsiba/quality-js/markdownlint.
Проектам, которые наследуют markdownlint/.markdownlint.jsonc через node_modules, нужен
собственный конфиг (в пакете он состоял из одной настройки MD013: false).

### Новое

* markdownlint-cli2 убран из зависимостей и CI, конфиг markdownlint из пакета удалён ([2708323](https://github.com/Pavelsiba/quality-js/commit/27083230ca01c7cb8b74a1980800ae13b14a9cfb))

## [1.0.2](https://github.com/Pavelsiba/quality-js/compare/v1.0.1...v1.0.2) (2026-11-04)

### Исправления

* **biome:** отключено useValidTestTitle — ложно срабатывает на локальную функцию describe() ([20c5c02](https://github.com/Pavelsiba/quality-js/commit/20c5c02bafa6a085713240253994e3e5e2b7be12))

## [1.0.1](https://github.com/Pavelsiba/quality-js/compare/v1.0.0...v1.0.1) (2026-11-04)

### Исправления

* **release:** пакет публикуется на npmjs.org, у commitlint есть типы ([46a7fc0](https://github.com/Pavelsiba/quality-js/commit/46a7fc0b157a8f22931c263cf70eafc8f6936344))

## 1.0.0 (2026-11-04)

### Новое

* **release:** релизы через semantic-release — версия, CHANGELOG, тег и публикация из CI ([bf0d960](https://github.com/Pavelsiba/quality-js/commit/bf0d960dce9f5aab495c759ad4940a54ec0d10c3))
* общие конфиги quality gates для TS/JS: Biome, tsconfig, commitlint ([d960eb2](https://github.com/Pavelsiba/quality-js/commit/d960eb23abe14974cc30d40b0f0f4cc6b9065c59))
