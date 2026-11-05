import { expect, it } from "vitest"

declare function load(): Promise<number>

it("неполные", async () => {
  expect(1 + 1) // ловит
  expect(1 + 1).not // ловит
  expect(load()).resolves // ловит
  expect(1 + 1).toBe // ловит
  expect(load()).resolves.not // ловит
})

it("полные", async () => {
  expect(1 + 1).toBe(2)
  expect(1 + 1).not.toBe(3)
  await expect(load()).resolves.toBe(1)
  const subject = expect(await load())
  return subject.toBe(1)
})
