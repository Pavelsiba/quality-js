declare const res: { cookie: (...args: unknown[]) => void }
declare function session(options: unknown): unknown
declare function setCookie(...args: unknown[]): void
declare function createTransport(options: unknown): unknown

res.cookie("a", "b", { secure: false }) // ловит
setCookie("a", "b", { secure: false }) // ловит
export const s = session({ secret: "x", cookie: { secure: false } }) // ловит
export const auth = { cookies: { sessionToken: { options: { secure: false } } } } // ловит
export const ok = session({ cookie: { secure: true } })
export const mail = createTransport({ host: "smtp.example", port: 587, secure: false })
export const flag = { secure: false }
