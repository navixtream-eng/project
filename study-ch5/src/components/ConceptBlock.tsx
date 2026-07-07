import type { ReactNode } from 'react'
import { Lightbulb, Link2 } from 'lucide-react'

interface ConceptBlockProps {
  /** Número y título de la subsección, ej: "1.1 · El truco del imán giratorio" */
  title: string
  /** La idea en ≤ 3 frases, sin jerga (paso 1 de Feynman) */
  idea: string
  /** Analogía cotidiana que ancla el concepto */
  analogy?: string
  children?: ReactNode
}

/**
 * Bloque conceptual con la estructura Feynman: primero la idea desnuda,
 * luego la analogía, y solo después el desarrollo formal (children).
 */
export default function ConceptBlock({ title, idea, analogy, children }: ConceptBlockProps) {
  return (
    <section className="my-8">
      <h3 className="mb-3 text-lg font-bold text-zinc-100">{title}</h3>

      <div className="mb-3 flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <Lightbulb size={18} className="mt-0.5 shrink-0 text-emerald-400" />
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            La idea en simple
          </p>
          <p className="text-sm leading-relaxed text-zinc-200">{idea}</p>
        </div>
      </div>

      {analogy && (
        <div className="mb-3 flex gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          <Link2 size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Analogía
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">{analogy}</p>
          </div>
        </div>
      )}

      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  )
}
