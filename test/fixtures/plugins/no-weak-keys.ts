import { generateKeyPairSync } from "node:crypto"

generateKeyPairSync("rsa", { modulusLength: 1024 }) // ловит
generateKeyPairSync("rsa", { modulusLength: 512 }) // ловит
generateKeyPairSync("rsa", { modulusLength: 2047 }) // ловит
generateKeyPairSync("rsa", { modulusLength: 2048 })
generateKeyPairSync("rsa", { modulusLength: 4096 })
export const other = { modulusLengthX: 1024 }
