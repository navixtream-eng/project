import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs, cx } from '../lib/machine'
import { type FaultKind, solveFault } from '../lib/secuencias'

// Sistema fijo (pu)
const X1 = 0.2
const X0 = 0.08
const PICKUP_F = 2.0 // relé de fase
const PICKUP_N = 0.2 // relé de tierra

const etapa = (kind: FaultKind, rf: number) =>
  solveFault({ kind, E: 1, Z1: cx(0, X1), Z2: cx(0, X1), Z0: cx(0, X0), Zf: cx(rf, 0), Zn: cx(0, 0) })

/**
 * Laboratorio — La falla evolutiva: de un arco a tierra al trifásico.
 * Las fallas reales EVOLUCIONAN: empieza un arco monofásico resistivo, el
 * calor degrada el aislamiento vecino (LLG) y termina en trifásica franca.
 * La línea de tiempo muestra las corrientes por etapa y quién (51 o 51N)
 * detecta cada una — despejar temprano es despejar barato.
 */
export default function EvolvingFaultLab() {
  const [rf, setRf] = useState(30) // R de arco inicial [%]
  const [t2, setT2] = useState(150) // evolución a LLG [ms]
  const [t3, setT3] = useState(320) // evolución a 3φ [ms]

  const T_END = 500
  const e1 = etapa('slg', rf / 100)
  const e2 = etapa('llg', rf / 200) // el arco se «asienta»: mitad de resistencia
  const e3 = etapa('3f', 0)
  const etapas = [
    { t0: 0, t1: t2, sol: e1, nombre: 'SLG (arco)' },
    { t0: t2, t1: Math.max(t3, t2 + 10), sol: e2, nombre: 'LLG' },
    { t0: Math.max(t3, t2 + 10), t1: T_END, sol: e3, nombre: '3φ' },
  ]

  // Primer instante en que cada relé arranca
  const veF = etapas.find((e) => Math.max(abs(e.sol.phaseI.a), abs(e.sol.phaseI.b), abs(e.sol.phaseI.c)) > PICKUP_F)
  const veN = etapas.find((e) => e.sol.iResidual > PICKUP_N)

  // --- Gráfica de pasos (SVG 640×220): |Ia|,|Ib|,|Ic| y 3I0 por etapa ---
  const W = 640
  const H = 220
  const xOf = (t: number) => 40 + (t / T_END) * (W - 52)
  const imax = Math.max(...etapas.map((e) => Math.max(abs(e.sol.phaseI.a), abs(e.sol.phaseI.b), abs(e.sol.phaseI.c), e.sol.iResidual))) * 1.15
  const yOf = (i: number) => H - 34 - (i / imax) * (H - 56)

  const traza = (fn: (e: (typeof etapas)[number]) => number, color: string, dash = '') => {
    const segs: string[] = []
    for (const e of etapas) {
      const y = yOf(fn(e))
      segs.push(`M ${xOf(e.t0)} ${y} L ${xOf(e.t1)} ${y}`)
    }
    return <path d={segs.join(' ')} stroke={color} strokeWidth={2} fill="none" strokeDasharray={dash} />
  }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La falla evolutiva: SLG → LLG → 3φ
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-3">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">R del arco inicial</span>
          <input type="range" min={5} max={60} step={5} value={rf} onChange={(e) => setRf(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{(rf / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-red-300">evoluciona a LLG en</span>
          <input type="range" min={50} max={300} step={10} value={t2} onChange={(e) => setT2(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{t2} ms</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-red-300">a 3φ en</span>
          <input type="range" min={150} max={480} step={10} value={t3} onChange={(e) => setT3(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{t3} ms</span>
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* Fondo por etapas */}
          {etapas.map((e, i) => (
            <g key={e.nombre}>
              <rect x={xOf(e.t0)} y={10} width={xOf(e.t1) - xOf(e.t0)} height={H - 44}
                fill={['rgba(245,158,11,0.05)', 'rgba(248,113,113,0.07)', 'rgba(248,113,113,0.13)'][i]} />
              <text x={(xOf(e.t0) + xOf(e.t1)) / 2} y={22} fill="#a1a1aa" fontSize={9.5} textAnchor="middle" fontWeight={700}>
                {e.nombre}
              </text>
            </g>
          ))}
          {/* Ejes y pickups */}
          {[PICKUP_F, PICKUP_N].map((p, i) => (
            <g key={p}>
              <line x1={40} y1={yOf(p)} x2={W - 12} y2={yOf(p)} stroke={i === 0 ? '#38bdf8' : '#a78bfa'} strokeDasharray="3 5" strokeWidth={1} opacity={0.7} />
              <text x={W - 14} y={yOf(p) - 3} fill={i === 0 ? '#38bdf8' : '#a78bfa'} fontSize={8} textAnchor="end">
                pickup {i === 0 ? '51' : '51N'}
              </text>
            </g>
          ))}
          {[0, 100, 200, 300, 400, 500].map((t) => (
            <text key={t} x={xOf(t)} y={H - 20} fill="#71717a" fontSize={8} textAnchor="middle" fontFamily="monospace">{t}</text>
          ))}
          <text x={W / 2} y={H - 6} fill="#71717a" fontSize={8.5} textAnchor="middle">tiempo [ms]</text>

          {/* Trazas */}
          {traza((e) => abs(e.sol.phaseI.a), '#38bdf8')}
          {traza((e) => abs(e.sol.phaseI.b), '#f59e0b')}
          {traza((e) => abs(e.sol.phaseI.c), '#f472b6')}
          {traza((e) => e.sol.iResidual, '#a78bfa', '5 4')}
          <text x={46} y={yOf(abs(e1.phaseI.a)) - 5} fill="#38bdf8" fontSize={8.5}>|Ia|</text>
          <text x={46} y={yOf(e1.iResidual) + 11} fill="#a78bfa" fontSize={8.5}>3I₀</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">51N (tierra) arranca…</p>
          <p className={`font-mono text-sm font-semibold ${veN ? 'text-emerald-300' : 'text-red-300'}`}>
            {veN ? `desde t = ${veN.t0} ms (etapa ${veN.nombre})` : 'nunca'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">51 (fase) arranca…</p>
          <p className={`font-mono text-sm font-semibold ${veF ? (veF.t0 > 0 ? 'text-amber-300' : 'text-emerald-300') : 'text-red-300'}`}>
            {veF ? (veF.t0 === 0 ? 'desde el inicio' : `recién en t = ${veF.t0} ms (${veF.nombre})`) : 'nunca'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con R de arco 0.3: en la etapa SLG solo el 51N ve la falla — si su curva dispara antes
        de t₂, el incidente termina siendo UN arco y un recierre; si no, escala a LLG y 3φ y el
        despeje cuesta un interruptor con 6 pu; (2) adelanta t₂ a 50 ms: una evolución rápida deja
        al 51N sin tiempo — argumento para instantáneos de tierra (50N) en zonas de arco probable;
        (3) mira el residual por etapa: crece de SLG a LLG… y se DESVANECE en la 3φ (falla
        balanceada) — un registro real de 3I₀ que sube y luego muere cuenta la historia completa de
        la evolución; (4) el pariente de dos puntos: en sistemas aislados, la falla «cross-country»
        (dos SLG en fases distintas y lugares distintos) es la evolución típica — se analiza
        conectando las redes en DOS puntos, el mismo método con más contabilidad.
      </footer>
    </div>
  )
}
