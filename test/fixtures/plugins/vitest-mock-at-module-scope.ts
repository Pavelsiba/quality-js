import { describe, it, vi } from "vitest"

vi.mock("./a")
vi.mock("./b", () => ({ b: 1 }))

describe("группа", () => {
  vi.mock("./c") // ловит
  it("тест", () => {
    vi.mock("./d", () => ({ d: 1 })) // ловит
    vi.doMock("./e")
  })
})

export function setup() {
  vi.mock("./f") // ловит
}
