import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimResult } from '../engine/types'

interface CurrentsChartProps {
  result: SimResult
  time: number
}

/**
 * Corrientes instantáneas de estator ia, ib, ic en una ventana alrededor del
 * evento. Durante el cortocircuito se superpone la envolvente √2·I(t) que
 * exhibe los periodos subtransitorio (T″d), transitorio (T′d) y de estado
 * estable, además de la asimetría por el offset DC (decae con Ta).
 */
export default function CurrentsChart({ result, time }: CurrentsChartProps) {
  const data = useMemo(
    () =>
      result.currents.map((c) => ({
        ...c,
        t: Number(c.t.toFixed(5)),
      })),
    [result],
  )

  if (data.length === 0) return null
  const t0 = data[0].t
  const t1 = data[data.length - 1].t
  const isSC = result.config.event.type === 'short-circuit'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          type="number"
          domain={[t0, t1]}
          stroke="#71717a"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{ value: 't [s] (ventana alrededor del evento)', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
        />
        <YAxis
          stroke="#71717a"
          tick={{ fontSize: 11 }}
          label={{ value: 'i [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
        />
        <ChartTooltip
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(v) => `t = ${Number(v).toFixed(4)} s`}
          formatter={(value, name) => [`${Number(value).toFixed(3)} pu`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />

        <Line dataKey="ia" name="ia" stroke="#f87171" strokeWidth={1.4} dot={false} isAnimationActive={false} />
        <Line dataKey="ib" name="ib" stroke="#4ade80" strokeWidth={1.4} dot={false} isAnimationActive={false} />
        <Line dataKey="ic" name="ic" stroke="#60a5fa" strokeWidth={1.4} dot={false} isAnimationActive={false} />

        {isSC && (
          <Line dataKey="envP" name="envolvente √2·I(t)" stroke="#fafafa" strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} connectNulls={false} />
        )}
        {isSC && (
          <Line dataKey="envM" stroke="#fafafa" strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} legendType="none" connectNulls={false} />
        )}

        <ReferenceLine
          x={result.config.event.tFault}
          stroke="#ef4444"
          strokeDasharray="4 3"
          label={{ value: 'evento', fill: '#ef4444', fontSize: 10, position: 'top' }}
        />
        {isSC && (
          <ReferenceLine
            x={result.config.event.tFault + result.config.event.tClearing}
            stroke="#10b981"
            strokeDasharray="4 3"
            label={{ value: 'despeje', fill: '#10b981', fontSize: 10, position: 'top' }}
          />
        )}
        {time >= t0 && time <= t1 && (
          <ReferenceLine x={time} stroke="#fbbf24" strokeWidth={1.5} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
