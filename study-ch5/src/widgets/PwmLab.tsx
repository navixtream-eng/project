import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { pwmFundamental, triangleWave } from '../lib/machine'

/** Paleta validada: referencia violeta, portadora gris, salida azul */
const C = { ref: '#9085e9', carrier: '#71717a', out: '#3987e5', fund: '#e66767', grid: '#27272a' }

const W = 560
const HP = 96 // altura de cada panel
const PADX = 34
const CYCLES = 2 // periodos de la referencia mostrados

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Inversor y PWM senoidal.
 * Comparando una senoide de referencia con una portadora triangular rápida,
 * el inversor conmuta la tensión del bus (±Vdc/2) de modo que su PROMEDIO
 * sigue a la referencia: reconstruye V y f a voluntad para los algoritmos.
 */
export default function PwmLab() {
  const [m, setM] = useState(0.85) // índice de modulación
  const [mf, setMf] = useState(15) // relación de frecuencias fc/fref

  const N = 900
  const x = (tau: number) => PADX + (tau / CYCLES) * (W - PADX - 12)
  const yTop = (v: number) => HP / 2 - v * (HP / 2 - 8)
  const yBot = (v: number) => HP + 20 + HP / 2 - v * (HP / 2 - 8)

  // Trazos
  let refPath = ''
  let carrierPath = ''
  let outPath = ''
  let fundPath = ''
  let prevOut = 0
  for (let i = 0; i <= N; i++) {
    const tau = (i / N) * CYCLES
    const ref = m * Math.sin(2 * Math.PI * tau)
    const carrier = triangleWave(tau, mf)
    const out = ref > carrier ? 1 : -1
    const fund = m * Math.sin(2 * Math.PI * tau)
    refPath += `${i === 0 ? 'M' : 'L'} ${x(tau).toFixed(1)} ${yTop(ref).toFixed(1)} `
    carrierPath += `${i === 0 ? 'M' : 'L'} ${x(tau).toFixed(1)} ${yTop(carrier).toFixed(1)} `
    fundPath += `${i === 0 ? 'M' : 'L'} ${x(tau).toFixed(1)} ${yBot(fund).toFixed(1)} `
    if (i === 0) outPath += `M ${x(tau).toFixed(1)} ${yBot(out).toFixed(1)} `
    else {
      if (out !== prevOut) outPath += `L ${x(tau).toFixed(1)} ${yBot(prevOut).toFixed(1)} L ${x(tau).toFixed(1)} ${yBot(out).toFixed(1)} `
      else outPath += `L ${x(tau).toFixed(1)} ${yBot(out).toFixed(1)} `
    }
    prevOut = out
  }

  const Vdc = 1
  const fund1 = pwmFundamental(Math.min(m, 1), Vdc)
  const overmod = m > 1

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Inversor PWM: reconstruir V y f conmutando
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-violet-300">Índice de modulación m</span>
          <input type="range" min={0.1} max={1.15} step={0.01} value={m}
            onChange={(e) => setM(Number(e.target.value))} className="w-32" />
          <span className="w-12 font-mono text-zinc-200">{m.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">Portadora fc/fref</span>
          <input type="range" min={6} max={40} step={1} value={mf}
            onChange={(e) => setMf(Number(e.target.value))} className="w-28" />
          <span className="w-10 font-mono text-zinc-200">{mf}</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${2 * HP + 34}`} className="w-full min-w-[520px] select-none">
          {/* Panel superior: referencia + portadora */}
          <line x1={PADX} y1={HP / 2} x2={W - 12} y2={HP / 2} stroke={C.grid} strokeWidth={1} />
          <path d={carrierPath} fill="none" stroke={C.carrier} strokeWidth={1} opacity={0.8} />
          <path d={refPath} fill="none" stroke={C.ref} strokeWidth={2.4} />
          <text x={PADX} y={12} fill={C.ref} fontSize={10} fontWeight={700}>referencia (senoide) vs portadora (triángulo)</text>

          {/* Panel inferior: salida conmutada + fundamental */}
          <line x1={PADX} y1={HP + 20 + HP / 2} x2={W - 12} y2={HP + 20 + HP / 2} stroke={C.grid} strokeWidth={1} />
          <path d={outPath} fill="none" stroke={C.out} strokeWidth={1.6} />
          <path d={fundPath} fill="none" stroke={C.fund} strokeWidth={2.2} strokeDasharray="6 4" />
          <text x={PADX} y={HP + 32} fill={C.out} fontSize={10} fontWeight={700}>tensión conmutada ±Vdc/2 · su fundamental (rojo) = la referencia</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Fundamental (m·Vdc/2)" value={`${(fund1).toFixed(3)} ·Vdc`} accent="text-red-300" />
        <Readout label="Modulación" value={overmod ? 'SOBREMODULACIÓN' : 'LINEAL'}
          accent={overmod ? 'text-amber-300' : 'text-emerald-300'} />
        <Readout label="Pulsos por ciclo" value={`${mf}`} accent="text-sky-300" />
        <Readout label="Amplitud máx lineal" value="1.00 ·Vdc/2" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube <span className="text-violet-300">m</span>: los pulsos de salida se ensanchan donde la
        referencia es alta — el PROMEDIO móvil de la onda cuadrada sigue a la senoide roja, que es su
        fundamental; (2) sube la <span className="text-zinc-300">portadora</span>: más pulsos por ciclo
        → el fundamental sale más limpio y los armónicos se van a alta frecuencia (fáciles de filtrar
        por la propia inductancia del motor); (3) pasa m de 1.0: entras en{' '}
        <span className="text-amber-300">sobremodulación</span> — ganas algo de tensión pero aparecen
        armónicos de baja frecuencia. Cambiando m y la frecuencia de la referencia, el inversor entrega
        exactamente la V y la f que pide el control V/f o el FOC.
      </footer>
    </div>
  )
}
