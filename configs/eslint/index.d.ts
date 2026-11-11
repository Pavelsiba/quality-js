import type { Linter } from "eslint"

export type FsdOptions = {
  /** Папка с исходниками, по умолчанию `src`. */
  src?: string
  /** Подслои `src/server/<слой>`: кто из них кого может импортировать. Без него `server` — один элемент. */
  serverLayers?: Record<string, string[]>
  /** Шаблоны файлов относительно `src`, которым `server` запрещён даже в `api/` (клиентские обёртки запросов). */
  clientFiles?: string[]
}

export type SonarOptions = {
  /** Включить правила, которым нужны типы TS (`projectService`): в CI, не в pre-commit. */
  typed?: boolean
}

export function base(): Linter.Config[]
/** Новые правила, ещё не включённые в `base()` / `react()`: проект подключает сам (уровень `warn`). */
export function next(): Linter.Config[]
export function react(): Linter.Config[]
export function sonar(options?: SonarOptions): Linter.Config[]
export function fsd(options?: FsdOptions): Linter.Config[]
