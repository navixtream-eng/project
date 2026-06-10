import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SimResult } from '../engine/types'
import { toDeg } from '../engine/MathEngine'

interface PowerAngleChartProps {
  result: SimResult
  time: number
}

interface Row {
  deltaDeg: number
  pre: number
  fault: number
  post: number
  Pm: number
  /** Banda [Pe_falla, Pm] → área de aceleración A1 */
  a1: [number, number] | null
  /** Banda [Pm, Pe_post] → área de desaceleración A2 */
  a2: [number, number] | null
}

/**
 * Curva Potencia-Ángulo con las tres características (pre-falla, falla y
 * post-falla), las áreas del criterio de áreas iguales y un punto dinámico
 * que recorre la trayectoria real (δ(t), Pe(t)) de la simulación.
 */
export default function PowerAngleChart({ result, time }: PowerAngleChartProps) {
  const { powerCurves, equalArea, init, config } = result
  const Pm0 = config.op.P0
  const isSC = config.event.type === 'short-circuit'

  const data: Row[] = useMemo(() => {
    const d0 = toDeg(init.delta0)
    const dCl = equalArea ? toDeg(equalArea.deltaClear) : null
    const dU = equalArea?.deltaUnstableEq ? toDeg(equalArea.deltaUnstableEq) : null
    return powerCurves.map((p) => {
      let a1: [number, number] | null = null
      let a2: [number, number] | null = null
      if (isSC && dCl !== null) {
        if (p.deltaDeg >= d0 && p.deltaDeg <= dCl && Pm0 > p.fault) {
          a1 = [p.fault, Pm0]
        }
        if (dU !== null && p.deltaDeg >= dCl && p.deltaDeg <= dU && p.post > Pm0) {
          a2 = [Pm0, p.post]
        }
      }
      return { ...p, Pm: Pm0, a1, a2 }
    })
  }, [powerCurves, equalArea, init, Pm0, isSC])

  // Punto dinámico (δ(t), Pe(t)) sobre la curva activa
  const idx = Math.min(
    result.samples.length - 1,
    Math.max(0, Math.round(time / config.dt)),
  )
  const s = result.samples[idx]
  const dotDeg = toDeg(s.delta)
  const dotVisible = dotDeg >= 0 && dotDeg <= 180

  const PmFinal =
    config.event.type === 'torque-step' ? Pm0 + config.event.torqueStep : null

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 8, left: 0 }}>
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
          label={{ value: 'P [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
        />
        <ChartTooltip
          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(v) => `δ = ${v}°`}
          formatter={(value, name) =>
            Array.isArray(value)
              ? [`${Number(value[0]).toFixed(3)} → ${Number(value[1]).toFixed(3)} pu`, name]
              : [`${Number(value).toFixed(3)} pu`, name]
          }
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />

        {isSC && (
          <Area dataKey="a1" name="A1 (aceleración)" stroke="none" fill="#ef4444" fillOpacity={0.25} isAnimationActive={false} legendType="square" />
        )}
        {isSC && (
          <Area dataKey="a2" name="A2 (desaceleración)" stroke="none" fill="#10b981" fillOpacity={0.25} isAnimationActive={false} legendType="square" />
        )}

        <Line dataKey="pre" name="Pe pre-falla" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line dataKey="fault" name="Pe durante falla" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
        <Line dataKey="post" name="Pe post-falla" stroke="#38bdf8" strokeWidth={1.6} strokeDasharray="2 3" dot={false} isAnimationActive={false} />
        <Line dataKey="Pm" name="Pm" stroke="#fbbf24" strokeWidth={1.6} dot={false} isAnimationActive={false} />

        {PmFinal !== null && (
          <ReferenceLine y={PmFinal} stroke="#fbbf24" strokeDasharray="8 4" label={{ value: 'Pm final', fill: '#fbbf24', fontSize: 10, position: 'right' }} />
        )}
        <ReferenceLine x={toDeg(init.delta0)} stroke="#a1a1aa" strokeDasharray="2 4" label={{ value: 'δ₀', fill: '#a1a1aa', fontSize: 11, position: 'top' }} />
        {equalArea && (
          <ReferenceLine x={toDeg(equalArea.deltaClear)} stroke="#f59e0b" strokeDasharray="2 4" label={{ value: 'δcl', fill: '#f59e0b', fontSize: 11, position: 'top' }} />
        )}
        {equalArea?.deltaCritical != null && (
          <ReferenceLine x={toDeg(equalArea.deltaCritical)} stroke="#ef4444" strokeDasharray="2 4" label={{ value: 'δcr', fill: '#ef4444', fontSize: 11, position: 'top' }} />
        )}

        {dotVisible && (
          <ReferenceDot
            x={dotDeg}
            y={s.Pe}
            r={7}
            fill={s.stage === 'fault' ? '#ef4444' : '#fbbf24'}
            stroke="#fafafa"
            strokeWidth={2}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
