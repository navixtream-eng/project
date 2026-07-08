import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta categórica validada (dataviz, modo oscuro):
 *  fases a/b/c = azul/aqua/amarillo; ejes d/q = rojo/violeta */
const COLORS = {
  a: '#3987e5',
  b: '#199e70',
  c: '#c98500',
  d: '#e66767',
  q: '#9085e9',
  grid: '#27272a',
  muted: '#71717a',
} as const

const VISUAL_HZ = 0.2

/** Transformación de Park (convención FKU, invariante en amplitud). */
function park(ia: number, ib: number, ic: number, theta: number) {
  const c = (x: number) => Math.cos(x)
  const s = (x: number) => Math.sin(x)
  const T = (2 * Math.PI) / 3
  const id = (2 / 3) * (ia * c(theta) + ib * c(theta - T) + ic * c(theta + T))
  const iq = -(2 / 3) * (ia * s(theta) + ib * s(theta - T) + ic * s(theta + T))
  return { id, iq }
}

function draw(canvas: HTMLCanvasElement, theta: number, phi: number) {
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

  const iabc = (th: number) => {
    const T = (2 * Math.PI) / 3
    return {
      ia: Math.cos(th - phi),
      ib: Math.cos(th - phi - T),
      ic: Math.cos(th - phi + T),
    }
  }

  // --- Izquierda: rotor con ejes d-q y ejes fijos abc ---
  const cx = Math.min(w * 0.19, 150)
  const cy = h / 2
  const R = Math.min(h * 0.33, 86)

  const phaseAxes: { key: 'a' | 'b' | 'c'; ang: number }[] = [
    { key: 'a', ang: 0 },
    { key: 'b', ang: (2 * Math.PI) / 3 },
    { key: 'c', ang: (4 * Math.PI) / 3 },
  ]
  ctx.setLineDash([3, 4])
  for (const p of phaseAxes) {
    ctx.strokeStyle = COLORS.grid
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + R * 1.25 * Math.cos(p.ang), cy - R * 1.25 * Math.sin(p.ang))
    ctx.stroke()
    ctx.fillStyle = COLORS[p.key]
    ctx.font = 'bold 11px ui-sans-serif'
    ctx.fillText(p.key, cx + R * 1.38 * Math.cos(p.ang) - 3, cy - R * 1.38 * Math.sin(p.ang) + 4)
  }
  ctx.setLineDash([])

  const arrow = (ang: number, len: number, color: string, label: string) => {
    const x1 = cx + len * Math.cos(ang)
    const y1 = cy - len * Math.sin(ang)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    const a2 = Math.atan2(cy - y1, x1 - cx)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - 8 * Math.cos(a2 - 0.4), y1 + 8 * Math.sin(a2 - 0.4))
    ctx.lineTo(x1 - 8 * Math.cos(a2 + 0.4), y1 + 8 * Math.sin(a2 + 0.4))
    ctx.closePath()
    ctx.fill()
    ctx.font = 'bold 12px ui-sans-serif'
    ctx.fillText(label, x1 + 6, y1 - 6)
  }

  // Rotor (disco) + ejes d (con el polo) y q (90° eléctricos adelante)
  ctx.fillStyle = '#1c1c1f'
  ctx.strokeStyle = '#3f3f46'
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.62, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  arrow(theta, R, COLORS.d, 'd')
  arrow(theta + Math.PI / 2, R * 0.85, COLORS.q, 'q')
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('los ejes d-q viajan CON el rotor', cx - R, cy + R * 1.45)

  // --- Derecha: dos franjas (abc arriba, dq abajo) ---
  const gx0 = cx + R * 1.9
  const gx1 = w - 14
  const span = 4 * Math.PI
  const t0 = theta - span * 0.8
  const strip = (yMid: number, amp: number) => {
    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(gx0, yMid)
    ctx.lineTo(gx1, yMid)
    ctx.stroke()
    return { yMid, amp }
  }
  const s1 = strip(h * 0.27, h * 0.17)
  const s2 = strip(h * 0.75, h * 0.17)

  // Franja abc
  const seriesAbc: ('a' | 'b' | 'c')[] = ['a', 'b', 'c']
  for (const key of seriesAbc) {
    ctx.strokeStyle = COLORS[key]
    ctx.lineWidth = 1.8
    ctx.beginPath()
    for (let px = gx0; px <= gx1; px++) {
      const th = t0 + ((px - gx0) / (gx1 - gx0)) * span
      const v = iabc(th)[`i${key}` as 'ia' | 'ib' | 'ic']
      const y = s1.yMid - v * s1.amp
      if (px === gx0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }
  ctx.fillStyle = COLORS.muted
  ctx.font = 'bold 10px ui-sans-serif'
  ctx.fillText('vistas desde el ESTATOR: ia, ib, ic — todo oscila', gx0 + 4, s1.yMid - s1.amp - 8)

  // Franja dq (calculada punto a punto con la transformación real)
  const seriesDq: { key: 'id' | 'iq'; color: string }[] = [
    { key: 'id', color: COLORS.d },
    { key: 'iq', color: COLORS.q },
  ]
  for (const sr of seriesDq) {
    ctx.strokeStyle = sr.color
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = gx0; px <= gx1; px++) {
      const th = t0 + ((px - gx0) / (gx1 - gx0)) * span
      const { ia, ib, ic } = iabc(th)
      const v = park(ia, ib, ic, th)[sr.key]
      const y = s2.yMid - v * s2.amp
      if (px === gx0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }
  ctx.fillStyle = COLORS.muted
  ctx.fillText('vistas desde el ROTOR (Park): id, iq — constantes', gx0 + 4, s2.yMid - s2.amp - 8)

  // Cursor + puntos actuales con etiquetas directas
  const cursorX = gx0 + 0.8 * (gx1 - gx0)
  ctx.strokeStyle = '#fafafa'
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(cursorX, s1.yMid - s1.amp * 1.2)
  ctx.lineTo(cursorX, s2.yMid + s2.amp * 1.2)
  ctx.stroke()
  ctx.globalAlpha = 1
  const now = iabc(theta)
  const dqNow = park(now.ia, now.ib, now.ic, theta)
  ctx.font = 'bold 10px ui-sans-serif'
  for (const key of seriesAbc) {
    const v = now[`i${key}` as 'ia' | 'ib' | 'ic']
    ctx.fillStyle = COLORS[key]
    ctx.beginPath()
    ctx.arc(cursorX, s1.yMid - v * s1.amp, 3.5, 0, 2 * Math.PI)
    ctx.fill()
  }
  for (const sr of seriesDq) {
    const v = dqNow[sr.key]
    ctx.fillStyle = sr.color
    ctx.beginPath()
    ctx.arc(cursorX, s2.yMid - v * s2.amp, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText(`${sr.key} = ${v.toFixed(2)}`, cursorX + 10, s2.yMid - v * s2.amp + 3)
  }
}

/**
 * Laboratorio — La transformación de Park (d-q-0).
 * Las mismas tres corrientes balanceadas, vistas desde el estator (oscilan
 * a 60 Hz) y desde un observador montado en el rotor (dos constantes).
 * La transformación no cambia la física: cambia el asiento del observador.
 */
export default function ParkLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(0.5)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [phi, setPhi] = useState(30)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) thetaRef.current += 2 * Math.PI * VISUAL_HZ * speed * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current, (phi * Math.PI) / 180)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, phi])

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · La transformación de Park: subirse al rotor
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
        <label className="flex items-center gap-2 text-zinc-400">
          Ángulo de la corriente φ
          <input type="range" min={-60} max={60} step={1} value={phi}
            onChange={(e) => setPhi(Number(e.target.value))} className="w-32" />
          <span className="w-10 font-mono text-zinc-200">{phi}°</span>
        </label>
      </div>
      <canvas ref={canvasRef} className="h-64 w-full" />
      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) compara las dos franjas: son LAS MISMAS corrientes — arriba oscilan porque el observador
        está quieto; abajo son constantes porque el observador gira con el rotor; (2) mueve φ y observa
        que solo cambian los NIVELES de id/iq (el reparto entre ejes), nunca su forma plana; (3) pausa
        y verifica en el cursor que id² + iq² = |I|² en todo instante: nada se pierde, solo se re-mira.
      </footer>
    </div>
  )
}
