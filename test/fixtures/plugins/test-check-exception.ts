import { expect, it } from "vitest"

const fail = () => {
  throw new Error("ошибка")
}

it("исключения", async () => {
  expect(fail).toThrow() // ловит
  expect(fail).toThrowError() // ловит
  expect(fail).not.toThrow()
  expect(fail).not.toThrowError()
  await expect(Promise.reject(new Error("e"))).rejects.toThrow() // ловит
  expect(fail).toThrow("ошибка")
  expect(fail).toThrow(Error)
  expect(fail).toThrow(/ошибка/)
  expect(fail).toThrowError("ошибка")
})
