import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { estimaEnsayo, thermalStep } from '../lib/termica'

// Tres «máquinas de ensayo» con parámetros verdaderos ocultos
const MAQUINAS = {
  A: { thetaSS: 52, tau: 70 },
  B: { thetaSS: 38, tau: 45 },
  C: { thetaSS: 64, tau: 95 },
} as const
type Maquina = keyof typeof MAQUINAS

/** Ruido determinista (reproducible) de ±0.6 K sobre cada muestra. */
const ruido = (i: number) => 0.6 * Math.sin(i * 12.9898 + 4.1414) * Math.cos(i * 3.7)

/**
 * Laboratorio — El ensayo de calentamiento y la estimación de parámetros.
 * Se muestrea θ(t) cada 10 min (método de resistencia / sensores) y con TRES
 * puntos equidistantes se extrapolan θ_ss y τ sin esperar el equilibrio —
 * el método clásico de sala de pruebas. La duración del ensayo decide si la
 * extrapolación es medición o adivinanza.
 */
export default function HeatRunLab() {
  const [maq, setMaq] = useState<Maquina>('A')
  const [dur, setDur] = useState(120) // duración del ensayo [min]

  const { thetaSS, tau } = MAQUINAS[maq]

  const muestras = useMemo(() => {
    const out: { t: number; th: number }[] = []
    for (let t = 10; t <= dur; t += 10) {
      out.push({ t, th: thermalStep(thetaSS, 0, t, tau) + ruido(t / 10 + (maq === 'B' ? 31 : maq === 'C' ? 67 : 0)) })
    }
    return out
  }, [dur, thetaSS, tau, maq])

  // Tres puntos equidistantes: T/3, 2T/3, T (la muestra más cercana)
  const pick = (t: number) => muestras.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a))
  const p1 = pick(dur / 3)
  const p2 = pick((2 * dur) / 3)
  const p3 = pick(dur)
  const est = estimaEnsayo(p1.th, p2.th, p3.th, p2.t - p1.t)

  const errSS = est ? ((est.thetaSS - thetaSS) / thetaSS) * 100 : null
  const suficiente = dur >= 2 * tau

  const W = 640
  const H = 210
  const tMax = Math.max(dur * 1.15, 3.2 * tau)
  const yMax = Math.max(thetaSS, est?.thetaSS ?? 0) * 1.2
  const xOf = (t: number) => 40 + (t / tMax) * (W - 52)
  const yOf = (v: number) => H - 28 - (v / yMax) * (H - 44)
  const curva = (ss: number, tc: number) =>
    Array.from({ length: 120 }, (_, i) => {
      const t = (i / 119) * tMax
      return `${xOf(t)},${yOf(thermalStep(ss, 0, t, tc))}`
    }).join(' ')

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El ensayo de calentamiento: extrapolar sin esperar
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Máquina bajo ensayo:</span>
        {(Object.keys(MAQUINAS) as Maquina[]).map((m) => (
          <button key={m} type="button" onClick={() => setMaq(m)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${maq === m ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {m}
          </button>
        ))}
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Duración del ensayo</span>
          <input type="range" min={40} max={360} step={10} value={dur} onChange={(e) => setDur(Number(e.target.value))} className="max-w-52 flex-1" />
          <span className="w-16 font-mono text-zinc-200">{dur} min</span>
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* Verdad (tenue) y estimación (discontinua) */}
          <polyline points={curva(thetaSS, tau)} fill="none" stroke="#3f3f46" strokeWidth={1.5} />
          {est && <polyline points={curva(est.thetaSS, est.tau)} fill="none" stroke="#10b981" strokeWidth={1.8} strokeDasharray="6 4" />}
          {/* Asintotas */}
          <line x1={40} y1={yOf(thetaSS)} x2={W - 12} y2={yOf(thetaSS)} stroke="#52525b" strokeDasharray="2 5" strokeWidth={1} />
          <text x={W - 14} y={yOf(thetaSS) - 4} fill="#71717a" fontSize={8.5} textAnchor="end">θ_ss real (oculta en campo)</text>
          {est && (
            <text x={W - 14} y={yOf(est.thetaSS) + 12} fill="#10b981" fontSize={8.5} textAnchor="end">θ_ss estimada</text>
          )}
          {/* Muestras */}
          {muestras.map((mu) => (
            <circle key={mu.t} cx={xOf(mu.t)} cy={yOf(mu.th)} r={3} fill="#f59e0b" />
          ))}
          {/* Los tres puntos elegidos */}
          {[p1, p2, p3].map((p) => (
            <circle key={p.t} cx={xOf(p.t)} cy={yOf(p.th)} r={5.5} fill="none" stroke="#38bdf8" strokeWidth={2} />
          ))}
          <text x={xOf(p2.t)} y={yOf(p2.th) - 12} fill="#38bdf8" fontSize={8.5} textAnchor="middle">los 3 puntos equidistantes</text>
          <text x={W / 2} y={H - 4} fill="#71717a" fontSize={8.5} textAnchor="middle">tiempo [min] · muestras cada 10 min (ΔR del devanado o PT100)</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">θ_ss estimada / real</p>
          <p className="font-mono text-sm font-semibold text-emerald-300">
            {est ? est.thetaSS.toFixed(1) : '—'} / {thetaSS} K
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">τ estimada / real</p>
          <p className="font-mono text-sm font-semibold text-emerald-300">
            {est ? est.tau.toFixed(0) : '—'} / {tau} min
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Error en θ_ss</p>
          <p className={`font-mono text-sm font-semibold ${errSS !== null && Math.abs(errSS) < 5 ? 'text-emerald-300' : 'text-red-300'}`}>
            {errSS !== null ? `${errSS > 0 ? '+' : ''}${errSS.toFixed(1)} %` : 'no estimable'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Duración vs τ</p>
          <p className={`font-mono text-sm font-semibold ${suficiente ? 'text-emerald-300' : 'text-amber-300'}`}>
            {(dur / tau).toFixed(1)}·τ {suficiente ? '(sólido)' : '(extrapolando)'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con 120 min sobre la máquina A: los tres puntos equidistantes extrapolan θ_ss con un
        error de pocos % SIN esperar las ~4 horas del equilibrio — el método de sala de pruebas
        desde 1920; (2) recorta el ensayo a 40–60 min: el error crece y hasta puede no ser
        estimable — con t ≪ τ, la curva «no ha decidido» su asíntota y el ruido de medición domina
        la resta 2θ2−θ1−θ3; regla práctica: ensayo ≥ 1.5–2τ o criterio de gradiente (IEC: &lt;2 K/h);
        (3) de la estimación salen los PARÁMETROS del modelo: R_th = θ_ss/P (con las pérdidas
        medidas) y C_th = τ/R_th — así se puebla el RC de la sección 1 con datos reales; (4) prueba
        las máquinas B y C: misma técnica, distinta τ — la duración «suficiente» es relativa a CADA
        máquina, no un número fijo de horas.
      </footer>
    </div>
  )
}
