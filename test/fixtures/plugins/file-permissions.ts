import fs, { chmod, chmodSync } from "node:fs"

chmodSync("a", 0o777) // ловит
fs.chmodSync("a", 0o666) // ловит
chmod("a", 0o757, () => {}) // ловит
fs.chmodSync("a", "777") // ловит
chmodSync("a", 0o644)
fs.chmodSync("a", 0o755)
fs.chmodSync("a", "640")
chmodSync("a", 0o770)
