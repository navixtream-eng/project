import { useMemo, useState } from 'react'
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
import { FlaskConical } from 'lucide-react'
import { DEFAULT_INDUCTION, inductionTorque, syncSpeedRpm } from '../lib/machine'

/** Paleta categórica validada (dataviz oscuro): jaula azul, alta-R ámbar, doble emerald, devanado violeta */
const COLORS = { cage: '#3987e5', high: '#c98500', dbl: '#199e70', wound: '#9085e9' }

const NS = syncSpeedRpm(DEFAULT_INDUCTION.f, DEFAULT_INDUCTION.poles)
const R2_STD = 0.15
const R2_HIGH = 0.5
const R2_DBL_RUN = 0.12
const R2_DBL_START = 0.6

const torqueAt = (R2: number, s: number) => inductionTorque({ ...DEFAULT_INDUCTION, R2 }, s < 1e-4 ? 1e-4 : s)

function Readout({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="font-mono text-sm font-semibold" style={{ color }}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Jaula de ardilla vs rotor devanado (y barras profundas).
 * El dilema: mucha R₂ da buen arranque pero mal rendimiento; poca R₂ es al
 * revés. Las soluciones: la barra profunda / doble jaula (R₂ que cambia sola
 * con el deslizamiento) y el rotor devanado (R₂ externa que tú retiras).
 */
export default function RotorTypeLab() {
  const [Rext, setRext] = useState(0.35)

  const data = useMemo(() => {
    const rows: { nm: number; cage: number; high: number; dbl: number; wound: number }[] = []
    for (let nm = 0; nm <= NS; nm += 15) {
      const s = 1 - nm / NS
      // Doble jaula / barra profunda: R₂ alta a alto deslizamiento (efecto pelicular), baja en marcha
      const R2dbl = R2_DBL_RUN + (R2_DBL_START - R2_DBL_RUN) * s
      rows.push({
        nm,
        cage: torqueAt(R2_STD, s),
        high: torqueAt(R2_HIGH, s),
        dbl: inductionTorque({ ...DEFAULT_INDUCTION, R2: R2dbl }, s < 1e-4 ? 1e-4 : s),
        wound: torqueAt(R2_STD + Rext, s),
      })
    }
    return rows
  }, [Rext])

  const startTorque = (R2: number) => torqueAt(R2, 1)
  const R2dblStart = R2_DBL_START

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Jaula, doble jaula y rotor devanado
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-violet-300">Rotor devanado · R externa</span>
          <input type="range" min={0} max={0.7} step={0.01} value={Rext}
            onChange={(e) => setRext(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{Rext.toFixed(2)} Ω</span>
        </label>
        <span className="text-[10px] text-zinc-500">retira R al acelerar → sigue la envolvente</span>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="nm" type="number" domain={[0, NS]} ticks={[0, 300, 600, 900, 1200, 1500, 1800]}
              stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'velocidad nₘ [r/min]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, 600]}
              label={{ value: 'par [N·m]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `nₘ = ${v} r/min`} formatter={(val, name) => [`${Number(val).toFixed(0)} N·m`, name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="cage" name="jaula estándar (R₂ baja)" stroke={COLORS.cage} strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line dataKey="high" name="jaula alta resistencia" stroke={COLORS.high} strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line dataKey="dbl" name="doble jaula / barra profunda" stroke={COLORS.dbl} strokeWidth={2.6} dot={false} isAnimationActive={false} />
            <Line dataKey="wound" name="rotor devanado (+R ext)" stroke={COLORS.wound} strokeWidth={2.2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Arranque · jaula" value={`${startTorque(R2_STD).toFixed(0)} N·m`} color={COLORS.cage} />
        <Readout label="Arranque · alta R" value={`${startTorque(R2_HIGH).toFixed(0)} N·m`} color={COLORS.high} />
        <Readout label="Arranque · doble jaula" value={`${startTorque(R2dblStart).toFixed(0)} N·m`} color={COLORS.dbl} />
        <Readout label="Arranque · devanado" value={`${startTorque(R2_STD + Rext).toFixed(0)} N·m`} color={COLORS.wound} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) compara la <span style={{ color: COLORS.cage }}>jaula estándar</span> (poco arranque, gran
        marcha) con la <span style={{ color: COLORS.high }}>jaula de alta R</span> (gran arranque, mala
        marcha): es el dilema central; (2) la <span style={{ color: COLORS.dbl }}>doble jaula</span> hace
        trampa: por el efecto pelicular su R₂ es ALTA al arrancar (fᵣ alta) y BAJA en marcha — buen
        arranque Y buena marcha, sin partes móviles; (3) mueve la <span style={{ color: COLORS.wound }}>R
        externa</span> del rotor devanado: arranca con R alta (mucho par, poca corriente de línea) y al
        acelerar la retiras hasta caer sobre la curva de jaula estándar — el mismo motor recorre la
        envolvente óptima a mano.
      </footer>
    </div>
  )
}
