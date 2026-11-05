// Конфиги Biome глазами потребителя: временный проект ставит пакет ссылкой в node_modules и
// подключает конфиг через манифест (`@pavelsiba/quality-js/configs/<имя>`), как это сделает проект.
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { basename, join } from "node:path"
import { after, describe, it } from "node:test"

const root = join(import.meta.dirname, "..")
const biomeBin = join(root, "node_modules", "@biomejs", "biome", "bin", "biome")
const projects = []

const makeProject = (fixture, configs) => {
  const dir = mkdtempSync(join(tmpdir(), "quality-js-"))
  projects.push(dir)
  mkdirSync(join(dir, "node_modules", "@pavelsiba"), { recursive: true })
  symlinkSync(root, join(dir, "node_modules", "@pavelsiba", "quality-js"), "junction")
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", type: "module" }))
  // vcs.useIgnoreFile в base требует .gitignore — он есть у любого проекта
  writeFileSync(join(dir, ".gitignore"), "node_modules/\n")
  writeFileSync(
    join(dir, "biome.json"),
    JSON.stringify({ extends: configs.map((name) => `@pavelsiba/quality-js/configs/${name}`) })
  )
  cpSync(join(import.meta.dirname, "fixtures", fixture), join(dir, "src"), { recursive: true })
  return dir
}

const diagnostics = (dir, target) => {
  let output
  try {
    output = execFileSync(process.execPath, [biomeBin, "lint", "--reporter=json", "--max-diagnostics=none", target], {
      cwd: dir,
      encoding: "utf8"
    })
  } catch (error) {
    output = error.stdout
  }
  return JSON.parse(output).diagnostics
}

const lint = (dir, file) => new Set(diagnostics(dir, file).map((diagnostic) => diagnostic.category))

after(() => {
  for (const dir of projects) rmSync(dir, { recursive: true, force: true })
})

describe("configs/base", () => {
  const dir = makeProject("base", ["base"])

  it("ловит встроенные аналоги sonarjs", () => {
    const categories = lint(dir, "src/bad.ts")
    for (const rule of ["style/noNestedTernary", "style/useCollapsedIf", "complexity/useWhile"]) {
      assert.ok(categories.has(`lint/${rule}`), `нет ${rule}, есть: ${[...categories].join(", ")}`)
    }
  })

  it("не трогает чистый код", () => {
    assert.deepEqual([...lint(dir, "src/clean.ts")], [])
  })
})

// Фикстура плагина — plugins/<имя>.ts: строки с `// ловит` плагин обязан поймать, остальные
// (граничные случаи, biome-ignore) — пропустить. Диагностики плагинов в отчёте имеют категорию
// `plugin`, имя правила в них — префикс сообщения.
describe("плагины GritQL в configs/base", () => {
  const pluginsDir = join(root, "configs", "biome", "plugins")
  const fixturesDir = join(import.meta.dirname, "fixtures", "plugins")
  const names = (directory, extension) =>
    readdirSync(directory)
      .filter((file) => file.endsWith(extension))
      .map((file) => basename(file, extension))
  const dir = makeProject("plugins", ["base"])
  const found = diagnostics(dir, "src").filter((diagnostic) => diagnostic.category === "plugin")

  it("у каждого плагина есть фикстура", () => {
    assert.deepEqual(names(fixturesDir, ".ts"), names(pluginsDir, ".grit"))
  })

  for (const name of names(pluginsDir, ".grit")) {
    it(`${name}: ловит помеченные строки и только их`, () => {
      const expected = readFileSync(join(fixturesDir, `${name}.ts`), "utf8")
        .split("\n")
        .flatMap((text, index) => (text.includes("// ловит") ? [index + 1] : []))
      const own = found.filter((diagnostic) => diagnostic.location.path.replaceAll("\\", "/") === `src/${name}.ts`)
      assert.deepEqual(
        own.map((diagnostic) => diagnostic.location.start.line).sort((a, b) => a - b),
        expected
      )
      for (const diagnostic of own) {
        assert.ok(diagnostic.message.startsWith(`${name}: `), diagnostic.message)
        assert.equal(diagnostic.severity, "info")
      }
    })
  }
})

describe("configs/react", () => {
  const dir = makeProject("react", ["base", "react"])

  it("ловит хук под условием", () => {
    const categories = lint(dir, "src/bad.tsx")
    assert.ok(categories.has("lint/correctness/useHookAtTopLevel"), [...categories].join(", "))
  })
})
