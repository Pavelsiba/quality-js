# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

`@pavelsiba/quality-js` — пакет общих конфигов quality gates (Biome, ESLint, steiger, tsconfig,
commitlint) для TS/JS-проектов pavelsiba. Кода, кроме `configs/commitlint/index.js` и фабрик
`configs/eslint/*.js`, нет: продукт — сами конфиги. Проекты подключают их через `extends` и получают правки обновлением версии; ставит пакет в
проекты скилл `quality-gates` из pavelsiba-skills (таблица sonarjs → Biome —
`D:/Obsidian/pavelsiba-skills/quality-gates/sonarjs-biome.md`).

`AGENT-GUIDE.md` (в `files` пакета) — памятка агенту-потребителю: что подключить, рецепт, нюансы.
Назван не `AGENTS.md`: агенты, работающие в этом репозитории, читают `AGENTS.md` как инструкцию к
разработке, а там потребительская. Меняется конфиг или нюанс подключения — правится и он, и README.

## Заметки проекта

Хранилище Obsidian — `D:/Obsidian/quality-js/`: **роадмап — `roadmap.md`** (что осталось; на вопрос
о задачах читать его, в конце сессии обновлять: сделанное вычеркнуть, новое и решения добавить),
журнал разработки — `devlog/ГГГГ-ММ-ДД.md`, один файл на день; ретро — `retro/`. План и решения по составу стандарта — `D:/Obsidian/pavelsiba-skills/quality-gates/package.md`.

## Команды

```bash
npm run lint       # biome check (репозиторий линтится собственным configs/biome/base.jsonc)
npm run lint:md    # markdownlint-cli2 через npx (версия закреплена в скрипте, в зависимостях его нет), конфиг — `.markdownlint-cli2.jsonc`
npm test           # node --test "test/*.test.js"
node --test --test-name-pattern="хук под условием" test/biome.test.js   # один тест
```

Lefthook (`npm install` ставит хуки): pre-commit — `biome check --write` по staged-файлам,
markdownlint (только в хуке: ни в зависимостях, ни в CI его нет), а при правке `configs/**`,
`biome-manifest.json`, `package.json`, `test/**` — тесты; commit-msg — commitlint из
`configs/commitlint/index.js`.

## Как устроено

- **Все конфиги лежат в `configs/`** (`biome/`, `tsconfig/`, `commitlint/`), а публичные пути проектов
  задают `exports` и манифест: `@pavelsiba/quality-js/tsconfig/node.json`, `…/commitlint`,
  `…/configs/base`. Переезд файла внутри `configs/` не ломает потребителей, пока `exports` отдаёт
  прежние имена. Исключение — `biome-manifest.json`: он лежит в корне пакета, потому что Biome
  ищет манифест только там и только под этим именем (`biome-manifest.json` или `.jsonc`), а
  `exports["."].biome` на него лишь указывает. Перенос в `configs/` пробовали 2026-11-05: тесты 0 из 3,
  ошибка `Package … must provide biome-manifest.json`.
- **Biome-конфиги подключаются через манифест.** `package.json` → `exports["."].biome` указывает на
  `biome-manifest.json`, который отображает имена `base` / `react` на файлы в `configs/biome/`.
  Поэтому проект пишет `"extends": ["@pavelsiba/quality-js/configs/base"]`. Новый Biome-конфиг —
  это файл в `configs/biome/` **плюс** запись в манифесте; `react` накладывается поверх `base`.
- **Тесты смотрят глазами потребителя.** `test/biome.test.js` создаёт во временной папке проект,
  кладёт в его `node_modules` ссылку (junction) на этот репозиторий, пишет `biome.json` с `extends`
  через манифест и гоняет `biome lint --reporter=json` по фикстурам из `test/fixtures/<конфиг>/`
  (`bad.*` должен дать нужные категории диагностик, `clean.ts` — ни одной). Фикстуры исключены из
  линта репозитория в `biome.json`. `.gitignore` во временном проекте нужен из-за
  `vcs.useIgnoreFile` в `base`.
- **Плагины GritQL** лежат в `configs/biome/plugins/<имя>.grit` и подключены в `plugins` файла
  `base.jsonc` с `resolutionKind: "config"` (путь от конфига, не от проекта). Новый плагин — это
  `.grit` с `severity = "info"`, запись в `base.jsonc` и фикстура `test/fixtures/plugins/<имя>.ts`
  (строки с `// ловит` плагин обязан поймать, остальные пропустить; тест требует фикстуру на каждый
  `.grit`). Сообщение начинается с имени и двоеточия (`<имя>:`): в отчёте категория у всех плагинов просто `plugin`, а
  гасится правило как `// biome-ignore lint/plugin/<имя>: причина`. Подвохи Grit в Biome 2.6:
  `r"…"` сопоставляется с текстом узла **целиком** (нужны `^…$` или `.*` по краям); обычные скобки
  в регулярке — это захват в переменные и ломают совпадение, пиши `(?:…)`; имена узлов в PascalCase
  (`JsStringLiteralExpression()`); обратных слэшей в регулярках избегай (`[.]` вместо `\.`);
  `contains` на `JsExpressionStatement` срабатывает и на внешние операторы (`it(…, () => { … })`
  содержит всё тело) — проверяй `callee`, а не весь оператор; фикстура плагина не должна попадать под
  другой плагин (тест требует префикс своего имени у всех диагностик файла). Файлы `.grit` Biome
  форматирует сам (длинный `or { … }` в одну строку не пройдёт `npm run lint`): после правки —
  `npx biome check --write`.
  Состав выбирает пользователь по примерам с эталонов (yd-mcp, more-shop, autopartsAI). Плагины
  безопасности и тестов вошли по таблице sonarjs, находок на эталонах у них нет (кроме
  `test-check-exception`: 4 настоящих `toThrow()` без аргумента; `.not.toThrow()` плагин пропускает —
  на нём было 16 ложных срабатываний). `no-clear-text-protocols`
  проверен и убран: 6 срабатываний, все ложные (база для `new URL(…, "http://…")`,
  `startsWith("http://")`, генерируемый `paraglide/runtime.js`). `no-hardcoded-ip` проверен и убран:
  9 срабатываний, все ложные (тестовые IP `10.0.0.1`, `203.0.113.1`, `1.1.1.1` в `*.test.ts`).
  Проверка нового плагина на эталонах — только чтение: скопировать их `*.ts(x)` (`src`, `test`, `tests`,
  `server`, `app`, без `node_modules`) в scratchpad, положить `biome.json` с `extends` и junction на
  репозиторий, как в `makeProject` из `test/biome.test.js`, и отфильтровать диагностики `plugin` по
  префиксу имени. Эталоны остаются нетронутыми.
- **ESLint и steiger** (`configs/eslint/`, `configs/steiger/`; экспорты `…/eslint`, `…/steiger`): для
  проектов, которые остаются на ESLint. Фабрики `base()`, `react()`, `sonar({ typed })`,
  `fsd({ src, serverLayers, clientFiles })`, `next()` возвращают массивы flat-конфигов; типы — `index.d.ts`
  рядом. Все плагины — опциональные peer-зависимости. Новое правило ESLint-ветки в минорной версии
  идёт в `next()` (`configs/eslint/next.js`, `warn`), не в `base()` / `react()`: у ESLint нет `info`, а `warn`
  блокирует под `--max-warnings 0`; в мажорной переезжает в `base()` уровнем `error`. Таблица «Что
  включено по веткам» в `AGENT-GUIDE.md` сверяется с конфигами `test/guide.test.js`: правишь порог или
  уровень — правь таблицу. `test/eslint.test.js` гоняет настоящие eslint и
  steiger во временном проекте по фикстурам `test/fixtures/eslint/<имя>/` (в `fsd`-фикстурах строки
  `// ловит` — места нарушений границ); в проект подкладывается junction на
  `eslint-import-resolver-typescript`, в потребителе он стоит рядом с eslint. Подвохи:
  - `sonar()` — рекомендованные правила sonarjs (в 4.2.2: 230 `error`, 65 `off`) минус списки
    исключений в `sonar.js`, снятые с таблицы `sonarjs-biome.md` («Не берём» без типов и «Покрыто другим
    инструментом»). Правила с типами без `projectService` не падают, а молча ничего не делают: отдельного
    списка таких правил не нужно, а `meta.docs.requiresTypeChecking` врёт (помечены и regex-правила).
  - boundaries v7: шаблон файла (`boundaries/files`) не понимает отрицание `!(…)` — исключение файлов
    делается категорией и запрещающей политикой (`disallow` перебивает `allow`, категории файла
    складываются). `captured: { layer: "{a}" }` из одного элемента скобки не раскрывает — одно
    значение пишется как есть, несколько — отдельными `allow`.
  - Политики и категории взяты с more-shop и autopartsAI, прогон `fsd()` по копиям их `src` даёт 0
    нарушений (more-shop без `clientFiles`: их `*-queries.ts` законно импортируют серверные функции
    из `@/server`; autopartsAI с `clientFiles` и `serverLayers`).
- **`release`** (`configs/release/index.js`, экспорт `…/release`): конфиг semantic-release — по умолчанию
  экспорт и именованная фабрика `release({ npmPublish, assets })`. Репозиторий сам берёт его в
  `.releaserc.json` через `extends: "./configs/release/index.js"`. Плагины шареного конфига
  semantic-release ищет от папки конфига, поэтому они и пресет — необязательные peer-зависимости
  (в проекте они стоят рядом с `semantic-release`). `test/release.test.js` проверяет экспорт, форму и
  разрешение плагинов без сети: настоящий `semantic-release --dry-run` требует токен GitHub (проба
  2026-11-05 дошла до `verifyConditions` у `@semantic-release/github` и упала на фиктивном токене).
- **Хуки lefthook** (`configs/lefthook/base.yml` — biome и commitlint, `security.yml` — gitleaks,
  actionlint, zizmor): проект подключает через `extends: [node_modules/@pavelsiba/quality-js/configs/lefthook/…]`
  (lefthook не читает `exports`, путь физический). Джоб с общим именем проект не перекрывает: при
  совпадении имён побеждает `extends` (lefthook 2.2.2, проверено `test/lefthook.test.js`). Репозиторий
  сам на них не переведён: его `lefthook.yml` содержит тот же biome, но с `markdown` и `test`.
- **Переиспользуемый workflow** `.github/workflows/security.yml` (`workflow_call`, вход `audit`): gitleaks,
  actionlint + zizmor, `npm audit --omit=dev`; сканеры запускаются напрямую, скрипты проекта не нужны.
  Не входит в `files` пакета: проект зовёт его `uses: Pavelsiba/quality-js/.github/workflows/security.yml@<sha>`.
  Сам репозиторий зовёт тот же файл через `./.github/workflows/security.yml` в `ci.yml`, и релиз ждёт
  его (`needs: [check, security]`). Версии сканеров и sha256 — в `env` файла; обновлять вместе с
  локальными (winget), иначе находки расходятся. Публичный проект (yd-mcp) не вызвал бы
  его из приватного `quality-js` — это предположение по документации GitHub, не проверено; поэтому
  репозиторий публичный (сменено 2026-11-05).
- **tsconfig:** `base.json` — строгие флаги и `noEmit`; `node.json` (NodeNext) и `bundler.json`
  (bundler, DOM, react-jsx) расширяют его.

## Версии и правила

- Коммит и пуш — через `/pavelsiba:git-workflow`. Пуш `fix` / `feat` в `main` публикует релиз на
  npmjs.org, поэтому пользователю называется версия (последний тег + бамп по типам коммитов) до пуша.
- Новое правило в минорной версии — уровнем `info` (не `warn`: проекты гоняют линтер с
  `--error-on-warnings`); `error` — только в мажорной. `warn` в `base.jsonc` оставлен для nursery и
  пороговых правил.
- Версию, `CHANGELOG.md`, тег `vX.Y.Z` и публикацию на npmjs.org делает semantic-release в CI
  на пуше в `main` (`.releaserc.json`). `version` в `package.json` и теги руками не трогать; тип
  коммита определяет бамп: `feat` — минор, `fix` — патч, `feat!` / `BREAKING CHANGE` — мажор.
- Коммиты — Conventional Commits, описание обязательно по-русски (правило `subject-russian`).
- Пакет требует Node ≥ 22, Biome ≥ 2.6 (встроенные аналоги sonarjs появились там).
