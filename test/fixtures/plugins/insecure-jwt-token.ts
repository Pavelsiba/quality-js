declare const jwt: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => unknown }

export const a = jwt.sign({}, "k", { algorithm: "none" }) // ловит
export const b = jwt.verify("t", "k", { algorithms: ["HS256", "none"] }) // ловит
export const c = jwt.verify("t", "k", { algorithms: ["None"] }) // ловит
export const d = jwt.sign({}, "k", { algorithm: "HS256" })
export const e = jwt.verify("t", "k", { algorithms: ["RS256", "ES256"] })
export const f = { algorithm: "nonexistent" }
