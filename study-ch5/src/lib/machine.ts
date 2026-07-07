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
