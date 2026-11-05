# @pavelsiba/quality-js

Общий стандарт качества кода для TS/JS-проектов: готовые конфиги Biome, TypeScript и commitlint в
одном пакете. Проект не копирует настройки к себе, а наследует их через `extends`; правка стандарта
доезжает до всех проектов обновлением версии пакета.

## Зачем

- **Один стандарт на все проекты.** Стиль, строгость TypeScript, правила линтера и формат коммитов
  описаны один раз. Новый проект подключает пять строк конфига вместо копирования настроек из
  соседнего репозитория.
- **Правки приходят обновлением версии.** Улучшили правило или добавили проверку: проекты получают
  это с очередным `npm update`, без ручного переноса по репозиториям.
- **Новые правила не ломают сборку.** Правило, добавленное в минорной версии, работает уровнем
  `info`: оно видно в отчёте, но не блокирует коммиты и CI. Уровнем `error` правила приходят только в
  мажорной версии.
- **Аналог `eslint-plugin-sonarjs` для Biome.** Biome не запускает ESLint-плагины. Часть правил
  sonarjs у него есть встроенными (они включены в `base`), часть пакет добавляет плагинами GritQL.
  Правила, которым нужны типы TS, не берутся.

## Что внутри

Части независимы: подключайте только нужные. Пакет ничего не ставит сам, все инструменты — опциональные
peer-зависимости, их проект ставит рядом (см. «Установка»).

| Часть       | Подключение                                                                          | Что даёт                                                                               |
| ----------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Biome       | `biome.json`: `"extends": ["@pavelsiba/quality-js/configs/base"]`                    | Формат, линтер, сортировка импортов, встроенные аналоги sonarjs и плагины безопасности |
| Biome React | `… "@pavelsiba/quality-js/configs/react"` — после `base`                             | Правила хуков React                                                                    |
| TypeScript  | `tsconfig.json`: `"extends": "@pavelsiba/quality-js/tsconfig/node.json"`             | Строгая проверка типов для Node: NodeNext, ES2023                                      |
| TypeScript  | `… "@pavelsiba/quality-js/tsconfig/bundler.json"`                                    | То же для фронтенда: bundler, DOM, react-jsx                                           |
| commitlint  | `commitlint.config.js`: `export { default } from "@pavelsiba/quality-js/commitlint"` | Conventional Commits, описание коммита по-русски                                       |

### Biome: `configs/base`

- **Формат:** 2 пробела, строка до 120 символов, двойные кавычки, без `;` и висячих запятых.
- **Правила:** `recommended` плюс правила Biome, закрывающие sonarjs: когнитивная сложность не выше 15,
  функция не длиннее 80 строк (в `*.test.*` и `*.spec.*` — без лимита), `type` вместо `interface`,
  запрет `any`, вложенных тернарников, `var`, `for…in`, пропущенных и сфокусированных тестов,
  протокол `node:` в импортах.
- **Плагины GritQL** (ниже): очевидные уязвимости Node и типичные ошибки в тестах.
- **Git:** `.gitignore` проекта учитывается (`vcs.useIgnoreFile`), поэтому он должен быть в проекте.

### Biome: `configs/react`

`useHookAtTopLevel`, `useExhaustiveDependencies`, `noUnusedImports` с безопасным автофиксом,
`noUnknownAtRules`. Накладывается поверх `base`.

### TypeScript

Оба конфига расширяют `tsconfig/base.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`,
`noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`,
`allowUnreachableCode: false`, `isolatedModules`, `noEmit`. Сборку конфиг не настраивает: проект
добавляет `include`, `outDir` и всё остальное у себя.

### commitlint

Правила `@commitlint/config-conventional` плюс `subject-russian`: описание коммита должно содержать
кириллицу. Из таких сообщений semantic-release собирает `CHANGELOG.md`.

## Установка

Пакет публичный, на npmjs.org: ставится без токенов — в CI, Docker, у dependabot и в форках.
Нужен Node ≥ 22.

Сам пакет — это конфиги, поэтому ставьте его вместе с инструментами, которые будете использовать:

```bash
# сам пакет с конфигами
npm i -D @pavelsiba/quality-js

# Biome: линтер и форматтер (≥ 2.6)
npm i -D @biomejs/biome

# TypeScript (≥ 5.6); для tsconfig/node.json нужны ещё типы Node
npm i -D typescript @types/node

# commitlint
npm i -D @commitlint/cli @commitlint/config-conventional
```

Например, фронтенд-проект на Biome и TypeScript ставит
`npm i -D @pavelsiba/quality-js @biomejs/biome typescript`; commitlint и `@types/node` ему не нужны.

Минимальные версии:

- Biome ≥ 2.6: в нём встроенные аналоги sonarjs и плагины GritQL с `resolutionKind: "config"`.
- TypeScript ≥ 5.6: опция `noUncheckedSideEffectImports` в `tsconfig/base.json`. На 5.5.4
  `tsc` отвечает `Unknown compiler option`, на 5.6.3 конфиг `bundler.json` принимается. На 7.0.2
  `node.json` и `bundler.json` принимаются и ловят неиспользуемые переменные и неявный `any`.
- `@commitlint/config-conventional` ≥ 20.

Проекты автора работают на TypeScript `^5.9.3` и `^7.0.2`.

Ставит пакет в проект и приводит проект к стандарту скилл `quality-gates` из pavelsiba-skills.

## Быстрый старт

`biome.json`:

```json
{
  "extends": ["@pavelsiba/quality-js/configs/base"]
}
```

`tsconfig.json`:

```json
{
  "extends": "@pavelsiba/quality-js/tsconfig/node.json",
  "include": ["src"]
}
```

`commitlint.config.js`:

```js
export { default } from "@pavelsiba/quality-js/commitlint"
```

Проверка: `npx biome check` и `npx tsc`.

## Плагины GritQL

`base` подключает 27 плагинов, все уровнем `info`. Они смотрят на форму кода без типов, поэтому
ловят очевидные случаи, а не значения из переменных. Имя правила — в начале сообщения.

### Безопасность Node

| Плагин                          | Что ловит                                                    |
| ------------------------------- | ------------------------------------------------------------ |
| `unverified-certificate`        | `rejectUnauthorized: false`                                  |
| `unverified-hostname`           | `checkServerIdentity`, который ничего не проверяет           |
| `weak-ssl`                      | `minVersion` ниже TLS 1.2                                    |
| `hashing`                       | `createHash` с MD5 и SHA-1                                   |
| `no-weak-cipher`                | `createCipheriv` с DES, RC4 и подобными                      |
| `encryption-secure-mode`        | AES в режиме ECB или CBC (включая алиасы `aes128`, `aes256`) |
| `no-weak-keys`                  | `modulusLength` меньше 2048                                  |
| `insecure-jwt-token`            | алгоритм JWT `none`                                          |
| `cookie-no-httponly`            | `httpOnly: false`                                            |
| `insecure-cookie`               | `secure: false`                                              |
| `cors`                          | `origin: "*"`                                                |
| `xml-parser-xxe`                | `noent: true` в XML-парсере                                  |
| `file-permissions`              | `chmod` с правом записи для всех (`0o777`, `0o666`)          |
| `publicly-writable-directories` | литералы `/tmp`, `/var/tmp`, `/dev/shm`                      |
| `no-os-command-from-path`       | `exec` / `spawn` с командой без пути                         |
| `production-debug`              | `debug: true` в конфигурации                                 |

### Тесты (Vitest)

| Плагин                                 | Что ловит                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `no-same-argument-assert`              | `expect(x).toBe(x)`                                                             |
| `no-trivial-assertions`                | `expect(true).toBe(true)`                                                       |
| `vitest-mock-at-module-scope`          | `vi.mock` не на верхнем уровне модуля                                           |
| `async-test-assertions`                | `.resolves` / `.rejects` без `await`                                            |
| `assertions-in-test-cases`             | `expect` на верхнем уровне модуля, вне `it` и хуков                             |
| `no-incomplete-assertions`             | `expect(x)` без матчера или `.toBe` без вызова                                  |
| `no-empty-parameterized-test-dataset`  | `it.each([])`, `describe.each([])`                                              |
| `synchronous-suite-callback`           | `async`-колбэк у `describe`                                                     |
| `test-check-exception`                 | `toThrow()` без аргумента (`.not.toThrow()` допустим)                           |
| `prefer-specific-assertions`           | `expect(a === b).toBe(true)` вместо `toBe`, `toBeGreaterThan`, `toBeInstanceOf` |
| `no-interpolation-in-inline-snapshots` | `${}` внутри `toMatchInlineSnapshot`                                            |

Погасить одно место:

```ts
// biome-ignore lint/plugin/hashing: ключ кэша, не безопасность
const key = createHash("md5").update(path).digest("hex")
```

## Версии

Новое правило приходит в минорной версии уровнем `info`, не блокируя коммиты и CI. Уровнем `error` —
только в мажорной. `warn` для этого не годится: проекты гоняют линтер с `--error-on-warnings`, и
`warn` блокирует наравне с `error`.
Версию, `CHANGELOG.md`, тег `vX.Y.Z` и публикацию делает semantic-release в CI на пуше в `main`
по conventional commits: `feat` — минорная, `fix` — патч, `feat!` / `BREAKING CHANGE` — мажорная.
Новые правила и их уровень — в `CHANGELOG.md`.

Пакет распространяется под лицензией MIT.
