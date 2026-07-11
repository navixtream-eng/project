import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, FlaskConical, Power, RotateCcw } from 'lucide-react'
import { useProgress } from '../components/ProgressContext'

// Base: cada generador 10 MVA · Xs = 0.8 pu · estatismo k = 0.3 Hz/MW
const SB = 10
const XS = 0.8
const K = 0.3
const TAU_G = 1.8 // constante de tiempo del gobernador [s]
const S_MAX = 10.5 // límite de armadura [MVA]
const E_MAX = 1.75 // límite de campo (sobreexcitación) [pu]

type Mode = 'isla' | 'barra'

interface GenState {
  on: boolean
  pm: number // potencia mecánica [MW]
  p: number // potencia eléctrica [MW]
  q: number // reactivos [MVAr]
  delta: number // ángulo interno [rad]
  revTimer: number // acumulador del relé 32
  tripMsg: string | null
}

interface Sim {
  t: number
  f: number
  vt: number
  g: [GenState, GenState]
  alarms: string[]
  mission: boolean[]
  missionFailed: string | null
  buf: { t: number; f: number; vt: number; p1: number; p2: number; q1: number; q2: number }[]
  lastEvent: string | null
}

interface Cfg {
  mode: Mode
  fset: [number, number]
  eaf: [number, number]
  pl: number
  ql: number
  agc: boolean
  avr: boolean
}

const newGen = (on: boolean, pm: number): GenState => ({
  on, pm, p: on ? pm : 0, q: 0, delta: 0, revTimer: 0, tripMsg: null,
})

const initialSim = (): Sim => ({
  t: 0,
  f: 60,
  vt: 1.02,
  g: [newGen(true, 6), newGen(false, 0)],
  alarms: [],
  mission: [false, false, false, false, false],
  missionFailed: null,
  buf: [],
  lastEvent: null,
})

const MISSION_LABELS = [
  'Preparar y sincronizar G₂ (iguala f y V, cierra 52-G2)',
  'Cargar MW: G₂ ≥ 40 % del reparto con f = 60 ± 0.1 Hz',
  'Repartir MVAr: |fp₁ − fp₂| < 0.05 con excitaciones',
  'Vigilar límites: todo dentro de la carta, sin alarmas',
  'Desconectar G₁: P₁ < 0.5 MW y abre 52-G1 (sin relé 32)',
]

/**
 * Laboratorio — Sala de control de dos generadores (§5-8/5-9 integrador).
 * Todo lo aprendido en una sola maniobra: modo barra infinita o red aislada,
 * gobernadores + excitaciones sobre el plano P–Q con límites reales, AGC y
 * AVR, perturbaciones con línea de tiempo, alarmas de protección y una
 * misión operativa guiada de principio a fin.
 */
export default function SalaControlLab() {
  const { markDone } = useProgress()
  const [mode, setMode] = useState<Mode>('isla')
  const [fset1, setFset1] = useState(61.8)
  const [fset2, setFset2] = useState(60.0)
  const [e1, setE1] = useState(1.35)
  const [e2, setE2] = useState(1.0)
  const [pl, setPl] = useState(6)
  const [ql, setQl] = useState(4)
  const [agc, setAgc] = useState(false)
  const [avr, setAvr] = useState(false)
  const [, force] = useState(0) // refresco de lectura (5 Hz)

  const simRef = useRef<Sim>(initialSim())
  const cfgRef = useRef<Cfg>({ mode, fset: [fset1, fset2], eaf: [e1, e2], pl, ql, agc, avr })
  const pqRef = useRef<HTMLCanvasElement>(null)
  const tlRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    cfgRef.current = { mode, fset: [fset1, fset2], eaf: [e1, e2], pl, ql, agc, avr }
  }, [mode, fset1, fset2, e1, e2, pl, ql, agc, avr])

  // Los ajustes de AGC/AVR modifican los sliders: setters accesibles al bucle
  const settersRef = useRef({ setFset1, setFset2, setE1, setE2 })

  useEffect(() => {
    let raf = 0
    let last: number | null = null
    let uiAcc = 0
    let sampleAcc = 0

    const step = (dtRaw: number) => {
      const s = simRef.current
      const c = cfgRef.current
      const dt = Math.min(dtRaw, 0.05)
      s.t += dt
      const [gA, gB] = s.g
      const nOn = (gA.on ? 1 : 0) + (gB.on ? 1 : 0)
      const alarms: string[] = []

      if (c.mode === 'barra') {
        // --- Barra infinita: f y V los impone la red ---
        s.f = 60
        s.vt = 1.0
        s.g.forEach((g, i) => {
          if (!g.on) { g.p = 0; g.q = 0; g.pm = 0; return }
          const pTarget = (c.fset[i] - 60) / K
          g.pm += ((pTarget - g.pm) / TAU_G) * dt
          g.p = g.pm
          const pPu = g.p / SB
          const sinD = (pPu * XS) / (c.eaf[i] * s.vt)
          if (sinD >= 0.995) {
            g.on = false
            g.tripMsg = `78 · G${i + 1} PERDIÓ EL SINCRONISMO (Eaf·senδ < P): sube Eaf o baja P antes de llegar al límite`
            s.lastEvent = g.tripMsg
            return
          }
          g.delta = Math.asin(Math.max(-1, Math.min(1, sinD)))
          g.q = ((s.vt * (c.eaf[i] * Math.cos(g.delta) - s.vt)) / XS) * SB
        })
      } else {
        // --- Red aislada: f y V los fabrican ESTOS generadores ---
        const plEff = c.pl * (1 + 1.5 * ((s.f - 60) / 60))
        let pmSum = 0
        s.g.forEach((g, i) => {
          if (!g.on) { g.p = 0; g.q = 0; g.pm = 0; return }
          const pTarget = (c.fset[i] - s.f) / K
          g.pm += ((pTarget - g.pm) / TAU_G) * dt
          pmSum += g.pm
        })
        // Dinámica de frecuencia (inercia agregada)
        s.f += (nOn > 0 ? ((pmSum - plEff) / SB) * 6 * dt : -0.4 * dt)
        s.f = Math.max(55, Math.min(65, s.f))
        // Voltaje de barra: balance de reactivos cuasi-estático
        const eSum = s.g.reduce((acc, g, i) => acc + (g.on ? c.eaf[i] : 0), 0)
        s.vt = nOn > 0 ? eSum / (nOn + XS * (c.ql / SB)) : 0
        s.g.forEach((g, i) => {
          if (!g.on) return
          g.p = g.pm
          g.q = ((s.vt * (c.eaf[i] - s.vt)) / XS) * SB
          g.delta = Math.asin(Math.max(-1, Math.min(1, (g.p / SB) * XS / Math.max(0.2, c.eaf[i] * s.vt))))
        })
        if (nOn > 0 && Math.abs(s.f - 60) > 1.5) alarms.push(`81 · frecuencia anormal (${s.f.toFixed(2)} Hz)`)
        if (nOn > 0 && Math.abs(s.vt - 1) > 0.1) alarms.push(`59/27 · tensión fuera de banda (${s.vt.toFixed(2)} pu)`)
        // AGC y AVR (control secundario) — mueven las consignas despacio
        if (c.agc && nOn > 0) {
          const nudge = 0.15 * (60 - s.f) * dt
          if (Math.abs(nudge) > 1e-6) {
            if (gA.on) settersRef.current.setFset1((v) => Math.round((v + nudge) * 1000) / 1000)
            if (gB.on) settersRef.current.setFset2((v) => Math.round((v + nudge) * 1000) / 1000)
          }
        }
        if (c.avr && nOn > 0) {
          const nudge = 0.12 * (1.0 - s.vt) * dt
          if (Math.abs(nudge) > 1e-7) {
            if (gA.on) settersRef.current.setE1((v) => Math.min(2, Math.max(0.5, v + nudge)))
            if (gB.on) settersRef.current.setE2((v) => Math.min(2, Math.max(0.5, v + nudge)))
          }
        }
      }

      // --- Protecciones y límites por generador ---
      s.g.forEach((g, i) => {
        if (!g.on) return
        const sMva = Math.hypot(g.p, g.q)
        if (sMva > S_MAX) alarms.push(`50/51 · G${i + 1} sobrecorriente de armadura (${sMva.toFixed(1)} MVA > ${S_MAX})`)
        if (cfgRef.current.eaf[i] > E_MAX) alarms.push(`OEL · G${i + 1} sobreexcitación (Eaf ${cfgRef.current.eaf[i].toFixed(2)} > ${E_MAX} pu)`)
        if (g.q < -(3 + 0.25 * Math.max(0, g.p))) alarms.push(`UEL/40 · G${i + 1} subexcitado: riesgo de pérdida de campo/estabilidad`)
        // Relé 32: potencia inversa sostenida
        if (g.p < -0.3) {
          g.revTimer += dt
          alarms.push(`32 · G${i + 1} MOTORIZANDO (P = ${g.p.toFixed(1)} MW) — dispara en ${Math.max(0, 2.5 - g.revTimer).toFixed(1)} s`)
          if (g.revTimer > 2.5) {
            g.on = false
            g.tripMsg = `32 · G${i + 1} DISPARADO por potencia inversa`
            s.lastEvent = g.tripMsg
          }
        } else {
          g.revTimer = 0
        }
      })
      s.alarms = alarms

      // --- Misión (solo en red aislada) ---
      if (c.mode === 'isla' && !s.missionFailed) {
        const m = s.mission
        if (!m[0] && gA.on && gB.on) m[0] = true
        const pt = gA.p + gB.p
        if (m[0] && !m[1] && gB.on && pt > 1 && gB.p / pt >= 0.4 && Math.abs(s.f - 60) < 0.1) m[1] = true
        const fp = (g: GenState) => (Math.hypot(g.p, g.q) < 0.2 ? 1 : Math.abs(g.p) / Math.hypot(g.p, g.q))
        if (m[1] && !m[2] && gA.on && gB.on && Math.abs(fp(gA) - fp(gB)) < 0.05) m[2] = true
        if (m[2] && !m[3] && alarms.length === 0) m[3] = true
        if (m[3] && !m[4] && !gA.on && gA.tripMsg === null && gB.on && Math.abs(s.f - 60) < 0.6) {
          m[4] = true
          markDone('s7-mision-sala')
        }
        if ((gA.tripMsg || gB.tripMsg) && !m[4]) {
          s.missionFailed = 'Un relé disparó durante la maniobra — pulsa Reiniciar e inténtalo de nuevo con más margen.'
        }
      }

      // Muestreo de la línea de tiempo (10 Hz, 60 s)
      sampleAcc += dt
      if (sampleAcc > 0.1) {
        sampleAcc = 0
        s.buf.push({ t: s.t, f: s.f, vt: s.vt, p1: gA.p, p2: gB.p, q1: gA.q, q2: gB.q })
        if (s.buf.length > 600) s.buf.shift()
      }
    }

    const drawPQ = () => {
      const cv = pqRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      if (!ctx) return
      const W = cv.width
      const H = cv.height
      ctx.clearRect(0, 0, W, H)
      // Plano: x = P (−3..12 MW), y = Q (−7..12 MVAr)
      const xOf = (p: number) => 34 + ((p + 3) / 15) * (W - 44)
      const yOf = (q: number) => H - 24 - ((q + 7) / 19) * (H - 34)
      // Región de potencia inversa
      ctx.fillStyle = 'rgba(248,113,113,0.08)'
      ctx.fillRect(xOf(-3), 6, xOf(0) - xOf(-3), H - 30)
      // Ejes
      ctx.strokeStyle = '#3f3f46'
      ctx.beginPath(); ctx.moveTo(xOf(0), 6); ctx.lineTo(xOf(0), H - 24); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(30, yOf(0)); ctx.lineTo(W - 8, yOf(0)); ctx.stroke()
      ctx.font = '9px ui-monospace, monospace'
      ctx.fillStyle = '#71717a'
      ctx.textAlign = 'center'
      ctx.fillText('P [MW] →', W - 40, yOf(0) - 5)
      ctx.save(); ctx.translate(12, 40); ctx.rotate(-Math.PI / 2); ctx.fillText('Q [MVAr] →', 0, 0); ctx.restore()
      ;[5, 10].forEach((p) => { ctx.fillText(String(p), xOf(p), yOf(0) + 11) })
      ;[-5, 5, 10].forEach((q) => { ctx.fillText(String(q), xOf(0) - 12, yOf(q) + 3) })
      // Límite de armadura (círculo S_MAX)
      ctx.strokeStyle = '#e4b34c'
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      for (let a = 0; a <= 180; a++) {
        const ang = (a / 180) * Math.PI - Math.PI / 2
        const x = xOf(S_MAX * Math.cos(ang))
        const y = yOf(S_MAX * Math.sin(ang))
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      // Límite de campo (sobreexcitación): círculo centrado en (0, −Vt²/Xs·SB)
      const vt = simRef.current.vt || 1
      const cq = -(vt * vt / XS) * SB
      const rf = ((vt * E_MAX) / XS) * SB
      ctx.strokeStyle = '#f87171'
      ctx.beginPath()
      for (let a = 0; a <= 120; a++) {
        const ang = (a / 120) * Math.PI * 0.5 + Math.PI * 0.25
        const x = xOf(rf * Math.cos(ang - Math.PI / 2))
        const y = yOf(cq + rf * Math.sin(ang - Math.PI / 2 + Math.PI / 2))
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      // Límite de subexcitación (UEL): recta Q = −(3 + 0.25P)
      ctx.strokeStyle = '#a78bfa'
      ctx.beginPath()
      ctx.moveTo(xOf(0), yOf(-3))
      ctx.lineTo(xOf(11), yOf(-3 - 0.25 * 11))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.textAlign = 'left'
      ctx.fillStyle = '#e4b34c'; ctx.fillText('armadura', xOf(7.6), yOf(7.6) - 4)
      ctx.fillStyle = '#f87171'; ctx.fillText('campo (OEL)', xOf(1), yOf(10.5))
      ctx.fillStyle = '#a78bfa'; ctx.fillText('UEL', xOf(9.6), yOf(-5.2))
      ctx.fillStyle = '#f87171'; ctx.fillText('P<0: relé 32', xOf(-2.9), 16)
      // Puntos de operación
      simRef.current.g.forEach((g, i) => {
        if (!g.on) return
        const color = i === 0 ? '#38bdf8' : '#f59e0b'
        ctx.beginPath()
        ctx.arc(xOf(g.p), yOf(g.q), 5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#0b0b0d'
        ctx.stroke()
        ctx.fillStyle = color
        ctx.fillText(`G${i + 1}`, xOf(g.p) + 7, yOf(g.q) - 5)
      })
    }

    const drawTimeline = () => {
      const cv = tlRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      if (!ctx) return
      const W = cv.width
      const H = cv.height
      ctx.clearRect(0, 0, W, H)
      const buf = simRef.current.buf
      if (buf.length < 2) return
      const t1 = buf[buf.length - 1].t
      const t0 = Math.max(0, t1 - 60)
      const xOf = (t: number) => 30 + ((t - t0) / 60) * (W - 38)
      const half = H / 2
      // Pane 1: f (58.5–61.5) y Vt (0.85–1.15)
      const yF = (f: number) => half - 8 - ((f - 58.5) / 3) * (half - 18)
      const yV = (v: number) => half - 8 - ((v - 0.85) / 0.3) * (half - 18)
      // Pane 2: P (−2..12 MW)
      const yP = (p: number) => H - 6 - ((p + 2) / 14) * (half - 18)
      ctx.strokeStyle = '#27272a'
      ;[yF(60), yP(0)].forEach((y) => { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 8, y); ctx.stroke() })
      ctx.font = '9px ui-monospace, monospace'
      ctx.fillStyle = '#71717a'
      ctx.textAlign = 'left'
      ctx.fillText('60 Hz', 2, yF(60) + 3)
      ctx.fillText('0 MW', 2, yP(0) + 3)
      const line = (fn: (b: Sim['buf'][number]) => number, color: string, dash: number[] = []) => {
        ctx.strokeStyle = color
        ctx.setLineDash(dash)
        ctx.beginPath()
        buf.forEach((b, i) => {
          const x = xOf(b.t)
          const y = fn(b)
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.setLineDash([])
      }
      line((b) => yF(b.f), '#10b981')
      line((b) => yV(b.vt), '#c084fc', [3, 3])
      line((b) => yP(b.p1), '#38bdf8')
      line((b) => yP(b.p2), '#f59e0b')
      line((b) => yP(b.q1 * 0.5), '#38bdf8', [2, 4])
      line((b) => yP(b.q2 * 0.5), '#f59e0b', [2, 4])
      ctx.fillStyle = '#10b981'; ctx.fillText('f', W - 60, 12)
      ctx.fillStyle = '#c084fc'; ctx.fillText('Vt', W - 48, 12)
      ctx.fillStyle = '#38bdf8'; ctx.fillText('P₁·Q₁', W - 110, half + 10)
      ctx.fillStyle = '#f59e0b'; ctx.fillText('P₂·Q₂', W - 64, half + 10)
    }

    const tick = (now: number) => {
      const dt = last === null ? 0 : (now - last) / 1000
      last = now
      step(dt)
      drawPQ()
      drawTimeline()
      uiAcc += dt
      if (uiAcc > 0.2) {
        uiAcc = 0
        force((v) => v + 1)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [markDone])

  const sim = simRef.current
  const [g1, g2] = sim.g

  const canSync = !g2.on && Math.abs(fset2 - sim.f) < 0.2 && Math.abs(e2 - sim.vt) < 0.06
  const syncG2 = () => {
    if (!canSync) return
    g2.on = true
    g2.pm = 0
    g2.tripMsg = null
    sim.lastEvent = '52-G2 CERRADO: G₂ en paralelo, sin carga'
  }
  const openBreaker = (i: 0 | 1) => {
    const g = sim.g[i]
    if (!g.on) return
    g.on = false
    g.tripMsg = null
    sim.lastEvent = Math.abs(g.p) > 0.5
      ? `52-G${i + 1} ABIERTO con ${g.p.toFixed(1)} MW: ¡rechazo de carga! mira el golpe en la línea de tiempo`
      : `52-G${i + 1} ABIERTO (máquina descargada — maniobra limpia)`
  }
  const perturb = (kind: 'carga+' | 'carga-' | 'tripG1' | 'campoG1') => {
    if (kind === 'carga+') { setPl((v) => Math.min(14, v + 2)); sim.lastEvent = 'PERTURBACIÓN: +2 MW de carga súbita' }
    if (kind === 'carga-') { setPl((v) => Math.max(1, v - 2)); sim.lastEvent = 'PERTURBACIÓN: −2 MW (rechazo de carga)' }
    if (kind === 'tripG1' && g1.on) { g1.on = false; g1.tripMsg = 'disparo manual'; sim.lastEvent = 'PERTURBACIÓN: disparo de G₁ — G₂ queda solo con toda la carga' }
    if (kind === 'campoG1') { setE1(0.55); sim.lastEvent = 'PERTURBACIÓN: caída de excitación de G₁ (pérdida de campo parcial)' }
  }
  const resetAll = () => {
    simRef.current = initialSim()
    setMode('isla'); setFset1(61.8); setFset2(60.0); setE1(1.35); setE2(1.0)
    setPl(6); setQl(4); setAgc(false); setAvr(false)
  }

  const fpOf = (g: GenState) => (Math.hypot(g.p, g.q) < 0.2 ? 1 : Math.abs(g.p) / Math.hypot(g.p, g.q))

  const genCard = (i: 0 | 1) => {
    const g = sim.g[i]
    const color = i === 0 ? 'text-sky-300' : 'text-amber-300'
    const fs = i === 0 ? fset1 : fset2
    const setFs = i === 0 ? setFset1 : setFset2
    const ee = i === 0 ? e1 : e2
    const setEe = i === 0 ? setE1 : setE2
    const sMva = Math.hypot(g.p, g.q)
    return (
      <div key={i} className={`flex-1 rounded-lg border p-2.5 ${g.on ? 'border-zinc-700 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-950/60 opacity-90'}`}>
        <div className="mb-1.5 flex items-center justify-between">
          <p className={`text-xs font-black ${color}`}>Generador {i + 1}</p>
          <div className="flex items-center gap-1.5">
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${g.on ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}`}>
              52-G{i + 1} {g.on ? 'CERRADO' : 'ABIERTO'}
            </span>
            {g.on ? (
              <button type="button" onClick={() => openBreaker(i)}
                className="flex items-center gap-1 rounded bg-red-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-red-500">
                <Power size={9} /> abrir
              </button>
            ) : i === 1 ? (
              <button type="button" onClick={syncG2} disabled={!canSync}
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${canSync ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'cursor-not-allowed bg-zinc-800 text-zinc-500'}`}
                title={canSync ? 'Condiciones de sincronismo cumplidas' : 'Relé 25: iguala f (gobernador) y V (excitación) con la barra'}>
                sincronizar y cerrar
              </button>
            ) : (
              <button type="button" onClick={() => { g.on = true; g.pm = 0; g.tripMsg = null }}
                className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-emerald-500">
                cerrar
              </button>
            )}
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="w-24">Gobernador f₀</span>
          <input type="range" min={58.5} max={63} step={0.05} value={fs}
            onChange={(e) => setFs(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{fs.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="w-24">Excitación Eaf</span>
          <input type="range" min={0.5} max={2.0} step={0.01} value={ee}
            onChange={(e) => setEe(Number(e.target.value))} className="flex-1" />
          <span className="w-12 font-mono text-zinc-200">{ee.toFixed(2)}</span>
        </label>
        <div className="mt-1.5 grid grid-cols-4 gap-1 font-mono text-[10px]">
          <span className={color}>P {g.p.toFixed(1)}</span>
          <span className={color}>Q {g.q.toFixed(1)}</span>
          <span className={sMva > S_MAX ? 'text-red-400' : 'text-zinc-300'}>S {sMva.toFixed(1)}</span>
          <span className="text-zinc-300">fp {fpOf(g).toFixed(2)}</span>
        </div>
        {g.tripMsg && g.tripMsg !== 'disparo manual' && (
          <p className="mt-1 rounded bg-red-500/10 px-1.5 py-1 text-[9px] font-semibold text-red-300">{g.tripMsg}</p>
        )}
      </div>
    )
  }

  return (
    <div className="lab-panel my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
      <header className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/70 px-4 py-2">
        <FlaskConical size={14} className="text-emerald-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Laboratorio · Sala de control de dos generadores (misión integradora)
        </h4>
      </header>

      {/* Ruta de la maniobra = misión */}
      <div className="border-b border-zinc-800 px-4 py-2.5">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Misión (modo red aislada) · Preparar → Sincronizar → Cerrar → Cargar MW → Repartir MVAr → Vigilar límites → Desconectar
        </p>
        <ol className="flex flex-wrap gap-1.5">
          {MISSION_LABELS.map((label, i) => (
            <li key={label}
              className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-[9px] font-semibold leading-tight ${
                sim.mission[i]
                  ? 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-500'
              }`}>
              {sim.mission[i] ? <CheckCircle2 size={10} /> : <span className="font-mono">{i + 1}.</span>}
              {label}
            </li>
          ))}
        </ol>
        {sim.mission.every(Boolean) && (
          <p className="mt-1.5 rounded bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-300">
            ✓ MISIÓN COMPLETA: sincronizaste, cargaste, repartiste, vigilaste y retiraste una unidad como en una central real.
          </p>
        )}
        {sim.missionFailed && !sim.mission.every(Boolean) && (
          <p className="mt-1.5 rounded bg-red-500/10 px-2 py-1 text-[10px] text-red-300">{sim.missionFailed}</p>
        )}
      </div>

      {/* Modo, controles secundarios y perturbaciones */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-zinc-800 px-4 py-2 text-[10px]">
        {(['isla', 'barra'] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`rounded-md px-2 py-1 font-bold ${mode === m ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {m === 'isla' ? 'Red aislada (G₁+G₂ fabrican f y V)' : 'Barra infinita (f y V fijos por la red)'}
          </button>
        ))}
        {mode === 'isla' && (
          <>
            <label className="flex cursor-pointer items-center gap-1 text-zinc-400">
              <input type="checkbox" checked={agc} onChange={(e) => setAgc(e.target.checked)} className="h-3 w-3 accent-emerald-500" />
              AGC (secundario → 60 Hz)
            </label>
            <label className="flex cursor-pointer items-center gap-1 text-zinc-400">
              <input type="checkbox" checked={avr} onChange={(e) => setAvr(e.target.checked)} className="h-3 w-3 accent-violet-500" />
              AVR (tensión → 1.0 pu)
            </label>
          </>
        )}
        <span className="ml-auto flex gap-1">
          {mode === 'isla' && (
            <>
              <button type="button" onClick={() => perturb('carga+')} className="rounded bg-zinc-800 px-1.5 py-1 font-semibold text-zinc-300 hover:bg-zinc-700">+2 MW súbito</button>
              <button type="button" onClick={() => perturb('tripG1')} className="rounded bg-zinc-800 px-1.5 py-1 font-semibold text-zinc-300 hover:bg-zinc-700">disparo G₁</button>
              <button type="button" onClick={() => perturb('campoG1')} className="rounded bg-zinc-800 px-1.5 py-1 font-semibold text-zinc-300 hover:bg-zinc-700">pérdida campo G₁</button>
            </>
          )}
          <button type="button" onClick={resetAll} className="flex items-center gap-1 rounded bg-zinc-700 px-1.5 py-1 font-semibold text-zinc-200 hover:bg-zinc-600">
            <RotateCcw size={10} /> Reiniciar
          </button>
        </span>
      </div>

      {/* Tarjetas de generador + estado del sistema */}
      <div className="flex flex-col gap-2 border-b border-zinc-800 px-3 py-2 lg:flex-row">
        {genCard(0)}
        <div className="flex shrink-0 flex-col justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-center">
          <p className="text-[9px] uppercase tracking-wide text-zinc-500">Sistema</p>
          <p className={`font-mono text-lg font-black ${Math.abs(sim.f - 60) < 0.1 ? 'text-emerald-300' : Math.abs(sim.f - 60) < 1 ? 'text-amber-300' : 'text-red-400'}`}>
            {sim.f.toFixed(2)} Hz
          </p>
          <p className={`font-mono text-sm font-bold ${Math.abs(sim.vt - 1) < 0.05 ? 'text-violet-300' : 'text-red-300'}`}>
            {sim.vt.toFixed(3)} pu
          </p>
          {mode === 'isla' ? (
            <>
              <label className="flex items-center gap-1 text-[9px] text-zinc-400">
                P_L
                <input type="range" min={1} max={14} step={0.5} value={pl} onChange={(e) => setPl(Number(e.target.value))} className="w-20" />
                <span className="font-mono text-zinc-200">{pl.toFixed(1)} MW</span>
              </label>
              <label className="flex items-center gap-1 text-[9px] text-zinc-400">
                Q_L
                <input type="range" min={0} max={8} step={0.5} value={ql} onChange={(e) => setQl(Number(e.target.value))} className="w-20" />
                <span className="font-mono text-zinc-200">{ql.toFixed(1)} MVAr</span>
              </label>
            </>
          ) : (
            <p className="max-w-[130px] text-[9px] leading-snug text-zinc-500">
              La red absorbe lo que le des: f y V no responden a TUS mandos — solo cambian P (gobernador) y Q (excitación).
            </p>
          )}
        </div>
        {genCard(1)}
      </div>

      {/* Plano P–Q con límites + línea de tiempo */}
      <div className="grid gap-2 px-3 py-2 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Plano de despacho P–Q (carta de capacidad)</p>
          <canvas ref={pqRef} width={300} height={250} className="h-auto w-full rounded border border-zinc-800/60" />
        </div>
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Línea de tiempo (últimos 60 s) — f · Vt · P · Q</p>
          <canvas ref={tlRef} width={420} height={250} className="h-auto w-full rounded border border-zinc-800/60" />
        </div>
      </div>

      {/* Alarmas y eventos */}
      <div className="border-t border-zinc-800 px-4 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Protecciones:</span>
          {sim.alarms.length === 0 ? (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">sin alarmas ✓</span>
          ) : (
            sim.alarms.map((a) => (
              <span key={a} className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-300">
                <AlertTriangle size={10} /> {a}
              </span>
            ))
          )}
        </div>
        {sim.lastEvent && (
          <p className="mt-1 font-mono text-[10px] text-zinc-500">último evento: {sim.lastEvent}</p>
        )}
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-semibold text-zinc-300">Experimentos guiados: </span>
        (1) <strong className="text-zinc-300">la misión completa</strong>: sincroniza G₂ (iguala su
        gobernador a la f de barra y su Eaf al voltaje), ciérralo, súbele gobernador bajando el de
        G₁ hasta repartir MW a 60 Hz, iguala factores de potencia con las excitaciones, verifica la
        carta sin alarmas y retira G₁ descargándolo primero — potencia inversa te dispara el relé 32
        si te pasas; (2) <strong className="text-zinc-300">+2 MW súbito</strong> sin AGC: la f cae y
        se queda abajo (regulación primaria: el estatismo REPARTE pero no RESTAURA); enciende el AGC
        y mira cómo el control secundario devuelve los 60 Hz moviendo las consignas; (3){' '}
        <strong className="text-zinc-300">disparo de G₁</strong>: G₂ hereda todo el golpe — observa
        f, P y V en la línea de tiempo; (4) cambia a <strong className="text-zinc-300">barra
        infinita</strong> y repite los mismos mandos: ahora f y V NO se mueven — el gobernador
        cambia P, la excitación cambia Q, y nada más (compara con la isla: el MISMO mando, otro
        efecto); (5) en barra infinita, sube P a ~9 MW y baja Eaf despacio: cruzarás UEL y al final
        pierdes el sincronismo (relé 78) — la estabilidad por ángulo es un límite tan real como el
        térmico.
      </footer>
    </div>
  )
}
