export const noop = (): void => {}

export function safe(run: () => void): void {
  try {
    run()
  } catch {}
}
