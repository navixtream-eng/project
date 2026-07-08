import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { pSalient, solveFromPQ, toRad } from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): azul/aqua/violeta/amarillo */
const COLORS = {
  transient: '#3987e5',
  steady: '#c98500',
  main: '#199e70',
  reluctance: '#9085e9',
} as const

const VT = 1.0
const XD = 1.1
const P0 = 0.9
const Q0 = P0 * Math.tan(Math.acos(0.9))

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — La característica potencia-ángulo TRANSITORIA completa.
 * Misma fórmula de dos términos del Cap. 5, pero con X'd en lugar de Xd —
 * y como X'd < Xq, el par de reluctancia CAMBIA DE SIGNO: la cresta
 * transitoria se corre MÁS ALLÁ de 90°, al revés que en régimen.
 */
export default function TransientPALab() {
  const [Xd1, setXd1] = useState(0.3)
  const [Xq, setXq] = useState(0.65)
  const [showComponents, setShowComponents] = useState(true)

  // E' y Eaf del mismo punto de carga (P = 0.9, fp 0.9 atraso)
  const Ep = useMemo(() => solveFromPQ(VT, P0, Q0, Xd1).EafMag, [Xd1])
  const Eaf = useMemo(() => solveFromPQ(VT, P0, Q0, XD).EafMag, [])

  const { data, peakTr, peakSs } = useMemo(() => {
    let pt = { deg: 0, P: -Infinity }
    let ps = { deg: 0, P: -Infinity }
    const rows = Array.from({ length: 181 }, (_, deg) => {
      const d = toRad(deg)
      const tr = pSalient(Ep, VT, Xd1, Xq, d)
      const ss = pSalient(Eaf, VT, XD, Xq, d)
      if (tr.total > pt.P) pt = { deg, P: tr.total }
      if (ss.total > ps.P) ps = { deg, P: ss.total }
      return {
        deltaDeg: deg,
        tr: tr.total,
        ss: ss.total,
        trMain: tr.main,
        trRel: tr.reluctance,
      }
    })
    return { data: rows, peakTr: pt, peakSs: ps }
  }, [Ep, Eaf, Xd1, Xq])

  const relSign = 1 / Xq - 1 / Xd1 // < 0 cuando X'd < Xq: saliencia invertida

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Curva P-δ transitoria vs. de régimen — la saliencia invertida
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          X′d
          <input type="range" min={0.25} max={0.45} step={0.01} value={Xd1}
            onChange={(e) => setXd1(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{Xd1.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Xq
          <input type="range" min={0.5} max={0.9} step={0.01} value={Xq}
            onChange={(e) => setXq(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{Xq.toFixed(2)}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input type="checkbox" checked={showComponents}
            onChange={(e) => setShowComponents(e.target.checked)}
            className="h-3.5 w-3.5 accent-violet-500" />
          Ver componentes de la transitoria
        </label>
        <span className="text-[10px] text-zinc-500">
          E′ = {Ep.toFixed(3)} · Eaf = {Eaf.toFixed(3)} pu (mismo punto de carga) · Xd = {XD}
        </span>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="deltaDeg"
              type="number"
              domain={[0, 180]}
              ticks={[0, 30, 60, 90, 120, 150, 180]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 'δ [grados eléctricos]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(1)}
              label={{ value: 'P [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `δ = ${v}°`}
              formatter={(value, name) => [`${Number(value).toFixed(3)} pu`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {showComponents && (
              <Line dataKey="trMain" name="término E′·Vt/X′d·sen δ" stroke={COLORS.main}
                strokeWidth={1.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            )}
            {showComponents && (
              <Line dataKey="trRel" name="reluctancia transitoria (sen 2δ, ¡negativa!)" stroke={COLORS.reluctance}
                strokeWidth={1.5} strokeDasharray="2 3" dot={false} isAnimationActive={false} />
            )}
            <Line dataKey="tr" name="P-δ TRANSITORIA (E′, X′d)" stroke={COLORS.transient}
              strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line dataKey="ss" name="P-δ de régimen (Eaf, Xd)" stroke={COLORS.steady}
              strokeWidth={2} dot={false} isAnimationActive={false} />

            <ReferenceLine x={90} stroke="#3f3f46" strokeDasharray="2 4" />
            <ReferenceDot x={peakTr.deg} y={Number(peakTr.P.toFixed(3))} r={6}
              fill={COLORS.transient} stroke="#fafafa" strokeWidth={1.5}
              label={{ value: `cresta ${peakTr.deg}°`, fill: COLORS.transient, fontSize: 10, position: 'top' }} />
            <ReferenceDot x={peakSs.deg} y={Number(peakSs.P.toFixed(3))} r={6}
              fill={COLORS.steady} stroke="#fafafa" strokeWidth={1.5}
              label={{ value: `cresta ${peakSs.deg}°`, fill: COLORS.steady, fontSize: 10, position: 'bottom' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Cresta transitoria" value={`${peakTr.P.toFixed(2)} pu @ ${peakTr.deg}°`}
          accent="text-sky-300" />
        <Readout label="Cresta de régimen" value={`${peakSs.P.toFixed(2)} pu @ ${peakSs.deg}°`}
          accent="text-amber-300" />
        <Readout label="(1/Xq − 1/X′d)" value={relSign.toFixed(2)}
          accent={relSign < 0 ? 'text-violet-300' : 'text-emerald-300'} />
        <Readout label="Saliencia transitoria" value={relSign < 0 ? 'INVERTIDA (X′d < Xq)' : 'normal'}
          accent={relSign < 0 ? 'text-violet-300' : undefined} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) mira las dos crestas: la de régimen cae ANTES de 90° (saliencia normal, Xq &lt; Xd) y la
        transitoria DESPUÉS de 90° (X′d &lt; Xq invierte el signo del término sen 2δ — violeta, ahora
        negativo); (2) sube X′d hacia Xq y observa la reluctancia transitoria aplanarse hasta
        desaparecer cuando X′d = Xq; (3) nota la escala: la curva transitoria más que duplica a la de
        régimen — el préstamo del flujo atrapado que hace sobrevivibles las fallas.
      </footer>
    </div>
  )
}
