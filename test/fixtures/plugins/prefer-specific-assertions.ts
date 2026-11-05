import { expect, it } from "vitest"

class Box {}
declare const a: number
declare const b: number
declare const ok: boolean
declare const value: unknown

it("сравнения", () => {
  expect(a === b).toBe(true) // ловит
  expect(a !== b).toBe(false) // ловит
  expect(a > 1).toBe(true) // ловит
  expect(a <= b).toEqual(true) // ловит
  expect(value instanceof Box).toBeTruthy() // ловит
  expect(a == b).toBeFalsy() // ловит
  expect(a).toBe(b)
  expect(a).toBeGreaterThan(1)
  expect(value).toBeInstanceOf(Box)
  expect(ok).toBe(true)
  expect(a && b).toBe(true)
  expect(a === b).toBe(ok)
})
