// tsconfig глазами потребителя: временный проект расширяет конфиг пакета по имени и гоняет настоящий tsc.
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

const root = join(import.meta.dirname, "..")
const tsc = join(root, "node_modules", "typescript", "bin", "tsc")
const projects = []

const makeProject = (config, source) => {
  const dir = mkdtempSync(join(tmpdir(), "quality-js-tsconfig-"))
  projects.push(dir)
  mkdirSync(join(dir, "node_modules", "@pavelsiba"), { recursive: true })
  symlinkSync(root, join(dir, "node_modules", "@pavelsiba", "quality-js"), "junction")
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", type: "module" }))
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({ extends: `@pavelsiba/quality-js/tsconfig/${config}.json`, include: ["index.ts"] })
  )
  writeFileSync(join(dir, "index.ts"), source)
  return dir
}

const compile = (dir) => spawnSync(process.execPath, [tsc, "-p", dir], { encoding: "utf8" })

after(() => {
  for (const dir of projects) rmSync(dir, { recursive: true, force: true })
})

describe("tsconfig/bundler.json", () => {
  it("пускает API ES2025 без переопределения lib", () => {
    const dir = makeProject("bundler", "export const apart = new Set([1]).isDisjointFrom(new Set([2]))\n")
    const result = compile(dir)
    assert.equal(result.status, 0, result.stdout)
  })
})
