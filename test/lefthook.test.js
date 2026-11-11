// Конфиги lefthook глазами потребителя: временный проект ставит пакет ссылкой в node_modules и
// подключает файлы через `extends`, как это сделает проект. Настоящий lefthook собирает итоговый конфиг.
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

const root = join(import.meta.dirname, "..")
const lefthookBin = join(root, "node_modules", "lefthook", "bin", "index.js")
const prefix = "node_modules/@pavelsiba/quality-js/configs/lefthook"
const projects = []

const makeProject = (config) => {
  const dir = mkdtempSync(join(tmpdir(), "quality-js-"))
  projects.push(dir)
  mkdirSync(join(dir, "node_modules", "@pavelsiba"), { recursive: true })
  symlinkSync(root, join(dir, "node_modules", "@pavelsiba", "quality-js"), "junction")
  execFileSync("git", ["init", "--quiet"], { cwd: dir })
  writeFileSync(join(dir, "lefthook.yml"), config)
  return dir
}

const merged = (dir) =>
  JSON.parse(execFileSync(process.execPath, [lefthookBin, "dump", "--format", "json"], { cwd: dir, encoding: "utf8" }))

const jobs = (config, hook) => Object.fromEntries(config[hook].jobs.map((job) => [job.name, job]))

after(() => {
  for (const dir of projects) rmSync(dir, { recursive: true, force: true })
})

describe("configs/lefthook", () => {
  it("base.yml: biome по staged-файлам и commitlint", () => {
    const config = merged(makeProject(`extends:\n  - ${prefix}/base.yml\n`))
    const biome = jobs(config, "pre-commit").biome
    assert.match(biome.run, /biome check --write --error-on-warnings .*\{staged_files\}/u)
    assert.equal(biome.stage_fixed, true)
    assert.match(jobs(config, "commit-msg").commitlint.run, /commitlint --edit \{1\}/u)
    assert.equal(config.colors, false)
  })

  it("base.yml не тащит gitleaks и actionlint: они ставятся в систему отдельно", () => {
    const names = Object.keys(jobs(merged(makeProject(`extends:\n  - ${prefix}/base.yml\n`)), "pre-commit"))
    assert.deepEqual(names, ["biome"])
  })

  it("security.yml: gitleaks с --redact, actionlint и zizmor", () => {
    const config = merged(makeProject(`extends:\n  - ${prefix}/base.yml\n  - ${prefix}/security.yml\n`))
    const preCommit = jobs(config, "pre-commit")
    assert.deepEqual(
      Object.keys(preCommit).sort((a, b) => a.localeCompare(b)),
      ["biome", "secrets", "workflows"]
    )
    assert.match(preCommit.secrets.run, /gitleaks git --pre-commit --staged --redact/u)
    assert.match(preCommit.workflows.run, /actionlint && zizmor/u)
  })

  it("проект добавляет свои джобы; джоб с общим именем не перекрывается", () => {
    const config = merged(
      makeProject(
        [
          "extends:",
          `  - ${prefix}/base.yml`,
          "pre-commit:",
          "  jobs:",
          "    - name: biome",
          "      run: echo own-biome",
          "    - name: typecheck",
          "      run: npm run typecheck",
          ""
        ].join("\n")
      )
    )
    const preCommit = jobs(config, "pre-commit")
    assert.equal(preCommit.typecheck.run, "npm run typecheck")
    // lefthook кладёт extends поверх основного конфига: README и base.yml опираются на это
    assert.match(preCommit.biome.run, /^npx biome check/u)
    assert.ok(jobs(config, "commit-msg").commitlint, "commit-msg из base.yml сохранился")
  })
})
