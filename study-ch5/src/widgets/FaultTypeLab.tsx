import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs, cx } from '../lib/machine'
import { type FaultKind, fmtPolar, solveFault } from '../lib/secuencias'

const TIPOS: { id: FaultKind; label: string }[] = [
  { id: '3f', label: 'Trifásica' },
  { id: 'slg', label: 'Monofásica a tierra (SLG)' },
  { id: 'll', label: 'Bifásica (L-L)' },
  { id: 'llg', label: 'Bifásica a tierra (LLG)' },
]

/**
 * Laboratorio — El solucionador de fallas: conecta las redes según el tipo.
 * A la izquierda, las redes de secuencia se INTERCONECTAN en vivo (serie,
 * paralelo o solo positiva); a la derecha, las corrientes de fase que esa
 * conexión produce. Zf y Zn muestran las fallas «con impedancia».
 */
export default function FaultTypeLab() {
  const [kind, setKind] = useState<FaultKind>('slg')
  const [x1, setX1] = useState(20)
  const [x0, setX0] = useState(8)
  const [zf, setZf] = useState(0)
  const [zn, setZn] = useState(0)

  const sol = solveFault({
    kind,
    E: 1,
    Z1: cx(0, x1 / 100),
    Z2: cx(0, x1 / 100),
    Z0: cx(0, x0 / 100),
    Zf: cx(zf / 100, 0),
    Zn: cx(zn / 100, 0),
  })
  const if3f = 1 / Math.hypot(zf / 100, x1 / 100)

  // --- Interconexión de redes (SVG 320×250) ---
  const box = (x: number, y: number, label: string, source = false) => (
    <g key={label}>
      <rect x={x} y={y} width={92} height={34} fill="#18181b" stroke={source ? '#10b981' : '#64748b'} rx={5} />
      <text x={x + 46} y={y + 15} fill={source ? '#10b981' : '#cbd5e1'} fontSize={9.5} textAnchor="middle" fontFamily="monospace">
        {source ? 'E + jX₁' : label}
      </text>
      {!source && <text x={x + 46} y={y + 27} fill="#71717a" fontSize={8} textAnchor="middle" fontFamily="monospace">{label === 'RED CERO' ? `jX₀${zn > 0 ? '+3Zn' : ''}` : 'jX₂'}</text>}
      {source && <text x={x + 46} y={y + 27} fill="#71717a" fontSize={8} textAnchor="middle" fontFamily="monospace">RED POSITIVA</text>}
    </g>
  )
  const w = (x1p: number, y1p: number, x2p: number, y2p: number, color = '#38bdf8') => (
    <line key={`${x1p}${y1p}${x2p}${y2p}`} x1={x1p} y1={y1p} x2={x2p} y2={y2p} stroke={color} strokeWidth={2.2} />
  )

  const red = () => {
    switch (kind) {
      case '3f':
        return (
          <>
            {box(114, 40, '', true)}
            {w(160, 74, 160, 104)}
            <rect x={128} y={104} width={64} height={18} fill="#18181b" stroke="#e4b34c" rx={3} />
            <text x={160} y={117} fill="#e4b34c" fontSize={8.5} textAnchor="middle" fontFamily="monospace">Zf</text>
            {w(160, 122, 160, 150)}
            <line x1={100} y1={150} x2={220} y2={150} stroke="#334155" strokeWidth={3} />
            <text x={160} y={175} fill="#71717a" fontSize={9} textAnchor="middle">solo la positiva: falla balanceada</text>
          </>
        )
      case 'slg':
        return (
          <>
            {box(114, 14, '', true)}
            {w(160, 48, 160, 62)}
            {box(114, 62, 'RED NEGATIVA')}
            {w(160, 96, 160, 110)}
            {box(114, 110, 'RED CERO')}
            {w(160, 144, 160, 158)}
            <rect x={128} y={158} width={64} height={16} fill="#18181b" stroke="#e4b34c" rx={3} />
            <text x={160} y={170} fill="#e4b34c" fontSize={8.5} textAnchor="middle" fontFamily="monospace">3Zf</text>
            {w(160, 174, 160, 190)}
            {w(160, 190, 60, 190)}
            {w(60, 190, 60, 30)}
            {w(60, 30, 114, 30)}
            <text x={238} y={100} fill="#10b981" fontSize={9.5} fontWeight={700}>SERIE:</text>
            <text x={238} y={113} fill="#71717a" fontSize={8.5}>I₁ = I₂ = I₀</text>
            <text x={238} y={126} fill="#71717a" fontSize={8.5}>If = 3·I₀</text>
          </>
        )
      case 'll':
        return (
          <>
            {box(40, 60, '', true)}
            {box(188, 60, 'RED NEGATIVA')}
            {w(86, 60, 86, 40)}
            {w(86, 40, 234, 40)}
            {w(234, 40, 234, 60)}
            {w(86, 94, 86, 120)}
            <rect x={110} y={112} width={64} height={16} fill="#18181b" stroke="#e4b34c" rx={3} />
            <text x={142} y={124} fill="#e4b34c" fontSize={8.5} textAnchor="middle" fontFamily="monospace">Zf</text>
            {w(86, 120, 110, 120)}
            {w(174, 120, 234, 120)}
            {w(234, 120, 234, 94)}
            <text x={160} y={165} fill="#10b981" fontSize={9.5} textAnchor="middle" fontWeight={700}>PARALELO (sin red cero)</text>
            <text x={160} y={180} fill="#71717a" fontSize={8.5} textAnchor="middle">I₂ = −I₁ · I₀ = 0 → sin corriente a tierra</text>
          </>
        )
      case 'llg':
        return (
          <>
            {box(20, 60, '', true)}
            {box(124, 60, 'RED NEGATIVA')}
            {box(228, 60, 'RED CERO')}
            {w(66, 60, 66, 36)}
            {w(66, 36, 274, 36)}
            {w(274, 36, 274, 60)}
            {w(170, 60, 170, 36)}
            {w(66, 94, 66, 130)}
            {w(66, 130, 274, 130)}
            {w(170, 94, 170, 130)}
            {w(274, 94, 274, 110)}
            <rect x={244} y={110} width={60} height={14} fill="#18181b" stroke="#e4b34c" rx={3} />
            <text x={274} y={121} fill="#e4b34c" fontSize={8} textAnchor="middle" fontFamily="monospace">+3Zf</text>
            {w(274, 124, 274, 130)}
            <text x={160} y={165} fill="#10b981" fontSize={9.5} textAnchor="middle" fontWeight={700}>NEGATIVA ∥ CERO tras la positiva</text>
            <text x={160} y={180} fill="#71717a" fontSize={8.5} textAnchor="middle">I₁ se divide entre ambas (divisor de corriente)</text>
          </>
        )
    }
  }

  const bars = [
    { lbl: 'Ia', v: abs(sol.phaseI.a), color: '#38bdf8' },
    { lbl: 'Ib', v: abs(sol.phaseI.b), color: '#f59e0b' },
    { lbl: 'Ic', v: abs(sol.phaseI.c), color: '#f472b6' },
  ]
  const vmax = Math.max(1, ...bars.map((b) => b.v))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El conmutador de fallas: cada tipo conecta las redes a su manera
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800 px-4 py-2 text-xs">
        {TIPOS.map((t) => (
          <button key={t.id} type="button" onClick={() => setKind(t.id)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${kind === t.id ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-sky-300">X₁ = X₂</span>
          <input type="range" min={10} max={40} step={1} value={x1} onChange={(e) => setX1(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{(x1 / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-violet-300">X₀</span>
          <input type="range" min={3} max={30} step={1} value={x0} onChange={(e) => setX0(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{(x0 / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-amber-300">Zf (falla)</span>
          <input type="range" min={0} max={15} step={1} value={zf} onChange={(e) => setZf(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{(zf / 100).toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-20 font-semibold text-emerald-300">Zn (neutro)</span>
          <input type="range" min={0} max={25} step={1} value={zn} onChange={(e) => setZn(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{(zn / 100).toFixed(2)}</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="min-w-0 flex-1 px-2 py-2">
          <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Interconexión de las redes de secuencia</p>
          <svg viewBox="0 0 320 195" className="h-auto w-full">{red()}</svg>
        </div>

        <div className="flex-1 p-3">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Corrientes de fase en el punto de falla [pu]</p>
          <div className="mb-2 flex items-end gap-3" style={{ height: 90 }}>
            {bars.map((b) => (
              <div key={b.lbl} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
                <span className="font-mono text-[10px] text-zinc-300">{b.v.toFixed(2)}</span>
                <div className="w-full rounded-t" style={{ height: `${(b.v / vmax) * 70}%`, backgroundColor: b.color, minHeight: b.v > 0.01 ? 3 : 0 }} />
                <span className="font-mono text-[10px] text-zinc-500">{b.lbl}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 font-mono text-zinc-300">
              I₁ = {fmtPolar(sol.seqI.s1)}<br />I₂ = {fmtPolar(sol.seqI.s2)}<br />I₀ = {fmtPolar(sol.seqI.s0)}
            </div>
            <div className="space-y-1.5">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
                <p className="text-[9px] uppercase text-zinc-500">I falla / vs 3φ</p>
                <p className="font-mono text-zinc-100">{sol.iFalla.toFixed(2)} pu · {((sol.iFalla / if3f) * 100).toFixed(0)} %</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
                <p className="text-[9px] uppercase text-zinc-500">Residual 3I₀ (lo que ve el relé de tierra)</p>
                <p className={`font-mono ${sol.iResidual > 0.05 ? 'text-violet-300' : 'text-zinc-500'}`}>{sol.iResidual.toFixed(2)} pu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) recorre los cuatro tipos con los mismos parámetros: la CONEXIÓN de las redes es la
        «fórmula» — serie (SLG), paralelo (L-L), divisor (LLG), solo positiva (3φ); (2) en SLG sube
        Zn: la corriente cae con 3Zn en serie — y el residual 3I₀ con ella (tu relé de tierra debe
        seguir viéndola); (3) en L-L mira el residual: CERO aunque la falla sea violenta — un relé
        de tierra es ciego a las fallas sin tierra; (4) sube Zf en cualquier tipo: las fallas
        reales tienen arco y resistencia — el relé debe detectar la falla «débil», no solo la
        franca; (5) con X₀ &lt; X₁ compara SLG vs 3φ: la monofásica gana — el mito de «la trifásica
        siempre es la peor» muere aquí.
      </footer>
    </div>
  )
}
