import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { fmt, reactiveShare, toDeg } from '../lib/machine'

// Sistema por unidad: dos generadores idénticos, carga fija fp 0.8 atraso
const VT = 1
const PL = 1.6
const QL = 1.2
const XS = 0.8

/**
 * Laboratorio — Reparto de potencia reactiva con la excitación (Fig. 5-30).
 * Los fasores del libro, vivos: V̂t y la corriente de carga ÎL no cambian;
 * al subir If₁ (y bajar If₂ para sostener V̂t) los reactivos migran al
 * generador 1 mientras las potencias ACTIVAS no se mueven — Eaf·sen δ es
 * constante. Incluye el mapa de decisión del operador (P↔gobernador,
 * Q↔excitación).
 */
export default function ReactiveShareLab() {
  const [dQpct, setDQpct] = useState(0) // desplazamiento de reactivos hacia G1 [% de QL/2]

  const dQ = (dQpct / 100) * (QL / 2)
  const { g1, g2 } = reactiveShare(VT, PL, QL, dQ, XS)
  const base = reactiveShare(VT, PL, QL, 0, XS)

  // --- Geometría SVG (viewBox 640×330), origen fasorial a la izquierda ---
  const OX = 70
  const OY = 125
  const S = 145 // px por unidad
  const px = (re: number, im: number) => ({ x: OX + re * S, y: OY - im * S })

  const arrow = (
    re: number,
    im: number,
    color: string,
    label: string,
    opts: { dash?: boolean; w?: number; dy?: number } = {},
  ) => {
    const tip = px(re, im)
    const ang = Math.atan2(-(tip.y - OY), tip.x - OX)
    const ah = 8
    return (
      <g key={label + color}>
        <line x1={OX} y1={OY} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={opts.w ?? 2.2}
          strokeDasharray={opts.dash ? '4 4' : undefined} opacity={opts.dash ? 0.45 : 1} />
        {!opts.dash && (
          <polygon
            points={`${tip.x},${tip.y} ${tip.x - ah * Math.cos(ang - 0.42)},${tip.y + ah * Math.sin(ang - 0.42)} ${tip.x - ah * Math.cos(ang + 0.42)},${tip.y + ah * Math.sin(ang + 0.42)}`}
            fill={color}
          />
        )}
        <text x={tip.x + 6} y={tip.y + (opts.dy ?? 0)} fill={color} fontSize={11} opacity={opts.dash ? 0.5 : 1}>
          {opts.dash ? '' : label}
        </text>
      </g>
    )
  }

  // Corriente de carga total (no cambia): IL = Ia1 + Ia2
  const iL = { re: g1.Ia.re + g2.Ia.re, im: g1.Ia.im + g2.Ia.im }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Excitación y reparto de reactivos (Fig. 5-30)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-fuchsia-300">↑ If₁ y ↓ If₂ (V̂t se sostiene)</span>
          <input type="range" min={0} max={100} step={1} value={dQpct}
            onChange={(e) => setDQpct(Number(e.target.value))} className="flex-1" />
          <span className="w-24 font-mono text-zinc-200">ΔQ = {fmt(dQ, 2)} pu</span>
        </label>
      </div>

      <div className="px-2 py-1">
        <svg viewBox="0 0 640 330" className="h-auto w-full">
          {/* Ejes */}
          <line x1={20} y1={OY} x2={620} y2={OY} stroke="#27272a" />
          <line x1={OX} y1={16} x2={OX} y2={318} stroke="#27272a" />

          {/* Estado inicial (reparto igual) en fantasma */}
          {arrow(base.g1.Eaf.re, base.g1.Eaf.im, '#e879f9', '', { dash: true })}
          {arrow(base.g1.Ia.re, base.g1.Ia.im, '#e879f9', '', { dash: true })}

          {/* V̂t y ÎL (fijos) */}
          {arrow(VT, 0, '#3b82f6', 'V̂t', { w: 3, dy: -8 })}
          {arrow(iL.re, iL.im, '#a1a1aa', 'ÎL (carga, fija)')}

          {/* Generador 1 (más excitado) */}
          {arrow(g1.Eaf.re, g1.Eaf.im, '#e879f9', `Êaf1 = ${fmt(g1.mag, 2)}`)}
          {arrow(g1.Ia.re, g1.Ia.im, '#f0abfc', `Îa1 (${fmt(Math.hypot(g1.Ia.re, g1.Ia.im), 2)})`, { dy: 12 })}

          {/* Generador 2 (menos excitado) */}
          {arrow(g2.Eaf.re, g2.Eaf.im, '#f59e0b', `Êaf2 = ${fmt(g2.mag, 2)}`, { dy: -4 })}
          {arrow(g2.Ia.re, g2.Ia.im, '#fcd34d', `Îa2 (${fmt(Math.hypot(g2.Ia.re, g2.Ia.im), 2)})`, { dy: 12 })}

          {/* Guía: Eaf·sen δ constante (línea horizontal por las puntas) */}
          <line x1={OX} y1={px(0, g1.Eaf.im).y} x2={620} y2={px(0, g1.Eaf.im).y}
            stroke="#10b981" strokeDasharray="5 5" strokeWidth={1} opacity={0.6} />
          <text x={455} y={px(0, g1.Eaf.im).y - 5} fill="#10b981" fontSize={10}>
            Eaf·sen δ = cte → P no cambia
          </text>
          <text x={26} y={34} fill="#71717a" fontSize={10}>
            fasores por unidad · punteado = reparto igual inicial
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Q₁ / Q₂ [pu]</p>
          <p className="font-mono text-sm font-semibold">
            <span className="text-fuchsia-300">{fmt(g1.Q, 2)}</span>{' · '}
            <span className="text-amber-300">{fmt(g2.Q, 2)}</span>
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">P₁ / P₂ [pu]</p>
          <p className="font-mono text-sm font-semibold text-emerald-300">{fmt(g1.P, 2)} · {fmt(g2.P, 2)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">fp₁ / fp₂</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            {fmt(g1.fp, 2)} · {fmt(g2.fp, 2)}{g2.Q < -1e-9 ? ' (adelanto)' : g2.Q < 0.01 ? ' (unitario)' : ''}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">δ₁ / δ₂</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            {fmt(toDeg(g1.delta), 1)}° · {fmt(toDeg(g2.delta), 1)}°
          </p>
        </div>
      </div>

      {/* Mapa de decisión del operador */}
      <div className="mx-3 mb-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Mapa de decisión del operador (los DOS mandos y qué mueve cada uno)
        </p>
        <div className="grid gap-2 text-[11px] sm:grid-cols-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-sky-700 bg-sky-500/10 px-2 py-1 font-semibold text-sky-300">¿f baja o P mal repartida?</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-300">mover GOBERNADORES (vapor/agua)</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-md border border-emerald-700 bg-emerald-500/10 px-2 py-1 text-emerald-300">cambian f y los MW</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-fuchsia-700 bg-fuchsia-500/10 px-2 py-1 font-semibold text-fuchsia-300">¿V baja o Q mal repartida?</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-300">mover EXCITACIONES (If)</span>
            <span className="text-zinc-600">→</span>
            <span className="rounded-md border border-emerald-700 bg-emerald-500/10 px-2 py-1 text-emerald-300">cambian V̂t y los kVAR</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-zinc-400">
          Regla de oro: <strong className="text-zinc-200">potencia activa ↔ máquina impulsora</strong>{' '}
          · <strong className="text-zinc-200">potencia reactiva ↔ excitación</strong>. Los dos lazos
          son (casi) independientes — por eso la red se puede operar.
        </p>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) desliza hasta el 100%: el generador 1 asume TODOS los reactivos y el 2 queda a fp
        unitario (Îa2 horizontal, en fase con V̂t) — exactamente el caso punteado de la Fig. 5-30;
        (2) observa que las PUNTAS de Êaf1 y Êaf2 viajan sobre la línea verde horizontal: Eaf·sen δ
        no cambia porque nadie tocó los gobernadores — la potencia activa de cada máquina queda
        clavada; (3) mira los módulos de Îa: el generador sobreexcitado carga con MÁS corriente por
        los mismos MW — repartir mal los reactivos calienta devanados sin producir un solo watt más.
      </footer>
    </div>
  )
}
