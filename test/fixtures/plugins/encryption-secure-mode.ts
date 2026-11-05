import crypto, { createCipheriv } from "node:crypto"

declare const key: Buffer
declare const iv: Buffer

export const a = createCipheriv("aes-256-cbc", key, iv) // ловит
export const b = crypto.createCipheriv("aes-128-ecb", key, null) // ловит
export const c = createCipheriv("aes256", key, iv) // ловит
export const d = createCipheriv("AES-192-CBC", key, iv) // ловит
export const e = createCipheriv("aes-256-gcm", key, iv)
export const f = crypto.createCipheriv("aes-256-ctr", key, iv)
export const g = createCipheriv("chacha20-poly1305", key, iv)
