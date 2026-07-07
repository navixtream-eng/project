import { useState } from 'react'
import { BrainCircuit, Check, CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { useProgress, type CheckId } from './ProgressContext'

export interface CheckOption {
  label: string
  correct?: boolean
  /** Retroalimentación específica de ESTA opción (por qué sí / por qué no) */
  feedback: string
}

interface FeynmanCheckProps {
  id: CheckId
  /** La predicción que se le pide al estudiante ANTES de tocar el widget */
  question: string
  options: CheckOption[]
}

/**
 * Chequeo Feynman: obliga a PREDECIR antes de ver la respuesta.
 * No hay lectura pasiva posible — hay que comprometerse con una opción,
 * recibir el porqué, y solo entonces el hito cuenta para el progreso.
 */
export default function FeynmanCheck({ id, question, options }: FeynmanCheckProps) {
  const { completed, markDone } = useProgress()
  const [picked, setPicked] = useState<number | null>(null)
  const done = completed.has(id)

  const pickedCorrect = picked !== null && options[picked].correct === true

  const handlePick = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (options[i].correct) markDone(id)
  }

  return (
    <div
      className={`my-6 rounded-xl border p-4 transition-colors ${
        done
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-violet-500/40 bg-violet-500/5'
      }`}
    >
      <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
        <BrainCircuit size={14} />
        Predice antes de mirar
        {done && (
          <span className="ml-auto flex items-center gap-1 text-emerald-400">
            <Check size={12} /> superado
          </span>
        )}
      </p>
      <p className="mb-3 text-sm font-medium leading-relaxed text-zinc-100">{question}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          const revealed = picked !== null
          const isPicked = picked === i
          const style = !revealed
            ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-violet-400 hover:bg-violet-500/10 cursor-pointer'
            : opt.correct
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
              : isPicked
                ? 'border-red-500/60 bg-red-500/10 text-red-200'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
          return (
            <button
              key={opt.label}
              type="button"
              disabled={picked !== null}
              onClick={() => handlePick(i)}
              className={`flex items-start gap-2 rounded-lg border p-2.5 text-left text-xs leading-snug transition-colors ${style}`}
            >
              {picked !== null &&
                (opt.correct ? (
                  <CircleCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                ) : isPicked ? (
                  <CircleX size={14} className="mt-0.5 shrink-0 text-red-400" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                ))}
              {opt.label}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3 text-xs leading-relaxed">
          <p className={pickedCorrect ? 'text-emerald-200' : 'text-red-200'}>
            <span className="font-bold">{pickedCorrect ? '✓ Correcto. ' : '✗ Aún no. '}</span>
            {options[picked].feedback}
          </p>
          {!pickedCorrect && (
            <>
              <p className="text-zinc-400">
                <span className="font-semibold text-emerald-300">La respuesta: </span>
                {options.find((o) => o.correct)?.feedback}
              </p>
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-500"
              >
                <RotateCcw size={11} />
                Reintentar hasta poder explicarlo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
