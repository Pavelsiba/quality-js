// Границы слоёв FSD для eslint-plugin-boundaries v7. Слои — routes → widgets → features → entities → shared
// (routes — файловый роутинг TanStack: для steiger он невидим, для границ — верхний слой).
// `server` — серверная инфраструктура вне FSD (БД, письма, внешние API); импортировать его можно только
// из routes и из файлов сегмента `api/` слайса (серверные функции, категория `api-server`): секреты не должны
// попадать в клиентский бандл.
import boundaries from "eslint-plugin-boundaries"

const types = (...names) => ({ element: { types: { anyOf: names } } })
const allowTo = (from, ...names) => ({ from: { element: { type: from } }, allow: { to: types(...names) } })

// serverLayers: { services: ["clients", "data"], clients: ["data"], data: [] } — кто из подслоёв `src/server/<слой>`
// кого может импортировать. Импорт внутри своего подслоя разрешён всегда; entities и shared доступны всем.
const serverPolicies = (serverLayers) =>
  Object.entries(serverLayers).map(([layer, below]) => ({
    from: { element: { type: "server", captured: { layer } } },
    allow: [
      { to: { element: { types: { anyOf: ["entities", "shared"] } } } },
      ...below.map((lower) => ({ to: { element: { type: "server", captured: { layer: lower } } } }))
    ]
  }))

/**
 * @param {{ src?: string, serverLayers?: Record<string, string[]>, clientFiles?: string[] }} [options]
 * @returns {import("eslint").Linter.Config[]}
 */
export const fsd = ({ src = "src", serverLayers, clientFiles = [] } = {}) => [
  {
    files: [`${src}/**/*.{ts,tsx}`],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { project: "tsconfig.json" } },
      "boundaries/include": [`${src}/**/*`],
      "boundaries/files": [
        { category: "api-server", pattern: [`${src}/+(entities|features|routes)/**/api/*.{ts,tsx}`] },
        // Шаблон файла плагин читает без отрицания `!(…)`, поэтому клиентские файлы api/ не вычитаются из
        // `api-server`, а получают свою категорию и запрет `server` отдельной политикой (ниже).
        ...(clientFiles.length > 0
          ? [{ category: "client-only", pattern: clientFiles.map((pattern) => `${src}/${pattern}`) }]
          : [])
      ],
      "boundaries/elements": [
        serverLayers
          ? { type: "server", pattern: `${src}/server/*`, capture: ["layer"] }
          : { type: "server", pattern: `${src}/server` },
        { type: "routes", pattern: `${src}/routes` },
        { type: "widgets", pattern: `${src}/widgets/*`, capture: ["slice"] },
        { type: "features", pattern: `${src}/features/*`, capture: ["slice"] },
        { type: "entities", pattern: `${src}/entities/*`, capture: ["slice"] },
        { type: "shared", pattern: `${src}/shared` }
      ]
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            allowTo("routes", "widgets", "features", "entities", "shared", "server"),
            allowTo("widgets", "features", "entities", "shared"),
            allowTo("features", "entities", "shared"),
            allowTo("entities", "entities", "shared"),
            allowTo("shared", "shared"),
            ...(serverLayers ? serverPolicies(serverLayers) : [allowTo("server", "entities", "shared")]),
            {
              from: { file: { categories: "api-server" } },
              allow: { to: types("entities", "features", "shared", "server") }
            },
            { from: { file: { categories: "client-only" } }, disallow: { to: types("server") } }
          ]
        }
      ]
    }
  }
]
