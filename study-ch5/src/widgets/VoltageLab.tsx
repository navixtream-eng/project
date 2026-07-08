import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** E_rms = 4.44 · f · N · kw · Φ — el «4.44» es √2·π/2 de la ley de Faraday */
export default function VoltageLab() {
  const [f, setF] = useState(60)
  const [N, setN] = useState(40)
  const [kw, setKw] = useState(0.925)
  const [phi, setPhi] = useState(0.02)

  const E = 4.44 * f * N * kw * phi
  const EMAX = 4.44 * 70 * 120 * 1 * 0.05

  // Sinusoide ilustrativa con amplitud proporcional
  const amp = 46 * Math.min(1, (E / EMAX) * 3 + 0.08)
  const path = Array.from({ length: 121 }, (_, i) => {
    const x = 20 + (i / 120) * 300
    const y = 62 - amp * Math.sin((i / 120) * 4 * Math.PI)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La fórmula del voltaje generado: E = 4.44·f·N·kw·Φ
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">f (frecuencia)</span>
          <input type="range" min={20} max={70} step={1} value={f}
            onChange={(e) => setF(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{f} Hz</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">N (vueltas/fase)</span>
          <input type="range" min={10} max={120} step={2} value={N}
            onChange={(e) => setN(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{N}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">kw (devanado)</span>
          <input type="range" min={0.8} max={1} step={0.005} value={kw}
            onChange={(e) => setKw(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{kw.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">Φ (flujo/polo)</span>
          <input type="range" min={0.005} max={0.05} step={0.001} value={phi}
            onChange={(e) => setPhi(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{(phi * 1000).toFixed(0)} mWb</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox="0 0 340 124" className="w-full max-w-sm">
          <line x1={20} y1={62} x2={320} y2={62} stroke="#27272a" />
          <path d={path} fill="none" stroke="#3987e5" strokeWidth={2.2} />
          <text x={22} y={16} fill="#71717a" fontSize={10}>e(t) por fase — la amplitud sigue a tus sliders</text>
        </svg>
        <div className="flex-1 p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Voltaje eficaz por fase</p>
          <p className="font-mono text-4xl font-black text-emerald-300">{E.toFixed(0)} V</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">
            4.44 × {f} × {N} × {kw.toFixed(3)} × {(phi * 1000).toFixed(0)} mWb
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) todos los factores son LINEALES: duplica cualquiera y E se duplica — la fórmula es la ley
        de Faraday disfrazada (E ∝ dλ/dt = d(N·kw·Φ)/dt, y la derivada del seno trae ω = 2πf);
        (2) el «4.44» no es magia: es √2·π/2 — el √2 convierte pico a eficaz, el π/2 viene de promediar
        la derivada del seno; (3) nota que Φ no puede crecer sin límite: el hierro satura (Sección 3) —
        por eso las máquinas grandes suben VOLTAJE con más vueltas y más hierro, no con más flujo por polo.
      </footer>
    </div>
  )
}
