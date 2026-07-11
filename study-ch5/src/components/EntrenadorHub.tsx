import { useCallback, useEffect, useMemo, useState } from 'react'
import { Award, CheckCircle2, ChevronRight, Dices, Eye, Target, X, XCircle } from 'lucide-react'
import {
  CICLO,
  type Nivel,
  TRAINER_FAMILIES,
  type TrainerMCQ,
  type TrainerProblem,
} from '../lib/trainer'
import { fmt } from '../lib/machine'

const STATS_KEY = 'fku-entrenador-v1'

type Stats = Record<string, { ok: number; total: number }>

function loadStats(): Stats {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) ?? '{}') as Stats
  } catch {
    return {}
  }
}
function saveStats(s: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s))
  } catch {
    /* sin almacenamiento */
  }
}

const TAG_STYLE: Record<string, string> = {
  útil: 'bg-emerald-500/15 text-emerald-300',
  irrelevante: 'bg-red-500/15 text-red-300',
  redundante: 'bg-amber-500/15 text-amber-300',
}

/** Pregunta de opción múltiple con feedback por opción; se completa al acertar. */
function McqBlock({
  mcq,
  onDone,
}: {
  mcq: TrainerMCQ
  onDone: (firstTry: boolean) => void
}) {
  const [picked, setPicked] = useState<number[]>([])
  const solved = picked.some((i) => mcq.options[i]?.correct)
  const choose = (i: number) => {
    if (solved || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    if (mcq.options[i].correct) onDone(next.length === 1)
  }
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-200">{mcq.question}</p>
      <div className="space-y-1.5">
        {mcq.options.map((op, i) => {
          const chosen = picked.includes(i)
          return (
            <div key={op.label}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={solved && !chosen}
                className={`w-full rounded-lg border px-3 py-2 text-left text-xs leading-relaxed transition-colors ${
                  chosen
                    ? op.correct
                      ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-600/50 bg-red-500/10 text-red-200'
                    : 'border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span className="mr-1.5">
                  {chosen ? (op.correct ? '✓' : '✗') : '○'}
                </span>
                {op.label}
              </button>
              {chosen && (
                <p className={`mt-1 px-3 text-[11px] leading-relaxed ${op.correct ? 'text-emerald-300/90' : 'text-red-300/90'}`}>
                  {op.feedback}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const parseNum = (s: string): number => Number(s.trim().replace(',', '.'))

export default function EntrenadorHub({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nivel, setNivel] = useState<0 | Nivel>(0)
  const [problem, setProblem] = useState<TrainerProblem | null>(null)
  const [step, setStep] = useState(0) // índice en CICLO (0..6)
  const [methodFirstTry, setMethodFirstTry] = useState(true)
  const [usedSolution, setUsedSolution] = useState(false)
  const [supSel, setSupSel] = useState<number[]>([])
  const [supResult, setSupResult] = useState<null | boolean>(null)
  const [numVals, setNumVals] = useState<string[]>([])
  const [numResult, setNumResult] = useState<(boolean | null)[]>([])
  const [numAttempts, setNumAttempts] = useState(0)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)

  const nuevo = useCallback((lvl: 0 | Nivel) => {
    const pool = TRAINER_FAMILIES.filter((f) => lvl === 0 || f.level === lvl)
    const fam = pool[Math.floor(Math.random() * pool.length)]
    const p = fam.generate()
    setProblem(p)
    setStep(0)
    setMethodFirstTry(true)
    setUsedSolution(false)
    setSupSel([])
    setSupResult(null)
    setNumVals(p.respuestas.map(() => ''))
    setNumResult(p.respuestas.map(() => null))
    setNumAttempts(0)
    setFinished(false)
  }, [])

  useEffect(() => {
    if (open && !problem) nuevo(nivel)
  }, [open, problem, nivel, nuevo])

  const finish = useCallback(
    (p: TrainerProblem, mastered: boolean) => {
      setFinished(true)
      setStats((prev) => {
        const cur = prev[p.familyId] ?? { ok: 0, total: 0 }
        const next = { ...prev, [p.familyId]: { ok: cur.ok + (mastered ? 1 : 0), total: cur.total + 1 } }
        saveStats(next)
        return next
      })
    },
    [],
  )

  const nivelStats = useMemo(() => {
    return [1, 2, 3].map((lvl) => {
      const fams = TRAINER_FAMILIES.filter((f) => f.level === lvl)
      const dom = fams.filter((f) => (stats[f.id]?.ok ?? 0) > 0).length
      return { lvl, dom, total: fams.length }
    })
  }, [stats])

  if (!open) return null

  const advance = (to: number) => setStep((s) => Math.max(s, to))

  const checkSupuestos = () => {
    if (!problem) return
    const ok = problem.supuestos.every((sup, i) => sup.correcto === supSel.includes(i))
    setSupResult(ok)
    if (ok) advance(4)
  }

  const checkNumeric = () => {
    if (!problem) return
    const res = problem.respuestas.map((r, i) => {
      const v = parseNum(numVals[i])
      if (!Number.isFinite(v)) return false
      const tol = (r.tolPct ?? 3) / 100
      return Math.abs(v - r.value) <= Math.abs(r.value) * tol + 1e-9
    })
    setNumResult(res)
    setNumAttempts((a) => a + 1)
    if (res.every(Boolean)) advance(6)
  }

  const revealSolution = () => {
    if (!problem) return
    setUsedSolution(true)
    setNumVals(problem.respuestas.map((r) => String(Math.round(r.value * 1000) / 1000)))
    setNumResult(problem.respuestas.map(() => true))
    advance(6)
  }

  const mastered = methodFirstTry && !usedSolution

  return (
    <div className="tw-modal-overlay fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden border border-zinc-700 bg-zinc-950 sm:rounded-2xl">
        {/* Encabezado */}
        <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
          <Target size={15} className="text-emerald-400" />
          <h3 className="text-sm font-black text-zinc-100">Entrenador · el ciclo del ingeniero</h3>
          <div className="ml-auto flex items-center gap-1.5">
            {nivelStats.map(({ lvl, dom, total }) => (
              <span key={lvl} className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[9px] text-zinc-400">
                N{lvl}: <span className={dom === total ? 'text-emerald-400' : 'text-zinc-200'}>{dom}/{total}</span>
              </span>
            ))}
            <button type="button" onClick={onClose} aria-label="Cerrar"
              className="ml-1 text-zinc-500 transition-colors hover:text-zinc-200">
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Ciclo como stepper */}
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-4 py-2">
          {CICLO.map((label, i) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                i < step || finished
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : i === step
                    ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                    : 'bg-zinc-900 text-zinc-600'
              }`}>
                {i + 1}. {label}
              </span>
              {i < CICLO.length - 1 && <ChevronRight size={9} className="text-zinc-700" />}
            </span>
          ))}
        </div>

        {/* Barra de configuración */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-4 py-2 text-[10px]">
          <span className="font-bold uppercase tracking-widest text-zinc-500">Nivel:</span>
          {([0, 1, 2, 3] as const).map((l) => (
            <button key={l} type="button"
              onClick={() => { setNivel(l); nuevo(l) }}
              className={`rounded-md px-2 py-1 font-bold ${nivel === l ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {l === 0 ? 'Mixto' : ['', 'Básico', 'Intermedio', 'Avanzado'][l]}
            </button>
          ))}
          <button type="button" onClick={() => nuevo(nivel)}
            className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 font-bold text-white hover:bg-emerald-500">
            <Dices size={11} /> Nuevo problema
          </button>
        </div>

        {problem && (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Enunciado y datos */}
            <div className="mb-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-3">
              <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                {problem.title}
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">Cap. {problem.chapter}</span>
                <span className={`rounded px-1.5 py-0.5 ${['', 'bg-emerald-500/15 text-emerald-300', 'bg-amber-500/15 text-amber-300', 'bg-red-500/15 text-red-300'][problem.level]}`}>
                  {['', 'básico', 'intermedio', 'avanzado'][problem.level]}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-zinc-200">{problem.statement}</p>
              <table className="mt-2 w-full text-[11px]">
                <tbody>
                  {problem.data.map((d) => (
                    <tr key={d.label} className="border-t border-zinc-800">
                      <td className="py-1 pr-2 text-zinc-400">{d.label}</td>
                      <td className="py-1 font-mono text-zinc-200">{d.value}</td>
                      <td className="py-1 text-right">
                        {finished && (
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${TAG_STYLE[d.tag]}`}>{d.tag}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paso 1: Identificar */}
            <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">Paso 1 · Identificar la máquina / el fenómeno</p>
              <McqBlock key={`${problem.familyId}-id-${problem.statement.length}`} mcq={problem.identificar} onDone={() => advance(1)} />
            </div>

            {/* Paso 2: Interpretar datos */}
            {step >= 1 && (
              <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">Paso 2 · Interpretar los datos</p>
                {problem.datos ? (
                  <McqBlock key={`${problem.familyId}-datos`} mcq={problem.datos} onDone={() => advance(2)} />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-400">
                      Nivel básico: todos los datos son necesarios. En niveles 2–3 habrá datos irrelevantes,
                      redundantes y unidades mezcladas que deberás cazar tú.
                    </p>
                    {step === 1 && (
                      <button type="button" onClick={() => advance(2)}
                        className="shrink-0 rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-200 hover:bg-zinc-700">
                        Revisado →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Elegir modelo */}
            {step >= 2 && (
              <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">Paso 3 · Elegir el modelo (la decisión del examen)</p>
                <McqBlock key={`${problem.familyId}-met`} mcq={problem.metodo} onDone={(first) => { setMethodFirstTry(first); advance(3) }} />
              </div>
            )}

            {/* Paso 4: Supuestos */}
            {step >= 3 && (
              <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">Paso 4 · Declara tus supuestos (marca los que USA tu solución)</p>
                <div className="space-y-1">
                  {problem.supuestos.map((sup, i) => (
                    <label key={sup.label} className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 text-xs ${
                      supResult !== null
                        ? sup.correcto
                          ? 'bg-emerald-500/10 text-emerald-200'
                          : supSel.includes(i)
                            ? 'bg-red-500/10 text-red-200'
                            : 'text-zinc-400'
                        : 'text-zinc-300 hover:bg-zinc-900'
                    }`}>
                      <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-emerald-500"
                        checked={supSel.includes(i)}
                        disabled={supResult === true}
                        onChange={(e) => {
                          setSupResult(null)
                          setSupSel((prev) => e.target.checked ? [...prev, i] : prev.filter((x) => x !== i))
                        }} />
                      {sup.label}
                    </label>
                  ))}
                </div>
                {supResult !== true && (
                  <button type="button" onClick={checkSupuestos}
                    className="mt-2 rounded-md bg-sky-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-sky-500">
                    Comprobar supuestos
                  </button>
                )}
                {supResult === false && (
                  <p className="mt-1.5 text-[11px] text-red-300">
                    Aún no: hay supuestos válidos sin marcar o marcaste alguno FALSO. Un supuesto mal declarado
                    invalida la solución aunque el álgebra sea perfecta.
                  </p>
                )}
                {supResult === true && (
                  <p className="mt-1.5 text-[11px] text-emerald-300">✓ Supuestos correctos y completos — ya puedes calcular con la conciencia tranquila.</p>
                )}
              </div>
            )}

            {/* Pasos 5-6: Resolver + unidades y límites */}
            {step >= 4 && (
              <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">
                  Pasos 5–6 · Resuelve A MANO y comprueba unidades (tolerancia ±3 %)
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {problem.respuestas.map((r, i) => (
                    <label key={r.label} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-28 shrink-0">{r.label}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={numVals[i]}
                        disabled={numResult.every(Boolean) && numResult.length > 0 && step >= 6}
                        onChange={(e) => {
                          setNumVals((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                          setNumResult((prev) => prev.map((v, j) => (j === i ? null : v)))
                        }}
                        className={`w-full rounded-md border bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-100 outline-none ${
                          numResult[i] === true
                            ? 'border-emerald-600'
                            : numResult[i] === false
                              ? 'border-red-600'
                              : 'border-zinc-700 focus:border-sky-600'
                        }`}
                        placeholder="—"
                      />
                      <span className="w-14 shrink-0 font-mono text-[10px] text-zinc-500">{r.unit}</span>
                      {numResult[i] === true && <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />}
                      {numResult[i] === false && <XCircle size={13} className="shrink-0 text-red-400" />}
                    </label>
                  ))}
                </div>
                {!(step >= 6) && (
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={checkNumeric}
                      className="rounded-md bg-sky-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-sky-500">
                      Comprobar resultados
                    </button>
                    {numAttempts >= 2 && (
                      <button type="button" onClick={revealSolution}
                        className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700">
                        <Eye size={11} /> Ver solución (no cuenta como dominio)
                      </button>
                    )}
                    {numAttempts > 0 && !numResult.every(Boolean) && (
                      <span className="text-[10px] text-zinc-500">intento {numAttempts} · revisa conversiones de unidades</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Paso 7: Validación física */}
            {step >= 6 && (
              <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-400">Paso 7 · Valida físicamente el resultado</p>
                <McqBlock key={`${problem.familyId}-val`} mcq={problem.validacion} onDone={() => finish(problem, mastered)} />
              </div>
            )}

            {/* Cierre: solución, etiquetas y veredicto */}
            {finished && (
              <div className={`mb-3 rounded-xl border p-3 ${mastered ? 'border-emerald-600/50 bg-emerald-500/5' : 'border-amber-600/40 bg-amber-500/5'}`}>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-black">
                  <Award size={14} className={mastered ? 'text-emerald-400' : 'text-amber-400'} />
                  <span className={mastered ? 'text-emerald-300' : 'text-amber-300'}>
                    {mastered
                      ? 'DOMINADO: método al primer intento y resultado a mano.'
                      : 'PRACTICADO: completado, pero con tropiezos de método o mirando la solución — repite la familia otro día.'}
                  </span>
                </p>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Solución de referencia</p>
                <ol className="list-decimal space-y-1 pl-5 font-mono text-[11px] leading-relaxed text-zinc-300">
                  {problem.solucion.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <p className="mt-2 text-[11px] text-zinc-400">
                  Las etiquetas de la tabla de datos ya están reveladas: revisa cuáles eran útiles,
                  irrelevantes o redundantes.
                </p>
                <button type="button" onClick={() => nuevo(nivel)}
                  className="mt-2 flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500">
                  <Dices size={12} /> Siguiente problema
                </button>
              </div>
            )}

            <p className="pb-2 text-[10px] leading-relaxed text-zinc-600">
              Dominio por nivel = familias con al menos un problema resuelto con método al primer intento
              y números a mano ({fmt(TRAINER_FAMILIES.length, 0)} familias, valores aleatorios en cada intento).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
