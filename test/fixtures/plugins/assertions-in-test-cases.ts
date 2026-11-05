import { describe, expect, it } from "vitest"

const value = 1

expect(value).toBe(1) // ловит
expect(value).not.toBe(2) // ловит

it("в тесте", () => {
  expect(value).toBe(1)
})

it("стрелка без блока", () => expect(value).toBe(1))

describe("группа", () => {
  it("вложенный", () => {
    expect(value).toBe(1)
  })
})

function check(actual: number) {
  expect(actual).toBe(1)
}

export const helper = (actual: number) => expect(actual).toBe(1)
export { check }
