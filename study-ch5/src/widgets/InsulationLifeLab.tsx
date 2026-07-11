import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { CLASES, type Clase, vidaAislamiento } from '../lib/termica'

/**
 * Laboratorio — La vida del aislamiento: cada 10 °C, la mitad.
 * La regla de Montsinger hecha visible: la vida es exponencial en la
 * temperatura del punto caliente. La práctica «diseño F, operación B»
 * aparece como lo que es: comprar décadas de vida con 25 °C de margen.
 */
export default function InsulationLifeLab() {
  const [clase, setClase] = useState<Clase>('F')
  const [hot, setHot] = useState(130) // punto caliente [°C]

  const limite = CLASES[clase]
  const vida = vidaAislamiento(hot, clase)
  const anios = vida / 8760

  const W = 640
  const H = 200
  const tMin = 60
  const tMax = 220
  const xOf = (T: number) => 44 + ((T - tMin) / (tMax - tMin)) * (W - 56)
  // vida en escala log: 10^2 .. 10^7 h
  const yOf = (L: number) => {
    const lg = Math.max(2, Math.min(7, Math.log10(Math.max(1, L))))
    return H - 28 - ((lg - 2) / 5) * (H - 44)
  }
  const curva = Array.from({ length: 100 }, (_, i) => {
    const T = tMin + (i / 99) * (tMax - tMin)
    return `${xOf(T)},${yOf(vidaAislamiento(T, clase))}`
  }).join(' ')

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Montsinger: la vida del aislamiento es exponencial
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Clase:</span>
        {(Object.keys(CLASES) as Clase[]).map((c) => (
          <button key={c} type="button" onClick={() => setClase(c)}
            className={`rounded-md px-2 py-1 text-[11px] font-bold ${clase === c ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {c} ({CLASES[c]} °C)
          </button>
        ))}
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Punto caliente</span>
          <input type="range" min={80} max={200} step={5} value={hot} onChange={(e) => setHot(Number(e.target.value))} className="max-w-52 flex-1" />
          <span className="w-16 font-mono text-zinc-200">{hot} °C</span>
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {[2, 3, 4, 5, 6, 7].map((lg) => (
            <g key={lg}>
              <line x1={44} y1={yOf(10 ** lg)} x2={W - 12} y2={yOf(10 ** lg)} stroke="#1f1f23" />
              <text x={38} y={yOf(10 ** lg) + 3} fill="#71717a" fontSize={8} textAnchor="end" fontFamily="monospace">10^{lg}</text>
            </g>
          ))}
          {[80, 120, 160, 200].map((T) => (
            <text key={T} x={xOf(T)} y={H - 14} fill="#71717a" fontSize={8} textAnchor="middle" fontFamily="monospace">{T}°C</text>
          ))}
          {/* Temperatura de clase */}
          <line x1={xOf(limite)} y1={16} x2={xOf(limite)} y2={H - 26} stroke="#a78bfa" strokeDasharray="4 4" strokeWidth={1.2} />
          <text x={xOf(limite)} y={12} fill="#a78bfa" fontSize={8.5} textAnchor="middle">clase {clase}: {limite} °C → 20 000 h</text>
          {/* Curva de vida */}
          <polyline points={curva} fill="none" stroke="#f59e0b" strokeWidth={2} />
          {/* Punto de operación */}
          <circle cx={xOf(hot)} cy={yOf(vida)} r={5} fill={hot > limite ? '#f87171' : '#10b981'} stroke="#0b0b0d" />
          <text x={xOf(hot) + 8} y={yOf(vida) - 6} fill={hot > limite ? '#f87171' : '#10b981'} fontSize={9.5} fontWeight={700}>
            {vida >= 1000 ? `${(vida / 1000).toFixed(0)}k h` : `${vida.toFixed(0)} h`} ({anios < 1 ? `${(anios * 12).toFixed(1)} meses` : `${anios.toFixed(1)} años`})
          </text>
          <text x={W / 2} y={H - 2} fill="#71717a" fontSize={8.5} textAnchor="middle">temperatura del punto caliente [°C] · vida [h, escala log]</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Margen a la clase</p>
          <p className={`font-mono text-sm font-semibold ${hot > limite ? 'text-red-300' : 'text-emerald-300'}`}>
            {(limite - hot).toFixed(0)} °C
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Vida estimada</p>
          <p className="font-mono text-sm font-semibold text-amber-300">
            {vida >= 1000 ? `${(vida / 1000).toFixed(1)}k h` : `${vida.toFixed(0)} h`}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Regla</p>
          <p className="font-mono text-[11px] font-semibold text-zinc-100">±10 °C → ×2 / ÷2 la vida</p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) clase F operando exactamente a 155 °C: 20 000 h ≈ 2.3 años — el LÍMITE de clase no es
        un punto de operación, es un techo; (2) baja a 130 °C (la práctica «diseño F, utilización
        B»): 25 °C de margen → 2^2.5 ≈ 5.7× la vida (≈13 años) — así se compra la vida real de un
        motor industrial; (3) sube 10 °C por encima del límite: la vida se corta a la MITAD — un
        ventilador sucio o un derrateo ignorado no «desgastan un poco»: dividen años entre dos;
        (4) conecta con el Cap. 11: un desbalance del 3 % puede subir el punto caliente ~15-20 °C…
        haz la cuenta de lo que cuesta en vida.{' '}
        <strong className="text-zinc-300">Alcance de la regla:</strong> el «÷2 cada 10 °C» es la
        aproximación de ingeniería de Arrhenius — el intervalo real varía ~8–12 °C según el sistema
        de aislamiento concreto, y siempre sobre el punto CALIENTE, no el promedio. Órdenes de
        magnitud y comparaciones: perfectos con la regla; garantías de vida: con las curvas del
        fabricante.
      </footer>
    </div>
  )
}
