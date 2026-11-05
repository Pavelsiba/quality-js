# @pavelsiba/quality-js

Общие конфиги quality gates для TS/JS-проектов pavelsiba. Проект наследует их и получает правки
обновлением версии; ставит и приводит проект к стандарту скилл `quality-gates` из pavelsiba-skills.

## Установка

Пакет публичный, на npmjs.org: ставится без токенов — в CI, Docker, у dependabot и в форках.

```bash
npm i -D @pavelsiba/quality-js @biomejs/biome
```

## Что внутри

| Подключение                                                                          | Что                                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `biome.json`: `"extends": ["@pavelsiba/quality-js/configs/base"]`                    | стиль, recommended и встроенные аналоги sonarjs (Biome ≥ 2.6) |
| `… "@pavelsiba/quality-js/configs/react"` — после `base`                             | правила хуков React                                           |
| `tsconfig.json`: `"extends": "@pavelsiba/quality-js/tsconfig/node.json"`             | Node: NodeNext, ES2023                                        |
| `… "@pavelsiba/quality-js/tsconfig/bundler.json"`                                    | фронт: bundler, DOM, react-jsx                                |
| `commitlint.config.js`: `export { default } from "@pavelsiba/quality-js/commitlint"` | conventional commits, описание по-русски                      |

## Плагины GritQL

`base` подключает плагины безопасности Node, все уровнем `info`: `unverified-certificate`
(`rejectUnauthorized: false`), `hashing` (`createHash` с MD5 и SHA-1), `no-weak-cipher`
(`createCipheriv` с DES, RC4 и подобными), `weak-ssl` (`minVersion` ниже TLS 1.2),
`insecure-jwt-token` (алгоритм `none`), `cookie-no-httponly`, `insecure-cookie` и `cors`
(`origin: "*"`). Плагины смотрят на форму кода без типов, поэтому ловят очевидные случаи, а не
значения из переменных. Имя правила — в начале сообщения; погасить одно место:

```ts
// biome-ignore lint/plugin/hashing: ключ кэша, не безопасность
const key = createHash("md5").update(path).digest("hex")
```

## Версии

Новое правило приходит в минорной версии, не блокируя коммиты и CI: в Biome — уровнем `info`, в
ESLint — подключаемым набором `next`. Уровнем `error` — только в мажорной. `warn` для этого не
годится: проекты гоняют линтер с `--error-on-warnings` / `--max-warnings 0`.
Версию, `CHANGELOG.md`, тег `vX.Y.Z` и публикацию делает semantic-release в CI на пуше в `main`
по conventional commits: `feat` — минорная, `fix` — патч, `feat!` / `BREAKING CHANGE` — мажорная.
Новые правила и их уровень — в `CHANGELOG.md`.
