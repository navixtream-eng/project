import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { thermalCycle, thermalStep } from '../lib/termica'

/**
 * Laboratorio — El circuito térmico R-C de la máquina.
 * Las pérdidas son la «corriente», la temperatura la «tensión», y la máquina
 * un condensador térmico que se carga con constante τ. Sobrecargar no quema
 * al instante: quema cuando θ cruza el límite — y τ te dice cuándo.
 */
export default function ThermalRCLab() {
  const [modoCiclo, setModoCiclo] = useState(false)
  const [carga, setCarga] = useState(100) // % de la nominal
  const [tau, setTau] = useState(40) // min
  const [tOn, setTOn] = useState(20) // ciclo: marcha [min]
  const [tOff, setTOff] = useState(20) // ciclo: parada [min]

  // Pérdidas dominadas por I²R: crecen con el cuadrado de la carga
  const perd = (carga / 100) ** 2
  const tauCool = tau * 2.5 // autoventilado detenido: enfría ~2.5× más lento

  const datos = useMemo(() => {
    if (!modoCiclo) {
      const T = tau * 5
      return Array.from({ length: 240 }, (_, i) => {
        const t = (i / 239) * T
        return { t, theta: thermalStep(perd, 0, t, tau) }
      })
    }
    return thermalCycle([{ pLoss: perd, t: tOn }, { pLoss: 0, t: tOff, parada: true }], tau, tauCool, 8, Math.max(0.25, (tOn + tOff) / 160))
  }, [modoCiclo, perd, tau, tOn, tOff, tauCool])

  const thetaMax = Math.max(...datos.map((d) => d.theta))
  // Tiempo hasta cruzar el límite (θ = 1) en escalón sobrecargado
  const tLimite = !modoCiclo && perd > 1 ? -tau * Math.log(1 - 1 / perd) : null

  const W = 640
  const H = 210
  const tEnd = datos[datos.length - 1].t
  const yMax = Math.max(1.25, thetaMax * 1.1)
  const xOf = (t: number) => 40 + (t / tEnd) * (W - 52)
  const yOf = (th: number) => H - 30 - (th / yMax) * (H - 46)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El condensador térmico: θ(t) = P·R(1 − e^(−t/τ))
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setModoCiclo(false)}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${!modoCiclo ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Escalón de carga
        </button>
        <button type="button" onClick={() => setModoCiclo(true)}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${modoCiclo ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Ciclo marcha/paro
        </button>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Carga</span>
          <input type="range" min={50} max={140} step={5} value={carga} onChange={(e) => setCarga(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{carga} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">τ térmica</span>
          <input type="range" min={15} max={80} step={5} value={tau} onChange={(e) => setTau(Number(e.target.value))} className="w-28" />
          <span className="w-14 font-mono text-zinc-200">{tau} min</span>
        </label>
        {modoCiclo && (
          <>
            <label className="flex items-center gap-2 text-zinc-400">
              marcha
              <input type="range" min={5} max={60} step={5} value={tOn} onChange={(e) => setTOn(Number(e.target.value))} className="w-20" />
              <span className="w-12 font-mono text-zinc-200">{tOn} min</span>
            </label>
            <label className="flex items-center gap-2 text-zinc-400">
              paro
              <input type="range" min={5} max={60} step={5} value={tOff} onChange={(e) => setTOff(Number(e.target.value))} className="w-20" />
              <span className="w-12 font-mono text-zinc-200">{tOff} min</span>
            </label>
          </>
        )}
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* Límite térmico θ = 1 (elevación nominal a plena carga) */}
          <line x1={40} y1={yOf(1)} x2={W - 12} y2={yOf(1)} stroke="#f87171" strokeDasharray="5 4" strokeWidth={1.2} />
          <text x={W - 14} y={yOf(1) - 4} fill="#f87171" fontSize={8.5} textAnchor="end">límite de clase (θ nominal)</text>
          <line x1={40} y1={yOf(0)} x2={W - 12} y2={yOf(0)} stroke="#27272a" />
          {/* Marcador de τ (63 %) en modo escalón */}
          {!modoCiclo && (
            <g>
              <line x1={xOf(tau)} y1={yOf(0)} x2={xOf(tau)} y2={yOf(perd * 0.632)} stroke="#38bdf8" strokeDasharray="3 4" strokeWidth={1} />
              <text x={xOf(tau)} y={yOf(0) + 12} fill="#38bdf8" fontSize={8.5} textAnchor="middle">τ (63 %)</text>
            </g>
          )}
          {/* Curva θ(t) */}
          <polyline
            points={datos.map((d) => `${xOf(d.t)},${yOf(d.theta)}`).join(' ')}
            fill="none" stroke="#f59e0b" strokeWidth={2}
          />
          {/* Cruce del límite */}
          {tLimite !== null && tLimite < tEnd && (
            <g>
              <circle cx={xOf(tLimite)} cy={yOf(1)} r={4.5} fill="#f87171" />
              <text x={xOf(tLimite) + 8} y={yOf(1) + 14} fill="#f87171" fontSize={9} fontWeight={700}>
                cruza el límite en {tLimite.toFixed(0)} min
              </text>
            </g>
          )}
          <text x={W / 2} y={H - 4} fill="#71717a" fontSize={8.5} textAnchor="middle">tiempo [min]</text>
          <text x={12} y={H / 2} fill="#71717a" fontSize={8.5} textAnchor="middle" transform={`rotate(-90 12 ${H / 2})`}>θ / θ nominal</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Pérdidas (∝ carga²)</p>
          <p className="font-mono text-sm font-semibold text-amber-300">{(perd * 100).toFixed(0)} %</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">{modoCiclo ? 'θ pico del ciclo' : 'θ de equilibrio'}</p>
          <p className={`font-mono text-sm font-semibold ${thetaMax > 1.02 ? 'text-red-300' : 'text-emerald-300'}`}>
            {(( modoCiclo ? thetaMax : perd) * 100).toFixed(0)} % {thetaMax > 1.02 ? '⚠' : '✓'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">τ enfriamiento (parado)</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{tauCool.toFixed(0)} min (2.5×)</p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) escalón al 120 %: las pérdidas suben al 144 % y el equilibrio TAMBIÉN — pero mira el
        marcador: la máquina tarda ~τ·ln(1/(1−1/1.44)) en cruzar el límite: la sobrecarga corta es
        legal, la sostenida no (ese es el fundamento del relé térmico y del factor de servicio);
        (2) baja τ a 15 min (máquina pequeña) y repite: cruza mucho antes — las máquinas chicas
        perdonan menos; (3) modo ciclo con 20/20 min: la temperatura SIERRA entre dos niveles —
        si el pico toca el límite, el ciclo no es admisible aunque el promedio sí lo sea; (4) nota
        la asimetría de la sierra: parado enfría con τ 2.5× más lenta (sin ventilador) — por eso
        los arranques frecuentes castigan tanto: se calienta rápido y se enfría lento.
      </footer>
    </div>
  )
}
