import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Paleta validada: serie amarillo (cobre+dispersión), excitación violeta, ideal azul */
const C = { wire: '#71717a', series: '#c98500', shunt: '#9085e9', ideal: '#3987e5', dim: '#3f3f46', node: '#a1a1aa' }

const STAGES = [
  { n: 0, label: 'Ideal', desc: 'Solo la «palanca» N₁:N₂. Sin pérdidas, sin dispersión, μ → ∞.' },
  { n: 1, label: '+ Cobre (R₁, R₂)', desc: 'Los devanados son alambre real: resistencia en serie a cada lado — las pérdidas I²R que calientan el cobre.' },
  { n: 2, label: '+ Dispersión (X₁, X₂)', desc: 'Parte del flujo de cada bobina se fuga por el aire y no enlaza a la otra: reactancias en serie (el Cap. 1 facturando).' },
  { n: 3, label: '+ Núcleo (Rc ∥ Xm)', desc: 'La rama de excitación en paralelo: Rc modela histéresis+Foucault, Xm la corriente de magnetización. El Cap. 1 completo, empacado en dos elementos.' },
]

const TOP = 72
const BOT = 182
const LX = 44
const RX = 636

/** Resistor IEC horizontal (caja redondeada con fondo opaco). */
function ResistorH({ x, w = 48, color }: { x: number; w?: number; color: string }) {
  return <rect x={x} y={TOP - 11} width={w} height={22} rx={4} fill="#0b0b0d" stroke={color} strokeWidth={2.2} />
}
/** Resistor IEC vertical. */
function ResistorV({ x, y0, y1, color }: { x: number; y0: number; y1: number; color: string }) {
  return <rect x={x - 11} y={y0} width={22} height={y1 - y0} rx={4} fill="#0b0b0d" stroke={color} strokeWidth={2.2} />
}
/** Inductor horizontal de n jorobas. */
function InductorH({ x, n = 4, r = 9, color }: { x: number; n?: number; r?: number; color: string }) {
  let d = `M ${x} ${TOP}`
  for (let i = 0; i < n; i++) d += ` a ${r} ${r} 0 0 1 ${2 * r} 0`
  return <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
}
/** Inductor vertical de n jorobas. */
function InductorV({ x, y, n = 4, r = 8, color }: { x: number; y: number; n?: number; r?: number; color: string }) {
  let d = `M ${x} ${y}`
  for (let i = 0; i < n; i++) d += ` a ${r} ${r} 0 0 1 0 ${2 * r}`
  return <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
}
function Wire({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.wire} strokeWidth={2.2} strokeLinecap="round" />
}
function Node({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.4} fill={C.node} />
}

/**
 * Laboratorio — Construir el circuito equivalente por capas.
 * Se parte del transformador ideal y se le agregan, una a una, las
 * imperfecciones físicas: cobre, dispersión y núcleo. La capa recién
 * añadida se resalta con un brillo pulsante para ver QUÉ cambió.
 */
export default function CircuitBuilderLab() {
  const [stage, setStage] = useState(3)

  // Estado visual de una capa introducida en el nivel `min`.
  const layer = (min: number): { opacity: number; className: string; style?: React.CSSProperties; accent: string } => {
    if (stage < min) return { opacity: 0.1, className: '', accent: C.dim }
    if (stage === min) return { opacity: 1, className: 'cab-hot', style: { color: C.series }, accent: C.series }
    return { opacity: 1, className: '', accent: C.series }
  }
  const l1 = layer(1)
  const l2 = layer(2)
  const l3 = layer(3)
  // La rama de excitación usa acento violeta cuando está caliente
  const l3style: React.CSSProperties | undefined = stage === 3 ? { color: C.shunt } : undefined

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <style>{`
        @keyframes cab-pulse { 0%,100% { filter: drop-shadow(0 0 1px) } 50% { filter: drop-shadow(0 0 5px) } }
        @keyframes cab-march { to { stroke-dashoffset: -20 } }
        .cab-hot { animation: cab-pulse 1.8s ease-in-out infinite; }
        .cab-flow { stroke-dasharray: 3 7; animation: cab-march 1s linear infinite; }
      `}</style>

      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El circuito equivalente, imperfección por imperfección
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800 px-4 py-2.5 text-xs">
        {STAGES.map((s) => (
          <button key={s.n} type="button" onClick={() => setStage(s.n)}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              stage === s.n
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50'
                : stage > s.n
                  ? 'text-zinc-300'
                  : 'text-zinc-600 hover:text-zinc-400'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 680 240" className="w-full select-none">
        <defs>
          <pattern id="cab-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#ffffff" fillOpacity="0.05" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={680} height={240} fill="url(#cab-grid)" />

        {/* ---- Malla / rieles ---- */}
        <Wire x1={LX} y1={TOP} x2={88} y2={TOP} />
        <Wire x1={LX} y1={BOT} x2={RX} y2={BOT} />
        <Wire x1={LX} y1={TOP} x2={LX} y2={BOT} />
        <Wire x1={RX} y1={TOP} x2={RX} y2={BOT} />

        {/* ---- R1 (cobre, lado 1) ---- */}
        <g opacity={l1.opacity} className={l1.className} style={l1.style}>
          <ResistorH x={88} color={stage >= 1 ? C.series : C.dim} />
          <text x={100} y={TOP - 18} fill={C.series} fontSize={12} fontWeight={700} opacity={stage >= 1 ? 1 : 0}>R₁</text>
        </g>
        <Wire x1={136} y1={TOP} x2={164} y2={TOP} />

        {/* ---- X1 (dispersión, lado 1) ---- */}
        <g opacity={l2.opacity} className={l2.className} style={l2.style}>
          <InductorH x={164} color={stage >= 2 ? C.series : C.dim} />
          <text x={188} y={TOP - 14} fill={C.series} fontSize={12} fontWeight={700} opacity={stage >= 2 ? 1 : 0}>X₁</text>
        </g>
        <Wire x1={236} y1={TOP} x2={336} y2={TOP} />

        {/* ---- Rama de excitación (núcleo): Rc ∥ Xm ---- */}
        <g opacity={l3.opacity} className={l3.className} style={l3style}>
          <Wire x1={280} y1={TOP} x2={280} y2={92} />
          <Wire x1={262} y1={92} x2={298} y2={92} />
          <ResistorV x={262} y0={92} y1={150} color={stage >= 3 ? C.shunt : C.dim} />
          <InductorV x={298} y={92} color={stage >= 3 ? C.shunt : C.dim} />
          <Wire x1={262} y1={150} x2={298} y2={150} />
          <Wire x1={280} y1={150} x2={280} y2={BOT} />
          {/* Corriente de excitación fluyendo hacia el retorno */}
          {stage >= 3 && (
            <path d="M 280 72 V 92 M 280 150 V 182" fill="none" stroke={C.shunt} strokeWidth={2.4} className="cab-flow" opacity={0.9} />
          )}
          <text x={228} y={124} fill={C.shunt} fontSize={12} fontWeight={700} opacity={stage >= 3 ? 1 : 0}>Rc</text>
          <text x={306} y={124} fill={C.shunt} fontSize={12} fontWeight={700} opacity={stage >= 3 ? 1 : 0}>Xm</text>
          <text x={224} y={200} fill={C.shunt} fontSize={10} opacity={stage >= 3 ? 1 : 0}>corriente de excitación</text>
        </g>
        {stage >= 3 && (
          <>
            <Node x={280} y={TOP} />
            <Node x={280} y={BOT} />
          </>
        )}

        {/* ---- Transformador ideal ---- */}
        <g>
          {Array.from({ length: 4 }, (_, k) => (
            <path key={`l${k}`} d={`M 346 ${54 + k * 15} a 7 7 0 0 1 0 15`} fill="none" stroke={C.ideal} strokeWidth={2.6} />
          ))}
          {Array.from({ length: 4 }, (_, k) => (
            <path key={`r${k}`} d={`M 374 ${54 + k * 15} a 7 7 0 0 0 0 15`} fill="none" stroke={C.ideal} strokeWidth={2.6} />
          ))}
          <line x1={357} y1={50} x2={357} y2={126} stroke={C.ideal} strokeWidth={1.4} opacity={0.7} />
          <line x1={363} y1={50} x2={363} y2={126} stroke={C.ideal} strokeWidth={1.4} opacity={0.7} />
          <Wire x1={336} y1={TOP} x2={346} y2={TOP} />
          <Wire x1={374} y1={TOP} x2={424} y2={TOP} />
          <text x={330} y={142} fill={C.ideal} fontSize={11} fontWeight={700}>ideal N₁:N₂</text>
        </g>

        {/* ---- X2 (dispersión, lado 2) ---- */}
        <g opacity={l2.opacity} className={l2.className} style={l2.style}>
          <InductorH x={424} color={stage >= 2 ? C.series : C.dim} />
          <text x={448} y={TOP - 14} fill={C.series} fontSize={12} fontWeight={700} opacity={stage >= 2 ? 1 : 0}>X₂</text>
        </g>
        <Wire x1={496} y1={TOP} x2={524} y2={TOP} />

        {/* ---- R2 (cobre, lado 2) ---- */}
        <g opacity={l1.opacity} className={l1.className} style={l1.style}>
          <ResistorH x={524} color={stage >= 1 ? C.series : C.dim} />
          <text x={536} y={TOP - 18} fill={C.series} fontSize={12} fontWeight={700} opacity={stage >= 1 ? 1 : 0}>R₂</text>
        </g>
        <Wire x1={572} y1={TOP} x2={RX} y2={TOP} />

        {/* ---- Terminales ---- */}
        <circle cx={LX} cy={TOP} r={3.4} fill={C.node} />
        <circle cx={LX} cy={BOT} r={3.4} fill={C.node} />
        <circle cx={RX} cy={TOP} r={3.4} fill={C.node} />
        <circle cx={RX} cy={BOT} r={3.4} fill={C.node} />
        <text x={16} y={TOP + 6} fill="#d4d4d8" fontSize={13} fontWeight={700}>V₁</text>
        <text x={648} y={TOP + 6} fill="#d4d4d8" fontSize={13} fontWeight={700}>V₂</text>
      </svg>

      <div className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
        <p className="text-xs leading-relaxed text-zinc-300">
          <span className="font-bold text-amber-300">{STAGES[stage].label}: </span>
          <span className="text-zinc-400">{STAGES[stage].desc}</span>
        </p>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Para llevar: </span>
        cada elemento del circuito ES una imperfección física con nombre y apellido — nada es
        decorativo. Y al «referir» el secundario al primario (multiplicando sus impedancias por a²,
        el truco de la reflexión), R₁+a²R₂ y X₁+a²X₂ se funden en una sola Req y Xeq en serie: el
        circuito que usarán los ensayos y la regulación.
      </footer>
    </div>
  )
}
