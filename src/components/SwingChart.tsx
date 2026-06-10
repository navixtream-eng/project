import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimResult } from '../engine/types'
import { toDeg } from '../engine/MathEngine'

interface SwingChartProps {
  result: SimResult
  time: number
}

/**
 * Oscilación temporal del rotor: ángulo de carga δ(t) y desviación de
 * velocidad Δω(t). La franja roja marca la ventana de falla.
 */
export default function SwingChart({ result, time }: SwingChartProps) {
  const data = useMemo(() => {
    const n = result.samples.length
    const stride = Math.max(1, Math.ceil(n / 1500))
    const rows: { t: number; deltaDeg: number; dOmega: number }[] = []
    for (let i = 0; i < n; i += stride) {
      const s = result.samples[i]
      rows.push({
        t: Number(s.t.toFixed(3)),
        deltaDeg: toDeg(s.delta),
        dOmega: s.dOmega,
      })
    }
    return rows
  }, [result])

  const ev = result.config.event
  const faultEnd =
    ev.type === 'short-circuit' ? ev.tFault + ev.tClearing : result.config.tEnd

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          type="number"
          domain={[0, result.config.tEnd]}
          stroke="#71717a"
          tick={{ fontSize: 11 }}
          label={{ value: 't [s]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
        />
        <YAxis
          yAxisId="delta"
          stroke="#34d399"
          tick={{ fontSize: 11 }}
          label={{ value: 'δ [°]', angle: -90, position: 'insideLeft', fill: '#34d399', fontSize: 11 }}
        />
        <YAxis
          yAxisId="omega"
          orientation="right"
          stroke="#38bdf8"
          tick={{ fontSize: 11 }}
          label={{ value: 'Δω [rad/s]', angle: 90, position: 'insideRight', fill: '#38bdf8', fontSize: 11 }}
        />
        <ChartTooltip
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(v) => `t = ${v} s`}
          formatter={(value, name) => [
            name === 'δ' ? `${Number(value).toFixed(1)}°` : `${Number(value).toFixed(3)} rad/s`,
            name,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />

        <ReferenceArea
          x1={ev.tFault}
          x2={Math.min(faultEnd, result.config.tEnd)}
          fill="#ef4444"
          fillOpacity={0.09}
          stroke="#ef4444"
          strokeOpacity={0.35}
          strokeDasharray="4 4"
          label={{ value: ev.type === 'short-circuit' ? 'falla' : 'evento', fill: '#ef4444', fontSize: 10, position: 'insideTop' }}
        />

        <Line yAxisId="delta" dataKey="deltaDeg" name="δ" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line yAxisId="omega" dataKey="dOmega" name="Δω" stroke="#38bdf8" strokeWidth={1.6} dot={false} isAnimationActive={false} />

        <ReferenceLine yAxisId="delta" x={time} stroke="#fbbf24" strokeWidth={1.5} />
        {result.lossOfSyncTime !== null && (
          <ReferenceLine
            yAxisId="delta"
            x={result.lossOfSyncTime}
            stroke="#ef4444"
            strokeDasharray="6 3"
            label={{ value: 'pérdida de sincronismo', fill: '#ef4444', fontSize: 10, position: 'top' }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
