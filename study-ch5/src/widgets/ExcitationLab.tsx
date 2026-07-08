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
import { FlaskConical, TriangleAlert } from 'lucide-react'
import { minEafForP, toDeg, vCurvePoint } from '../lib/machine'

const VT = 1.0
const XS = 1.0
const CURVE = '#3987e5' // slot 1 (serie única)
const MARK = '#c98500' // punto de operación

/**
 * Laboratorio 3 — Control de excitación a potencia constante (curva V).
 * A P fija, variar |Eaf| (∝ corriente de campo If) no cambia la potencia:
 * cambia la potencia REACTIVA y por tanto |Ia| y el factor de potencia.
 * El mínimo de |Ia| ocurre exactamente en fp = 1.
 */
export default function ExcitationLab() {
  const [P, setP] = useState(0.6)
  const eafMin = minEafForP(P, VT, XS)
  const [Eaf, setEaf] = useState(1.4)

  const eafSafe = Math.max(Eaf, eafMin * 1.001)
  const point = vCurvePoint(P, eafSafe, VT, XS)
  // |Eaf| en el que fp = 1 (Q = 0):  Eaf·cosδ = Vt  ⇒  Eaf² = Vt² + (P·Xs/Vt)²
  const eafUnity = Math.hypot(VT, (P * XS) / VT)

  const data = useMemo(() => {
    const rows: { Eaf: number; Ia: number | null }[] = []
    for (let e = 0.3; e <= 2.6; e += 0.02) {
      const s = vCurvePoint(P, e, VT, XS)
      rows.push({ Eaf: Number(e.toFixed(3)), Ia: s ? Number(s.IaMag.toFixed(4)) : null })
    }
    return rows
  }, [P])

  const nearLimit = eafSafe < eafMin * 1.15

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Excitación a potencia constante (la curva V)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          P constante
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={P}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-14 font-mono text-zinc-200">{P.toFixed(2)} pu</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          |Eaf| (∝ If)
          <input
            type="range"
            min={0.3}
            max={2.6}
            step={0.01}
            value={Eaf}
            onChange={(e) => setEaf(Number(e.target.value))}
            className="w-40"
          />
          <span className="w-14 font-mono text-zinc-200">{eafSafe.toFixed(2)} pu</span>
        </label>
        <span className="text-[10px] text-zinc-500">Vt = 1.0 pu · Xs = 1.0 pu (fijos)</span>
      </div>

      <div className="h-72 px-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="Eaf"
              type="number"
              domain={[0.3, 2.6]}
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: '|Eaf| [pu]  (∝ corriente de campo If)', position: 'insideBottom', offset: -2, fill: '#a1a1aa', fontSize: 11 }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11 }}
              label={{ value: '|Ia| [pu]', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => `|Eaf| = ${v} pu`}
              formatter={(value) => [`${Number(value).toFixed(3)} pu`, '|Ia|']}
            />
            <Line dataKey="Ia" name="|Ia|" stroke={CURVE} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
            <ReferenceLine
              x={Number(eafUnity.toFixed(3))}
              stroke="#71717a"
              strokeDasharray="4 4"
              label={{ value: 'fp = 1 (mínimo)', fill: '#a1a1aa', fontSize: 10, position: 'top' }}
            />
            <ReferenceLine
              x={Number(eafMin.toFixed(3))}
              stroke="#e66767"
              strokeDasharray="2 4"
              label={{ value: 'límite δ = 90°', fill: '#e66767', fontSize: 10, position: 'insideTopLeft' }}
            />
            {point && (
              <ReferenceDot x={Number(eafSafe.toFixed(3))} y={Number(point.IaMag.toFixed(4))} r={7} fill={MARK} stroke="#fafafa" strokeWidth={2} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        {point ? (
          <>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">|Ia|</p>
              <p className="font-mono text-sm font-semibold text-zinc-100">{point.IaMag.toFixed(3)} pu</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">fp</p>
              <p className="font-mono text-sm font-semibold text-zinc-100">
                {point.pf.toFixed(3)} {point.lagging ? 'atraso' : 'adelanto'}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">Q entregada</p>
              <p className={`font-mono text-sm font-semibold ${point.Q >= 0 ? 'text-emerald-300' : 'text-sky-300'}`}>
                {point.Q.toFixed(3)} pu
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">δ</p>
              <p className="font-mono text-sm font-semibold text-zinc-100">{toDeg(point.delta).toFixed(1)}°</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">Estado</p>
              <p className={`font-mono text-sm font-semibold ${point.Q >= 0 ? 'text-emerald-300' : 'text-sky-300'}`}>
                {point.Q >= 0 ? 'SOBREEXCITADO' : 'SUBEXCITADO'}
              </p>
            </div>
          </>
        ) : (
          <p className="col-span-full text-xs text-red-300">
            |Eaf| insuficiente para transmitir esta P: se superó el límite de estabilidad (δ &gt; 90°).
          </p>
        )}
      </div>

      {nearLimit && (
        <p className="flex items-center gap-2 border-t border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] text-red-300">
          <TriangleAlert size={13} />
          Estás cerca del límite de estabilidad estática (δ → 90°): con tan poca excitación, un pequeño
          aumento de carga haría perder el sincronismo.
        </p>
      )}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con P fija, recorre |Eaf| de extremo a extremo: la P no cambia, pero |Ia| dibuja una «V» —
        estás viendo por qué al generador se le controla la Q con la corriente de campo;
        (2) ubica el mínimo: es exactamente fp = 1; (3) baja |Eaf| hacia la línea roja y observa δ
        acercarse a 90°.
      </footer>
    </div>
  )
}
