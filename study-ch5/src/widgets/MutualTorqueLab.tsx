import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'
import { mutualTorque } from '../lib/machine'

/** Paleta validada: estator azul, rotor rojo, par amarillo, Lsr aqua */
const COLORS = { stator: '#3987e5', rotor: '#e66767', torque: '#c98500', lsr: '#199e70', grid: '#27272a', muted: '#71717a' }

const M = 0.4 // inductancia mutua máxima [H]

function draw(canvas: HTMLCanvasElement, theta: number, is: number, ir: number, freeSpin: boolean) {
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

  // --- Izquierda: estator (fijo, horizontal) + rotor (θ) ---
  const cx = Math.min(w * 0.24, 150)
  const cy = h / 2
  const R = Math.min(h * 0.34, 92)

  ctx.strokeStyle = COLORS.grid
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, R + 8, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.setLineDash([])

  const arrow = (ang: number, len: number, color: string, label: string, lw = 3) => {
    const x1 = cx + len * Math.cos(ang)
    const y1 = cy - len * Math.sin(ang)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    const a2 = Math.atan2(cy - y1, x1 - cx)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - 9 * Math.cos(a2 - 0.4), y1 + 9 * Math.sin(a2 - 0.4))
    ctx.lineTo(x1 - 9 * Math.cos(a2 + 0.4), y1 + 9 * Math.sin(a2 + 0.4))
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 12px ui-sans-serif'
    ctx.fillText(label, x1 + 6 * Math.cos(ang) + 4, y1 - 6 * Math.sin(ang))
  }

  // Estator: campo horizontal (θ = 0)
  arrow(0, R, COLORS.stator, 'Fs')
  // Rotor
  arrow(theta, R * 0.9, COLORS.rotor, 'Fr')

  // Arco θ
  if (Math.abs(theta) > 0.03) {
    ctx.strokeStyle = COLORS.torque
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.4, -theta, 0, theta > 0)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = COLORS.torque
    ctx.font = 'bold 12px ui-sans-serif'
    ctx.fillText('θ', cx + R * 0.5 * Math.cos(-theta / 2), cy - R * 0.5 * Math.sin(-theta / 2))
  }
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText(freeSpin ? 'rotor libre → busca alinearse' : 'θ fijo por el slider', cx - R, cy + R + 26)

  // --- Derecha: curvas Lsr(θ) y T(θ) ---
  const gx0 = cx + R + 40
  const gx1 = w - 16
  const midL = h * 0.28
  const midT = h * 0.72
  const amp = h * 0.16
  const span = 2 * Math.PI // −180° a 180°

  for (const [mid, label] of [[midL, 'Lsr(θ) = M·cos θ'], [midT, 'T(θ) = −M·is·ir·sen θ']] as [number, string][]) {
    ctx.strokeStyle = COLORS.grid
    ctx.beginPath()
    ctx.moveTo(gx0, mid)
    ctx.lineTo(gx1, mid)
    ctx.stroke()
    ctx.strokeStyle = COLORS.grid
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo((gx0 + gx1) / 2, mid - amp * 1.2)
    ctx.lineTo((gx0 + gx1) / 2, mid + amp * 1.2)
    ctx.stroke()
    ctx.setLineDash([])
    void label
  }

  // Lsr(θ) = M cos θ (normalizada a M)
  ctx.strokeStyle = COLORS.lsr
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let px = gx0; px <= gx1; px++) {
    const th = -Math.PI + ((px - gx0) / (gx1 - gx0)) * span
    const y = midL - Math.cos(th) * amp
    if (px === gx0) ctx.moveTo(px, y)
    else ctx.lineTo(px, y)
  }
  ctx.stroke()
  ctx.fillStyle = COLORS.lsr
  ctx.font = 'bold 10px ui-sans-serif'
  ctx.fillText('Lsr(θ) = M·cos θ', gx0 + 4, midL - amp - 6)

  // T(θ) = −sen θ (normalizada al par máximo)
  ctx.strokeStyle = COLORS.torque
  ctx.beginPath()
  for (let px = gx0; px <= gx1; px++) {
    const th = -Math.PI + ((px - gx0) / (gx1 - gx0)) * span
    const y = midT + Math.sin(th) * amp
    if (px === gx0) ctx.moveTo(px, y)
    else ctx.lineTo(px, y)
  }
  ctx.stroke()
  ctx.fillStyle = COLORS.torque
  ctx.fillText('T(θ) = −M·is·ir·sen θ', gx0 + 4, midT - amp - 6)

  // Cursor en el θ actual
  const cursorX = gx0 + ((theta + Math.PI) / span) * (gx1 - gx0)
  ctx.strokeStyle = '#fafafa'
  ctx.globalAlpha = 0.35
  ctx.beginPath()
  ctx.moveTo(cursorX, midL - amp * 1.2)
  ctx.lineTo(cursorX, midT + amp * 1.2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = COLORS.lsr
  ctx.beginPath(); ctx.arc(cursorX, midL - Math.cos(theta) * amp, 4, 0, 2 * Math.PI); ctx.fill()
  ctx.fillStyle = COLORS.torque
  ctx.beginPath(); ctx.arc(cursorX, midT + Math.sin(theta) * amp, 4, 0, 2 * Math.PI); ctx.fill()
  void is; void ir
}

/**
 * Laboratorio — Par por inductancia mutua (doble excitación).
 * Dos bobinas (estator is, rotor ir) con mutua Lsr(θ) = M·cos θ. El par
 * sale de derivar la coenergía respecto al ángulo: T = is·ir·dLsr/dθ =
 * −M·is·ir·sen θ — máximo en cuadratura, nulo (y estable) alineados.
 */
export default function MutualTorqueLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(1.0)
  const omegaRef = useRef(0)
  const [thetaDeg, setThetaDeg] = useState(60)
  const [is, setIs] = useState(3)
  const [ir, setIr] = useState(3)
  const [freeSpin, setFreeSpin] = useState(false)

  useEffect(() => {
    if (!freeSpin) thetaRef.current = (thetaDeg * Math.PI) / 180
  }, [thetaDeg, freeSpin])

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.05, (now - last) / 1000)
      last = now
      if (freeSpin) {
        // Dinámica de segundo orden con amortiguamiento: el rotor oscila hacia θ=0
        const T = mutualTorque(M, is, ir, thetaRef.current)
        omegaRef.current += (T * 4 - omegaRef.current * 1.2) * dt
        thetaRef.current += omegaRef.current * dt
      }
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current, is, ir, freeSpin)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [is, ir, freeSpin])

  const T = mutualTorque(M, is, ir, (freeSpin ? thetaRef.current : (thetaDeg * Math.PI) / 180))

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Par por inductancia mutua — dos campos que se alinean
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => { setFreeSpin((v) => !v); omegaRef.current = 0 }}
          className={`flex h-7 items-center gap-1.5 rounded-full px-3 font-semibold ${
            freeSpin ? 'bg-emerald-600 text-white' : 'border border-zinc-700 text-zinc-300'
          }`}>
          {freeSpin ? <Pause size={12} /> : <Play size={12} />}
          {freeSpin ? 'rotor libre' : 'soltar rotor'}
        </button>
        <label className={`flex items-center gap-2 ${freeSpin ? 'text-zinc-600' : 'text-zinc-400'}`}>
          θ
          <input type="range" min={-180} max={180} step={1} value={thetaDeg} disabled={freeSpin}
            onChange={(e) => setThetaDeg(Number(e.target.value))} className="w-32" />
          <span className="w-10 font-mono">{thetaDeg}°</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          is
          <input type="range" min={0.5} max={5} step={0.1} value={is}
            onChange={(e) => setIs(Number(e.target.value))} className="w-20" />
          <span className="w-10 font-mono text-zinc-200">{is.toFixed(1)} A</span>
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          ir
          <input type="range" min={0.5} max={5} step={0.1} value={ir}
            onChange={(e) => setIr(Number(e.target.value))} className="w-20" />
          <span className="w-10 font-mono text-zinc-200">{ir.toFixed(1)} A</span>
        </label>
        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-amber-300">
          T = {T.toFixed(2)} N·m
        </span>
      </div>

      <canvas ref={canvasRef} className="h-64 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) pulsa «soltar rotor»: sin importar dónde empiece, oscila y se detiene en θ = 0 — los dos
        campos QUIEREN alinearse (par restaurador, T ∝ −sen θ); (2) el par es máximo en θ = ±90°
        (cuadratura) y cero alineados — exactamente la ley T ∝ sen δ del par de alineación del Cap. 4,
        aquí DEDUCIDA de la energía; (3) sube is o ir y mira crecer el par proporcionalmente:
        T = is·ir·dLsr/dθ — hacen falta AMBAS corrientes, y lo que produce par es la VARIACIÓN de la
        mutua con el ángulo, no la mutua misma.
      </footer>
    </div>
  )
}
