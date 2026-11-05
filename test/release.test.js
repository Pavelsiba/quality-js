// Конфиг semantic-release глазами потребителя: временный проект ставит пакет ссылкой в node_modules и
// подключает `@pavelsiba/quality-js/release` по имени. Прогон самого semantic-release требует токен GitHub
// и сеть, поэтому тест проверяет то, что ломается без них: экспорт, форму конфига и то, что каждый плагин
// находится из места, где лежит конфиг (так semantic-release ищет плагины шареного конфига).
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"
import { pathToFileURL } from "node:url"

const root = join(import.meta.dirname, "..")
const projects = []

const makeProject = () => {
  const dir = mkdtempSync(join(tmpdir(), "quality-js-release-"))
  projects.push(dir)
  mkdirSync(join(dir, "node_modules", "@pavelsiba"), { recursive: true })
  symlinkSync(root, join(dir, "node_modules", "@pavelsiba", "quality-js"), "junction")
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", type: "module" }))
  return dir
}

// Печатает JSON конфига, импортированного из проекта по имени пакета
const loadFromProject = (dir, expression) => {
  writeFileSync(
    join(dir, "probe.mjs"),
    `import config, { release } from "@pavelsiba/quality-js/release"\nconsole.log(JSON.stringify(${expression}))`
  )
  return JSON.parse(execFileSync(process.execPath, ["probe.mjs"], { cwd: dir, encoding: "utf8" }))
}

const pluginNames = (config) => config.plugins.map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin))

after(() => {
  for (const dir of projects) rmSync(dir, { recursive: true, force: true })
})

describe("release", () => {
  it("отдаёт конфиг и фабрику по имени пакета", () => {
    const config = loadFromProject(makeProject(), "config")
    // biome-ignore lint/suspicious/noTemplateCurlyInString: шаблон semantic-release, не JS
    assert.equal(config.tagFormat, "v${version}")
    assert.deepEqual(config.branches, ["main"])
    assert.deepEqual(pluginNames(config), [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git",
      "@semantic-release/github"
    ])
  })

  it("фабрика с npmPublish: false не публикует на npmjs", () => {
    const config = loadFromProject(makeProject(), "release({ npmPublish: false })")
    const npm = config.plugins.find((plugin) => plugin[0] === "@semantic-release/npm")
    assert.equal(npm[1].npmPublish, false)
  })

  it("каждый плагин и пресет находится из папки конфига", async () => {
    const { default: config } = await import(pathToFileURL(join(root, "configs", "release", "index.js")).href)
    const requireFromConfig = createRequire(join(realpathSync(root), "configs", "release", "index.js"))
    for (const name of [...pluginNames(config), "conventional-changelog-conventionalcommits"]) {
      assert.doesNotThrow(() => requireFromConfig.resolve(name), `${name} не найден`)
    }
  })
})
