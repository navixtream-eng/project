import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'
import { rotorFrequency, syncSpeedRpm } from '../lib/machine'

/** Paleta validada: campo del estator rojo, rotor ámbar, corriente inducida aqua */
const COLORS = { field: '#e66767', rotor: '#c98500', induced: '#199e70', grid: '#27272a', muted: '#71717a', steel: '#3f3f46' }

const POLES = 4
const FE = 60
const NS = syncSpeedRpm(FE, POLES) // 1800 r/min
const VIS = 0.9 // velocidad angular visual del campo [rad/s en pantalla]

function draw(canvas: HTMLCanvasElement, fieldAng: number, rotorAng: number, s: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const R = Math.min(w, h) * 0.4

  // Estator (corona)
  ctx.strokeStyle = COLORS.steel
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(cx, cy, R + 6, 0, 2 * Math.PI)
  ctx.stroke()

  // Rotor (disco) con barras
  ctx.fillStyle = '#18181b'
  ctx.strokeStyle = COLORS.rotor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.72, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()

  const nbar = 12
  for (let i = 0; i < nbar; i++) {
    const a = rotorAng + (i / nbar) * 2 * Math.PI
    const bx = cx + R * 0.6 * Math.cos(a)
    const by = cy - R * 0.6 * Math.sin(a)
    // Intensidad de la corriente inducida ∝ deslizamiento
    const slipPhase = Math.sin(fieldAng - rotorAng - (i / nbar) * 2 * Math.PI)
    const mag = Math.max(0, slipPhase) * Math.min(1, s * 4)
    ctx.fillStyle = COLORS.rotor
    ctx.beginPath()
    ctx.arc(bx, by, 5, 0, 2 * Math.PI)
    ctx.fill()
    if (mag > 0.05) {
      ctx.fillStyle = COLORS.induced
      ctx.globalAlpha = mag
      ctx.beginPath()
      ctx.arc(bx, by, 5 + mag * 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
  // Marca de referencia del rotor (para ver su giro)
  ctx.strokeStyle = COLORS.rotor
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + R * 0.66 * Math.cos(rotorAng), cy - R * 0.66 * Math.sin(rotorAng))
  ctx.stroke()

  // Campo giratorio del estator (dos polos N-S opuestos)
  const arrow = (ang: number, color: string, label: string, len: number) => {
    const x1 = cx + len * Math.cos(ang)
    const y1 = cy - len * Math.sin(ang)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    const a2 = Math.atan2(cy - y1, x1 - cx)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - 12 * Math.cos(a2 - 0.4), y1 + 12 * Math.sin(a2 - 0.4))
    ctx.lineTo(x1 - 12 * Math.cos(a2 + 0.4), y1 + 12 * Math.sin(a2 + 0.4))
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 13px ui-sans-serif'
    ctx.fillText(label, x1 + 6 * Math.cos(ang), y1 - 6 * Math.sin(ang))
  }
  arrow(fieldAng, COLORS.field, 'N', R * 0.9)
  arrow(fieldAng + Math.PI, '#3987e5', 'S', R * 0.9)

  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('campo (rojo) gira a nₛ · rotor (ámbar) a nₘ < nₛ', 10, h - 10)
}

/**
 * Laboratorio — El campo giratorio y el deslizamiento.
 * El campo del estator gira a la velocidad síncrona nₛ; el rotor lo persigue
 * a nₘ, siempre un poco por detrás. Ese RETRASO (deslizamiento) es lo que
 * corta los conductores del rotor e induce las corrientes que dan el par.
 */
export default function SlipFieldLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef(0)
  const rotorRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [sPct, setSPct] = useState(5) // deslizamiento en %

  const s = sPct / 100
  const nm = (1 - s) * NS
  const fr = rotorFrequency(s, FE)

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
      const canvas = canvasRef.current
      if (canvas) draw(canvas, fieldRef.current, rotorRef.current, s)
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
        <canvas ref={canvasRef} className="h-64 w-full shrink-0 sm:w-64" />
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
