// Правила eslint-plugin-sonarjs: рекомендованные минус те, что стандарт не берёт (тот же отбор, что у Biome-ветки,
// таблица — sonarjs-biome.md в скилле quality-gates набора pavelsiba-skills). Правила, которым нужны типы TS,
// без `typed: true` молча ничего не делают: типы включаются в CI, а не в pre-commit (медленно).
import sonarjs from "eslint-plugin-sonarjs"

// Стек, которого нет у проектов, фреймворк-специфичное и «подсказки, а не дефекты».
const notTaken = [
  "avoid-mutating-nested-properties-of-shallow-clones",
  "aws-apigateway-public-api",
  "aws-ec2-rds-dms-public",
  "aws-ec2-unencrypted-ebs-volume",
  "aws-efs-unencrypted",
  "aws-iam-all-privileges",
  "aws-iam-all-resources-accessible",
  "aws-iam-privilege-escalation",
  "aws-iam-public-access",
  "aws-opensearchservice-domain",
  "aws-rds-unencrypted-databases",
  "aws-restricted-ip-admin-access",
  "aws-s3-bucket-granted-access",
  "aws-s3-bucket-insecure-http",
  "aws-s3-bucket-public-access",
  "aws-s3-bucket-versioning",
  "aws-sagemaker-unencrypted-notebook",
  "aws-sns-unencrypted-topics",
  "aws-sqs-unencrypted-queue",
  "chai-determinate-assertion",
  "comment-regex",
  "composite-assertions",
  "content-length",
  "content-security-policy",
  "csrf",
  "declarations-in-global-scope",
  "disabled-timeout",
  "dynamically-constructed-templates",
  "file-header",
  "file-uploads",
  "memoize-cache-key",
  "no-angular-bypass-sanitization",
  "no-code-after-done",
  "no-debounce-throttle-in-render",
  "no-default-utility-imports",
  "no-internal-api-use",
  "no-mime-sniff",
  "no-mixed-completion-style",
  "no-mutate-reactive-state-in-updated-hook",
  "no-referrer-policy",
  "no-session-cookies-on-static-assets",
  "no-sonar-comments",
  "no-table-as-layout",
  "no-vue-class-component",
  "no-vue-mixins",
  "object-alt-content",
  "parameterized-tests",
  "prefer-cypress-should",
  "prefer-native-axios-alternative",
  "prefer-native-jquery-alternative",
  "prefer-native-lodash-alternative",
  "session-regeneration",
  "shorthand-property-grouping",
  "stable-tests",
  "strict-transport-security",
  "table-header",
  "table-header-reference",
  "todo-tag",
  "x-powered-by"
]

// То, что уже закрывают tsc, форматтер (@stylistic) или gitleaks.
const coveredElsewhere = [
  "arrow-function-convention",
  "call-argument-line",
  "future-reserved-words",
  "no-delete-var",
  "no-extra-arguments",
  "no-invalid-regexp",
  "no-literal-call",
  "no-same-line-conditional",
  "review-blockchain-mnemonic"
]

const excluded = new Set([...notTaken, ...coveredElsewhere])
const prefix = "sonarjs/"

/**
 * @param {{ typed?: boolean }} [options] typed: включить правила, которым нужны типы (`projectService`)
 * @returns {import("eslint").Linter.Config[]}
 */
export const sonar = ({ typed = false } = {}) => [
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { sonarjs },
    ...(typed && { languageOptions: { parserOptions: { projectService: true } } }),
    rules: Object.fromEntries(
      Object.entries(sonarjs.configs.recommended.rules).filter(([name, level]) => {
        const short = name.slice(prefix.length)
        return level !== "off" && !excluded.has(short) && !sonarjs.rules[short]?.meta?.deprecated
      })
    )
  }
]
