import { describe, it, test } from "vitest"

it.each([])("пусто", () => {}) // ловит
test.each([])("пусто", () => {}) // ловит
describe.each([])("пусто", () => {}) // ловит
it.only.each([])("пусто", () => {}) // ловит
it.each([1, 2])("есть данные %i", () => {})
test.each([[1, 2]])("есть данные %i", () => {})
export const other = { each: [] }
