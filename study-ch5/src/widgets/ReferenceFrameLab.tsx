import { useEffect, useRef, useState } from 'react'
import { FlaskConical, Pause, Play } from 'lucide-react'

/** Paleta validada: vector violeta, eje d azul, eje q amarillo, fases a/b/c */
const COLORS = { vec: '#9085e9', d: '#3987e5', q: '#c98500', a: '#3987e5', b: '#c98500', c: '#199e70', grid: '#27272a', muted: '#71717a' }

type Frame = 'estacionario' | 'rotor' | 'sincrono'
const WE = 1.5 // velocidad eléctrica visual [rad/s]
const S = 0.12 // deslizamiento para el marco del rotor

function frameSpeed(kind: Frame): number {
  if (kind === 'estacionario') return 0
  if (kind === 'rotor') return (1 - S) * WE
  return WE
}

function draw(canvas: HTMLCanvasElement, t: number, kind: Frame) {
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

  const wf = frameSpeed(kind)
  const angE = WE * t
  const angF = wf * t
  const beat = angE - angF

  // --- Izquierda: vector de corriente y ejes d-q ---
  const cx = Math.min(w * 0.2, 118)
  const cy = h / 2
  const R = Math.min(h * 0.36, 88)

  ctx.strokeStyle = COLORS.grid
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.arc(cx, cy, R + 4, 0, 2 * Math.PI); ctx.stroke()
  ctx.setLineDash([])

  const axis = (ang: number, color: string, label: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(cx - R * Math.cos(ang), cy + R * Math.sin(ang))
    ctx.lineTo(cx + R * Math.cos(ang), cy - R * Math.sin(ang))
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.fillStyle = color
    ctx.font = 'bold 11px ui-sans-serif'
    ctx.fillText(label, cx + (R + 8) * Math.cos(ang), cy - (R + 8) * Math.sin(ang))
  }
  axis(angF, COLORS.d, 'd')
  axis(angF + Math.PI / 2, COLORS.q, 'q')

  // Vector de corriente (a angE)
  const vx = cx + R * 0.85 * Math.cos(angE)
  const vy = cy - R * 0.85 * Math.sin(angE)
  ctx.strokeStyle = COLORS.vec
  ctx.fillStyle = COLORS.vec
  ctx.lineWidth = 3.5
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vx, vy); ctx.stroke()
  const a2 = Math.atan2(cy - vy, vx - cx)
  ctx.beginPath()
  ctx.moveTo(vx, vy)
  ctx.lineTo(vx - 10 * Math.cos(a2 - 0.4), vy + 10 * Math.sin(a2 - 0.4))
  ctx.lineTo(vx - 10 * Math.cos(a2 + 0.4), vy + 10 * Math.sin(a2 + 0.4))
  ctx.closePath(); ctx.fill()

  // Proyecciones id (sobre d) e iq (sobre q)
  const id = 0.85 * Math.cos(beat)
  const iq = 0.85 * Math.sin(beat)
  const dx = cx + R * id * Math.cos(angF)
  const dy = cy - R * id * Math.sin(angF)
  const qx = cx + R * iq * Math.cos(angF + Math.PI / 2)
  const qy = cy - R * iq * Math.sin(angF + Math.PI / 2)
  ctx.setLineDash([2, 2]); ctx.lineWidth = 1.4
  ctx.strokeStyle = COLORS.d
  ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(dx, dy); ctx.stroke()
  ctx.strokeStyle = COLORS.q
  ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(qx, qy); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.muted
  ctx.font = '9px ui-sans-serif'
  ctx.fillText('vector de corriente', cx - R, cy + R + 18)

  // --- Derecha: dos gráficas apiladas ---
  const gx0 = cx + R + 26
  const gx1 = w - 10
  const midT = h * 0.28
  const midB = h * 0.74
  const amp = h * 0.17
  const win = 8 // segundos visibles
  const N = 160

  const plot = (mid: number, fns: { fn: (tau: number) => number; color: string }[], label: string) => {
    ctx.strokeStyle = COLORS.grid
    ctx.beginPath(); ctx.moveTo(gx0, mid); ctx.lineTo(gx1, mid); ctx.stroke()
    for (const f of fns) {
      ctx.strokeStyle = f.color
      ctx.lineWidth = 1.8
      ctx.beginPath()
      for (let i = 0; i <= N; i++) {
        const tau = t - win + (i / N) * win
        const x = gx0 + (i / N) * (gx1 - gx0)
        const y = mid - f.fn(tau) * amp
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = COLORS.muted
    ctx.font = 'bold 9px ui-sans-serif'
    ctx.fillText(label, gx0 + 2, mid - amp - 4)
  }

  plot(midT, [
    { fn: (tau) => Math.cos(WE * tau), color: COLORS.a },
    { fn: (tau) => Math.cos(WE * tau - (2 * Math.PI) / 3), color: COLORS.b },
    { fn: (tau) => Math.cos(WE * tau + (2 * Math.PI) / 3), color: COLORS.c },
  ], 'fases abc (siempre alternas)')

  plot(midB, [
    { fn: (tau) => Math.cos((WE - wf) * tau), color: COLORS.d },
    { fn: (tau) => Math.sin((WE - wf) * tau), color: COLORS.q },
  ], kind === 'sincrono' ? 'd-q: ¡constantes (CD)!' : 'd-q (alternas a ω_e − ω_marco)')
}

/**
 * Laboratorio — Teoría de marcos de referencia.
 * El mismo vector de corriente girando, visto desde tres marcos distintos.
 * En el marco SÍNCRONO (ejes que giran con el campo), las corrientes alternas
 * se vuelven CONSTANTES — el truco que hace posible el control moderno.
 */
export default function ReferenceFrameLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const [playing, setPlaying] = useState(true)
  const [frame, setFrame] = useState<Frame>('sincrono')

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (playing) tRef.current += dt
      const canvas = canvasRef.current
      if (canvas) draw(canvas, tRef.current, frame)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, frame])

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Marcos de referencia: cómo la CA se vuelve CD
        </h4>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <button type="button" onClick={() => setPlaying((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
          aria-label={playing ? 'Pausar' : 'Reproducir'}>
          {playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
        </button>
        <span className="mr-1 font-semibold text-zinc-400">Marco d-q:</span>
        {(
          [
            ['estacionario', 'Estacionario (ω=0)'],
            ['rotor', 'Rotor (ω=ωᵣ)'],
            ['sincrono', 'Síncrono (ω=ωₑ)'],
          ] as [Frame, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setFrame(k)}
            className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
              frame === k ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="h-64 w-full" />

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) empieza en <span className="text-violet-300">Estacionario</span>: los ejes d-q están
        quietos y las proyecciones id, iq oscilan a ωₑ — igual de alternas que las fases abc; (2) pasa
        a <span className="text-violet-300">Síncrono</span>: los ejes persiguen al vector a su misma
        velocidad, el vector queda «congelado» respecto a ellos y{' '}
        <span className="text-sky-300">id</span>, <span className="text-amber-300">iq</span> se vuelven
        LÍNEAS RECTAS (CD) — sobre señales constantes es trivial diseñar controladores; (3) el marco del{' '}
        <span className="text-violet-300">Rotor</span> deja las d-q oscilando a la frecuencia de
        deslizamiento (ωₑ−ωᵣ = s·ωₑ): ni tan alto como la red, ni tan quieto como el síncrono.
      </footer>
    </div>
  )
}
