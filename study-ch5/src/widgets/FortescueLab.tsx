import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { abs, cis, toRad } from '../lib/machine'
import { abcTo012, seq012ToAbc, unbalanceFactor } from '../lib/secuencias'

/**
 * Laboratorio — La descomposición de Fortescue.
 * Desequilibra las tensiones b y c con los deslizadores y mira cómo el
 * sistema se descompone EXACTAMENTE en tres sistemas balanceados: positivo
 * (el útil), negativo (el que calienta) y cero (el que se va por el neutro).
 */
export default function FortescueLab() {
  const [mb, setMb] = useState(100) // |Vb| %
  const [db, setDb] = useState(0) // corrimiento de fase b [°]
  const [mc, setMc] = useState(100)
  const [dc, setDc] = useState(0)

  const t = {
    a: cis(1, 0),
    b: cis(mb / 100, toRad(-120 + db)),
    c: cis(mc / 100, toRad(120 + dc)),
  }
  const s = abcTo012(t)
  const fu = unbalanceFactor(s)

  // Cada secuencia como su tripleta balanceada, para dibujarla completa
  const pos = seq012ToAbc({ s0: cis(0, 0), s1: s.s1, s2: cis(0, 0) })
  const neg = seq012ToAbc({ s0: cis(0, 0), s1: cis(0, 0), s2: s.s2 })

  const PANE = 150
  const R = 52
  const cxy = PANE / 2
  const arrow = (re: number, im: number, color: string, w = 2) => {
    const x2 = cxy + re * R
    const y2 = cxy - im * R
    const ang = Math.atan2(cxy - y2, x2 - cxy)
    const ah = 6
    return (
      <g key={`${color}${re}${im}`}>
        <line x1={cxy} y1={cxy} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
        <polygon
          points={`${x2},${y2} ${x2 - ah * Math.cos(ang - 0.45)},${y2 + ah * Math.sin(ang - 0.45)} ${x2 - ah * Math.cos(ang + 0.45)},${y2 + ah * Math.sin(ang + 0.45)}`}
          fill={color}
        />
      </g>
    )
  }
  const pane = (title: string, vecs: { re: number; im: number; color: string }[], note: string) => (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${PANE} ${PANE}`} className="h-auto w-full max-w-[150px]">
        <circle cx={cxy} cy={cxy} r={R} fill="none" stroke="#27272a" />
        <line x1={8} y1={cxy} x2={PANE - 8} y2={cxy} stroke="#1f1f23" />
        <line x1={cxy} y1={8} x2={cxy} y2={PANE - 8} stroke="#1f1f23" />
        {vecs.map((v) => arrow(v.re, v.im, v.color))}
      </svg>
      <p className="text-[10px] font-bold text-zinc-300">{title}</p>
      <p className="text-center font-mono text-[9px] text-zinc-500">{note}</p>
    </div>
  )

  const CA = '#38bdf8'
  const CB = '#f59e0b'
  const CC = '#f472b6'

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Fortescue: todo desbalance son tres balances
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-amber-300">|V_b|</span>
          <input type="range" min={40} max={120} step={1} value={mb} onChange={(e) => setMb(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{mb} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-amber-300">Δθ_b</span>
          <input type="range" min={-40} max={40} step={1} value={db} onChange={(e) => setDb(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{db}°</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-pink-300">|V_c|</span>
          <input type="range" min={40} max={120} step={1} value={mc} onChange={(e) => setMc(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{mc} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-pink-300">Δθ_c</span>
          <input type="range" min={-40} max={40} step={1} value={dc} onChange={(e) => setDc(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{dc}°</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 py-3 sm:grid-cols-4">
        {pane('Original (desbalanceado)', [
          { re: t.a.re, im: t.a.im, color: CA },
          { re: t.b.re, im: t.b.im, color: CB },
          { re: t.c.re, im: t.c.im, color: CC },
        ], 'V̂a azul · V̂b ámbar · V̂c rosa')}
        {pane('Positiva (la útil)', [
          { re: pos.a.re, im: pos.a.im, color: CA },
          { re: pos.b.re, im: pos.b.im, color: CB },
          { re: pos.c.re, im: pos.c.im, color: CC },
        ], `|V₁| = ${abs(s.s1).toFixed(3)} pu`)}
        {pane('Negativa (la que calienta)', [
          { re: neg.a.re, im: neg.a.im, color: CA },
          { re: neg.b.re, im: neg.b.im, color: CB },
          { re: neg.c.re, im: neg.c.im, color: CC },
        ], `|V₂| = ${abs(s.s2).toFixed(3)} pu · gira al revés`)}
        {pane('Cero (las tres juntas)', [
          { re: s.s0.re, im: s.s0.im, color: '#a78bfa' },
        ], `|V₀| = ${abs(s.s0).toFixed(3)} pu · en fase las tres`)}
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">|V₁|</p>
          <p className="font-mono text-sm font-semibold text-emerald-300">{abs(s.s1).toFixed(3)} pu</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">|V₂|</p>
          <p className="font-mono text-sm font-semibold text-red-300">{abs(s.s2).toFixed(3)} pu</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">|V₀|</p>
          <p className="font-mono text-sm font-semibold text-violet-300">{abs(s.s0).toFixed(3)} pu</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Desequilibrio V₂/V₁</p>
          <p className={`font-mono text-sm font-semibold ${fu > 2 ? 'text-red-300' : 'text-zinc-100'}`}>
            {fu.toFixed(2)} % {fu > 2 ? '⚠' : '✓'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con todo en 100 % y 0°: solo existe la positiva — un sistema balanceado ES su secuencia
        positiva; (2) baja |V_b| al 70 %: aparecen negativa Y cero a la vez — un solo desbalance
        «contamina» las tres; (3) intenta crear solo secuencia cero: baja b y c por igual…
        imposible sin mover fases: la cero exige que la SUMA no sea nula (por eso solo circula si
        hay neutro/tierra); (4) la norma admite V₂/V₁ ≤ 2 % en motores: con apenas 90 % en una
        fase ya lo violas — la negativa gira CONTRA el rotor (deslizamiento 2−s) y calienta como
        frecuencia doble.
      </footer>
    </div>
  )
}
