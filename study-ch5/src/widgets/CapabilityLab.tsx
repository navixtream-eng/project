import { useCallback, useRef, useState } from 'react'
import { FlaskConical, Hand } from 'lucide-react'
import { checkCapability, solveFromPQ, toDeg } from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): coherente con los
 *  fasores de la Sección 2 — armadura ≙ Ia, campo ≙ Eaf. */
const COLORS = {
  turbina: '#3987e5',
  armadura: '#c98500',
  estabilidad: '#9085e9',
  campo: '#e66767',
} as const

const VT = 1.0
const SMAX = 1.0

const W = 780
const H = 480
const OX = 420 // origen (Q = 0) en px
const OY = 420 // origen (P = 0) en px
const SCALE = 210 // px por pu

const px = (Q: number) => OX + Q * SCALE
const py = (P: number) => OY - P * SCALE

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio 5 — La carta de operación (curvas de capacidad).
 * El plano P-Q con los cuatro cercos que encierran al generador: estator
 * (|S| ≤ Smax), rotor (|Eaf| ≤ Eaf,max), estabilidad (δ = 90°) y turbina
 * (P ≤ Pm,max). El punto de operación se arrastra; la región factible es
 * la intersección geométrica real de los cuatro recortes.
 */
export default function CapabilityLab() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [P, setP] = useState(0.7)
  const [Q, setQ] = useState(0.3)
  const [EafMax, setEafMax] = useState(1.8)
  const [PmMax, setPmMax] = useState(0.95)
  const [Xs, setXs] = useState(1.0)
  const [dragging, setDragging] = useState(false)

  const rField = (EafMax * VT) / Xs
  const qStab = -(VT * VT) / Xs
  const cap = checkCapability(P, Q, VT, Xs, SMAX, EafMax, PmMax)
  const sol = solveFromPQ(VT, Math.max(P, 1e-6), Q, Xs)

  const pointFromEvent = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const y = ((e.clientY - rect.top) / rect.height) * H
    return {
      Q: Math.max(-1.9, Math.min(1.6, (x - OX) / SCALE)),
      P: Math.max(0, Math.min(1.7, (OY - y) / SCALE)),
    }
  }, [])

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const pt = pointFromEvent(e)
    if (pt) {
      setP(pt.P)
      setQ(pt.Q)
    }
  }

  const limitChip = (key: keyof typeof COLORS, label: string) => {
    const violated = cap.violations.includes(key)
    return (
      <span
        key={key}
        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${
          violated ? 'border-red-500/60 bg-red-500/10 text-red-200' : 'border-zinc-700 bg-zinc-900 text-zinc-400'
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS[key] }} />
        {label}
        {violated && ' ⚠'}
      </span>
    )
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Carta de operación (arrastra el punto P-Q)
        </h4>
        <Hand size={14} className="ml-auto text-amber-400" />
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span style={{ color: COLORS.campo }} className="font-semibold">Eaf,max (rotor)</span>
          <input type="range" min={1} max={2.5} step={0.05} value={EafMax}
            onChange={(e) => setEafMax(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{EafMax.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span style={{ color: COLORS.turbina }} className="font-semibold">Pm,max (turbina)</span>
          <input type="range" min={0.4} max={1.2} step={0.05} value={PmMax}
            onChange={(e) => setPmMax(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{PmMax.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Xs
          <input type="range" min={0.6} max={1.4} step={0.05} value={Xs}
            onChange={(e) => setXs(Number(e.target.value))} className="w-24" />
          <span className="w-12 font-mono text-zinc-200">{Xs.toFixed(2)}</span>
        </label>
        <span className="text-[10px] text-zinc-500">Smax = 1.0 pu · Vt = 1.0 pu (fijos)</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        <defs>
          {/* Región factible = intersección de los cuatro recortes */}
          <clipPath id="clip-arm">
            <circle cx={px(0)} cy={py(0)} r={SMAX * SCALE} />
          </clipPath>
          <clipPath id="clip-field">
            <circle cx={px(qStab)} cy={py(0)} r={rField * SCALE} />
          </clipPath>
          <clipPath id="clip-turb">
            <rect x={0} y={py(PmMax)} width={W} height={H - py(PmMax)} />
          </clipPath>
          <clipPath id="clip-stab">
            <rect x={px(qStab)} y={0} width={W - px(qStab)} height={OY} />
          </clipPath>
        </defs>

        {/* Ejes y rejilla */}
        {[-1.5, -1, -0.5, 0.5, 1, 1.5].map((q) => (
          <line key={`q${q}`} x1={px(q)} y1={py(0)} x2={px(q)} y2={py(1.6)} stroke="#1f1f23" />
        ))}
        {[0.5, 1, 1.5].map((p) => (
          <line key={`p${p}`} x1={px(-1.9)} y1={py(p)} x2={px(1.6)} y2={py(p)} stroke="#1f1f23" />
        ))}
        <line x1={px(-1.9)} y1={py(0)} x2={px(1.6)} y2={py(0)} stroke="#3f3f46" strokeWidth={1.5} />
        <line x1={px(0)} y1={py(0)} x2={px(0)} y2={py(1.7)} stroke="#3f3f46" strokeWidth={1.5} />
        <text x={px(1.42)} y={py(0) + 18} fill="#71717a" fontSize={11}>Q [pu] →</text>
        <text x={px(0) + 8} y={py(1.62)} fill="#71717a" fontSize={11}>P [pu] ↑</text>
        <text x={px(0.7)} y={py(0) + 34} fill="#71717a" fontSize={10}>sobreexcitado · entrega Q</text>
        <text x={px(-1.55)} y={py(0) + 34} fill="#71717a" fontSize={10}>subexcitado · absorbe Q</text>

        {/* Región factible sombreada (clips anidados) */}
        <g clipPath="url(#clip-arm)">
          <g clipPath="url(#clip-field)">
            <g clipPath="url(#clip-turb)">
              <g clipPath="url(#clip-stab)">
                <rect x={0} y={0} width={W} height={OY} fill="#10b981" fillOpacity={0.09} />
              </g>
            </g>
          </g>
        </g>

        {/* Cerco 1: calentamiento de armadura |S| = Smax */}
        <path
          d={`M ${px(-SMAX)} ${py(0)} A ${SMAX * SCALE} ${SMAX * SCALE} 0 0 1 ${px(SMAX)} ${py(0)}`}
          fill="none" stroke={COLORS.armadura} strokeWidth={2}
        />
        <text x={px(0.62)} y={py(0.86)} fill={COLORS.armadura} fontSize={12} fontWeight={700}>
          armadura |S|=1
        </text>

        {/* Cerco 2: calentamiento de campo |Eaf| = Eaf,max (arco visible) */}
        <path
          d={`M ${px(qStab - rField)} ${py(0)} A ${rField * SCALE} ${rField * SCALE} 0 0 1 ${px(qStab + rField)} ${py(0)}`}
          fill="none" stroke={COLORS.campo} strokeWidth={2} strokeDasharray="7 4"
        />
        <text x={px(qStab + rField * 0.42) - 30} y={py(rField * 0.94)} fill={COLORS.campo} fontSize={12} fontWeight={700}>
          campo |Eaf|={EafMax.toFixed(2)}
        </text>

        {/* Cerco 3: límite teórico de estabilidad δ = 90° */}
        <line
          x1={px(qStab)} y1={py(0)} x2={px(qStab)} y2={py(1.55)}
          stroke={COLORS.estabilidad} strokeWidth={2} strokeDasharray="3 4"
        />
        <text x={px(qStab) - 8} y={py(1.28)} fill={COLORS.estabilidad} fontSize={12} fontWeight={700} textAnchor="end">
          estabilidad δ=90°
        </text>

        {/* Cerco 4: potencia máxima de la turbina */}
        <line
          x1={px(-1.85)} y1={py(PmMax)} x2={px(1.55)} y2={py(PmMax)}
          stroke={COLORS.turbina} strokeWidth={2} strokeDasharray="10 5"
        />
        <text x={px(-1.82)} y={py(PmMax) - 7} fill={COLORS.turbina} fontSize={12} fontWeight={700}>
          turbina Pm,max
        </text>

        {/* Punto de operación arrastrable */}
        <line x1={px(0)} y1={py(0)} x2={px(Q)} y2={py(P)} stroke="#71717a" strokeDasharray="2 3" />
        <circle
          cx={px(Q)} cy={py(P)} r={18} fill="transparent" className="cursor-grab"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
          }}
        />
        <circle
          cx={px(Q)} cy={py(P)} r={8}
          fill={cap.feasible ? '#10b981' : '#e66767'}
          stroke="#fafafa" strokeWidth={2} pointerEvents="none"
        >
          <animate attributeName="r" values="8;10;8" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <text x={px(Q) + 14} y={py(P) - 10} fill={cap.feasible ? '#34d399' : '#f87171'} fontSize={12} fontWeight={700}>
          ({P.toFixed(2)}, {Q.toFixed(2)})
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 bg-zinc-900/40 px-3 py-2">
        <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
          cap.feasible
            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
            : 'bg-red-500/15 text-red-300 ring-1 ring-red-500/50'
        }`}>
          {cap.feasible ? '✓ PUNTO OPERABLE' : '✗ FUERA DE LA CARTA'}
        </span>
        {limitChip('turbina', 'turbina')}
        {limitChip('armadura', 'armadura')}
        {limitChip('estabilidad', 'estabilidad')}
        {limitChip('campo', 'campo')}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-5">
        <Readout label="|S|" value={`${Math.hypot(P, Q).toFixed(3)} pu`}
          accent={Math.hypot(P, Q) > SMAX ? 'text-red-400' : undefined} />
        <Readout label="fp" value={`${(Math.hypot(P, Q) > 1e-6 ? P / Math.hypot(P, Q) : 1).toFixed(3)} ${Q >= 0 ? 'atraso' : 'adelanto'}`} />
        <Readout label="|Ia|" value={`${sol.IaMag.toFixed(3)} pu`} />
        <Readout label="|Eaf| requerida" value={`${sol.EafMag.toFixed(3)} pu`}
          accent={sol.EafMag > EafMax ? 'text-red-400' : undefined} />
        <Readout label="δ" value={`${toDeg(sol.delta).toFixed(1)}°`}
          accent={Math.abs(toDeg(sol.delta)) > 70 ? 'text-amber-300' : undefined} />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) recorre el borde de la región verde y observa qué chip se enciende en cada tramo: a fp alto
        manda la <span style={{ color: COLORS.armadura }}>armadura</span>, muy sobreexcitado manda el{' '}
        <span style={{ color: COLORS.campo }}>campo</span>, subexcitado manda la{' '}
        <span style={{ color: COLORS.estabilidad }}>estabilidad</span>; (2) baja{' '}
        <span style={{ color: COLORS.campo }}>Eaf,max</span> (un rotor que refrigera mal) y mira cómo se
        recorta la esquina sobreexcitada; (3) nota que |Eaf| requerida crece al moverte a la derecha —
        entregar Q cuesta excitación, exactamente lo que viste en la curva V.
      </footer>
    </div>
  )
}
