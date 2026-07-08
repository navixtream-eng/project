import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { cx as complex, solveFromIa, type Complex } from '../lib/machine'

/** Colores de fasor coherentes con la Sección 2 (paleta validada) */
const COLORS = { Vt: '#3987e5', Ia: '#c98500', jXsIa: '#9085e9', Eaf: '#e66767' } as const

const VT = 1.0
const XS = 1.0
const W = 720
const H = 300
const OX = 300
const OY = 150
const SCALE = 105

const pt = (z: Complex) => ({ x: OX + z.re * SCALE, y: OY - z.im * SCALE })

function Arrow({ from, to, color, width = 2.5, dash, label, dx = 8, dy = -8 }: {
  from: Complex; to: Complex; color: string; width?: number; dash?: string
  label: string; dx?: number; dy?: number
}) {
  const a = pt(from)
  const b = pt(to)
  const ang = Math.atan2(b.y - a.y, b.x - a.x)
  const hd = 8
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeDasharray={dash} />
      <path
        d={`M ${b.x} ${b.y} L ${b.x - hd * Math.cos(ang - 0.42)} ${b.y - hd * Math.sin(ang - 0.42)} L ${b.x - hd * Math.cos(ang + 0.42)} ${b.y - hd * Math.sin(ang + 0.42)} Z`}
        fill={color}
      />
      <text x={b.x + dx} y={b.y + dy} fill={color} fontSize={13} fontWeight={700}>{label}</text>
    </g>
  )
}

/**
 * Laboratorio 6 — El condensador sincrónico: un motor en vacío (P ≈ 0)
 * cuya única mercancía es Q. Con δ = 0, Eaf y Vt quedan colineales y la
 * corriente resulta perpendicular: pura potencia reactiva, controlada
 * enteramente por la excitación.
 */
export default function CondenserLab() {
  const [Eaf, setEaf] = useState(1.5)

  // P = 0 ⇒ δ = 0 ⇒ Ia = (Eaf − Vt)/(jXs): puramente imaginaria
  const Ia = complex(0, -(Eaf - VT) / XS)
  const sol = solveFromIa(VT, Ia, XS)
  // Convención de MOTOR para el dibujo (corriente entrando a la máquina):
  // sobreexcitado ⇒ IaM en adelanto (+90°), la firma clásica del condensador.
  const IaM = complex(-sol.Ia.re, -sol.Ia.im)
  const isCap = sol.Q > 0.005
  const isInd = sol.Q < -0.005

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Condensador sincrónico (motor en vacío, P = 0)
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Excitación · |Eaf|</span>
          <input
            type="range" min={0.4} max={2.2} step={0.01} value={Eaf}
            onChange={(e) => setEaf(Number(e.target.value))} className="w-48"
          />
          <span className="w-14 font-mono text-zinc-200">{Eaf.toFixed(2)} pu</span>
        </label>
        <span
          className={`ml-auto rounded-md px-2.5 py-1 font-bold ${
            isCap
              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
              : isInd
                ? 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/40'
                : 'bg-zinc-800 text-zinc-400 ring-1 ring-zinc-600'
          }`}
        >
          {isCap ? 'CONDENSADOR · entrega Q' : isInd ? 'REACTOR · absorbe Q' : 'FLOTANDO · Q = 0'}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none">
        {/* Rejilla mínima */}
        <line x1={40} y1={OY} x2={W - 30} y2={OY} stroke="#3f3f46" />
        <line x1={OX} y1={26} x2={OX} y2={H - 26} stroke="#27272a" strokeDasharray="3 4" />

        <Arrow from={complex(0, 0)} to={complex(VT, 0)} color={COLORS.Vt} label="Vt" dy={20} />
        {/* KVL de motor: Vt = Eaf + jXs·Ia ⇒ el segmento va de Eaf hacia Vt */}
        {Math.abs(Eaf - VT) > 0.02 && (
          <Arrow
            from={complex(Eaf, 0)} to={complex(VT, 0)} color={COLORS.jXsIa} dash="6 4"
            label="jXs·Ia" dx={Eaf >= VT ? 10 : -44} dy={-26}
          />
        )}
        <Arrow from={complex(0, 0)} to={complex(Eaf, 0.001)} color={COLORS.Eaf} width={3} label="Eaf" dy={20} />
        {/* Corriente entrante al motor: perpendicular pura */}
        {Math.abs(sol.IaMag) > 0.02 && (
          <Arrow from={complex(0, 0)} to={IaM} color={COLORS.Ia} width={3} label="Ia (al motor)" dx={12} dy={4} />
        )}

        <text x={44} y={40} fill="#71717a" fontSize={11}>
          δ = 0 (sin potencia activa): Eaf y Vt colineales
        </text>
        <text x={44} y={58} fill="#71717a" fontSize={11}>
          → Ia queda a 90° exactos: TODA la corriente es reactiva
        </text>
      </svg>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Q intercambiada</p>
          <p className={`font-mono text-sm font-semibold ${isCap ? 'text-emerald-300' : isInd ? 'text-sky-300' : 'text-zinc-100'}`}>
            {sol.Q >= 0 ? '+' : ''}{sol.Q.toFixed(3)} pu
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">|Ia|</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{sol.IaMag.toFixed(3)} pu</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Q = Vt·(Eaf−Vt)/Xs</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            1·({Eaf.toFixed(2)}−1)/1 = {(Eaf - 1).toFixed(2)}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) barre |Eaf| de un extremo al otro: la máquina pasa de reactor (absorbe Q, corriente en
        atraso) a condensador (entrega Q, corriente en adelanto) SIN piezas nuevas — solo excitación;
        (2) deja |Eaf| = 1.00 y verifica que la corriente se extingue: la máquina «flota» en la red;
        (3) nota que Ia nunca tiene componente horizontal: sin par mecánico no hay potencia activa que
        transportar.
      </footer>
    </div>
  )
}
