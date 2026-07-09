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
import { DEFAULT_DCDYN, dcDynSim, dcTimeConstants, fmt } from '../lib/machine'

/** Paleta categórica validada: corriente naranja, velocidad azul */
const C = { ia: '#e2761f', rpm: '#3987e5' }

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Las dos ecuaciones diferenciales acopladas.
 * Un escalón de tensión arranca el motor: la corriente sube RÁPIDO (τe) y la
 * velocidad, arrastrando la inercia, sube DESPACIO (τm). La corriente pica y
 * luego cae al aparecer la contra-FEM.
 */
export default function DcDynamicLab() {
  const [La, setLa] = useState(0.004)
  const [J, setJ] = useState(0.15)
  const [Tload, setTload] = useState(20)

  const p = { ...DEFAULT_DCDYN, La, J }
  const { taue, taum } = dcTimeConstants(p)

  const data = useMemo(() => {
    const s = dcDynSim(p, () => p.Vt, () => Tload, 0.6)
    return s.map((d) => ({ t: +(d.t * 1000).toFixed(1), ia: d.ia, rpm: d.rpm }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [La, J, Tload])

  const peakIa = Math.max(...data.map((d) => d.ia))
  const finalRpm = data[data.length - 1].rpm

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Arranque: las dos ODE acopladas (ia y ω)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-orange-300">La (inductancia)</span>
          <input type="range" min={0.001} max={0.03} step={0.001} value={La} onChange={(e) => setLa(Number(e.target.value))} className="w-28" />
          <span className="w-16 font-mono text-zinc-200">{(La * 1000).toFixed(0)} mH</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">J (inercia)</span>
          <input type="range" min={0.02} max={0.4} step={0.01} value={J} onChange={(e) => setJ(Number(e.target.value))} className="w-28" />
          <span className="w-16 font-mono text-zinc-200">{J.toFixed(2)} kg·m²</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-zinc-300">T carga</span>
          <input type="range" min={0} max={60} step={2} value={Tload} onChange={(e) => setTload(Number(e.target.value))} className="w-24" />
          <span className="w-14 font-mono text-zinc-200">{Tload} N·m</span>
        </label>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'tiempo [ms]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis yAxisId="ia" stroke={C.ia} tick={{ fontSize: 11 }}
              label={{ value: 'ia [A]', angle: -90, position: 'insideLeft', fill: C.ia, fontSize: 11 }} />
            <YAxis yAxisId="rpm" orientation="right" stroke={C.rpm} tick={{ fontSize: 11 }}
              label={{ value: 'ω [r/min]', angle: 90, position: 'insideRight', fill: C.rpm, fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => `t = ${v} ms`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="ia" dataKey="ia" name="corriente ia" stroke={C.ia} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line yAxisId="rpm" dataKey="rpm" name="velocidad ω" stroke={C.rpm} strokeWidth={2.4} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="τe = La/Ra" value={`${fmt(taue * 1000, 1)} ms`} accent="text-orange-300" />
        <Readout label="τm = J·Ra/(KaΦ)²" value={`${fmt(taum * 1000, 1)} ms`} accent="text-sky-300" />
        <Readout label="Pico de corriente" value={`${fmt(peakIa, 0)} A`} accent="text-red-300" />
        <Readout label="Velocidad final" value={`${fmt(finalRpm, 0)} r/min`} accent="text-emerald-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) al aplicar el escalón, la <span className="text-orange-300">corriente</span> salta primero
        (gobernada por τe = La/Ra, rápido) y la <span className="text-sky-300">velocidad</span> la sigue
        despacio (τm, la inercia); (2) la corriente PICA porque al principio ω = 0 y no hay contra-FEM —
        luego, al ganar velocidad, la FEM crece y frena la corriente; (3) sube la inercia J: la velocidad
        tarda más y la corriente se mantiene alta más tiempo — inercia grande = arranque largo y caliente.
      </footer>
    </div>
  )
}
