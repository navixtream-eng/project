import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs, cx } from '../lib/machine'
import { solveFault, throughDyn1 } from '../lib/secuencias'

/**
 * Laboratorio — La falla vista a través del Dyn1.
 * Una SLG del lado Yg cruza el banco con la positiva desfasada +30° y la
 * negativa −30° (signos opuestos) y SIN secuencia cero: del lado delta el
 * patrón de corrientes cambia de forma — el relé del otro lado ve OTRA falla.
 */
export default function DyShiftLab() {
  const [x1, setX1] = useState(20)
  const [x0, setX0] = useState(8)

  const sol = solveFault({
    kind: 'slg',
    E: 1,
    Z1: cx(0, x1 / 100),
    Z2: cx(0, x1 / 100),
    Z0: cx(0, x0 / 100),
    Zf: cx(0, 0),
    Zn: cx(0, 0),
  })
  const ladoY = [abs(sol.phaseI.a), abs(sol.phaseI.b), abs(sol.phaseI.c)]
  const delta = throughDyn1(sol.seqI)
  const ladoD = [abs(delta.a), abs(delta.b), abs(delta.c)]
  const resY = sol.iResidual
  const resD = ladoD[0] === 0 ? 0 : Math.abs(ladoD[0] - ladoD[0]) // siempre 0: sin I0
  const vmax = Math.max(...ladoY, ...ladoD, 0.1)

  const barGroup = (title: string, vals: number[], residual: number, colorRes: string) => (
    <div className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
      <div className="flex items-end gap-3" style={{ height: 84 }}>
        {['Ia', 'Ib', 'Ic'].map((lbl, i) => (
          <div key={lbl} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
            <span className="font-mono text-[10px] text-zinc-300">{vals[i].toFixed(2)}</span>
            <div className="w-full rounded-t"
              style={{ height: `${(vals[i] / vmax) * 62}%`, backgroundColor: ['#38bdf8', '#f59e0b', '#f472b6'][i], minHeight: vals[i] > 0.01 ? 3 : 0 }} />
            <span className="font-mono text-[10px] text-zinc-500">{lbl}</span>
          </div>
        ))}
      </div>
      <p className={`mt-2 font-mono text-[11px] ${colorRes}`}>residual 3I₀ = {residual.toFixed(2)} pu</p>
    </div>
  )

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La misma falla, dos caras: a través del Dyn1
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <span className="text-[11px] text-zinc-400">SLG franca en fase <span className="text-sky-300">a</span> del lado <strong className="text-zinc-200">Yg</strong> de un banco Dyn1:</span>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">X₁ = X₂</span>
          <input type="range" min={10} max={40} step={1} value={x1} onChange={(e) => setX1(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{(x1 / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-violet-300">X₀</span>
          <input type="range" min={3} max={20} step={1} value={x0} onChange={(e) => setX0(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{(x0 / 100).toFixed(2)}</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 p-3 sm:flex-row">
        {barGroup('Lado Yg (donde ocurre la falla)', ladoY, resY, 'text-violet-300')}
        <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-1 text-center">
          <span className="text-[10px] font-bold text-zinc-400">Dyn1</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">I₁ → +30°</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-red-300">I₂ → −30°</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">I₀ → ✗</span>
        </div>
        {barGroup('Lado Δ (lo que ve el relé remoto)', ladoD, resD, 'text-zinc-500')}
      </div>

      <div className="mx-3 mb-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] leading-relaxed text-zinc-300">
        La falla monofásica ({ladoY[0].toFixed(2)}, 0, 0) se convierte del lado delta en un patrón
        «bifásico» ({ladoD[0].toFixed(2)}, {ladoD[1].toFixed(2)}, {ladoD[2].toFixed(2)}) con residual
        CERO: dos fases con I_f/√3 y una muerta. Un relé de tierra del lado delta no la ve jamás
        (correcto: la delta partió la zona), y un relé de fase la ve con √3 menos de corriente y
        otra distribución. Los signos opuestos de los desfases (+30°/−30°) son los que fabrican
        esta metamorfosis.
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) verifica la aritmética: I_a(Δ) = I_c(Δ) = I_f/√3 = {(ladoY[0] / Math.sqrt(3)).toFixed(2)} pu
        exacto — el √3 del grupo vectorial trabajando sobre las secuencias; (2) mueve X₀: cambia
        cuán grande es la falla, pero el PATRÓN (2 fases iguales, 1 muerta, residual cero) es
        topológico — no depende de los números; (3) implicación de protecciones: los ajustes de
        cada lado del banco se calculan con la falla TRANSFORMADA, no con la original — olvidar el
        ±30° con signos opuestos es el error clásico al modelar fallas desbalanceadas a través de
        transformadores.
      </footer>
    </div>
  )
}
