import { useEffect, useRef, useState } from 'react'
import { FlaskConical } from 'lucide-react'

/** Paleta validada: escalón azul, fundamental amarilla */
const COLORS = { stair: '#3987e5', fund: '#c98500', grid: '#27272a', muted: '#71717a', slot: '#199e70' }

/** Factor de distribución kd = sen(q·γ/2) / (q·sen(γ/2)), banda de fase de 60°. */
const kd = (q: number): number => {
  const gamma = Math.PI / 3 / q // γ = 60°/q en radianes
  return Math.sin((q * gamma) / 2) / (q * Math.sin(gamma / 2))
}

function draw(canvas: HTMLCanvasElement, q: number, onlyFund: boolean) {
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

  const x0 = 40
  const x1 = w - 16
  const yMid = h / 2
  const amp = h * 0.33

  const gamma = Math.PI / 3 / q
  const shifts = Array.from({ length: q }, (_, k) => (k - (q - 1) / 2) * gamma)

  // FMM de una bobina de paso completo: onda cuadrada ±1 (por unidad de Ni/2)
  const sq = (th: number, phi: number): number => {
    let d = ((th - phi) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
    return d < Math.PI / 2 || d > (3 * Math.PI) / 2 ? 1 : -1
  }
  const stair = (th: number): number => shifts.reduce((s, phi) => s + sq(th, phi), 0) / q
  const fundAmp = (4 / Math.PI) * kd(q)
  const fund = (th: number): number => fundAmp * Math.cos(th)

  // Ejes
  ctx.strokeStyle = COLORS.grid
  ctx.beginPath()
  ctx.moveTo(x0, yMid)
  ctx.lineTo(x1, yMid)
  ctx.stroke()
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ;[0, 90, 180, 270, 360].forEach((deg) => {
    const x = x0 + (deg / 360) * (x1 - x0)
    ctx.fillText(`${deg}°`, x - 8, yMid + amp * 1.32)
    ctx.strokeStyle = COLORS.grid
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(x, yMid - amp * 1.15)
    ctx.lineTo(x, yMid + amp * 1.15)
    ctx.stroke()
    ctx.setLineDash([])
  })

  // Posiciones de ranura (lados de bobina) de esta fase
  for (const phi of shifts) {
    for (const off of [Math.PI / 2, (3 * Math.PI) / 2]) {
      const th = phi + off
      const x = x0 + (((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * (x1 - x0)
      ctx.fillStyle = COLORS.slot
      ctx.beginPath()
      ctx.arc(x, yMid + amp * 1.22, 3.5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
  ctx.fillStyle = COLORS.slot
  ctx.fillText('ranuras de la fase', x0 + 2, yMid + amp * 1.26)

  // Escalonada
  if (!onlyFund) {
    ctx.strokeStyle = COLORS.stair
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = x0; px <= x1; px++) {
      const th = ((px - x0) / (x1 - x0)) * 2 * Math.PI - Math.PI
      const y = yMid - stair(th) * amp
      if (px === x0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }

  // Fundamental
  ctx.strokeStyle = COLORS.fund
  ctx.lineWidth = 2.2
  ctx.beginPath()
  for (let px = x0; px <= x1; px++) {
    const th = ((px - x0) / (x1 - x0)) * 2 * Math.PI - Math.PI
    const y = yMid - fund(th) * amp
    if (px === x0) ctx.moveTo(px, y)
    else ctx.lineTo(px, y)
  }
  ctx.stroke()

  // Etiquetas directas
  ctx.font = 'bold 11px ui-sans-serif'
  if (!onlyFund) {
    ctx.fillStyle = COLORS.stair
    ctx.fillText('FMM escalonada real', x0 + 4, yMid - amp * 1.18)
  }
  ctx.fillStyle = COLORS.fund
  ctx.fillText(`fundamental (∝ kd = ${kd(q).toFixed(3)})`, x0 + 4, yMid - amp * 1.02)
}

/**
 * Laboratorio — FMM de un devanado distribuido (una fase, corriente CD de
 * foto). Cada bobina aporta un escalón; distribuirlas suaviza la escalera
 * hacia la sinusoide. El precio: el factor de distribución kd < 1.
 */
export default function DistributedMmfLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [q, setQ] = useState(1)
  const [onlyFund, setOnlyFund] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) draw(canvas, q, onlyFund)
    const obs = new ResizeObserver(() => canvas && draw(canvas, q, onlyFund))
    if (canvas) obs.observe(canvas)
    return () => obs.disconnect()
  }, [q, onlyFund])

  // THD aproximado numérico de la escalera
  const gamma = Math.PI / 3 / q
  const shifts = Array.from({ length: q }, (_, k) => (k - (q - 1) / 2) * gamma)
  const sq = (th: number, phi: number): number => {
    const d = (((th - phi) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    return d < Math.PI / 2 || d > (3 * Math.PI) / 2 ? 1 : -1
  }
  let sTot = 0
  let sFund = 0
  const A1 = (4 / Math.PI) * kd(q)
  for (let i = 0; i < 720; i++) {
    const th = (i / 720) * 2 * Math.PI
    const f = shifts.reduce((s, phi) => s + sq(th, phi), 0) / q
    const g = A1 * Math.cos(th)
    sTot += (f - g) * (f - g)
    sFund += g * g
  }
  const thd = Math.sqrt(sTot / sFund)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · FMM de un devanado distribuido — de la escalera a la sinusoide
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-sky-300">q · bobinas por polo y fase</span>
          <input type="range" min={1} max={6} step={1} value={q}
            onChange={(e) => setQ(Number(e.target.value))} className="w-36" />
          <span className="w-6 font-mono text-zinc-200">{q}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input type="checkbox" checked={onlyFund} onChange={(e) => setOnlyFund(e.target.checked)}
            className="h-3.5 w-3.5 accent-amber-500" />
          Ver solo la fundamental
        </label>
      </div>

      <canvas ref={canvasRef} className="h-64 w-full" />

      <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-900/40 p-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">kd (factor de distribución)</p>
          <p className="font-mono text-sm font-semibold text-amber-300">{kd(q).toFixed(3)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Distorsión residual</p>
          <p className={`font-mono text-sm font-semibold ${thd < 0.15 ? 'text-emerald-300' : 'text-zinc-100'}`}>
            {(thd * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ranuras usadas</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{2 * q} por polo·fase</p>
        </div>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con q = 1 la FMM es una onda CUADRADA (bobina concentrada): llena de armónicos que solo
        producen pérdidas y ruido; sube q y mira la escalera abrazar a la sinusoide — la distorsión
        de UNA fase cae de ~48% a ~25%, y las tres fases juntas rematan el trabajo (los armónicos
        triples se cancelan solos en el campo giratorio); (2) observa el precio en kd: distribuir las bobinas «desalinea»
        sus aportes y la fundamental pierde un pequeño factor (0.966 con q = 2, 0.958 con q → ∞) —
        un descuento que los diseñadores pagan gustosos a cambio de matar los armónicos; (3) este kd
        es exactamente el «kw» que multiplicará al voltaje generado en la Sección 3.
      </footer>
    </div>
  )
}
