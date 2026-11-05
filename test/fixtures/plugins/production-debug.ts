declare function createApp(options: unknown): unknown

export const a = createApp({ debug: true }) // ловит
export const b = createApp({ debug: false })
export const c = createApp({ debug: process.env.NODE_ENV !== "production" })
