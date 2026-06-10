import { useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  text: ReactNode
}

/** Icono de información con panel emergente didáctico al pasar el cursor o enfocar. */
export default function Tooltip({ text }: TooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Más información"
        className="text-zinc-500 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none transition-colors"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <Info size={13} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-5 top-1/2 -translate-y-1/2 z-50 w-64 rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-xs leading-relaxed text-zinc-300 shadow-xl shadow-black/50 backdrop-blur"
        >
          {text}
        </span>
      )}
    </span>
  )
}
