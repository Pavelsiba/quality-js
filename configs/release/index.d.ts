// Типы для `release.config.js` проекта: `export default release({ npmPublish: false })`.
type ReleaseConfig = {
  readonly branches: readonly string[]
  readonly tagFormat: string
  readonly plugins: readonly unknown[]
}

export declare const release: (options?: { npmPublish?: boolean; assets?: readonly string[] }) => ReleaseConfig

declare const config: ReleaseConfig

export default config
