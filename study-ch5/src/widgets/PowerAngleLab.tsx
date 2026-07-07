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
import { FlaskConical, TriangleAlert } from 'lucide-react'
import {
  findPowerEquilibria,
  pSalient,
  powerAngle,
  qAtDelta,
  synchronizingCoeff,
  toDeg,
  toRad,
} from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro, superficie #09090b):
 *  orden azul → aqua → violeta → amarillo, ΔE adyacente mínimo 61.6 */
const COLORS = {
  total: '#3987e5',
  main: '#199e70',
  reluctance: '#9085e9',
  Pm: '#c98500',
} as const

const VT = 1.0
/** Relación Xq/Xd típica de polos salientes para el modo con saliencia */
const XQ_RATIO = 0.6

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio 4 — La característica potencia-ángulo contra barra infinita.
 * Dos mandos reales: la TURBINA (Pm) desliza el punto de operación sobre la
 * curva; la EXCITACIÓN (Eaf) cambia la altura de la curva entera. El toggle
 * de saliencia agrega el par de reluctancia (término en sen 2δ).
 */
export default function PowerAngleLab() {
  const [Eaf, setEaf] = useState(1.4)
  const [Pm, setPm] = useState(0.8)
  const [Xs, setXs] = useState(1.0)
  const [salient, setSalient] = useState(false)

  const Xq = Xs * XQ_RATIO

  const powerFn = useMemo(
    () =>
      salient
        ? (d: number) => pSalient(Eaf, VT, Xs, Xq, d).total
        : (d: number) => powerAngle(Eaf, VT, Xs, d),
    [salient, Eaf, Xs, Xq],
  )

  const data = useMemo(() => {
    const rows: { deltaDeg: number; total: number; main: number | null; rel: number | null; Pm: number }[] = []
    for (let deg = 0; deg <= 180; deg += 1) {
      const d = toRad(deg)
      if (salient) {
        const c = pSalient(Eaf, VT, Xs, Xq, d)
        rows.push({ deltaDeg: deg, total: c.total, main: c.main, rel: c.reluctance, Pm })
      } else {
        rows.push({ deltaDeg: deg, total: powerAngle(Eaf, VT, Xs, d), main: null, rel: null, Pm })
      }
    }
    return rows
  }, [salient, Eaf, Xs, Xq, Pm])

  // Cresta de la curva (Pmax real, numérica: con saliencia el pico está antes de 90°)
  const peak = useMemo(() => {
    let best = { deltaDeg: 0, P: -Infinity }
    for (const r of data) if (r.total > best.P) best = { deltaDeg: r.deltaDeg, P: r.total }
    return best
  }, [data])

  const { stable, unstable } = useMemo(() => findPowerEquilibria(Pm, powerFn), [Pm, powerFn])
  const hasEq = stable !== null
  const margin = (peak.P - Pm) / peak.P
  const stiffness = stable !== null ? synchronizingCoeff(powerFn, stable) : null
  const Q = !salient && stable !== null ? qAtDelta(Eaf, VT, Xs, stable) : null

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Curva potencia-ángulo y los dos mandos
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Turbina · Pm</span>
          <input
            type="range"
            min={0}
            max={2.2}
            step={0.02}
            value={Pm}
            onChange={(e) => setPm(Number(e.target.value))}
            className="w-32"
          />
          <span className="w-14 font-mono text-zinc-200">{Pm.toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Excitación · |Eaf|</span>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.02}
            value={Eaf}
            onChange={(e) => setEaf(Number(e.target.value))}
            className="w-32"
          />
          <span className="w-14 font-mono text-zinc-200">{Eaf.toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Xd
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={Xs}
            onChange={(e) => setXs(Number(e.target.value))}
            className="w-24"
          />
          <span className="w-12 font-mono text-zinc-200">{Xs.toFixed(2)}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input
            type="checkbox"
            checked={salient}
            onChange={(e) => setSalient(e.target.checked)}
            className="h-3.5 w-3.5 accent-violet-500"
          />
          <span>
            Polos salientes <span className="text-zinc-600">(Xq = {XQ_RATIO}·Xd)</span>
          </span>
        </label>
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
              domain={[salient ? -0.8 : 0, Math.max(2.6, Math.ceil(peak.P * 1.15 * 10) / 10)]}
              label={{ value: 'P [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `δ = ${v}°`}
              formatter={(value, name) => [`${Number(value).toFixed(3)} pu`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            {salient && (
              <Line
                dataKey="main"
                name="término de excitación"
                stroke={COLORS.main}
                strokeWidth={1.6}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
            {salient && (
              <Line
                dataKey="rel"
                name="par de reluctancia (sen 2δ)"
                stroke={COLORS.reluctance}
                strokeWidth={1.6}
                strokeDasharray="2 3"
                dot={false}
                isAnimationActive={false}
              />
            )}
            <Line
              dataKey="total"
              name="P(δ) total"
              stroke={COLORS.total}
              strokeWidth={2.4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="Pm"
              name="Pm (turbina)"
              stroke={COLORS.Pm}
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />

            {/* Cresta de la curva: límite de estabilidad estática */}
            <ReferenceLine
              x={peak.deltaDeg}
              stroke="#e66767"
              strokeDasharray="3 4"
              label={{ value: `límite (δ = ${peak.deltaDeg}°)`, fill: '#e66767', fontSize: 10, position: 'insideTopRight' }}
            />

            {/* Punto de operación estable (relleno) e inestable (hueco) */}
            {stable !== null && (
              <ReferenceDot
                x={Number(toDeg(stable).toFixed(1))}
                y={Pm}
                r={8}
                fill={COLORS.Pm}
                stroke="#fafafa"
                strokeWidth={2}
              />
            )}
            {unstable !== null && (
              <ReferenceDot
                x={Number(toDeg(unstable).toFixed(1))}
                y={Pm}
                r={7}
                fill="#09090b"
                stroke="#e66767"
                strokeWidth={2}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!hasEq && (
        <p className="flex items-center gap-2 border-t border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-300">
          <TriangleAlert size={14} />
          Pm = {Pm.toFixed(2)} pu supera la cresta de la curva (Pmax = {peak.P.toFixed(2)} pu): no
          existe punto de equilibrio. El rotor acelera sin freno eléctrico — pérdida de sincronismo.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        <Readout
          label="δ de operación"
          value={stable !== null ? `${toDeg(stable).toFixed(1)}°` : '—'}
          accent={stable !== null ? undefined : 'text-red-400'}
        />
        <Readout label="Pmax (cresta)" value={`${peak.P.toFixed(3)} pu`} />
        <Readout
          label="Margen de reserva"
          value={hasEq ? `${(margin * 100).toFixed(0)}%` : 'AGOTADO'}
          accent={!hasEq ? 'text-red-400' : margin < 0.15 ? 'text-amber-300' : 'text-emerald-300'}
        />
        <Readout
          label="Rigidez dP/dδ"
          value={stiffness !== null ? `${stiffness.toFixed(2)} pu/rad` : '—'}
          accent={stiffness !== null && stiffness < 0.3 ? 'text-amber-300' : undefined}
        />
        <Readout
          label={salient ? 'Modo' : 'Q entregada'}
          value={salient ? 'SALIENTE' : Q !== null ? `${Q.toFixed(3)} pu` : '—'}
          accent={!salient && Q !== null && Q < 0 ? 'text-sky-300' : undefined}
        />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube <span className="text-amber-300">Pm</span> despacio: el punto amarillo TREPA por la
        curva (δ crece) hasta que en la cresta el equilibrio desaparece — anota el δ donde ocurre;
        (2) devuélvelo y ahora baja <span className="text-emerald-300">|Eaf|</span>: la curva entera se
        APLASTA y la cresta viene hacia tu punto — dos caminos distintos hacia la misma frontera;
        (3) observa la «rigidez» dP/dδ acercarse a cero cerca del límite: el resorte magnético se
        ablanda antes de romperse; (4) activa la saliencia y mira el pico adelantarse a δ &lt; 90° por
        el par de reluctancia — e incluso nota que con |Eaf| = 0 la máquina saliente aún transmite algo
        de potencia.
      </footer>
    </div>
  )
}
