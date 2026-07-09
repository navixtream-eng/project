import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: FEM interna azul, salida CC naranja, campo rojo/azul */
const COLORS = { emf: '#3987e5', out: '#e2761f', N: '#e66767', S: '#3987e5', grid: '#27272a', muted: '#71717a', steel: '#3f3f46' }

const VIS = 0.9

function terminalV(theta: number, K: number): number {
  const seg = Math.PI / K
  const local = ((theta % seg) + seg) % seg - seg / 2
  return Math.abs(Math.cos(local))
}

function draw(canvas: HTMLCanvasElement, theta: number, K: number) {
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

  // --- Izquierda: espira girando entre polos + colector ---
  const cx = Math.min(w * 0.2, 110)
  const cy = h / 2
  const R = Math.min(h * 0.34, 80)

  // Polos N (arriba) y S (abajo)
  ctx.fillStyle = COLORS.N
  ctx.globalAlpha = 0.18
  ctx.fillRect(cx - R - 14, cy - R - 22, 2 * (R + 14), 16)
  ctx.fillStyle = COLORS.S
  ctx.fillRect(cx - R - 14, cy + R + 6, 2 * (R + 14), 16)
  ctx.globalAlpha = 1
  ctx.fillStyle = COLORS.N
  ctx.font = 'bold 12px ui-sans-serif'
  ctx.fillText('N', cx - 5, cy - R - 10)
  ctx.fillStyle = COLORS.S
  ctx.fillText('S', cx - 4, cy + R + 19)

  // Espira (diámetro que gira)
  ctx.strokeStyle = COLORS.steel
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.arc(cx, cy, R + 2, 0, 2 * Math.PI); ctx.stroke()
  ctx.setLineDash([])
  const ex = Math.cos(theta) * R
  const ey = Math.sin(theta) * R
  ctx.strokeStyle = COLORS.emf
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - ex, cy - ey)
  ctx.lineTo(cx + ex, cy + ey)
  ctx.stroke()
  ctx.fillStyle = COLORS.emf
  ctx.beginPath(); ctx.arc(cx + ex, cy + ey, 5, 0, 2 * Math.PI); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(cx - ex, cy - ey, 5, 0, 2 * Math.PI); ctx.fill()

  // Escobillas (arriba/abajo, fijas)
  ctx.fillStyle = COLORS.muted
  ctx.fillRect(cx - 3, cy - R - 4, 6, 8)
  ctx.fillRect(cx - 3, cy + R - 4, 6, 8)
  ctx.font = '9px ui-sans-serif'
  ctx.fillText('escobilla', cx - R, cy + R + 40)

  // --- Derecha: dos gráficas ---
  const gx0 = cx + R + 30
  const gx1 = w - 12
  const midE = h * 0.28
  const midV = h * 0.74
  const amp = h * 0.17
  const win = 4 * Math.PI
  const N = 220
  const t0 = theta - win * 0.8

  const plot = (mid: number, fn: (t: number) => number, color: string, label: string) => {
    ctx.strokeStyle = COLORS.grid
    ctx.beginPath(); ctx.moveTo(gx0, mid); ctx.lineTo(gx1, mid); ctx.stroke()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= N; i++) {
      const t = t0 + (i / N) * win
      const x = gx0 + (i / N) * (gx1 - gx0)
      const y = mid - fn(t) * amp
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 9px ui-sans-serif'
    ctx.fillText(label, gx0 + 2, mid - amp - 4)
  }

  plot(midE, (t) => Math.sin(t), COLORS.emf, 'FEM en la espira (¡alterna!)')
  plot(midV, (t) => terminalV(t, K), COLORS.out, `tensión en escobillas (CC con rizo) · ${K} espira${K > 1 ? 's' : ''}`)
}

/**
 * Laboratorio — La conmutación: rectificación mecánica.
 * La FEM inducida en la espira es ALTERNA; el colector de delgas y las
 * escobillas la voltean cada media vuelta para que en el exterior salga
 * CONTINUA. Con más espiras/delgas, el rizo se alisa.
 */
export default function CommutationLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(0.4)
  const [playing, setPlaying] = useState(true)
  const [K, setK] = useState(1)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) thetaRef.current += VIS * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current, K)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, K])

  const ripple = (1 - Math.cos(Math.PI / (2 * K))) * 100

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El colector: rectificación mecánica de CA a CC
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="font-semibold text-orange-300">Espiras / delgas</span>
          <input type="range" min={1} max={12} step={1} value={K} onChange={(e) => setK(Number(e.target.value))} className="flex-1" />
          <span className="w-8 font-mono text-zinc-200">{K}</span>
        </label>
        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-orange-300">
          rizo ≈ {ripple.toFixed(1)} %
        </span>
      </div>

      <canvas ref={canvasRef} className="h-60 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con 1 espira, la FEM interna (azul) es una senoide pura, pero el colector la voltea cada
        semiciclo: la salida (naranja) es una CC muy «bombeada» (rizo del 100 %); (2) sube el número de
        espiras/delgas: las escobillas siempre tocan la espira que está cerca de su pico, así que la
        salida se aplana y el rizo se desploma — con 12 delgas ya es casi CC pura; (3) la máquina de CC
        NO genera CC por dentro: por dentro TODO es alterna, y el colector es un rectificador mecánico
        sincronizado con el giro.
      </footer>
    </div>
  )
}
