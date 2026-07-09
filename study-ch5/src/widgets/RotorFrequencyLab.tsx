import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { rotorFrequency } from '../lib/machine'

/** Paleta validada: estator azul, rotor ámbar */
const COLORS = { stator: '#3987e5', rotor: '#c98500', grid: '#27272a', muted: '#71717a' }

const FE = 60 // Hz de línea
const E2 = 1.0 // FEM del rotor a rotor parado (referencia, pu)
const X2 = 1.0 // reactancia del rotor a fe (pu)

const W = 460
const H = 190

function sinePath(freqRel: number, amp: number, cy: number, cycles = 3): string {
  const pts: string[] = []
  const N = 240
  for (let i = 0; i <= N; i++) {
    const x = 30 + (i / N) * (W - 45)
    const y = cy - amp * Math.sin((i / N) * cycles * 2 * Math.PI * freqRel)
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
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
 * Laboratorio — La frecuencia del rotor: fr = s·fe.
 * A rotor parado (s = 1) el rotor ve el campo pasar a la frecuencia de línea.
 * Al acelerar, el campo lo «adelanta» cada vez más despacio: la frecuencia,
 * la FEM y la reactancia del rotor caen todas en proporción al deslizamiento.
 */
export default function RotorFrequencyLab() {
  const [sPct, setSPct] = useState(5)
  const s = sPct / 100
  const fr = rotorFrequency(s, FE)
  const E2s = s * E2 // FEM del rotor con deslizamiento
  const X2s = s * X2 // reactancia del rotor con deslizamiento
  const cy1 = 55
  const cy2 = 140

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La frecuencia del rotor fᵣ = s·fₑ
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Deslizamiento s</span>
          <input type="range" min={0.2} max={100} step={0.2} value={sPct}
            onChange={(e) => setSPct(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{s.toFixed(3)}</span>
        </label>
        <span className="text-[10px] text-zinc-500">línea: fₑ = {FE} Hz</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full shrink-0 select-none sm:max-w-md">
          {/* Ejes de referencia */}
          <line x1={30} y1={cy1} x2={W - 15} y2={cy1} stroke={COLORS.grid} strokeWidth={1} />
          <line x1={30} y1={cy2} x2={W - 15} y2={cy2} stroke={COLORS.grid} strokeWidth={1} />
          {/* Onda del estator (fe fija, amplitud fija) */}
          <path d={sinePath(1, 32, cy1)} fill="none" stroke={COLORS.stator} strokeWidth={2.2} />
          <text x={32} y={cy1 - 34} fill={COLORS.stator} fontSize={11} fontWeight={700}>
            estator · fₑ = {FE} Hz (constante)
          </text>
          {/* Onda del rotor (fr = s·fe, amplitud ∝ s) */}
          <path d={sinePath(s, 32 * s, cy2)} fill="none" stroke={COLORS.rotor} strokeWidth={2.2} />
          <text x={32} y={cy2 + 40} fill={COLORS.rotor} fontSize={11} fontWeight={700}>
            rotor · fᵣ = {fr.toFixed(1)} Hz, E₂ₛ ∝ s
          </text>
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="fᵣ = s·fₑ" value={`${fr.toFixed(2)} Hz`} accent="text-amber-300" />
          <Readout label="E rotor = s·E₂" value={`${E2s.toFixed(3)} pu`} accent="text-amber-300" />
          <Readout label="X rotor = s·X₂" value={`${X2s.toFixed(3)} pu`} />
          <Readout label="Periodo del rotor" value={fr > 0.01 ? `${(1000 / fr).toFixed(0)} ms` : '∞'} />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            A rotor parado (s = 1) el rotor es un transformador normal: ve fₑ completa. Al acelerar,
            el deslizamiento cae y con él la frecuencia, la FEM (E₂ₛ = s·E₂) y la reactancia
            (X₂ₛ = s·X₂) del rotor — por eso <span className="text-amber-300">la impedancia del rotor
            cambia con la velocidad</span>, y ese es el truco que hace variar la «carga» del circuito.
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) pon s = 1 (arranque): la onda del rotor iguala a la del estator — 60 Hz, plena FEM; (2)
        baja s a 0.03 (marcha normal): la onda del rotor se estira a ~2 Hz y se encoge — casi CD lenta;
        (3) observa que E rotor y X rotor caen juntas con s: como ambas escalan igual, el ángulo del
        factor de potencia del rotor mejora al acelerar — clave para entender la curva de par.
      </footer>
    </div>
  )
}
