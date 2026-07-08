import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { computeLosses, findMaxEfficiency, type LossParams } from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro):
 *  desglose aqua→violeta→rojo→amarillo; curva η en azul (serie única). */
const COLORS = {
  eta: '#3987e5',
  mech: '#199e70',
  core: '#9085e9',
  field: '#e66767',
  copper: '#c98500',
} as const

const VT = 1.0
const XS = 0.9 // Xs saturada de la máquina de la Sección 5

const CATEGORIES = [
  { key: 'mech', label: 'fricción y ventilación', color: COLORS.mech },
  { key: 'core', label: 'hierro (núcleo)', color: COLORS.core },
  { key: 'field', label: 'campo (If²·Rf)', color: COLORS.field },
  { key: 'copper', label: 'cobre de armadura (Ia²·Ra)', color: COLORS.copper },
] as const

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio 8 — Pérdidas y rendimiento. La curva η(P) con su máximo donde
 * las pérdidas variables igualan a las fijas, y el desglose de pérdidas del
 * punto actual como barra apilada: costos fijos (fricción, hierro) contra
 * costos variables (cobre ∝ Ia², campo ∝ Eaf²).
 */
export default function EfficiencyLab() {
  const [P, setP] = useState(0.8)
  const [pf, setPf] = useState(0.9)
  const [Ra, setRa] = useState(0.025)
  const [Pfixed, setPfixed] = useState(0.02) // fricción+ventilación + núcleo
  const [kField, setKField] = useState(0.002)

  const params: LossParams = useMemo(
    () => ({ Ra, Pfw: Pfixed * 0.45, Pcore: Pfixed * 0.55, kField }),
    [Ra, Pfixed, kField],
  )

  const point = computeLosses(P, pf, true, VT, XS, params)
  const best = useMemo(() => findMaxEfficiency(pf, true, VT, XS, params), [pf, params])

  const data = useMemo(() => {
    const rows: { P: number; eta: number }[] = []
    for (let p = 0.05; p <= 1.3001; p += 0.01) {
      rows.push({
        P: Number(p.toFixed(2)),
        eta: Number((computeLosses(p, pf, true, VT, XS, params).eta * 100).toFixed(3)),
      })
    }
    return rows
  }, [pf, params])

  // El teorema del máximo compara las pérdidas CUADRÁTICAS (cobre ∝ Ia²)
  // contra todo lo demás (fijas + campo, este último cuasi-constante).
  const quadratic = point.copper
  const rest = point.mech + point.core + point.field

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Curva de rendimiento y desglose de pérdidas
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Carga · P</span>
          <input type="range" min={0.05} max={1.3} step={0.01} value={P}
            onChange={(e) => setP(Number(e.target.value))} className="w-32" />
          <span className="w-14 font-mono text-zinc-200">{P.toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          fp (atraso)
          <select value={pf} onChange={(e) => setPf(Number(e.target.value))}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200">
            {[1.0, 0.95, 0.9, 0.85, 0.8, 0.7].map((v) => (
              <option key={v} value={v}>{v.toFixed(2)}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Ra
          <input type="range" min={0.005} max={0.03} step={0.001} value={Ra}
            onChange={(e) => setRa(Number(e.target.value))} className="w-24" />
          <span className="w-14 font-mono text-zinc-200">{Ra.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Fijas (fricción+hierro)
          <input type="range" min={0.005} max={0.05} step={0.001} value={Pfixed}
            onChange={(e) => setPfixed(Number(e.target.value))} className="w-24" />
          <span className="w-14 font-mono text-zinc-200">{Pfixed.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Campo (kf)
          <input type="range" min={0.001} max={0.012} step={0.0005} value={kField}
            onChange={(e) => setKField(Number(e.target.value))} className="w-24" />
          <span className="w-16 font-mono text-zinc-200">{kField.toFixed(4)}</span>
        </label>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 24, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="P"
              type="number"
              domain={[0, 1.3]}
              ticks={[0, 0.25, 0.5, 0.75, 1, 1.25]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 'potencia entregada P [pu]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              domain={[70, 100]}
              ticks={[70, 75, 80, 85, 90, 95, 100]}
              label={{ value: 'η [%]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `P = ${v} pu`}
              formatter={(value) => [`${Number(value).toFixed(2)} %`, 'η']}
            />
            <Line dataKey="eta" name="η" stroke={COLORS.eta} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <ReferenceLine
              x={Number(best.P.toFixed(2))}
              stroke="#71717a"
              strokeDasharray="4 4"
              label={{ value: `η máx (P = ${best.P.toFixed(2)})`, fill: '#a1a1aa', fontSize: 10, position: 'insideTopRight' }}
            />
            <ReferenceDot
              x={Number(P.toFixed(2))}
              y={Number((point.eta * 100).toFixed(3))}
              r={7}
              fill="#c98500"
              stroke="#fafafa"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Desglose apilado de pérdidas del punto actual */}
      <div className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-3">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Desglose de pérdidas en P = {P.toFixed(2)} pu — total {(point.total * 100).toFixed(2)}% de la base
        </p>
        <div className="flex h-6 w-full overflow-hidden rounded-md">
          {CATEGORIES.map((c) => {
            const value = point[c.key]
            const width = (value / point.total) * 100
            return (
              <div
                key={c.key}
                title={`${c.label}: ${(value * 100).toFixed(2)}%`}
                style={{ width: `${width}%`, backgroundColor: c.color }}
                className="border-r-2 border-zinc-950 last:border-r-0"
              />
            )
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {CATEGORIES.map((c) => (
            <span key={c.key} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
              {c.label}:{' '}
              <span className="font-mono text-zinc-200">{(point[c.key] * 100).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        <Readout label="η en el punto" value={`${(point.eta * 100).toFixed(2)} %`} accent="text-emerald-300" />
        <Readout label="η máximo" value={`${(best.eta * 100).toFixed(2)} % @ P=${best.P.toFixed(2)}`} />
        <Readout label="|Ia|" value={`${point.IaMag.toFixed(3)} pu`} />
        <Readout
          label="Cuadráticas (cobre Ia²Ra)"
          value={`${(quadratic * 100).toFixed(2)} %`}
          accent={Math.abs(quadratic - rest) < 0.006 ? 'text-emerald-300' : undefined}
        />
        <Readout
          label="Resto (fijas + campo)"
          value={`${(rest * 100).toFixed(2)} %`}
          accent={Math.abs(quadratic - rest) < 0.006 ? 'text-emerald-300' : undefined}
        />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) lleva P hacia cero: η se DESPLOMA — las pérdidas fijas se pagan completas produzcas lo que
        produzcas; (2) coloca el punto exactamente en la línea «η máx» y compara los dos readouts de la
        derecha: cuadráticas ≈ resto (¡esa es la condición del máximo!); (3) baja el fp a 0.7 con la misma
        P y mira crecer el segmento amarillo (cobre): la corriente reactiva calienta sin producir un
        solo watt; (4) sube Ra (una máquina más barata) y observa cómo el máximo de la curva se corre
        hacia cargas menores.
      </footer>
    </div>
  )
}
