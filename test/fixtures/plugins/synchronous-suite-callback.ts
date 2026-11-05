import { describe, it } from "vitest"

describe("async", async () => { // ловит
  it("тест", () => {})
})

describe("async function", async function () { // ловит
  it("тест", () => {})
})

describe.skip("async skip", async () => { // ловит
  it("тест", () => {})
})

describe("sync", () => {
  it("async-тест", async () => {})
})

describe("sync function", function () {
  it("тест", () => {})
})
