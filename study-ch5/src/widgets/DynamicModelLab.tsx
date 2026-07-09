import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: estator azul, rotor rojo, mutuas a/b/c azul/amarillo/aqua */
const COLORS = { stator: '#3987e5', rotor: '#e66767', ma: '#3987e5', mb: '#c98500', mc: '#199e70', grid: '#27272a', muted: '#71717a' }

const M = 1.0 // inductancia mutua máxima (normalizada)
const VIS = 0.7

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

  // --- Izquierda: rotor girando frente al eje del estator ---
  const cx = Math.min(w * 0.22, 130)
  const cy = h / 2
  const R = Math.min(h * 0.36, 92)

  ctx.strokeStyle = COLORS.grid
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, R + 6, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.setLineDash([])

  const arrow = (ang: number, color: string, label: string, len: number) => {
    const x1 = cx + len * Math.cos(ang)
    const y1 = cy - len * Math.sin(ang)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    const a2 = Math.atan2(cy - y1, x1 - cx)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - 10 * Math.cos(a2 - 0.4), y1 + 10 * Math.sin(a2 - 0.4))
    ctx.lineTo(x1 - 10 * Math.cos(a2 + 0.4), y1 + 10 * Math.sin(a2 + 0.4))
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 12px ui-sans-serif'
    ctx.fillText(label, x1 + 4 * Math.cos(ang) + 2, y1 - 4 * Math.sin(ang))
  }
  arrow(0, COLORS.stator, 'eje fase a (estator)', R)
  arrow(theta, COLORS.rotor, 'eje fase a (rotor)', R * 0.86)

  // Arco θ
  ctx.strokeStyle = COLORS.muted
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.42, -theta, 0, theta > 0)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.muted
  ctx.font = 'bold 12px ui-sans-serif'
  ctx.fillText('θ', cx + R * 0.55 * Math.cos(-theta / 2), cy - R * 0.55 * Math.sin(-theta / 2))

  // --- Derecha: las tres mutuas estator_a ↔ rotor_{a,b,c} ---
  const gx0 = cx + R + 34
  const gx1 = w - 12
  const gy = h / 2
  const amp = h * 0.3
  const span = 4 * Math.PI
  const t0 = theta - span * 0.7

  ctx.strokeStyle = COLORS.grid
  ctx.beginPath()
  ctx.moveTo(gx0, gy)
  ctx.lineTo(gx1, gy)
  ctx.stroke()

  const curves: { off: number; color: string; label: string }[] = [
    { off: 0, color: COLORS.ma, label: 'L(sa,ra) = M·cos θ' },
    { off: (2 * Math.PI) / 3, color: COLORS.mb, label: 'L(sa,rb)' },
    { off: -(2 * Math.PI) / 3, color: COLORS.mc, label: 'L(sa,rc)' },
  ]
  for (const c of curves) {
    ctx.strokeStyle = c.color
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = gx0; px <= gx1; px++) {
      const th = t0 + ((px - gx0) / (gx1 - gx0)) * span
      const y = gy - Math.cos(th + c.off) * amp
      if (px === gx0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }
  // Cursor en θ actual
  const cursorX = gx0 + (0.7 * span / span) * (gx1 - gx0)
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
    ctx.arc(cursorX, gy - Math.cos(theta + c.off) * amp, 4, 0, 2 * Math.PI)
    ctx.fill()
  }
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('las 9 mutuas estator-rotor se mueven con θ', gx0, 14)
}

/**
 * Laboratorio — Las inductancias que se mueven.
 * La mutua entre una bobina del estator y una del rotor es M·cos(θ): cambia
 * continuamente al girar el rotor. Eso hace que v = Ri + dλ/dt tenga
 * coeficientes variables en el tiempo — ecuaciones no lineales y acopladas.
 */
export default function DynamicModelLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(0.6)
  const [playing, setPlaying] = useState(true)
  const [thetaDeg, setThetaDeg] = useState(35)

  useEffect(() => {
    if (!playing) thetaRef.current = (thetaDeg * Math.PI) / 180
  }, [thetaDeg, playing])

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) thetaRef.current += VIS * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const th = playing ? null : (thetaDeg * Math.PI) / 180
  const mut = (off: number) => (th !== null ? M * Math.cos(th + off) : null)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Inductancias mutuas que se mueven con el rotor
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className={`flex flex-1 items-center gap-2 ${playing ? 'text-zinc-600' : 'text-zinc-400'}`}>
          θ (posición del rotor)
          <input type="range" min={0} max={360} step={1} value={thetaDeg} disabled={playing}
            onChange={(e) => setThetaDeg(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono">{thetaDeg}°</span>
        </label>
      </div>

      <canvas ref={canvasRef} className="h-64 w-full" />

      {th !== null && (
        <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3 text-center">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
            <p className="text-[10px] text-zinc-500">L(sa,ra)</p>
            <p className="font-mono text-sm font-semibold text-sky-300">{mut(0)!.toFixed(2)} M</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
            <p className="text-[10px] text-zinc-500">L(sa,rb)</p>
            <p className="font-mono text-sm font-semibold text-amber-300">{mut((2 * Math.PI) / 3)!.toFixed(2)} M</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
            <p className="text-[10px] text-zinc-500">L(sa,rc)</p>
            <p className="font-mono text-sm font-semibold text-emerald-300">{mut(-(2 * Math.PI) / 3)!.toFixed(2)} M</p>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Observa: </span>
        cada acoplamiento estator-rotor es M·cos(θ) y cambia a cada instante que el rotor gira. En las
        ecuaciones <span className="font-mono text-zinc-300">v = R·i + dλ/dt</span> con{' '}
        <span className="font-mono text-zinc-300">λ = L(θ)·i</span>, la derivada de un producto donde L
        depende del tiempo genera términos cruzados y no lineales — nueve mutuas moviéndose a la vez.
        Resolver esto directo es una pesadilla: por eso el capítulo inventa un cambio de coordenadas
        (marcos d-q) que congela estas inductancias.
      </footer>
    </div>
  )
}
