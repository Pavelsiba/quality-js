import https from "node:https"

https.request({ host: "a.example", rejectUnauthorized: false }) // ловит
export const agent = new https.Agent({ rejectUnauthorized: false }) // ловит
export const verified = new https.Agent({ rejectUnauthorized: true })
const rejectUnauthorized = true
export const shorthand = new https.Agent({ rejectUnauthorized })
export const other = { rejectAuthorized: false, flag: false }

// biome-ignore lint/plugin/unverified-certificate: тестовый стенд с самоподписанным сертификатом
export const suppressed = new https.Agent({ rejectUnauthorized: false })
