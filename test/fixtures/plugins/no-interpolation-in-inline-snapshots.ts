import { expect, it } from "vitest"

const id = 7

it("снимки", () => {
  expect({ id }).toMatchInlineSnapshot(`{ "id": ${id} }`) // ловит
  expect(() => id).toThrowErrorMatchingInlineSnapshot(`"ошибка ${id}"`) // ловит
  expect({ id }).toMatchInlineSnapshot(`{ "id": 7 }`)
  expect({ id }).toMatchInlineSnapshot()
  expect({ id }).toMatchSnapshot()
})
