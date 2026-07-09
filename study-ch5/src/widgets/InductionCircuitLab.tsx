import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_INDUCTION, inductionSolve } from '../lib/machine'

/** Paleta validada: serie cobre ámbar, magnetización violeta, carga mecánica emerald */
const C = { wire: '#71717a', copper: '#c98500', shunt: '#9085e9', mech: '#10b981', node: '#d4d4d8', dim: '#3f3f46' }

const TOP = 70
const BOT = 172

function ResistorH({ x, w = 46, color, label, sub }: { x: number; w?: number; color: string; label: string; sub?: string }) {
  return (
    <g>
      <rect x={x} y={TOP - 11} width={w} height={22} rx={4} fill="#0b0b0d" stroke={color} strokeWidth={2.2} />
      <text x={x + w / 2} y={TOP - 17} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>{label}</text>
      {sub && <text x={x + w / 2} y={TOP + 30} textAnchor="middle" fill={color} fontSize={9}>{sub}</text>}
    </g>
  )
}
function InductorH({ x, n = 4, r = 9, color, label }: { x: number; n?: number; r?: number; color: string; label: string }) {
  let d = `M ${x} ${TOP}`
  for (let i = 0; i < n; i++) d += ` a ${r} ${r} 0 0 1 ${2 * r} 0`
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <text x={x + n * r} y={TOP - 14} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>{label}</text>
    </g>
  )
}
function Wire({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.wire} strokeWidth={2.2} strokeLinecap="round" />
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El circuito equivalente del motor de inducción.
 * Un transformador cuyo secundario se mueve: R1, X1 (estator), Rc∥Xm
 * (magnetización) y la rama del rotor R2/s + jX2. El truco genial es
 * partir R2/s = R2 + R2(1−s)/s: cobre del rotor + POTENCIA MECÁNICA.
 */
export default function InductionCircuitLab() {
  const [sPct, setSPct] = useState(3)
  const [split, setSplit] = useState(true)
  const s = sPct / 100
  const p = DEFAULT_INDUCTION
  const r = inductionSolve(p, s)
  const R2s = p.R2 / s
  const Rmech = p.R2 * (1 - s) / s

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Circuito equivalente y la partición de R₂/s
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Deslizamiento s</span>
          <input type="range" min={0.2} max={100} step={0.2} value={sPct}
            onChange={(e) => setSPct(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{s.toFixed(3)}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)}
            className="h-3.5 w-3.5 accent-emerald-500" />
          Partir R₂/s = R₂ + R₂(1−s)/s
        </label>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 680 210" className="w-full min-w-[560px] select-none">
          {/* Rieles */}
          <Wire x1={40} y1={TOP} x2={80} y2={TOP} />
          <Wire x1={40} y1={BOT} x2={640} y2={BOT} />
          <Wire x1={40} y1={TOP} x2={40} y2={BOT} />
          <text x={16} y={TOP + 6} fill="#d4d4d8" fontSize={13} fontWeight={700}>V₁</text>

          {/* Estator: R1, X1 */}
          <ResistorH x={80} color={C.copper} label="R₁" />
          <Wire x1={126} y1={TOP} x2={150} y2={TOP} />
          <InductorH x={150} color={C.copper} label="X₁" />
          <Wire x1={222} y1={TOP} x2={280} y2={TOP} />

          {/* Rama de magnetización Rc ∥ Xm en el nodo de entrehierro */}
          <circle cx={250} cy={TOP} r={3.4} fill={C.node} />
          <Wire x1={250} y1={TOP} x2={250} y2={90} />
          <Wire x1={232} y1={90} x2={268} y2={90} />
          <rect x={222} y={90} width={20} height={54} rx={4} fill="#0b0b0d" stroke={C.shunt} strokeWidth={2} />
          <path d="M 268 90 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14" fill="none" stroke={C.shunt} strokeWidth={2} />
          <Wire x1={232} y1={144} x2={268} y2={144} />
          <Wire x1={250} y1={144} x2={250} y2={BOT} />
          <text x={205} y={122} fill={C.shunt} fontSize={11} fontWeight={700}>Rc</text>
          <text x={276} y={122} fill={C.shunt} fontSize={11} fontWeight={700}>Xm</text>
          <circle cx={250} cy={BOT} r={3.4} fill={C.node} />

          {/* Rotor: X2 y R2/s (o partido) */}
          <InductorH x={300} color={C.copper} label="X₂" />
          <Wire x1={372} y1={TOP} x2={400} y2={TOP} />
          {split ? (
            <>
              <ResistorH x={400} w={44} color={C.copper} label="R₂" sub="cobre rotor" />
              <Wire x1={444} y1={TOP} x2={470} y2={TOP} />
              <ResistorH x={470} w={92} color={C.mech} label="R₂(1−s)/s" sub="potencia mecánica" />
              <Wire x1={562} y1={TOP} x2={640} y2={TOP} />
            </>
          ) : (
            <>
              <ResistorH x={440} w={80} color={C.copper} label="R₂/s" sub="rama del rotor" />
              <Wire x1={520} y1={TOP} x2={640} y2={TOP} />
            </>
          )}
          <Wire x1={640} y1={TOP} x2={640} y2={BOT} />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <Readout label="R₂/s (total)" value={`${R2s.toFixed(2)} Ω`} accent="text-amber-300" />
        <Readout label="R₂ (cobre rotor)" value={`${p.R2.toFixed(2)} Ω`} />
        <Readout label="R₂(1−s)/s (mecánica)" value={`${Rmech.toFixed(2)} Ω`} accent="text-emerald-300" />
        <Readout label="I₁ (línea)" value={`${r.I1mag.toFixed(1)} A`} accent="text-sky-300" />
        <Readout label="I₂ (rotor)" value={`${r.I2mag.toFixed(1)} A`} />
        <Readout label="Pₘₑₖ desarrollada" value={`${(r.Pmech / 1000).toFixed(1)} kW`} accent="text-emerald-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) baja s hacia 0.02: R₂/s se dispara (la <span className="text-emerald-300">resistencia
        mecánica</span> se vuelve enorme) — el motor «casi en vacío» toma poca corriente, como un
        transformador con secundario abierto; (2) sube s a 1 (rotor bloqueado): R₂(1−s)/s = 0, TODA la
        potencia del entrehierro se quema en cobre — I₁ enorme y nada de potencia útil; (3) activa y
        desactiva la partición: la parte verde <span className="text-emerald-300">R₂(1−s)/s</span> es
        una resistencia FICTICIA que representa la carga en el eje — no disipa calor, entrega watts
        mecánicos.
      </footer>
    </div>
  )
}
