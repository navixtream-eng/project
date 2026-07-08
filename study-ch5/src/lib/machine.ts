/**
 * Modelo de régimen permanente de la máquina sincrónica cilíndrica
 * (Fitzgerald–Kingsley–Umans, Cap. 5). Magnitudes en por unidad,
 * ángulos en radianes. Convención de GENERADOR: la corriente Ia sale
 * de la máquina y Eaf = Vt + jXs·Ia, con Vt como fasor de referencia.
 */

export interface Complex {
  re: number
  im: number
}

export const cx = (re: number, im: number): Complex => ({ re, im })
export const add = (a: Complex, b: Complex): Complex => cx(a.re + b.re, a.im + b.im)
export const sub = (a: Complex, b: Complex): Complex => cx(a.re - b.re, a.im - b.im)
export const scale = (a: Complex, k: number): Complex => cx(a.re * k, a.im * k)
export const mulJ = (a: Complex): Complex => cx(-a.im, a.re) // multiplicar por j
export const abs = (a: Complex): number => Math.hypot(a.re, a.im)
export const arg = (a: Complex): number => Math.atan2(a.im, a.re)
export const cis = (mag: number, ang: number): Complex =>
  cx(mag * Math.cos(ang), mag * Math.sin(ang))

export const toDeg = (rad: number): number => (rad * 180) / Math.PI
export const toRad = (deg: number): number => (deg * Math.PI) / 180

// ---------------------------------------------------------------------------
// Sección 1 — Velocidad síncrona
// ---------------------------------------------------------------------------

/** Velocidad síncrona mecánica en r/min: ns = 120·f / p. */
export const syncSpeedRpm = (f: number, poles: number): number => (120 * f) / poles

// ---------------------------------------------------------------------------
// Sección 2 — Circuito equivalente y diagrama fasorial (convención generador)
// ---------------------------------------------------------------------------

export interface OperatingSolution {
  /** Fasor de corriente de armadura [pu], Vt como referencia */
  Ia: Complex
  IaMag: number
  /** Ángulo del factor de potencia φ = −arg(Ia) [rad]; φ > 0 → corriente en atraso */
  phi: number
  /** Factor de potencia cos φ */
  pf: number
  /** true si la corriente atrasa a la tensión (máquina sobreexcitada como generador) */
  lagging: boolean
  /** Fasor de FEM interna Eaf = Vt + jXs·Ia [pu] */
  Eaf: Complex
  EafMag: number
  /** Ángulo de potencia δ = arg(Eaf) [rad] */
  delta: number
  /** Potencia activa entregada P = Re{Vt·Ia*} [pu] */
  P: number
  /** Potencia reactiva entregada Q = Im{Vt·Ia*} [pu] */
  Q: number
}

/** Resuelve el punto de operación a partir del fasor de corriente (para el widget arrastrable). */
export function solveFromIa(Vt: number, Ia: Complex, Xs: number): OperatingSolution {
  const Eaf = add(cx(Vt, 0), scale(mulJ(Ia), Xs))
  const P = Vt * Ia.re // Re{Vt·Ia*} con Vt real
  const Q = -Vt * Ia.im // Im{Vt·Ia*} = −Vt·Im(Ia)
  const phi = -arg(Ia)
  return {
    Ia,
    IaMag: abs(Ia),
    phi,
    pf: Math.cos(phi),
    lagging: phi > 0,
    Eaf,
    EafMag: abs(Eaf),
    delta: arg(Eaf),
    P,
    Q,
  }
}

/** Resuelve el punto de operación a partir de P y Q entregadas (para problemas resueltos). */
export function solveFromPQ(Vt: number, P: number, Q: number, Xs: number): OperatingSolution {
  // S = Vt·Ia*  ⇒  Ia = (P − jQ)/Vt  (Vt real de referencia)
  const Ia = cx(P / Vt, -Q / Vt)
  return solveFromIa(Vt, Ia, Xs)
}

/** Resuelve a partir de |Ia| y factor de potencia (enunciado típico de FKU). */
export function solveFromPf(
  Vt: number,
  IaMag: number,
  pf: number,
  lagging: boolean,
  Xs: number,
): OperatingSolution {
  const phi = Math.acos(Math.min(1, Math.max(-1, pf))) * (lagging ? 1 : -1)
  return solveFromIa(Vt, cis(IaMag, -phi), Xs)
}

/** Característica potencia-ángulo P(δ) = Eaf·Vt·sin δ / Xs (máquina cilíndrica). */
export const powerAngle = (Eaf: number, Vt: number, Xs: number, delta: number): number =>
  (Eaf * Vt * Math.sin(delta)) / Xs

/**
 * Punto de una curva V: dada P constante y |Eaf|, halla |Ia|, φ y Q.
 * δ sale de P = Eaf·Vt·sin δ / Xs; devuelve null si Eaf es insuficiente
 * para transmitir P (más allá del límite de estabilidad δ = 90°).
 */
export function vCurvePoint(
  P: number,
  EafMag: number,
  Vt: number,
  Xs: number,
): OperatingSolution | null {
  const sinDelta = (P * Xs) / (EafMag * Vt)
  if (sinDelta > 1) return null
  const delta = Math.asin(sinDelta)
  const Eaf = cis(EafMag, delta)
  // Ia = (Eaf − Vt) / (jXs)  ⇔  multiplicar por −j/Xs
  const diff = sub(Eaf, cx(Vt, 0))
  const Ia = cx(diff.im / Xs, -diff.re / Xs)
  return solveFromIa(Vt, Ia, Xs)
}

/** |Eaf| mínima capaz de transmitir P (δ = 90°): límite de estabilidad estática. */
export const minEafForP = (P: number, Vt: number, Xs: number): number => (P * Xs) / Vt

// ---------------------------------------------------------------------------
// Formato de números para los problemas resueltos (evita inconsistencias)
// ---------------------------------------------------------------------------

export const fmt = (x: number, digits = 3): string =>
  x.toLocaleString('es', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtDeg = (rad: number, digits = 1): string => `${fmt(toDeg(rad), digits)}^\\circ`

// ---------------------------------------------------------------------------
// Sección 3 — Característica potencia-ángulo y barra infinita
// ---------------------------------------------------------------------------

/** Potencia máxima transmisible (máquina cilíndrica): límite de estabilidad estática. */
export const pMax = (Eaf: number, Vt: number, Xs: number): number => (Eaf * Vt) / Xs

export interface SalientPowerComponents {
  /** Término de excitación: Eaf·Vt·sen δ / Xd */
  main: number
  /** Par de reluctancia: (Vt²/2)·(1/Xq − 1/Xd)·sen 2δ */
  reluctance: number
  total: number
}

/** Potencia de una máquina de polos salientes, separada en sus dos componentes. */
export function pSalient(
  Eaf: number,
  Vt: number,
  Xd: number,
  Xq: number,
  delta: number,
): SalientPowerComponents {
  const main = (Eaf * Vt * Math.sin(delta)) / Xd
  const reluctance = ((Vt * Vt) / 2) * (1 / Xq - 1 / Xd) * Math.sin(2 * delta)
  return { main, reluctance, total: main + reluctance }
}

/**
 * Equilibrios de P(δ) = Pm en (0, π): el primer cruce ascendente es el punto
 * de operación estable; el último cruce descendente, el equilibrio inestable.
 * Devuelve null si Pm supera la cresta de la curva (sin equilibrio posible).
 */
export function findPowerEquilibria(
  Pm: number,
  powerFn: (delta: number) => number,
): { stable: number | null; unstable: number | null } {
  const N = 3600
  let stable: number | null = null
  let unstable: number | null = null
  let prev = powerFn(0) - Pm
  for (let i = 1; i <= N; i++) {
    const d = (i / N) * Math.PI
    const cur = powerFn(d) - Pm
    if (prev < 0 && cur >= 0 && stable === null) stable = d
    if (prev >= 0 && cur < 0) unstable = d
    prev = cur
  }
  return { stable, unstable }
}

/** Coeficiente de par sincronizante dP/dδ [pu/rad] por derivada numérica. */
export function synchronizingCoeff(
  powerFn: (delta: number) => number,
  delta: number,
): number {
  const h = 1e-4
  return (powerFn(delta + h) - powerFn(delta - h)) / (2 * h)
}

/** Q entregada operando en δ con excitación Eaf (máquina cilíndrica). */
export const qAtDelta = (Eaf: number, Vt: number, Xs: number, delta: number): number =>
  (Eaf * Vt * Math.cos(delta) - Vt * Vt) / Xs

// ---------------------------------------------------------------------------
// Sección 4 — Carta de operación (curvas de capacidad) y motor sincrónico
// ---------------------------------------------------------------------------

/** Q máxima a potencia P sin exceder el calentamiento del ESTATOR (|S| ≤ Smax). */
export const qMaxArmature = (P: number, Smax: number): number | null =>
  P > Smax ? null : Math.sqrt(Smax * Smax - P * P)

/**
 * Q máxima a potencia P sin exceder el calentamiento del ROTOR (|Eaf| ≤ Eaf,max).
 * El límite de campo es un círculo en el plano P-Q centrado en
 * (Q = −Vt²/Xs, P = 0) con radio Eaf,max·Vt/Xs.
 */
export const qMaxField = (
  P: number,
  Vt: number,
  Xs: number,
  EafMax: number,
): number | null => {
  const r = (EafMax * Vt) / Xs
  if (P > r) return null
  return -((Vt * Vt) / Xs) + Math.sqrt(r * r - P * P)
}

export interface CapabilityCheck {
  feasible: boolean
  /** Límites violados en el punto (P, Q) */
  violations: ('armadura' | 'campo' | 'estabilidad' | 'turbina')[]
}

/** Evalúa un punto (P, Q) contra los cuatro cercos de la carta de operación. */
export function checkCapability(
  P: number,
  Q: number,
  Vt: number,
  Xs: number,
  Smax: number,
  EafMax: number,
  PmMax: number,
): CapabilityCheck {
  const violations: CapabilityCheck['violations'] = []
  if (Math.hypot(P, Q) > Smax) violations.push('armadura')
  const rField = (EafMax * Vt) / Xs
  if (Math.hypot(P, Q + (Vt * Vt) / Xs) > rField) violations.push('campo')
  if (Q < -((Vt * Vt) / Xs)) violations.push('estabilidad')
  if (P > PmMax) violations.push('turbina')
  return { feasible: violations.length === 0, violations }
}

/**
 * Motor sincrónico en convención de motor: absorbe P de la red y (si está
 * sobreexcitado) le entrega Q. Internamente reutiliza la convención de
 * generador con Ia invertida, de modo que Eaf = Vt − jXs·Ia,motor y δ < 0.
 */
export function solveMotor(
  Vt: number,
  Pabs: number,
  Qout: number,
  Xs: number,
): OperatingSolution {
  return solveFromIa(Vt, cx(-Pabs / Vt, -Qout / Vt), Xs)
}

// ---------------------------------------------------------------------------
// Sección 5 — Ensayos OCC/SCC y saturación
// ---------------------------------------------------------------------------

export interface OccModel {
  /** Pendiente de la línea de entrehierro [pu V / pu If] */
  k: number
  /** Tensión de techo de la saturación (forma del codo) [pu] */
  Vm: number
  /** Dureza del codo (mayor n = codo más abrupto) */
  n: number
}

/** Máquina de referencia: OCC que pasa por 1.0 pu con If = 1.0 pu. */
export const DEFAULT_OCC: OccModel = { k: 1.222, Vm: 1.3, n: 3 }

/** Línea de entrehierro: respuesta si el hierro nunca saturara. */
export const airGapVoltage = (If: number, m: OccModel): number => m.k * If

/**
 * Característica de circuito abierto (OCC): recorte suave de la línea de
 * entrehierro. Lineal abajo (manda el entrehierro), doblada arriba (el
 * hierro satura y cada amperio de campo rinde cada vez menos flujo).
 */
export const occVoltage = (If: number, m: OccModel): number => {
  const v = m.k * If
  return v / Math.pow(1 + Math.pow(v / m.Vm, m.n), 1 / m.n)
}

/**
 * Característica de cortocircuito (SCC): recta, porque con los bornes en
 * corto la reacción de armadura desmagnetiza casi todo el flujo y la
 * máquina trabaja en el tramo lineal (no saturado) de su hierro.
 */
export const sccCurrent = (If: number, m: OccModel, XsUnsat: number): number =>
  airGapVoltage(If, m) / XsUnsat

/** AFNL: corriente de campo que produce tensión nominal (1.0 pu) en vacío. */
export function findAfnl(m: OccModel): number {
  let lo = 0.01
  let hi = 10
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (occVoltage(mid, m) < 1) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** AFSC: corriente de campo que produce corriente nominal (1.0 pu) en corto. */
export const findAfsc = (m: OccModel, XsUnsat: number): number => XsUnsat / m.k

export interface TestResults {
  afnl: number
  afsc: number
  /** Relación de cortocircuito SCR = AFNL/AFSC */
  scr: number
  /** Xs no saturada = Vag/Isc (a cualquier If, es constante) */
  xsUnsat: number
  /** Xs saturada (definición FKU): 1.0 pu / Isc(AFNL) */
  xsSat: number
}

/** Parámetros que un ingeniero extrae del par de ensayos OCC + SCC. */
export function extractTestResults(m: OccModel, XsUnsat: number): TestResults {
  const afnl = findAfnl(m)
  const afsc = findAfsc(m, XsUnsat)
  return {
    afnl,
    afsc,
    scr: afnl / afsc,
    xsUnsat: XsUnsat,
    xsSat: 1 / sccCurrent(afnl, m, XsUnsat),
  }
}

// ---------------------------------------------------------------------------
// Sección 6 — Pérdidas y rendimiento
// ---------------------------------------------------------------------------

export interface LossParams {
  /** Resistencia de armadura Ra [pu] (incluye el efecto de pérdidas adicionales) */
  Ra: number
  /** Pérdidas mecánicas: fricción y ventilación [pu] (constantes a nₛ) */
  Pfw: number
  /** Pérdidas en el hierro del núcleo [pu] (constantes a Vt nominal) */
  Pcore: number
  /** Coeficiente de pérdidas de campo: Pf = kf·Eaf² [pu] (If ∝ Eaf en zona lineal) */
  kField: number
}

export interface LossBreakdown {
  /** Fricción y ventilación [pu] */
  mech: number
  /** Núcleo (histéresis + Foucault) [pu] */
  core: number
  /** Devanado de campo [pu] */
  field: number
  /** Cobre de armadura Ia²·Ra [pu] */
  copper: number
  total: number
  /** Potencia mecánica de entrada P + pérdidas [pu] */
  input: number
  /** Rendimiento η = P/(P + pérdidas) */
  eta: number
  /** Corriente de armadura del punto [pu] */
  IaMag: number
  /** FEM interna del punto [pu] */
  EafMag: number
}

/**
 * Desglose de pérdidas de un generador entregando P con el fp dado.
 * El cobre crece con Ia² (variable); fricción y núcleo son fijas; el campo
 * sigue a la excitación requerida por el punto de operación (vía Eaf).
 */
export function computeLosses(
  P: number,
  pf: number,
  lagging: boolean,
  Vt: number,
  Xs: number,
  params: LossParams,
): LossBreakdown {
  const IaMag = P > 0 ? P / (Vt * pf) : 0
  const sol = solveFromPf(Vt, IaMag, pf, lagging, Xs)
  const copper = IaMag * IaMag * params.Ra
  const field = params.kField * sol.EafMag * sol.EafMag
  const total = params.Pfw + params.Pcore + field + copper
  const input = P + total
  return {
    mech: params.Pfw,
    core: params.Pcore,
    field,
    copper,
    total,
    input,
    eta: P > 0 ? P / input : 0,
    IaMag,
    EafMag: sol.EafMag,
  }
}

/** Punto de rendimiento máximo: barrido numérico de la carga P. */
export function findMaxEfficiency(
  pf: number,
  lagging: boolean,
  Vt: number,
  Xs: number,
  params: LossParams,
): { P: number; eta: number } {
  let best = { P: 0, eta: 0 }
  for (let p = 0.02; p <= 1.3001; p += 0.005) {
    const { eta } = computeLosses(p, pf, lagging, Vt, Xs, params)
    if (eta > best.eta) best = { P: p, eta }
  }
  return best
}
