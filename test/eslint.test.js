// Конфиги ESLint и steiger глазами потребителя: временный проект ставит пакет ссылкой в node_modules,
// подключает фабрики по имени пакета (`@pavelsiba/quality-js/eslint`) и гоняет настоящий eslint / steiger
// по фикстурам из `test/fixtures/eslint/<имя>/`. Строки с `// ловит` правило обязано поймать, остальные пропустить.
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

const root = join(import.meta.dirname, "..")
const bin = (...parts) => join(root, "node_modules", ...parts)
const projects = []

// config — исходник eslint.config.js (или steiger.config.js) проекта
const makeProject = (fixture, configName, config) => {
  const dir = mkdtempSync(join(tmpdir(), "quality-js-eslint-"))
  projects.push(dir)
  mkdirSync(join(dir, "node_modules", "@pavelsiba"), { recursive: true })
  symlinkSync(root, join(dir, "node_modules", "@pavelsiba", "quality-js"), "junction")
  // в проекте-потребителе резолвер стоит рядом с eslint, во временной папке его надо подложить
  symlinkSync(
    bin("eslint-import-resolver-typescript"),
    join(dir, "node_modules", "eslint-import-resolver-typescript"),
    "junction"
  )
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", type: "module" }))
  cpSync(join(import.meta.dirname, "fixtures", "eslint", fixture), dir, { recursive: true })
  writeFileSync(join(dir, configName), config)
  return dir
}

const run = (command, args, dir) => {
  try {
    return execFileSync(process.execPath, [command, ...args], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    })
  } catch (error) {
    return `${error.stdout}${error.stderr}`
  }
}

// [{ file: "src/a.ts", ruleId, line }] без служебных сообщений парсера
const lint = (dir, target, ruleFilter = () => true) => {
  const output = run(bin("eslint", "bin", "eslint.js"), ["--format", "json", target], dir)
  return JSON.parse(output).flatMap((result) =>
    result.messages
      .filter((message) => message.ruleId && ruleFilter(message.ruleId))
      .map((message) => ({
        file: result.filePath.slice(dir.length + 1).replaceAll("\\", "/"),
        ruleId: message.ruleId,
        line: message.line
      }))
  )
}

const rulesOf = (found, file) => new Set(found.filter((item) => item.file === file).map((item) => item.ruleId))

// строки `// ловит` в файлах фикстуры
const expectedLines = (dir, files) =>
  files.flatMap((file) =>
    readFileSync(join(dir, file), "utf8")
      .split("\n")
      .flatMap((text, index) => (text.includes("// ловит") ? [{ file, line: index + 1 }] : []))
  )

const sortByPlace = (items) => items.map(({ file, line }) => `${file}:${line}`).sort()

after(() => {
  for (const dir of projects) rmSync(dir, { recursive: true, force: true })
})

describe("eslint: base()", () => {
  const dir = makeProject(
    "base",
    "eslint.config.js",
    `import { base } from "@pavelsiba/quality-js/eslint"\nexport default [...base()]\n`
  )
  const found = lint(dir, "bad.ts")

  it("ловит стиль и any", () => {
    const rules = rulesOf(found, "bad.ts")
    for (const rule of [
      "@stylistic/quotes",
      "@stylistic/semi",
      "@typescript-eslint/no-explicit-any",
      "@typescript-eslint/consistent-type-definitions"
    ]) {
      assert.ok(rules.has(rule), `нет ${rule}, есть: ${[...rules].join(", ")}`)
    }
  })

  it("не трогает чистый код", () => {
    assert.deepEqual(lint(dir, "clean.ts"), [])
  })
})

describe("eslint: react()", () => {
  const dir = makeProject(
    "react",
    "eslint.config.js",
    `import { base, react } from "@pavelsiba/quality-js/eslint"\nexport default [...base(), ...react()]\n`
  )

  it("ловит хук под условием", () => {
    assert.ok(rulesOf(lint(dir, "bad.tsx"), "bad.tsx").has("react-hooks/rules-of-hooks"))
  })

  it("не трогает чистый код", () => {
    assert.deepEqual(lint(dir, "clean.tsx"), [])
  })
})

describe("eslint: sonar()", () => {
  const dir = makeProject(
    "sonar",
    "eslint.config.js",
    `import { base, sonar } from "@pavelsiba/quality-js/eslint"\nexport default [...base(), ...sonar()]\n`
  )

  it("ловит вложенный тернарник и одинаковые ветки", () => {
    const rules = rulesOf(lint(dir, "bad.ts"), "bad.ts")
    for (const rule of ["sonarjs/no-nested-conditional", "sonarjs/no-all-duplicated-branches"]) {
      assert.ok(rules.has(rule), `нет ${rule}, есть: ${[...rules].join(", ")}`)
    }
  })

  it("не трогает чистый код", () => {
    assert.deepEqual(lint(dir, "clean.ts"), [])
  })

  it("исключает правила, которые стандарт не берёт, и оставляет остальные", async () => {
    const { sonar } = await import("@pavelsiba/quality-js/eslint")
    const rules = sonar()[0].rules
    assert.ok("sonarjs/cognitive-complexity" in rules)
    for (const rule of ["sonarjs/todo-tag", "sonarjs/aws-s3-bucket-versioning", "sonarjs/no-invalid-regexp"]) {
      assert.ok(!(rule in rules), `${rule} должен быть исключён`)
    }
    assert.ok(Object.values(rules).every((level) => level !== "off"))
  })

  it("типы включаются только по typed: true", async () => {
    const { sonar } = await import("@pavelsiba/quality-js/eslint")
    assert.equal(sonar()[0].languageOptions, undefined)
    assert.equal(sonar({ typed: true })[0].languageOptions.parserOptions.projectService, true)
  })
})

describe("eslint: fsd()", () => {
  const flatFiles = [
    "src/server/db.ts",
    "src/entities/user/index.ts",
    "src/entities/user/model.ts",
    "src/entities/user/api/get.ts",
    "src/entities/user/api/get-queries.ts",
    "src/features/cart/index.ts",
    "src/widgets/bar/index.ts",
    "src/routes/index.ts"
  ]
  const queries = "src/entities/user/api/get-queries.ts"
  const cases = [
    {
      name: "server — один элемент, clientFiles запрещает server обёрткам запросов",
      fixture: "fsd",
      options: `{ clientFiles: ["+(entities|features)/**/api/*-queries.{ts,tsx}"] }`,
      files: flatFiles
    },
    {
      name: "server — один элемент, без clientFiles обёртки запросов видят server как весь api/",
      fixture: "fsd",
      options: "",
      files: flatFiles.filter((file) => file !== queries)
    },
    {
      name: "server с подслоями",
      fixture: "fsd-layers",
      options: `{ serverLayers: { services: ["clients", "data"], clients: ["data"], data: [], db: [] } }`,
      files: ["src/server/services/a.ts", "src/server/clients/c.ts", "src/server/data/d.ts", "src/server/db/x.ts"]
    }
  ]

  for (const { name, fixture, options, files } of cases) {
    it(`${name}: ловит нарушения границ и только их`, () => {
      const dir = makeProject(
        fixture,
        "eslint.config.js",
        `import { base, fsd } from "@pavelsiba/quality-js/eslint"\nexport default [...base(), ...fsd(${options})]\n`
      )
      const found = lint(dir, "src", (ruleId) => ruleId === "boundaries/dependencies")
      assert.deepEqual(sortByPlace(found), sortByPlace(expectedLines(dir, files)))
    })
  }
})

describe("steiger", () => {
  const dir = makeProject("steiger", "steiger.config.js", `export { default } from "@pavelsiba/quality-js/steiger"\n`)
  const output = run(bin("steiger", "dist", "cli.mjs"), ["./src"], dir)

  it("ловит нарушение FSD", () => {
    assert.match(output, /fsd\/public-api/u, output)
  })

  it("не трогает server/, routeTree.gen.ts и не включает insignificant-slice", () => {
    assert.doesNotMatch(output, /insignificant-slice/u, output)
    assert.doesNotMatch(output, /server|routeTree/u, output)
  })
})
