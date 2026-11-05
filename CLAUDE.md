# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Что это

`@pavelsiba/quality-js` — пакет общих конфигов quality gates (Biome, tsconfig, commitlint)
для TS/JS-проектов pavelsiba. Кода, кроме `configs/commitlint/index.js`, нет: продукт — сами
конфиги. Проекты подключают их через `extends` и получают правки обновлением версии; ставит пакет в
проекты скилл `quality-gates` из pavelsiba-skills (таблица sonarjs → Biome —
`D:/Obsidian/pavelsiba-skills/quality-gates/sonarjs-biome.md`).

## Заметки проекта

Хранилище Obsidian — `D:/Obsidian/quality-js/`: журнал разработки — `devlog/ГГГГ-ММ-ДД.md`, один
файл на день; ретро — `retro/`. План и решения по составу стандарта — `D:/Obsidian/pavelsiba-skills/quality-gates/package.md`.

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
  прежние имена.
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
  (`JsStringLiteralExpression()`); обратных слэшей в регулярках избегай (`[.]` вместо `\.`).
  Состав выбирает пользователь по примерам с эталонов (yd-mcp, more-shop, autopartsAI). Плагины
  безопасности вошли по таблице sonarjs, находок на эталонах у них нет. `no-clear-text-protocols`
  проверен и убран: 6 срабатываний, все ложные (база для `new URL(…, "http://…")`,
  `startsWith("http://")`, генерируемый `paraglide/runtime.js`).
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
