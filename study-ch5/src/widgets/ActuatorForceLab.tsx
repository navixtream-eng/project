import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { actuatorForce, actuatorL } from '../lib/machine'

/** Paleta validada: hierro zinc, bobina amarilla, fuerza roja, flujo azul */
const C = { steel: '#27272a', edge: '#52525b', coil: '#c98500', force: '#e66767', flux: '#3987e5' }

function Readout({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ?? 'text-zinc-100'}`}>{value}</p>
    </div>
  )
}

/**
 * Laboratorio — Fuerza en un actuador de émbolo.
 * La bobina crea flujo; el sistema tira del émbolo para CERRAR el gap
 * (reducir la energía / aumentar la inductancia). La fuerza sale de la
 * derivada de la coenergía respecto a la posición: f = +∂W′/∂x.
 */
export default function ActuatorForceLab() {
  const [N, setN] = useState(500)
  const [I, setI] = useState(2.0)
  const [gMm, setGMm] = useState(2.0)
  const A = 4e-4 // 4 cm²

  const F = actuatorForce(N, A, I, gMm)
  const L = actuatorL(N, A, gMm)
  const Wc = 0.5 * L * I * I
  // Fuerza a la mitad del gap (para ilustrar el crecimiento ∝ 1/g²)
  const Fhalf = actuatorForce(N, A, I, gMm / 2)

  // Dibujo: el gap se muestra proporcional
  const gapPx = 6 + gMm * 10

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Fuerza en un actuador — f = ∂W′fld/∂x
        </h4>
      </header>

      <div className="grid gap-x-6 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs sm:grid-cols-3">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-8 font-semibold text-amber-300">N</span>
          <input type="range" min={100} max={1000} step={10} value={N}
            onChange={(e) => setN(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{N}</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-8 font-semibold text-sky-300">i</span>
          <input type="range" min={0.2} max={5} step={0.1} value={I}
            onChange={(e) => setI(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{I.toFixed(1)} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="w-8 font-semibold text-red-300">g</span>
          <input type="range" min={0.3} max={5} step={0.1} value={gMm}
            onChange={(e) => setGMm(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{gMm.toFixed(1)} mm</span>
        </label>
      </div>

      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <svg viewBox="0 0 340 200" className="w-full max-w-sm shrink-0 select-none">
          {/* Yugo fijo en forma de C */}
          <path d="M 40 40 H 200 V 70 H 90 V 130 H 200 V 160 H 40 Z"
            fill={C.steel} stroke={C.edge} strokeWidth={1.5} />
          {/* Bobina */}
          {Array.from({ length: 6 }, (_, k) => (
            <rect key={k} x={44} y={72 + k * 9} width={30} height={6} rx={2} fill={C.coil} opacity={0.9} />
          ))}
          <text x={20} y={105} fill={C.coil} fontSize={11} fontWeight={700}>N·i</text>
          {/* Émbolo móvil */}
          <rect x={200 + gapPx} y={55} width={70} height={90} rx={4}
            fill={C.steel} stroke={C.edge} strokeWidth={1.5} />
          {/* Gap marcado */}
          <line x1={200} y1={100} x2={200 + gapPx} y2={100} stroke={C.force} strokeWidth={2} />
          <text x={200 + gapPx / 2 - 4} y={92} fill={C.force} fontSize={10} fontWeight={700}>g</text>
          {/* Flechas de fuerza (émbolo jalado hacia el yugo) */}
          <line x1={235 + gapPx} y1={100} x2={210 + gapPx} y2={100} stroke={C.force} strokeWidth={3} />
          <path d={`M ${210 + gapPx} 100 l 10 -6 l 0 12 Z`} fill={C.force} />
          <text x={240 + gapPx} y={104} fill={C.force} fontSize={11} fontWeight={700}>f</text>
          {/* Flujo */}
          <path d="M 65 50 H 175 V 90" fill="none" stroke={C.flux} strokeWidth={2} strokeDasharray="5 3" opacity={0.7} />
          <text x={110} y={36} fill={C.flux} fontSize={10}>φ</text>
          <text x={40} y={182} fill="#71717a" fontSize={10}>el campo SIEMPRE tira de cerrar el gap</text>
        </svg>

        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <Readout label="L(g) = μ₀N²A/g" value={`${(L * 1000).toFixed(1)} mH`} />
          <Readout label="W′fld = ½Li²" value={`${(Wc * 1000).toFixed(1)} mJ`} accent="text-amber-300" />
          <Readout label="Fuerza |f|" value={`${F.toFixed(1)} N`} accent="text-red-300" />
          <Readout label="Sentido" value="cierra el gap (atrae)" accent="text-red-300" />
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">La fuerza crece como 1/g²</p>
            <p className="font-mono text-xs text-zinc-200">
              a la mitad del gap ({(gMm / 2).toFixed(1)} mm): |f| = {Fhalf.toFixed(0)} N ={' '}
              <span className="text-red-300">{(Fhalf / F).toFixed(1)}×</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) la fuerza sale de derivar la coenergía: f = ½i²·dL/dx, y como L ∝ 1/g, la fuerza va como
        1/g² — cierra el gap a la mitad y mira cuadruplicarse |f| (por eso los relés «pegan» de golpe
        al final del recorrido); (2) la fuerza SIEMPRE cierra el gap: el campo busca subir la
        inductancia / bajar la reluctancia — es el par de reluctancia del Cap. 4 en versión lineal;
        (3) f ∝ N²i²: duplicar la corriente cuadruplica la fuerza — la conversión no distingue el
        signo de i, por eso un electroimán de CA vibra a 120 Hz pero siempre atrae.
      </footer>
    </div>
  )
}
