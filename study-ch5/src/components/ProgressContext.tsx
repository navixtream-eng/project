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
  'c1s1-check-ohm',
  'c1s1-check-fringing',
  'c1s1-problema-nucleo',
  'c1s2-check-histeresis',
  'c1s2-check-laminas',
  'c1s2-check-excitacion',
  'c1s2-problema-perdidas',
  'c2s1-check-vueltas',
  'c2s1-check-impedancia',
  'c2s1-problema-ideal',
  'c2s2-check-oc',
  'c2s2-check-sc',
  'c2s2-problema-ensayos',
  'c2s3-check-vr',
  'c2s3-check-pu',
  'c2s3-check-auto',
  'c2s3-problema-regulacion',
  'c3s1-check-almacen',
  'c3s1-check-coenergy',
  'c3s1-check-force-sign',
  'c3s1-problema-actuador',
  'c3s2-check-mutua',
  'c3s2-check-iman',
  'c3s2-problema-torque',
  'c4s1-check-entrehierro',
  'c4s1-check-devanados',
  'c4s1-problema-frecuencia',
  'c4s2-check-distribuido',
  'c4s2-check-electricos',
  'c4s2-problema-kd',
  'c4s3-check-torque',
  'c4s3-check-dispersion',
  'c4s3-check-lineal',
  'c4s3-problema-voltaje',
  's1-check-secuencia',
  's1-check-monofasico',
  's1-check-ns',
  's1-problema-hidro',
  's2-check-excitacion',
  's2-check-caida',
  's2-check-delta',
  's2-check-inductancias',
  's2-check-vcurva',
  's2-problema-generador',
  's2-problema-adelanto',
  's3-check-resorte',
  's3-check-mandos',
  's3-check-pmax',
  's3-problema-pdelta',
  's3-problema-excitacion',
  's4-check-limites',
  's4-check-motor',
  's4-check-condensador',
  's4-problema-carta',
  's4-problema-motor',
  's5-check-occ',
  's5-check-scc',
  's5-check-xsat',
  's5-problema-ensayos',
  's5-problema-comparacion',
  's6-check-fijas',
  's6-check-etamax',
  's6-check-fp',
  's6-problema-rendimiento',
  's6-problema-etamax',
  'c6s1-check-flujo',
  'c6s1-check-park',
  'c6s1-problema-eprima',
  'c6s2-check-periodos',
  'c6s2-check-dc',
  'c6s2-check-amortiguadores',
  'c6s2-problema-niveles',
  'c6s2-check-sistema',
  'c6s2-check-interruptor',
  'c6s2-problema-ejemplo101',
  'c6s3-check-transitoria',
  'c6s3-check-tcr',
  'c6s3-check-areas',
  'c6s3-problema-estabilidad',
  'c6s4-check-saliencia',
  'c6s4-check-td0',
  'c6s4-check-modelos',
  'c6s4-problema-curva',
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
