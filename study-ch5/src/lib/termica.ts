// ---------------------------------------------------------------------------
// Capítulo 12 — Térmica, dimensionamiento y selección de máquinas.
// Circuito térmico R-C, vida del aislamiento (Montsinger), potencia
// equivalente de ciclos de servicio y factores de derrateo de catálogo.
// Los factores empíricos son APROXIMACIONES DECLARADAS de tablas típicas
// (catálogos IEC / NEMA MG1): sirven para enseñar la estructura del cálculo,
// no para sustituir la hoja de datos del fabricante.
// ---------------------------------------------------------------------------

/** Clases térmicas IEC: temperatura TOTAL admisible del punto caliente [°C]. */
export const CLASES = {
  A: 105,
  B: 130,
  F: 155,
  H: 180,
} as const
export type Clase = keyof typeof CLASES

/**
 * Elevación de temperatura ante potencia de pérdidas constante:
 * θ(t) = θ_ss·(1 − e^(−t/τ)) + θ₀·e^(−t/τ), con θ_ss = P·R_th.
 */
export const thermalStep = (
  thetaSS: number,
  theta0: number,
  t: number,
  tau: number,
): number => thetaSS + (theta0 - thetaSS) * Math.exp(-t / tau)

export interface ThermalSegment {
  /** Pérdidas relativas a las nominales (1 = plena carga) */
  pLoss: number
  /** Duración [min] */
  t: number
  /** ¿Máquina detenida? (autoventilada: enfría más lento) */
  parada?: boolean
}

/**
 * Simula la elevación de temperatura a lo largo de un ciclo repetido de
 * segmentos, con constante de tiempo de calentamiento tau y de enfriamiento
 * tauCool (parada, autoventilada: 2–3× mayor). Devuelve muestras (t, θ/θnom).
 */
export function thermalCycle(
  segments: ThermalSegment[],
  tau: number,
  tauCool: number,
  ciclos = 6,
  dtMin = 0.5,
): { t: number; theta: number }[] {
  const out: { t: number; theta: number }[] = []
  let theta = 0
  let t = 0
  for (let c = 0; c < ciclos; c++) {
    for (const seg of segments) {
      const tc = seg.parada ? tauCool : tau
      const ss = seg.parada ? 0 : seg.pLoss
      for (let k = 0; k < seg.t / dtMin; k++) {
        theta = thermalStep(ss, theta, dtMin, tc)
        t += dtMin
        out.push({ t, theta })
      }
    }
  }
  return out
}

/**
 * Vida del aislamiento (regla de Montsinger / Arrhenius simplificada):
 * la vida se reduce a la MITAD por cada ~10 °C sobre la temperatura de
 * clase (y se duplica por cada 10 °C por debajo). L0 = vida de diseño
 * a la temperatura de clase (≈ 20 000 h de referencia clásica).
 */
export const vidaAislamiento = (thetaHot: number, clase: Clase, L0 = 20000): number =>
  L0 * Math.pow(2, (CLASES[clase] - thetaHot) / 10)

/**
 * Potencia equivalente (rms) de un ciclo de carga: la que produce las mismas
 * pérdidas Joule promedio. Los tiempos de parada cuentan con ventilación
 * reducida: se ponderan con un factor < 1 en el denominador (típico 0.3–0.5
 * en autoventilados).
 */
export function potenciaEquivalente(
  segments: { p: number; t: number; parada?: boolean }[],
  factorParada = 0.4,
): number {
  let num = 0
  let den = 0
  for (const s of segments) {
    num += s.p * s.p * s.t
    den += s.parada ? s.t * factorParada : s.t
  }
  return den > 0 ? Math.sqrt(num / den) : 0
}

// --- Factores de derrateo (aproximaciones declaradas de tablas típicas) ---

/** Altitud: −1 % por cada 100 m sobre 1000 m (típico de catálogo IEC). */
export const derateAltitud = (m: number): number =>
  m <= 1000 ? 1 : Math.max(0.7, 1 - (m - 1000) / 10000)

/** Temperatura ambiente: −1 % por °C sobre los 40 °C de referencia. */
export const derateAmbiente = (tamb: number): number =>
  tamb <= 40 ? 1 : Math.max(0.7, 1 - 0.01 * (tamb - 40))

/** Desbalance de tensión (curva NEMA MG1 aprox.): f ≈ 1 − (V₂% )²/100. */
export const derateDesbalance = (v2pct: number): number =>
  Math.max(0.6, 1 - (v2pct * v2pct) / 100)

/** Armónicos de tensión (aprox. del HVF de NEMA MG1): f ≈ 1 − THD%/200. */
export const derateArmonicos = (thdPct: number): number =>
  Math.max(0.8, 1 - thdPct / 200)

/** Tamaños normalizados IEC de potencia [kW] para el flujo de selección. */
export const CATALOGO_KW = [5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90] as const

export type TipoCarga = 'constante' | 'cuadratica' | 'potencia'

/** Par resistente relativo al nominal de la carga, en el ARRANQUE (n ≈ 0). */
export const parArranqueCarga = (tipo: TipoCarga): number =>
  tipo === 'constante' ? 1.0 : tipo === 'cuadratica' ? 0.15 : 0.4

/**
 * Pérdidas totales relativas a las nominales, separando componentes:
 * SOLO el cobre sigue el cuadrado de la carga; hierro (V, f), mecánicas (ω)
 * y auxiliares son ~constantes a velocidad y tensión fijas.
 *   P(carga) = fCu·carga² + (1 − fCu)
 * con fCu = fracción de cobre a plena carga (típico 0.5–0.7).
 */
export const perdidasTotales = (carga: number, fCu: number): number =>
  fCu * carga * carga + (1 - fCu)
