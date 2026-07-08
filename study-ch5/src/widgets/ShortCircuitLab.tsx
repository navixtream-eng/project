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
import {
  scEnvelope,
  scLevels,
  scPhaseCurrent,
  toRad,
  type TransientParams,
} from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): azul/amarillo/violeta */
const COLORS = {
  i: '#3987e5',
  env: '#c98500',
  dc: '#9085e9',
} as const

const E = 1.0 // máquina en vacío a tensión nominal antes de la falla

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El cortocircuito trifásico súbito.
 * Corriente instantánea de una fase con sus tres periodos (subtransitorio,
 * transitorio, permanente), las envolventes desplazadas por el offset DC y
 * el control didáctico clave: el ÁNGULO α de la tensión en el instante de
 * la falla, que decide cuánta asimetría le toca a cada fase.
 */
export default function ShortCircuitLab() {
  const [alphaDeg, setAlphaDeg] = useState(0)
  const [Xd2, setXd2] = useState(0.2)
  const [Td2, setTd2] = useState(0.035)
  const [Ta, setTa] = useState(0.15)

  const params: TransientParams = useMemo(
    () => ({ Xd: 1.1, Xd1: 0.3, Xd2, Td1: 1.0, Td2, Ta, f: 60 }),
    [Xd2, Td2, Ta],
  )
  const alpha = toRad(alphaDeg)
  const levels = scLevels(E, params)

  const { data, peak } = useMemo(() => {
    const rows: { t: number; i: number; envP: number; envM: number; dc: number }[] = []
    let pk = 0
    const dt = 1 / (60 * 24)
    for (let t = 0; t <= 0.4; t += dt) {
      const i = scPhaseCurrent(t, alpha, E, params)
      const env = Math.SQRT2 * scEnvelope(t, E, params)
      const dc =
        -Math.SQRT2 * (E / params.Xd2) * Math.cos(alpha - Math.PI / 2) * Math.exp(-t / params.Ta)
      if (Math.abs(i) > pk) pk = Math.abs(i)
      rows.push({
        t: Number(t.toFixed(5)),
        i: Number(i.toFixed(3)),
        envP: Number((dc + env).toFixed(3)),
        envM: Number((dc - env).toFixed(3)),
        dc: Number(dc.toFixed(3)),
      })
    }
    return { data: rows, peak: pk }
  }, [alpha, params])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Cortocircuito trifásico súbito (falla en t = 0, máquina en vacío)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">α · instante de la falla</span>
          <input type="range" min={-90} max={90} step={1} value={alphaDeg}
            onChange={(e) => setAlphaDeg(Number(e.target.value))} className="w-36" />
          <span className="w-10 font-mono text-zinc-200">{alphaDeg}°</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          X″d
          <input type="range" min={0.1} max={0.3} step={0.005} value={Xd2}
            onChange={(e) => setXd2(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{Xd2.toFixed(3)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          T″d
          <input type="range" min={0.015} max={0.08} step={0.005} value={Td2}
            onChange={(e) => setTd2(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{Td2.toFixed(3)} s</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Ta
          <input type="range" min={0.05} max={0.3} step={0.01} value={Ta}
            onChange={(e) => setTa(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{Ta.toFixed(2)} s</span>
        </label>
        <span className="text-[10px] text-zinc-500">X′d = 0.3 · Xd = 1.1 · T′d = 1.0 s (fijos)</span>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 18, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 0.4]}
              ticks={[0, 0.1, 0.2, 0.3, 0.4]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 't [s] desde la falla', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{ value: 'i(t) [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `t = ${Number(v).toFixed(4)} s`}
              formatter={(value, name) => [`${Number(value).toFixed(2)} pu`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="i" name="corriente de fase" stroke={COLORS.i} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line dataKey="envP" name="envolventes (DC ± √2·I(t))" stroke={COLORS.env} strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            <Line dataKey="envM" stroke={COLORS.env} strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} legendType="none" />
            <Line dataKey="dc" name="componente DC" stroke={COLORS.dc} strokeWidth={1.8} strokeDasharray="2 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        <Readout label='I″ = E/X″d' value={`${levels.Isub.toFixed(2)} pu`} accent="text-red-300" />
        <Readout label="I′ = E/X′d" value={`${levels.Itrans.toFixed(2)} pu`} accent="text-amber-300" />
        <Readout label="Iss = E/Xd" value={`${levels.Iss.toFixed(2)} pu`} accent="text-emerald-300" />
        <Readout label="Pico máximo |i|" value={`${peak.toFixed(2)} pu`}
          accent={peak > 1.6 * Math.SQRT2 * levels.Isub ? 'text-red-300' : undefined} />
        <Readout label="Asimetría pico/√2·I″" value={(peak / (Math.SQRT2 * levels.Isub)).toFixed(2)} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) mueve <span className="text-amber-300">α</span> de 0° a ±90°: la onda pasa de
        perfectamente simétrica (falla en el PICO de tensión: la corriente, 90° atrás, nace en cero)
        a asimetría máxima (falla en el CRUCE POR CERO: offset DC completo, pico ≈ 1.8·√2·I″) — la
        falla no elige el instante, y a cada fase le toca un α distinto (separados 120°); (2) achica X″d y mira crecer
        el primer pico: por eso X″d dimensiona el poder de corte de los interruptores; (3) alarga Ta y
        observa a la componente violeta (DC) resistirse a morir — la onda «cuelga» descentrada más
        tiempo; (4) nota los tres regímenes de la envolvente: cae rápido (T″d, amortiguadores), luego
        lento (T′d, campo), y aterriza en Iss = E/Xd.
      </footer>
    </div>
  )
}
