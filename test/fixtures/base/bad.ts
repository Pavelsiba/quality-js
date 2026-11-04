export const pick = (a: number, b: number): string => (a > 0 ? (b > 0 ? "both" : "a") : "none")

export function nested(a: boolean, b: boolean): number {
  if (a) {
    if (b) {
      return 1
    }
  }
  return 0
}

export function loop(items: number[]): number {
  let total = 0
  for (; total < items.length; ) {
    total += 1
  }
  return total
}
