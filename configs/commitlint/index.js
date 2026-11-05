// Conventional Commits с описанием по-русски: из сообщений собирается CHANGELOG (из yd-mcp).
// Мерджи и git revert commitlint пропускает сам (defaultIgnores).
const CYRILLIC = /[А-Яа-яЁё]/u

// @ts-check
/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "subject-russian": ({ subject }) => [
          !subject || CYRILLIC.test(subject),
          "описание коммита пишется по-русски: «feat(auth): добавлен вход из диалога»"
        ]
      }
    }
  ],
  rules: {
    "subject-russian": [2, "always"]
  }
}
