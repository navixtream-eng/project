import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { MU0, pmOperatingPoint } from '../lib/machine'

/** Paleta validada: demag azul, recta de carga amarilla, punto rojo, BH violeta */
const COLORS = { demag: '#3987e5', load: '#c98500', point: '#e66767', bh: '#9085e9', grid: '#27272a', muted: '#71717a' }

/** Neodimio típico: Br ≈ 1.2 T, Hc ≈ 900 kA/m ⇒ μrec ≈ Br/(μ0·Hc) */
const BR = 1.2
const HC = 900e3
const MUREC = BR / (MU0 * HC)

const W = 400
const H = 300
const OX = W - 30 // origen a la derecha (H ≤ 0)
const OY = 250
const HMIN = -1000e3 // A/m (eje va hacia la izquierda)
const BMAXP = 1.4
const SX = (OX - 40) / -HMIN
const SY = (OY - 20) / BMAXP

const px = (Hm: number) => OX + Hm * SX // Hm < 0 → a la izquierda
const py = (Bm: number) => OY - Bm * SY

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El punto de operación de un imán permanente.
 * El imán no tiene bobina: su estado lo fija la intersección de la curva
 * de desmagnetización (segundo cuadrante) con la recta de carga que impone
 * la geometría del circuito magnético (el gap). Gap grande = recta tumbada
 * = punto bajo (poco B). El producto |BH| mide la energía disponible.
 */
export default function PermanentMagnetLab() {
  const [permeance, setPermeance] = useState(3) // adimensional (proporcional a Am·lm/(Ag·g))

  const op = pmOperatingPoint(BR, MUREC, permeance)
  const Bg = op.Bm // aprox: B en el gap ≈ Bm del imán (mismo flujo, áreas iguales)

  // Curva de desmagnetización (recta Bm = Br + μrec·μ0·Hm); codo en Bm = 0
  const Hknee = -BR / (MUREC * MU0)
  const demagPath = `M ${px(0)} ${py(BR)} L ${px(Hknee)} ${py(0)}`
  // Recta de carga: Bm = −permeance·μ0·Hm
  const loadHend = -BMAXP / (permeance * MU0)
  const loadPath = `M ${px(0)} ${py(0)} L ${px(Math.max(HMIN, loadHend))} ${py(permeance * MU0 * -Math.max(HMIN, loadHend))}`

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El imán permanente — punto de operación y recta de carga
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Permeancia del circuito (gap ↓ = permeancia ↑)</span>
          <input type="range" min={0.3} max={12} step={0.1} value={permeance}
            onChange={(e) => setPermeance(Number(e.target.value))} className="w-40" />
          <span className="w-10 font-mono text-zinc-200">{permeance.toFixed(1)}</span>
        </label>
        <span className="text-[10px] text-zinc-500">Neodimio: Br = {BR} T, μrec ≈ {MUREC.toFixed(2)}</span>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md shrink-0 select-none">
          {/* Ejes (segundo cuadrante: H ≤ 0, B ≥ 0) */}
          <line x1={40} y1={OY} x2={OX + 4} y2={OY} stroke="#52525b" strokeWidth={1.5} />
          <line x1={OX} y1={OY} x2={OX} y2={16} stroke="#52525b" strokeWidth={1.5} />
          <text x={44} y={OY + 16} fill={COLORS.muted} fontSize={10}>← −H [A/m]</text>
          <text x={OX - 26} y={24} fill={COLORS.muted} fontSize={11}>B [T]</text>
          {/* Producto de energía: rectángulo |Bm·Hm| */}
          <rect x={px(op.Hm)} y={py(op.Bm)} width={px(0) - px(op.Hm)} height={py(0) - py(op.Bm)}
            fill={COLORS.bh} fillOpacity={0.16} />
          {/* Curva de desmagnetización */}
          <path d={demagPath} stroke={COLORS.demag} strokeWidth={2.4} fill="none" />
          <text x={px(0) - 60} y={py(BR) - 6} fill={COLORS.demag} fontSize={11} fontWeight={700}>Br</text>
          {/* Recta de carga */}
          <path d={loadPath} stroke={COLORS.load} strokeWidth={2} strokeDasharray="6 4" fill="none" />
          <text x={px(op.Hm) - 8} y={py(op.Bm) - 60} fill={COLORS.load} fontSize={10} fontWeight={700}>recta de carga</text>
          {/* Punto de operación */}
          <circle cx={px(op.Hm)} cy={py(op.Bm)} r={6} fill={COLORS.point} stroke="#fafafa" strokeWidth={1.5} />
          <text x={px(op.Hm) + 8} y={py(op.Bm) - 8} fill={COLORS.point} fontSize={11} fontWeight={700}>punto Q</text>
          <text x={px(0) - 90} y={py(op.Bm * 0.5)} fill={COLORS.bh} fontSize={10} fontWeight={700}>|BH|</text>
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="Bm (en el punto Q)" value={`${op.Bm.toFixed(3)} T`} accent="text-sky-300" />
          <Readout label="Hm (en el punto Q)" value={`${(op.Hm / 1000).toFixed(0)} kA/m`} />
          <Readout label="B en el gap" value={`${Bg.toFixed(3)} T`} accent="text-emerald-300" />
          <Readout label="Producto |BH|" value={`${(op.energyProduct / 1000).toFixed(1)} kJ/m³`}
            accent="text-violet-300" />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            El imán se «auto-excita»: sin bobina, opera donde su recta de carga corta la curva de
            desmagnetización. Cerrar el gap endereza la recta y sube el punto Q hacia Br.
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube la permeancia (cierra el gap): la recta de carga se endereza y el punto Q trepa hacia
        Br — un imán en circuito cerrado da casi todo su flujo; (2) ábrelo (permeancia baja): Q cae y el
        imán entrega poco B, aunque su Br siga siendo el mismo — el flujo útil lo decide la GEOMETRÍA,
        no solo el material; (3) el producto |BH| (rectángulo violeta) es máximo en un punto
        intermedio: ahí el imán entrega la máxima energía al entrehierro — el criterio con el que se
        diseñan los motores de imán permanente.
      </footer>
    </div>
  )
}
