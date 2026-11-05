import tls from "node:tls"

export const a = tls.createSecureContext({ minVersion: "TLSv1" }) // ловит
export const b = tls.createSecureContext({ minVersion: "TLSv1.1" }) // ловит
export const c = tls.createSecureContext({ minVersion: "TLSv1.2" })
export const d = tls.createSecureContext({ minVersion: "TLSv1.3" })
export const e = { minVersion: 1 }
