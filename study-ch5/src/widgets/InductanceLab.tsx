import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta categórica validada (dataviz, modo oscuro): par azul/amarillo */
const COLORS = {
  laf: '#3987e5', // enlace de flujo λaf ∝ Laf(θ)
  emf: '#c98500', // FEM inducida e = −dλaf/dt
  grid: '#27272a',
  muted: '#71717a',
  rotor: '#e66767',
  coil: '#199e70',
} as const

/** Velocidad visual del rotor [Hz] (el real gira a f de red) */
const VISUAL_HZ = 0.18

function draw(canvas: HTMLCanvasElement, theta: number) {
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

  // --- Izquierda: rotor frente a la bobina de la fase a ---
  const cx = Math.min(w * 0.22, 170)
  const cy = h / 2
  const R = Math.min(h * 0.34, 92)

  // Estator: eje de la bobina de fase a (horizontal)
  ctx.strokeStyle = COLORS.grid
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(cx - R * 1.5, cy)
  ctx.lineTo(cx + R * 1.5, cy)
  ctx.stroke()
  ctx.setLineDash([])
  // Lados de la bobina a (arriba/abajo, plano perpendicular a su eje)
  ctx.fillStyle = COLORS.coil
  for (const s of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(cx, cy + s * R * 1.18, 7, 0, 2 * Math.PI)
    ctx.fill()
  }
  ctx.font = 'bold 12px ui-sans-serif'
  ctx.fillText('bobina a', cx + 12, cy - R * 1.18 - 10)
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('eje magnético de la fase a', cx + R * 0.42, cy - 6)

  // Rotor: barra imantada girando (θme medido desde el eje de la fase a)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-theta)
  ctx.fillStyle = '#27272a'
  ctx.strokeStyle = COLORS.rotor
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect(-R * 0.92, -R * 0.3, R * 1.84, R * 0.6, 12)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = COLORS.rotor
  ctx.font = 'bold 13px ui-sans-serif'
  ctx.fillText('N', R * 0.68, 5)
  ctx.fillStyle = '#3987e5'
  ctx.fillText('S', -R * 0.8, 5)
  // Flecha del eje del rotor
  ctx.strokeStyle = COLORS.rotor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(R * 1.28, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(R * 1.28, 0)
  ctx.lineTo(R * 1.12, -6)
  ctx.lineTo(R * 1.12, 6)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Arco del ángulo θme
  ctx.strokeStyle = COLORS.muted
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.55, 0, -theta, theta > 0)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.muted
  ctx.font = 'bold 12px ui-sans-serif'
  const mid = -theta / 2
  ctx.fillText('θme', cx + R * 0.7 * Math.cos(mid) - 10, cy + R * 0.7 * Math.sin(mid) + 4)

  // --- Derecha: Laf(θ) = L·cos θ y e(θ) ∝ sen θ ---
  const gx0 = cx + R * 1.75
  const gx1 = w - 16
  const gy = h / 2
  const amp = h * 0.3
  const span = 4 * Math.PI
  const t0 = theta - span * 0.8

  ctx.strokeStyle = COLORS.grid
  ctx.beginPath()
  ctx.moveTo(gx0, gy)
  ctx.lineTo(gx1, gy)
  ctx.stroke()

  const curves: { fn: (th: number) => number; color: string; label: string; ly: number }[] = [
    { fn: Math.cos, color: COLORS.laf, label: 'λaf ∝ Laf(θ) = L·cos θ', ly: 18 },
    { fn: Math.sin, color: COLORS.emf, label: 'eaf = −dλaf/dt ∝ sen θ', ly: 34 },
  ]
  for (const c of curves) {
    ctx.strokeStyle = c.color
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = gx0; px <= gx1; px++) {
      const th = t0 + ((px - gx0) / (gx1 - gx0)) * span
      const y = gy - c.fn(th) * amp
      if (px === gx0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
    ctx.fillStyle = c.color
    ctx.font = 'bold 11px ui-sans-serif'
    ctx.fillText(c.label, gx0 + 4, c.ly)
  }

  // Cursor: el instante dibujado a la izquierda
  const cursorX = gx0 + (0.8 * span / span) * (gx1 - gx0)
  ctx.strokeStyle = '#fafafa'
  ctx.globalAlpha = 0.35
  ctx.beginPath()
  ctx.moveTo(cursorX, gy - amp * 1.15)
  ctx.lineTo(cursorX, gy + amp * 1.15)
  ctx.stroke()
  ctx.globalAlpha = 1
  for (const c of curves) {
    ctx.fillStyle = c.color
    ctx.beginPath()
    ctx.arc(cursorX, gy - c.fn(theta) * amp, 4.5, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/**
 * Mini-laboratorio — La inductancia mutua estator-rotor Laf(θ).
 * El acople entre el devanado de campo y la bobina de la fase a varía con
 * el coseno del ángulo del rotor; su derivada temporal (con el rotor
 * girando) es la FEM interna — 90° desfasada, como todo par flujo/tensión.
 */
export default function InductanceLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(0.6)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) thetaRef.current += 2 * Math.PI * VISUAL_HZ * speed * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Mini-laboratorio · La mutua Laf(θ) y el nacimiento de la FEM
        </h4>
      </header>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className="flex items-center gap-2 text-zinc-400">
          Velocidad
          <input type="range" min={0.25} max={3} step={0.25} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))} className="w-24" />
          <span className="w-8 font-mono">{speed}×</span>
        </label>
      </div>
      <canvas ref={canvasRef} className="h-56 w-full" />
      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Observa: </span>
        el acople rotor-bobina es máximo cuando el polo N apunta al eje de la fase a (cos θ = 1) y nulo
        a 90°; la FEM inducida (amarilla) es su derivada cambiada de signo: máxima justo cuando el flujo
        CRUZA por cero — ahí es donde cambia más rápido. Congela la animación y verifica el desfase de
        90° entre las dos curvas: es el mismo j del circuito equivalente.
      </footer>
    </div>
  )
}
