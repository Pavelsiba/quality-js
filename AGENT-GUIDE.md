# Руководство для агента: подключение @pavelsiba/quality-js

Файл для агента, который подключает пакет к проекту. Человеку — `README.md`. Здесь: что это, что
выбрать под проект, как подключить, где ошибаются, как проверить.

## Что это

Пакет — **только конфиги** quality gates для TS/JS-проектов: Biome, TypeScript, commitlint, ESLint
(фабрики), steiger, semantic-release, хуки lefthook, workflow безопасности. Кода для рантайма нет.
Проект наследует конфиги через `extends`, правки стандарта приходят обновлением версии.

Пакет **ничего не ставит сам**: все инструменты (`@biomejs/biome`, `typescript`, `@commitlint/cli`,
`semantic-release`…) — опциональные peer-зависимости, их ставит проект рядом. Node ≥ 22.

Если у пользователя установлен набор скиллов pavelsiba (`pavelsiba-skills`), скилл `quality-gates`
проходит эти шаги по осям и ставит пакет сам; сам он не запускается — предложите пользователю
`/quality-gates` вместо ручной настройки. Нет набора — действуйте по этому файлу.

## Что подключить

| Если в проекте…                       | Подключить                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| любой TS/JS-код                       | Biome `configs/base`                                                                   |
| React                                 | Biome `configs/react` — после `base`                                                   |
| CSS                                   | Biome `configs/css` — после `base`                                                     |
| Tailwind 4 (`@theme`, `@apply`…)      | Biome `configs/tailwind` — после `css`; без него файлы дают ошибки разбора             |
| TypeScript для Node                   | `tsconfig/node.json`                                                                   |
| TypeScript для фронтенда (бандлер)    | `tsconfig/bundler.json`                                                                |
| Conventional Commits на русском       | `commitlint`                                                                           |
| релизы по коммитам (semantic-release) | `.releaserc.json`: `release`                                                           |
| git-хуки (lefthook)                   | `configs/lefthook/base.yml`, при желании `security.yml`                                |
| GitHub Actions                        | переиспользуемый `security.yml` (gitleaks, actionlint, zizmor, `npm audit`)            |
| проект остаётся на ESLint             | фабрики `…/eslint`: `base()`, `react()`, `sonar()`, `fsd()`; архитектура — `…/steiger` |

ESLint-фабрики нужны проектам, которые остаются на ESLint: Biome не запускает ESLint-плагины.
Остальным — Biome.

## Подключение: Node/TS-проект на Biome

```bash
npm i -D @pavelsiba/quality-js @biomejs/biome typescript @types/node
npm i -D @commitlint/cli @commitlint/config-conventional   # если нужен commitlint
```

`biome.json`:

```json
{ "extends": ["@pavelsiba/quality-js/configs/base"] }
```

`tsconfig.json` (сборку конфиг не настраивает: `include`, `outDir` — у проекта):

```json
{ "extends": "@pavelsiba/quality-js/tsconfig/node.json", "include": ["src"] }
```

`commitlint.config.js`:

```js
export { default } from "@pavelsiba/quality-js/commitlint"
```

`.releaserc.json`: `{ "extends": "@pavelsiba/quality-js/release" }`. Проект, который не публикуется на
npmjs, строит конфиг фабрикой: `release({ npmPublish: false })` в `release.config.js`.

Хуки, `lefthook.yml` (lefthook не читает `exports` — путь физический, от корня проекта):

```yaml
extends:
  - node_modules/@pavelsiba/quality-js/configs/lefthook/base.yml
  - node_modules/@pavelsiba/quality-js/configs/lefthook/security.yml # нужны gitleaks, actionlint, zizmor в системе
```

Workflow безопасности — в `ci.yml`:

```yaml
security:
  permissions:
    contents: read
  uses: Pavelsiba/quality-js/.github/workflows/security.yml@<sha> # vX.Y.Z
  with:
    audit: true # false для проекта не на npm
```

## Нюансы, на которых ошибаются

### Biome

- Нужен Biome ≥ 2.6. `extends` идёт по имени через манифест пакета
  (`@pavelsiba/quality-js/configs/base`), а не по пути к файлу в `node_modules`.
- В проекте обязателен `.gitignore`: `base` включает `vcs.useIgnoreFile`.
- Новые правила приходят уровнем **`info`**, `error` — только в мажорной версии. Линтер гоняйте с
  `--error-on-warnings`: `warn` блокирует наравне с `error`, поэтому он оставлен лишь для порогов
  (сложность ≤ 15, функция ≤ 80 строк) и nursery.
- Плагины GritQL (27 штук, безопасность Node и тесты Vitest) тоже `info`. Имя правила — в начале
  сообщения; гасится так: `// biome-ignore lint/plugin/<имя>: причина`.
- Три правила зависят от конвенций проекта и выключаются в `biome.json` **после** `extends`:
  `correctness/noUndeclaredDependencies` (алиасы без префикса: `shared/api/…`),
  `style/useConsistentTypeDefinitions` (конвенция `interface IXxx`) и
  `complexity/noExcessiveCognitiveComplexity` для каррированных обёрток вроде middleware — только
  через `overrides` на нужные файлы, не для проекта целиком.
- После обновления пакета выполните `npx biome check --write` и закоммитьте результат **отдельным
  коммитом**: автофиксы новых правил правят много файлов.

### TypeScript и commitlint

- TypeScript ≥ 5.6 (на 5.5 `tsc` отвечает `Unknown compiler option`).
- `commitlint`: описание коммита обязано содержать кириллицу (правило `subject-russian`). Коммит
  `feat: add cache` не пройдёт — `feat: добавлен кэш` пройдёт.

### semantic-release

- Версию в `package.json`, тег `vX.Y.Z` и `CHANGELOG.md` ведёт CI на пуше в `main`: руками не трогать.
  Тип коммита задаёт бамп: `feat` — минор, `fix` — патч, `feat!` или `BREAKING CHANGE` — мажор.
- Пресет `conventional-changelog-conventionalcommits` ставить **версии 9** (`@9`): с 10 релиз
  падает на заметках. Плагины `@semantic-release/changelog`, `@semantic-release/git` и
  `semantic-release` ≥ 25 проект ставит сам.

### lefthook

- Джоб с именем из общих файлов (`biome`, `commitlint`, `secrets`, `workflows`) проект не
  переопределяет: при совпадении имён побеждает `extends`. Свои джобы — под другими именами.
- `security.yml` без `gitleaks`, `actionlint`, `zizmor` в системе (winget, brew) падает на каждом
  коммите. Версии держите теми же, что в `env` workflow `security.yml`.

### ESLint

- `sonar({ typed })`: правилам с типами нужен `typed: true`, иначе они **молча ничего не делают**.
  Включайте в CI, не в pre-commit: медленно.

## Чего в пакете нет

Typecheck-скрипт, тесты, `knip`, markdownlint и сам `ci.yml` проекта — набор зависит от проекта,
в общий пакет они не входят. Не ищите их в `configs/`.

## Как проверить, что подключено верно

```bash
npx biome check --error-on-warnings      # Biome видит конфиг и не падает на разборе
npx tsc --noEmit                         # tsconfig принят
echo "feat: add cache" | npx commitlint  # должен упасть: нет кириллицы
npx lefthook dump                        # видны джобы из extends
```

Если `extends` не разрешился, проверьте версию Biome (≥ 2.6) и что пакет стоит в `node_modules`
(`npm ls @pavelsiba/quality-js`).

## Где подробности

`README.md` — все части, пороги правил, список плагинов; `CHANGELOG.md` — новые правила по версиям.
