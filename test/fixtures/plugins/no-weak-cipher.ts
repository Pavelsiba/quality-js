import crypto, { createCipheriv } from "node:crypto"

declare const key: Buffer
declare const iv: Buffer

export const a = createCipheriv("des-ede3-cbc", key, iv) // ловит
export const b = crypto.createCipheriv("rc4", key, iv) // ловит
export const c = createCipheriv("bf-cbc", key, iv) // ловит
export const d = createCipheriv("DES", key, iv) // ловит
export const e = createCipheriv("aes-256-gcm", key, iv)
export const f = crypto.createCipheriv("chacha20-poly1305", key, iv)
