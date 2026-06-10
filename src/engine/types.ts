/**
 * Tipos del núcleo de simulación de transitorios de la máquina sincrónica.
 * Todas las magnitudes eléctricas están en por unidad (pu) sobre la base de la máquina,
 * los ángulos en radianes y el tiempo en segundos, salvo que se indique lo contrario.
 */

export type EventType = 'short-circuit' | 'load-rejection' | 'torque-step'

export type Stage = 'pre' | 'fault' | 'post'

export interface MachineParams {
  /** Reactancia sincrónica de eje directo Xd [pu] */
  Xd: number
  /** Reactancia sincrónica de eje en cuadratura Xq [pu] */
  Xq: number
  /** Reactancia transitoria de eje directo X'd [pu] */
  Xd1: number
  /** Reactancia subtransitoria de eje directo X''d [pu] */
  Xd2: number
  /** Reactancia transitoria de eje en cuadratura X'q [pu] */
  Xq1: number
  /** Reactancia subtransitoria de eje en cuadratura X''q [pu] */
  Xq2: number
  /** Constante de inercia H [s] (energía cinética a velocidad nominal / potencia base) */
  H: number
  /** Coeficiente de amortiguamiento D [pu de par / pu de desviación de velocidad] */
  D: number
  /** Constante de tiempo transitoria de cortocircuito T'd [s] */
  Td1: number
  /** Constante de tiempo subtransitoria de cortocircuito T''d [s] */
  Td2: number
  /** Constante de tiempo de armadura Ta [s] (decaimiento de la componente DC) */
  Ta: number
  /** Frecuencia nominal del sistema [Hz] */
  f: number
}

export interface OperatingPoint {
  /** Potencia activa inicial P0 [pu] */
  P0: number
  /** Potencia reactiva inicial Q0 [pu] */
  Q0: number
  /** Tensión en bornes Vt [pu] */
  Vt: number
}

export interface EventConfig {
  type: EventType
  /** Instante de aparición del evento [s] */
  tFault: number
  /** Duración de la falla hasta su despeje [s] (solo cortocircuito) */
  tClearing: number
  /** Magnitud del escalón de potencia mecánica ΔPm [pu] (solo escalón de torque) */
  torqueStep: number
}

export interface SimConfig {
  machine: MachineParams
  op: OperatingPoint
  event: EventConfig
  /** Tiempo final de simulación [s] */
  tEnd: number
  /** Paso de integración RK4 [s] (≤ 0.01) */
  dt: number
}

export interface InitialConditions {
  /** Ángulo de carga inicial δ0 [rad] */
  delta0: number
  /** Tensión interna transitoria E'q [pu] */
  Eq1: number
  /** Tensión interna subtransitoria E''q [pu] */
  Eq2: number
  /** FEM de estado estable E (detrás de Xd) [pu] */
  E: number
  /** Corriente de armadura inicial |I| [pu] */
  I0: number
  /** Ángulo del factor de potencia φ [rad] (positivo = corriente en atraso) */
  phi: number
  /** Componente de eje directo de la corriente Id [pu] */
  Id: number
  /** Componente de eje en cuadratura de la corriente Iq [pu] */
  Iq: number
}

export interface SimSample {
  /** Tiempo [s] */
  t: number
  /** Ángulo de carga δ [rad] */
  delta: number
  /** Desviación de velocidad Δω = ω − ωs [rad/s] */
  dOmega: number
  /** Potencia eléctrica entregada Pe [pu] */
  Pe: number
  /** Potencia mecánica Pm [pu] */
  Pm: number
  stage: Stage
}

export interface PowerCurvePoint {
  /** Ángulo de carga [grados eléctricos] */
  deltaDeg: number
  pre: number
  fault: number
  post: number
}

export interface EqualAreaResult {
  /** Ángulo de despeje δcl [rad] */
  deltaClear: number
  /** Ángulo crítico de despeje δcr [rad] (null si no existe) */
  deltaCritical: number | null
  /** Ángulo de equilibrio estable post-falla δs [rad] */
  deltaStableEq: number | null
  /** Ángulo de equilibrio inestable post-falla δu [rad] */
  deltaUnstableEq: number | null
  /** Área de aceleración A1 [pu·rad] */
  A1: number
  /** Área de desaceleración disponible A2,max [pu·rad] */
  A2max: number
}

export interface CurrentsSample {
  t: number
  ia: number
  ib: number
  ic: number
  /** Envolvente superior √2·I(t) de la corriente de cortocircuito (null fuera de falla) */
  envP: number | null
  envM: number | null
}

export interface ShortCircuitLevels {
  /** Corriente subtransitoria I'' = E''q / X''d [pu] */
  Isub: number
  /** Corriente transitoria I' = E'q / X'd [pu] */
  Itrans: number
  /** Corriente de estado estable Iss = E / Xd [pu] */
  Iss: number
}

export interface SimResult {
  config: SimConfig
  init: InitialConditions
  samples: SimSample[]
  /** ¿La máquina conserva el sincronismo? */
  stable: boolean
  /** Instante en que se detecta la pérdida de sincronismo [s] */
  lossOfSyncTime: number | null
  /** Excursión máxima del ángulo de carga [rad] */
  maxDelta: number
  /** Desviación máxima de velocidad [rad/s] */
  maxDOmega: number
  /** Tiempo crítico de despeje [s] (solo cortocircuito; null = no aplica o nunca inestable) */
  tCritical: number | null
  equalArea: EqualAreaResult | null
  powerCurves: PowerCurvePoint[]
  currents: CurrentsSample[]
  scLevels: ShortCircuitLevels
}
