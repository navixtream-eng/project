import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { droopSolve } from '../lib/machine'

const K = 1 // estatismo [Hz/MW] (igual en ambas máquinas impulsoras)

/**
 * Laboratorio — Reparto de potencia activa entre gobernadores (Fig. 5-29).
 * El diagrama espejado del libro, vivo: la salida de PM₂ crece hacia la
 * izquierda, la de PM₁ hacia la derecha, y la frecuencia común es la altura
 * a la que las dos rectas de estatismo se reparten exactamente la carga.
 */
export default function DroopShareLab() {
  const [fNl1, setFNl1] = useState(61.5) // setpoint gobernador 1
  const [fNl2, setFNl2] = useState(61.0) // setpoint gobernador 2
  const [pL, setPL] = useState(2.5) // carga total [MW]

  const { f, p1, p2 } = droopSolve({ fNl: fNl1, k: K }, { fNl: fNl2, k: K }, pL)
  const fOk = Math.abs(f - 60) < 0.05
  const reverse2 = p2 < 0

  // --- Geometría del diagrama espejado (viewBox 640×250) ---
  const W = 640
  const H = 250
  const X0 = W / 2 // P = 0 al centro
  const PXS = 70 // px por MW
  const yOf = (freq: number) => 210 - (freq - 57.5) * 36 // 57.5–62.5 Hz visibles
  const x1 = (p: number) => X0 + p * PXS // P₁ hacia la derecha
  const x2 = (p: number) => X0 - p * PXS // P₂ hacia la izquierda
  const pMaxVis = 4.2

  const linePts = (fNl: number, xr: (p: number) => number) =>
    `${xr(-0.3)},${yOf(fNl + 0.3 * K)} ${xr(pMaxVis)},${yOf(fNl - pMaxVis * K)}`

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Gobernadores y reparto de potencia activa (Fig. 5-29)
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-3">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-sky-300">Gobernador 1</span>
          <input type="range" min={59.5} max={62.5} step={0.05} value={fNl1}
            onChange={(e) => setFNl1(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{fNl1.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-amber-300">Gobernador 2</span>
          <input type="range" min={59.5} max={62.5} step={0.05} value={fNl2}
            onChange={(e) => setFNl2(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{fNl2.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-24 font-semibold text-emerald-300">Carga P_L</span>
          <input type="range" min={0.5} max={5} step={0.1} value={pL}
            onChange={(e) => setPL(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{pL.toFixed(1)} MW</span>
        </label>
      </div>

      <div className="px-2 py-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* Rejilla de frecuencia */}
          {[58, 59, 60, 61, 62].map((fr) => (
            <g key={fr}>
              <line x1={30} y1={yOf(fr)} x2={W - 10} y2={yOf(fr)}
                stroke={fr === 60 ? '#3f3f46' : '#27272a'} strokeDasharray={fr === 60 ? '' : '3 4'} />
              <text x={4} y={yOf(fr) + 3} fill={fr === 60 ? '#a1a1aa' : '#52525b'} fontSize={9} fontFamily="monospace">
                {fr}
              </text>
            </g>
          ))}
          {/* Eje central P = 0 */}
          <line x1={X0} y1={18} x2={X0} y2={225} stroke="#3f3f46" />
          <text x={X0} y={240} fill="#71717a" fontSize={9} textAnchor="middle" fontFamily="monospace">O</text>
          <text x={X0 + 150} y={240} fill="#38bdf8" fontSize={9} textAnchor="middle">→ salida de potencia PM₁ [MW]</text>
          <text x={X0 - 150} y={240} fill="#f59e0b" fontSize={9} textAnchor="middle">salida de potencia PM₂ [MW] ←</text>

          {/* Rectas de estatismo */}
          <polyline points={linePts(fNl1, x1)} fill="none" stroke="#38bdf8" strokeWidth={2} />
          <polyline points={linePts(fNl2, x2)} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={x1(pMaxVis) - 4} y={yOf(fNl1 - pMaxVis * K) - 6} fill="#38bdf8" fontSize={10} textAnchor="end">PM₁</text>
          <text x={x2(pMaxVis) + 4} y={yOf(fNl2 - pMaxVis * K) - 6} fill="#f59e0b" fontSize={10}>PM₂</text>

          {/* Línea de carga A-B a la frecuencia del sistema */}
          <line x1={x2(p2)} y1={yOf(f)} x2={x1(p1)} y2={yOf(f)} stroke="#10b981" strokeWidth={2.5} />
          <circle cx={x2(p2)} cy={yOf(f)} r={4} fill="#f59e0b" />
          <circle cx={x1(p1)} cy={yOf(f)} r={4} fill="#38bdf8" />
          <text x={X0} y={yOf(f) - 7} fill="#10b981" fontSize={10} textAnchor="middle" fontFamily="monospace">
            A─B: P_L = {pL.toFixed(1)} MW · f = {f.toFixed(2)} Hz
          </text>

          {/* Proyecciones de P1 y P2 */}
          <line x1={x1(p1)} y1={yOf(f)} x2={x1(p1)} y2={225} stroke="#38bdf8" strokeDasharray="3 4" strokeWidth={1} />
          <line x1={x2(p2)} y1={yOf(f)} x2={x2(p2)} y2={225} stroke="#f59e0b" strokeDasharray="3 4" strokeWidth={1} />
          <text x={x1(p1)} y={222} fill="#38bdf8" fontSize={10} textAnchor="middle" fontFamily="monospace">
            P₁={p1.toFixed(2)}
          </text>
          <text x={x2(p2)} y={222} fill="#f59e0b" fontSize={10} textAnchor="middle" fontFamily="monospace">
            P₂={p2.toFixed(2)}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">f del sistema</p>
          <p className={`font-mono text-sm font-semibold ${fOk ? 'text-emerald-300' : 'text-red-300'}`}>
            {f.toFixed(2)} Hz {fOk ? '✓' : f > 60 ? '↑' : '↓'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">P₁ (gen. 1)</p>
          <p className="font-mono text-sm font-semibold text-sky-300">{p1.toFixed(2)} MW</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">P₂ (gen. 2)</p>
          <p className="font-mono text-sm font-semibold text-amber-300">
            {p2.toFixed(2)} MW{reverse2 ? ' ⚠ motoriza' : ''}
          </p>
        </div>
      </div>

      {reverse2 && (
        <p className="mx-4 mb-3 rounded-lg border border-red-600/50 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          P₂ &lt; 0: el generador 2 está ABSORBIENDO potencia (funciona como motor). Su relé de
          potencia inversa lo sacaría de línea — sube su gobernador o baja el del 1.
        </p>
      )}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) sube la carga con los gobernadores quietos: la barra A─B baja — TODOS pierden frecuencia,
        nadie decide quién asume la carga extra: la deciden las pendientes; (2) reproduce la maniobra
        del libro: sube el gobernador 2 (su recta sube, toma más MW, f sube) y luego baja el 1 hasta
        devolver f = 60 Hz — trasladaste carga del 1 al 2 SIN tocar la frecuencia; (3) baja el
        gobernador 2 hasta que P₂ cruce por cero: así se «descarga» una máquina antes de sacarla de
        servicio (y si te pasas, motoriza).
      </footer>
    </div>
  )
}
