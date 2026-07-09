import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_DCDYN, dcDynSim, dcSecondOrder, fmt } from '../lib/machine'

const C = { curve: '#3987e5', over: '#199e70', crit: '#c98500', under: '#e66767' }

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El motor como sistema de segundo orden Ω(s)/Va(s).
 * El amortiguamiento ζ decide la forma de la respuesta al escalón:
 * sobreamortiguado (lento, sin sobrepaso), crítico (el más rápido sin
 * oscilar) o subamortiguado (rápido pero con oscilaciones de velocidad).
 */
export default function TransferFunctionLab() {
  const [Ra, setRa] = useState(0.5)
  const [La, setLa] = useState(0.006)

  const p = { ...DEFAULT_DCDYN, Ra, La }
  const { wn, zeta, regime } = dcSecondOrder(p)

  const data = useMemo(() => {
    const tEnd = Math.max(10 / wn, 0.1)
    const s = dcDynSim(p, () => p.Vt, () => 0, tEnd, 0.0002, 4)
    const wfin = s[s.length - 1].omega || 1
    // Referencia de valor final para ver el sobrepaso
    return s.map((d) => ({ t: +(d.t * 1000).toFixed(2), wN: d.omega / wfin }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Ra, La])

  // Polos del sistema: s = −ζωn ± ωn·√(ζ²−1)
  const disc = zeta * zeta - 1
  const poles = disc >= 0
    ? [-zeta * wn + wn * Math.sqrt(disc), -zeta * wn - wn * Math.sqrt(disc)].map((re) => ({ re, im: 0 }))
    : [{ re: -zeta * wn, im: wn * Math.sqrt(-disc) }, { re: -zeta * wn, im: -wn * Math.sqrt(-disc) }]
  const regColor = regime === 'subamortiguado' ? C.under : regime === 'crítico' ? C.crit : C.over

  // Escala del plano s
  const SW = 150
  const SH = 150
  const sMax = Math.max(wn * 1.2, 60)
  const sx = (re: number) => SW / 2 + (re / sMax) * (SW / 2 - 12)
  const sy = (im: number) => SH / 2 - (im / sMax) * (SH / 2 - 12)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Sistema de 2.º orden: los tres amortiguamientos
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">Ra</span>
          <input type="range" min={0.08} max={1.0} step={0.02} value={Ra} onChange={(e) => setRa(Number(e.target.value))} className="w-32" />
          <span className="w-14 font-mono text-zinc-200">{Ra.toFixed(2)} Ω</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">La</span>
          <input type="range" min={0.002} max={0.03} step={0.001} value={La} onChange={(e) => setLa(Number(e.target.value))} className="w-32" />
          <span className="w-16 font-mono text-zinc-200">{(La * 1000).toFixed(0)} mH</span>
        </label>
        <span className="rounded-md border px-2.5 py-1 font-mono font-bold uppercase" style={{ borderColor: regColor, color: regColor }}>
          {regime}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="h-64 flex-1 px-2 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 4 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
                label={{ value: 'tiempo [ms]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, 1.4]}
                label={{ value: 'ω / ω_final', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => `t = ${v} ms`} formatter={(val) => [Number(val).toFixed(3), 'ω/ωf']} />
              <ReferenceLine y={1} stroke="#52525b" strokeDasharray="4 3" />
              <Line dataKey="wN" name="respuesta ω" stroke={regColor} strokeWidth={2.6} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex shrink-0 flex-col items-center p-3 sm:w-44">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-500">Plano s (polos)</p>
          <svg viewBox={`0 0 ${SW} ${SH}`} className="w-full max-w-[150px]">
            <line x1={0} y1={SH / 2} x2={SW} y2={SH / 2} stroke="#3f3f46" strokeWidth={1} />
            <line x1={SW / 2} y1={0} x2={SW / 2} y2={SH} stroke="#3f3f46" strokeWidth={1} />
            <text x={SW - 10} y={SH / 2 - 4} fill="#71717a" fontSize={9}>Re</text>
            <text x={SW / 2 + 4} y={10} fill="#71717a" fontSize={9}>Im</text>
            {poles.map((pole, i) => (
              <g key={i}>
                <line x1={sx(pole.re) - 5} y1={sy(pole.im) - 5} x2={sx(pole.re) + 5} y2={sy(pole.im) + 5} stroke={regColor} strokeWidth={2} />
                <line x1={sx(pole.re) - 5} y1={sy(pole.im) + 5} x2={sx(pole.re) + 5} y2={sy(pole.im) - 5} stroke={regColor} strokeWidth={2} />
              </g>
            ))}
          </svg>
          <p className="mt-1 text-center text-[10px] text-zinc-500">
            {disc >= 0 ? 'polos reales (eje Re)' : 'polos complejos conjugados'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3">
        <Readout label="ωn (frec. natural)" value={`${fmt(wn, 1)} rad/s`} />
        <Readout label="ζ (amortiguamiento)" value={fmt(zeta, 2)} accent={{ subamortiguado: 'text-red-300', crítico: 'text-amber-300', sobreamortiguado: 'text-emerald-300' }[regime]} />
        <Readout label="Régimen" value={regime} accent="text-zinc-100" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con Ra grande, ζ &gt; 1 (<span style={{ color: C.over }}>sobreamortiguado</span>): respuesta
        lenta y sin sobrepaso, polos reales sobre el eje; (2) baja Ra hacia ζ &lt; 1 (
        <span style={{ color: C.under }}>subamortiguado</span>): la velocidad SOBREPASA y oscila antes de
        asentarse — los polos se vuelven complejos conjugados y suben del eje real; (3) el punto justo
        ζ = 1 (<span style={{ color: C.crit }}>crítico</span>) es la respuesta MÁS rápida posible sin
        oscilar — el objetivo de diseño de muchos controladores.
      </footer>
    </div>
  )
}
