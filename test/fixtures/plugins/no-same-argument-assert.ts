import assert from "node:assert/strict"
import { expect } from "vitest"

const result = { id: 1 }
const other = { id: 1 }
declare function next(): number

expect(result).toBe(result) // ловит
expect(result).toEqual(result) // ловит
expect(result).not.toBe(result) // ловит
expect(result.id).toStrictEqual(result.id) // ловит
assert.equal(result, result) // ловит
assert.deepStrictEqual(result, result, "сообщение") // ловит
expect(result).toBe(other)
expect(result.id).toBe(other.id)
expect(next()).toBe(next())
assert.equal(result, other)
