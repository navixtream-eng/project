import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_FOC, focFlux, focTorque } from '../lib/machine'

/** Paleta validada: flujo/eje-d azul, par/eje-q ámbar, vector violeta */
const C = { d: '#3987e5', q: '#c98500', vec: '#9085e9', grid: '#27272a', muted: '#71717a' }

const W = 300
const H = 260
const OX = W / 2
const OY = H / 2
const SC = 9 // px por amperio

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Control vectorial (FOC): el desacoplamiento.
 * Alineando el marco síncrono con el flujo del rotor, id controla SOLO el
 * flujo y iq controla SOLO el par — como la corriente de campo y la de
 * armadura de una máquina de CD. Dos perillas independientes.
 */
export default function FocLab() {
  const p = DEFAULT_FOC
  const [id, setId] = useState(5)
  const [iq, setIq] = useState(12)

  const lambdaR = focFlux(p.Lm, id)
  const T = focTorque(p, id, iq)
  const Imag = Math.hypot(id, iq)
  const angle = (Math.atan2(iq, id) * 180) / Math.PI

  // Referencias para las barras (valores nominales)
  const fluxMax = focFlux(p.Lm, 8)
  const Tmax = focTorque(p, 8, 20)

  const vx = OX + id * SC
  const vy = OY - iq * SC

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Control vectorial (FOC): id → flujo, iq → par
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-sky-300">id (flujo)</span>
          <input type="range" min={1} max={8} step={0.1} value={id}
            onChange={(e) => setId(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{id.toFixed(1)} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-amber-300">iq (par)</span>
          <input type="range" min={-20} max={20} step={0.5} value={iq}
            onChange={(e) => setIq(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{iq.toFixed(1)} A</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full shrink-0 select-none sm:w-72">
          {/* Ejes d-q */}
          <line x1={20} y1={OY} x2={W - 12} y2={OY} stroke={C.d} strokeWidth={1.5} opacity={0.6} />
          <line x1={OX} y1={H - 14} x2={OX} y2={12} stroke={C.q} strokeWidth={1.5} opacity={0.6} />
          <text x={W - 30} y={OY - 6} fill={C.d} fontSize={11} fontWeight={700}>d (flujo)</text>
          <text x={OX + 6} y={20} fill={C.q} fontSize={11} fontWeight={700}>q (par)</text>
          {/* Proyecciones */}
          <line x1={OX} y1={OY} x2={vx} y2={OY} stroke={C.d} strokeWidth={4} opacity={0.55} />
          <line x1={vx} y1={OY} x2={vx} y2={vy} stroke={C.q} strokeWidth={4} opacity={0.55} />
          {/* Vector de corriente */}
          <line x1={OX} y1={OY} x2={vx} y2={vy} stroke={C.vec} strokeWidth={3} />
          <circle cx={vx} cy={vy} r={5} fill={C.vec} stroke="#fafafa" strokeWidth={1.5} />
          <text x={OX + id * SC * 0.5 - 8} y={OY + 14} fill={C.d} fontSize={10} fontWeight={700}>id</text>
          <text x={vx + 4} y={(OY + vy) / 2} fill={C.q} fontSize={10} fontWeight={700}>iq</text>
        </svg>

        <div className="flex-1 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Flujo rotor λr = Lm·id" value={`${lambdaR.toFixed(3)} Wb`} accent="text-sky-300" />
            <Readout label="Par T ∝ λr·iq" value={`${T.toFixed(2)} N·m`} accent="text-amber-300" />
            <Readout label="|i| corriente total" value={`${Imag.toFixed(1)} A`} />
            <Readout label="ángulo del vector" value={`${angle.toFixed(0)}°`} />
          </div>
          {/* Barras de desacoplamiento */}
          <div className="mt-3 space-y-2">
            <div>
              <p className="mb-0.5 text-[10px] text-zinc-500">Canal de FLUJO (solo id)</p>
              <div className="h-3 w-full overflow-hidden rounded bg-zinc-900">
                <div className="h-full rounded bg-sky-500/70" style={{ width: `${Math.min(100, (lambdaR / fluxMax) * 100)}%` }} />
              </div>
            </div>
            <div>
              <p className="mb-0.5 text-[10px] text-zinc-500">Canal de PAR (iq, escalado por el flujo)</p>
              <div className="relative h-3 w-full overflow-hidden rounded bg-zinc-900">
                <div className={`h-full rounded ${T >= 0 ? 'bg-amber-500/70' : 'bg-red-500/70'}`}
                  style={{ width: `${Math.min(100, (Math.abs(T) / Tmax) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) mueve <span className="text-amber-300">iq</span> y observa: el par cambia al instante pero
        el flujo (barra azul) NO se inmuta — son perillas independientes, justo como en una máquina de
        CD la corriente de armadura no toca el campo; (2) mueve <span className="text-sky-300">id</span>:
        cambia el flujo… y también el par, porque T ∝ λr·iq — el par se apoya en el flujo, así que en la
        práctica se fija id (flujo nominal) y se controla el par solo con iq; (3) pon iq negativo: el par
        se invierte (frenado regenerativo) sin tocar el flujo — el motor pasa a generador al instante.
      </footer>
    </div>
  )
}
