import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import {
  DOS_NODOS_NOM,
  type Refrigeracion,
  dosNodosSS,
  dosNodosSim,
  perdidasDetalladas,
  rcaDe,
} from '../lib/termica'

const REFRIS: { id: Refrigeracion; label: string }[] = [
  { id: 'autoventilado', label: 'Autoventilado (IC411)' },
  { id: 'forzado', label: 'Ventilación forzada (IC416)' },
  { id: 'tenv', label: 'Cerrado sin ventilador (TENV)' },
]

/**
 * Laboratorio — El modelo fino: pérdidas separadas y DOS nodos térmicos.
 * El devanado (τ corta) vierte a la carcasa (τ larga): la sobrecarga golpea
 * al cobre en minutos aunque la carcasa tarde una hora. Carga, velocidad
 * (variador V/f) y tipo de refrigeración mueven cada componente de pérdida
 * y la evacuación — el caso crítico del variador a baja velocidad emerge solo.
 */
export default function TwoNodeLab() {
  const [carga, setCarga] = useState(100) // % de par
  const [vel, setVel] = useState(100) // % de velocidad (V/f)
  const [refri, setRefri] = useState<Refrigeracion>('autoventilado')

  const c = carga / 100
  const nPu = vel / 100
  const perd = perdidasDetalladas(c, nPu)
  const rca = rcaDe(refri, nPu)
  const params = useMemo(() => ({ ...DOS_NODOS_NOM, rca }), [rca])
  const ss = dosNodosSS(params, perd.total)

  const datos = useMemo(() => dosNodosSim(params, perd.total, 300, 0.5), [params, perd.total])

  const W = 640
  const H = 200
  const yMax = Math.max(1.3, ss.w * 1.15)
  const xOf = (t: number) => 40 + (t / 300) * (W - 52)
  const yOf = (v: number) => H - 28 - (v / yMax) * (H - 44)

  const barras = [
    { lbl: 'Cobre ∝ c²', v: perd.cu, color: '#f59e0b' },
    { lbl: 'Hierro ∝ f^1.3', v: perd.fe, color: '#38bdf8' },
    { lbl: 'Mecánicas ∝ n^2.5', v: perd.mec, color: '#10b981' },
    { lbl: 'Adicionales ∝ c²', v: perd.add, color: '#a78bfa' },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Dos nodos: devanado rápido, carcasa lenta
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">Par (carga)</span>
          <input type="range" min={20} max={140} step={5} value={carga} onChange={(e) => setCarga(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{carga} %</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">Velocidad (V/f)</span>
          <input type="range" min={20} max={120} step={5} value={vel} onChange={(e) => setVel(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{vel} %</span>
        </label>
        {REFRIS.map((r) => (
          <button key={r.id} type="button" onClick={() => setRefri(r.id)}
            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${refri === r.id ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row">
        {/* Desglose de pérdidas */}
        <div className="shrink-0 p-3 lg:w-56">
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            Pérdidas separadas [pu de las nominales]
          </p>
          <div className="space-y-1.5">
            {barras.map((b) => (
              <div key={b.lbl} className="flex items-center gap-1.5">
                <span className="w-24 shrink-0 text-[9.5px] text-zinc-400">{b.lbl}</span>
                <div className="h-3.5 rounded-sm" style={{ width: `${Math.min(100, b.v * 130)}px`, backgroundColor: b.color, opacity: 0.75, minWidth: b.v > 0.001 ? 2 : 0 }} />
                <span className="font-mono text-[9.5px] text-zinc-300">{(b.v * 100).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 border-t border-zinc-800 pt-1">
              <span className="w-24 shrink-0 text-[9.5px] font-bold text-zinc-200">TOTAL</span>
              <span className="font-mono text-xs font-bold text-zinc-100">{(perd.total * 100).toFixed(0)} %</span>
            </div>
            <p className="pt-1 text-[9px] leading-snug text-zinc-600">
              Exponentes típicos declarados (reparto nominal 50/25/15/10). R_ca según refrigeración:
              {' '}{rcaDe(refri, nPu).toFixed(2)} (nom. 0.65).
            </p>
          </div>
        </div>

        {/* Curvas de los dos nodos */}
        <div className="min-w-0 flex-1 px-2 py-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <line x1={40} y1={yOf(1)} x2={W - 12} y2={yOf(1)} stroke="#f87171" strokeDasharray="5 4" strokeWidth={1.2} />
            <text x={W - 14} y={yOf(1) - 4} fill="#f87171" fontSize={8.5} textAnchor="end">límite del devanado</text>
            <polyline points={datos.map((d) => `${xOf(d.t)},${yOf(d.w)}`).join(' ')} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <polyline points={datos.map((d) => `${xOf(d.t)},${yOf(d.c)}`).join(' ')} fill="none" stroke="#38bdf8" strokeWidth={2} />
            <text x={46} y={yOf(ss.w) - 6} fill="#f59e0b" fontSize={9}>devanado (τ={DOS_NODOS_NOM.tauW} min)</text>
            <text x={46} y={yOf(ss.c) + 14} fill="#38bdf8" fontSize={9}>carcasa (τ={DOS_NODOS_NOM.tauC} min)</text>
            <text x={W / 2} y={H - 4} fill="#71717a" fontSize={8.5} textAnchor="middle">tiempo [min]</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">θ devanado (régimen)</p>
          <p className={`font-mono text-sm font-semibold ${ss.w > 1.02 ? 'text-red-300' : 'text-emerald-300'}`}>
            {(ss.w * 100).toFixed(0)} % {ss.w > 1.02 ? '⚠' : '✓'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">θ carcasa (régimen)</p>
          <p className="font-mono text-sm font-semibold text-sky-300">{(ss.c * 100).toFixed(0)} %</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Salto devanado−carcasa</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{((ss.w - ss.c) * 100).toFixed(0)} %</p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) par 100 % y baja la velocidad al 30 % (variador V/f, autoventilado): las pérdidas caen
        al ~66 %… ¡y el devanado SUPERA el límite! — el ventilador del eje casi no gira (R_ca
        crece) y el caso «par constante a baja velocidad» es EL clásico de sobrecalentamiento con
        variadores; (2) mismo punto con ventilación FORZADA: problema resuelto — por eso los
        motores «inverter duty» para par constante llevan soplador independiente; (3) escalón al
        130 %: mira las dos curvas — el devanado (τ = 8 min) se dispara en minutos mientras la
        carcasa apenas se entera: tocar la carcasa y concluir «está frío» es el error de campo más
        común; los relés térmicos modernos usan DOS constantes por esto; (4) el desglose de la
        izquierda: a velocidad nominal el hierro y las mecánicas no se mueven con la carga —
        exactamente la corrección de la sección 1, ahora componente a componente.
      </footer>
    </div>
  )
}
