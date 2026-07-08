import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'
import { syncSpeedRpm } from '../lib/machine'

type Mode = 'abc' | 'acb' | 'mono'

/** Paleta categórica validada (dataviz, modo oscuro, superficie #09090b) */
const PHASE_COLORS = { a: '#3987e5', b: '#199e70', c: '#c98500' } as const
const RESULT_COLOR = '#fafafa'
const TRAIL_COLOR = '#9085e9'
const GRID = '#27272a'
const MUTED = '#71717a'

/** Frecuencia eléctrica visual [Hz]: el campo real gira a f de red; aquí se ralentiza. */
const VISUAL_HZ = 0.22

interface Phase {
  key: 'a' | 'b' | 'c'
  /** Orientación del eje magnético de la bobina [rad] */
  axis: number
  /** Desfase temporal de su corriente [rad] */
  shift: number
}

function phasesFor(mode: Mode): Phase[] {
  const base: Phase[] = [
    { key: 'a', axis: 0, shift: 0 },
    { key: 'b', axis: (2 * Math.PI) / 3, shift: (-2 * Math.PI) / 3 },
    { key: 'c', axis: (4 * Math.PI) / 3, shift: (2 * Math.PI) / 3 },
  ]
  if (mode === 'acb') {
    // Intercambiar dos fases invierte la secuencia → el campo gira al revés
    base[1].shift = (2 * Math.PI) / 3
    base[2].shift = (-2 * Math.PI) / 3
  }
  return base
}

function draw(canvas: HTMLCanvasElement, thetaE: number, mode: Mode, poles: number) {
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

  const stripH = 110
  const fieldH = h - stripH
  const cx = w / 2
  const cy = fieldH / 2
  const R = Math.min(w, fieldH) * 0.36 // radio correspondiente a FMM = 1.5·Fmax

  const phases = phasesFor(mode)
  const active = mode === 'mono' ? phases.slice(0, 1) : phases
  const current = (p: Phase) => Math.cos(thetaE + p.shift)

  // --- Guías: círculo de amplitud 1.5·Fmax y ejes de bobina ---
  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, 2 * Math.PI)
  ctx.stroke()
  for (const p of phases) {
    ctx.strokeStyle = mode === 'mono' && p.key !== 'a' ? '#1c1c1f' : GRID
    ctx.beginPath()
    ctx.moveTo(cx - R * 1.15 * Math.cos(p.axis), cy + R * 1.15 * Math.sin(p.axis))
    ctx.lineTo(cx + R * 1.15 * Math.cos(p.axis), cy - R * 1.15 * Math.sin(p.axis))
    ctx.stroke()
    // Etiqueta del eje (identidad directa, no solo color)
    ctx.setLineDash([])
    ctx.fillStyle = PHASE_COLORS[p.key]
    ctx.font = 'bold 13px ui-sans-serif'
    ctx.fillText(
      `eje ${p.key}`,
      cx + R * 1.24 * Math.cos(p.axis) - 14,
      cy - R * 1.24 * Math.sin(p.axis) + 4,
    )
    ctx.setLineDash([4, 4])
  }
  ctx.setLineDash([])

  // --- Estela del extremo de la FMM resultante ---
  const resultant = (th: number) => {
    let x = 0
    let y = 0
    for (const p of active) {
      const i = Math.cos(th + p.shift)
      x += i * Math.cos(p.axis)
      y += i * Math.sin(p.axis)
    }
    return { x, y }
  }
  ctx.strokeStyle = TRAIL_COLOR
  ctx.globalAlpha = 0.5
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let k = 0; k <= 90; k++) {
    const r = resultant(thetaE - (k / 90) * Math.PI * 0.9)
    const px = cx + (r.x / 1.5) * R
    const py = cy - (r.y / 1.5) * R
    if (k === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.globalAlpha = 1

  // --- Vectores de FMM por fase ---
  const arrow = (x0: number, y0: number, x1: number, y1: number, color: string, lw: number) => {
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = lw
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    const ang = Math.atan2(y1 - y0, x1 - x0)
    const hd = 4 + lw * 1.6
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 - hd * Math.cos(ang - 0.42), y1 - hd * Math.sin(ang - 0.42))
    ctx.lineTo(x1 - hd * Math.cos(ang + 0.42), y1 - hd * Math.sin(ang + 0.42))
    ctx.closePath()
    ctx.fill()
  }

  for (const p of active) {
    const i = current(p)
    const len = (i / 1.5) * R
    arrow(cx, cy, cx + len * Math.cos(p.axis), cy - len * Math.sin(p.axis), PHASE_COLORS[p.key], 2)
  }

  // --- FMM resultante ---
  const rNow = resultant(thetaE)
  arrow(cx, cy, cx + (rNow.x / 1.5) * R, cy - (rNow.y / 1.5) * R, RESULT_COLOR, 3)
  const mag = Math.hypot(rNow.x, rNow.y)
  ctx.fillStyle = RESULT_COLOR
  ctx.font = 'bold 12px ui-sans-serif'
  ctx.fillText(
    `F resultante = ${mag.toFixed(2)}·Fmax`,
    cx + (rNow.x / 1.5) * R * 0.55 + 10,
    cy - (rNow.y / 1.5) * R * 0.55 - 8,
  )

  // --- Rotor equivalente (velocidad MECÁNICA, depende de p) ---
  if (mode !== 'mono') {
    const dir = mode === 'acb' ? -1 : 1
    const thetaMech = (dir * thetaE) / (poles / 2)
    ctx.strokeStyle = MUTED
    ctx.lineWidth = 2
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + R * 0.45 * Math.cos(thetaMech), cy - R * 0.45 * Math.sin(thetaMech))
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = MUTED
    ctx.font = '10px ui-sans-serif'
    ctx.fillText('rotor (θ mecánico)', cx + 8, cy + R * 0.6)
  }

  // --- Franja inferior: formas de onda de corriente con cursor ---
  const y0 = fieldH + 10
  const midY = y0 + (stripH - 20) / 2
  const ampY = (stripH - 28) / 2
  const spanRad = 4 * Math.PI // dos ciclos visibles
  const t0 = thetaE - spanRad * 0.75

  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(8, midY)
  ctx.lineTo(w - 8, midY)
  ctx.stroke()

  for (const p of active) {
    ctx.strokeStyle = PHASE_COLORS[p.key]
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let px = 8; px <= w - 8; px++) {
      const th = t0 + ((px - 8) / (w - 16)) * spanRad
      const y = midY - Math.cos(th + p.shift) * ampY
      if (px === 8) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }

  // Cursor de tiempo + etiquetas directas i_a, i_b, i_c
  const cursorX = 8 + (0.75 * spanRad / spanRad) * (w - 16)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cursorX, y0 - 4)
  ctx.lineTo(cursorX, y0 + stripH - 24)
  ctx.stroke()
  ctx.font = 'bold 11px ui-sans-serif'
  active.forEach((p) => {
    const y = midY - Math.cos(thetaE + p.shift) * ampY
    ctx.fillStyle = PHASE_COLORS[p.key]
    ctx.beginPath()
    ctx.arc(cursorX, y, 3.5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText(`i${p.key}`, cursorX + 8 + (p.key === 'b' ? 16 : p.key === 'c' ? 32 : 0), y - 4)
  })
  ctx.fillStyle = MUTED
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('corrientes de fase vs. tiempo (el cursor es el instante dibujado arriba)', 10, y0 + stripH - 12)
}

/**
 * Laboratorio 1 — Campo magnético giratorio.
 * Tres bobinas fijas + tres corrientes desfasadas 120° = una FMM de amplitud
 * constante 1.5·Fmax que gira a velocidad síncrona. Permite invertir la
 * secuencia de fases, pasar a modo monofásico y cambiar el número de polos.
 */
export default function RotatingFieldLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const thetaRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [mode, setMode] = useState<Mode>('abc')
  const [poles, setPoles] = useState(2)
  const [f, setF] = useState(60)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) thetaRef.current += 2 * Math.PI * VISUAL_HZ * speed * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, thetaRef.current, mode, poles)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, mode, poles])

  const ns = syncSpeedRpm(f, poles)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Campo magnético giratorio
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <label className="flex items-center gap-2 text-zinc-400">
          Velocidad
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24"
          />
          <span className="w-8 font-mono">{speed}×</span>
        </label>

        <div className="flex items-center gap-1">
          {(
            [
              ['abc', 'Secuencia abc'],
              ['acb', 'Secuencia acb'],
              ['mono', 'Monofásico'],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                mode === m
                  ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-zinc-400">
          Polos
          <select
            value={poles}
            onChange={(e) => setPoles(Number(e.target.value))}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
          >
            {[2, 4, 6, 8].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-zinc-400">
          f
          <select
            value={f}
            onChange={(e) => setF(Number(e.target.value))}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
          >
            <option value={50}>50 Hz</option>
            <option value={60}>60 Hz</option>
          </select>
        </label>

        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-emerald-300">
          nₛ = 120·{f}/{poles} = {ns.toLocaleString('es')} r/min
        </span>
      </div>

      <canvas ref={canvasRef} className="h-105 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) cambia a <span className="text-violet-300">secuencia acb</span> y observa hacia dónde gira ahora la FMM —
        así se invierte el sentido de cualquier motor trifásico, intercambiando dos fases; (2) pasa a{' '}
        <span className="text-violet-300">monofásico</span> y verifica que el campo ya no gira: solo pulsa sobre el
        eje de la fase a (por eso un motor monofásico no arranca solo); (3) sube los{' '}
        <span className="text-violet-300">polos</span> y mira cómo el rotor mecánico (flecha punteada) gira cada vez
        más lento aunque la frecuencia eléctrica no cambie.
      </footer>
    </div>
  )
}
