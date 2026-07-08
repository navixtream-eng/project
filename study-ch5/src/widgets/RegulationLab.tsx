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

/** Transformador de la Sección 2 en pu: Zbase = 2400²/50k = 115.2 Ω */
const REQ = 4.0 / 115.2 // 0.0347 pu
const XEQ = 9.0 / 115.2 // 0.0781 pu
const PFE = 100 / 50000 // 0.002 pu (del ensayo OC)
const CURVE = '#3987e5'
const MARK = '#c98500'

/** VR% para carga L (pu) con fp dado (atraso > 0). V2 = 1 pu de referencia. */
function regulation(L: number, pf: number, lagging: boolean): number {
  const phi = Math.acos(Math.min(1, pf)) * (lagging ? 1 : -1)
  const iRe = L * Math.cos(phi)
  const iIm = -L * Math.sin(phi)
  // V1' = V2 + I·(Req + jXeq)
  const re = 1 + iRe * REQ - iIm * XEQ
  const im = iRe * XEQ + iIm * REQ
  return (Math.hypot(re, im) - 1) * 100
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Regulación de voltaje y eficiencia.
 * VR% mide cuánto sube la tensión del secundario al soltar la carga.
 * Depende críticamente del fp: la carga inductiva «tira» del voltaje a
 * través de Xeq; la capacitiva puede incluso LEVANTARLO (VR negativa).
 */
export default function RegulationLab() {
  const [load, setLoad] = useState(1.0)
  const [pf, setPf] = useState(0.8)
  const [lagging, setLagging] = useState(true)

  const vr = regulation(load, pf, lagging)
  const pcu = load * load * REQ
  const pout = load * pf
  const eta = pout > 0 ? (pout / (pout + PFE + pcu)) * 100 : 0

  // Curva VR continua: eje x = sen φ con signo (0 = fp unidad al centro;
  // positivo = atraso, negativo = adelanto). Así no hay salto en el medio.
  const data = useMemo(() => {
    const rows: { x: number; vr: number }[] = []
    for (let x = -0.8; x <= 0.8001; x += 0.01) {
      const lag = x >= 0
      const p = Math.sqrt(1 - x * x)
      rows.push({ x: Number(x.toFixed(3)), vr: Number(regulation(load, p, lag).toFixed(3)) })
    }
    return rows
  }, [load])

  const sinPhi = Math.sqrt(1 - pf * pf)
  const dotX = Number(((lagging ? 1 : -1) * sinPhi).toFixed(3))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Regulación de voltaje y eficiencia — el fp decide
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Carga</span>
          <input type="range" min={0.1} max={1.25} step={0.05} value={load}
            onChange={(e) => setLoad(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{(load * 100).toFixed(0)}%</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          fp
          <input type="range" min={0.6} max={0.995} step={0.005} value={pf}
            onChange={(e) => setPf(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{pf.toFixed(2)}</span>
        </label>
        <div className="flex gap-1">
          <button type="button" onClick={() => setLagging(true)}
            className={`rounded-md px-2 py-1 font-semibold ${lagging ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            atraso (inductiva)
          </button>
          <button type="button" onClick={() => setLagging(false)}
            className={`rounded-md px-2 py-1 font-semibold ${!lagging ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            adelanto (capacitiva)
          </button>
        </div>
        <span className="text-[10px] text-zinc-500">Req = {REQ.toFixed(3)} pu · Xeq = {XEQ.toFixed(3)} pu (de los ensayos)</span>
      </div>

      <div className="h-64 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 18, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[-0.8, 0.8]}
              ticks={[-0.8, -0.6, -0.436, 0, 0.436, 0.6, 0.8]}
              tickFormatter={(v: number) =>
                v === 0 ? '1.00' : `${Math.sqrt(1 - v * v).toFixed(1)}${v < 0 ? '↑' : '↓'}`
              }
              stroke="#71717a"
              tick={{ fontSize: 10 }}
              label={{ value: '← fp en adelanto (↑) · fp = 1 · fp en atraso (↓) →', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 10 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{ value: 'VR [%]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => {
                const x = Number(v)
                const p = Math.sqrt(Math.max(0, 1 - x * x))
                return `fp = ${p.toFixed(2)} ${x < 0 ? 'adelanto' : x > 0 ? 'atraso' : '(unidad)'}`
              }}
              formatter={(value) => [`${Number(value).toFixed(2)} %`, 'VR']}
            />
            <ReferenceLine y={0} stroke="#3f3f46" />
            <Line dataKey="vr" name="VR" stroke={CURVE} strokeWidth={2.2} dot={false} isAnimationActive={false} />
            <ReferenceDot x={dotX} y={Number(vr.toFixed(3))} r={7} fill={MARK} stroke="#fafafa" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="VR%" value={`${vr >= 0 ? '+' : ''}${vr.toFixed(2)} %`}
          accent={vr < 0 ? 'text-sky-300' : vr > 5 ? 'text-red-300' : 'text-emerald-300'} />
        <Readout label="η (eficiencia)" value={`${eta.toFixed(2)} %`} accent="text-emerald-300" />
        <Readout label="P cobre (∝ L²)" value={`${(pcu * 100).toFixed(2)} % base`} />
        <Readout label="P hierro (fija)" value={`${(PFE * 100).toFixed(2)} % base`} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) a plena carga, recorre el fp de 0.995 en atraso hacia 0.6: la VR se dispara — la corriente
        atrasada atraviesa Xeq «en el peor ángulo»; (2) cambia a ADELANTO: la curva cruza el cero y la
        VR se vuelve NEGATIVA — la carga capacitiva levanta la tensión por encima del vacío (efecto
        Ferranti en miniatura); (3) baja la carga al 50% y nota que la curva entera se aplana: VR
        escala casi linealmente con la corriente; (4) la η reutiliza el teorema del Cap. 5-S6: máxima
        donde el cobre (∝L²) iguala al hierro (fijo) — aquí con los números medidos por TUS ensayos.
      </footer>
    </div>
  )
}
