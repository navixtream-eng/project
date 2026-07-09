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
import { DEFAULT_DCDYN, dcDynSim, dcStartCurrent, fmt } from '../lib/machine'

const C = { withR: '#199e70', direct: '#e66767', rated: '#c98500' }
const I_RATED = 60

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El arranque directo y su corriente monstruosa.
 * A rotor parado no hay contra-FEM (Ea = 0), así que la corriente solo la
 * limita Ra: Iarr = Vt/Ra, muchísimas veces la nominal. Una resistencia de
 * arranque en serie la recorta hasta que el motor gana velocidad.
 */
export default function StartingTransientLab() {
  const [Rstart, setRstart] = useState(2.0)
  const p = DEFAULT_DCDYN

  const IarrDirect = dcStartCurrent(p.Vt, p.Ra)
  const IarrR = dcStartCurrent(p.Vt, p.Ra + Rstart)

  const data = useMemo(() => {
    const direct = dcDynSim({ ...p, Ra: p.Ra }, () => p.Vt, () => 20, 0.5, 0.0002, 4)
    const withR = dcDynSim({ ...p, Ra: p.Ra + Rstart }, () => p.Vt, () => 20, 0.5, 0.0002, 4)
    return direct.map((d, i) => ({
      t: +(d.t * 1000).toFixed(1),
      direct: d.ia,
      withR: withR[i]?.ia ?? null,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Rstart])

  const peakDirect = Math.max(...data.map((d) => d.direct))
  const peakR = Math.max(...data.map((d) => d.withR ?? 0))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Arranque directo: Iarr = Vt/Ra y la resistencia de arranque
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Resistencia de arranque R_arr</span>
          <input type="range" min={0} max={4} step={0.1} value={Rstart} onChange={(e) => setRstart(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{Rstart.toFixed(1)} Ω</span>
        </label>
        <span className="rounded-md border border-red-700 bg-zinc-900 px-2.5 py-1 font-mono text-red-300">
          directo: {fmt(IarrDirect / I_RATED, 1)}× nominal
        </span>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'tiempo [ms]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'corriente ia [A]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => `t = ${v} ms`} formatter={(val, n) => [`${Number(val).toFixed(0)} A`, n]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={I_RATED} stroke={C.rated} strokeDasharray="5 4" label={{ value: 'nominal', fill: C.rated, fontSize: 10, position: 'insideTopRight' }} />
            <Line dataKey="direct" name="arranque directo" stroke={C.direct} strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <Line dataKey="withR" name={`con R_arr = ${Rstart.toFixed(1)} Ω`} stroke={C.withR} strokeWidth={2.6} dot={false} isAnimationActive={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Iarr directo = Vt/Ra" value={`${fmt(IarrDirect, 0)} A`} accent="text-red-300" />
        <Readout label="Iarr con R_arr" value={`${fmt(IarrR, 0)} A`} accent="text-emerald-300" />
        <Readout label="Pico real (directo)" value={`${fmt(peakDirect, 0)} A`} accent="text-red-300" />
        <Readout label="Pico real (con R)" value={`${fmt(peakR, 0)} A`} accent="text-emerald-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con R_arr = 0 (arranque directo), la corriente arranca en Vt/Ra —{' '}
        <span className="text-red-300">muchas veces la nominal</span>: quema escobillas y da un tirón de
        par brutal; (2) sube la <span className="text-emerald-300">resistencia de arranque</span> y mira
        el pico desplomarse — por eso los arrancadores insertan R en serie y la retiran por pasos al
        acelerar; (3) el mismo fenómeno gobierna el CORTOCIRCUITO de un generador de CC: sin Ea que la
        limite en el primer instante, la corriente de falla es enorme y las fuerzas mecánicas sobre las
        bobinas y el colector pueden ser destructivas.
      </footer>
    </div>
  )
}
