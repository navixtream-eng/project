import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { armatureReaction, fmt } from '../lib/machine'

/** Paleta validada: campo solo azul, resultante naranja, saturación roja */
const C = { field: '#3987e5', result: '#e2761f', sat: '#e66767', neutral: '#9085e9', grid: '#27272a', muted: '#71717a' }

const W = 440
const H = 220
const PADX = 30
const PADY = 24

/**
 * Laboratorio — Reacción de armadura.
 * La FMM de la propia corriente de armadura, cruzada al campo, apila el flujo
 * en una punta polar y lo vacía en la otra: el eje neutro se desplaza y la
 * saturación de la punta apilada roba flujo neto. Interpolos y devanados de
 * compensación lo restauran.
 */
export default function ArmatureReactionLab() {
  const [IaRel, setIaRel] = useState(0.6)
  const [comp, setComp] = useState(false)

  const res = armatureReaction(IaRel, comp)
  const Bmax = 1.4
  const px = (x: number) => PADX + ((x + 1) / 2) * (W - PADX - 12)
  const py = (b: number) => H - PADY - (b / Bmax) * (H - 2 * PADY)

  const resultPath = res.xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${px(x).toFixed(1)} ${py(res.b[i]).toFixed(1)}`).join(' ')
  const fieldY = py(1.0)
  const satY = py(1.35)
  // Eje neutro: se desplaza hacia la punta apilada (x > 0)
  const neutralX = px(res.neutralShiftDeg / 30) // 0..1 mapeado del shift (máx 30°)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Reacción de armadura: el flujo se ladea
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-orange-300">Corriente de armadura Ia</span>
          <input type="range" min={0} max={1} step={0.02} value={IaRel} onChange={(e) => setIaRel(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{(IaRel * 100).toFixed(0)} %</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-300">
          <input type="checkbox" checked={comp} onChange={(e) => setComp(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-500" />
          Interpolos + compensación
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full shrink-0 select-none sm:max-w-md">
          {/* Marco del arco polar */}
          <rect x={PADX} y={PADY} width={W - PADX - 12} height={H - 2 * PADY} fill="none" stroke={C.grid} />
          <text x={PADX} y={16} fill={C.muted} fontSize={10}>B(x) bajo el arco polar</text>
          <text x={px(-1)} y={H - 8} fill={C.muted} fontSize={9}>punta de entrada</text>
          <text x={px(1) - 60} y={H - 8} fill={C.muted} fontSize={9}>punta de salida</text>
          {/* Saturación */}
          <line x1={PADX} y1={satY} x2={W - 12} y2={satY} stroke={C.sat} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
          <text x={W - 60} y={satY - 3} fill={C.sat} fontSize={9}>saturación</text>
          {/* Campo solo (referencia) */}
          <line x1={PADX} y1={fieldY} x2={W - 12} y2={fieldY} stroke={C.field} strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={PADX + 4} y={fieldY - 4} fill={C.field} fontSize={9}>solo campo</text>
          {/* Centro geométrico */}
          <line x1={px(0)} y1={PADY} x2={px(0)} y2={H - PADY} stroke={C.grid} strokeWidth={1} />
          {/* Resultante */}
          <path d={resultPath} fill="none" stroke={C.result} strokeWidth={2.6} />
          {/* Eje neutro desplazado */}
          {!comp && res.neutralShiftDeg > 0.5 && (
            <>
              <line x1={neutralX} y1={PADY} x2={neutralX} y2={H - PADY} stroke={C.neutral} strokeWidth={2} strokeDasharray="3 3" />
              <text x={neutralX + 3} y={PADY + 10} fill={C.neutral} fontSize={9} fontWeight={700}>neutro↗</text>
            </>
          )}
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Desplazamiento del neutro</p>
            <p className={`font-mono text-sm font-semibold ${res.neutralShiftDeg > 0.5 ? 'text-violet-300' : 'text-emerald-300'}`}>
              {fmt(res.neutralShiftDeg, 1)}°
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Pérdida neta de flujo</p>
            <p className={`font-mono text-sm font-semibold ${res.fluxLoss > 0.01 ? 'text-red-300' : 'text-emerald-300'}`}>
              {fmt(res.fluxLoss * 100, 1)} %
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            {comp
              ? 'Con interpolos y devanado de compensación, la FMM de armadura se cancela punta a punta: el flujo vuelve a ser simétrico, el neutro no se mueve y las escobillas conmutan sin chispas.'
              : 'La corriente de armadura ladea el flujo: se apila a la derecha (satura y se recorta) y se vacía a la izquierda. El eje neutro se corre y las escobillas, si no se recolocan, conmutan bajo tensión → chispas.'}
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube <span className="text-orange-300">Ia</span>: la curva de flujo se inclina — una punta
        polar se apila hasta saturar (línea roja) y la otra se vacía; el eje neutro (violeta) se
        desplaza; (2) nota la <span className="text-red-300">pérdida neta de flujo</span>: como la punta
        apilada satura, NO compensa lo que pierde la otra — la reacción de armadura DEBILITA el campo;
        (3) activa <span className="text-emerald-300">interpolos + compensación</span>: la distorsión
        desaparece, el neutro se queda quieto y la conmutación vuelve a ser limpia.
      </footer>
    </div>
  )
}
