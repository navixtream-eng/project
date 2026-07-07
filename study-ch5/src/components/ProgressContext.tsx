import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * Registro central de todos los hitos evaluables del documento
 * (chequeos Feynman y problemas resueltos). El porcentaje de avance
 * se calcula contra esta lista, no contra lo que haya en pantalla.
 */
export const ALL_CHECK_IDS = [
  's1-check-secuencia',
  's1-check-monofasico',
  's1-check-ns',
  's1-problema-hidro',
  's2-check-excitacion',
  's2-check-caida',
  's2-check-delta',
  's2-check-vcurva',
  's2-problema-generador',
  's2-problema-adelanto',
  's3-check-resorte',
  's3-check-mandos',
  's3-check-pmax',
  's3-problema-pdelta',
  's3-problema-excitacion',
] as const

export type CheckId = (typeof ALL_CHECK_IDS)[number]

interface ProgressState {
  completed: Set<CheckId>
  markDone: (id: CheckId) => void
  reset: () => void
  percent: number
}

const ProgressContext = createContext<ProgressState | null>(null)

const STORAGE_KEY = 'fku-ch5-progress'

function loadStored(): Set<CheckId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr.filter((id): id is CheckId => (ALL_CHECK_IDS as readonly string[]).includes(id)))
  } catch {
    return new Set()
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<Set<CheckId>>(loadStored)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
  }, [completed])

  const markDone = useCallback((id: CheckId) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const reset = useCallback(() => setCompleted(new Set()), [])

  const value = useMemo<ProgressState>(
    () => ({
      completed,
      markDone,
      reset,
      percent: Math.round((completed.size / ALL_CHECK_IDS.length) * 100),
    }),
    [completed, markDone, reset],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressState {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress debe usarse dentro de <ProgressProvider>')
  return ctx
}
