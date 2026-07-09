import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_DC, type DcConnection, dcOperatingByIa, fmt } from '../lib/machine'

/** Paleta categórica validada (dataviz oscuro) */
const COLORS: Record<DcConnection, string> = {
  shunt: '#3987e5',
  serie: '#e2761f',
  acumulativa: '#199e70',
  diferencial: '#9085e9',
}
const LABELS: Record<DcConnection, string> = {
  shunt: 'Shunt / independiente',
  serie: 'Serie',
  acumulativa: 'Compuesta acumulativa',
  diferencial: 'Compuesta diferencial',
}

const RPM_MAX = 3200
const IA_MAX = 90

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Las conexiones de campo y sus caracteristicas par-velocidad.
 * Shunt: velocidad casi constante. Serie: par cuadrático y embalamiento en
 * vacío. Compuesta: el compromiso entre ambos.
 */
export default function DcConnectionLab() {
  const [conn, setConn] = useState<DcConnection>('shunt')
  const [Ia, setIa] = useState(40)

  const data = useMemo(() => {
    const rows: { T: number; shunt?: number; serie?: number; acumulativa?: number; diferencial?: number }[] = []
    // Muestreo por corriente; se grafica velocidad (rpm) contra par (T)
    const conns: DcConnection[] = ['shunt', 'serie', 'acumulativa', 'diferencial']
    const perConn: Record<DcConnection, { T: number; rpm: number }[]> = { shunt: [], serie: [], acumulativa: [], diferencial: [] }
    for (const c of conns) {
      for (let i = 1; i <= IA_MAX; i += 1) {
        const op = dcOperatingByIa(c, DEFAULT_DC, i)
        if (op.rpm > 0 && op.rpm < RPM_MAX) perConn[c].push({ T: op.T, rpm: op.rpm })
      }
    }
    // Unir en filas por par (cada curva es monótona en T)
    const allT = Array.from(new Set(conns.flatMap((c) => perConn[c].map((p) => Math.round(p.T)))))
      .filter((t) => t >= 0)
      .sort((x, y) => x - y)
    for (const t of allT) {
      const row: { T: number; shunt?: number; serie?: number; acumulativa?: number; diferencial?: number } = { T: t }
      for (const c of conns) {
        const pts = perConn[c]
        const near = pts.reduce<{ d: number; rpm: number } | null>((best, p) => {
          const d = Math.abs(p.T - t)
          return !best || d < best.d ? { d, rpm: p.rpm } : best
        }, null)
        if (near && near.d < 4) row[c] = Math.round(near.rpm)
      }
      rows.push(row)
    }
    return rows
  }, [])

  const op = dcOperatingByIa(conn, DEFAULT_DC, Ia)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Conexiones de campo y curva par-velocidad
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(LABELS) as DcConnection[]).map((c) => (
            <button key={c} type="button" onClick={() => setConn(c)}
              className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                conn === c ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {LABELS[c]}
            </button>
          ))}
        </div>
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">Carga · Ia</span>
          <input type="range" min={2} max={IA_MAX} step={1} value={Ia} onChange={(e) => setIa(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{Ia} A</span>
        </label>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="T" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'par T [N·m]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, RPM_MAX]}
              label={{ value: 'velocidad [r/min]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `T = ${v} N·m`} formatter={(val, name) => [`${Number(val).toFixed(0)} r/min`, name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(Object.keys(LABELS) as DcConnection[]).map((c) => (
              <Line key={c} dataKey={c} name={LABELS[c]} stroke={COLORS[c]}
                strokeWidth={conn === c ? 3 : 1.3} strokeOpacity={conn === c ? 1 : 0.45}
                dot={false} isAnimationActive={false} connectNulls />
            ))}
            {op.rpm > 0 && op.rpm < RPM_MAX && (
              <ReferenceDot x={Number(op.T.toFixed(0))} y={Number(op.rpm.toFixed(0))} r={6} fill={COLORS[conn]} stroke="#fafafa" strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Ea = Vt − Ia·R" value={`${fmt(op.Ea, 0)} V`} accent="text-sky-300" />
        <Readout label="Ka·Φ efectivo" value={`${fmt(op.kPhi, 2)} V·s/rad`} accent="text-violet-300" />
        <Readout label="Par" value={`${fmt(op.T, 0)} N·m`} accent="text-orange-300" />
        <Readout label="Velocidad"
          value={op.rpm > RPM_MAX || op.rpm < 0 ? '¡EMBALADO!' : `${fmt(op.rpm, 0)} r/min`}
          accent={op.rpm > RPM_MAX ? 'text-red-400' : 'text-emerald-300'} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) en <span className="text-sky-300">shunt</span> el flujo es fijo: la curva es casi PLANA — la
        velocidad apenas cae al cargar (buen regulador de velocidad); (2) en <span className="text-orange-300">serie</span>{' '}
        el flujo crece con Ia, así que T ∝ Ia² (gran par de arranque) pero al descargar (Ia→0) el flujo
        se desvanece y la velocidad se dispara — <span className="text-red-300">embalamiento</span>: jamás
        arranques un motor serie sin carga; (3) la <span className="text-emerald-300">compuesta acumulativa</span>{' '}
        suma un poco de campo serie al shunt: más par de arranque que el shunt, sin el embalamiento del
        serie — el compromiso clásico.
      </footer>
    </div>
  )
}
