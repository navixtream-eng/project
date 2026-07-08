import { useMemo, useState } from 'react'
import {
  Area,
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
import { FlaskConical, TriangleAlert } from 'lucide-react'
import {
  eaA1,
  eaA2,
  eaDeltaCritical,
  eaDeltaU,
  eaTimeToAngle,
  toDeg,
  toRad,
} from '../lib/machine'

/** Curva post-falla azul, Pm amarilla; A1 rojo (acelera), A2 verde (frena) —
 *  identidad reforzada con etiquetas directas, no solo color. */
const COLORS = { curve: '#3987e5', Pm: '#c98500', A1: '#e66767', A2: '#10b981' } as const

const PMAX = 3.88 // E'·Vt/X'd del Problema 12 (curva transitoria)
const H = 3.5
const F = 60

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El criterio de áreas iguales.
 * Durante la falla (Pe = 0) el rotor deposita energía cinética: área A1.
 * Tras el despeje dispone del área A2 para frenarse antes de δu.
 * Si A1 ≤ A2 sobrevive; si no, desliza polos. El slider mueve el ángulo
 * de despeje y las dos cuentas se pintan en vivo.
 */
export default function EqualAreaLab() {
  const [Pm, setPm] = useState(0.9)
  const [deltaClDeg, setDeltaClDeg] = useState(45)

  const delta0 = Math.asin(Math.min(1, Pm / PMAX))
  const deltaU = eaDeltaU(delta0)
  const deltaCl = Math.max(delta0, Math.min(deltaU, toRad(deltaClDeg)))
  const A1 = eaA1(Pm, delta0, deltaCl)
  const A2 = eaA2(Pm, PMAX, deltaCl, deltaU)
  const deltaCr = eaDeltaCritical(Pm, PMAX)
  const tCl = eaTimeToAngle(deltaCl, delta0, Pm, H, F)
  const tCr = eaTimeToAngle(deltaCr, delta0, Pm, H, F)
  const stable = A1 <= A2

  const data = useMemo(() => {
    const d0 = toDeg(delta0)
    const dU = toDeg(deltaU)
    const dCl = toDeg(deltaCl)
    return Array.from({ length: 181 }, (_, deg) => {
      const pe = PMAX * Math.sin(toRad(deg))
      // Bandas [inferior, superior] para las áreas del criterio
      const a1: [number, number] | null =
        deg >= d0 && deg <= dCl ? [0, Pm] : null
      const a2: [number, number] | null =
        deg >= dCl && deg <= dU && pe > Pm ? [Pm, pe] : null
      return { deltaDeg: deg, pe, Pm, a1, a2 }
    })
  }, [delta0, deltaU, deltaCl, Pm])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Criterio de áreas iguales (falla 3φ en bornes, curva transitoria E′/X′d)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Pm</span>
          <input type="range" min={0.3} max={1.1} step={0.01} value={Pm}
            onChange={(e) => setPm(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{Pm.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-red-300">δ de despeje</span>
          <input type="range" min={Math.ceil(toDeg(delta0)) + 1} max={Math.floor(toDeg(deltaU))} step={1}
            value={Math.round(toDeg(deltaCl))}
            onChange={(e) => setDeltaClDeg(Number(e.target.value))} className="w-40" />
          <span className="w-10 font-mono text-zinc-200">{toDeg(deltaCl).toFixed(0)}°</span>
        </label>
        <span className="text-[10px] text-zinc-500">
          Pmax = {PMAX} pu (E′/X′d del Problema 12) · H = {H} s · Pe = 0 durante la falla
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
              formatter={(value, name) =>
                Array.isArray(value)
                  ? [`${Number(value[0]).toFixed(2)} → ${Number(value[1]).toFixed(2)} pu`, name]
                  : [`${Number(value).toFixed(3)} pu`, name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            <Area dataKey="a1" name="A1 · energía ganada (acelera)" stroke="none"
              fill={COLORS.A1} fillOpacity={0.3} isAnimationActive={false} legendType="square" />
            <Area dataKey="a2" name="A2 · frenado disponible" stroke="none"
              fill={COLORS.A2} fillOpacity={0.28} isAnimationActive={false} legendType="square" />

            <Line dataKey="pe" name="Pe post-falla (E′/X′d)" stroke={COLORS.curve}
              strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line dataKey="Pm" name="Pm" stroke={COLORS.Pm} strokeWidth={1.8} dot={false} isAnimationActive={false} />

            <ReferenceLine x={Number(toDeg(delta0).toFixed(1))} stroke="#a1a1aa" strokeDasharray="2 4"
              label={{ value: 'δ₀', fill: '#a1a1aa', fontSize: 11, position: 'insideTopLeft' }} />
            <ReferenceLine x={Number(toDeg(deltaCl).toFixed(1))} stroke={COLORS.A1} strokeDasharray="2 4"
              label={{ value: 'δcl', fill: COLORS.A1, fontSize: 11, position: 'insideTop' }} />
            <ReferenceLine x={Number(toDeg(deltaCr).toFixed(1))} stroke="#fafafa" strokeDasharray="6 4"
              label={{ value: `δcr = ${toDeg(deltaCr).toFixed(0)}°`, fill: '#fafafa', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine x={Number(toDeg(deltaU).toFixed(1))} stroke="#71717a" strokeDasharray="2 4"
              label={{ value: 'δu', fill: '#71717a', fontSize: 11, position: 'insideBottomRight' }} />

            <ReferenceDot x={Number(toDeg(deltaCl).toFixed(1))} y={Pm} r={7}
              fill={stable ? '#10b981' : '#e66767'} stroke="#fafafa" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!stable && (
        <p className="flex items-center gap-2 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">
          <TriangleAlert size={14} />
          A1 &gt; A2: la energía cinética depositada no cabe en el frenado disponible antes de δu —
          el rotor cruza el punto de no retorno y desliza polos.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-6">
        <Readout label="A1 (ganada)" value={`${A1.toFixed(3)} pu·rad`} accent="text-red-300" />
        <Readout label="A2 (disponible)" value={`${A2.toFixed(3)} pu·rad`} accent="text-emerald-300" />
        <Readout label="A1/A2" value={A2 > 0 ? (A1 / A2).toFixed(2) : '∞'}
          accent={stable ? 'text-emerald-300' : 'text-red-400'} />
        <Readout label="t del despeje" value={`${tCl.toFixed(3)} s`} />
        <Readout label="t_cr (de δcr)" value={`${tCr.toFixed(3)} s`} accent="text-amber-300" />
        <Readout label="Veredicto" value={stable ? 'ESTABLE' : 'INESTABLE'}
          accent={stable ? 'text-emerald-300' : 'text-red-400'} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) arrastra <span className="text-red-300">δ de despeje</span> hacia la derecha: A1 (rojo)
        crece mientras A2 (verde) mengua — el veredicto cambia EXACTAMENTE cuando el despeje cruza la
        línea blanca δcr, donde A1 = A2; (2) con Pm = 0.90 (donde ambas curvas comparten la misma E′), compara el «t_cr (de δcr)» con el
        del laboratorio de oscilación de arriba: dos métodos independientes —áreas y RK4— deben
        coincidir;
        (3) sube Pm y mira las tres señales de peligro juntas: δ₀ sube, δu baja y δcr se te viene
        encima — la máquina cargada tiene el corral energético más chico.
      </footer>
    </div>
  )
}
