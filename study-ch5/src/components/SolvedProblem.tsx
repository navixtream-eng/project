import { useState, type ReactNode } from 'react'
import { ChevronRight, FileText, Flag, HelpCircle } from 'lucide-react'
import { InlineMath } from './Formula'
import { useProgress, type CheckId } from './ProgressContext'

export interface ProblemStep {
  title: string
  /** El PORQUÉ del paso, antes del cómo (razonamiento, no receta) */
  why: string
  /** Desarrollo en LaTeX (fórmula + sustitución numérica) */
  work?: string
  /** Nota al pie del paso (advertencias, convenciones) */
  note?: string
}

interface SolvedProblemProps {
  id: CheckId
  numero: string
  title: string
  statement: ReactNode
  steps: ProblemStep[]
  /** Resultado final en LaTeX */
  answer: string
  /** Moraleja del problema (qué debe quedar grabado) */
  takeaway: string
}

/**
 * Problema resuelto con revelado progresivo: cada paso muestra primero el
 * porqué y luego el desarrollo. Los valores numéricos vienen CALCULADOS por
 * la librería (lib/machine.ts), no tecleados a mano — garantía de coherencia.
 */
export default function SolvedProblem({
  id,
  numero,
  title,
  statement,
  steps,
  answer,
  takeaway,
}: SolvedProblemProps) {
  const { completed, markDone } = useProgress()
  const [revealed, setRevealed] = useState(completed.has(id) ? steps.length + 1 : 0)
  const finished = revealed > steps.length

  const advance = () => {
    const next = revealed + 1
    setRevealed(next)
    if (next > steps.length) markDone(id)
  }

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-sky-500/30">
      <header className="flex items-center gap-2 border-b border-sky-500/20 bg-sky-500/10 px-4 py-2.5">
        <FileText size={15} className="text-sky-400" />
        <h4 className="text-sm font-bold text-sky-200">
          Problema {numero} — {title}
        </h4>
        <span className="ml-auto font-mono text-[10px] text-sky-300/70">
          {Math.min(revealed, steps.length)}/{steps.length} pasos
        </span>
      </header>

      <div className="space-y-4 bg-zinc-900/40 p-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm leading-relaxed text-zinc-300">
          {statement}
        </div>

        {revealed === 0 && (
          <p className="flex items-center gap-2 text-xs italic text-zinc-500">
            <HelpCircle size={13} />
            Antes de revelar nada: intenta plantear tú el primer paso en papel. Luego compara.
          </p>
        )}

        {steps.slice(0, revealed).map((step, i) => (
          <div key={step.title} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <p className="mb-1 text-xs font-bold text-zinc-100">
              Paso {i + 1} · {step.title}
            </p>
            <p className="mb-2 text-xs leading-relaxed text-amber-200/90">
              <span className="font-semibold">¿Por qué? </span>
              {step.why}
            </p>
            {step.work && (
              <div className="overflow-x-auto rounded-md bg-zinc-900 px-3 py-2">
                <InlineMath latex={step.work} />
              </div>
            )}
            {step.note && <p className="mt-2 text-[11px] italic text-zinc-500">{step.note}</p>}
          </div>
        ))}

        {finished && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Flag size={13} /> Resultado
            </p>
            <div className="overflow-x-auto py-1">
              <InlineMath latex={answer} />
            </div>
            <p className="mt-2 border-t border-emerald-500/20 pt-2 text-xs leading-relaxed text-emerald-100/80">
              <span className="font-semibold">Para llevar: </span>
              {takeaway}
            </p>
          </div>
        )}

        {!finished && (
          <button
            type="button"
            onClick={advance}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-500"
          >
            {revealed === 0 ? 'Revelar paso 1' : revealed < steps.length ? `Revelar paso ${revealed + 1}` : 'Ver resultado'}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
