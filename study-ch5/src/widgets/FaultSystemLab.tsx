import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { EJ10_1, type FaultNode, faultSolution, fmt } from '../lib/machine'

/** Paleta validada: hierro/estructura zinc, generador ámbar, red emerald, falla roja, líneas azul */
const C = {
  wire: '#71717a',
  bus: '#a1a1aa',
  gen: '#c98500',
  grid: '#10b981',
  fault: '#e66767',
  line: '#3987e5',
  dim: '#3f3f46',
  node: '#d4d4d8',
}

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/** Símbolo de transformador (dos círculos acoplados). */
function Xfmr({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={C.wire} strokeWidth={1.8} fill="none">
      <circle cx={x - 7} cy={y} r={9} />
      <circle cx={x + 7} cy={y} r={9} />
    </g>
  )
}

/** Interruptor automático (cuadro sobre la línea). */
function Breaker({ x, y, open }: { x: number; y: number; open?: boolean }) {
  return (
    <rect
      x={x - 6}
      y={y - 6}
      width={12}
      height={12}
      rx={2}
      fill={open ? '#09090b' : '#18181b'}
      stroke={open ? C.dim : C.node}
      strokeWidth={1.6}
    />
  )
}

/** Estrella de falla (cortocircuito trifásico). */
function FaultStar({ x, y }: { x: number; y: number }) {
  const spikes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    const r1 = 5
    const r2 = 13
    return `${x + r2 * Math.cos(a)},${y + r2 * Math.sin(a)} ${x + r1 * Math.cos(a + Math.PI / 8)},${y + r1 * Math.sin(a + Math.PI / 8)}`
  }).join(' ')
  return (
    <g className="fsl-fault">
      <polygon points={spikes} fill={C.fault} stroke="#fca5a5" strokeWidth={1} />
      <circle cx={x} cy={y} r={3} fill="#fef2f2" />
    </g>
  )
}

const NODES: { id: FaultNode; label: string }[] = [
  { id: 'emisora', label: 'Barra de alta (emisora)' },
  { id: 'receptora', label: 'Barra de alta (receptora)' },
  { id: 'bornes', label: 'Bornes del generador' },
]

// Coordenadas del diagrama
const BUS_A = 205
const BUS_B = 515
const L1 = 88
const L2 = 152
const MID = 120

const FAULT_XY: Record<FaultNode, { x: number; y: number }> = {
  emisora: { x: 250, y: L2 },
  receptora: { x: 470, y: L2 },
  bornes: { x: 86, y: MID },
}

/**
 * Laboratorio — Falla trifásica en un SISTEMA (Ejemplo 10-1 FKU).
 * Diagrama unifilar interactivo: central hidráulica → transformador → doble
 * línea → transformador → barra infinita. Elige dónde cae el cortocircuito y
 * cuántos circuitos están en servicio, y observa cómo cambian los aportes del
 * generador y de la red, la corriente asimétrica y el deber del interruptor.
 */
export default function FaultSystemLab() {
  const [node, setNode] = useState<FaultNode>('emisora')
  const [nLines, setNLines] = useState(2)

  const net = { ...EJ10_1, nLines }
  const r = faultSolution(net, node)
  const f = FAULT_XY[node]
  const line2Out = nLines === 1

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <style>{`
        @keyframes fsl-pulse { 0%,100% { opacity: 1; filter: drop-shadow(0 0 1px #e66767) } 50% { opacity: 0.72; filter: drop-shadow(0 0 6px #e66767) } }
        .fsl-fault { animation: fsl-pulse 1.4s ease-in-out infinite; }
        @keyframes fsl-flow { to { stroke-dashoffset: -18 } }
        .fsl-flow { stroke-dasharray: 3 7; animation: fsl-flow 0.9s linear infinite; }
      `}</style>

      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Falla trifásica en el sistema — diagrama unifilar (Ej. 10-1)
        </h4>
      </header>

      {/* Controles */}
      <div className="flex flex-col gap-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold text-red-300">Falla en:</span>
          {NODES.map((nd) => (
            <button key={nd.id} type="button" onClick={() => setNode(nd.id)}
              className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                node === nd.id ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {nd.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-semibold text-sky-300">Circuitos:</span>
          {[2, 1].map((k) => (
            <button key={k} type="button" onClick={() => setNLines(k)}
              className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                nLines === k ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {k === 2 ? '2 líneas' : '1 línea'}
            </button>
          ))}
        </div>
      </div>

      {/* Diagrama unifilar */}
      <div className="overflow-x-auto">
        <svg viewBox="0 0 720 250" className="w-full min-w-[560px] select-none">
          {/* Generador */}
          <circle cx={52} cy={MID} r={20} fill="none" stroke={C.gen} strokeWidth={2.2} />
          <text x={52} y={MID + 5} textAnchor="middle" fill={C.gen} fontSize={15} fontWeight={700}>G</text>
          <line x1={72} y1={MID} x2={95} y2={MID} stroke={C.wire} strokeWidth={2} />
          {/* Reactancias del generador */}
          <text x={16} y={175} fill={C.gen} fontSize={9}>x_d = {fmt(EJ10_1.xd, 2)}</text>
          <text x={16} y={188} fill={C.gen} fontSize={9}>x′_d = {fmt(EJ10_1.xd1, 2)}</text>
          <text x={16} y={201} fill={C.gen} fontSize={9}>x″_d = {fmt(EJ10_1.xd2, 2)}</text>

          {/* Transformador del generador */}
          <Xfmr x={110} y={MID} />
          <line x1={125} y1={MID} x2={BUS_A} y2={MID} stroke={C.wire} strokeWidth={2} />
          <text x={92} y={152} fill={C.node} fontSize={9}>x_T = {fmt(EJ10_1.xTg, 2)}</text>

          {/* Barra emisora */}
          <line x1={BUS_A} y1={55} x2={BUS_A} y2={195} stroke={C.bus} strokeWidth={4} />

          {/* Interruptores automáticos (rótulo) */}
          <text x={330} y={30} textAnchor="middle" fill={C.node} fontSize={10}>Interruptores automáticos</text>
          <line x1={300} y1={34} x2={243} y2={L1 - 8} stroke={C.dim} strokeWidth={1} />

          {/* Línea 1 (superior) */}
          <line x1={BUS_A} y1={L1} x2={BUS_B} y2={L1} stroke={line2Out ? C.line : C.line} strokeWidth={2.2} />
          <Breaker x={243} y={L1} />
          <Breaker x={477} y={L1} />
          <text x={360} y={L1 - 12} textAnchor="middle" fill={C.line} fontSize={11} fontWeight={700}>x_l = {fmt(EJ10_1.xL, 2)}</text>

          {/* Línea 2 (inferior) — puede estar fuera de servicio */}
          <line x1={BUS_A} y1={L2} x2={BUS_B} y2={L2}
            stroke={line2Out ? C.dim : C.line} strokeWidth={2.2}
            strokeDasharray={line2Out ? '5 5' : undefined} />
          <Breaker x={243} y={L2} open={line2Out} />
          <Breaker x={477} y={L2} open={line2Out} />
          <text x={360} y={L2 + 20} textAnchor="middle" fill={line2Out ? C.dim : C.line} fontSize={11} fontWeight={700}>
            x_l = {fmt(EJ10_1.xL, 2)}{line2Out ? '  (fuera de servicio)' : ''}
          </text>

          {/* Barra receptora */}
          <line x1={BUS_B} y1={55} x2={BUS_B} y2={195} stroke={C.bus} strokeWidth={4} />

          {/* Transformador receptor */}
          <line x1={BUS_B} y1={MID} x2={548} y2={MID} stroke={C.wire} strokeWidth={2} />
          <Xfmr x={563} y={MID} />
          <line x1={578} y1={MID} x2={615} y2={MID} stroke={C.wire} strokeWidth={2} />
          <text x={540} y={152} fill={C.node} fontSize={9}>x_T = {fmt(EJ10_1.xTr, 2)}</text>

          {/* Barra infinita */}
          <line x1={615} y1={92} x2={615} y2={148} stroke={C.grid} strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={615} y1={100 + i * 18} x2={632} y2={92 + i * 18} stroke={C.grid} strokeWidth={2} />
          ))}
          <text x={640} y={108} fill={C.grid} fontSize={10} fontWeight={700}>Red de</text>
          <text x={640} y={122} fill={C.grid} fontSize={10} fontWeight={700}>potencia</text>
          <text x={640} y={136} fill={C.grid} fontSize={10} fontWeight={700}>infinita</text>
          <text x={598} y={170} fill={C.grid} fontSize={11} fontWeight={700}>E_b = {fmt(EJ10_1.Eb, 2)}</text>

          {/* Aportes que entran a la falla (flechas) */}
          {/* Generador → falla (desde la izquierda) */}
          <g stroke={C.gen} fill={C.gen}>
            <line x1={f.x - 46} y1={f.y} x2={f.x - 16} y2={f.y} strokeWidth={2.6} className="fsl-flow" />
            <path d={`M ${f.x - 16} ${f.y} l -9 -5 l 0 10 Z`} />
          </g>
          {/* Red infinita → falla (desde la derecha) */}
          <g stroke={C.grid} fill={C.grid}>
            <line x1={f.x + 46} y1={f.y} x2={f.x + 16} y2={f.y} strokeWidth={2.6} className="fsl-flow" />
            <path d={`M ${f.x + 16} ${f.y} l 9 -5 l 0 10 Z`} />
          </g>

          {/* Estrella de falla */}
          <FaultStar x={f.x} y={f.y} />
          <text x={f.x} y={f.y + 30} textAnchor="middle" fill={C.fault} fontSize={10} fontWeight={700}>
            cortocircuito trifásico
          </text>
        </svg>
      </div>

      {/* Reducción de reactancias */}
      <div className="border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-400">
        <span className="font-semibold text-zinc-300">Reducción: </span>
        gen → falla ={' '}
        <span className="font-mono text-amber-300">x″ = {fmt(r.xGenSub, 2)}</span>,{' '}
        <span className="font-mono text-amber-300">x′ = {fmt(r.xGenTr, 2)}</span> pu ·{' '}
        red → falla = <span className="font-mono text-emerald-300">{fmt(r.xInf, 2)} pu</span>{' '}
        <span className="text-zinc-600">(líneas en paralelo: {fmt(r.xLineEq, 2)} pu)</span>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
        <Readout label="Aporte generador I″gen" value={`${fmt(r.IgenSub, 2)} pu`} accent="text-amber-300" />
        <Readout label="Aporte red infinita I∞" value={`${fmt(r.Iinf, 2)} pu`} accent="text-emerald-300" />
        <Readout label="Falla simétrica I″" value={`${fmt(r.IfSub, 2)} pu`} accent="text-red-300" />
        <Readout label="Falla transitoria I′" value={`${fmt(r.IfTr, 2)} pu`} />
        <Readout label="Falla permanente Iss" value={`${fmt(r.IfSs, 2)} pu`} />
        <Readout label="Asimétrica (offset DC máx)" value={`${fmt(r.IfSubAsym, 1)} pu`} accent="text-red-400" />
        {node === 'emisora' && (
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 sm:col-span-3">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
              Interruptor de cabecera de la línea fallada (a los 0.1 s, sin DC ni subtransitoria)
            </p>
            <p className="font-mono text-sm font-semibold text-zinc-100">
              I<sub>interruptor</sub> = I′gen + {nLines === 2 ? '½·' : ''}I∞(sanas) ={' '}
              <span className="text-red-300">{fmt(r.Ibreaker, 2)} pu</span>
              <span className="ml-2 text-[11px] text-zinc-500">
                (la parte que entra por la propia línea fallada llega del otro extremo)
              </span>
            </p>
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) mueve la falla de la barra EMISORA a la RECEPTORA: el aporte de la red infinita se dispara
        (queda solo el transformador receptor entre la falla y la barra infinita) — la falla es más
        severa cuanto más cerca de la red rígida; (2) pon <span className="text-sky-300">1 línea</span>{' '}
        en servicio: con una sola línea la red infinita llega con MÁS reactancia y su aporte cae —
        menos circuitos, menos corriente de falla (pero también menos margen de estabilidad); (3)
        compara <span className="text-red-300">I″</span> (interruptores, esfuerzos) con{' '}
        <span className="text-red-400">la asimétrica</span> (×√3 con offset DC máximo) y con el deber
        del interruptor de cabecera a los 0.1 s — tres corrientes, tres decisiones de diseño.
      </footer>
    </div>
  )
}
