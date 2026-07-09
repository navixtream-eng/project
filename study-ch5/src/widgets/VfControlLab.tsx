import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_INDUCTION, inductionAtFreq, inductionMaxTorque, inductionTorque, vfRegion, vfVoltage } from '../lib/machine'

/** Paleta categórica validada (dataviz oscuro): seleccionada azul, referencias grises */
const COLORS = { sel: '#3987e5', ref: '#3f3f46', v: '#c98500' }

const base = DEFAULT_INDUCTION
const FBASE = 60
const VRATED = base.V
const BOOST = 15
const NMAX = (120 * 100) / base.poles // 3000 r/min a 100 Hz

const nsOf = (f: number) => (120 * f) / base.poles

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Control escalar V/f.
 * Mantener V/f constante conserva el flujo (y el par máximo) hasta la
 * frecuencia nominal; por encima, la tensión se satura y el flujo decae:
 * región de par constante seguida de debilitamiento de campo (potencia const).
 */
export default function VfControlLab() {
  const [f, setF] = useState(60)

  const V = vfVoltage(f, FBASE, VRATED, BOOST)
  const region = vfRegion(f, FBASE)
  const p = inductionAtFreq(base, f, V)
  const { Tmax } = inductionMaxTorque(p)
  const fluxRel = V / f / (VRATED / FBASE)
  const ns = nsOf(f)

  const data = useMemo(() => {
    // Eje común de velocidad; cada frecuencia de referencia aporta su columna
    const refs = [20, 40, 60, 80, 100]
    const rows: Record<string, number>[] = []
    const step = NMAX / 120
    for (let nm = 0; nm <= NMAX; nm += step) {
      const row: Record<string, number> = { nm }
      for (const rf of refs) {
        const rns = nsOf(rf)
        if (nm <= rns) {
          const V2 = vfVoltage(rf, FBASE, VRATED, BOOST)
          row[`f${rf}`] = inductionTorque(inductionAtFreq(base, rf, V2), Math.max(1e-4, 1 - nm / rns))
        }
      }
      rows.push(row)
    }
    // Curva seleccionada, interpolada al eje común
    for (const row of rows) {
      const nm = row.nm
      if (nm <= ns) {
        row.sel = inductionTorque(p, Math.max(1e-4, 1 - nm / ns))
      }
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Control V/f: par constante y debilitamiento de campo
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">Frecuencia f</span>
          <input type="range" min={5} max={100} step={1} value={f}
            onChange={(e) => setF(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{f} Hz</span>
        </label>
        <span className={`rounded-md border px-2.5 py-1 font-mono ${region === 'par-constante' ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}>
          {region === 'par-constante' ? 'PAR CONSTANTE' : 'DEBILITAMIENTO'}
        </span>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="nm" type="number" domain={[0, NMAX]} ticks={[0, 600, 1200, 1800, 2400, 3000]}
              stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'velocidad nₘ [r/min]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, 600]}
              label={{ value: 'par [N·m]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `nₘ = ${v} r/min`} formatter={(val, name) => [`${Number(val).toFixed(0)} N·m`, name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {[20, 40, 60, 80, 100].map((rf) => (
              <Line key={rf} dataKey={`f${rf}`} name={`${rf} Hz`} stroke={COLORS.ref} strokeWidth={1.2} dot={false} isAnimationActive={false} legendType="none" connectNulls={false} />
            ))}
            <Line dataKey="sel" name={`f = ${f} Hz (activa)`} stroke={COLORS.sel} strokeWidth={2.8} dot={false} isAnimationActive={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Tensión V" value={`${V.toFixed(0)} V`} accent="text-amber-300" />
        <Readout label="Flujo (∝ V/f)" value={`${(fluxRel * 100).toFixed(0)} %`}
          accent={fluxRel > 0.98 ? 'text-emerald-300' : 'text-amber-300'} />
        <Readout label="nₛ síncrona" value={`${ns.toFixed(0)} r/min`} accent="text-sky-300" />
        <Readout label="Par máximo" value={`${Tmax.toFixed(0)} N·m`} accent="text-red-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) baja f por debajo de 60 Hz: la curva de par se desliza hacia la izquierda pero conserva su
        ALTURA — como V/f es constante, el flujo se mantiene y el par máximo también (región de{' '}
        <span className="text-emerald-300">par constante</span>); (2) sube f por encima de 60 Hz: la
        tensión ya no puede crecer (topa en su límite), el <span className="text-amber-300">flujo cae</span>{' '}
        como 1/f y el par máximo se desploma como 1/f² — es el{' '}
        <span className="text-amber-300">debilitamiento de campo</span>, donde el motor da potencia casi
        constante a costa de par; (3) el refuerzo (boost) a muy baja f evita que la caída en R₁ ahogue
        el flujo en el arranque.
      </footer>
    </div>
  )
}
