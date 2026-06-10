/**
 * MathEngine — Núcleo de simulación del transitorio electromecánico
 * de un generador sincrónico de polos salientes conectado a barra infinita.
 *
 * Modelo:
 *  - Ecuación de oscilación:  (2H/ωs)·d²δ/dt² = Pm − Pe − D·(Δω/ωs)
 *  - Potencia eléctrica (modelo transitorio con saliencia):
 *      Pe(δ) = (E'q·Vt/X'd)·sin δ + (Vt²/2)·(1/Xq − 1/X'd)·sin 2δ
 *  - Envolvente de la corriente de cortocircuito trifásico:
 *      I(t) = (I'' − I')·e^(−t/T''d) + (I' − Iss)·e^(−t/T'd) + Iss
 *
 * Integración numérica: Runge-Kutta de 4to orden con paso fijo Δt ≤ 0.01 s.
 */

import type {
  CurrentsSample,
  EqualAreaResult,
  EventConfig,
  InitialConditions,
  MachineParams,
  OperatingPoint,
  PowerCurvePoint,
  ShortCircuitLevels,
  SimConfig,
  SimResult,
  SimSample,
  Stage,
} from './types'

const TWO_PI = 2 * Math.PI
const SQRT2 = Math.SQRT2

export const syncSpeed = (f: number): number => TWO_PI * f

// ---------------------------------------------------------------------------
// Condiciones iniciales de régimen permanente
// ---------------------------------------------------------------------------

/**
 * Resuelve el punto de operación pre-falla. Con Vt como fasor de referencia,
 * el ángulo del rotor se obtiene del fasor E_Q = Vt + jXq·I (eje q de la máquina
 * de polos salientes) y de él las componentes dq de corriente y las FEM internas.
 */
export function computeInitialConditions(
  m: MachineParams,
  op: OperatingPoint,
): InitialConditions {
  const { P0, Q0, Vt } = op
  const S = Math.hypot(P0, Q0)
  const I0 = Vt > 0 ? S / Vt : 0
  const phi = Math.atan2(Q0, P0) // φ > 0 → corriente en atraso (genera Q)

  // δ0: ángulo entre el eje q (fasor E_Q = Vt + jXq·I) y la tensión en bornes.
  const delta0 = Math.atan2(
    m.Xq * I0 * Math.cos(phi),
    Vt + m.Xq * I0 * Math.sin(phi),
  )

  const Id = I0 * Math.sin(delta0 + phi)
  const Iq = I0 * Math.cos(delta0 + phi)
  const Vq = Vt * Math.cos(delta0)

  return {
    delta0,
    Eq1: Vq + m.Xd1 * Id,
    Eq2: Vq + m.Xd2 * Id,
    E: Vq + m.Xd * Id,
    I0,
    phi,
    Id,
    Iq,
  }
}

// ---------------------------------------------------------------------------
// Característica potencia-ángulo
// ---------------------------------------------------------------------------

/**
 * Construye Pe(δ) para el modelo transitorio de polos salientes:
 * término principal E'q·Vt/X'd más el par de reluctancia en sin 2δ.
 */
export function makePowerFunction(
  m: MachineParams,
  Vt: number,
  Eq1: number,
): (delta: number) => number {
  const k1 = (Eq1 * Vt) / m.Xd1
  const k2 = ((Vt * Vt) / 2) * (1 / m.Xq - 1 / m.Xd1)
  return (delta: number) => k1 * Math.sin(delta) + k2 * Math.sin(2 * delta)
}

interface StagePower {
  pre: (d: number) => number
  fault: (d: number) => number
  post: (d: number) => number
}

/** Pe(δ) por etapa según el tipo de evento. */
function buildStagePower(cfg: SimConfig, init: InitialConditions): StagePower {
  const peNormal = makePowerFunction(cfg.machine, cfg.op.Vt, init.Eq1)
  const zero = () => 0
  switch (cfg.event.type) {
    case 'short-circuit':
      // Falla trifásica en bornes: Vt = 0 ⇒ Pe = 0 durante la falla.
      return { pre: peNormal, fault: zero, post: peNormal }
    case 'load-rejection':
      // Apertura del interruptor principal: la máquina queda en vacío.
      return { pre: peNormal, fault: zero, post: zero }
    case 'torque-step':
      // La red no cambia; solo cambia Pm.
      return { pre: peNormal, fault: peNormal, post: peNormal }
  }
}

function stageAt(t: number, ev: EventConfig): Stage {
  if (t < ev.tFault) return 'pre'
  if (ev.type === 'short-circuit') {
    return t < ev.tFault + ev.tClearing ? 'fault' : 'post'
  }
  // Pérdida de carga y escalón de torque son eventos permanentes.
  return 'fault'
}

function mechanicalPower(t: number, cfg: SimConfig): number {
  if (cfg.event.type === 'torque-step' && t >= cfg.event.tFault) {
    return cfg.op.P0 + cfg.event.torqueStep
  }
  return cfg.op.P0
}

// ---------------------------------------------------------------------------
// Integrador RK4 de la ecuación de oscilación
// ---------------------------------------------------------------------------

interface SwingOutcome {
  samples: SimSample[]
  stable: boolean
  lossOfSyncTime: number | null
  maxDelta: number
  maxDOmega: number
}

/**
 * Integra la ecuación de oscilación con RK4.
 * Estado x = [δ, Δω]:
 *   dδ/dt  = Δω
 *   dΔω/dt = (ωs/2H)·(Pm − Pe(δ) − D·Δω/ωs)
 *
 * `tClearingOverride` permite reutilizar el integrador en la búsqueda
 * del tiempo crítico de despeje sin reconstruir la configuración.
 */
export function integrateSwing(
  cfg: SimConfig,
  init: InitialConditions,
  tClearingOverride?: number,
): SwingOutcome {
  const { machine: m, event } = cfg
  const ws = syncSpeed(m.f)
  const power = buildStagePower(cfg, init)
  const ev: EventConfig =
    tClearingOverride === undefined
      ? event
      : { ...event, tClearing: tClearingOverride }

  const steps = Math.ceil(cfg.tEnd / cfg.dt)
  const samples: SimSample[] = new Array(steps + 1)

  let delta = init.delta0
  let dOmega = 0
  let stable = true
  let lossOfSyncTime: number | null = null
  let maxDelta = delta
  let maxDOmega = 0

  const accel = (d: number, w: number, t: number): number => {
    const pe = power[stageAt(t, ev)](d)
    const pm = mechanicalPower(t, cfg)
    return (ws / (2 * m.H)) * (pm - pe - (m.D * w) / ws)
  }

  for (let i = 0; i <= steps; i++) {
    const t = i * cfg.dt
    const stage = stageAt(t, ev)
    const pe = power[stage](delta)
    const pm = mechanicalPower(t, cfg)
    samples[i] = { t, delta, dOmega, Pe: pe, Pm: pm, stage }

    if (delta > maxDelta) maxDelta = delta
    if (Math.abs(dOmega) > maxDOmega) maxDOmega = Math.abs(dOmega)

    // Criterio de pérdida de sincronismo: el ángulo supera 180° con el
    // rotor todavía acelerando ⇒ no hay par sincronizante que lo recupere.
    if (
      event.type !== 'load-rejection' &&
      stable &&
      delta > Math.PI &&
      dOmega > 0
    ) {
      stable = false
      lossOfSyncTime = t
    }

    if (i === steps) break

    const h = cfg.dt
    const k1d = dOmega
    const k1w = accel(delta, dOmega, t)
    const k2d = dOmega + (h / 2) * k1w
    const k2w = accel(delta + (h / 2) * k1d, dOmega + (h / 2) * k1w, t + h / 2)
    const k3d = dOmega + (h / 2) * k2w
    const k3w = accel(delta + (h / 2) * k2d, dOmega + (h / 2) * k2w, t + h / 2)
    const k4d = dOmega + h * k3w
    const k4w = accel(delta + h * k3d, dOmega + h * k3w, t + h)

    delta += (h / 6) * (k1d + 2 * k2d + 2 * k3d + k4d)
    dOmega += (h / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)
  }

  return { samples, stable, lossOfSyncTime, maxDelta, maxDOmega }
}

// ---------------------------------------------------------------------------
// Tiempo crítico de despeje (búsqueda por bisección sobre el integrador)
// ---------------------------------------------------------------------------

/**
 * Encuentra el tiempo crítico de despeje t_cr por bisección: el mayor
 * t_clearing para el cual el sistema permanece estable. Es un método
 * general que respeta la saliencia y el amortiguamiento (a diferencia de
 * la fórmula cerrada del criterio de áreas iguales para máquina lisa).
 */
export function findCriticalClearingTime(
  cfg: SimConfig,
  init: InitialConditions,
): number | null {
  if (cfg.event.type !== 'short-circuit') return null

  const isStable = (tc: number): boolean =>
    integrateSwing(cfg, init, tc).stable

  let lo = 0.01
  let hi = 1.5
  if (!isStable(lo)) return 0
  if (isStable(hi)) return null // estable incluso con despejes muy lentos

  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (isStable(mid)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ---------------------------------------------------------------------------
// Criterio de áreas iguales (integración numérica de las curvas reales)
// ---------------------------------------------------------------------------

function findEquilibria(
  pePost: (d: number) => number,
  Pm: number,
): { stableEq: number | null; unstableEq: number | null } {
  // Barrido fino de f(δ) = Pe_post(δ) − Pm en (0, π) buscando cambios de signo.
  const N = 4000
  const roots: number[] = []
  let prev = pePost(0) - Pm
  for (let i = 1; i <= N; i++) {
    const d = (i / N) * Math.PI
    const cur = pePost(d) - Pm
    if (prev <= 0 && cur > 0) roots.push(d) // cruce ascendente → equilibrio estable
    if (prev >= 0 && cur < 0) roots.push(d) // cruce descendente → equilibrio inestable
    prev = cur
  }
  if (roots.length === 0) return { stableEq: null, unstableEq: null }
  return {
    stableEq: roots[0],
    unstableEq: roots.length > 1 ? roots[roots.length - 1] : null,
  }
}

function trapz(fn: (d: number) => number, a: number, b: number): number {
  if (b <= a) return 0
  const N = 800
  const h = (b - a) / N
  let sum = (fn(a) + fn(b)) / 2
  for (let i = 1; i < N; i++) sum += fn(a + i * h)
  return sum * h
}

/**
 * Evalúa el criterio de áreas iguales para el cortocircuito en bornes:
 *  A1 = ∫[δ0→δcl] (Pm − Pe_falla) dδ   (área de aceleración)
 *  A2,max = ∫[δcl→δu] (Pe_post − Pm) dδ (área de desaceleración disponible)
 * y calcula δcr resolviendo A1(δcr) = A2(δcr) numéricamente.
 */
export function equalAreaAnalysis(
  cfg: SimConfig,
  init: InitialConditions,
  samples: SimSample[],
): EqualAreaResult | null {
  if (cfg.event.type !== 'short-circuit') return null

  const power = buildStagePower(cfg, init)
  const Pm = cfg.op.P0
  const { stableEq, unstableEq } = findEquilibria(power.post, Pm)

  // δ en el instante de despeje (de la trayectoria simulada real)
  const tClear = cfg.event.tFault + cfg.event.tClearing
  const idx = Math.min(
    samples.length - 1,
    Math.max(0, Math.round(tClear / cfg.dt)),
  )
  const deltaClear = samples[idx].delta

  const accelFn = (d: number) => Pm - power.fault(d)
  const decelFn = (d: number) => power.post(d) - Pm

  const A1 = trapz(accelFn, init.delta0, deltaClear)
  const A2max = unstableEq ? trapz(decelFn, deltaClear, unstableEq) : 0

  // Ángulo crítico: barrido de δcl hasta que A1 = A2,max
  let deltaCritical: number | null = null
  if (unstableEq) {
    const N = 1200
    for (let i = 1; i <= N; i++) {
      const d = init.delta0 + (i / N) * (unstableEq - init.delta0)
      const a1 = trapz(accelFn, init.delta0, d)
      const a2 = trapz(decelFn, d, unstableEq)
      if (a1 >= a2) {
        deltaCritical = d
        break
      }
    }
  }

  return {
    deltaClear,
    deltaCritical,
    deltaStableEq: stableEq,
    deltaUnstableEq: unstableEq,
    A1,
    A2max,
  }
}

// ---------------------------------------------------------------------------
// Curvas P-δ para graficar
// ---------------------------------------------------------------------------

export function buildPowerCurves(
  cfg: SimConfig,
  init: InitialConditions,
): PowerCurvePoint[] {
  const power = buildStagePower(cfg, init)
  const points: PowerCurvePoint[] = []
  for (let deg = 0; deg <= 180; deg += 1) {
    const d = (deg * Math.PI) / 180
    points.push({
      deltaDeg: deg,
      pre: power.pre(d),
      fault: power.fault(d),
      post: power.post(d),
    })
  }
  return points
}

// ---------------------------------------------------------------------------
// Corrientes de estator (ia, ib, ic) con componentes sub/transitoria y DC
// ---------------------------------------------------------------------------

export function shortCircuitLevels(
  m: MachineParams,
  init: InitialConditions,
): ShortCircuitLevels {
  return {
    Isub: init.Eq2 / m.Xd2,
    Itrans: init.Eq1 / m.Xd1,
    Iss: init.E / m.Xd,
  }
}

/** Envolvente de la corriente de cortocircuito I(t) en pu (valor eficaz). */
export function scEnvelope(
  tau: number,
  m: MachineParams,
  lv: ShortCircuitLevels,
): number {
  return (
    (lv.Isub - lv.Itrans) * Math.exp(-tau / m.Td2) +
    (lv.Itrans - lv.Iss) * Math.exp(-tau / m.Td1) +
    lv.Iss
  )
}

/**
 * Genera las corrientes trifásicas instantáneas en una ventana alrededor del
 * evento. Para el cortocircuito, cada fase lleva su componente AC con
 * envolvente decreciente más el offset DC (asimetría) que decae con Ta y que
 * se elige para garantizar continuidad de la corriente en el instante de falla.
 */
export function generateCurrents(
  cfg: SimConfig,
  init: InitialConditions,
  samples: SimSample[],
): CurrentsSample[] {
  const { machine: m, op, event: ev } = cfg
  const w = syncSpeed(m.f)
  const lv = shortCircuitLevels(m, init)

  const windowEnd =
    ev.type === 'short-circuit'
      ? Math.min(cfg.tEnd, ev.tFault + ev.tClearing + 0.45)
      : Math.min(cfg.tEnd, ev.tFault + 0.6)
  const windowStart = Math.max(0, ev.tFault - 0.06)
  const dtFine = 1 / (m.f * 48) // ~48 muestras por ciclo

  const lambdas = [0, -TWO_PI / 3, TWO_PI / 3] // fases a, b, c
  const tClear = ev.tFault + ev.tClearing

  const iLoad = (t: number, lambda: number): number =>
    SQRT2 * init.I0 * Math.cos(w * t + lambda - init.phi)

  // Amplitud de corriente "cuasiestática" para eventos sin cortocircuito,
  // siguiendo la potencia eléctrica de la simulación lenta.
  const iQuasi = (t: number, lambda: number): number => {
    const idx = Math.min(samples.length - 1, Math.max(0, Math.round(t / cfg.dt)))
    const s = samples[idx]
    const mag = op.Vt > 0 ? Math.hypot(s.Pe, op.Q0) / op.Vt : 0
    const ang = Math.atan2(op.Q0, Math.max(s.Pe, 1e-6))
    return SQRT2 * mag * Math.cos(w * t + lambda - ang)
  }

  // Offset DC por fase fijado por continuidad en t = tFault.
  const acFault = (t: number, lambda: number): number => {
    const tau = t - ev.tFault
    return SQRT2 * scEnvelope(tau, m, lv) * Math.cos(w * t + lambda - Math.PI / 2)
  }
  const dc0 = lambdas.map(
    (lambda) => iLoad(ev.tFault, lambda) - acFault(ev.tFault, lambda),
  )

  const iPhase = (t: number, k: number): number => {
    const lambda = lambdas[k]
    if (t < ev.tFault) return iLoad(t, lambda)

    if (ev.type === 'short-circuit') {
      if (t < tClear) {
        const tau = t - ev.tFault
        return acFault(t, lambda) + dc0[k] * Math.exp(-tau / m.Ta)
      }
      // Post-despeje: retorno exponencial a la corriente de carga.
      const residual = iPhase(tClear - 1e-9, k) - iLoad(tClear, lambda)
      return iLoad(t, lambda) + residual * Math.exp(-(t - tClear) / 0.04)
    }

    if (ev.type === 'load-rejection') {
      // El interruptor abre: la corriente se extingue en pocos ciclos.
      return iLoad(t, lambda) * Math.exp(-(t - ev.tFault) / 0.03)
    }

    return iQuasi(t, lambda)
  }

  const out: CurrentsSample[] = []
  for (let t = windowStart; t <= windowEnd; t += dtFine) {
    const inFault = ev.type === 'short-circuit' && t >= ev.tFault && t < tClear
    const env = inFault ? SQRT2 * scEnvelope(t - ev.tFault, m, lv) : null
    out.push({
      t,
      ia: iPhase(t, 0),
      ib: iPhase(t, 1),
      ic: iPhase(t, 2),
      envP: env,
      envM: env === null ? null : -env,
    })
  }
  return out
}

// ---------------------------------------------------------------------------
// Orquestador principal
// ---------------------------------------------------------------------------

export function runSimulation(cfg: SimConfig): SimResult {
  const init = computeInitialConditions(cfg.machine, cfg.op)
  const swing = integrateSwing(cfg, init)
  const tCritical = findCriticalClearingTime(cfg, init)
  const equalArea = equalAreaAnalysis(cfg, init, swing.samples)
  const powerCurves = buildPowerCurves(cfg, init)
  const currents = generateCurrents(cfg, init, swing.samples)
  const scLevels = shortCircuitLevels(cfg.machine, init)

  return {
    config: cfg,
    init,
    samples: swing.samples,
    stable: swing.stable,
    lossOfSyncTime: swing.lossOfSyncTime,
    maxDelta: swing.maxDelta,
    maxDOmega: swing.maxDOmega,
    tCritical,
    equalArea,
    powerCurves,
    currents,
    scLevels,
  }
}

export const toDeg = (rad: number): number => (rad * 180) / Math.PI
export const toRad = (deg: number): number => (deg * Math.PI) / 180
