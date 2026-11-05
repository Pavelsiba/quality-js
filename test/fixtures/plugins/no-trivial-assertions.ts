import assert from "node:assert/strict"
import { expect } from "vitest"

const value = 1

expect(true).toBe(true) // ловит
expect(1).toBeTruthy() // ловит
expect("abc").toBeDefined() // ловит
expect(null).toBeNull() // ловит
assert(true) // ловит
assert.ok(1) // ловит
expect(value).toBe(1)
expect(value > 0).toBe(true)
assert(value)
assert.ok(value > 0)
