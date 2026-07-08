import { useCallback, useRef, useState } from 'react'
import { FlaskConical, Hand } from 'lucide-react'
import { cx as complex, solveFromIa, toDeg, type Complex } from '../lib/machine'

/** Paleta categórica validada (dataviz, modo oscuro): slots 1, 3, 5, 6 */
const COLORS = {
  Vt: '#3987e5',
  Ia: '#c98500',
  jXsIa: '#9085e9',
  Eaf: '#e66767',
} as const

const VT = 1.0
const W = 780
const H = 460
const OX = 170
const OY = 265
const SCALE = 118 // px por pu

const toSvg = (z: Complex) => ({ x: OX + z.re * SCALE, y: OY - z.im * SCALE })

function Arrow({
  from,
  to,
  color,
  width = 2.5,
  dash,
  label,
  labelDx = 8,
  labelDy = -8,
}: {
  from: Complex
  to: Complex
  color: string
  width?: number
  dash?: string
  label?: string
  labelDx?: number
  labelDy?: number
}) {
  const a = toSvg(from)
  const b = toSvg(to)
  const ang = Math.atan2(b.y - a.y, b.x - a.x)
  const hd = 9
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeDasharray={dash} />
      <path
        d={`M ${b.x} ${b.y} L ${b.x - hd * Math.cos(ang - 0.42)} ${b.y - hd * Math.sin(ang - 0.42)} L ${b.x - hd * Math.cos(ang + 0.42)} ${b.y - hd * Math.sin(ang + 0.42)} Z`}
        fill={color}
      />
      {label && (
        <text x={b.x + labelDx} y={b.y + labelDy} fill={color} fontSize={14} fontWeight={700}>
          {label}
        </text>
      )}
    </g>
  )
}

/** Arco de ángulo medido desde el eje +x hasta `angle` (rad), radio en px. */
function AngleArc({ angle, radius, color, label }: { angle: number; radius: number; color: string; label: string }) {
  if (Math.abs(angle) < 0.02) return null
  const steps = 24
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * angle
    return `${OX + radius * Math.cos(a)},${OY - radius * Math.sin(a)}`
  }).join(' ')
  const mid = angle / 2
  return (
    <g>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeDasharray="4 3" />
      <text
        x={OX + (radius + 16) * Math.cos(mid) - 6}
        y={OY - (radius + 16) * Math.sin(mid) + 5}
        fill={color}
        fontSize={13}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  )
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
 * Laboratorio 2 — Diagrama fasorial vivo del generador sincrónico.
 * El estudiante ARRASTRA la punta del fasor de corriente Ia y ve en tiempo
 * real cómo se reconstruyen jXs·Ia y Eaf = Vt + jXs·Ia, con δ, φ, P y Q.
 */
export default function PhasorLab() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [Ia, setIa] = useState<Complex>(complex(0.72, -0.54)) // fp 0.8 en atraso
  const [Xs, setXs] = useState(1.0)
  const [dragging, setDragging] = useState(false)

  const sol = solveFromIa(VT, Ia, Xs)

  const pointToIa = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const py = ((e.clientY - rect.top) / rect.height) * H
    let re = (px - OX) / SCALE
    let im = (OY - py) / SCALE
    // Convención generador: P ≥ 0; magnitud acotada al área visible
    re = Math.max(0.02, re)
    const mag = Math.hypot(re, im)
    if (mag > 1.4) {
      re = (re / mag) * 1.4
      im = (im / mag) * 1.4
    }
    return complex(re, im)
  }, [])

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const next = pointToIa(e)
    if (next) setIa(next)
  }

  const tipIa = toSvg(Ia)
  const vtTip = complex(VT, 0)

  const presets: { label: string; ia: Complex }[] = [
    { label: 'fp = 1', ia: complex(0.9, 0) },
    { label: 'fp 0.8 atraso', ia: complex(0.72, -0.54) },
    { label: 'fp 0.8 adelanto', ia: complex(0.72, 0.54) },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Diagrama fasorial del generador (arrastra la punta de Ia)
        </h4>
        <Hand size={14} className="ml-auto text-amber-400" />
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setIa(p.ia)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-semibold text-zinc-300 transition-colors hover:border-amber-400 hover:text-amber-300"
          >
            {p.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-zinc-400">
          Xs
          <input
            type="range"
            min={0.4}
            max={2}
            step={0.05}
            value={Xs}
            onChange={(e) => setXs(Number(e.target.value))}
            className="w-28"
          />
          <span className="w-14 font-mono text-zinc-200">{Xs.toFixed(2)} pu</span>
        </label>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {/* Rejilla polar recesiva */}
        {[0.5, 1, 1.5, 2].map((r) => (
          <circle key={r} cx={OX} cy={OY} r={r * SCALE} fill="none" stroke="#27272a" strokeDasharray="3 4" />
        ))}
        <line x1={OX - 1.6 * SCALE} y1={OY} x2={OX + 4.6 * SCALE} y2={OY} stroke="#3f3f46" />
        <line x1={OX} y1={OY - 1.7 * SCALE} x2={OX} y2={OY + 1.6 * SCALE} stroke="#3f3f46" />
        <text x={OX + 4.45 * SCALE} y={OY + 16} fill="#71717a" fontSize={11}>Re (eje de Vt)</text>

        {/* Región sobre/subexcitado (semiplanos de Ia) */}
        <text x={OX + 10} y={OY + 1.45 * SCALE} fill="#71717a" fontSize={10}>
          Ia atrasada aquí → entrega Q (sobreexcitado)
        </text>
        <text x={OX + 10} y={OY - 1.5 * SCALE} fill="#71717a" fontSize={10}>
          Ia adelantada aquí → absorbe Q (subexcitado)
        </text>

        {/* Fasores: Vt, Ia, jXs·Ia (desde la punta de Vt) y Eaf */}
        <Arrow from={complex(0, 0)} to={vtTip} color={COLORS.Vt} label="Vt" labelDy={18} />
        <Arrow from={complex(0, 0)} to={Ia} color={COLORS.Ia} label="Ia" />
        <Arrow from={vtTip} to={sol.Eaf} color={COLORS.jXsIa} dash="6 4" />
        {/* Etiqueta de jXs·Ia en el punto medio del segmento, desplazada
            perpendicularmente para no chocar con la etiqueta de Eaf en la punta */}
        {(() => {
          const a = toSvg(vtTip)
          const b = toSvg(sol.Eaf)
          const ang = Math.atan2(b.y - a.y, b.x - a.x)
          const mx = (a.x + b.x) / 2 + 14 * Math.cos(ang - Math.PI / 2)
          const my = (a.y + b.y) / 2 + 14 * Math.sin(ang - Math.PI / 2)
          return (
            <text x={mx} y={my} fill={COLORS.jXsIa} fontSize={14} fontWeight={700} textAnchor="middle">
              jXs·Ia
            </text>
          )
        })()}
        <Arrow from={complex(0, 0)} to={sol.Eaf} color={COLORS.Eaf} width={3.2} label="Eaf" />

        {/* Ángulos δ (de Eaf) y φ (de Ia, con signo) */}
        <AngleArc angle={sol.delta} radius={72} color={COLORS.Eaf} label="δ" />
        <AngleArc angle={-sol.phi} radius={44} color={COLORS.Ia} label="φ" />

        {/* Mango de arrastre en la punta de Ia */}
        <circle
          cx={tipIa.x}
          cy={tipIa.y}
          r={16}
          fill="transparent"
          stroke="transparent"
          className="cursor-grab"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
          }}
        />
        <circle
          cx={tipIa.x}
          cy={tipIa.y}
          r={7}
          fill={COLORS.Ia}
          stroke="#09090b"
          strokeWidth={2}
          pointerEvents="none"
        >
          <animate attributeName="r" values="7;9;7" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="grid grid-cols-2 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 sm:grid-cols-4 lg:grid-cols-8">
        <Readout label="|Ia|" value={`${sol.IaMag.toFixed(3)} pu`} />
        <Readout
          label="φ"
          value={`${toDeg(sol.phi).toFixed(1)}° ${sol.lagging ? 'atraso' : 'adelanto'}`}
        />
        <Readout label="fp" value={sol.pf.toFixed(3)} />
        <Readout label="P entregada" value={`${sol.P.toFixed(3)} pu`} accent="text-emerald-300" />
        <Readout
          label="Q entregada"
          value={`${sol.Q.toFixed(3)} pu`}
          accent={sol.Q >= 0 ? 'text-emerald-300' : 'text-sky-300'}
        />
        <Readout label="|Eaf|" value={`${sol.EafMag.toFixed(3)} pu`} />
        <Readout label="δ" value={`${toDeg(sol.delta).toFixed(1)}°`} />
        <Readout
          label="Excitación"
          value={sol.Q >= 0 ? 'SOBRE' : 'SUB'}
          accent={sol.Q >= 0 ? 'text-emerald-300' : 'text-sky-300'}
        />
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) arrastra Ia hacia abajo (atraso) y verifica que |Eaf| crece: entregar Q exige más excitación;
        (2) arrástrala hacia arriba (adelanto) y observa cómo Eaf se encoge y δ crece — la máquina subexcitada
        trabaja con menos margen; (3) aumenta Xs y nota que, con la misma corriente, la caída jXs·Ia
        se agranda y separa más a Eaf de Vt.
      </footer>
    </div>
  )
}
