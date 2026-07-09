import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { actuatorForce, actuatorL } from '../lib/machine'
import ActuatorScene from './anatomy3d/ActuatorScene'

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

  // Mapeo de la física a proporciones visuales del modelo 3D
  const turns = Math.max(3, Math.min(12, Math.round(N / 80)))
  const gapVisual = 0.035 + gMm * 0.06
  const fluxProxy = (N * I) / gMm
  const fluxRadius = Math.max(0.02, Math.min(0.075, 0.02 + Math.log10(fluxProxy) * 0.012))
  const fluxSpeed = Math.max(0.06, Math.min(0.25, 0.06 + I * 0.03))
  const forceLen = Math.max(0.18, Math.min(0.6, 0.15 + Math.log10(F + 1) * 0.12))

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
        <div className="relative h-72 w-full max-w-sm shrink-0 touch-none sm:h-80">
          <ActuatorScene
            turns={turns}
            gapVisual={gapVisual}
            fluxRadius={fluxRadius}
            forceLen={forceLen}
            fluxSpeed={fluxSpeed}
          />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-400">
            arrastra para rotar · <span className="text-amber-300">N·i</span> → φ cruza el gap · <span className="text-red-300">f</span> cierra el gap
          </span>
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-500">
            el campo SIEMPRE tira de cerrar el gap
          </span>
        </div>

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
