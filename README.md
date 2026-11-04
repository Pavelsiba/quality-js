# @pavelsiba/quality-js

Общие конфиги quality gates для TS/JS-проектов pavelsiba. Проект наследует их и получает правки
обновлением версии; ставит и приводит проект к стандарту скилл `quality-gates` из pavelsiba-skills.

## Установка

Пакет лежит в GitHub Packages. Один раз — реестр для scope:

```ini
# ~/.npmrc (npm) — токен с правом read:packages
@pavelsiba:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```toml
# bunfig.toml (bun)
[install.scopes]
pavelsiba = { url = "https://npm.pkg.github.com", token = "$GITHUB_TOKEN" }
```

```bash
npm i -D @pavelsiba/quality-js @biomejs/biome
```

## Что внутри

| Подключение                                                                                                                    | Что                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `biome.json`: `"extends": ["@pavelsiba/quality-js/configs/base"]`                                                              | стиль, recommended и встроенные аналоги sonarjs (Biome ≥ 2.6)   |
| `… "@pavelsiba/quality-js/configs/react"` — после `base`                                                                       | правила хуков React                                             |
| `tsconfig.json`: `"extends": "@pavelsiba/quality-js/tsconfig/node.json"`                                                       | Node: NodeNext, ES2023                                          |
| `… "@pavelsiba/quality-js/tsconfig/bundler.json"`                                                                              | фронт: bundler, DOM, react-jsx                                  |
| `commitlint.config.js`: `export { default } from "@pavelsiba/quality-js/commitlint"`                                           | conventional commits, описание по-русски                        |
| `.markdownlint-cli2.jsonc`: `"config": { "extends": "./node_modules/@pavelsiba/quality-js/markdownlint/.markdownlint.jsonc" }` | markdownlint (имя пакета в `extends` не понимает — только путь) |

## Версии

Новое правило приходит в минорной версии, не блокируя коммиты и CI: в Biome — уровнем `info`, в
ESLint — подключаемым набором `next`. Уровнем `error` — только в мажорной. `warn` для этого не
годится: проекты гоняют линтер с `--error-on-warnings` / `--max-warnings 0`.
Версию, `CHANGELOG.md`, тег `vX.Y.Z` и публикацию делает semantic-release в CI на пуше в `main`
по conventional commits: `feat` — минорная, `fix` — патч, `feat!` / `BREAKING CHANGE` — мажорная.
Новые правила и их уровень — в `CHANGELOG.md`.
