import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'
import { rotorFrequency, syncSpeedRpm } from '../lib/machine'
import SlipFieldScene from './anatomy3d/SlipFieldScene'

const POLES = 4
const FE = 60
const NS = syncSpeedRpm(FE, POLES) // 1800 r/min
const VIS = 0.9 // velocidad angular visual del campo [rad/s en pantalla]

/**
 * Laboratorio — El campo giratorio y el deslizamiento.
 * El campo del estator gira a la velocidad síncrona nₛ; el rotor lo persigue
 * a nₘ, siempre un poco por detrás. Ese RETRASO (deslizamiento) es lo que
 * corta los conductores del rotor e induce las corrientes que dan el par.
 * La máquina se muestra en 3D; los ángulos del campo y del rotor los mueve
 * el mismo bucle de animación.
 */
export default function SlipFieldLab() {
  const fieldRef = useRef(0)
  const rotorRef = useRef(0)
  const slipRef = useRef(0.05)
  const [playing, setPlaying] = useState(true)
  const [sPct, setSPct] = useState(5) // deslizamiento en %

  const s = sPct / 100
  const nm = (1 - s) * NS
  const fr = rotorFrequency(s, FE)
  slipRef.current = s

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) {
        fieldRef.current += VIS * dt
        rotorRef.current += VIS * (1 - s) * dt
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, s])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Campo giratorio y deslizamiento
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Carga → deslizamiento s</span>
          <input type="range" min={0.2} max={100} step={0.2} value={sPct}
            onChange={(e) => setSPct(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{s.toFixed(3)}</span>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative h-64 w-full shrink-0 touch-none sm:w-72">
          <SlipFieldScene fieldRef={fieldRef} rotorRef={rotorRef} slipRef={slipRef} />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-400">
            arrastra para rotar · campo <span className="text-red-300">N</span>-<span className="text-sky-300">S</span> gira a nₛ · jaula a nₘ
          </span>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 p-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">nₛ síncrona</p>
            <p className="font-mono text-sm font-semibold text-red-300">{NS.toFixed(0)} r/min</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">nₘ del rotor</p>
            <p className="font-mono text-sm font-semibold text-amber-300">{nm.toFixed(0)} r/min</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Retraso nₛ−nₘ</p>
            <p className="font-mono text-sm font-semibold text-zinc-100">{(NS - nm).toFixed(0)} r/min</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">fᵣ del rotor</p>
            <p className="font-mono text-sm font-semibold text-emerald-300">{fr.toFixed(2)} Hz</p>
          </div>
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
            El halo aqua sobre las barras es la corriente inducida: crece con el deslizamiento y se
            apaga cuando el rotor casi alcanza al campo. Sin retraso no hay corte de flujo, no hay
            corriente, no hay par — por eso el rotor NUNCA llega a nₛ.
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) baja el deslizamiento hacia 0: el rotor casi alcanza al campo, el halo de corriente se
        apaga y el par desaparece — motor «en vacío» girando casi a nₛ; (2) súbelo hacia s = 1 (rotor
        parado): máximo corte de flujo, máxima corriente inducida y máxima frecuencia del rotor
        (fᵣ = fₑ); (3) nota que el campo SIEMPRE le gana al rotor: esa diferencia es el motor de todo
        — una máquina de inducción es un transformador cuyo secundario se mueve.
      </footer>
    </div>
  )
}
