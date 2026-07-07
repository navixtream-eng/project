import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { syncSpeedRpm } from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): slots 1 y 3 */
const C50 = '#3987e5'
const C60 = '#c98500'

/**
 * nₛ = 120·f/p para redes de 50 y 60 Hz. Un solo eje, dos series con
 * leyenda + etiquetas directas; tooltip por punto.
 */
export default function SyncSpeedChart() {
  const data = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const p = 2 * (i + 1)
        return { p, ns50: syncSpeedRpm(50, p), ns60: syncSpeedRpm(60, p) }
      }),
    [],
  )

  return (
    <div className="my-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <h4 className="mb-2 px-1 text-xs font-semibold text-zinc-400">
        Velocidad síncrona vs. número de polos
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 58, bottom: 4, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="p"
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 'polos p', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 'nₛ [r/min]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `p = ${v} polos`}
              formatter={(value, name) => [`${Number(value).toLocaleString('es')} r/min`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Etiquetas directas en p = 2, donde las curvas están bien separadas
                (en p = 24 convergen y colisionarían) */}
            <Line
              dataKey="ns50"
              name="50 Hz"
              stroke={C50}
              strokeWidth={2}
              dot={{ r: 3, fill: C50, strokeWidth: 0 }}
              isAnimationActive={false}
              label={(props) => {
                const { x, y, index } = props as { x: number; y: number; index: number }
                return index === 0 ? (
                  <text x={x + 10} y={y + 12} fill={C50} fontSize={11} fontWeight={700}>50 Hz</text>
                ) : <g />
              }}
            />
            <Line
              dataKey="ns60"
              name="60 Hz"
              stroke={C60}
              strokeWidth={2}
              dot={{ r: 3, fill: C60, strokeWidth: 0 }}
              isAnimationActive={false}
              label={(props) => {
                const { x, y, index } = props as { x: number; y: number; index: number }
                return index === 0 ? (
                  <text x={x + 12} y={y + 14} fill={C60} fontSize={11} fontWeight={700}>60 Hz</text>
                ) : <g />
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 px-1 text-[11px] leading-relaxed text-zinc-500">
        La hipérbola nₛ = 120·f/p explica el diseño: un turbogenerador de vapor (3600/3000 r/min) usa 2 polos;
        una central hidráulica que gira a ~100 r/min necesita decenas de polos.
      </p>
    </div>
  )
}
