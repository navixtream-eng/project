import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Paleta validada: serie amarillo (cobre+dispersión), excitación violeta, ideal azul */
const C = { wire: '#52525b', series: '#c98500', shunt: '#9085e9', ideal: '#3987e5', dim: '#3f3f46' }

const STAGES = [
  { n: 0, label: 'Ideal', desc: 'Solo la «palanca» N₁:N₂. Sin pérdidas, sin dispersión, μ → ∞.' },
  { n: 1, label: '+ Cobre (R₁, R₂)', desc: 'Los devanados son alambre real: resistencia en serie a cada lado — las pérdidas I²R que calientan el cobre.' },
  { n: 2, label: '+ Dispersión (X₁, X₂)', desc: 'Parte del flujo de cada bobina se fuga por el aire y no enlaza a la otra: reactancias en serie (el Cap. 1 facturando).' },
  { n: 3, label: '+ Núcleo (Rc ∥ Xm)', desc: 'La rama de excitación en paralelo: Rc modela histéresis+Foucault, Xm la corriente de magnetización. El Cap. 1 completo, empacado en dos elementos.' },
]

/**
 * Laboratorio — Construir el circuito equivalente por capas.
 * Se parte del transformador ideal y se le agregan, una a una, las
 * imperfecciones físicas: cobre, dispersión y núcleo.
 */
export default function CircuitBuilderLab() {
  const [stage, setStage] = useState(3)

  const on = (min: number) => stage >= min

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
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

      <svg viewBox="0 0 640 220" className="w-full select-none">
        {/* Línea superior */}
        <line x1={30} y1={60} x2={95} y2={60} stroke={C.wire} strokeWidth={2} />
        {/* R1 */}
        <g opacity={on(1) ? 1 : 0.12}>
          <rect x={95} y={50} width={50} height={20} rx={4} fill="none"
            stroke={on(1) ? C.series : C.dim} strokeWidth={2} />
          <text x={108} y={44} fill={C.series} fontSize={12} fontWeight={700} opacity={on(1) ? 1 : 0}>R₁</text>
        </g>
        <line x1={145} y1={60} x2={175} y2={60} stroke={C.wire} strokeWidth={2} />
        {/* X1 */}
        <g opacity={on(2) ? 1 : 0.12}>
          <path d="M 175 60 a 8 8 0 0 1 16 0 a 8 8 0 0 1 16 0 a 8 8 0 0 1 16 0" fill="none"
            stroke={on(2) ? C.series : C.dim} strokeWidth={2} />
          <text x={190} y={44} fill={C.series} fontSize={12} fontWeight={700} opacity={on(2) ? 1 : 0}>X₁</text>
        </g>
        <line x1={223} y1={60} x2={310} y2={60} stroke={C.wire} strokeWidth={2} />

        {/* Rama de excitación */}
        <g opacity={on(3) ? 1 : 0.12}>
          <line x1={265} y1={60} x2={265} y2={85} stroke={C.wire} strokeWidth={2} />
          <line x1={240} y1={85} x2={290} y2={85} stroke={C.wire} strokeWidth={2} />
          <rect x={230} y={85} width={20} height={50} rx={4} fill="none"
            stroke={on(3) ? C.shunt : C.dim} strokeWidth={2} />
          <path d="M 280 85 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14 a 7 7 0 0 1 0 14" fill="none"
            stroke={on(3) ? C.shunt : C.dim} strokeWidth={2} />
          <line x1={240} y1={143} x2={290} y2={143} stroke={C.wire} strokeWidth={2} />
          <line x1={265} y1={143} x2={265} y2={160} stroke={C.wire} strokeWidth={2} />
          <text x={205} y={115} fill={C.shunt} fontSize={12} fontWeight={700} opacity={on(3) ? 1 : 0}>Rc</text>
          <text x={297} y={115} fill={C.shunt} fontSize={12} fontWeight={700} opacity={on(3) ? 1 : 0}>Xm</text>
          <text x={222} y={178} fill={C.shunt} fontSize={10} opacity={on(3) ? 1 : 0}>corriente de excitación</text>
        </g>

        {/* Transformador ideal al centro-derecha */}
        <g>
          {Array.from({ length: 4 }, (_, k) => (
            <path key={`l${k}`} d={`M 340 ${52 + k * 16} a 8 8 0 0 1 0 16`} fill="none" stroke={C.ideal} strokeWidth={2.5} />
          ))}
          {Array.from({ length: 4 }, (_, k) => (
            <path key={`r${k}`} d={`M 372 ${52 + k * 16} a 8 8 0 0 0 0 16`} fill="none" stroke={C.ideal} strokeWidth={2.5} />
          ))}
          <line x1={352} y1={46} x2={352} y2={124} stroke={C.wire} strokeWidth={1.5} />
          <line x1={360} y1={46} x2={360} y2={124} stroke={C.wire} strokeWidth={1.5} />
          <text x={330} y={140} fill={C.ideal} fontSize={11} fontWeight={700}>ideal N₁:N₂</text>
          <line x1={310} y1={60} x2={340} y2={60} stroke={C.wire} strokeWidth={2} />
          <line x1={372} y1={60} x2={402} y2={60} stroke={C.wire} strokeWidth={2} />
        </g>

        {/* Lado 2: X2 y R2 */}
        <g opacity={on(2) ? 1 : 0.12}>
          <path d="M 402 60 a 8 8 0 0 1 16 0 a 8 8 0 0 1 16 0 a 8 8 0 0 1 16 0" fill="none"
            stroke={on(2) ? C.series : C.dim} strokeWidth={2} />
          <text x={417} y={44} fill={C.series} fontSize={12} fontWeight={700} opacity={on(2) ? 1 : 0}>X₂</text>
        </g>
        <line x1={450} y1={60} x2={480} y2={60} stroke={C.wire} strokeWidth={2} />
        <g opacity={on(1) ? 1 : 0.12}>
          <rect x={480} y={50} width={50} height={20} rx={4} fill="none"
            stroke={on(1) ? C.series : C.dim} strokeWidth={2} />
          <text x={493} y={44} fill={C.series} fontSize={12} fontWeight={700} opacity={on(1) ? 1 : 0}>R₂</text>
        </g>
        <line x1={530} y1={60} x2={610} y2={60} stroke={C.wire} strokeWidth={2} />

        {/* Retornos */}
        <line x1={30} y1={160} x2={610} y2={160} stroke={C.wire} strokeWidth={2} />
        <line x1={30} y1={60} x2={30} y2={160} stroke={C.wire} strokeWidth={2} />
        <line x1={610} y1={60} x2={610} y2={160} stroke={C.wire} strokeWidth={2} />
        <text x={14} y={115} fill="#a1a1aa" fontSize={12} fontWeight={700}>V₁</text>
        <text x={618} y={115} fill="#a1a1aa" fontSize={12} fontWeight={700}>V₂</text>
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
