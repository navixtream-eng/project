import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, FlaskConical, RotateCcw, Zap } from 'lucide-react'

const F_BUS = 60
const X_SUB = 0.2 // reactancia subtransitoria X″ [pu] que limita el choque

type Verdict = null | {
  ok: boolean
  msg: string
  iSub: number // corriente subtransitoria [pu]
  pPulse: number // pulso de potencia sincronizante [pu]
  tShaft: number // par sobre el eje [× nominal]
}

/** Consecuencias eléctricas/mecánicas de cerrar con desfase φ y magnitud m. */
function closureStress(phi: number, m: number) {
  const dv = Math.hypot(1 - m * Math.cos(phi), m * Math.sin(phi))
  const iSub = dv / X_SUB
  // Potencia sincronizante de choque ≈ (V₁·V₂/X″)·sen φ; el par sigue a P
  const pPulse = Math.abs((m / X_SUB) * Math.sin(phi))
  const tShaft = Math.max(pPulse, iSub * 0.55) // el eje siente el peor de los dos frentes
  return { dv, iSub, pPulse, tShaft }
}

/**
 * Laboratorio — Tablero de sincronización (§5-8).
 * La maniobra completa como en una central: procedimiento como diagrama de
 * flujo, secuencia de fases, lámparas de sincronización, sincroscopio, y los
 * números vivos ΔV/Δf/Δθ con la corriente y el par de choque que ocurrirían
 * si se cerrara S₂ en ESTE instante.
 */
export default function ParallelSyncLab() {
  const [dfDecimo, setDfDecimo] = useState(3) // Δf en décimas de Hz
  const [vMatch, setVMatch] = useState(100) // |V2| como % de |V1|
  const [seqInvertida, setSeqInvertida] = useState(false)
  const [verdict, setVerdict] = useState<Verdict>(null)
  const [closed, setClosed] = useState(false)
  const [live, setLive] = useState({ dv: 0, phiDeg: 0, iSub: 0 })
  const phaseRef = useRef(Math.PI * 0.9)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const df = dfDecimo / 10

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    let acc = 0
    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      if (!closed) phaseRef.current = (phaseRef.current + 2 * Math.PI * df * dt * 0.55) % (2 * Math.PI)
      draw(now / 1000)
      // Refrescar los números ~5 veces por segundo (no en cada frame)
      acc += dt
      if (acc > 0.2) {
        acc = 0
        const phi = closed ? 0 : phaseRef.current
        const s = closureStress(phi, vMatch / 100)
        const deg = ((phi * 180) / Math.PI + 180) % 360 - 180
        setLive({ dv: closed ? 0 : s.dv, phiDeg: closed ? 0 : deg, iSub: closed ? 0 : s.iSub })
      }
      raf = requestAnimationFrame(tick)
    }
    const draw = (t: number) => {
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
      ctx.beginPath()
      ctx.arc(cxp, cyp, R - 4, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22)
      ctx.lineWidth = 7
      ctx.strokeStyle = 'rgba(16,185,129,0.55)'
      ctx.stroke()
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cxp + Math.cos(a) * (R - 9), cyp + Math.sin(a) * (R - 9))
        ctx.lineTo(cxp + Math.cos(a) * (R - 3), cyp + Math.sin(a) * (R - 3))
        ctx.lineWidth = 2
        ctx.strokeStyle = '#52525b'
        ctx.stroke()
      }
      const na = -Math.PI / 2 + phi
      ctx.beginPath()
      ctx.moveTo(cxp - Math.cos(na) * R * 0.16, cyp - Math.sin(na) * R * 0.16)
      ctx.lineTo(cxp + Math.cos(na) * R * 0.82, cyp + Math.sin(na) * R * 0.82)
      ctx.lineWidth = 4
      ctx.strokeStyle = closed ? '#10b981' : seqInvertida ? '#f87171' : '#e4b34c'
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

      // --- Lámparas de sincronización (centro): método de lámparas apagadas ---
      const lampX = h + 34
      const lampNames = ['a', 'b', 'c']
      for (let k = 0; k < 3; k++) {
        // Con secuencia correcta las 3 se apagan JUNTAS (brillo ∝ |ΔV|);
        // con secuencia invertida el desfase de cada fase difiere ±120°:
        // las lámparas «rotan» y jamás se apagan a la vez.
        const phik = seqInvertida ? phi + (k * 2 * Math.PI) / 3 : phi
        const m = vMatch / 100
        const b = closed ? 0 : Math.min(1, Math.hypot(1 - m * Math.cos(phik), m * Math.sin(phik)) / 2)
        const ly = 34 + k * 46
        const glow = ctx.createRadialGradient(lampX, ly, 2, lampX, ly, 16)
        glow.addColorStop(0, `rgba(255,190,60,${0.25 + b * 0.75})`)
        glow.addColorStop(1, 'rgba(255,190,60,0)')
        ctx.beginPath()
        ctx.arc(lampX, ly, 16, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.beginPath()
        ctx.arc(lampX, ly, 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,190,60,${0.12 + b * 0.88})`
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = '#52525b'
        ctx.stroke()
        ctx.font = '10px ui-monospace, monospace'
        ctx.fillStyle = '#71717a'
        ctx.textAlign = 'center'
        ctx.fillText(lampNames[k], lampX, ly + 27)
      }
      ctx.save()
      ctx.translate(lampX - 30, 100)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = '#71717a'
      ctx.fillText('lámparas', 0, 0)
      ctx.restore()

      // --- Ondas trifásicas superpuestas (derecha) ---
      const x0 = h + 74
      const ww = w - x0 - 8
      const midY = h * 0.40
      const amp = h * 0.20
      const cycles = 2.4
      const wave = (offset: number, scale: number, color: string, width: number, alpha = 1) => {
        ctx.globalAlpha = alpha
        ctx.beginPath()
        for (let i = 0; i <= ww; i++) {
          const tt = (i / ww) * cycles * 2 * Math.PI
          const y = midY - Math.sin(tt + offset + t * 2.2) * amp * scale
          if (i === 0) ctx.moveTo(x0 + i, y)
          else ctx.lineTo(x0 + i, y)
        }
        ctx.lineWidth = width
        ctx.strokeStyle = color
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      const m = vMatch / 100
      // Fases de la barra (a-b-c en azules) y del generador (ámbar)
      const seq = seqInvertida ? [0, 2, 1] : [0, 1, 2]
      for (let k = 0; k < 3; k++) {
        wave((-k * 2 * Math.PI) / 3, 1, ['#3b82f6', '#2563eb', '#60a5fa'][k], 1.8, 0.85)
        const gOff = (-seq[k] * 2 * Math.PI) / 3 - (closed ? 0 : phi)
        wave(gOff, m, closed ? ['#3b82f6', '#2563eb', '#60a5fa'][k] : '#f59e0b', 1.4, closed ? 0.85 : 0.8)
      }
      ctx.font = '11px ui-monospace, monospace'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#3b82f6'
      ctx.fillText('barra a·b·c', x0, h - 26)
      ctx.fillStyle = closed ? '#10b981' : '#f59e0b'
      ctx.fillText(closed ? 'G₂ en paralelo ✓' : `G₂ a·b·c${seqInvertida ? ' (¡SECUENCIA INVERTIDA!)' : ''}`, x0 + 92, h - 26)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [df, vMatch, closed, seqInvertida])

  const tryClose = () => {
    if (closed) return
    if (seqInvertida) {
      setVerdict({
        ok: false,
        msg: '¡Secuencia de fases invertida! Las lámparas nunca se apagan juntas (rotan): aunque el sincroscopio marque las 12, dos de las tres fases están 120° fuera. El relé de verificación bloquea el cierre — hay que intercambiar dos fases del generador.',
        iSub: closureStress((2 * Math.PI) / 3, vMatch / 100).iSub,
        pPulse: 0,
        tShaft: 0,
      })
      return
    }
    const phi = phaseRef.current
    const s = closureStress(phi, vMatch / 100)
    if (s.dv < 0.08) {
      setVerdict({ ok: true, msg: '¡Sincronización perfecta! ΔV ≈ 0: la máquina entra sin choque de corriente ni sacudida de par.', ...s })
      setClosed(true)
    } else if (s.dv < 0.2) {
      setVerdict({ ok: true, msg: 'Entró, pero con un tirón: había error residual de ángulo o tensión. En una máquina grande esto estresa el eje y los cabezales.', ...s })
      setClosed(true)
    } else {
      setVerdict({
        ok: false,
        msg: `¡Cierre fuera de fase (Δθ = ${Math.abs(live.phiDeg).toFixed(0)}°)! El interruptor se bloqueó — mira los números: eso le habría pasado a la máquina.`,
        ...s,
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
    { label: 'Verificar la secuencia de fases (a-b-c)', done: !seqInvertida },
    { label: 'Sincroscopio: esperar la aguja en las 12 (ΔV ≈ 0)', done: closed },
    { label: 'Cerrar S₂ → repartir carga con gobernador y excitación', done: closed },
  ]

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Tablero de sincronización: el ritual de entrar al coro
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
        <label className="flex cursor-pointer items-center gap-1.5 text-zinc-400">
          <input type="checkbox" checked={seqInvertida} disabled={closed}
            onChange={(e) => setSeqInvertida(e.target.checked)} className="h-3.5 w-3.5 accent-red-500" />
          secuencia invertida
        </label>
        <button type="button" onClick={closed ? reset : tryClose}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white ${
            closed ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}>
          {closed ? <RotateCcw size={12} /> : <Zap size={12} />}
          {closed ? 'Reiniciar' : 'Cerrar S₂'}
        </button>
      </div>

      {/* Fila de instrumentos: los tres errores + el riesgo instantáneo */}
      <div className="grid grid-cols-2 gap-2 border-b border-zinc-800 px-3 py-2 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500">Δθ (desfase)</p>
          <p className={`font-mono text-sm font-semibold ${Math.abs(live.phiDeg) < 15 ? 'text-emerald-300' : 'text-zinc-100'}`}>
            {live.phiDeg.toFixed(0)}°
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500">Δf (batido)</p>
          <p className="font-mono text-sm font-semibold text-zinc-100">{closed ? '0.0' : df.toFixed(1)} Hz</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500">|ΔV| en S₂</p>
          <p className={`font-mono text-sm font-semibold ${live.dv < 0.15 ? 'text-emerald-300' : 'text-red-300'}`}>
            {(live.dv * 100).toFixed(0)} %
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500">I″ si cierras YA</p>
          <p className={`font-mono text-sm font-semibold ${live.iSub < 1 ? 'text-emerald-300' : live.iSub < 3 ? 'text-amber-300' : 'text-red-300'}`}>
            {live.iSub.toFixed(1)} × In
          </p>
        </div>
      </div>

      <div className="px-2 py-2">
        <canvas ref={canvasRef} width={680} height={190} className="h-auto w-full" />
      </div>

      {verdict && (
        <div className={`mx-4 mb-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
          verdict.ok
            ? 'border-emerald-600/50 bg-emerald-500/10 text-emerald-200'
            : 'border-red-600/50 bg-red-500/10 text-red-200'
        }`}>
          <p>
            <span className="font-bold">{verdict.ok ? '✓ ' : '✗ '}</span>
            {verdict.msg}
          </p>
          {verdict.tShaft > 0 && (
            <p className="mt-1.5 font-mono text-[11px]">
              I″ = ΔV/X″ ≈ {verdict.iSub.toFixed(1)}·In · pulso de potencia ≈ {verdict.pPulse.toFixed(1)} pu ·
              par sobre el eje ≈ {verdict.tShaft.toFixed(1)} × T_nominal
              {verdict.tShaft > 3 ? ' — nivel de daño mecánico' : verdict.tShaft > 1.2 ? ' — sacudida severa' : ' — aceptable'}
            </p>
          )}
        </div>
      )}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) con Δf = 0.3 Hz espera la aguja en las 12 y cierra: las TRES lámparas se apagan juntas en
        ese instante — lámpara apagada = ΔV cero a través de ella; (2) cierra a propósito en las 6:
        I″ ≈ 2V/X″ ≈ 10·In y un par de ~5× el nominal — nivel de doblar ejes (por eso el relé 25 lo
        bloquea); (3) marca «secuencia invertida»: las lámparas dejan de parpadear juntas y ROTAN —
        el sincroscopio puede engañarte pero las lámparas no: nunca cierres si no se apagan las tres
        a la vez; (4) baja |V₂| al 85% y cierra en las 12: aun en fase hay ΔV por magnitud — choque
        puramente REACTIVO (la máquina traga vars de golpe); (5) sube Δf a 1 Hz: atinar a la ventana
        verde se vuelve lotería — el operador real reduce el batido a una fracción de ciclo por
        segundo ({F_BUS} Hz vs {F_BUS}.0x Hz) antes de intentar nada.
      </footer>
    </div>
  )
}
