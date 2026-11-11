import { expect, it } from "vitest"

export const a = /\s*\s*x/u // ловит
export const b = /\d+\w+x/u // ловит
export const c = /.*.*x/u // ловит
export const d = /.*foo.*bar/u // ловит
export const e = /a\w+\w*/u // ловит
export const anchored = /^(.*)=(.*)$/u
export const separated = /\s*,\s*/u
export const escapeChars = /[.*+?^${}()|[\]\\]/gu
export const reverseOrder = /\w+\d/u
export const literalDots = /\.*\.*/u

const message = String(Date.now())

it("регулярки в проверках теста не считаются", () => {
  expect(message).toMatch(/\[54\].*Нет прав.*токен/u)
  expect(() => "x").toThrow(/a.*b.*c/u)
})
