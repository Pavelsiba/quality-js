declare function cors(options: unknown): unknown

export const a = cors({ origin: "*" }) // ловит
export const b = cors({ origin: '*' }) // ловит
export const c = cors({ origin: "https://example.com" })
export const d = cors({ origin: ["https://a.example", "https://b.example"] })
export const e = { origin: "*.example.com" }
