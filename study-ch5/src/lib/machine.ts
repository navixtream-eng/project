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

// ---------------------------------------------------------------------------
// Capítulo 6 — Régimen transitorio
// ---------------------------------------------------------------------------

export interface TransientParams {
  /** Reactancia sincrónica de eje d [pu] */
  Xd: number
  /** Reactancia transitoria X'd [pu] */
  Xd1: number
  /** Reactancia subtransitoria X''d [pu] */
  Xd2: number
  /** Constante de tiempo transitoria de cortocircuito T'd [s] */
  Td1: number
  /** Constante de tiempo subtransitoria T''d [s] */
  Td2: number
  /** Constante de tiempo de armadura Ta [s] (decaimiento del offset DC) */
  Ta: number
  /** Frecuencia [Hz] */
  f: number
}

export const DEFAULT_TRANSIENT: TransientParams = {
  Xd: 1.1, // la Xs saturada medida en la Sección 5
  Xd1: 0.3,
  Xd2: 0.2,
  Td1: 1.0,
  Td2: 0.035,
  Ta: 0.15,
  f: 60,
}

/** Niveles eficaces de la corriente de falla (máquina previamente en vacío con E pu). */
export function scLevels(E: number, p: TransientParams) {
  return { Isub: E / p.Xd2, Itrans: E / p.Xd1, Iss: E / p.Xd }
}

/**
 * Envolvente eficaz de la corriente de cortocircuito trifásico:
 * I(t) = (I''−I')e^(−t/T''d) + (I'−Iss)e^(−t/T'd) + Iss
 */
export function scEnvelope(t: number, E: number, p: TransientParams): number {
  const { Isub, Itrans, Iss } = scLevels(E, p)
  return (
    (Isub - Itrans) * Math.exp(-t / p.Td2) +
    (Itrans - Iss) * Math.exp(-t / p.Td1) +
    Iss
  )
}

/**
 * Corriente instantánea de la fase a tras una falla en t = 0 con la máquina
 * en vacío. α es el ángulo de la tensión de la fase en el instante de la
 * falla: fija el offset DC (α = 0 → asimetría máxima; α = ±90° → onda
 * simétrica). El offset garantiza i(0) = 0 (el flujo no puede saltar).
 */
export function scPhaseCurrent(
  t: number,
  alpha: number,
  E: number,
  p: TransientParams,
): number {
  const w = 2 * Math.PI * p.f
  const ac = Math.SQRT2 * scEnvelope(t, E, p) * Math.cos(w * t + alpha - Math.PI / 2)
  const dc = -Math.SQRT2 * (E / p.Xd2) * Math.cos(alpha - Math.PI / 2) * Math.exp(-t / p.Ta)
  return ac + dc
}

// --- Falla trifásica en un SISTEMA (Ejemplo 10-1 FKU) -----------------------

/**
 * Red del ejemplo 10-1: central hidroeléctrica → transformador → barras de
 * alta → doble circuito de transmisión → transformador → barra infinita.
 * Reactancias en pu sobre los KVA del generador; resistencias despreciadas.
 */
export interface FaultNetwork {
  /** Reactancias del generador [pu] */
  xd: number
  xd1: number
  xd2: number
  /** Transformador del generador [pu] */
  xTg: number
  /** Reactancia de CADA circuito de línea [pu] */
  xL: number
  /** Transformador receptor [pu] */
  xTr: number
  /** Tensión de la barra infinita [pu] */
  Eb: number
  /** Carga previa a la falla [pu de los KVA del generador] */
  P: number
  /** Factor de potencia en la barra infinita */
  pf: number
  lagging: boolean
  /** Circuitos de línea en servicio antes de la falla (1 o 2) */
  nLines: number
}

export const EJ10_1: FaultNetwork = {
  xd: 0.8,
  xd1: 0.3,
  xd2: 0.23,
  xTg: 0.1,
  xL: 0.6,
  xTr: 0.1,
  Eb: 1.0,
  P: 0.8,
  pf: 1.0,
  lagging: true,
  nLines: 2,
}

/** Dónde ocurre el cortocircuito trifásico franco. */
export type FaultNode = 'emisora' | 'receptora' | 'bornes'

export interface FaultResult {
  /** Líneas en paralelo [pu] */
  xLineEq: number
  /** Reactancia externa gen↔barra infinita antes de la falla [pu] */
  xExt: number
  /** Corriente de carga previa [pu] */
  Iload: number
  /** FEM internas (magnitud) detrás de cada reactancia, conservadas en la falla */
  Esub: number
  Etr: number
  Ess: number
  /** Reactancia del generador HASTA la falla en cada periodo [pu] */
  xGenSub: number
  xGenTr: number
  xGenSs: number
  /** Reactancia de la barra infinita hasta la falla [pu] */
  xInf: number
  /** Aportes del generador a la falla [pu] */
  IgenSub: number
  IgenTr: number
  IgenSs: number
  /** Aporte de la barra infinita a la falla [pu] */
  Iinf: number
  /** Corriente simétrica total en la falla, por periodo [pu] */
  IfSub: number
  IfTr: number
  IfSs: number
  /** Corriente eficaz asimétrica subtransitoria con offset DC máximo [pu] */
  IfSubAsym: number
  /** Aporte de la barra infinita que pasa por las líneas SANAS [pu] */
  infHealthy: number
  /** Corriente por el interruptor de cabecera de la línea fallada (periodo transitorio) [pu] */
  Ibreaker: number
}

/**
 * Resuelve la falla trifásica del ejemplo 10-1 para un nodo de falla dado.
 * Método: (1) hallar la corriente de carga previa y con ella las FEM internas
 * E″, E′, E (que se conservan en el instante de la falla); (2) reducir la red
 * a la reactancia del generador y la de la barra infinita HASTA la falla;
 * (3) superponer ambos aportes. La barra infinita no tiene decaimiento
 * subtransitorio/transitorio: su aporte es el mismo en los tres periodos.
 */
export function faultSolution(n: FaultNetwork, node: FaultNode = 'emisora'): FaultResult {
  const xLineEq = n.xL / n.nLines
  const xExt = n.xTg + xLineEq + n.xTr

  // Corriente de carga previa (barra infinita como referencia)
  const phi = Math.acos(Math.min(1, Math.max(-1, n.pf))) * (n.lagging ? 1 : -1)
  const Iload = n.P / n.pf / n.Eb
  const I = cis(Iload, -phi)

  // FEM interna (magnitud) detrás de la reactancia de máquina xM
  const internal = (xM: number) => abs(add(cx(n.Eb, 0), scale(mulJ(I), xExt + xM)))
  const Esub = internal(n.xd2)
  const Etr = internal(n.xd1)
  const Ess = internal(n.xd)

  // Reactancias HASTA la falla según su ubicación
  let xGen: (xM: number) => number
  let xInf: number
  if (node === 'receptora') {
    xGen = (xM) => xM + n.xTg + xLineEq
    xInf = n.xTr
  } else if (node === 'bornes') {
    xGen = (xM) => xM
    xInf = n.xTg + xLineEq + n.xTr
  } else {
    // 'emisora': barras de alta del lado del generador
    xGen = (xM) => xM + n.xTg
    xInf = n.xTr + xLineEq
  }
  const xGenSub = xGen(n.xd2)
  const xGenTr = xGen(n.xd1)
  const xGenSs = xGen(n.xd)

  const IgenSub = Esub / xGenSub
  const IgenTr = Etr / xGenTr
  const IgenSs = Ess / xGenSs
  const Iinf = n.Eb / xInf

  const IfSub = IgenSub + Iinf
  const IfTr = IgenTr + Iinf
  const IfSs = IgenSs + Iinf

  // Asimétrica con offset DC máximo en ambos aportes:
  // Irms = √(Iac² + Idc²), con Idc = √2·Iac  ⇒  √3·Iac
  const IfSubAsym = Math.sqrt(3) * IfSub

  // Interruptor de cabecera de la línea fallada: ve el aporte del generador
  // más el de la barra infinita que llega por las líneas SANAS (el aporte que
  // entra por la propia línea fallada llega desde el otro extremo).
  const infHealthy =
    node === 'emisora' ? ((n.nLines - 1) / n.nLines) * Iinf : Iinf
  const Ibreaker = IgenTr + infHealthy

  return {
    xLineEq,
    xExt,
    Iload,
    Esub,
    Etr,
    Ess,
    xGenSub,
    xGenTr,
    xGenSs,
    xInf,
    IgenSub,
    IgenTr,
    IgenSs,
    Iinf,
    IfSub,
    IfTr,
    IfSs,
    IfSubAsym,
    infHealthy,
    Ibreaker,
  }
}

// --- Ecuación de oscilación (modelo E' tras X'd contra barra infinita) -----

export interface SwingSample {
  t: number
  /** Ángulo de carga [rad] */
  delta: number
  /** Desviación de velocidad [rad/s] */
  dOmega: number
}

export interface SwingResult {
  samples: SwingSample[]
  stable: boolean
  lossOfSyncTime: number | null
  maxDelta: number
}

/**
 * Integra (2H/ωs)·δ̈ = Pm − Pe − D·Δω/ωs con RK4. Durante la falla
 * trifásica en bornes Pe = 0; tras el despeje, Pe = (E'·Vt/X'd)·sen δ.
 */
export function swingSimulation(
  Pm: number,
  Eprime: number,
  Vt: number,
  Xd1: number,
  H: number,
  D: number,
  f: number,
  tClear: number,
  tEnd = 5,
  dt = 0.002,
): SwingResult {
  const ws = 2 * Math.PI * f
  const pMaxPost = (Eprime * Vt) / Xd1
  const delta0 = Math.asin(Math.min(1, Pm / pMaxPost))
  const pe = (t: number, d: number) => (t < tClear ? 0 : pMaxPost * Math.sin(d))
  const acc = (t: number, d: number, w: number) =>
    (ws / (2 * H)) * (Pm - pe(t, d) - (D * w) / ws)

  const samples: SwingSample[] = []
  let delta = delta0
  let dOmega = 0
  let stable = true
  let lossOfSyncTime: number | null = null
  let maxDelta = delta

  const steps = Math.ceil(tEnd / dt)
  for (let i = 0; i <= steps; i++) {
    const t = i * dt
    if (i % 5 === 0) samples.push({ t, delta, dOmega })
    if (delta > maxDelta) maxDelta = delta
    if (stable && delta > Math.PI && dOmega > 0) {
      stable = false
      lossOfSyncTime = t
    }
    const k1d = dOmega
    const k1w = acc(t, delta, dOmega)
    const k2d = dOmega + (dt / 2) * k1w
    const k2w = acc(t + dt / 2, delta + (dt / 2) * k1d, dOmega + (dt / 2) * k1w)
    const k3d = dOmega + (dt / 2) * k2w
    const k3w = acc(t + dt / 2, delta + (dt / 2) * k2d, dOmega + (dt / 2) * k2w)
    const k4d = dOmega + dt * k3w
    const k4w = acc(t + dt, delta + dt * k3d, dOmega + dt * k3w)
    delta += (dt / 6) * (k1d + 2 * k2d + 2 * k3d + k4d)
    dOmega += (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)
  }
  return { samples, stable, lossOfSyncTime, maxDelta }
}

/** Tiempo crítico de despeje por bisección sobre el propio integrador. */
export function criticalClearingTime(
  Pm: number,
  Eprime: number,
  Vt: number,
  Xd1: number,
  H: number,
  D: number,
  f: number,
): number | null {
  const stableAt = (tc: number) =>
    swingSimulation(Pm, Eprime, Vt, Xd1, H, D, f, tc, 4, 0.004).stable
  let lo = 0.01
  let hi = 1.2
  if (!stableAt(lo)) return 0
  if (stableAt(hi)) return null
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (stableAt(mid)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// --- Criterio de áreas iguales (falla trifásica en bornes: Pe = 0) --------

/** Ángulo de equilibrio inestable post-falla: δu = π − δ0. */
export const eaDeltaU = (delta0: number): number => Math.PI - delta0

/** Área de aceleración A1 = Pm·(δcl − δ0), con Pe = 0 durante la falla. */
export const eaA1 = (Pm: number, delta0: number, deltaCl: number): number =>
  Pm * (deltaCl - delta0)

/** Área de desaceleración disponible A2 = ∫[δcl→δu](Pmax·sen δ − Pm)dδ. */
export const eaA2 = (Pm: number, Pmax: number, deltaCl: number, deltaU: number): number =>
  Pmax * (Math.cos(deltaCl) - Math.cos(deltaU)) - Pm * (deltaU - deltaCl)

/**
 * Ángulo crítico de despeje (forma cerrada, Pe = 0 en falla):
 * de A1 = A2 sale  cos δcr = cos δu + (Pm/Pmax)(δu − δ0).
 */
export function eaDeltaCritical(Pm: number, Pmax: number): number {
  const d0 = Math.asin(Math.min(1, Pm / Pmax))
  const du = eaDeltaU(d0)
  const c = Math.cos(du) + (Pm / Pmax) * (du - d0)
  return Math.acos(Math.max(-1, Math.min(1, c)))
}

/**
 * Tiempo para que δ alcance δcl durante la falla (Pe = 0 ⇒ aceleración
 * constante): δ(t) = δ0 + (ωs·Pm/4H)·t²  ⇒  t = √(4H(δcl−δ0)/(ωs·Pm)).
 */
export const eaTimeToAngle = (
  deltaCl: number,
  delta0: number,
  Pm: number,
  H: number,
  f: number,
): number => Math.sqrt((4 * H * Math.max(0, deltaCl - delta0)) / (2 * Math.PI * f * Pm))

// ---------------------------------------------------------------------------
// Capítulo 3 — Conversión de energía electromecánica
// ---------------------------------------------------------------------------

/**
 * Característica de magnetización saturable λ(i, g) de un sistema de
 * excitación simple con entrehierro g [mm]. La pendiente (inductancia no
 * saturada) crece al cerrar el gap; el codo λsat es fijo (lo pone el hierro).
 */
export const LAMBDA_SAT = 1.4 // Wb·vuelta (codo de saturación)
export function lambdaOfI(i: number, gMm: number): number {
  // Inductancia no saturada ∝ 1/g: gap chico ⇒ mucha pendiente.
  const L0 = 0.9 / (gMm + 0.4)
  return LAMBDA_SAT * Math.tanh((L0 * i) / LAMBDA_SAT)
}
/** Inversa: corriente necesaria para un enlace de flujo λ dado. */
export function iOfLambda(lam: number, gMm: number): number {
  const L0 = 0.9 / (gMm + 0.4)
  const x = Math.max(-0.999, Math.min(0.999, lam / LAMBDA_SAT))
  return (LAMBDA_SAT * Math.atanh(x)) / L0
}
/** Coenergía W'fld = ∫₀ⁱ λ di [J] (área BAJO la curva). */
export function coenergy(i: number, gMm: number): number {
  const n = 200
  let s = 0
  for (let k = 0; k < n; k++) s += lambdaOfI(((k + 0.5) / n) * i, gMm) * (i / n)
  return s
}
/** Energía Wfld = ∫₀^λ i dλ [J] (área a la IZQUIERDA de la curva). */
export function fieldEnergy(i: number, gMm: number): number {
  const lam = lambdaOfI(i, gMm)
  return lam * i - coenergy(i, gMm) // Wfld = λi − W'fld (el rectángulo menos la coenergía)
}

/** Fuerza de un actuador de émbolo: f = ½·μ₀N²A·i²/g² [N] (atractiva, cierra el gap). */
export const MU0 = 4 * Math.PI * 1e-7
export function actuatorForce(N: number, A: number, i: number, gMm: number): number {
  const g = gMm / 1000
  return (0.5 * MU0 * N * N * A * i * i) / (g * g)
}
export function actuatorL(N: number, A: number, gMm: number): number {
  return (MU0 * N * N * A) / (gMm / 1000)
}

/** Par de un sistema de doble excitación: T = is·ir·dLsr/dθ = −M·is·ir·senθ [N·m]. */
export function mutualTorque(M: number, is: number, ir: number, thetaRad: number): number {
  return -M * is * ir * Math.sin(thetaRad)
}

/**
 * Punto de operación de un imán permanente: intersección de la recta de
 * carga (pendiente fija por la geometría del gap) con la curva de
 * desmagnetización lineal Bm = Br + μrec·μ₀·Hm (segundo cuadrante).
 * Devuelve (Hm < 0, Bm > 0) y el producto de energía |BH|.
 */
export function pmOperatingPoint(Br: number, muRec: number, permeance: number) {
  // Recta de desmagnetización: Bm = Br + muRec·μ₀·Hm  (Hm en A/m)
  // Recta de carga:          Bm = −permeance·μ₀·Hm     (permeance = Am·lm/(Ag·g))
  const slopeMag = muRec * MU0
  const Hm = -Br / (slopeMag + permeance * MU0)
  const Bm = Br + slopeMag * Hm
  return { Hm, Bm, energyProduct: Math.abs(Bm * Hm) }
}

// ---------------------------------------------------------------------------
// Capítulo 7 — Máquinas de inducción (motor asíncrono polifásico)
// ---------------------------------------------------------------------------

/** Divide complejos: a / b. */
export const cdiv = (a: Complex, b: Complex): Complex => {
  const d = b.re * b.re + b.im * b.im
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d)
}
/** Multiplica complejos: a · b. */
export const cmul = (a: Complex, b: Complex): Complex =>
  cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re)
/** Paralelo de dos impedancias: (a·b)/(a+b). */
export const cpar = (a: Complex, b: Complex): Complex => cdiv(cmul(a, b), add(a, b))

/**
 * Parámetros del circuito equivalente por fase del motor de inducción,
 * referidos al estator. Convención de motor: la corriente ENTRA a la máquina.
 */
export interface InductionParams {
  /** Tensión de fase aplicada [V] */
  V: number
  /** Frecuencia de línea [Hz] */
  f: number
  /** Número de polos */
  poles: number
  /** Resistencia del estator R1 [Ω] */
  R1: number
  /** Reactancia de dispersión del estator X1 [Ω] */
  X1: number
  /** Resistencia del rotor referida R2 [Ω] */
  R2: number
  /** Reactancia de dispersión del rotor referida X2 [Ω] */
  X2: number
  /** Reactancia de magnetización Xm [Ω] */
  Xm: number
  /** Pérdidas en el núcleo [W trifásicos] (modeladas aparte de la rama) */
  Pcore: number
  /** Pérdidas por fricción y ventilación [W] */
  Pfw: number
}

/** Motor de 4 polos, 60 Hz, 460 V (fase), tamaño mediano — parámetros típicos. */
export const DEFAULT_INDUCTION: InductionParams = {
  V: 460 / Math.sqrt(3),
  f: 60,
  poles: 4,
  R1: 0.2,
  X1: 0.5,
  R2: 0.15,
  X2: 0.5,
  Xm: 15,
  Pcore: 400,
  Pfw: 250,
}

/** Velocidad síncrona mecánica [rad/s] a partir de f y polos. */
export const syncSpeedRad = (f: number, poles: number): number =>
  (2 * Math.PI * f) / (poles / 2)

/** Frecuencia de las variables del rotor: fr = s·fe. */
export const rotorFrequency = (s: number, f: number): number => s * f

export interface InductionPoint {
  s: number
  /** Velocidad mecánica [r/min] */
  nm: number
  /** Corriente de línea (estator) [A] y su magnitud */
  I1: Complex
  I1mag: number
  /** Factor de potencia de entrada */
  pf: number
  /** Corriente del rotor referida [A] */
  I2mag: number
  /** Potencia de entrehierro (trifásica) [W] */
  Pgap: number
  /** Par electromagnético interno [N·m] */
  Tind: number
  /** Pérdidas en el cobre del estator [W] */
  Pscl: number
  /** Pérdidas en el cobre del rotor [W] = s·Pgap */
  Prcl: number
  /** Potencia mecánica desarrollada [W] = (1−s)·Pgap */
  Pmech: number
  /** Potencia de entrada [W] */
  Pin: number
  /** Potencia de salida en el eje [W] = Pmech − Pfw */
  Pout: number
  /** Rendimiento */
  eff: number
}

/**
 * Resuelve el circuito equivalente para un deslizamiento s dado.
 * Rama del rotor: R2/s + jX2. Rama de magnetización: jXm en paralelo.
 * Pgap = 3·|I2|²·(R2/s); Tind = Pgap/ωs; Prcl = s·Pgap; Pmech = (1−s)·Pgap.
 */
export function inductionSolve(p: InductionParams, s: number): InductionPoint {
  const ws = syncSpeedRad(p.f, p.poles)
  const ns = (120 * p.f) / p.poles
  const ss = Math.abs(s) < 1e-6 ? 1e-6 : s
  const Zstator = cx(p.R1, p.X1)
  const Zrotor = cx(p.R2 / ss, p.X2)
  const Zmag = cx(0, p.Xm)
  const Zf = cpar(Zrotor, Zmag) // rama de rotor ∥ magnetización
  const Zin = add(Zstator, Zf)
  const Vp = cx(p.V, 0)
  const I1 = cdiv(Vp, Zin)
  const E = cmul(I1, Zf) // tensión de entrehierro (sobre la rama paralela)
  const I2 = cdiv(E, Zrotor)
  const I2mag = abs(I2)
  const Pgap = 3 * I2mag * I2mag * (p.R2 / ss)
  const Tind = Pgap / ws
  const Pscl = 3 * abs(I1) * abs(I1) * p.R1
  const Prcl = ss * Pgap
  const Pmech = (1 - ss) * Pgap
  const Pin = 3 * (Vp.re * I1.re + Vp.im * I1.im) // 3·Re{V·I1*}, V real
  const Pout = Pmech - p.Pfw
  const eff = Pin > 0 ? Pout / (Pin + p.Pcore) : 0
  const pf = I1.re / abs(I1)
  return {
    s,
    nm: (1 - s) * ns,
    I1,
    I1mag: abs(I1),
    pf,
    I2mag,
    Pgap,
    Tind,
    Pscl,
    Prcl,
    Pmech,
    Pin: Pin + p.Pcore,
    Pout,
    eff,
  }
}

export interface Thevenin {
  Vth: number
  Rth: number
  Xth: number
}

/**
 * Equivalente de Thévenin visto por la rama del rotor (desde el entrehierro
 * hacia la fuente): fuente V detrás de R1+jX1, con jXm en paralelo.
 */
export function inductionThevenin(p: InductionParams): Thevenin {
  const Zm = cx(0, p.Xm)
  const Zs = cx(p.R1, p.X1)
  const Vth = abs(cmul(cx(p.V, 0), cdiv(Zm, add(Zs, Zm))))
  const Zth = cpar(Zs, Zm)
  return { Vth, Rth: Zth.re, Xth: Zth.im }
}

/**
 * Par electromagnético por la fórmula de Thévenin (independiente de la rama
 * de magnetización): T(s) = (3/ωs)·Vth²·(R2/s) / [(Rth+R2/s)² + (Xth+X2)²].
 */
export function inductionTorque(p: InductionParams, s: number): number {
  const ws = syncSpeedRad(p.f, p.poles)
  const th = inductionThevenin(p)
  const ss = Math.abs(s) < 1e-6 ? 1e-6 : s
  const denom = Math.pow(th.Rth + p.R2 / ss, 2) + Math.pow(th.Xth + p.X2, 2)
  return (3 / ws) * (th.Vth * th.Vth * (p.R2 / ss)) / denom
}

/**
 * Par máximo (de ruptura) y deslizamiento al que ocurre.
 * s_maxT = R2 / √(Rth² + (Xth+X2)²)  → depende de R2.
 * T_max  = (3/2ωs)·Vth² / [Rth + √(Rth² + (Xth+X2)²)]  → NO depende de R2.
 */
export function inductionMaxTorque(p: InductionParams): { Tmax: number; sMax: number } {
  const ws = syncSpeedRad(p.f, p.poles)
  const th = inductionThevenin(p)
  const root = Math.sqrt(th.Rth * th.Rth + Math.pow(th.Xth + p.X2, 2))
  const sMax = p.R2 / root
  const Tmax = (3 / (2 * ws)) * (th.Vth * th.Vth) / (th.Rth + root)
  return { Tmax, sMax }
}

/** Par de arranque (s = 1). */
export const inductionStartTorque = (p: InductionParams): number => inductionTorque(p, 1)

// ---------------------------------------------------------------------------
// Capítulo 8 — Dinámica y control de la máquina de inducción
// ---------------------------------------------------------------------------

/**
 * Transformación de Park (abc → dq0) a un ángulo de marco θ dado.
 * Convención amplitud-invariante (factor 2/3). Devuelve (d, q, 0).
 */
export function abcToDq(a: number, b: number, c: number, theta: number): { d: number; q: number; z: number } {
  const k = 2 / 3
  const d = k * (a * Math.cos(theta) + b * Math.cos(theta - (2 * Math.PI) / 3) + c * Math.cos(theta + (2 * Math.PI) / 3))
  const q = -k * (a * Math.sin(theta) + b * Math.sin(theta - (2 * Math.PI) / 3) + c * Math.sin(theta + (2 * Math.PI) / 3))
  const z = k * 0.5 * (a + b + c)
  return { d, q, z }
}

/** Terna trifásica balanceada de amplitud Amp, frecuencia angular w, en el instante t. */
export function threePhase(amp: number, w: number, t: number, phase = 0): [number, number, number] {
  return [
    amp * Math.cos(w * t + phase),
    amp * Math.cos(w * t + phase - (2 * Math.PI) / 3),
    amp * Math.cos(w * t + phase + (2 * Math.PI) / 3),
  ]
}

// --- Control escalar V/f -----------------------------------------------------

/**
 * Perfil de tensión del control V/f: sube proporcional a la frecuencia hasta
 * la nominal (flujo constante) y se satura en Vrated por encima (debilitamiento
 * de campo). `boost` es un pequeño refuerzo a baja frecuencia para vencer R1.
 */
export function vfVoltage(f: number, fBase: number, Vrated: number, boost = 0): number {
  if (f <= 0) return boost
  if (f >= fBase) return Vrated
  return boost + (Vrated - boost) * (f / fBase)
}

/**
 * Parámetros del motor a una frecuencia de alimentación f distinta de la
 * nominal: las reactancias escalan con f y la tensión la fija el perfil V/f.
 * Permite reutilizar inductionTorque/inductionMaxTorque a cualquier frecuencia.
 */
export function inductionAtFreq(base: InductionParams, f: number, V: number): InductionParams {
  const k = f / base.f
  return { ...base, f, V, X1: base.X1 * k, X2: base.X2 * k, Xm: base.Xm * k }
}

/** Región de operación del V/f: par constante (f ≤ fBase) o debilitamiento de campo. */
export const vfRegion = (f: number, fBase: number): 'par-constante' | 'debilitamiento' =>
  f <= fBase ? 'par-constante' : 'debilitamiento'

// --- Control vectorial (FOC) -------------------------------------------------

export interface FocParams {
  polePairs: number
  /** Inductancia mutua [H] */
  Lm: number
  /** Inductancia del rotor [H] */
  Lr: number
  idRated: number
  iqRated: number
}

export const DEFAULT_FOC: FocParams = {
  polePairs: 2,
  Lm: 0.04,
  Lr: 0.042,
  idRated: 5,
  iqRated: 15,
}

/** Enlace de flujo del rotor en régimen (FOC): λr = Lm·id. */
export const focFlux = (Lm: number, id: number): number => Lm * id

/**
 * Par en control por orientación de campo: T = (3/2)(p/2)(Lm/Lr)·λr·iq.
 * Desacoplado: λr solo depende de id; a flujo fijo, T es lineal en iq.
 */
export function focTorque(p: FocParams, id: number, iq: number): number {
  const lambdaR = focFlux(p.Lm, id)
  return 1.5 * p.polePairs * (p.Lm / p.Lr) * lambdaR * iq
}

// --- Inversor y PWM ----------------------------------------------------------

/** Amplitud del fundamental de una PWM senoidal (región lineal): m·Vdc/2. */
export const pwmFundamental = (m: number, Vdc: number): number => m * (Vdc / 2)

/** Onda portadora triangular normalizada [-1, 1] de frecuencia fc en el instante t. */
export function triangleWave(t: number, fc: number): number {
  const x = ((t * fc) % 1 + 1) % 1
  return 4 * Math.abs(x - 0.5) - 1
}

// ---------------------------------------------------------------------------
// Capítulo 9 — Máquinas de corriente continua (CC)
// ---------------------------------------------------------------------------

/** Constante de la armadura: Ka = P·Z / (2π·a). */
export const dcKa = (P: number, Z: number, a: number): number => (P * Z) / (2 * Math.PI * a)

/** FEM inducida: Ea = Ka·Φ·ωm [V]. */
export const dcEmf = (Ka: number, phi: number, omega: number): number => Ka * phi * omega
/** Par electromagnético: T = Ka·Φ·Ia [N·m]. */
export const dcTorque = (Ka: number, phi: number, Ia: number): number => Ka * phi * Ia

export interface DcParams {
  /** Tensión de terminales [V] */
  Vt: number
  /** Resistencia de armadura [Ω] */
  Ra: number
  /** Resistencia del campo serie [Ω] */
  Rs: number
  /** Constante de máquina por flujo del campo shunt/independiente, KE = Ka·Φ [V·s/rad] */
  KE: number
  /** Pendiente del campo serie, ks = Ka·(dΦ/dIa) [(V·s/rad)/A] */
  ks: number
  /** Corriente de campo shunt [A] (para el balance de potencia) */
  If: number
  /** Pérdidas rotacionales: núcleo + fricción y ventilación [W] */
  Prot: number
  /** Fracción de pérdidas indeterminadas (stray load) sobre la potencia de entrada */
  strayFrac: number
}

/** Motor de CC de tamaño medio (~10 kW) — parámetros típicos. */
export const DEFAULT_DC: DcParams = {
  Vt: 240,
  Ra: 0.4,
  Rs: 0.3,
  KE: 1.7,
  ks: 0.045,
  If: 2,
  Prot: 600,
  strayFrac: 0.01,
}

export type DcConnection = 'shunt' | 'serie' | 'acumulativa' | 'diferencial'

/** ¿La conexión pone el campo serie en el lazo de armadura? */
const dcHasSeries = (c: DcConnection): boolean => c !== 'shunt'

/** Producto Ka·Φ efectivo [V·s/rad] según la conexión y la corriente de armadura. */
export function dcKphi(conn: DcConnection, p: DcParams, Ia: number): number {
  if (conn === 'serie') return p.ks * Ia
  if (conn === 'acumulativa') return p.KE + p.ks * Ia
  if (conn === 'diferencial') return Math.max(0.02, p.KE - p.ks * Ia)
  return p.KE
}

export interface DcPoint {
  Ia: number
  kPhi: number
  Ea: number
  /** Velocidad [rad/s] */
  omega: number
  /** Velocidad [r/min] */
  rpm: number
  /** Par [N·m] */
  T: number
}

/** Punto de operación (motor) a una corriente de armadura dada. */
export function dcOperatingByIa(conn: DcConnection, p: DcParams, Ia: number): DcPoint {
  const R = p.Ra + (dcHasSeries(conn) ? p.Rs : 0)
  const Ea = p.Vt - Ia * R
  const kPhi = dcKphi(conn, p, Ia)
  const omega = kPhi > 1e-3 ? Ea / kPhi : Infinity
  const T = kPhi * Ia
  return { Ia, kPhi, Ea, omega, rpm: (omega * 60) / (2 * Math.PI), T }
}

export interface DcPower {
  Pin: number
  PcuArm: number
  Pfield: number
  Pdev: number
  Pcore: number
  Pmech: number
  Pstray: number
  Pout: number
  eff: number
  Ea: number
}

/**
 * Flujo de potencia (motor): Pin = Vt·(Ia+If); pérdidas de cobre en armadura y
 * campo; potencia desarrollada Pdev = Ea·Ia; pérdidas rotacionales e
 * indeterminadas; salida en el eje. `generator` invierte el balance.
 */
export function dcPowerFlow(
  conn: DcConnection,
  p: DcParams,
  Ia: number,
  generator = false,
): DcPower {
  const R = p.Ra + (dcHasSeries(conn) ? p.Rs : 0)
  const Ea = p.Vt - (generator ? -1 : 1) * Ia * R // generador: Ea = Vt + Ia·R
  const isShunt = conn === 'shunt' || conn === 'acumulativa' || conn === 'diferencial'
  const Ifield = isShunt ? p.If : 0
  const PcuArm = Ia * Ia * R
  const Pfield = p.Vt * Ifield
  const Pdev = Ea * Ia
  const Pcore = p.Prot * 0.55
  const Pmech = p.Prot * 0.45
  const half = Pcore + Pmech
  if (!generator) {
    const Pin = p.Vt * (Ia + Ifield)
    const Pstray = p.strayFrac * Pin
    const Pout = Pdev - half - Pstray
    return { Pin, PcuArm, Pfield, Pdev, Pcore, Pmech, Pstray, Pout, eff: Pin > 0 ? Pout / Pin : 0, Ea }
  }
  // Generador: entra potencia mecánica, sale eléctrica
  const Pmecin = Pdev + half
  const Pstray = p.strayFrac * Pmecin
  const Pout = p.Vt * Ia - Pfield // potencia eléctrica útil en terminales
  const Pin = Pmecin + Pstray
  return { Pin, PcuArm, Pfield, Pdev, Pcore, Pmech, Pstray, Pout, eff: Pin > 0 ? Pout / Pin : 0, Ea }
}

/**
 * Reacción de armadura: densidad de flujo bajo el arco polar. El campo
 * principal (uniforme) se suma a la FMM de armadura (lineal, cruzada), lo que
 * apila el flujo en una punta polar y lo vacía en la otra; la saturación
 * recorta la punta apilada, dando una pérdida NETA de flujo. Devuelve la
 * curva B(x) y el desplazamiento del eje neutro.
 */
export function armatureReaction(
  IaRel: number, // 0..1 (corriente de armadura relativa)
  compensated: boolean,
  n = 41,
): { xs: number[]; b: number[]; neutralShiftDeg: number; fluxLoss: number } {
  const Bfield = 1.0
  const Bsat = 1.35
  const armPeak = compensated ? 0.05 : 0.9 * IaRel
  const xs: number[] = []
  const b: number[] = []
  let fluxWith = 0
  let fluxBase = 0
  for (let i = 0; i < n; i++) {
    const x = -1 + (2 * i) / (n - 1) // −1..1 a lo ancho del polo
    xs.push(x)
    const raw = Bfield + armPeak * x // FMM cruzada lineal
    const bs = Math.min(Bsat, Math.max(0, raw)) // saturación recorta la punta
    b.push(bs)
    fluxWith += bs
    fluxBase += Bfield
  }
  // El eje neutro se corre hacia donde el flujo se anula; aproximación por el pico de armadura
  const neutralShiftDeg = compensated ? 0 : 30 * IaRel
  const fluxLoss = Math.max(0, (fluxBase - fluxWith) / fluxBase)
  return { xs, b, neutralShiftDeg, fluxLoss }
}

// ---------------------------------------------------------------------------
// Capítulo 10 — Dinámica y transitorios en máquinas de CC
// ---------------------------------------------------------------------------

export interface DcDynamics {
  /** Tensión de armadura [V] */
  Vt: number
  /** Resistencia de armadura [Ω] */
  Ra: number
  /** Inductancia de armadura [H] */
  La: number
  /** Constante de máquina Ka·Φ [V·s/rad = N·m/A] */
  kPhi: number
  /** Inercia del rotor+carga [kg·m²] */
  J: number
  /** Fricción viscosa [N·m·s/rad] */
  B: number
}

export const DEFAULT_DCDYN: DcDynamics = {
  Vt: 240,
  Ra: 0.5,
  La: 0.004,
  kPhi: 1.2,
  J: 0.15,
  B: 0.03,
}

/** Constantes de tiempo eléctrica (La/Ra) y mecánica (J·Ra/(Ka·Φ)²). */
export function dcTimeConstants(p: DcDynamics): { taue: number; taum: number } {
  return { taue: p.La / p.Ra, taum: (p.J * p.Ra) / (p.kPhi * p.kPhi) }
}

/**
 * Sistema de segundo orden Ω(s)/Va(s) = kΦ / [La·J·s² + (Ra·J+La·B)s + (Ra·B+kΦ²)].
 * Devuelve la frecuencia natural, el amortiguamiento y el régimen.
 */
export function dcSecondOrder(p: DcDynamics): {
  wn: number
  zeta: number
  regime: 'sobreamortiguado' | 'crítico' | 'subamortiguado'
} {
  const a = p.La * p.J
  const b = p.Ra * p.J + p.La * p.B
  const c = p.Ra * p.B + p.kPhi * p.kPhi
  const wn = Math.sqrt(c / a)
  const zeta = b / (2 * Math.sqrt(a * c))
  const regime = zeta > 1.03 ? 'sobreamortiguado' : zeta < 0.97 ? 'subamortiguado' : 'crítico'
  return { wn, zeta, regime }
}

export interface DcDynSample {
  t: number
  ia: number
  omega: number
  rpm: number
  T: number
}

/**
 * Integra las ODE acopladas de la máquina de CC con RK4:
 *   La·dia/dt = va(t) − Ra·ia − kΦ·ω
 *   J·dω/dt   = kΦ·ia − Tload(t) − B·ω
 * va y Tload son funciones del tiempo (permiten escalones y rampas).
 */
export function dcDynSim(
  p: DcDynamics,
  va: (t: number) => number,
  tload: (t: number) => number,
  tEnd: number,
  dt = 0.0002,
  sampleEvery = 5,
): DcDynSample[] {
  const deriv = (t: number, ia: number, w: number): [number, number] => [
    (va(t) - p.Ra * ia - p.kPhi * w) / p.La,
    (p.kPhi * ia - tload(t) - p.B * w) / p.J,
  ]
  const out: DcDynSample[] = []
  let ia = 0
  let w = 0
  const steps = Math.ceil(tEnd / dt)
  for (let i = 0; i <= steps; i++) {
    const t = i * dt
    if (i % sampleEvery === 0) out.push({ t, ia, omega: w, rpm: (w * 60) / (2 * Math.PI), T: p.kPhi * ia })
    const [k1a, k1w] = deriv(t, ia, w)
    const [k2a, k2w] = deriv(t + dt / 2, ia + (k1a * dt) / 2, w + (k1w * dt) / 2)
    const [k3a, k3w] = deriv(t + dt / 2, ia + (k2a * dt) / 2, w + (k2w * dt) / 2)
    const [k4a, k4w] = deriv(t + dt, ia + k3a * dt, w + k3w * dt)
    ia += (dt / 6) * (k1a + 2 * k2a + 2 * k3a + k4a)
    w += (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w)
  }
  return out
}

/** Corriente de arranque directo (rotor parado, Ea = 0): Iarr = Vt/Ra. */
export const dcStartCurrent = (Vt: number, Ra: number): number => Vt / Ra

/**
 * Accionamiento con control en cascada: lazo externo de VELOCIDAD (PI) que
 * fija la referencia de corriente (limitada a ±Imax), y lazo interno de
 * CORRIENTE (PI) que fija la tensión (limitada a ±Vmax). Simula el
 * seguimiento de una referencia de velocidad ante una perturbación de carga.
 */
export interface DcDriveSample {
  t: number
  wref: number
  omega: number
  rpm: number
  ia: number
  iaRef: number
}

export function dcDriveSim(
  p: DcDynamics,
  wref: (t: number) => number,
  tload: (t: number) => number,
  gains: { kpS: number; kiS: number; kpC: number; kiC: number; Imax: number; Vmax: number },
  tEnd: number,
  dt = 0.0002,
  sampleEvery = 5,
): DcDriveSample[] {
  const out: DcDriveSample[] = []
  let ia = 0
  let w = 0
  let intS = 0 // integral del lazo de velocidad
  let intC = 0 // integral del lazo de corriente
  const steps = Math.ceil(tEnd / dt)
  const clamp = (x: number, lim: number) => Math.max(-lim, Math.min(lim, x))
  for (let i = 0; i <= steps; i++) {
    const t = i * dt
    const wr = wref(t)
    // Lazo externo: velocidad → referencia de corriente (con anti-windup por saturación)
    const eS = wr - w
    const iaRefRaw = gains.kpS * eS + gains.kiS * intS
    const iaRef = clamp(iaRefRaw, gains.Imax)
    if (Math.abs(iaRefRaw) < gains.Imax) intS += eS * dt
    // Lazo interno: corriente → tensión
    const eC = iaRef - ia
    const vaRaw = gains.kpC * eC + gains.kiC * intC + p.kPhi * w // + término de desacople (FEM)
    const va = clamp(vaRaw, gains.Vmax)
    if (Math.abs(vaRaw) < gains.Vmax) intC += eC * dt
    if (i % sampleEvery === 0) out.push({ t, wref: wr, omega: w, rpm: (w * 60) / (2 * Math.PI), ia, iaRef })
    // Planta (Euler semi-implícito basta con dt pequeño)
    const dia = (va - p.Ra * ia - p.kPhi * w) / p.La
    const dw = (p.kPhi * ia - tload(t) - p.B * w) / p.J
    ia += dia * dt
    w += dw * dt
  }
  return out
}

// ---------------------------------------------------------------------------
// §5-8/5-9 — Generadores sincrónicos en paralelo (FKU)
// ---------------------------------------------------------------------------

/**
 * Característica velocidad-potencia (estatismo) de una máquina impulsora con
 * gobernador a regulación constante: f = fNl − k·P. La frecuencia en vacío
 * fNl es la «perilla» del gobernador; k [Hz/MW] es la pendiente (droop).
 */
export interface DroopGen {
  fNl: number // frecuencia en vacío [Hz] (setpoint del gobernador)
  k: number // estatismo [Hz/MW]: cuánto cae f por MW entregado
}

/**
 * Dos generadores con estatismo compartiendo una carga P_L: la frecuencia
 * común del sistema es la altura a la que la suma de las dos rectas
 * f = fNl − k·P consume exactamente P_L (Fig. 5-29).
 */
export function droopSolve(g1: DroopGen, g2: DroopGen, pLoad: number) {
  const f = (g1.fNl / g1.k + g2.fNl / g2.k - pLoad) / (1 / g1.k + 1 / g2.k)
  return { f, p1: (g1.fNl - f) / g1.k, p2: (g2.fNl - f) / g2.k }
}

/**
 * Reparto de reactivos entre dos generadores idénticos en paralelo
 * (Fig. 5-30): la carga (P_L, Q_L) y el voltaje de terminales quedan fijos;
 * los gobernadores no se tocan, así que cada máquina conserva P_L/2. La
 * excitación desplaza reactivos: Q₁ = Q_L/2 + ΔQ, Q₂ = Q_L/2 − ΔQ. Devuelve
 * los fasores por unidad (V̂t en el eje real) de corriente y excitación.
 */
export function reactiveShare(Vt: number, pL: number, qL: number, dQ: number, Xs: number) {
  const mk = (P: number, Q: number) => {
    // Ia = (S/Vt)* con S = P + jQ  →  conj: Ia = (P − jQ)/Vt
    const Ia = cx(P / Vt, -Q / Vt)
    const Eaf = add(cx(Vt, 0), mulJ(scale(Ia, Xs)))
    return { Ia, Eaf, mag: abs(Eaf), delta: arg(Eaf), P, Q, fp: P / Math.hypot(P, Q) || 1 }
  }
  return { g1: mk(pL / 2, qL / 2 + dQ), g2: mk(pL / 2, qL / 2 - dQ) }
}
