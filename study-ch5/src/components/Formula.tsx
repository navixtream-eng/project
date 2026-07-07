import { useMemo, useState } from 'react'
import katex from 'katex'

export interface SymbolInfo {
  /** El símbolo en LaTeX, ej: "X_s" */
  sym: string
  /** Qué significa físicamente */
  meaning: string
}

interface FormulaProps {
  latex: string
  /** Modo display (centrado, grande). Por defecto true. */
  display?: boolean
  /** Glosario de símbolos: chips clickeables debajo de la fórmula */
  symbols?: SymbolInfo[]
  /** Etiqueta tipo "(5.1)" al margen */
  tag?: string
}

function Katex({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(latex, { displayMode: display, throwOnError: false }),
    [latex, display],
  )
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/**
 * Fórmula renderizada con KaTeX + glosario interactivo de símbolos:
 * cada símbolo es un chip; al pulsarlo se muestra su significado físico.
 * Objetivo Feynman: que ninguna letra pase sin ser entendida.
 */
export default function Formula({ latex, display = true, symbols, tag }: FormulaProps) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <figure className="my-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="relative overflow-x-auto py-1 text-lg">
        <Katex latex={latex} display={display} />
        {tag && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
            {tag}
          </span>
        )}
      </div>
      {symbols && symbols.length > 0 && (
        <figcaption className="mt-2 border-t border-zinc-800 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {symbols.map((s, i) => (
              <button
                key={s.sym}
                type="button"
                onClick={() => setActive(active === i ? null : i)}
                className={`rounded-md border px-2 py-0.5 text-sm transition-colors ${
                  active === i
                    ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <Katex latex={s.sym} />
              </button>
            ))}
          </div>
          {active !== null && (
            <p className="mt-2 text-xs leading-relaxed text-emerald-200/90">
              <Katex latex={symbols[active].sym} />
              <span className="text-zinc-300"> — {symbols[active].meaning}</span>
            </p>
          )}
          {active === null && (
            <p className="mt-1.5 text-[10px] italic text-zinc-600">
              Pulsa cada símbolo hasta poder explicarlos todos sin mirar.
            </p>
          )}
        </figcaption>
      )}
    </figure>
  )
}

/** Fórmula en línea dentro de un párrafo. */
export function InlineMath({ latex }: { latex: string }) {
  return <Katex latex={latex} />
}
