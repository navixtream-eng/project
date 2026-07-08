import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { toRad } from '../lib/machine'

/** Colores coherentes: Fs (estator) azul, Fr (rotor) rojo, T amarillo */
const COLORS = { Fs: '#3987e5', Fr: '#e66767', T: '#c98500', grid: '#27272a', muted: '#71717a' }

const CX = 150
const CY = 130
const R = 95

function Arrow({ ang, len, color, label, w = 3 }: { ang: number; len: number; color: string; label: string; w?: number }) {
  const x1 = CX + len * Math.cos(ang)
  const y1 = CY - len * Math.sin(ang)
  const a2 = Math.atan2(CY - y1, x1 - CX)
  return (
    <g>
      <line x1={CX} y1={CY} x2={x1} y2={y1} stroke={color} strokeWidth={w} />
      <path d={`M ${x1} ${y1} L ${x1 - 10 * Math.cos(a2 - 0.4)} ${y1 + 10 * Math.sin(a2 - 0.4)} L ${x1 - 10 * Math.cos(a2 + 0.4)} ${y1 + 10 * Math.sin(a2 + 0.4)} Z`} fill={color} />
      <text x={CX + (len + 18) * Math.cos(ang) - 8} y={CY - (len + 18) * Math.sin(ang) + 5}
        fill={color} fontSize={14} fontWeight={700}>{label}</text>
    </g>
  )
}

/**
 * Laboratorio — El origen del par: dos imanes que quieren alinearse.
 * La FMM del estator y la del rotor, separadas el ángulo de par δ,
 * producen T ∝ −sen δ: máximo a 90°, nulo alineados, restaurador siempre.
 */
export default function TorqueAlignLab() {
  const [deltaDeg, setDeltaDeg] = useState(60)
  const delta = toRad(deltaDeg)
  const T = -Math.sin(delta) // por unidad del par máximo (signo: hacia alinear)

  // Mini-curva T(δ)
  const px0 = 320
  const px1 = 590
  const pyMid = 130
  const pAmp = 70
  const path = Array.from({ length: 121 }, (_, i) => {
    const d = -180 + i * 3
    const x = px0 + ((d + 180) / 360) * (px1 - px0)
    const y = pyMid + Math.sin(toRad(d)) * pAmp
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const dotX = px0 + ((deltaDeg + 180) / 360) * (px1 - px0)
  const dotY = pyMid + Math.sin(delta) * pAmp

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El par de alineación — dos imanes y un ángulo
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-amber-300">δ · ángulo de par</span>
          <input type="range" min={-180} max={180} step={1} value={deltaDeg}
            onChange={(e) => setDeltaDeg(Number(e.target.value))} className="w-48" />
          <span className="w-12 font-mono text-zinc-200">{deltaDeg}°</span>
        </label>
      </div>

      <svg viewBox="0 0 620 260" className="w-full select-none">
        {/* Izquierda: los dos vectores de FMM */}
        <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke={COLORS.grid} strokeDasharray="4 4" />
        <Arrow ang={Math.PI / 2} len={R} color={COLORS.Fs} label="F estator" />
        <Arrow ang={Math.PI / 2 - delta} len={R * 0.88} color={COLORS.Fr} label="F rotor" />
        {/* Arco de δ */}
        {Math.abs(deltaDeg) > 3 && (
          <path
            d={`M ${CX + 46 * Math.cos(Math.PI / 2)} ${CY - 46 * Math.sin(Math.PI / 2)} A 46 46 0 0 ${delta > 0 ? 1 : 0} ${CX + 46 * Math.cos(Math.PI / 2 - delta)} ${CY - 46 * Math.sin(Math.PI / 2 - delta)}`}
            fill="none" stroke={COLORS.T} strokeWidth={2} strokeDasharray="4 3"
          />
        )}
        <text x={CX + 56 * Math.cos(Math.PI / 2 - delta / 2) - 6} y={CY - 56 * Math.sin(Math.PI / 2 - delta / 2) + 4}
          fill={COLORS.T} fontSize={13} fontWeight={700}>δ</text>
        {/* Flecha curva del par sobre el rotor */}
        {Math.abs(T) > 0.03 && (
          <g>
            <path
              d={`M ${CX + (R + 22) * Math.cos(Math.PI / 2 - delta + (T > 0 ? -0.5 : 0.5))} ${CY - (R + 22) * Math.sin(Math.PI / 2 - delta + (T > 0 ? -0.5 : 0.5))} A ${R + 22} ${R + 22} 0 0 ${T > 0 ? 1 : 0} ${CX + (R + 22) * Math.cos(Math.PI / 2 - delta)} ${CY - (R + 22) * Math.sin(Math.PI / 2 - delta)}`}
              fill="none" stroke={COLORS.T} strokeWidth={2.5}
            />
            <text x={CX - 60} y={CY + R + 4} fill={COLORS.T} fontSize={11} fontWeight={700}>
              el par empuja a Fr hacia Fs
            </text>
          </g>
        )}
        <text x={20} y={24} fill={COLORS.muted} fontSize={11}>vista frontal del entrehierro</text>

        {/* Derecha: curva T(δ) */}
        <line x1={px0} y1={pyMid} x2={px1} y2={pyMid} stroke="#3f3f46" />
        <line x1={(px0 + px1) / 2} y1={pyMid - pAmp - 12} x2={(px0 + px1) / 2} y2={pyMid + pAmp + 12} stroke={COLORS.grid} strokeDasharray="2 4" />
        <path d={path} fill="none" stroke={COLORS.T} strokeWidth={2.2} />
        <circle cx={dotX} cy={dotY} r={6} fill={COLORS.T} stroke="#fafafa" strokeWidth={1.5} />
        <text x={px0} y={pyMid - pAmp - 18} fill={COLORS.T} fontSize={11} fontWeight={700}>T(δ) = −Tmax·sen δ</text>
        <text x={px0 - 4} y={pyMid + 4} fill={COLORS.muted} fontSize={10}>−180°</text>
        <text x={px1 - 20} y={pyMid + 4} fill={COLORS.muted} fontSize={10}>+180°</text>
        <text x={(px0 + px1) / 2 - 6} y={pyMid + pAmp + 26} fill={COLORS.muted} fontSize={10}>0°</text>
        <text x={px1 - 100} y={pyMid + pAmp + 26} fill={COLORS.muted} fontSize={10}>máximo en ±90°</text>
      </svg>

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">δ</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{deltaDeg}°</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">T / Tmax</p>
          <p className={`font-mono text-sm font-semibold ${Math.abs(T) > 0.95 ? 'text-amber-300' : 'text-zinc-100'}`}>
            {T.toFixed(3)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Estado</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">
            {Math.abs(deltaDeg) < 3 ? 'ALINEADOS (T = 0)' : Math.abs(deltaDeg) > 177 ? 'ANTI-ALINEADOS (inestable)' : 'restaurador'}
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) barre δ despacio: el par crece hasta ±90° y luego DECAE — separar más los imanes no da más
        par, porque lo que importa es la componente perpendicular; (2) párate en δ = 180°: par cero
        pero equilibrio INESTABLE (cualquier soplo lo vuelca hacia un lado) — el mismo δu del criterio
        de áreas; (3) reconoce a tus viejos amigos: este sen δ es el origen físico de TODAS las curvas
        P-δ de los Capítulos 5 y 6 — potencia = par × velocidad síncrona.
      </footer>
    </div>
  )
}
