import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlaskConical } from 'lucide-react'
import { DEFAULT_INDUCTION, inductionMaxTorque, inductionStartTorque, inductionTorque, syncSpeedRpm } from '../lib/machine'

/** Paleta categórica validada (dataviz oscuro): curva azul, referencia aqua, carga ámbar */
const COLORS = { curve: '#3987e5', ref: '#199e70', load: '#c98500' }

const NS = syncSpeedRpm(DEFAULT_INDUCTION.f, DEFAULT_INDUCTION.poles)
const R2_REF = DEFAULT_INDUCTION.R2

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/** Punto de operación estable: T(s)=TL en el tramo 0 < s < s_maxT (búsqueda). */
function operatingSlip(p: typeof DEFAULT_INDUCTION, TL: number, sMax: number): number | null {
  let lo = 1e-4
  let hi = sMax
  if (inductionTorque(p, hi) < TL) return null // la carga supera el par de ruptura
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (inductionTorque(p, mid) < TL) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Laboratorio — La característica par-velocidad.
 * La curva T(n) que lo explica todo: par de arranque (n=0), par máximo o de
 * ruptura (Tmax) y el punto de operación donde el par iguala a la carga.
 * Descubre la joya: Tmax NO depende de R2 — pero el deslizamiento al que
 * ocurre, sí.
 */
export default function TorqueSpeedLab() {
  const [R2, setR2] = useState(R2_REF)
  const [Vfrac, setVfrac] = useState(1.0)
  const [TLoad, setTLoad] = useState(150)

  const p = { ...DEFAULT_INDUCTION, R2, V: (DEFAULT_INDUCTION.V) * Vfrac }
  const pref = { ...DEFAULT_INDUCTION, V: DEFAULT_INDUCTION.V * Vfrac }

  const { Tmax, sMax } = inductionMaxTorque(p)
  const Tstart = inductionStartTorque(p)
  const nMax = (1 - sMax) * NS

  const data = useMemo(() => {
    const rows: { nm: number; T: number; Tref: number; load: number }[] = []
    for (let nm = 0; nm <= NS; nm += 15) {
      const s = 1 - nm / NS
      const ss = s < 1e-4 ? 1e-4 : s
      rows.push({ nm, T: inductionTorque(p, ss), Tref: inductionTorque(pref, ss), load: TLoad })
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [R2, Vfrac, TLoad])

  const sOp = operatingSlip(p, TLoad, sMax)
  const nOp = sOp !== null ? (1 - sOp) * NS : null

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Característica par-velocidad (Tmax, arranque, R₂)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">R₂ (rotor)</span>
          <input type="range" min={0.05} max={0.6} step={0.01} value={R2}
            onChange={(e) => setR2(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{R2.toFixed(2)} Ω</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Tensión V</span>
          <input type="range" min={0.5} max={1.1} step={0.02} value={Vfrac}
            onChange={(e) => setVfrac(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{(Vfrac * 100).toFixed(0)}%</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Par de carga</span>
          <input type="range" min={0} max={500} step={5} value={TLoad}
            onChange={(e) => setTLoad(Number(e.target.value))} className="w-24" />
          <span className="w-16 font-mono text-zinc-200">{TLoad} N·m</span>
        </label>
      </div>

      <div className="h-80 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="nm" type="number" domain={[0, NS]} ticks={[0, 300, 600, 900, 1200, 1500, 1800]}
              stroke="#71717a" tick={{ fontSize: 11 }}
              label={{ value: 'velocidad nₘ [r/min]', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, Math.max(600, Math.ceil(Tmax * 1.15 / 50) * 50)]}
              label={{ value: 'par [N·m]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `nₘ = ${v} r/min`} formatter={(val, name) => [`${Number(val).toFixed(0)} N·m`, name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="Tref" name="referencia (R₂ = 0.15)" stroke={COLORS.ref} strokeWidth={1.4} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <Line dataKey="T" name="par del motor T(n)" stroke={COLORS.curve} strokeWidth={2.6} dot={false} isAnimationActive={false} />
            <Line dataKey="load" name="par de carga" stroke={COLORS.load} strokeWidth={1.8} dot={false} isAnimationActive={false} />
            <ReferenceLine x={Number(nMax.toFixed(0))} stroke="#e66767" strokeDasharray="3 4"
              label={{ value: `Tmax @ ${nMax.toFixed(0)}`, fill: '#e66767', fontSize: 10, position: 'insideTopLeft' }} />
            {nOp !== null && (
              <ReferenceDot x={Number(nOp.toFixed(0))} y={TLoad} r={7} fill={COLORS.load} stroke="#fafafa" strokeWidth={2} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4">
        <Readout label="Par de arranque (n=0)" value={`${Tstart.toFixed(0)} N·m`} accent="text-sky-300" />
        <Readout label="Par máximo Tmax" value={`${Tmax.toFixed(0)} N·m`} accent="text-red-300" />
        <Readout label="s del par máximo" value={`${sMax.toFixed(3)}`} accent="text-amber-300" />
        <Readout label="n de operación"
          value={nOp !== null ? `${nOp.toFixed(0)} r/min` : 'SE CALA'}
          accent={nOp !== null ? 'text-emerald-300' : 'text-red-400'} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube <span className="text-sky-300">R₂</span> y vigila la línea aqua de referencia: la
        cresta <span className="text-red-300">Tmax</span> mantiene su ALTURA pero se corre hacia
        velocidades bajas (s_maxT ∝ R₂) — más R₂ da más par de ARRANQUE sin cambiar el par de ruptura;
        (2) baja la <span className="text-emerald-300">tensión</span>: como T ∝ V², la curva entera se
        aplasta (Tmax cae con el cuadrado) — por eso un motor arranca mal con tensión baja; (3) sube el
        <span className="text-amber-300"> par de carga</span> por encima de Tmax: el punto de operación
        desaparece y el motor SE CALA — la carga venció al par de ruptura.
      </footer>
    </div>
  )
}
