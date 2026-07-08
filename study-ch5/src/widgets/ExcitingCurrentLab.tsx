import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: B aqua, i amarillo, curva B-H azul */
const COLORS = { bh: '#3987e5', B: '#199e70', i: '#c98500', grid: '#27272a', muted: '#71717a', dot: '#fafafa' }


/** Curva anhistérica: B(H) = tanh(H); su inversa H(B) = atanh(B). */
const hOfB = (B: number): number => Math.atanh(Math.max(-0.999, Math.min(0.999, B / 1.02)))

function draw(canvas: HTMLCanvasElement, phase: number, bMax: number) {
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

  const hMaxPlot = hOfB(Math.min(0.995, bMax)) * 1.15 + 0.4

  // --- Izquierda: curva B-H con punto ---
  const cx = Math.min(w * 0.18, 130)
  const cy = h / 2
  const sx = (Math.min(w * 0.15, 100)) / hMaxPlot
  const sy = h * 0.36

  ctx.strokeStyle = '#3f3f46'
  ctx.beginPath()
  ctx.moveTo(cx - 110, cy); ctx.lineTo(cx + 115, cy)
  ctx.moveTo(cx, cy - sy - 8); ctx.lineTo(cx, cy + sy + 8)
  ctx.stroke()

  ctx.strokeStyle = COLORS.bh
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = -100; i <= 100; i++) {
    const H = (i / 100) * hMaxPlot
    const B = Math.tanh(H) * 1.02
    const x = cx + H * sx
    const y = cy - B * sy
    if (i === -100) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.fillStyle = COLORS.bh
  ctx.font = 'bold 10px ui-sans-serif'
  ctx.fillText('curva B-H (satura)', cx - 104, cy - sy - 12)

  const Bnow = bMax * Math.sin(phase)
  const Hnow = hOfB(Bnow)
  ctx.fillStyle = COLORS.dot
  ctx.beginPath()
  ctx.arc(cx + Hnow * sx, cy - Bnow * sy, 5, 0, 2 * Math.PI)
  ctx.fill()

  // --- Derecha: franjas B(t) e i(t) ---
  const gx0 = cx + 150
  const gx1 = w - 14
  const span = 4 * Math.PI
  const t0 = phase - span * 0.8
  const iMax = Math.abs(hOfB(Math.min(0.995, bMax)))

  const strips: { yMid: number; amp: number; fn: (th: number) => number; color: string; label: string; norm: number }[] = [
    { yMid: h * 0.27, amp: h * 0.17, fn: (th) => bMax * Math.sin(th), color: COLORS.B, label: 'B(t): SENOIDAL — lo impone la tensión (Faraday)', norm: Math.max(bMax, 0.01) },
    { yMid: h * 0.75, amp: h * 0.17, fn: (th) => hOfB(bMax * Math.sin(th)), color: COLORS.i, label: 'i(t) ∝ H(t): PICUDA — la factura de la saturación', norm: Math.max(iMax, 0.01) },
  ]
  for (const s of strips) {
    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gx0, s.yMid); ctx.lineTo(gx1, s.yMid)
    ctx.stroke()
    ctx.strokeStyle = s.color
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = gx0; px <= gx1; px++) {
      const th = t0 + ((px - gx0) / (gx1 - gx0)) * span
      const y = s.yMid - (s.fn(th) / s.norm) * s.amp
      if (px === gx0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
    ctx.fillStyle = s.color
    ctx.font = 'bold 10px ui-sans-serif'
    ctx.fillText(s.label, gx0 + 4, s.yMid - s.amp - 8)
  }

  // Cursor
  const cursorX = gx0 + 0.8 * (gx1 - gx0)
  ctx.strokeStyle = '#fafafa'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(cursorX, strips[0].yMid - strips[0].amp * 1.2)
  ctx.lineTo(cursorX, strips[1].yMid + strips[1].amp * 1.2)
  ctx.stroke()
  ctx.globalAlpha = 1
  for (const s of strips) {
    ctx.fillStyle = s.color
    ctx.beginPath()
    ctx.arc(cursorX, s.yMid - (s.fn(phase) / s.norm) * s.amp, 4, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/** Contenido de 3er armónico de i(t) por Fourier numérica. */
function thirdHarmonic(bMax: number): number {
  const n = 720
  let a1 = 0
  let a3 = 0
  for (let k = 0; k < n; k++) {
    const th = (k / n) * 2 * Math.PI
    const i = hOfB(bMax * Math.sin(th))
    a1 += i * Math.sin(th)
    a3 += i * Math.sin(3 * th)
  }
  return Math.abs(a3 / a1)
}

/**
 * Laboratorio — La corriente de excitación en CA.
 * La red impone la tensión ⇒ Faraday impone un flujo SENOIDAL. Pero la
 * curva B-H no es lineal: para sostener las crestas de B, la corriente
 * debe estirarse hasta la zona saturada — se vuelve picuda y gana
 * armónicos impares (sobre todo el tercero).
 */
export default function ExcitingCurrentLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0.5)
  const [playing, setPlaying] = useState(true)
  const [bMax, setBMax] = useState(0.92)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) phaseRef.current += 2 * Math.PI * 0.22 * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, phaseRef.current, bMax)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, bMax])

  const h3 = thirdHarmonic(bMax)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Magnetización en CA — la corriente que se vuelve picuda
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <label className="flex items-center gap-2 text-zinc-400">
          <span className="font-semibold text-emerald-300">Bmax / Bcodo</span>
          <input type="range" min={0.4} max={0.99} step={0.01} value={bMax}
            onChange={(e) => setBMax(Number(e.target.value))} className="w-40" />
          <span className="w-12 font-mono text-zinc-200">{bMax.toFixed(2)}</span>
        </label>
        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-amber-300">
          3er armónico de i: {(h3 * 100).toFixed(1)}%
        </span>
      </div>

      <canvas ref={canvasRef} className="h-64 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con Bmax bajo (0.4, zona lineal) las dos ondas son gemelas senoidales; súbelo hacia el codo
        y mira a i(t) afilarse: para arrancarle al hierro saturado ese último poco de B, la corriente
        debe dispararse — el punto de la curva B-H lo delata; (2) observa el readout: el 3er armónico
        pasa de ~1% a más de 30% — este armónico es el motivo de los deltas terciarios en
        transformadores y del zumbido a 180 Hz; (3) la moraleja invertible: si en cambio FORZARAS una
        corriente senoidal, sería el FLUJO (y la tensión) quien se deformaría — algo tiene que ceder,
        y la curva B-H decide qué.
      </footer>
    </div>
  )
}
