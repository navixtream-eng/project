import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Colores: bloque zinc, corrientes parásitas rojas, aislamiento violeta */
const COLORS = { steel: '#27272a', edge: '#52525b', eddy: '#e66767', insul: '#9085e9' }

/**
 * Laboratorio — Corrientes de Foucault y laminaciones.
 * El flujo alterno induce lazos de corriente en el propio acero. Partir el
 * núcleo en n láminas aisladas encoge cada lazo: la pérdida cae como 1/n²
 * (equivalentemente, ∝ espesor²).
 */
export default function EddyLab() {
  const [n, setN] = useState(1)
  const loss = 1 / (n * n)

  const W = 260
  const H = 150
  const x0 = 40
  const y0 = 30
  const lamW = W / n

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Corrientes de Foucault — el porqué de las laminaciones
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-violet-300">n · láminas</span>
          <input type="range" min={1} max={16} step={1} value={n}
            onChange={(e) => setN(Number(e.target.value))} className="w-40" />
          <span className="w-8 font-mono text-zinc-200">{n}</span>
        </label>
        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-red-300">
          pérdida ∝ 1/n² = {(loss * 100).toFixed(1)}% del bloque macizo
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox="0 0 340 210" className="w-full max-w-sm shrink-0 select-none">
          <text x={x0} y={18} fill="#71717a" fontSize={10}>
            sección del núcleo · el flujo φ(t) alterno sale de la página
          </text>
          {Array.from({ length: n }, (_, k) => {
            const lx = x0 + k * lamW
            const pad = Math.min(10, lamW * 0.18)
            return (
              <g key={k}>
                <rect x={lx + 1} y={y0} width={lamW - 2} height={H}
                  fill={COLORS.steel} stroke={COLORS.edge} strokeWidth={1} />
                {/* Aislamiento entre láminas */}
                {k > 0 && <line x1={lx} y1={y0} x2={lx} y2={y0 + H} stroke={COLORS.insul} strokeWidth={2} />}
                {/* Lazo de corriente parásita, confinado a su lámina */}
                <rect x={lx + pad} y={y0 + 14} width={lamW - 2 * pad - 2} height={H - 28}
                  rx={6} fill="none" stroke={COLORS.eddy}
                  strokeWidth={Math.max(0.8, 3.2 / Math.sqrt(n))} opacity={0.9} />
                {n <= 4 && (
                  <path d={`M ${lx + pad + 4} ${y0 + 14} l 8 -4 l 0 8 Z`} fill={COLORS.eddy} />
                )}
              </g>
            )
          })}
          <text x={x0} y={y0 + H + 22} fill={COLORS.eddy} fontSize={10} fontWeight={700}>
            lazos de Foucault: cada lámina confina el suyo (más chico = menos pérdida)
          </text>
          {n > 1 && (
            <text x={x0} y={y0 + H + 36} fill={COLORS.insul} fontSize={10}>
              líneas violetas: barniz aislante entre láminas
            </text>
          )}
        </svg>

        <div className="flex-1 p-3 text-xs leading-relaxed text-zinc-400">
          <p className="mb-2">
            El flujo alterno induce FEM en el propio acero (que es conductor): nacen lazos de
            corriente que solo producen calor. La pérdida escala con el <strong className="text-zinc-200">
            cuadrado del ancho del lazo</strong>:
          </p>
          <p className="rounded-md bg-zinc-900 px-3 py-2 font-mono text-[11px] text-zinc-200">
            P_foucault ∝ t² · f² · B²max&nbsp;&nbsp;(t = espesor de lámina)
          </p>
          <p className="mt-2">
            Partir el núcleo en n láminas divide t entre n ⇒ la pérdida cae n² veces. Por eso todo
            núcleo de CA es un sándwich de chapas de 0.3–0.5 mm barnizadas — y por eso los núcleos de
            CD (o el rotor síncrono, que ve flujo constante) pueden ser macizos.
          </p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) desliza de 1 a 16 láminas y mira el marcador: 16 chapas = 0.4% de la pérdida del bloque
        macizo — la mejora de ingeniería más barata del capítulo; (2) nota la dependencia f²: al doble
        de frecuencia, cuádruple pérdida — por eso los núcleos de alta frecuencia abandonan el acero
        (ferritas, polvo de hierro); (3) conéctalo con la Sección 6 del Cap. 5: estas son las
        «pérdidas del hierro» fijas que allá facturamos como Pnucleo.
      </footer>
    </div>
  )
}
