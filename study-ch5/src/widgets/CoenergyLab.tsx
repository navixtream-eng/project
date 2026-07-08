import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { coenergy, fieldEnergy, lambdaOfI, LAMBDA_SAT } from '../lib/machine'

/** Paleta validada: curva azul, energía violeta, coenergía amarilla */
const COLORS = { curve: '#3987e5', energy: '#9085e9', coenergy: '#c98500', grid: '#27272a', muted: '#71717a' }

const W = 420
const H = 300
const OX = 56
const OY = 256
const IMAX = 12 // A
const LMAX = 1.6 // Wb·v
const SX = (W - OX - 20) / IMAX
const SY = (OY - 24) / LMAX

const px = (i: number) => OX + i * SX
const py = (lam: number) => OY - lam * SY

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Energía y coenergía en el plano λ-i.
 * La curva de magnetización parte el rectángulo λ·i en dos: la ENERGÍA
 * (área a la izquierda, ∫i dλ) y la COENERGÍA (área abajo, ∫λ di).
 * En un sistema lineal son iguales; al saturar, la coenergía crece más.
 */
export default function CoenergyLab() {
  const [i, setI] = useState(7)
  const [gMm, setGMm] = useState(1.0)

  const lam = lambdaOfI(i, gMm)
  const wf = fieldEnergy(i, gMm)
  const wc = coenergy(i, gMm)
  const rect = lam * i

  // Puntos de la curva hasta el punto de operación
  const N = 60
  const curvePts = Array.from({ length: N + 1 }, (_, k) => {
    const ii = (k / N) * i
    return { x: px(ii), y: py(lambdaOfI(ii, gMm)) }
  })
  const curvePath = curvePts.map((p, k) => `${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  // Coenergía: polígono bajo la curva hasta el eje i
  const coPath = `${curvePath} L ${px(i)} ${py(0)} L ${px(0)} ${py(0)} Z`
  // Energía: polígono a la izquierda de la curva hasta el eje λ
  const enPath = `${curvePath} L ${px(i)} ${py(lam)} L ${px(0)} ${py(lam)} Z`

  const satFrac = lam / LAMBDA_SAT

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Energía y coenergía — el rectángulo partido por la curva
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">i (corriente)</span>
          <input type="range" min={0.5} max={IMAX} step={0.1} value={i}
            onChange={(e) => setI(Number(e.target.value))} className="w-36" />
          <span className="w-14 font-mono text-zinc-200">{i.toFixed(1)} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">g (entrehierro)</span>
          <input type="range" min={0.3} max={4} step={0.1} value={gMm}
            onChange={(e) => setGMm(Number(e.target.value))} className="w-32" />
          <span className="w-14 font-mono text-zinc-200">{gMm.toFixed(1)} mm</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md shrink-0 select-none">
          {/* Rectángulo λ·i */}
          <rect x={px(0)} y={py(lam)} width={px(i) - px(0)} height={py(0) - py(lam)}
            fill="none" stroke="#3f3f46" strokeDasharray="3 3" />
          {/* Áreas */}
          <path d={coPath} fill={COLORS.coenergy} fillOpacity={0.28} />
          <path d={enPath} fill={COLORS.energy} fillOpacity={0.3} />
          {/* Curva */}
          <path d={curvePath} fill="none" stroke={COLORS.curve} strokeWidth={2.4} />
          {/* Prolongación tenue de la curva */}
          <path d={Array.from({ length: 40 }, (_, k) => {
            const ii = i + (k / 40) * (IMAX - i)
            return `${k === 0 ? 'M' : 'L'} ${px(ii).toFixed(1)} ${py(lambdaOfI(ii, gMm)).toFixed(1)}`
          }).join(' ')} fill="none" stroke={COLORS.curve} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          {/* Ejes */}
          <line x1={OX} y1={OY} x2={W - 12} y2={OY} stroke="#52525b" strokeWidth={1.5} />
          <line x1={OX} y1={OY} x2={OX} y2={16} stroke="#52525b" strokeWidth={1.5} />
          <text x={W - 30} y={OY + 16} fill={COLORS.muted} fontSize={11}>i [A]</text>
          <text x={OX - 46} y={24} fill={COLORS.muted} fontSize={11}>λ [Wb·v]</text>
          {/* Punto de operación */}
          <circle cx={px(i)} cy={py(lam)} r={5} fill="#fafafa" />
          {/* Etiquetas de las áreas */}
          <text x={px(i * 0.62)} y={py(lam * 0.22)} fill={COLORS.coenergy} fontSize={12} fontWeight={700}>W′fld</text>
          <text x={px(i * 0.12)} y={py(lam * 0.72)} fill={COLORS.energy} fontSize={12} fontWeight={700}>Wfld</text>
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="λ (enlace de flujo)" value={`${lam.toFixed(3)} Wb·v`} accent="text-sky-300" />
          <Readout label="Saturación" value={`${(satFrac * 100).toFixed(0)}% del codo`}
            accent={satFrac > 0.8 ? 'text-red-300' : undefined} />
          <Readout label="Wfld (energía)" value={`${wf.toFixed(3)} J`} accent="text-violet-300" />
          <Readout label="W′fld (coenergía)" value={`${wc.toFixed(3)} J`} accent="text-amber-300" />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Verificación: Wfld + W′fld = λ·i</p>
            <p className="font-mono text-xs text-zinc-200">
              {wf.toFixed(3)} + {wc.toFixed(3)} = {(wf + wc).toFixed(3)} = {rect.toFixed(3)} J ✓
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-400">
              W′fld − Wfld = {(wc - wf).toFixed(3)} J
              <span className="text-zinc-600"> ({satFrac < 0.35 ? '≈ 0: casi lineal' : 'saturado: coenergía mayor'})</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con corriente baja (zona lineal, curva casi recta) las DOS áreas son iguales — energía y
        coenergía coinciden, tal como en Wfld = W′fld = ½Li²; (2) sube i hasta saturar y mira la curva
        acostarse: la coenergía (amarilla, bajo la curva) engorda mientras la energía (violeta) se
        estanca — su diferencia es la firma de la no-linealidad; (3) cierra el gap (g ↓) y observa la
        curva empinarse: más pendiente = más inductancia = más energía almacenada para la misma
        corriente. La suma de ambas áreas siempre llena el rectángulo λ·i.
      </footer>
    </div>
  )
}
