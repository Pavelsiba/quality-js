import { expect, it } from "vitest"

const load = async () => 1

it("без await", async () => {
  expect(load()).resolves.toBe(1) // ловит
  expect(load()).rejects.toThrow("ошибка") // ловит
  expect(load()).resolves.not.toBe(2) // ловит
})

it("с await", async () => {
  await expect(load()).resolves.toBe(1)
  await expect(load()).rejects.toThrow("ошибка")
})

it("с return", () => {
  return expect(load()).resolves.toBe(1)
})

it("обычная проверка", () => {
  expect(1 + 1).toBe(2)
})
