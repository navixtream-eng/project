import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_DCDYN, dcDriveSim, fmt } from '../lib/machine'

const C = { ref: '#71717a', w: '#3987e5', ia: '#e2761f', lim: '#e66767' }
const TARGET = 150 // rad/s de referencia

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Control en cascada (drive): lazo de corriente dentro de lazo
 * de velocidad. El PI de velocidad pide una corriente (limitada a ±Imax para
 * proteger los transistores y acotar el par); el PI de corriente fabrica la
 * tensión. Resultado: la velocidad sigue una rampa exacta y rechaza la carga.
 */
export default function DriveControlLab() {
  const [Imax, setImax] = useState(90)
  const [kpS, setKpS] = useState(1.5)
  const p = DEFAULT_DCDYN

  const data = useMemo(() => {
    const wref = (t: number) => Math.min(TARGET, (TARGET * t) / 0.12)
    const tload = (t: number) => (t >= 0.35 ? 55 : 12)
    const s = dcDriveSim(p, wref, tload, { kpS, kiS: 45, kpC: 4, kiC: 300, Imax, Vmax: 320 }, 0.75, 0.0002, 5)
    return s.map((d) => ({
      t: +(d.t * 1000).toFixed(1),
      ref: (d.wref * 60) / (2 * Math.PI),
      rpm: d.rpm,
      ia: d.ia,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Imax, kpS])

  const targetRpm = (TARGET * 60) / (2 * Math.PI)
  const peakIa = Math.max(...data.map((d) => d.ia))
  // Error de velocidad tras la perturbación (últimas muestras)
  const settleErr = Math.abs(data[data.length - 1].rpm - targetRpm)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Drive en cascada: lazo de corriente + lazo de velocidad
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-red-300">Límite de corriente Imax</span>
          <input type="range" min={40} max={150} step={5} value={Imax} onChange={(e) => setImax(Number(e.target.value))} className="w-32" />
          <span className="w-14 font-mono text-zinc-200">{Imax} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">Ganancia velocidad kpₛ</span>
          <input type="range" min={0.3} max={4} step={0.1} value={kpS} onChange={(e) => setKpS(Number(e.target.value))} className="w-28" />
          <span className="w-10 font-mono text-zinc-200">{kpS.toFixed(1)}</span>
        </label>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'tiempo [ms] — carga sube en t=350 ms', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis yAxisId="rpm" stroke={C.w} tick={{ fontSize: 11 }}
              label={{ value: 'ω [r/min]', angle: -90, position: 'insideLeft', fill: C.w, fontSize: 11 }} />
            <YAxis yAxisId="ia" orientation="right" stroke={C.ia} tick={{ fontSize: 11 }}
              label={{ value: 'ia [A]', angle: 90, position: 'insideRight', fill: C.ia, fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => `t = ${v} ms`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine yAxisId="ia" y={Imax} stroke={C.lim} strokeDasharray="5 4" label={{ value: 'Imax', fill: C.lim, fontSize: 10, position: 'insideTopRight' }} />
            <Line yAxisId="rpm" dataKey="ref" name="referencia ω*" stroke={C.ref} strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            <Line yAxisId="rpm" dataKey="rpm" name="velocidad ω" stroke={C.w} strokeWidth={2.6} dot={false} isAnimationActive={false} />
            <Line yAxisId="ia" dataKey="ia" name="corriente ia" stroke={C.ia} strokeWidth={1.8} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3">
        <Readout label="Corriente pico (limitada)" value={`${fmt(peakIa, 0)} A`} accent={peakIa <= Imax + 2 ? 'text-emerald-300' : 'text-red-300'} />
        <Readout label="Error final de velocidad" value={`${fmt(settleErr, 0)} r/min`} accent={settleErr < 15 ? 'text-emerald-300' : 'text-amber-300'} />
        <Readout label="Referencia" value={`${fmt(targetRpm, 0)} r/min`} accent="text-sky-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) durante la rampa de arranque, la <span className="text-orange-300">corriente</span> se pega
        al <span className="text-red-300">límite Imax</span> — el lazo interno la satura para proteger
        los transistores y acotar el par; la <span className="text-sky-300">velocidad</span> sube en
        rampa controlada, no a golpes; (2) en t = 350 ms la carga sube de golpe: la velocidad cae un
        instante y el control la RECUPERA sola (el integrador anula el error) — rechazo de perturbación;
        (3) baja Imax: el arranque es más suave pero más lento; sube kpₛ: responde más rápido pero puede
        sobrepasar. Es el compromiso de todo variador.
      </footer>
    </div>
  )
}
