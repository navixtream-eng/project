import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: lazo azul, punto amarillo, marcadores rojo/violeta */
const COLORS = { loop: '#3987e5', dot: '#c98500', br: '#e66767', hc: '#9085e9', grid: '#27272a', muted: '#71717a' }

type Material = 'blando' | 'duro'
/** Modelos didácticos: acero al silicio (blando) vs. material de imán (duro) */
const MATS: Record<Material, { Bsat: number; Hc: number; H0: number; label: string }> = {
  blando: { Bsat: 1.8, Hc: 60, H0: 80, label: 'acero al silicio (máquinas)' },
  duro: { Bsat: 1.3, Hc: 600, H0: 250, label: 'material duro (imanes)' },
}

/** Ramas del lazo: subida y bajada desplazadas ±Hc (modelo tanh didáctico) */
const bUp = (H: number, m: { Bsat: number; Hc: number; H0: number }) => m.Bsat * Math.tanh((H - m.Hc) / m.H0)
const bDn = (H: number, m: { Bsat: number; Hc: number; H0: number }) => m.Bsat * Math.tanh((H + m.Hc) / m.H0)

function draw(canvas: HTMLCanvasElement, phase: number, mat: Material, Hmax: number) {
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

  const m = MATS[mat]
  const cx = w / 2
  const cy = h / 2
  const sx = (w * 0.42) / Hmax
  const sy = (h * 0.4) / 2.0

  // Ejes
  ctx.strokeStyle = '#3f3f46'
  ctx.beginPath()
  ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy)
  ctx.moveTo(cx, 16); ctx.lineTo(cx, h - 16)
  ctx.stroke()
  ctx.fillStyle = COLORS.muted
  ctx.font = '10px ui-sans-serif'
  ctx.fillText('H [A/m]', w - 62, cy - 6)
  ctx.fillText('B [T]', cx + 6, 24)

  // Lazo completo (subida y bajada)
  ctx.strokeStyle = COLORS.loop
  ctx.lineWidth = 2
  for (const [fn, dir] of [[bUp, 1], [bDn, -1]] as const) {
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const H = -Hmax + (i / 100) * Hmax
      const x = cx + H * sx
      const y = cy - fn(H, m) * sy
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    void dir
  }

  // Marcadores Br (remanencia) y Hc (coercitiva)
  const Br = bDn(0, m)
  ctx.fillStyle = COLORS.br
  ctx.beginPath(); ctx.arc(cx, cy - Br * sy, 4.5, 0, 2 * Math.PI); ctx.fill()
  ctx.font = 'bold 11px ui-sans-serif'
  ctx.fillText(`Br = ${Br.toFixed(2)} T (remanencia)`, cx + 8, cy - Br * sy - 6)
  ctx.fillStyle = COLORS.hc
  ctx.beginPath(); ctx.arc(cx - m.Hc * sx, cy, 4.5, 0, 2 * Math.PI); ctx.fill()
  ctx.fillText(`−Hc = ${m.Hc} A/m (coercitiva)`, cx - m.Hc * sx - 60, cy + 18)

  // Punto animado: H(t) = Hmax·sen(fase); rama según la derivada de H
  const H = Hmax * Math.sin(phase)
  const rising = Math.cos(phase) >= 0
  const B = (rising ? bUp : bDn)(H, m)
  ctx.fillStyle = COLORS.dot
  ctx.strokeStyle = '#fafafa'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx + H * sx, cy - B * sy, 6.5, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()

  // Área del lazo sombreada (energía perdida por ciclo)
  ctx.fillStyle = COLORS.loop
  ctx.globalAlpha = 0.08
  ctx.beginPath()
  for (let i = 0; i <= 200; i++) {
    const Hh = -Hmax + (i / 100) * Hmax
    const y = cy - bUp(Hh, m) * sy
    if (i === 0) ctx.moveTo(cx + Hh * sx, y)
    else ctx.lineTo(cx + Hh * sx, y)
  }
  for (let i = 200; i >= 0; i--) {
    const Hh = -Hmax + (i / 100) * Hmax
    ctx.lineTo(cx + Hh * sx, cy - bDn(Hh, m) * sy)
  }
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
}

/** Área del lazo [J/m³ por ciclo] por integración numérica. */
function loopArea(mat: Material, Hmax: number): number {
  const m = MATS[mat]
  let area = 0
  const n = 400
  for (let i = 0; i < n; i++) {
    const H = -Hmax + ((i + 0.5) / n) * 2 * Hmax
    area += (bUp(H, m) - bDn(H, m)) * (2 * Hmax / n)
  }
  return Math.abs(area)
}

/**
 * Laboratorio — El ciclo de histéresis: la memoria del hierro.
 * El punto recorre el lazo una vez por ciclo de la corriente; el ÁREA
 * encerrada es energía convertida en calor en cada vuelta — la pérdida
 * por histéresis. Blando = lazo flaco (máquinas); duro = lazo gordo (imanes).
 */
export default function HysteresisLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [mat, setMat] = useState<Material>('blando')
  const [Hmax, setHmax] = useState(400)

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) phaseRef.current += 2 * Math.PI * 0.25 * dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, phaseRef.current, mat, Hmax)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, mat, Hmax])

  const area = loopArea(mat, Hmax)

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · El ciclo de histéresis — la memoria del hierro
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        {(Object.keys(MATS) as Material[]).map((k) => (
          <button key={k} type="button" onClick={() => { setMat(k); setHmax(k === 'duro' ? 1500 : 400) }}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              mat === k ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {MATS[k].label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-zinc-400">
          Hmax
          <input type="range" min={mat === 'duro' ? 800 : 150} max={mat === 'duro' ? 3000 : 1200} step={10}
            value={Hmax} onChange={(e) => setHmax(Number(e.target.value))} className="w-28" />
          <span className="w-16 font-mono text-zinc-200">{Hmax} A/m</span>
        </label>
        <span className="ml-auto rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-amber-300">
          área ≈ {area.toFixed(0)} J/m³·ciclo
        </span>
      </div>

      <canvas ref={canvasRef} className="h-72 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) pausa cuando H cruza por CERO: B no es cero — eso es la remanencia Br, la «memoria» del
        material (así se fabrica un imán); (2) sigue al punto hasta donde B cruza por cero: la H
        negativa necesaria para borrarlo es la coercitiva Hc; (3) cambia a material DURO: el lazo
        engorda ~50× — pésimo para máquinas de CA (pagarías su área 60 veces por segundo), perfecto
        para imanes permanentes (nadie lo desmagnetiza); (4) el área × frecuencia = pérdida por
        histéresis en W/m³: la primera de las dos facturas del núcleo.
      </footer>
    </div>
  )
}
