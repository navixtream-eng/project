import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_INDUCTION, inductionSolve } from '../lib/machine'

/** Paleta validada: entrada azul, entrehierro violeta, mecánica emerald, pérdidas rojo/ámbar */
const C = { in: '#3987e5', gap: '#9085e9', mech: '#10b981', out: '#34d399', scl: '#e66767', core: '#c98500', fw: '#71717a' }

const W = 520
const X0 = 12
const BARW = W - 130
const BH = 22

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El flujo de potencia y el rendimiento.
 * La potencia entra, paga peajes (cobre del estator, hierro) y llega al
 * entrehierro. Ahí se reparte en una proporción FIJA por el deslizamiento:
 * Pgap : P_rotor : P_mec = 1 : s : (1−s). El par es Pgap/ωs.
 */
export default function InductionPowerLab() {
  const [sPct, setSPct] = useState(3)
  const s = sPct / 100
  const p = DEFAULT_INDUCTION
  const r = inductionSolve(p, s)

  const scale = BARW / Math.max(1, r.Pin)
  const bar = (power: number) => Math.max(0, power * scale)

  const rows: { y: number; label: string; power: number; color: string; loss?: { w: number; color: string; text: string } }[] = [
    { y: 22, label: 'P entrada', power: r.Pin, color: C.in, loss: { w: bar(r.Pscl), color: C.scl, text: `cobre estator ${(r.Pscl / 1000).toFixed(1)}k` } },
    { y: 60, label: 'P entrehierro', power: r.Pgap, color: C.gap, loss: { w: bar(r.Prcl), color: C.scl, text: `cobre rotor s·Pgap ${(r.Prcl / 1000).toFixed(1)}k` } },
    { y: 98, label: 'P mecánica', power: r.Pmech, color: C.mech, loss: { w: bar(p.Pfw), color: C.fw, text: `fricción+vent. ${(p.Pfw / 1000).toFixed(1)}k` } },
    { y: 136, label: 'P salida (eje)', power: r.Pout, color: C.out },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Flujo de potencia, par y rendimiento
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Deslizamiento s</span>
          <input type="range" min={0.2} max={30} step={0.1} value={sPct}
            onChange={(e) => setSPct(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{s.toFixed(3)}</span>
        </label>
        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-emerald-300">
          Pgap : P_rot : P_mec = 1 : {s.toFixed(3)} : {(1 - s).toFixed(3)}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} 172`} className="w-full shrink-0 select-none sm:max-w-lg">
          {rows.map((row) => (
            <g key={row.label}>
              <rect x={X0} y={row.y} width={bar(row.power)} height={BH} rx={3} fill={row.color} opacity={0.85} />
              <text x={X0 + 6} y={row.y + 15} fill="#0b0b0d" fontSize={11} fontWeight={700}>
                {row.label}
              </text>
              <text x={X0 + bar(row.power) + 6} y={row.y + 15} fill={row.color} fontSize={10} fontWeight={700}>
                {(row.power / 1000).toFixed(1)} kW
              </text>
              {row.loss && (
                <text x={X0 + 8} y={row.y + BH + 12} fill={row.loss.color} fontSize={9}>
                  ↓ − {row.loss.text}W
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="P entrehierro" value={`${(r.Pgap / 1000).toFixed(1)} kW`} accent="text-violet-300" />
          <Readout label="Par Tind = Pgap/ωs" value={`${r.Tind.toFixed(0)} N·m`} accent="text-amber-300" />
          <Readout label="P cobre rotor = s·Pgap" value={`${(r.Prcl / 1000).toFixed(2)} kW`} accent="text-red-300" />
          <Readout label="P mecánica (1−s)Pgap" value={`${(r.Pmech / 1000).toFixed(1)} kW`} accent="text-emerald-300" />
          <Readout label="P salida" value={`${(r.Pout / 1000).toFixed(1)} kW`} />
          <Readout label="Rendimiento η" value={`${(r.eff * 100).toFixed(1)} %`}
            accent={r.eff > 0.85 ? 'text-emerald-300' : r.eff > 0.6 ? 'text-amber-300' : 'text-red-400'} />
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) la relación <span className="text-emerald-300">1 : s : (1−s)</span> es una LEY, no una
        casualidad: de cada watt que cruza el entrehierro, la fracción s se quema en el cobre del rotor
        y la fracción (1−s) se vuelve mecánica — por eso operar con s alto es operar con mal
        rendimiento; (2) el rendimiento del rotor tiene un techo duro: η_rotor = 1−s, así que ningún
        motor de inducción puede ser eficiente lejos de su velocidad síncrona; (3) el par depende de
        Pgap, no de Pmech: <span className="text-amber-300">Tind = Pgap/ωs</span> — a rotor parado hay
        par (y grande) aunque la potencia mecánica sea cero.
      </footer>
    </div>
  )
}
