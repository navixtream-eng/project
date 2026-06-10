import { useEffect, useRef } from 'react'
import type { SimResult, SimSample } from '../engine/types'
import { toDeg } from '../engine/MathEngine'

interface VectorCanvasProps {
  result: SimResult | null
  /** Tiempo de reproducción actual [s] */
  time: number
}

/** Velocidad visual de giro del campo (Hz). El campo real gira a 60 Hz: aquí se ralentiza para que el ojo lo siga. */
const VISUAL_HZ = 0.4

const COLORS = {
  stator: '#3f3f46', // zinc-700
  statorSlot: '#52525b', // zinc-600
  rotorBody: '#27272a', // zinc-800
  rotorEdge: '#71717a', // zinc-500
  bs: '#38bdf8', // sky-400
  br: '#fbbf24', // amber-400
  deltaArc: '#34d399', // emerald-400
  fault: '#ef4444', // red-500
  text: '#d4d4d8', // zinc-300
  textDim: '#71717a',
}

function sampleAt(result: SimResult, t: number): SimSample {
  const idx = Math.min(
    result.samples.length - 1,
    Math.max(0, Math.round(t / result.config.dt)),
  )
  return result.samples[idx]
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  length: number,
  color: string,
  width: number,
  label: string,
) {
  const tipX = cx + length * Math.cos(angle)
  const tipY = cy - length * Math.sin(angle) // eje y de pantalla invertido

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.shadowColor = color
  ctx.shadowBlur = 12

  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(tipX, tipY)
  ctx.stroke()

  // Punta de flecha
  const head = 12
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(
    tipX - head * Math.cos(angle - 0.4),
    tipY + head * Math.sin(angle - 0.4),
  )
  ctx.lineTo(
    tipX - head * Math.cos(angle + 0.4),
    tipY + head * Math.sin(angle + 0.4),
  )
  ctx.closePath()
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.font = 'bold 14px ui-sans-serif, system-ui'
  ctx.fillText(
    label,
    cx + (length + 22) * Math.cos(angle) - 8,
    cy - (length + 22) * Math.sin(angle) + 5,
  )
  ctx.restore()
}

/** Líneas de flujo del rotor: lóbulos de dipolo rotados al ángulo del campo. */
function drawFluxLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  rRotor: number,
  rStator: number,
  strength: number,
  color: string,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-angle)
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2

  const loops = 4
  for (let i = 1; i <= loops; i++) {
    const f = i / loops
    ctx.globalAlpha = strength * (0.55 - 0.35 * f)
    const rx = rRotor + (rStator - rRotor) * (0.35 + 0.6 * f)
    const ry = rRotor * (0.45 + 0.75 * f)
    // Dos lóbulos simétricos (polo N a la derecha, S a la izquierda)
    ctx.beginPath()
    ctx.ellipse(rx * 0.42, 0, rx * 0.55, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(-rx * 0.42, 0, rx * 0.55, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function draw(canvas: HTMLCanvasElement, result: SimResult | null, time: number) {
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
  const rOuter = Math.min(w, h) * 0.42
  const rInner = rOuter * 0.82
  const rRotor = rOuter * 0.52

  const s = result ? sampleAt(result, time) : null
  const delta0 = result?.init.delta0 ?? 0
  const delta = s?.delta ?? delta0
  const inFault = s?.stage === 'fault' && result?.config.event.type === 'short-circuit'
  const lostSync =
    result !== null &&
    !result.stable &&
    result.lossOfSyncTime !== null &&
    time >= result.lossOfSyncTime

  // Giro visual de referencia (campo del estator)
  const thetaS = 2 * Math.PI * VISUAL_HZ * time
  // El campo del rotor adelanta al del estator en δ (convención generador)
  const thetaR = thetaS + delta

  // --- Anillo de estado ---
  const statusColor = lostSync
    ? COLORS.fault
    : inFault
      ? COLORS.fault
      : s && Math.abs(s.dOmega) > 0.5
        ? '#f59e0b' // amber-500: oscilando
        : '#10b981' // emerald-500: estable
  ctx.save()
  ctx.strokeStyle = statusColor
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 3
  ctx.shadowColor = statusColor
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.arc(cx, cy, rOuter + 10, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // --- Estator: corona con ranuras ---
  ctx.save()
  ctx.fillStyle = COLORS.stator
  ctx.beginPath()
  ctx.arc(cx, cy, rOuter, 0, Math.PI * 2)
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2, true)
  ctx.fill('evenodd')

  const slots = 24
  ctx.fillStyle = COLORS.statorSlot
  for (let i = 0; i < slots; i++) {
    const a = (i / slots) * Math.PI * 2
    const r = (rOuter + rInner) / 2
    ctx.beginPath()
    ctx.arc(cx + r * Math.cos(a), cy - r * Math.sin(a), rOuter * 0.035, 0, Math.PI * 2)
    ctx.fill()
  }

  // Marcas de fases a, b, c (separadas 120°)
  const phaseColors = ['#f87171', '#4ade80', '#60a5fa']
  const phaseNames = ['a', 'b', 'c']
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + Math.PI / 2
    const r = rOuter + 26
    ctx.fillStyle = phaseColors[k]
    ctx.font = 'bold 13px ui-sans-serif'
    ctx.fillText(phaseNames[k], cx + r * Math.cos(a) - 4, cy - r * Math.sin(a) + 4)
  }
  ctx.restore()

  // --- Líneas de flujo (debilitadas durante la falla) ---
  const fluxStrength = inFault ? 0.35 : lostSync ? 0.5 : 1
  drawFluxLines(ctx, cx, cy, thetaR, rRotor, rInner, fluxStrength, inFault ? COLORS.fault : COLORS.br)

  // --- Rotor de polos salientes ---
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-thetaR)
  ctx.fillStyle = COLORS.rotorBody
  ctx.strokeStyle = lostSync ? COLORS.fault : COLORS.rotorEdge
  ctx.lineWidth = 2

  // Cuerpo: eje + dos polos salientes
  const poleW = rRotor * 0.55
  const poleH = rRotor * 0.42
  ctx.beginPath()
  ctx.arc(0, 0, rRotor * 0.45, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  for (const sgn of [1, -1]) {
    ctx.beginPath()
    ctx.roundRect(sgn === 1 ? rRotor * 0.3 : -rRotor * 0.3 - poleW, -poleH / 2, poleW, poleH, 6)
    ctx.fill()
    ctx.stroke()
    // Zapata polar curva
    ctx.beginPath()
    ctx.arc(0, 0, rRotor, sgn === 1 ? -0.45 : Math.PI - 0.45, sgn === 1 ? 0.45 : Math.PI + 0.45)
    ctx.lineWidth = rRotor * 0.16
    ctx.strokeStyle = lostSync ? COLORS.fault : '#3f3f46'
    ctx.stroke()
    ctx.lineWidth = 2
    ctx.strokeStyle = lostSync ? COLORS.fault : COLORS.rotorEdge
  }
  // Polos N / S
  ctx.fillStyle = COLORS.br
  ctx.font = 'bold 13px ui-sans-serif'
  ctx.fillText('N', rRotor * 0.78, 5)
  ctx.fillStyle = COLORS.bs
  ctx.fillText('S', -rRotor * 0.88, 5)
  ctx.restore()

  // --- Arco del ángulo de carga δ entre Bs y Br ---
  if (Math.abs(delta) > 0.02) {
    ctx.save()
    ctx.strokeStyle = COLORS.deltaArc
    ctx.fillStyle = COLORS.deltaArc
    ctx.lineWidth = 2.5
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    // canvas: ángulos positivos del modelo son antihorarios → negativos en pantalla
    ctx.arc(cx, cy, rRotor * 1.35, -thetaR, -thetaS, false)
    ctx.stroke()
    ctx.setLineDash([])
    const mid = (thetaS + thetaR) / 2
    ctx.font = 'bold 15px ui-sans-serif'
    ctx.fillText(
      `δ = ${toDeg(delta).toFixed(1)}°`,
      cx + rRotor * 1.62 * Math.cos(mid) - 24,
      cy - rRotor * 1.62 * Math.sin(mid) + 5,
    )
    ctx.restore()
  }

  // --- Vectores de campo ---
  const bsLen = rInner * (inFault ? 0.45 : 0.95) // Vt colapsa durante la falla
  drawArrow(ctx, cx, cy, thetaS, bsLen, inFault ? '#7dd3fc55' : COLORS.bs, 3.5, 'Bs')
  drawArrow(ctx, cx, cy, thetaR, rInner * 0.95, lostSync ? COLORS.fault : COLORS.br, 3.5, 'Br')

  // --- Lecturas numéricas ---
  ctx.save()
  ctx.font = '12px ui-monospace, monospace'
  ctx.fillStyle = COLORS.text
  const lines = s
    ? [
        `t  = ${time.toFixed(2)} s`,
        `δ  = ${toDeg(s.delta).toFixed(1)}°`,
        `Δω = ${s.dOmega.toFixed(2)} rad/s`,
        `Pe = ${s.Pe.toFixed(3)} pu`,
        `Pm = ${s.Pm.toFixed(3)} pu`,
      ]
    : ['Presiona «Simular» para iniciar']
  lines.forEach((l, i) => ctx.fillText(l, 12, 20 + i * 17))

  if (lostSync) {
    ctx.fillStyle = COLORS.fault
    ctx.font = 'bold 16px ui-sans-serif'
    ctx.fillText('⚠ PÉRDIDA DE SINCRONISMO', cx - 120, h - 16)
  } else if (inFault) {
    ctx.fillStyle = COLORS.fault
    ctx.font = 'bold 14px ui-sans-serif'
    ctx.fillText('FALLA TRIFÁSICA ACTIVA — Vt ≈ 0', cx - 110, h - 16)
  }
  ctx.restore()
}

/**
 * Visión física inmersiva: estator, rotor de polos salientes, vectores de campo
 * giratorio Bs (estator) y Br (rotor), y el ángulo de carga δ como desfase
 * geométrico entre ambos. El giro se ralentiza ~150× para ser observable.
 */
export default function VectorCanvas({ result, time }: VectorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) draw(canvas, result, time)
  }, [result, time])

  // Redibujar al cambiar el tamaño del contenedor
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => draw(canvas, result, time))
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [result, time])

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 text-[10px] leading-relaxed text-zinc-400 backdrop-blur">
        <p><span className="font-bold text-sky-400">Bs</span>: campo giratorio del estator (≡ tensión Vt)</p>
        <p><span className="font-bold text-amber-400">Br</span>: campo del rotor (≡ FEM interna E′q)</p>
        <p><span className="font-bold text-emerald-400">δ</span>: ángulo de carga — Br adelanta a Bs al generar</p>
        <p className="mt-1 italic text-zinc-500">Giro ralentizado ~150× para visualización</p>
      </div>
    </div>
  )
}
