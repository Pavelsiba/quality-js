import crypto, { createHash } from "node:crypto"

export const a = createHash("md5").update("x").digest("hex") // ловит
export const b = crypto.createHash("sha1") // ловит
export const c = createHash("SHA1") // ловит
export const d = createHash("sha-1") // ловит
export const e = createHash("sha256")
export const f = crypto.createHash("sha512")
const algorithm = "md5"
export const dynamic = createHash(algorithm)
