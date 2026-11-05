declare const res: { cookie: (...args: unknown[]) => void }

res.cookie("a", "b", { httpOnly: false }) // ловит
res.cookie("a", "b", { httpOnly: true })
res.cookie("a", "b", {})
export const other = { httpOnlyX: false }
