import cp, { exec, execFileSync, spawn } from "node:child_process"

exec("ls -la /tmp") // ловит
execFileSync("git", ["status"]) // ловит
spawn("node", ["a.js"]) // ловит
cp.spawnSync("npm", ["ci"]) // ловит
spawn("/usr/bin/git", ["status"])
cp.execSync("/usr/bin/ls -la")
spawn("./run.sh")
declare const command: string
spawn(command)
export const match = /a/.exec("abc")
