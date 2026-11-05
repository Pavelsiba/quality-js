# Changelog

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
