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

// ---------------------------------------------------------------------------
// §12.6 — El modelo fino: pérdidas separadas, refrigeración variable,
// dos nodos térmicos y el ensayo de calentamiento.
// ---------------------------------------------------------------------------

/** Reparto típico de pérdidas a plena carga (declarado; varía por diseño). */
export const FRACCIONES_NOM = { cu: 0.5, fe: 0.25, mec: 0.15, add: 0.1 } as const

export interface PerdidasDetalle {
  cu: number
  fe: number
  mec: number
  add: number
  total: number
}

/**
 * Pérdidas separadas en pu de las nominales, con carga (par) c y velocidad
 * n_pu bajo control V/f (flujo ≈ constante, f_pu ≈ n_pu):
 *   Cu ∝ c² · Fe ∝ f^1.3 (histéresis+Foucault a B cte) · mec ∝ n^2.5 ·
 *   adicionales ∝ c². Exponentes típicos declarados.
 */
export function perdidasDetalladas(c: number, nPu: number): PerdidasDetalle {
  const cu = FRACCIONES_NOM.cu * c * c
  const fe = FRACCIONES_NOM.fe * Math.pow(Math.max(0.05, nPu), 1.3)
  const mec = FRACCIONES_NOM.mec * Math.pow(Math.max(0, nPu), 2.5)
  const add = FRACCIONES_NOM.add * c * c
  return { cu, fe, mec, add, total: cu + fe + mec + add }
}

export type Refrigeracion = 'autoventilado' | 'forzado' | 'tenv'

/**
 * Resistencia térmica carcasa→ambiente según refrigeración y velocidad
 * (normalizada: Rca = 0.65 nominal autoventilado a n = 1).
 * Autoventilado (IC411): el ventilador va en el eje — a baja velocidad la
 * evacuación se degrada. Forzado (IC416): independiente. TENV (IC410): sin
 * ventilador, mayor pero constante.
 */
export function rcaDe(ref: Refrigeracion, nPu: number): number {
  if (ref === 'forzado') return 0.65
  if (ref === 'tenv') return 0.95
  return 0.65 / (0.25 + 0.75 * Math.max(0, Math.min(1.2, nPu)))
}

export interface DosNodosParams {
  /** devanado→carcasa [K/pu-pérdida] */
  rwc: number
  /** carcasa→ambiente [K/pu-pérdida] */
  rca: number
  /** τ del devanado [min] (rápida: masa de cobre chica) */
  tauW: number
  /** τ de la carcasa [min] (lenta: todo el hierro) */
  tauC: number
}
export const DOS_NODOS_NOM: DosNodosParams = { rwc: 0.35, rca: 0.65, tauW: 8, tauC: 60 }

/**
 * Modelo de DOS nodos: el devanado (rápido) vierte a la carcasa (lenta) y
 * esta al ambiente. Explica por qué la sobrecarga golpea al cobre en minutos
 * aunque la carcasa tarde una hora — y por qué los relés térmicos modernos
 * usan dos constantes de tiempo.
 *   Cw·dθw/dt = P − (θw−θc)/Rwc ;  Cc·dθc/dt = (θw−θc)/Rwc − θc/Rca
 */
export function dosNodosSim(
  p: DosNodosParams,
  pLoss: number,
  tEnd: number,
  dt = 0.25,
): { t: number; w: number; c: number }[] {
  const cw = p.tauW / p.rwc
  const cc = p.tauC / p.rca
  let w = 0
  let c = 0
  const out: { t: number; w: number; c: number }[] = []
  for (let t = 0; t <= tEnd; t += dt) {
    out.push({ t, w, c })
    const qwc = (w - c) / p.rwc
    w += ((pLoss - qwc) / cw) * dt
    c += ((qwc - c / p.rca) / cc) * dt
  }
  return out
}

/** Régimen del modelo de dos nodos: θc = P·Rca, θw = θc + P·Rwc. */
export const dosNodosSS = (p: DosNodosParams, pLoss: number) => ({
  c: pLoss * p.rca,
  w: pLoss * (p.rca + p.rwc),
})

/**
 * Estimación de parámetros desde un ensayo de calentamiento (tres puntos
 * EQUIDISTANTES θ1, θ2, θ3 a t, 2t, 3t — método clásico de extrapolación):
 *   θ_ss = (θ2² − θ1·θ3)/(2θ2 − θ1 − θ3) ;  τ = Δt / ln((θss−θ1)/(θss−θ2))
 */
export function estimaEnsayo(
  th1: number,
  th2: number,
  th3: number,
  dtMin: number,
): { thetaSS: number; tau: number } | null {
  const den = 2 * th2 - th1 - th3
  if (Math.abs(den) < 1e-6) return null
  const thetaSS = (th2 * th2 - th1 * th3) / den
  if (thetaSS <= th3 || thetaSS <= 0) return null
  const ratio = (thetaSS - th1) / (thetaSS - th2)
  if (ratio <= 1) return null
  return { thetaSS, tau: dtMin / Math.log(ratio) }
}

/** Tablas TIPO CATÁLOGO (valores típicos publicados; interpolación lineal). */
export const TABLA_ALTITUD: [number, number][] = [
  [1000, 1.0], [1500, 0.96], [2000, 0.92], [2500, 0.88], [3000, 0.84], [3500, 0.8], [4000, 0.76],
]
export const TABLA_AMBIENTE: [number, number][] = [
  [40, 1.0], [45, 0.95], [50, 0.9], [55, 0.85], [60, 0.8],
]
export function interpTabla(tabla: [number, number][], x: number): number {
  if (x <= tabla[0][0]) return tabla[0][1]
  for (let i = 1; i < tabla.length; i++) {
    if (x <= tabla[i][0]) {
      const [x0, y0] = tabla[i - 1]
      const [x1, y1] = tabla[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return tabla[tabla.length - 1][1]
}
