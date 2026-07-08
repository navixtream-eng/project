import { useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Colores coherentes con el documento (paleta validada) */
const COLORS = { core: '#27272a', edge: '#52525b', coil: '#c98500', flux: '#3987e5', gap: '#e66767', fringe: '#9085e9' }

const MU0 = 4 * Math.PI * 1e-7
/** Núcleo cuadrado: longitud media del camino y sección */
const LC = 0.4 // m
const SIDE = 0.04 // m (sección cuadrada de 4 cm de lado)
const AC = SIDE * SIDE // 16 cm²

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — El circuito magnético: la ley de Ohm del flujo.
 * Una bobina (F = N·I) empuja flujo a través del hierro (Rc) y del
 * entrehierro (Rg). El aire, ~μr veces más reluctante, se queda con casi
 * toda la FMM. El franjeo agranda el área efectiva del cruce.
 */
export default function MagneticCircuitLab() {
  const [N, setN] = useState(500)
  const [I, setI] = useState(1.0)
  const [gMm, setGMm] = useState(1.0)
  const [muR, setMuR] = useState(4000)
  const [fringing, setFringing] = useState(true)

  const g = gMm / 1000
  const F = N * I
  const Rc = LC / (muR * MU0 * AC)
  // Franjeo: el área efectiva del entrehierro crece sumando g a cada lado
  const Ag = fringing ? (SIDE + g) * (SIDE + g) : AC
  const Rg = g > 0 ? g / (MU0 * Ag) : 0
  const phi = F / (Rc + Rg)
  const Bc = phi / AC
  const Bg = phi / Ag
  const gapShare = Rg / (Rc + Rg)
  const saturado = Bc > 1.6

  // Geometría del dibujo
  const fluxW = Math.max(1.5, Math.min(9, Bc * 5))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El circuito magnético — FMM, reluctancia y entrehierro
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-2">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-amber-300">N (vueltas)</span>
          <input type="range" min={100} max={1000} step={10} value={N}
            onChange={(e) => setN(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{N}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-amber-300">I (corriente)</span>
          <input type="range" min={0.1} max={5} step={0.1} value={I}
            onChange={(e) => setI(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{I.toFixed(1)} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-red-300">g (entrehierro)</span>
          <input type="range" min={0} max={5} step={0.1} value={gMm}
            onChange={(e) => setGMm(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{gMm.toFixed(1)} mm</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-28 font-semibold text-sky-300">μr (hierro)</span>
          <input type="range" min={500} max={10000} step={100} value={muR}
            onChange={(e) => setMuR(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{muR}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400 sm:col-span-2">
          <input type="checkbox" checked={fringing} onChange={(e) => setFringing(e.target.checked)}
            className="h-3.5 w-3.5 accent-violet-500" />
          Corregir por franjeo (área efectiva del gap: (a+g)²)
        </label>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox="0 0 340 260" className="w-full max-w-sm shrink-0 select-none">
          {/* Núcleo: marco cuadrado con hueco central */}
          <path d="M 60 30 H 280 V 230 H 60 Z M 105 75 H 235 V 185 H 105 Z"
            fill={COLORS.core} stroke={COLORS.edge} strokeWidth={1.5} fillRule="evenodd" />
          {/* Entrehierro en la pierna derecha */}
          {gMm > 0 && (
            <g>
              <rect x={235} y={124} width={45} height={4 + gMm * 3} fill="#09090b" />
              <line x1={235} y1={124} x2={280} y2={124} stroke={COLORS.gap} strokeWidth={2} />
              <line x1={235} y1={128 + gMm * 3} x2={280} y2={128 + gMm * 3} stroke={COLORS.gap} strokeWidth={2} />
              <text x={288} y={130} fill={COLORS.gap} fontSize={11} fontWeight={700}>g</text>
              {/* Franjeo: líneas que se abomban hacia afuera */}
              {fringing && (
                <g stroke={COLORS.fringe} strokeWidth={1.3} fill="none" opacity={0.8}>
                  <path d={`M 238 124 C 230 ${126 + gMm * 1.5} 230 ${126 + gMm * 1.5} 238 ${128 + gMm * 3}`} />
                  <path d={`M 277 124 C 285 ${126 + gMm * 1.5} 285 ${126 + gMm * 1.5} 277 ${128 + gMm * 3}`} />
                  <path d={`M 236 122 C 222 ${126 + gMm * 1.5} 222 ${126 + gMm * 1.5} 236 ${130 + gMm * 3}`} opacity={0.5} />
                  <path d={`M 279 122 C 293 ${126 + gMm * 1.5} 293 ${126 + gMm * 1.5} 279 ${130 + gMm * 3}`} opacity={0.5} />
                </g>
              )}
            </g>
          )}
          {/* Bobina en la pierna izquierda */}
          {Array.from({ length: 7 }, (_, k) => (
            <rect key={k} x={48} y={88 + k * 13} width={36} height={9} rx={4}
              fill={COLORS.coil} opacity={0.9} />
          ))}
          <text x={20} y={135} fill={COLORS.coil} fontSize={12} fontWeight={700}>N·I</text>
          {/* Flujo: lazo con grosor ∝ B */}
          <path d="M 82 52 H 258 V 118" fill="none" stroke={COLORS.flux} strokeWidth={fluxW} opacity={0.85} markerEnd="url(#fluxArrow)" />
          <path d={`M 258 ${134 + gMm * 3} V 208 H 82 V 60`} fill="none" stroke={COLORS.flux} strokeWidth={fluxW} opacity={0.85} />
          <defs>
            <marker id="fluxArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={COLORS.flux} />
            </marker>
          </defs>
          <text x={150} y={46} fill={COLORS.flux} fontSize={12} fontWeight={700}>φ</text>
          {saturado && (
            <text x={110} y={215} fill="#e66767" fontSize={11} fontWeight={700}>⚠ hierro saturado (B &gt; 1.6 T)</text>
          )}
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="F = N·I" value={`${F.toFixed(0)} A·v`} accent="text-amber-300" />
          <Readout label="φ (flujo)" value={`${(phi * 1000).toFixed(2)} mWb`} accent="text-sky-300" />
          <Readout label="R hierro" value={`${(Rc / 1000).toFixed(1)} kA·v/Wb`} />
          <Readout label="R entrehierro" value={`${(Rg / 1000).toFixed(1)} kA·v/Wb`} accent="text-red-300" />
          <Readout label="B en el hierro" value={`${Bc.toFixed(2)} T`}
            accent={saturado ? 'text-red-400' : undefined} />
          <Readout label="B en el gap" value={`${Bg.toFixed(2)} T`}
            accent={fringing && gMm > 0 ? 'text-violet-300' : undefined} />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">FMM consumida por el entrehierro</p>
            <div className="mt-1 flex h-4 w-full overflow-hidden rounded-sm bg-zinc-900">
              <div style={{ width: `${gapShare * 100}%` }} className="bg-red-500/70" />
              <div style={{ width: `${(1 - gapShare) * 100}%` }} className="bg-sky-600/60" />
            </div>
            <p className="mt-1 font-mono text-xs text-zinc-300">
              <span className="text-red-300">{(gapShare * 100).toFixed(1)}% aire</span> ·{' '}
              <span className="text-sky-300">{((1 - gapShare) * 100).toFixed(1)}% hierro</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con g = 0 todo es hierro; abre el gap a solo 1 mm y mira la barra: el aire — 0.25% del
        camino — se queda con más del 80% de la FMM; (2) duplica μr con el gap abierto: casi nada
        cambia — cuando el aire manda, mejorar el hierro es cosmético (la gran lección del capítulo);
        (3) activa y desactiva el franjeo con g grande: el área efectiva (a+g)² baja la B del gap
        respecto a la del hierro — las líneas violetas son ese «desparrame» en los bordes.
      </footer>
    </div>
  )
}
