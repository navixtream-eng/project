import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: onda azul, vehículo amarillo */
const COLORS = { wave: '#3987e5', vehicle: '#c98500', steel: '#27272a', edge: '#52525b', muted: '#71717a' }

function draw(canvas: HTMLCanvasElement, phase: number, tau: number) {
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

  const x0 = 16
  const x1 = w - 16
  const railY = h * 0.6
  const pxPerM = (x1 - x0) / 3 // ventana de 3 m

  // «Riel» = estator desenrollado con ranuras
  ctx.fillStyle = COLORS.steel
  ctx.strokeStyle = COLORS.edge
  ctx.fillRect(x0, railY, x1 - x0, 26)
  ctx.strokeRect(x0, railY, x1 - x0, 26)
  const slotStep = (tau * pxPerM) / 3 // 3 ranuras por paso polar
  for (let x = x0 + 6; x < x1 - 4; x += slotStep) {
    ctx.fillStyle = '#3f3f46'
    ctx.fillRect(x, railY + 3, 4, 9)
  }
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('estator «desenrollado» (ranuras trifásicas a lo largo del riel)', x0 + 4, railY + 42)

  // Onda viajera B(x,t) = cos(πx/τ − ωt)
  ctx.strokeStyle = COLORS.wave
  ctx.lineWidth = 2.2
  ctx.beginPath()
  const amp = h * 0.2
  const waveY = railY - amp - 14
  for (let px = x0; px <= x1; px++) {
    const xm = (px - x0) / pxPerM
    const y = waveY - amp * Math.cos((Math.PI * xm) / tau - phase)
    if (px === x0) ctx.moveTo(px, y)
    else ctx.lineTo(px, y)
  }
  ctx.stroke()
  ctx.fillStyle = COLORS.wave
  ctx.font = 'bold 11px ui-sans-serif'
  ctx.fillText('onda de FMM viajera', x0 + 4, waveY - amp - 8)

  // Flechas de campo bajo la onda (dirección según signo)
  for (let k = 0; k < 12; k++) {
    const xm = (k + 0.5) * (3 / 12)
    const b = Math.cos((Math.PI * xm) / tau - phase)
    const px = x0 + xm * pxPerM
    const len = 14 * b
    ctx.strokeStyle = COLORS.wave
    ctx.globalAlpha = Math.min(1, Math.abs(b) + 0.15)
    ctx.beginPath()
    ctx.moveTo(px, railY - 2)
    ctx.lineTo(px, railY - 2 - len)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // «Vehículo» (rotor lineal) arrastrado por la onda: viaja con una cresta
  const crestXm = ((phase / Math.PI) * tau) % 3
  const vx = x0 + ((crestXm + 3) % 3) * pxPerM
  ctx.fillStyle = COLORS.vehicle
  ctx.strokeStyle = '#09090b'
  ctx.beginPath()
  ctx.roundRect(vx - 26, railY - 22, 52, 18, 5)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#09090b'
  ctx.font = 'bold 10px ui-sans-serif'
  ctx.fillText('placa', vx - 12, railY - 9)
}

/**
 * Laboratorio — La máquina lineal: el motor «desenrollado».
 * El mismo campo giratorio de la Sección 1 del Cap. 5, aplanado sobre un
 * riel: la onda de FMM ya no gira — VIAJA a v = 2·τ·f, arrastrando la
 * placa conductora (el «rotor» plano). Así empujan los trenes maglev.
 */
export default function LinearLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [f, setF] = useState(25)
  const [tau, setTau] = useState(0.5)

  const v = 2 * tau * f

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      // velocidad visual reducida (~1/12 del tiempo real) para que el ojo la siga
      if (playing) phaseRef.current += 2 * Math.PI * f * dt * 0.085
      const canvas = canvasRef.current
      if (canvas) draw(canvas, phaseRef.current, tau)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, f, tau])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La máquina lineal — el motor desenrollado
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className="flex items-center gap-2 text-zinc-400">
          f
          <input type="range" min={5} max={60} step={1} value={f}
            onChange={(e) => setF(Number(e.target.value))} className="w-28" />
          <span className="w-12 font-mono text-zinc-200">{f} Hz</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          τ (paso polar)
          <input type="range" min={0.1} max={1} step={0.05} value={tau}
            onChange={(e) => setTau(Number(e.target.value))} className="w-28" />
          <span className="w-14 font-mono text-zinc-200">{tau.toFixed(2)} m</span>
        </label>
        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-emerald-300">
          v = 2·τ·f = {v.toFixed(1)} m/s ({(v * 3.6).toFixed(0)} km/h)
        </span>
      </div>

      <canvas ref={canvasRef} className="h-52 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) es la MISMA física del campo giratorio (C5·S1), con el estator cortado y estirado: cada
        «vuelta» del campo se convirtió en avanzar dos pasos polares (2τ) por ciclo — de ahí v = 2τf,
        el gemelo lineal de nₛ = 120f/p; (2) sube τ o f y mira el marcador de km/h: con τ = 1 m y
        60 Hz ya vas a 432 km/h — velocidad de maglev, sin una sola pieza girando; (3) piénsalo al
        revés: un motor rotativo es una máquina lineal enrollada para que el «riel» nunca se acabe.
      </footer>
    </div>
  )
}
