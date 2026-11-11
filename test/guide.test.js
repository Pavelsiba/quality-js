// Таблица «Что включено по веткам» в AGENT-GUIDE.md сверяется с конфигами: порог или уровень в конфиге разошёлся
// с описанием — тест падает. Пороги sonarjs в конфиге не заданы: это умолчания плагина (`meta.defaultOptions`).
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it } from "node:test"
import sonarjs from "eslint-plugin-sonarjs"
import { base, next, sonar } from "../configs/eslint/index.js"

const root = join(import.meta.dirname, "..")
const guide = readFileSync(join(root, "AGENT-GUIDE.md"), "utf8")
const section = guide.slice(guide.indexOf("## Что включено по веткам"), guide.indexOf("## Чего в пакете нет"))

// base.jsonc — JSONC с комментариями на отдельных строках
const biomeRules = JSON.parse(
  readFileSync(join(root, "configs", "biome", "base.jsonc"), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n")
).linter.rules

const ruleEntry = (rules, name) => {
  const entry = rules[name]
  return Array.isArray(entry) ? entry : [entry]
}
const eslintRules = Object.assign({}, ...[...base(), ...sonar()].map((config) => config.rules ?? {}))

// «`правило` ≤ порог, `уровень`» — так ячейка записана в таблице
const cell = (name, threshold, level) => {
  const limit = threshold === undefined ? "" : ` ≤ ${threshold}`
  return `\`${name}\`${limit}, \`${level}\``
}

const sonarThreshold = (short) => {
  const [option] = sonarjs.rules[short].meta.defaultOptions
  return typeof option === "number" ? option : option.threshold
}

describe("AGENT-GUIDE.md: «Что включено по веткам»", () => {
  it("раздел найден", () => {
    assert.ok(section.includes("| Область"), "нет таблицы")
  })

  describe("Biome", () => {
    const biomeCases = [
      ["complexity", "noExcessiveCognitiveComplexity", 15, "warn", "maxAllowedComplexity"],
      ["complexity", "noExcessiveLinesPerFunction", 80, "warn", "maxLines"],
      // порог 5 — умолчание Biome: в конфиге у правила нет options
      ["complexity", "noExcessiveNestedCallbacks", 5, "warn"],
      ["style", "noNestedTernary", undefined, "error"],
      ["security", "noGlobalEval", undefined, "error"]
    ]
    for (const [group, name, threshold, level, optionName] of biomeCases) {
      it(`${name}: ${threshold ?? "без порога"}, ${level}`, () => {
        const config = biomeRules[group][name]
        assert.equal(typeof config === "string" ? config : config.level, level)
        if (optionName) assert.equal(config.options[optionName], threshold)
        else if (threshold !== undefined)
          assert.equal(typeof config, "string", "порог умолчания, options быть не должно")
        assert.ok(
          section.includes(cell(name, threshold, level)),
          `в таблице нет ячейки ${cell(name, threshold, level)}`
        )
      })
    }

    it("noFocusedTests и noSkippedTests: error", () => {
      assert.equal(biomeRules.suspicious.noFocusedTests, "error")
      assert.equal(biomeRules.suspicious.noSkippedTests, "error")
      assert.ok(section.includes("`noFocusedTests`, `noSkippedTests`, `error`"))
    })

    it("длина функции в tsx / jsx — 150 (react), в тестах правило выключено", () => {
      const reactConfig = readFileSync(join(root, "configs", "biome", "react.jsonc"), "utf8")
      assert.match(reactConfig, /noExcessiveLinesPerFunction.*maxLines": 150/u)
      assert.match(section, /`\*\.tsx` \/ `\*\.jsx` с `react` — 150/u)
    })
  })

  describe("ESLint", () => {
    const sonarCases = [
      ["cognitive-complexity", true],
      ["no-nested-functions", true],
      ["no-nested-conditional", false],
      ["regex-complexity", true]
    ]
    for (const [short, hasThreshold] of sonarCases) {
      it(`sonarjs/${short}: ${hasThreshold ? sonarThreshold(short) : "без порога"}, error`, () => {
        const name = `sonarjs/${short}`
        assert.deepEqual(ruleEntry(eslintRules, name), ["error"], "в конфиге заданы options или другой уровень")
        const threshold = hasThreshold ? sonarThreshold(short) : undefined
        assert.ok(
          section.includes(cell(name, threshold, "error")),
          `в таблице нет ячейки ${cell(name, threshold, "error")}`
        )
      })
    }

    it("max-lines-per-function: только в next(), 80, в tsx / jsx 150, warn", () => {
      assert.ok(!("max-lines-per-function" in eslintRules), "в base() / sonar() правило не должно быть")
      const [general, jsx] = next().map((config) => config.rules["max-lines-per-function"])
      assert.equal(general[0], "warn")
      assert.equal(general[1].max, 80)
      assert.equal(jsx[0], "warn")
      assert.equal(jsx[1].max, 150)
      assert.ok(section.includes(cell("max-lines-per-function", 80, "warn")))
      assert.match(section, /`\*\.tsx` \/ `\*\.jsx` — 150; только `next\(\)`/u)
    })

    it("правила безопасности, секретов и тестов из таблицы включены уровнем error", () => {
      const names = [
        "slow-regex",
        "super-linear-regex",
        "code-eval",
        "hashing",
        "weak-ssl",
        "insecure-cookie",
        "cors",
        "no-hardcoded-secrets",
        "no-hardcoded-passwords",
        "sql-queries",
        "no-hardcoded-ip",
        "no-exclusive-tests",
        "no-skipped-tests",
        "assertions-in-tests"
      ]
      for (const short of names) {
        assert.deepEqual(ruleEntry(eslintRules, `sonarjs/${short}`), ["error"], `sonarjs/${short}`)
        assert.ok(section.includes(short), `в таблице нет ${short}`)
      }
    })
  })

  it("строка «Сложность регулярки» у Biome — «нет», и такого правила в Biome-конфиге нет", () => {
    assert.match(section, /\| Сложность регулярки\s+\| нет\s+\|/u)
    assert.ok(!/regex.?complexity/iu.test(JSON.stringify(biomeRules)))
  })
})
