// Núcleo compartido del Entrenador: tipos y utilidades que usan todos los
// bancos de familias (trainer.ts, trainerAdvanced.ts).

export type Nivel = 1 | 2 | 3

export interface TrainerOption {
  label: string
  correct?: boolean
  feedback: string
}
export interface TrainerMCQ {
  question: string
  options: TrainerOption[]
}
export interface DataRow {
  label: string
  value: string
  /** Se revela al final: entrena a distinguir lo útil de lo decorativo. */
  tag: 'útil' | 'irrelevante' | 'redundante'
}
export interface NumericAnswer {
  label: string
  value: number
  unit: string
  /** Tolerancia relativa (por defecto 3 %). */
  tolPct?: number
}
export interface Supuesto {
  label: string
  correcto: boolean
}
export interface TrainerProblem {
  familyId: string
  title: string
  chapter: number
  level: Nivel
  statement: string
  data: DataRow[]
  identificar: TrainerMCQ
  /** Solo niveles 2–3: cazar el dato irrelevante o redundante. */
  datos?: TrainerMCQ
  metodo: TrainerMCQ
  supuestos: Supuesto[]
  respuestas: NumericAnswer[]
  validacion: TrainerMCQ
  solucion: string[]
}
export interface TrainerFamily {
  id: string
  title: string
  chapter: number
  level: Nivel
  generate: () => TrainerProblem
}

export const rnd = (min: number, max: number, step = 1) =>
  Math.round((min + Math.random() * (max - min)) / step) * step

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
export const mcq = (question: string, options: TrainerOption[]): TrainerMCQ => ({
  question,
  options: shuffle(options),
})
