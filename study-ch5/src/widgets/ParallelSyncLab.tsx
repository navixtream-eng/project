import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, FlaskConical, RotateCcw, Zap } from 'lucide-react'

const F_BUS = 60

type Verdict = null | { ok: boolean; msg: string; iPct: number }

/**
 * Laboratorio — Sincronización de un generador a la barra (§5-8).
 * Arriba: el procedimiento como diagrama de flujo de alto nivel (los 4
 * requisitos y el cierre de S₂). Abajo: un sincroscopio vivo — la aguja gira
 * a la frecuencia de batido Δf y el estudiante debe cerrar S₂ cuando los
 * voltajes están momentáneamente en fase (aguja en las 12, ΔV ≈ 0).
 */
export default function ParallelSyncLab() {
  const [dfDecimo, setDfDecimo] = useState(3) // Δf en décimas de Hz
  const [vMatch, setVMatch] = useState(100) // |V2| como % de |V1|
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [closed, setClosed] = useState(false)
  const phaseRef = useRef(Math.PI * 0.9) // fase relativa inicial (rad)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const df = dfDecimo / 10

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (!closed) phaseRef.current = (phaseRef.current + 2 * Math.PI * df * dt * 0.55) % (2 * Math.PI)
      draw()
      raf = requestAnimationFrame(tick)
    }
    const draw = () => {
      const cv = canvasRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      if (!ctx) return
      const w = cv.width
      const h = cv.height
      ctx.clearRect(0, 0, w, h)
      const phi = closed ? 0 : phaseRef.current

      // --- Sincroscopio (izquierda) ---
      const cxp = h * 0.5
      const cyp = h * 0.52
      const R = h * 0.36
      ctx.beginPath()
      ctx.arc(cxp, cyp, R, 0, Math.PI * 2)
      ctx.fillStyle = '#141417'
      ctx.fill()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#3f3f46'
      ctx.stroke()
      // Zona segura alrededor de las 12
      ctx.beginPath()
      ctx.arc(cxp, cyp, R - 4, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22)
      ctx.lineWidth = 7
      ctx.strokeStyle = 'rgba(16,185,129,0.55)'
      ctx.stroke()
      // Marcas
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cxp + Math.cos(a) * (R - 9), cyp + Math.sin(a) * (R - 9))
        ctx.lineTo(cxp + Math.cos(a) * (R - 3), cyp + Math.sin(a) * (R - 3))
        ctx.lineWidth = 2
        ctx.strokeStyle = '#52525b'
        ctx.stroke()
      }
      // Aguja: apunta a las 12 cuando φ = 0
      const na = -Math.PI / 2 + phi
      ctx.beginPath()
      ctx.moveTo(cxp - Math.cos(na) * R * 0.16, cyp - Math.sin(na) * R * 0.16)
      ctx.lineTo(cxp + Math.cos(na) * R * 0.82, cyp + Math.sin(na) * R * 0.82)
      ctx.lineWidth = 4
      ctx.strokeStyle = closed ? '#10b981' : '#e4b34c'
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cxp, cyp, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#a1a1aa'
      ctx.fill()
      ctx.font = '10px ui-monospace, monospace'
      ctx.fillStyle = '#71717a'
      ctx.textAlign = 'center'
      ctx.fillText('sincroscopio', cxp, cyp + R + 16)
      ctx.fillText('lento ⟲ · ⟳ rápido', cxp, 14)

      // --- Ondas v1 y v2 (derecha) ---
      const x0 = h + 8
      const ww = w - x0 - 8
      const midY = h * 0.42
      const amp = h * 0.24
      const cycles = 3
      const drawWave = (offset: number, scale: number, color: string, width: number) => {
        ctx.beginPath()
        for (let i = 0; i <= ww; i++) {
          const t = (i / ww) * cycles * 2 * Math.PI
          const y = midY - Math.sin(t + offset) * amp * scale
          if (i === 0) ctx.moveTo(x0 + i, y)
          else ctx.lineTo(x0 + i, y)
        }
        ctx.lineWidth = width
        ctx.strokeStyle = color
        ctx.stroke()
      }
      drawWave(0, 1, '#3b82f6', 2.5) // barra V1
      drawWave(closed ? 0 : -phi, vMatch / 100, closed ? '#3b82f6' : '#f59e0b', 2) // G2
      // ΔV instantáneo a través de S2 (envolvente)
      const dv = closed
        ? 0
        : Math.hypot(1 - (vMatch / 100) * Math.cos(phi), (vMatch / 100) * Math.sin(phi))
      ctx.font = '11px ui-monospace, monospace'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#3b82f6'
      ctx.fillText('V̂₁ barra', x0, h - 26)
      ctx.fillStyle = closed ? '#10b981' : '#f59e0b'
      ctx.fillText(closed ? 'V̂₂ = V̂₁ (¡en paralelo!)' : 'V̂₂ generador G₂', x0 + 70, h - 26)
      ctx.fillStyle = dv < 0.15 ? '#10b981' : '#f87171'
      ctx.fillText(`|ΔV| en S₂ = ${(dv * 100).toFixed(0)} %`, x0, h - 10)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [df, vMatch, closed])

  const tryClose = () => {
    if (closed) return
    // Ángulo y desajuste de magnitud al momento del cierre
    const phi = phaseRef.current
    const m = vMatch / 100
    const dv = Math.hypot(1 - m * Math.cos(phi), m * Math.sin(phi))
    // Corriente de choque ∝ ΔV/Xs — la reportamos como % de la nominal (Xs″≈0.2 pu)
    const iPct = (dv / 0.2) * 100
    if (dv < 0.08) {
      setVerdict({ ok: true, msg: '¡Sincronización perfecta! ΔV ≈ 0: la máquina entra sin choque de corriente ni sacudida de par.', iPct })
      setClosed(true)
    } else if (dv < 0.2) {
      setVerdict({ ok: true, msg: 'Entró, pero con un tirón: había desfase residual. En una máquina grande esto estresa el eje y los devanados.', iPct })
      setClosed(true)
    } else {
      setVerdict({
        ok: false,
        msg: `¡Cierre fuera de fase! Con ΔV = ${(dv * 100).toFixed(0)}% la corriente de choque sería enorme — relés fuera, posible daño al eje. El interruptor se bloqueó.`,
        iPct,
      })
    }
  }

  const reset = () => {
    setClosed(false)
    setVerdict(null)
    phaseRef.current = Math.PI * 0.9
  }

  const steps: { label: string; done: boolean }[] = [
    { label: 'Impulsar G₂ a velocidad ≈ síncrona (f₂ ≈ f₁)', done: true },
    { label: 'Ajustar la excitación If₂ hasta |V₂| = |V₁|', done: vMatch >= 97 && vMatch <= 103 },
    { label: 'Verificar la secuencia de fases (a-b-c)', done: true },
    { label: 'Sincroscopio: esperar la aguja en las 12 (ΔV ≈ 0)', done: closed },
    { label: 'Cerrar S₂ → repartir carga con gobernador y excitación', done: closed },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Sincronización: el ritual de entrar al coro
        </h4>
      </header>

      {/* Diagrama de flujo de alto nivel del procedimiento */}
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Procedimiento (flujo de sincronización de G₂ contra la barra)
        </p>
        <ol className="flex flex-wrap items-stretch gap-1.5">
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold leading-tight ${
                  s.done
                    ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400'
                }`}
              >
                {s.done && <CheckCircle2 size={11} className="shrink-0" />}
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="text-zinc-600">→</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 px-4 py-2.5 text-xs">
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="w-36 font-semibold text-amber-300">Δf = f₂ − f₁ (batido)</span>
          <input type="range" min={1} max={10} step={1} value={dfDecimo} disabled={closed}
            onChange={(e) => setDfDecimo(Number(e.target.value))} className="flex-1" />
          <span className="w-16 font-mono text-zinc-200">{df.toFixed(1)} Hz</span>
        </label>
        <label className="flex flex-1 items-center gap-2 text-zinc-400">
          <span className="w-32 font-semibold text-sky-300">|V₂| (excitación If₂)</span>
          <input type="range" min={80} max={120} step={1} value={vMatch} disabled={closed}
            onChange={(e) => setVMatch(Number(e.target.value))} className="flex-1" />
          <span className="w-14 font-mono text-zinc-200">{vMatch} %</span>
        </label>
        <button type="button" onClick={closed ? reset : tryClose}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white ${
            closed ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}>
          {closed ? <RotateCcw size={12} /> : <Zap size={12} />}
          {closed ? 'Reiniciar' : 'Cerrar S₂'}
        </button>
      </div>

      <div className="px-2 py-2">
        <canvas ref={canvasRef} width={640} height={190} className="h-auto w-full" />
      </div>

      {verdict && (
        <div className={`mx-4 mb-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
          verdict.ok
            ? 'border-emerald-600/50 bg-emerald-500/10 text-emerald-200'
            : 'border-red-600/50 bg-red-500/10 text-red-200'
        }`}>
          <span className="font-bold">{verdict.ok ? '✓ ' : '✗ '}</span>
          {verdict.msg}{' '}
          <span className="font-mono">
            I de choque ≈ {verdict.iPct.toFixed(0)} % de la nominal.
          </span>
        </div>
      )}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con Δf = 0.3 Hz, espera a que la aguja pase por las 12 y cierra: entra suave — el
        sincroscopio solo es la fase relativa entre V̂₂ y V̂₁ girando a la frecuencia de batido;
        (2) cierra a propósito con la aguja en las 6 (180°): |ΔV| ≈ 2·V y el interruptor se bloquea —
        en la vida real este error dobla ejes; (3) baja |V₂| al 85% y cierra en las 12: aun en fase
        hay ΔV por magnitud — la excitación también debe igualarse antes del cierre; (4) sube Δf a
        1 Hz: la aguja gira tan rápido que atinarle a la ventana verde es casi imposible — por eso el
        operador ajusta primero la velocidad hasta que el batido sea lentísimo (f de la red vs f del
        generador casi iguales, {F_BUS} Hz).
      </footer>
    </div>
  )
}
