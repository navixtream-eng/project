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
import { DEFAULT_DCDYN, dcDynSim, dcTimeConstants, fmt } from '../lib/machine'

const C = { ia: '#e2761f', rpm: '#3987e5', taue: '#e2761f', taum: '#3987e5' }

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Las dos constantes de tiempo.
 * τe = La/Ra (eléctrica, rápida) manda el establecimiento de la corriente;
 * τm = J·Ra/(KaΦ)² (mecánica, lenta) manda el de la velocidad. Casi siempre
 * τm ≫ τe: la corriente «ve» la velocidad como casi congelada.
 */
export default function TimeConstantLab() {
  const [La, setLa] = useState(0.008)
  const [J, setJ] = useState(0.15)

  const p = { ...DEFAULT_DCDYN, La, J }
  const { taue, taum } = dcTimeConstants(p)

  const data = useMemo(() => {
    const tEnd = Math.max(6 * taum, 0.05)
    const s = dcDynSim(p, () => p.Vt, () => 0, tEnd, 0.0002, 3)
    const peak = Math.max(...s.map((d) => d.ia)) || 1
    const wfin = s[s.length - 1].omega || 1
    return s.map((d) => ({ t: +(d.t * 1000).toFixed(2), iaN: d.ia / peak, wN: d.omega / wfin }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [La, J])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · τe rápida vs τm lenta: dos relojes en la máquina
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-orange-300">La (→ τe)</span>
          <input type="range" min={0.002} max={0.04} step={0.001} value={La} onChange={(e) => setLa(Number(e.target.value))} className="w-32" />
          <span className="w-16 font-mono text-zinc-200">{(La * 1000).toFixed(0)} mH</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">J (→ τm)</span>
          <input type="range" min={0.03} max={0.5} step={0.01} value={J} onChange={(e) => setJ(Number(e.target.value))} className="w-32" />
          <span className="w-16 font-mono text-zinc-200">{J.toFixed(2)} kg·m²</span>
        </label>
        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-zinc-300">
          τm/τe ≈ {fmt(taum / taue, 1)}
        </span>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'tiempo [ms]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, 1.1]}
              label={{ value: 'normalizado', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }} labelFormatter={(v) => `t = ${v} ms`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="iaN" name="corriente ia (norm.)" stroke={C.ia} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line dataKey="wN" name="velocidad ω (norm.)" stroke={C.rpm} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <ReferenceLine x={+(taue * 1000).toFixed(2)} stroke={C.taue} strokeDasharray="3 3"
              label={{ value: 'τe', fill: C.taue, fontSize: 11, position: 'top' }} />
            <ReferenceLine x={+(taum * 1000).toFixed(2)} stroke={C.taum} strokeDasharray="3 3"
              label={{ value: 'τm', fill: C.taum, fontSize: 11, position: 'top' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-3">
        <Readout label="τe = La/Ra (eléctrica)" value={`${fmt(taue * 1000, 1)} ms`} accent="text-orange-300" />
        <Readout label="τm = J·Ra/(KaΦ)² (mecánica)" value={`${fmt(taum * 1000, 1)} ms`} accent="text-sky-300" />
        <Readout label="Separación τm/τe" value={`${fmt(taum / taue, 1)}×`} accent={taum / taue > 3 ? 'text-emerald-300' : 'text-amber-300'} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) la <span className="text-orange-300">corriente</span> llega a su valor mucho antes que la{' '}
        <span className="text-sky-300">velocidad</span>: τe (línea naranja) es mucho menor que τm (línea
        azul); (2) sube La: τe crece y la corriente se vuelve más «perezosa»; sube J: τm crece y la
        velocidad tarda aún más; (3) mientras τm ≫ τe, para el lazo de corriente la velocidad es casi
        una constante — esto es lo que PERMITE el control en cascada de la Sección 5 (un lazo rápido de
        corriente dentro de uno lento de velocidad).
      </footer>
    </div>
  )
}
