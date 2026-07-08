import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
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
import {
  airGapVoltage,
  extractTestResults,
  occVoltage,
  sccCurrent,
  type OccModel,
} from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): terna azul/aqua/amarillo */
const COLORS = {
  occ: '#3987e5',
  airgap: '#199e70',
  scc: '#c98500',
} as const

/** Pendiente fija de la línea de entrehierro; el codo Vm es lo ajustable. */
const K = 1.222
const N = 3

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio 7 — Los dos ensayos que revelan a la máquina: circuito
 * abierto (OCC, se dobla por saturación) y cortocircuito (SCC, recta
 * porque la reacción de armadura desmagnetiza el hierro). Ambas magnitudes
 * en pu comparten un único eje. De su cociente salen Xs, AFNL, AFSC y SCR.
 */
export default function OccSccLab() {
  const [If, setIf] = useState(1.2)
  const [Vm, setVm] = useState(1.3)
  const [XsU, setXsU] = useState(1.1)

  const model: OccModel = useMemo(() => ({ k: K, Vm, n: N }), [Vm])
  const res = useMemo(() => extractTestResults(model, XsU), [model, XsU])

  const data = useMemo(() => {
    const rows: { If: number; occ: number; ag: number; scc: number }[] = []
    for (let i = 0; i <= 2.0001; i += 0.02) {
      rows.push({
        If: Number(i.toFixed(2)),
        occ: occVoltage(i, model),
        ag: airGapVoltage(i, model),
        scc: sccCurrent(i, model, XsU),
      })
    }
    return rows
  }, [model, XsU])

  const vocCursor = occVoltage(If, model)
  const vagCursor = airGapVoltage(If, model)
  const iscCursor = sccCurrent(If, model, XsU)
  // Xs "aparente" usando la OCC saturada en el cursor: cae al subir If
  const xsApparent = vocCursor / iscCursor

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Ensayos OCC y SCC — de las curvas a los parámetros
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Cursor · If</span>
          <input type="range" min={0.1} max={2} step={0.01} value={If}
            onChange={(e) => setIf(Number(e.target.value))} className="w-36" />
          <span className="w-14 font-mono text-zinc-200">{If.toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Codo de saturación Vm
          <input type="range" min={1.1} max={1.6} step={0.01} value={Vm}
            onChange={(e) => setVm(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{Vm.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Xs no saturada
          <input type="range" min={0.8} max={1.4} step={0.05} value={XsU}
            onChange={(e) => setXsU(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{XsU.toFixed(2)}</span>
        </label>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 24, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="If"
              type="number"
              domain={[0, 2]}
              ticks={[0, 0.5, 1, 1.5, 2]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: 'corriente de campo If [pu]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              domain={[0, 2.4]}
              ticks={[0, 0.6, 1.2, 1.8, 2.4]}
              tickFormatter={(v: number) => v.toFixed(1)}
              label={{ value: 'Voc, Isc [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `If = ${v} pu`}
              formatter={(value, name) => [`${Number(value).toFixed(3)} pu`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />

            <ReferenceLine y={1} stroke="#3f3f46" strokeDasharray="2 4"
              label={{ value: 'nominal 1.0', fill: '#71717a', fontSize: 10, position: 'insideBottomRight' }} />

            <Line dataKey="ag" name="línea de entrehierro" stroke={COLORS.airgap}
              strokeWidth={1.6} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            <Line dataKey="occ" name="OCC (circuito abierto)" stroke={COLORS.occ}
              strokeWidth={2.4} dot={false} isAnimationActive={false} />
            <Line dataKey="scc" name="SCC (cortocircuito)" stroke={COLORS.scc}
              strokeWidth={2} dot={false} isAnimationActive={false} />

            {/* Cursor: los tres puntos que se leen en el ensayo */}
            <ReferenceLine x={Number(If.toFixed(2))} stroke="#fafafa" strokeOpacity={0.35} />
            <ReferenceDot x={Number(If.toFixed(2))} y={Number(vocCursor.toFixed(3))} r={6}
              fill={COLORS.occ} stroke="#fafafa" strokeWidth={1.5} />
            <ReferenceDot x={Number(If.toFixed(2))} y={Number(vagCursor.toFixed(3))} r={5}
              fill={COLORS.airgap} stroke="#fafafa" strokeWidth={1.5} />
            <ReferenceDot x={Number(If.toFixed(2))} y={Number(iscCursor.toFixed(3))} r={6}
              fill={COLORS.scc} stroke="#fafafa" strokeWidth={1.5} />

            {/* AFNL y AFSC: los dos números que definen la SCR */}
            <ReferenceDot x={Number(res.afnl.toFixed(3))} y={1} r={5} fill="#09090b"
              stroke={COLORS.occ} strokeWidth={2}
              label={{ value: 'AFNL', fill: COLORS.occ, fontSize: 10, position: 'top' }} />
            <ReferenceDot x={Number(res.afsc.toFixed(3))} y={1} r={5} fill="#09090b"
              stroke={COLORS.scc} strokeWidth={2}
              label={{ value: 'AFSC', fill: COLORS.scc, fontSize: 10, position: 'bottom' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4 lg:grid-cols-8">
        <Readout label="Voc (cursor)" value={`${vocCursor.toFixed(3)} pu`} />
        <Readout label="Vag (cursor)" value={`${vagCursor.toFixed(3)} pu`} />
        <Readout label="Isc (cursor)" value={`${iscCursor.toFixed(3)} pu`} />
        <Readout
          label="Voc/Isc (cursor)"
          value={`${xsApparent.toFixed(3)} pu`}
          accent={xsApparent < res.xsUnsat * 0.93 ? 'text-amber-300' : undefined}
        />
        <Readout label="AFNL" value={`${res.afnl.toFixed(3)} pu`} />
        <Readout label="AFSC" value={`${res.afsc.toFixed(3)} pu`} />
        <Readout label="SCR = AFNL/AFSC" value={res.scr.toFixed(3)} accent="text-emerald-300" />
        <Readout label="Xs saturada" value={`${res.xsSat.toFixed(3)} pu`} accent="text-emerald-300" />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) lleva el cursor a If pequeña: OCC y línea de entrehierro coinciden y Voc/Isc ={' '}
        Xs no saturada; súbelo y mira ese cociente CAER — la saturación reduce la reactancia efectiva;
        (2) endurece el codo (Vm ↓): AFNL crece (cuesta más campo llegar a la tensión nominal), la SCR
        cae y Xs saturada baja — la SCC ni se entera; (3) verifica la identidad SCR = 1/Xs,sat en los
        readouts para cualquier ajuste.
      </footer>
    </div>
  )
}
