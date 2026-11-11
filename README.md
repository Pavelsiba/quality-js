# @pavelsiba/quality-js

Общий стандарт качества кода для TS/JS-проектов: готовые конфиги Biome, TypeScript и commitlint в
одном пакете. Проект не копирует настройки к себе, а наследует их через `extends`; правка стандарта
доезжает до всех проектов обновлением версии пакета.

> **Агенту:** сначала [`AGENT-GUIDE.md`](./AGENT-GUIDE.md) — что подключить, как и где ошибаются.
> С версии 2.7.1 он лежит в `node_modules/@pavelsiba/quality-js/AGENT-GUIDE.md` (в 2.7.0 и ниже файла нет).

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

| Часть                 | Подключение                                                                               | Что даёт                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Biome                 | `biome.json`: `"extends": ["@pavelsiba/quality-js/configs/base"]`                         | Формат, линтер, сортировка импортов, встроенные аналоги sonarjs и плагины безопасности |
| Biome React           | `… "@pavelsiba/quality-js/configs/react"` — после `base`                                  | Правила хуков React                                                                    |
| TypeScript            | `tsconfig.json`: `"extends": "@pavelsiba/quality-js/tsconfig/node.json"`                  | Строгая проверка типов для Node: NodeNext, ES2023                                      |
| TypeScript            | `… "@pavelsiba/quality-js/tsconfig/bundler.json"`                                         | То же для фронтенда: bundler, DOM, react-jsx                                           |
| commitlint            | `commitlint.config.js`: `export { default } from "@pavelsiba/quality-js/commitlint"`      | Conventional Commits, описание коммита по-русски                                       |
| ESLint                | `eslint.config.js`: `[...base(), ...react(), ...sonar(), ...fsd()]` из `…/eslint`         | Для проектов на ESLint: стиль, хуки React, sonarjs, границы слоёв FSD                  |
| steiger               | `steiger.config.js`: `export { default } from "@pavelsiba/quality-js/steiger"`            | Линтер архитектуры FSD с исключениями под файловый роутинг TanStack                    |
| semantic-release      | `.releaserc.json`: `"extends": "@pavelsiba/quality-js/release"`                           | Релиз по Conventional Commits: версия, `CHANGELOG.md`, тег `vX.Y.Z`, GitHub, npmjs     |
| Workflow безопасности | `uses: Pavelsiba/quality-js/.github/workflows/security.yml@<sha>`                         | gitleaks по истории, actionlint + zizmor, аудит зависимостей                           |
| Хуки lefthook         | `lefthook.yml`: `extends: [node_modules/@pavelsiba/quality-js/configs/lefthook/base.yml]` | Biome по staged-файлам, commitlint; `security.yml` — gitleaks, actionlint, zizmor      |

### Biome: `configs/base`

- **Формат:** 2 пробела, строка до 120 символов, двойные кавычки, без `;` и висячих запятых.
- **Правила:** `recommended` плюс правила Biome, закрывающие sonarjs: когнитивная сложность не выше 15,
  функция не длиннее 80 строк (оба порога — `warn`; в `*.test.*` и `*.spec.*` лимит длины снят,
  как и запрет пустых блоков), `type` вместо `interface`, запрет `any`, вложенных тернарников,
  `var`, `for…in`, пропущенных и сфокусированных тестов, протокол `node:` в импортах.
- **Плагины GritQL** (ниже): очевидные уязвимости Node и типичные ошибки в тестах.
- **Git:** `.gitignore` проекта учитывается (`vcs.useIgnoreFile`), поэтому он должен быть в проекте.
- **Отключение правил проектом.** Три правила `base` зависят от конвенций проекта; если они не
  подходят, проект выключает их в своём `biome.json` после `extends`:
  - `correctness/noUndeclaredDependencies` принимает алиас из `paths` в `tsconfig.json` за пакет:
    при алиасах без префикса (`"*": ["./src/*"]`, импорт `shared/api/…`) каждый такой импорт
    даёт `Dependency … isn't specified in package.json`. С алиасами слоёв правило выключают.
  - `style/useConsistentTypeDefinitions` требует `type` вместо `interface`; в проекте с конвенцией
    `interface IXxxProps` его выключают.

  ```json
  {
    "extends": ["@pavelsiba/quality-js/configs/base"],
    "linter": {
      "rules": {
        "correctness": { "noUndeclaredDependencies": "off" },
        "style": { "useConsistentTypeDefinitions": "off" }
      }
    }
  }
  ```

  - `complexity/noExcessiveCognitiveComplexity` завышает оценку каррированных обёрток вроде
    Redux-middleware `(store) => (next) => (action) => {…}`: три вложенные функции удорожают всё, что
    внутри. Правило выключают только для таких файлов через `overrides`, а не для проекта целиком:

  ```json
  {
    "overrides": [
      {
        "includes": ["src/**/*middleware*"],
        "linter": { "rules": { "complexity": { "noExcessiveCognitiveComplexity": "off" } } }
      }
    ]
  }
  ```

### Biome: `configs/react`

`useHookAtTopLevel`, `useExhaustiveDependencies`, `noUnusedImports` с безопасным автофиксом,
`noUnknownAtRules`. Для `*.tsx` и `*.jsx` (кроме тестов) порог длины функции — 150 строк вместо 80:
функции-компоненты часто длиннее. Накладывается поверх `base`.

### Biome: `configs/css`

Подключается отдельно, поверх `base`:
`"extends": ["@pavelsiba/quality-js/configs/base", "@pavelsiba/quality-js/configs/css"]`. Форматтер
и линтер CSS включены; CSS Modules Biome включает сам для `*.module.css`. Сверх `recommended` —
три правила уровнем `info`: `noDuplicateSelectors`, `noDescendingSpecificity`,
`noImportantStyles`. Отступы, ширину строки и кавычки CSS берёт из `base`.

### Biome: `configs/tailwind`

Только для проектов с Tailwind 4: парсер CSS понимает `@theme`, `@utility`, `@variant`, `@source`,
`@apply`. Без этого конфига такие файлы дают ошибки разбора. Подключается рядом с `css`:
`"extends": [".../configs/base", ".../configs/css", ".../configs/tailwind"]`.

### TypeScript

Оба конфига расширяют `tsconfig/base.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`,
`noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`,
`allowUnreachableCode: false`, `isolatedModules`, `noEmit`. Сборку конфиг не настраивает: проект
добавляет `include`, `outDir` и всё остальное у себя.

### commitlint

Правила `@commitlint/config-conventional` плюс `subject-russian`: описание коммита должно содержать
кириллицу. Из таких сообщений semantic-release собирает `CHANGELOG.md`.

### ESLint: `…/eslint`

Для проектов, которые остаются на ESLint (Biome не запускает ESLint-плагины). Пять фабрик, каждая
возвращает массив flat-конфигов; проект собирает нужные. Какие правила и пороги включены в ветках Biome
и ESLint и чего в ESLint-ветке нет — таблица [«Что включено по веткам»](AGENT-GUIDE.md#что-включено-по-веткам):

```js
import { base, fsd, next, react, sonar } from "@pavelsiba/quality-js/eslint"

export default [
  { ignores: [".output/**", "src/routeTree.gen.ts"] },
  ...base(),
  ...react(),
  ...next(),
  ...sonar({ typed: Boolean(process.env.CI) }),
  ...fsd({ serverLayers: { services: ["clients", "db"], clients: ["db"], db: [] } })
]
```

- **`base()`** — `typescript-eslint` recommended и стиль через `@stylistic`, те же правила, что у Biome:
  двойные кавычки, без `;` и висячих запятых, 2 пробела, `type` вместо `interface`, запрет `any`.
- **`react()`** — `react-hooks/rules-of-hooks` (`error`) и `exhaustive-deps` (`warn`).
- **`next()`** — новые правила, которых ещё нет в `base()` и `react()`; проект подключает набор сам, когда
  готов (у ESLint нет уровня `info`, а `warn` блокирует под `--max-warnings 0`). Сейчас в нём (с 2.8.0)
  `max-lines-per-function` (`warn`): аналог `noExcessiveLinesPerFunction` у Biome, 80 строк без пустых и
  комментариев, в `*.tsx` и `*.jsx` — 150 (как в `react` у Biome), в `*.test.*` и `*.spec.*` не
  проверяется. В мажорной версии правила переезжают в `base()` и `react()` уровнем `error`.
- **`sonar({ typed })`** — рекомендованные правила `eslint-plugin-sonarjs` без тех, что стандарт не
  берёт (AWS, Vue, Angular, jQuery, Lodash, Cypress, chai, правила под helmet и express, подсказки вроде
  `todo-tag`) и без закрытых `tsc`, форматтером или gitleaks. Правилам с типами TS нужен
  `typed: true`: без него они молча ничего не делают. Типы включайте в CI, не в pre-commit — они медленные.
- **`fsd({ src, serverLayers, clientFiles })`** — границы слоёв для `eslint-plugin-boundaries` v7:
  `routes → widgets → features → entities → shared` и `server`. `server` могут импортировать `routes` и
  файлы `api/` внутри `entities`, `features` и `routes` (серверные функции): секреты не попадают в
  клиентский бандл. Параметры:
  - `serverLayers` — подслои `src/server/<слой>`: кто кого может импортировать (без него `server` —
    один элемент);
  - `clientFiles` — шаблоны файлов от `src`, которым `server` запрещён даже в `api/`, например
    `["+(entities|features)/**/api/*-queries.{ts,tsx}"]` — клиентские обёртки запросов;
  - `src` — папка с исходниками, по умолчанию `src`.

  Алиасы (`@/…`) разрешает `eslint-import-resolver-typescript` по `tsconfig.json` проекта.

### steiger

Рекомендованные правила `@feature-sliced/steiger-plugin`, кроме `insignificant-slice`: steiger не знает
слоя `routes`, поэтому для него слайсы, которые потребляют роуты, выглядят неиспользуемыми. Исключены
`routeTree.gen.ts` и `server/`. Проектные исключения (например, `public-api` для папки со стилями)
проект дописывает у себя после реэкспорта.

### semantic-release: `…/release`

`.releaserc.json` проекта:

```json
{ "extends": "@pavelsiba/quality-js/release" }
```

Ветка `main`, тег `vX.Y.Z`, пресет `conventionalcommits` с разделами «Новое», «Исправления»,
«Производительность» (остальные типы в заметки не попадают), `CHANGELOG.md`, релизный коммит
`chore(release): X.Y.Z [skip ci]`, релиз на GitHub, публикация на npmjs. Проект, который не публикуется
на npmjs, строит конфиг фабрикой в `release.config.js`:

```js
import { release } from "@pavelsiba/quality-js/release"

export default release({ npmPublish: false })
```

Плагины `@semantic-release/changelog`, `@semantic-release/git` и пресет
`conventional-changelog-conventionalcommits` проект ставит сам, как и `semantic-release` ≥ 25.

### Workflow безопасности

`.github/workflows/security.yml` — переиспользуемый workflow (`workflow_call`) с тремя джобами:

- `secrets` — gitleaks по всей истории, находки скрыты (`--redact`);
- `workflows` — actionlint и zizmor по `.github` проекта;
- `audit` — `npm audit --omit=dev`; для проекта не на npm — вход `audit: false`.

Версии сканеров закреплены и сверяются по sha256 ассета релиза. Подключение:

```yaml
jobs:
  security:
    permissions:
      contents: read
    uses: Pavelsiba/quality-js/.github/workflows/security.yml@<sha> # vX.Y.Z
    with:
      audit: true
```

Ссылку на `<sha>` обновляет Dependabot (`github-actions`).

### Хуки lefthook

Два файла в `configs/lefthook/`; подключаются через `extends` в `lefthook.yml` проекта. lefthook не
читает `exports`, поэтому путь физический, от корня проекта:

```yaml
extends:
  - node_modules/@pavelsiba/quality-js/configs/lefthook/base.yml
  - node_modules/@pavelsiba/quality-js/configs/lefthook/security.yml # по желанию

pre-commit:
  jobs:
    - name: typecheck # свои джобы — рядом, под другими именами
      glob: "*.ts"
      run: npm run typecheck
```

- `base.yml` — без цветов и баннеров; `pre-commit`: `biome check --write --error-on-warnings` по
  staged-файлам с авто-добавлением правок; `commit-msg`: `commitlint --edit` (нужны `@biomejs/biome`,
  `@commitlint/cli` и `commitlint.config.js` проекта).
- `security.yml` — `pre-commit`: `gitleaks git --pre-commit --staged --redact` и
  `actionlint && zizmor` по `.github/**`. Это те же сканеры, что в workflow выше, но бинарники
  gitleaks, actionlint и zizmor проект ставит в систему сам (winget, brew), поэтому файл отдельный.
  Версии держите теми же, что в `env` `security.yml`.
- Джоб с именем из этих файлов (`biome`, `commitlint`, `secrets`, `workflows`) проект не
  переопределяет: при совпадении имён побеждает `extends` (проверено на lefthook 2.2.2). Нужен другой
  `biome` — не подключайте `base.yml`.
- Typecheck, тесты, knip и markdownlint в общий файл не входят: набор зависит от проекта.

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

# ESLint: ставьте только то, что подключаете из фабрик
npm i -D eslint typescript-eslint @stylistic/eslint-plugin           # base()
npm i -D eslint-plugin-react-hooks                                    # react()
npm i -D eslint-plugin-sonarjs                                        # sonar()
npm i -D eslint-plugin-boundaries eslint-import-resolver-typescript   # fsd()

# steiger
npm i -D steiger @feature-sliced/steiger-plugin

# semantic-release
npm i -D semantic-release @semantic-release/changelog @semantic-release/git conventional-changelog-conventionalcommits@9
```

Пресет `conventional-changelog-conventionalcommits` — версии 9: пресет 10 требует
`conventional-changelog-writer` 9, а актуальный `@semantic-release/release-notes-generator` 14 берёт
writer 8, и релиз падает на заметках. Диапазон расширится, когда генератор в `latest` получит writer 9.

Например, фронтенд-проект на Biome и TypeScript ставит
`npm i -D @pavelsiba/quality-js @biomejs/biome typescript`; commitlint и `@types/node` ему не нужны.

Минимальные версии:

- Biome ≥ 2.6: в нём встроенные аналоги sonarjs и плагины GritQL с `resolutionKind: "config"`.
- TypeScript ≥ 5.6: опция `noUncheckedSideEffectImports` в `tsconfig/base.json`. На 5.5.4
  `tsc` отвечает `Unknown compiler option`, на 5.6.3 конфиг `bundler.json` принимается. На 7.0.2
  `node.json` и `bundler.json` принимаются и ловят неиспользуемые переменные и неявный `any`.
- `@commitlint/config-conventional` ≥ 20.
- ESLint, steiger и их плагины: прогон проходил на ESLint 10.14, `typescript-eslint` 8.72,
  `eslint-plugin-boundaries` 7.4, `eslint-plugin-sonarjs` 4.2, `eslint-plugin-react-hooks` 7.1,
  `steiger` 0.9 и `@feature-sliced/steiger-plugin` 0.8. Нижние границы в `peerDependencies`
  (ESLint ≥ 9, boundaries ≥ 7, steiger ≥ 0.5.13) взяты из версий в проектах автора, на них отдельного
  прогона не было.

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

`base` подключает 29 плагинов, все уровнем `info`. Они смотрят на форму кода без типов, поэтому
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

### Регулярки (ReDoS)

Эвристика по тексту литерала `/…/`, а не анализ автомата: ловит типовые схемы, не все уязвимые
регулярки. `new RegExp("…")` не проверяется. В проверках тестов (`toThrow(/…/)`, `toMatch(/…/)`) не срабатывает.

| Плагин               | Что ловит                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `slow-regex`         | экспоненциальный возврат: `(a+)+`, `([a-z]+\s*)*`, `(a\|b+)*`; разделитель `(?:-[a-z]+)*` ок |
| `super-linear-regex` | квадратичный возврат: `\s*\s*`, `\d+\w+`, `.*.*`, `.*a.*b` без якоря `^`                     |

Погасить одно место:

```ts
// biome-ignore lint/plugin/hashing: ключ кэша, не безопасность
const key = createHash("md5").update(path).digest("hex")
```

## Версии

Новое правило приходит в минорной версии уровнем `info`, не блокируя коммиты и CI. Уровнем `error` —
только в мажорной. `warn` для этого не годится: проекты гоняют линтер с `--error-on-warnings`, и
`warn` блокирует наравне с `error`. У ESLint уровня `info` нет: правила фабрик первого выпуска пришли
сразу `error`, а новые приходят набором `next()` (уровень `warn`), который проект включает сам; в
мажорной версии они переезжают в `base()` / `react()` уровнем `error`.
Версию, `CHANGELOG.md`, тег `vX.Y.Z` и публикацию делает semantic-release в CI на пуше в `main`
по conventional commits: `feat` — минорная, `fix` — патч, `feat!` / `BREAKING CHANGE` — мажорная.
Новые правила и их уровень — в `CHANGELOG.md`.

После обновления пакета прогоните `lint:fix` и закоммитьте результат отдельным коммитом: автофиксы
новых и ужесточённых правил (например, флаг `u` у регулярных выражений от `useUnicodeRegex`) правят
много файлов, и в общий коммит они не должны попадать.

Пакет распространяется под лицензией MIT.
