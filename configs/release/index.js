// Конфиг semantic-release: версия из Conventional Commits, CHANGELOG.md, релизный коммит, тег vX.Y.Z,
// релиз на GitHub и публикация на npmjs. Проект подключает его в .releaserc.json:
//   { "extends": "@pavelsiba/quality-js/release" }
// Проект, который не публикуется на npmjs или меняет версию не в package.json, строит конфиг
// фабрикой в release.config.js: `export default release({ npmPublish: false })`.
// Плагины semantic-release (changelog, git, пресет conventionalcommits) ставит проект: в пакете они
// необязательные peer-зависимости.
const SECTIONS = [
  { type: "feat", section: "Новое" },
  { type: "fix", section: "Исправления" },
  { type: "perf", section: "Производительность" },
  ...["refactor", "docs", "chore", "ci", "test", "style", "build"].map((type) => ({ type, hidden: true }))
]

/**
 * @param {{ npmPublish?: boolean, assets?: string[] }} [options]
 *   npmPublish: false — версия пишется в package.json, но пакет не публикуется;
 *   assets — файлы релизного коммита (по умолчанию CHANGELOG.md, package.json, package-lock.json).
 */
export const release = ({
  npmPublish = true,
  assets = ["CHANGELOG.md", "package.json", "package-lock.json"]
} = {}) => ({
  branches: ["main"],
  // biome-ignore lint/suspicious/noTemplateCurlyInString: шаблон semantic-release, не JS
  tagFormat: "v${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits", presetConfig: { types: SECTIONS } }],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md", changelogTitle: "# Changelog" }],
    ["@semantic-release/npm", { npmPublish }],
    [
      "@semantic-release/git",
      {
        assets,
        // [skip ci]: релизный коммит не запускает CI заново; сообщение не по-русски, поэтому в CI
        // хуки выключены (LEFTHOOK=0)
        // biome-ignore lint/suspicious/noTemplateCurlyInString: шаблон semantic-release, не JS
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
})

export default release()
