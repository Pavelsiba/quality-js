// Конфиги Biome глазами потребителя: временный проект ставит пакет ссылкой в node_modules и
// подключает конфиг через манифест (`@pavelsiba/quality-js/configs/<имя>`), как это сделает проект.
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
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

const lint = (dir, file) => {
  let output
  try {
    output = execFileSync(process.execPath, [biomeBin, "lint", "--reporter=json", file], {
      cwd: dir,
      encoding: "utf8"
    })
  } catch (error) {
    output = error.stdout
  }
  const report = JSON.parse(output)
  return new Set(report.diagnostics.map((diagnostic) => diagnostic.category))
}

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

describe("configs/react", () => {
  const dir = makeProject("react", ["base", "react"])

  it("ловит хук под условием", () => {
    const categories = lint(dir, "src/bad.tsx")
    assert.ok(categories.has("lint/correctness/useHookAtTopLevel"), [...categories].join(", "))
  })
})
