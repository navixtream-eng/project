import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical, TriangleAlert } from 'lucide-react'
import {
  criticalClearingTime,
  solveFromPQ,
  swingSimulation,
  toDeg,
} from '../lib/machine'

const DELTA_COLOR = '#3987e5' // serie única (paleta validada, slot 1)
const VT = 1.0
const XD1 = 0.3
const D = 0.15
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
 * Laboratorio — La ecuación de oscilación con el modelo E' tras X'd.
 * Cortocircuito trifásico en bornes en t = 0 (Pe = 0), despeje en t_clear
 * y la pregunta de fondo: ¿el rotor vuelve o desliza polos? Compara el
 * despeje elegido con el tiempo crítico calculado por bisección.
 */
export default function SwingLab() {
  const [Pm, setPm] = useState(0.9)
  const [tClear, setTClear] = useState(0.15)
  const [H, setH] = useState(3.5)

  // E' del punto de carga (fp 0.9 atraso) con la reactancia transitoria:
  // el enlace de flujo del campo no salta, así que E' queda "congelada".
  const Eprime = useMemo(() => {
    const Q = Pm * Math.tan(Math.acos(0.9))
    return solveFromPQ(VT, Pm, Q, XD1).EafMag
  }, [Pm])

  const sim = useMemo(
    () => swingSimulation(Pm, Eprime, VT, XD1, H, D, F, tClear),
    [Pm, Eprime, H, tClear],
  )
  const tcr = useMemo(
    () => criticalClearingTime(Pm, Eprime, VT, XD1, H, D, F),
    [Pm, Eprime, H],
  )

  const data = useMemo(
    () =>
      sim.samples.map((s) => ({
        t: Number(s.t.toFixed(3)),
        delta: Number(toDeg(s.delta).toFixed(2)),
      })),
    [sim],
  )
  const delta0 = toDeg(Math.asin(Math.min(1, (Pm * XD1) / (Eprime * VT))))
  const margin = tcr !== null ? tcr - tClear : null

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Ecuación de oscilación — ¿vuelve o desliza polos?
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Pm (carga previa)</span>
          <input type="range" min={0.2} max={1.1} step={0.01} value={Pm}
            onChange={(e) => setPm(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{Pm.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-red-300">t_clear (despeje)</span>
          <input type="range" min={0.02} max={0.8} step={0.01} value={tClear}
            onChange={(e) => setTClear(Number(e.target.value))} className="w-32" />
          <span className="w-12 font-mono text-zinc-200">{tClear.toFixed(2)} s</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          H (inercia)
          <input type="range" min={2} max={8} step={0.1} value={H}
            onChange={(e) => setH(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{H.toFixed(1)} s</span>
        </label>
        <span className="text-[10px] text-zinc-500">
          E′ = {Eprime.toFixed(3)} pu (del punto de carga) · X′d = {XD1} · falla 3φ en bornes en t = 0
        </span>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 18, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 't [s]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              domain={[0, 240]}
              ticks={[0, 60, 120, 180, 240]}
              allowDataOverflow
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{ value: 'δ [°]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `t = ${v} s`}
              formatter={(value) => [`${Number(value).toFixed(1)}°`, 'δ']}
            />
            <ReferenceArea
              x1={0}
              x2={Math.min(tClear, 5)}
              fill="#e66767"
              fillOpacity={0.1}
              stroke="#e66767"
              strokeOpacity={0.35}
              strokeDasharray="4 4"
              label={{ value: 'falla', fill: '#e66767', fontSize: 10, position: 'insideTop' }}
            />
            <ReferenceLine y={180} stroke="#e66767" strokeDasharray="3 4"
              label={{ value: '180°', fill: '#e66767', fontSize: 10, position: 'insideBottomRight' }} />
            <Line dataKey="delta" name="δ" stroke={DELTA_COLOR} strokeWidth={2.2} dot={false} isAnimationActive={false} />
            {sim.lossOfSyncTime !== null && (
              <ReferenceLine
                x={Number(sim.lossOfSyncTime.toFixed(2))}
                stroke="#e66767"
                strokeDasharray="6 3"
                label={{ value: 'pérdida de sincronismo', fill: '#e66767', fontSize: 10, position: 'top' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!sim.stable && (
        <p className="flex items-center gap-2 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">
          <TriangleAlert size={14} />
          El rotor superó 180° acelerando: deslizamiento de polos. Despeja antes de t_cr o baja la carga.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        <Readout label="δ₀ inicial" value={`${delta0.toFixed(1)}°`} />
        <Readout label="δ máximo"
          value={sim.stable ? `${toDeg(sim.maxDelta).toFixed(1)}°` : '> 180° (escapa)'}
          accent={sim.stable ? undefined : 'text-red-400'} />
        <Readout label="t_cr (bisección)" value={tcr !== null ? `${tcr.toFixed(3)} s` : '> 1.2 s'}
          accent="text-amber-300" />
        <Readout label="Margen t_cr − t_clear"
          value={margin !== null ? `${margin >= 0 ? '+' : ''}${margin.toFixed(3)} s` : '—'}
          accent={margin !== null && margin < 0 ? 'text-red-400' : 'text-emerald-300'} />
        <Readout label="Veredicto" value={sim.stable ? 'ESTABLE' : 'INESTABLE'}
          accent={sim.stable ? 'text-emerald-300' : 'text-red-400'} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube <span className="text-red-300">t_clear</span> poco a poco hasta cruzar t_cr: la
        oscilación amortiguada se convierte de golpe en escalada sin retorno — la estabilidad
        transitoria es un fenómeno de umbral, no de grados; (2) duplica H y verifica que t_cr crece
        ≈ √2 veces (más inercia = más tiempo para reaccionar); (3) baja Pm y mira crecer el margen:
        una máquina descargada sobrevive fallas mucho más largas. Para el fenómeno completo —
        corrientes, fasores animados y criterio de áreas iguales — abre el simulador SyncLab de este
        mismo repositorio.
      </footer>
    </div>
  )
}
