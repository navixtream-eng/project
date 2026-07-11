import {
  type InductionParams,
  droopSolve,
  fmt,
  inductionMaxTorque,
  syncSpeedRpm,
} from './machine'

// ---------------------------------------------------------------------------
// Entrenador de problemas — banco aleatorio por niveles que obliga al ciclo:
// identificar → interpretar datos → elegir modelo → declarar supuestos →
// resolver → comprobar unidades y límites → validar físicamente.
// Los niveles 2 y 3 incluyen datos irrelevantes, redundantes y unidades
// mezcladas a propósito: reconocer qué NO se usa es parte del entrenamiento.
// ---------------------------------------------------------------------------

const MU0 = 4 * Math.PI * 1e-7

export type Nivel = 1 | 2 | 3

export interface TrainerOption {
  label: string
  correct?: boolean
  feedback: string
}
export interface TrainerMCQ {
  question: string
  options: TrainerOption[]
}
export interface DataRow {
  label: string
  value: string
  /** Se revela al final: entrena a distinguir lo útil de lo decorativo. */
  tag: 'útil' | 'irrelevante' | 'redundante'
}
export interface NumericAnswer {
  label: string
  value: number
  unit: string
  /** Tolerancia relativa (por defecto 3 %). */
  tolPct?: number
}
export interface Supuesto {
  label: string
  correcto: boolean
}
export interface TrainerProblem {
  familyId: string
  title: string
  chapter: number
  level: Nivel
  statement: string
  data: DataRow[]
  identificar: TrainerMCQ
  /** Solo niveles 2–3: cazar el dato irrelevante o redundante. */
  datos?: TrainerMCQ
  metodo: TrainerMCQ
  supuestos: Supuesto[]
  respuestas: NumericAnswer[]
  validacion: TrainerMCQ
  solucion: string[]
}
export interface TrainerFamily {
  id: string
  title: string
  chapter: number
  level: Nivel
  generate: () => TrainerProblem
}

const rnd = (min: number, max: number, step = 1) =>
  Math.round((min + Math.random() * (max - min)) / step) * step

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const mcq = (question: string, options: TrainerOption[]): TrainerMCQ => ({
  question,
  options: shuffle(options),
})

// ---------------------------------------------------------------------------
// NIVEL 1 · Básicos: una sola herramienta, datos limpios
// ---------------------------------------------------------------------------

const magCircuito: TrainerFamily = {
  id: 'n1-mag',
  title: 'Circuito magnético con entrehierro',
  chapter: 1,
  level: 1,
  generate() {
    const N = rnd(400, 800, 50)
    const I = rnd(10, 30, 5) / 10
    const gMm = rnd(10, 30, 5) / 10
    const muR = rnd(3000, 6000, 500)
    const A = 16e-4
    const Lc = 0.4
    const F = N * I
    const Rc = Lc / (muR * MU0 * A)
    const Rg = gMm / 1000 / (MU0 * A)
    const phi = F / (Rc + Rg)
    const B = phi / A
    return {
      familyId: this.id,
      title: this.title,
      chapter: 1,
      level: 1,
      statement: `Un núcleo de acero con camino medio de 40 cm y sección uniforme de 16 cm² tiene un entrehierro de ${fmt(gMm, 1)} mm. Su bobina de ${N} vueltas lleva ${fmt(I, 1)} A. Halle el flujo φ y la densidad B en el núcleo.`,
      data: [
        { label: 'Vueltas N', value: String(N), tag: 'útil' },
        { label: 'Corriente I', value: `${fmt(I, 1)} A`, tag: 'útil' },
        { label: 'Entrehierro g', value: `${fmt(gMm, 1)} mm`, tag: 'útil' },
        { label: 'μr del acero', value: String(muR), tag: 'útil' },
        { label: 'Camino medio / sección', value: '40 cm / 16 cm²', tag: 'útil' },
      ],
      identificar: mcq('¿Qué sistema tienes enfrente?', [
        { label: 'Un circuito magnético SERIE (hierro + entrehierro) excitado por una FMM', correct: true, feedback: 'Correcto: un solo lazo de flujo que atraviesa dos reluctancias en serie.' },
        { label: 'Un transformador de dos devanados', feedback: 'Solo hay UNA bobina y ninguna transferencia de potencia: es un circuito magnético estático.' },
        { label: 'Una máquina rotativa en vacío', feedback: 'Nada gira aquí: no hay rotor, ni entrehierro anular, ni FEM de movimiento.' },
      ]),
      metodo: mcq('¿Qué modelo resuelve el problema?', [
        { label: 'Analogía de Ohm magnética: φ = F/(R_hierro + R_gap)', correct: true, feedback: 'Sí: FMM como «voltaje», flujo como «corriente», reluctancias en serie.' },
        { label: 'Ley de Faraday: e = −N·dφ/dt', feedback: 'No hay nada variando en el tiempo (corriente CC): Faraday daría cero. Es un problema de estado magnético, no de inducción.' },
        { label: 'Circuito equivalente de transformador con rama de magnetización', feedback: 'Ese modelo REPRESENTA este fenómeno dentro de un transformador, pero aquí basta la analogía de Ohm directa.' },
      ]),
      supuestos: [
        { label: 'Sin flujo de dispersión (todo el flujo sigue el núcleo)', correcto: true },
        { label: 'Hierro lineal: μr constante (sin saturación)', correcto: true },
        { label: 'Franjeo despreciable: misma área en el gap', correcto: true },
        { label: 'Las corrientes de Foucault dominan la respuesta', correcto: false },
        { label: 'El entrehierro está saturado', correcto: false },
      ],
      respuestas: [
        { label: 'Flujo φ', value: phi * 1000, unit: 'mWb' },
        { label: 'Densidad B', value: B, unit: 'T' },
      ],
      validacion: mcq(`Obtuviste B ≈ ${fmt(B, 2)} T. ¿Cómo sabes que es físicamente razonable?`, [
        { label: 'Está por debajo de ~1.6–1.8 T, donde el acero eléctrico satura: el supuesto lineal se sostiene', correct: true, feedback: 'Ese es el chequeo: si B saliera de 2.5 T, el modelo lineal ya no valdría y habría que rehacer con la curva B-H.' },
        { label: 'Es positiva, y el flujo siempre es positivo', feedback: 'El signo es convención de sentido; lo que valida el MODELO es comparar contra la saturación del material.' },
        { label: 'Coincide con μ0·H del entrehierro multiplicado por μr', feedback: 'Eso mezcla las regiones: B es continua entre hierro y gap (misma área); la validación útil es contra la saturación.' },
      ]),
      solucion: [
        `F = N·I = ${N}·${fmt(I, 1)} = ${fmt(F, 0)} A·v`,
        `R_hierro = Lc/(μr·μ0·A) = ${fmt(Rc / 1000, 1)} kA·v/Wb · R_gap = g/(μ0·A) = ${fmt(Rg / 1000, 1)} kA·v/Wb`,
        `φ = F/(Rc+Rg) = ${fmt(phi * 1000, 3)} mWb`,
        `B = φ/A = ${fmt(B, 3)} T (< 1.6 T ✓ hierro sin saturar)`,
      ],
    }
  },
}

const trafoIdeal: TrainerFamily = {
  id: 'n1-trafo',
  title: 'Transformador ideal y reflexión',
  chapter: 2,
  level: 1,
  generate() {
    const a = rnd(4, 12, 2)
    const V1 = rnd(1200, 4800, 400)
    const ZL = rnd(4, 20, 2)
    const V2 = V1 / a
    const I2 = V2 / ZL
    const I1 = I2 / a
    const Zin = a * a * ZL
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 1,
      statement: `Un transformador ideal con relación de vueltas a = ${a} alimenta desde ${V1} V (primario) una carga resistiva de ${ZL} Ω en el secundario. Halle la corriente del primario I₁ y la impedancia vista desde el primario Z_in.`,
      data: [
        { label: 'V₁', value: `${V1} V`, tag: 'útil' },
        { label: 'Relación a = N₁/N₂', value: String(a), tag: 'útil' },
        { label: 'Carga Z_L', value: `${ZL} Ω (resistiva)`, tag: 'útil' },
      ],
      identificar: mcq('¿Qué elemento une la fuente con la carga?', [
        { label: 'Un transformador IDEAL: solo cambia niveles, no consume ni almacena', correct: true, feedback: 'Correcto: potencia de entrada = potencia de salida; solo se transforman V e I.' },
        { label: 'Un transformador real con pérdidas de núcleo', feedback: 'El enunciado dice «ideal»: sin pérdidas, sin corriente magnetizante, sin dispersión.' },
        { label: 'Un autotransformador', feedback: 'No hay conexión conductiva entre lados en el problema — dos devanados aislados.' },
      ]),
      metodo: mcq('¿Cuál es el camino más corto a Z_in?', [
        { label: 'Reflejar la impedancia: Z_in = a²·Z_L', correct: true, feedback: 'La reflexión de impedancia es EL truco del transformador ideal: evita calcular V₂ e I₂ si solo quieres Z_in.' },
        { label: 'Resolver la malla completa con las dos ecuaciones de FEM', feedback: 'Funciona, pero son tres pasos para lo que a² hace en uno. Reconocer el atajo ES el método.' },
        { label: 'Ensayo de cortocircuito', feedback: 'Los ensayos extraen parámetros de un transformador REAL desconocido; aquí el modelo ya está dado.' },
      ]),
      supuestos: [
        { label: 'Sin pérdidas: P₁ = P₂', correcto: true },
        { label: 'Corriente magnetizante nula', correcto: true },
        { label: 'Acoplamiento perfecto (sin dispersión)', correcto: true },
        { label: 'La carga determina la frecuencia', correcto: false },
      ],
      respuestas: [
        { label: 'I₁', value: I1, unit: 'A' },
        { label: 'Z_in', value: Zin, unit: 'Ω' },
      ],
      validacion: mcq('Chequeo físico: ¿qué debe cumplirse entre ambos lados?', [
        { label: 'V₁·I₁ = V₂·I₂ — la potencia se conserva exactamente', correct: true, feedback: `Verifícalo: ${V1}·${fmt(I1, 2)} = ${fmt(V2, 0)}·${fmt(I2, 2)} = ${fmt(V1 * I1, 0)} W ✓` },
        { label: 'I₁ = I₂ porque el circuito es serie', feedback: 'Las corrientes se transforman con 1/a: el lado de alta lleva MENOS corriente — por eso se transmite en alta tensión.' },
        { label: 'Z_in = Z_L siempre', feedback: 'La impedancia se refleja con a² — ese es justamente el efecto útil (adaptación de impedancias).' },
      ]),
      solucion: [
        `V₂ = V₁/a = ${fmt(V2, 0)} V → I₂ = V₂/Z_L = ${fmt(I2, 2)} A`,
        `I₁ = I₂/a = ${fmt(I1, 3)} A`,
        `Z_in = a²·Z_L = ${a}²·${ZL} = ${fmt(Zin, 0)} Ω (verifica: V₁/I₁ = ${fmt(V1 / I1, 0)} Ω ✓)`,
      ],
    }
  },
}

const velocidadSlip: TrainerFamily = {
  id: 'n1-slip',
  title: 'Velocidad síncrona y deslizamiento',
  chapter: 7,
  level: 1,
  generate() {
    const poles = [2, 4, 6, 8][rnd(0, 3)]
    const f = 60
    const ns = syncSpeedRpm(f, poles)
    const s = rnd(2, 6, 1) / 100
    const nm = Math.round((1 - s) * ns)
    const sReal = (ns - nm) / ns
    const fr = sReal * f
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 1,
      statement: `Un motor de inducción trifásico de ${poles} polos conectado a 60 Hz gira a plena carga a ${nm} r/min. Halle la velocidad síncrona nₛ, el deslizamiento s y la frecuencia de las corrientes del rotor fᵣ.`,
      data: [
        { label: 'Polos', value: String(poles), tag: 'útil' },
        { label: 'Frecuencia de línea', value: '60 Hz', tag: 'útil' },
        { label: 'Velocidad medida nₘ', value: `${nm} r/min`, tag: 'útil' },
      ],
      identificar: mcq('¿Por qué el motor NO gira a la velocidad síncrona?', [
        { label: 'Es una máquina de inducción: necesita retraso (deslizamiento) para inducir corriente y producir par', correct: true, feedback: 'Correcto — sin movimiento relativo campo-rotor no hay FEM inducida ni par.' },
        { label: 'Porque la carga mecánica lo frena por debajo de su velocidad natural', feedback: 'Incluso en vacío quedaría (apenas) por debajo de nₛ: el retraso es constitutivo, no accidental.' },
        { label: 'Es un motor síncrono con ángulo de carga', feedback: 'Un síncrono giraría EXACTAMENTE a nₛ; que gire por debajo delata inducción.' },
      ]),
      metodo: mcq('Cadena de cálculo correcta:', [
        { label: 'nₛ = 120f/p → s = (nₛ−nₘ)/nₛ → fᵣ = s·f', correct: true, feedback: 'Los tres números encadenados que gobiernan toda la máquina de inducción.' },
        { label: 'Circuito equivalente de Thévenin y curva par-velocidad', feedback: 'Herramienta de artillería para PAR y CORRIENTE; para velocidades y frecuencias basta la cadena nₛ→s→fᵣ.' },
        { label: 'fᵣ = f siempre, porque el rotor está acoplado a la red', feedback: 'El rotor solo «ve» la velocidad de deslizamiento: su frecuencia es s·f (¡~2 Hz a plena carga!).' },
      ]),
      supuestos: [
        { label: 'Frecuencia de red constante (60.0 Hz)', correcto: true },
        { label: 'La lectura del tacómetro es la velocidad mecánica real', correcto: true },
        { label: 'El deslizamiento es negativo en régimen motor', correcto: false },
      ],
      respuestas: [
        { label: 'nₛ', value: ns, unit: 'r/min', tolPct: 0.5 },
        { label: 's', value: sReal * 100, unit: '%' },
        { label: 'fᵣ', value: fr, unit: 'Hz' },
      ],
      validacion: mcq(`s = ${fmt(sReal * 100, 1)} %. ¿Es un valor sano?`, [
        { label: 'Sí: un motor de inducción en carga nominal desliza típicamente 1–6 %', correct: true, feedback: 'Si te hubiera dado 30 %, sospecha de un error (o de un rotor devanado con resistencia externa).' },
        { label: 'No: el deslizamiento debería ser cercano al 50 %', feedback: 's = 0.5 significaría la mitad de la potencia de entrehierro quemada en el rotor: inaceptable en operación continua.' },
        { label: 'El deslizamiento no tiene rango típico', feedback: 'Sí lo tiene, y conocerlo es tu detector de errores más barato: 1–6 % a plena carga.' },
      ]),
      solucion: [
        `nₛ = 120·60/${poles} = ${fmt(ns, 0)} r/min`,
        `s = (${fmt(ns, 0)}−${nm})/${fmt(ns, 0)} = ${fmt(sReal, 3)} = ${fmt(sReal * 100, 1)} %`,
        `fᵣ = s·f = ${fmt(fr, 2)} Hz — el rotor vive casi en CC`,
      ],
    }
  },
}

const dcEmf: TrainerFamily = {
  id: 'n1-dc',
  title: 'FEM y par de máquina CC',
  chapter: 9,
  level: 1,
  generate() {
    const kPhi = rnd(10, 24, 2) / 10
    const rpm = rnd(1000, 1800, 100)
    const Ia = rnd(20, 80, 10)
    const w = (rpm * 2 * Math.PI) / 60
    const Ea = kPhi * w
    const T = kPhi * Ia
    return {
      familyId: this.id,
      title: this.title,
      chapter: 9,
      level: 1,
      statement: `Una máquina de CC tiene constante Kₐ·Φ = ${fmt(kPhi, 1)} V·s/rad (excitación fija). Gira a ${rpm} r/min con corriente de armadura ${Ia} A. Halle la FEM interna Eₐ y el par electromagnético T.`,
      data: [
        { label: 'Kₐ·Φ', value: `${fmt(kPhi, 1)} V·s/rad`, tag: 'útil' },
        { label: 'Velocidad', value: `${rpm} r/min`, tag: 'útil' },
        { label: 'Corriente Ia', value: `${Ia} A`, tag: 'útil' },
      ],
      identificar: mcq('¿Qué pareja de ecuaciones define a TODA máquina CC?', [
        { label: 'Eₐ = KₐΦ·ω y T = KₐΦ·Iₐ — la MISMA constante en ambas', correct: true, feedback: 'La simetría FEM↔par con la misma KₐΦ es la firma de la conversión electromecánica.' },
        { label: 'E = 4.44·f·N·Φ y T ∝ sen δ', feedback: 'Esas son de máquinas de CA (transformador/síncrona). La CC no tiene f ni ángulo de carga.' },
        { label: 'V = I·R y P = V·I', feedback: 'Circuito puro: no captura la conversión de energía (falta ω y falta Φ).' },
      ]),
      metodo: mcq('El dato de velocidad está en r/min. ¿Qué haces?', [
        { label: 'Convertir a rad/s (ω = 2π·n/60) ANTES de usar Eₐ = KₐΦ·ω', correct: true, feedback: 'KₐΦ está en V·s/rad: la ω debe ir en rad/s. Mezclar r/min aquí es el error #1 del capítulo.' },
        { label: 'Usar r/min directamente: las unidades se arreglan solas', feedback: 'Te daría una FEM ~9.55 veces mayor. Las unidades no se arreglan solas: se comprueban.' },
        { label: 'Convertir KₐΦ a V/rpm y dejar todo en r/min', feedback: 'Posible pero peligroso: el par saldría en unidades híbridas. Convención única: SI (rad/s, N·m).' },
      ]),
      supuestos: [
        { label: 'Flujo de campo constante (excitación independiente fija)', correcto: true },
        { label: 'Sin reacción de armadura que debilite Φ', correcto: true },
        { label: 'El par depende de la velocidad', correcto: false },
      ],
      respuestas: [
        { label: 'Eₐ', value: Ea, unit: 'V' },
        { label: 'T', value: T, unit: 'N·m' },
      ],
      validacion: mcq('Chequeo de conversión: ¿qué debe cumplirse?', [
        { label: 'Eₐ·Iₐ = T·ω — la potencia eléctrica interna ES la mecánica interna', correct: true, feedback: `Verifica: ${fmt(Ea, 0)}·${Ia} = ${fmt(T, 1)}·${fmt(w, 1)} = ${fmt(Ea * Ia / 1000, 2)} kW ✓ La conversión no crea ni destruye.` },
        { label: 'Eₐ > V de terminales siempre', feedback: 'Depende del modo: generador Eₐ > Vt, motor Eₐ < Vt. No es un invariante.' },
        { label: 'T·Iₐ = Eₐ·ω', feedback: 'Mezcla cruzada — la identidad correcta es Eₐ·Iₐ = T·ω (ambas = potencia convertida).' },
      ]),
      solucion: [
        `ω = 2π·${rpm}/60 = ${fmt(w, 1)} rad/s`,
        `Eₐ = ${fmt(kPhi, 1)}·${fmt(w, 1)} = ${fmt(Ea, 1)} V`,
        `T = ${fmt(kPhi, 1)}·${Ia} = ${fmt(T, 1)} N·m · verifica Eₐ·Iₐ = T·ω = ${fmt(Ea * Ia / 1000, 2)} kW ✓`,
      ],
    }
  },
}

// ---------------------------------------------------------------------------
// NIVEL 2 · Intermedios: método a elegir + datos irrelevantes/redundantes
// ---------------------------------------------------------------------------

const trafoEnsayos: TrainerFamily = {
  id: 'n2-ensayos',
  title: 'Ensayos de transformador → parámetros y rendimiento',
  chapter: 2,
  level: 2,
  generate() {
    const S = rnd(25, 100, 25) // kVA
    const Vat = 2400
    const Iat = (S * 1000) / Vat
    const Psc = rnd(400, 900, 50)
    const zPct = rnd(4, 7, 1)
    const Vsc = (zPct / 100) * Vat
    const Poc = rnd(150, 400, 50)
    const Req = Psc / (Iat * Iat)
    const Zeq = Vsc / Iat
    const Xeq = Math.sqrt(Math.max(0, Zeq * Zeq - Req * Req))
    const fp = 0.8
    const Pout = S * 1000 * fp
    const eta = (Pout / (Pout + Poc + Psc)) * 100
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 2,
      statement: `A un transformador monofásico de ${S} kVA, 2400/240 V, se le hicieron ensayos: en VACÍO (lado de baja) se midió P₀ = ${Poc} W; en CORTOCIRCUITO (lado de alta, a corriente nominal) se midió V_cc = ${fmt(Vsc, 0)} V y P_cc = ${Psc} W. Halle R_eq y X_eq referidas al lado de alta, y el rendimiento a plena carga con fp = 0.8.`,
      data: [
        { label: 'Placa', value: `${S} kVA · 2400/240 V`, tag: 'útil' },
        { label: 'Ensayo de vacío P₀', value: `${Poc} W`, tag: 'útil' },
        { label: 'Ensayo de corto: V_cc, P_cc', value: `${fmt(Vsc, 0)} V · ${Psc} W`, tag: 'útil' },
        { label: 'Resistencia CC de devanados', value: `${fmt(Req * 0.8, 2)} Ω`, tag: 'redundante' },
        { label: 'Masa del transformador', value: '310 kg', tag: 'irrelevante' },
        { label: 'Temperatura del ensayo', value: '25 °C', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué te están dando los dos ensayos?', [
        { label: 'La separación experimental de los DOS tipos de pérdida: vacío → núcleo (fijas), corto → cobre (variables)', correct: true, feedback: 'Cada ensayo excita un solo fenómeno: en vacío casi no hay corriente (solo núcleo); en corto casi no hay flujo (solo cobre).' },
        { label: 'Dos formas redundantes de medir la relación de vueltas', feedback: 'La relación sale de los voltajes de placa; los ensayos buscan PARÁMETROS del modelo, no la relación.' },
        { label: 'La curva de saturación del núcleo', feedback: 'Eso exigiría un barrido de voltaje en vacío; aquí hay un solo punto por ensayo.' },
      ]),
      datos: mcq('Antes de calcular: ¿qué dato NO aporta nada al modelo eléctrico?', [
        { label: 'La masa (310 kg)', correct: true, feedback: 'Dato de logística, no de modelo. Los enunciados reales (y los buenos exámenes) traen decorado — apártalo explícitamente.' },
        { label: 'P₀ del ensayo de vacío', feedback: 'Imprescindible: son las pérdidas fijas del rendimiento.' },
        { label: 'V_cc del ensayo de corto', feedback: 'Imprescindible: junto con la corriente nominal da |Z_eq|.' },
      ]),
      metodo: mcq('¿Y la «resistencia CC de devanados» que también te dieron?', [
        { label: 'Es REDUNDANTE con P_cc (y menos fiel): P_cc ya contiene la resistencia efectiva en CA, incluidas pérdidas adicionales', correct: true, feedback: 'La R de CA (de P_cc/I²) supera a la de CC por efecto piel y pérdidas parásitas: usa la del ensayo y descarta la de CC.' },
        { label: 'Debe promediarse con la del ensayo de corto', feedback: 'Promediar un dato bueno con uno peor da un dato mediocre. El ensayo en condiciones reales manda.' },
        { label: 'Es la única resistencia válida', feedback: 'Al revés: subestima las pérdidas reales en operación (60 Hz ≠ CC).' },
      ]),
      supuestos: [
        { label: 'El ensayo de corto se hizo a corriente nominal', correcto: true },
        { label: 'En vacío, las pérdidas de cobre son despreciables', correcto: true },
        { label: 'Parámetros constantes entre ensayo y operación', correcto: true },
        { label: 'Las pérdidas de núcleo crecen con la carga', correcto: false },
      ],
      respuestas: [
        { label: 'R_eq (AT)', value: Req, unit: 'Ω' },
        { label: 'X_eq (AT)', value: Xeq, unit: 'Ω' },
        { label: 'η plena carga', value: eta, unit: '%', tolPct: 1 },
      ],
      validacion: mcq(`η = ${fmt(eta, 1)} %. ¿Te lo crees?`, [
        { label: 'Sí: transformadores de distribución rondan 96–99 % — y X_eq > R_eq como corresponde a 60 Hz', correct: true, feedback: 'Dos chequeos en uno: rango de η típico y la firma X > R de cualquier transformador de potencia.' },
        { label: 'No: un transformador no puede superar el 90 %', feedback: 'Al contrario: sin partes móviles, el transformador es la máquina MÁS eficiente que existe.' },
        { label: 'η debería dar exactamente 100 % por ser un ensayo', feedback: 'Los ensayos miden precisamente las pérdidas que impiden el 100 %.' },
      ]),
      solucion: [
        `I_nom(AT) = ${S} kVA / 2400 V = ${fmt(Iat, 2)} A`,
        `R_eq = P_cc/I² = ${Psc}/${fmt(Iat, 2)}² = ${fmt(Req, 2)} Ω · |Z_eq| = V_cc/I = ${fmt(Zeq, 2)} Ω`,
        `X_eq = √(Z²−R²) = ${fmt(Xeq, 2)} Ω`,
        `η = P_out/(P_out+P₀+P_cc) = ${fmt(Pout / 1000, 1)}k/(${fmt(Pout / 1000, 1)}k+${Poc}+${Psc}) = ${fmt(eta, 1)} %`,
        'La masa y la temperatura eran decorado; la R de CC era redundante (P_cc manda).',
      ],
    }
  },
}

const sincFasores: TrainerFamily = {
  id: 'n2-fasores',
  title: 'Generador síncrono: Eaf y δ por fasores',
  chapter: 5,
  level: 2,
  generate() {
    const Xs = rnd(8, 14, 1) / 10
    const P = rnd(6, 9, 1) / 10
    const fp = [0.8, 0.85, 0.9][rnd(0, 2)]
    const Vt = 1.0
    const Smag = P / fp
    const th = Math.acos(fp)
    const IaRe = Smag * fp
    const IaIm = -Smag * Math.sin(th)
    const EafRe = Vt + Xs * -IaIm
    const EafIm = Xs * IaRe
    const Eaf = Math.hypot(EafRe, EafIm)
    const delta = (Math.atan2(EafIm, EafRe) * 180) / Math.PI
    return {
      familyId: this.id,
      title: this.title,
      chapter: 5,
      level: 2,
      statement: `Un generador síncrono cilíndrico (Xₛ = ${fmt(Xs, 1)} pu, Rₐ = 0.008 pu) opera contra una barra infinita con Vt = 1.0 pu entregando P = ${fmt(P, 1)} pu con fp = ${fp} en atraso. Halle |Êaf| y el ángulo de potencia δ.`,
      data: [
        { label: 'Xₛ', value: `${fmt(Xs, 1)} pu`, tag: 'útil' },
        { label: 'P y fp', value: `${fmt(P, 1)} pu · ${fp} atraso`, tag: 'útil' },
        { label: 'Vt', value: '1.0 pu', tag: 'útil' },
        { label: 'Rₐ', value: '0.008 pu', tag: 'irrelevante' },
        { label: 'Frecuencia', value: '60 Hz', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué situación es?', [
        { label: 'Máquina síncrona en régimen permanente contra barra infinita: circuito Êaf—jXₛ—V̂t', correct: true, feedback: 'El modelo de UNA reactancia y dos fuentes: todo el capítulo 5 en un lazo.' },
        { label: 'Transitorio de cortocircuito (X″ y X′)', feedback: 'Nada cambia bruscamente aquí: es un punto de OPERACIÓN, no una falla.' },
        { label: 'Motor de inducción con deslizamiento', feedback: 'Un síncrono contra barra infinita no desliza: gira exactamente a nₛ.' },
      ]),
      datos: mcq('¿Qué dato puedes despreciar y con qué justificación?', [
        { label: 'Rₐ = 0.008 pu: es ~100 veces menor que Xₛ — el error de ignorarla es < 1 %', correct: true, feedback: 'Despreciar NO es olvidar: es comparar magnitudes y decidir. Rₐ/Xₛ ≈ 0.7 % aquí.' },
        { label: 'Xₛ, porque los generadores modernos la compensan', feedback: 'Xₛ ES el modelo — sin ella no hay δ, ni Q, ni nada de este capítulo.' },
        { label: 'El fp, porque solo importa P', feedback: 'Sin fp no conoces la componente reactiva de Îa, y Êaf depende de AMBAS componentes.' },
      ]),
      metodo: mcq('Camino de solución:', [
        { label: 'Îa = (P/fp)∠−cos⁻¹(fp), luego Êaf = V̂t + jXₛ·Îa en forma rectangular', correct: true, feedback: 'Fasores: módulo de la corriente desde S = P/fp, ángulo desde el fp, y una suma compleja.' },
        { label: 'P = Eaf·Vt·sen δ/Xₛ despejando δ primero', feedback: 'Círculo vicioso: esa fórmula necesita |Êaf|, que es la incógnita. Es la ecuación de VERIFICACIÓN, no de entrada.' },
        { label: 'Ensayos OCC/SCC para hallar Xₛ', feedback: 'Xₛ ya viene dada — los ensayos son para caracterizar una máquina desconocida.' },
      ]),
      supuestos: [
        { label: 'Rₐ despreciable frente a Xₛ', correcto: true },
        { label: 'Rotor cilíndrico: una sola reactancia (sin saliencia)', correcto: true },
        { label: 'Excitación constante durante la operación', correcto: true },
        { label: 'El fp en atraso implica Q negativa', correcto: false },
      ],
      respuestas: [
        { label: '|Êaf|', value: Eaf, unit: 'pu' },
        { label: 'δ', value: delta, unit: '°' },
      ],
      validacion: mcq(`Salió Êaf = ${fmt(Eaf, 2)} pu > Vt y δ = ${fmt(delta, 1)}°. ¿Coherente?`, [
        { label: 'Sí: generador con fp en atraso ⇒ SOBREexcitado (Eaf > Vt) y δ moderado (< 30°) con margen de estabilidad', correct: true, feedback: 'Dos firmas: entregar Q exige Eaf·cosδ > Vt, y un δ chico deja reserva antes de los 90°.' },
        { label: 'No: Eaf debería ser menor que Vt en un generador', feedback: 'Eaf < Vt es la firma del SUBexcitado (absorbe Q) — con fp en atraso entregando Q, es al revés.' },
        { label: 'δ debería ser 90° para máxima eficiencia', feedback: 'δ = 90° es el LÍMITE de estabilidad, no un punto de operación deseable.' },
      ]),
      solucion: [
        `|Îa| = P/fp = ${fmt(Smag, 3)} pu ∠ ${fmt((-Math.acos(fp) * 180) / Math.PI, 1)}°`,
        `Êaf = 1 + j${fmt(Xs, 1)}·(${fmt(IaRe, 3)} ${IaIm < 0 ? '−' : '+'} j${fmt(Math.abs(IaIm), 3)}) = ${fmt(EafRe, 3)} + j${fmt(EafIm, 3)}`,
        `|Êaf| = ${fmt(Eaf, 3)} pu · δ = ${fmt(delta, 1)}°`,
        `Verificación: P = Eaf·Vt·senδ/Xₛ = ${fmt((Eaf * Math.sin((delta * Math.PI) / 180)) / Xs, 2)} pu ✓`,
      ],
    }
  },
}

const indTmax: TrainerFamily = {
  id: 'n2-tmax',
  title: 'Inducción: par máximo por Thévenin',
  chapter: 7,
  level: 2,
  generate() {
    const p: InductionParams = {
      V: 460 / Math.sqrt(3),
      f: 60,
      poles: 4,
      R1: rnd(15, 30, 5) / 100,
      X1: 0.5,
      R2: rnd(10, 25, 5) / 100,
      X2: 0.5,
      Xm: rnd(12, 20, 2),
      Pcore: 0,
      Pfw: 0,
    }
    const { Tmax, sMax } = inductionMaxTorque(p)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 2,
      statement: `Motor de inducción trifásico, 460 V, 60 Hz, 4 polos, conexión Y. Por fase: R₁ = ${p.R1} Ω, X₁ = 0.5 Ω, R₂′ = ${p.R2} Ω, X₂′ = 0.5 Ω, X_m = ${p.Xm} Ω. Momento de inercia del rotor J = 0.4 kg·m². Halle el deslizamiento de par máximo s_maxT y el par máximo T_max.`,
      data: [
        { label: 'V línea / conexión', value: '460 V · Y', tag: 'útil' },
        { label: 'R₁, X₁, R₂′, X₂′', value: `${p.R1} · 0.5 · ${p.R2} · 0.5 Ω`, tag: 'útil' },
        { label: 'X_m', value: `${p.Xm} Ω`, tag: 'útil' },
        { label: 'J del rotor', value: '0.4 kg·m²', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué pregunta el problema realmente?', [
        { label: 'Un punto especial de la curva PAR-VELOCIDAD de régimen permanente', correct: true, feedback: 'Par máximo y su deslizamiento son geometría de la curva T(s) — nada de dinámica.' },
        { label: 'Un transitorio de arranque (por eso dan J)', feedback: 'J solo importaría para TIEMPOS de aceleración. T_max y s_maxT son de estado estable — J es el señuelo.' },
        { label: 'El rendimiento nominal del motor', feedback: 'No piden potencias de salida ni pérdidas: piden el techo de par.' },
      ]),
      datos: mcq('El dato que NO se usa:', [
        { label: 'J = 0.4 kg·m² — la inercia no altera la curva T(s), solo cuánto tarda en recorrerla', correct: true, feedback: 'Regla general: inercia → dinámica; resistencias/reactancias → curva estática. Clasifica los datos por el fenómeno al que pertenecen.' },
        { label: 'X_m — la rama magnetizante nunca importa', feedback: 'Importa, y mucho: Thévenin existe precisamente para no despreciarla.' },
        { label: 'R₁ — el estator no interviene en el par', feedback: 'R₁ entra en el equivalente Thévenin y reduce el par disponible.' },
      ]),
      metodo: mcq('Herramienta correcta:', [
        { label: 'Equivalente Thévenin del estator+Xm, luego s_maxT = R₂′/√(R_th²+(X_th+X₂′)²) y su T_max', correct: true, feedback: 'Thévenin convierte el circuito en una malla única donde el par máximo tiene fórmula cerrada.' },
        { label: 'Ignorar Xm y usar el circuito serie directo', feedback: 'Con Xm = 15 Ω el error es de varios %, y el hábito es peor que el error: Thévenin cuesta dos líneas.' },
        { label: 'Ensayo de rotor bloqueado', feedback: 'El ensayo EXTRAE parámetros; aquí ya los tienes — toca usarlos.' },
      ]),
      supuestos: [
        { label: 'Parámetros constantes con el deslizamiento (sin efecto de barra profunda)', correcto: true },
        { label: 'Pérdidas mecánicas aparte (no afectan el par electromagnético)', correcto: true },
        { label: 'T_max depende de R₂′', correcto: false },
      ],
      respuestas: [
        { label: 's_maxT', value: sMax * 100, unit: '%' },
        { label: 'T_max', value: Tmax, unit: 'N·m' },
      ],
      validacion: mcq('¿Qué propiedad clave de T_max puedes usar como chequeo cruzado?', [
        { label: 'T_max NO depende de R₂′ (solo s_maxT se mueve con ella) — si tu fórmula de T_max contiene R₂′, está mal', correct: true, feedback: 'La independencia de T_max respecto a R₂′ es el resultado más elegante del capítulo (y la base del rotor devanado).' },
        { label: 'T_max ocurre siempre en s = 1', feedback: 'En s = 1 está el par de ARRANQUE, casi siempre menor que el máximo.' },
        { label: 'T_max crece con el cuadrado del deslizamiento', feedback: 'El par máximo es un número fijo de la máquina, no una función de s.' },
      ]),
      solucion: [
        `V_fase = 460/√3 = ${fmt(p.V, 1)} V · Thévenin: V_th, R_th, X_th del divisor con jX_m`,
        `s_maxT = R₂′/√(R_th²+(X_th+X₂′)²) = ${fmt(sMax * 100, 1)} %`,
        `T_max = (3/2ωₛ)·V_th²/(R_th+√(R_th²+(X_th+X₂′)²)) = ${fmt(Tmax, 1)} N·m`,
        'J era el distractor: pertenece a la dinámica, no a la curva.',
      ],
    }
  },
}

const paraleloDroop: TrainerFamily = {
  id: 'n2-droop',
  title: 'Generadores en paralelo: estatismo',
  chapter: 5,
  level: 2,
  generate() {
    const k = rnd(8, 15, 1) / 10
    const f1 = rnd(608, 622, 2) / 10
    const f2 = rnd(602, Math.round(f1 * 10) - 2, 2) / 10
    const pL = rnd(15, 35, 5) / 10
    const r = droopSolve({ fNl: f1, k }, { fNl: f2, k }, pL)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 5,
      level: 2,
      statement: `Dos generadores sincrónicos alimentan en paralelo una carga aislada de ${fmt(pL, 1)} MW. Ambos gobernadores tienen estatismo ${fmt(k, 1)} Hz/MW; el generador 1 está ajustado a ${fmt(f1, 1)} Hz en vacío y el 2 a ${fmt(f2, 1)} Hz. Xₛ = 1.1 pu en ambos. Halle la frecuencia del sistema y el reparto P₁, P₂.`,
      data: [
        { label: 'Estatismo k', value: `${fmt(k, 1)} Hz/MW`, tag: 'útil' },
        { label: 'Consignas f₀₁ / f₀₂', value: `${fmt(f1, 1)} / ${fmt(f2, 1)} Hz`, tag: 'útil' },
        { label: 'Carga P_L', value: `${fmt(pL, 1)} MW`, tag: 'útil' },
        { label: 'Xₛ', value: '1.1 pu', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué gobierna el reparto de MW entre las dos máquinas?', [
        { label: 'Sus MÁQUINAS IMPULSORAS (rectas de estatismo de los gobernadores) — no su electrónica ni su excitación', correct: true, feedback: 'Ambas giran forzosamente a la misma f: la única libertad es cuánto empuja cada turbina.' },
        { label: 'La reactancia síncrona de cada una', feedback: 'Xₛ gobierna los REACTIVOS y el ángulo interno; los MW en paralelo los reparten los gobernadores. Por eso Xₛ es el dato señuelo.' },
        { label: 'La que tenga mayor corriente de campo toma más MW', feedback: 'La excitación mueve kVAR y tensión. Es EL error conceptual clásico de este tema.' },
      ]),
      datos: mcq('Dato que sobra:', [
        { label: 'Xₛ = 1.1 pu — pertenece al problema de reactivos/fasores, no al de frecuencia-potencia', correct: true, feedback: 'Cada pregunta activa un modelo; los datos del OTRO modelo son ruido. Este examen te lo hará siempre.' },
        { label: 'El estatismo k', feedback: 'Sin k no hay pendiente y el reparto queda indeterminado.' },
        { label: 'La consigna del generador 2', feedback: 'La DIFERENCIA de consignas fija la diferencia de cargas: esencial.' },
      ]),
      metodo: mcq('Planteo correcto:', [
        { label: 'Dos rectas f = f₀ᵢ − k·Pᵢ con la MISMA f, más P₁+P₂ = P_L: tres ecuaciones, tres incógnitas', correct: true, feedback: 'El sistema lineal de la Fig. 5-29 — la frecuencia común es la variable que acopla.' },
        { label: 'P = Eaf·Vt·sen δ/Xₛ para cada máquina', feedback: 'Válida por dentro de cada máquina, pero el REPARTO lo imponen los gobernadores: esa ecuación te ajustaría δ después.' },
        { label: 'Dividir la carga a la mitad por ser máquinas iguales', feedback: 'Iguales las máquinas, pero NO las consignas (61.5 ≠ 61.0): el reparto sigue a los setpoints.' },
      ]),
      supuestos: [
        { label: 'Estado estable: ambas exactamente a la misma frecuencia', correcto: true },
        { label: 'Pérdidas despreciables (P₁+P₂ = P_L)', correcto: true },
        { label: 'Estatismo lineal en el rango de trabajo', correcto: true },
        { label: 'La máquina más excitada toma más MW', correcto: false },
      ],
      respuestas: [
        { label: 'f sistema', value: r.f, unit: 'Hz', tolPct: 0.2 },
        { label: 'P₁', value: r.p1, unit: 'MW' },
        { label: 'P₂', value: r.p2, unit: 'MW' },
      ],
      validacion: mcq('Chequeos rápidos del resultado:', [
        { label: 'P₁+P₂ = P_L exacto, ambas P > 0 (nadie motoriza), y f entre las dos consignas en vacío', correct: true, feedback: 'Tres desigualdades gratis que cazan el 90 % de los errores de álgebra.' },
        { label: 'f debe dar exactamente 60.00 Hz', feedback: 'Solo si las consignas fueron elegidas para eso: en general la isla flota donde el balance la deje.' },
        { label: 'P₁ = P₂ porque las máquinas son idénticas', feedback: 'Con consignas distintas, reparto distinto — la simetría está rota a propósito.' },
      ]),
      solucion: [
        `f = (f₀₁ + f₀₂ − k·P_L)/2 = ${fmt(r.f, 2)} Hz`,
        `P₁ = (f₀₁−f)/k = ${fmt(r.p1, 2)} MW · P₂ = (f₀₂−f)/k = ${fmt(r.p2, 2)} MW`,
        `Chequeo: P₁+P₂ = ${fmt(r.p1 + r.p2, 2)} = P_L ✓ · Xₛ no se usó (era del problema de reactivos)`,
      ],
    }
  },
}

// ---------------------------------------------------------------------------
// NIVEL 3 · Avanzados: placa de datos, por-unidad, unidades mezcladas
// ---------------------------------------------------------------------------

const placaPu: TrainerFamily = {
  id: 'n3-placa',
  title: 'Placa, por-unidad y falla trifásica',
  chapter: 6,
  level: 3,
  generate() {
    const S = rnd(40, 80, 10) // MVA
    const V = 13.8
    const Xpp = rnd(15, 25, 1) / 100
    const Ibase = (S * 1e6) / (Math.sqrt(3) * V * 1e3) / 1000 // kA
    const Ipp = Ibase / Xpp
    const XppNew = Xpp * (100 / S)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 6,
      level: 3,
      statement: `PLACA de un turbogenerador: ${S} MVA · 13.8 kV · fp 0.85 · 3600 r/min · X″d = ${fmt(Xpp * 100, 0)} % · clase de aislamiento F. Operando en vacío a tensión nominal sufre un cortocircuito trifásico en bornes. Halle (a) la corriente subtransitoria simétrica en kA, y (b) X″d en por-unidad sobre una base de 100 MVA (para el estudio de red).`,
      data: [
        { label: 'S placa', value: `${S} MVA`, tag: 'útil' },
        { label: 'V placa', value: '13.8 kV', tag: 'útil' },
        { label: 'X″d', value: `${fmt(Xpp * 100, 0)} % (base placa)`, tag: 'útil' },
        { label: 'fp nominal', value: '0.85', tag: 'irrelevante' },
        { label: 'Velocidad', value: '3600 r/min', tag: 'irrelevante' },
        { label: 'Clase de aislamiento', value: 'F', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué régimen de la máquina interroga el problema?', [
        { label: 'El primer instante del transitorio de cortocircuito: manda X″d (flujo atrapado, teorema de λ constante)', correct: true, feedback: 'Subtransitorio = los amortiguadores todavía sostienen el flujo: la reactancia aparente es la mínima.' },
        { label: 'El régimen permanente de la falla (Xd)', feedback: 'Ese llega segundos después; «subtransitoria» te apunta explícitamente a X″d.' },
        { label: 'La capacidad de sobrecarga térmica', feedback: 'La clase F es el señuelo térmico: la pregunta es electromagnética.' },
      ]),
      datos: mcq('¿Qué grupo de datos de placa NO interviene?', [
        { label: 'fp, velocidad y clase de aislamiento: describen la operación nominal y térmica, no el cortocircuito', correct: true, feedback: 'La placa SIEMPRE trae más de lo que cada problema usa: leerla es filtrarla según el fenómeno.' },
        { label: 'Los MVA: la falla no depende del tamaño', feedback: 'Los MVA definen la corriente BASE — sin ellos el % de X″d no se convierte en amperes.' },
        { label: 'El voltaje: en pu todo es 1.0', feedback: 'El pu es 1.0 gracias a que el voltaje base ES el de placa: lo necesitas para volver a amperes.' },
      ]),
      metodo: mcq('Ruta de cálculo para (a) y (b):', [
        { label: 'I″ = E/X″ = 1/X″ pu → multiplicar por I_base = S/(√3·V); cambio de base: X_nueva = X·(S_nueva/S_placa)', correct: true, feedback: 'Dos operaciones de por-unidad: pu→amperes con la base, y base→base con la razón de potencias (mismo voltaje).' },
        { label: 'I″ = V/(√3·X″) con X″ en ohms directamente', feedback: 'X″ viene en %: primero se interpreta en pu sobre SU base, o se convierte a ohms con Z_base = V²/S. Saltarse la base es el error clásico.' },
        { label: 'Aplicar componentes simétricas de secuencia negativa', feedback: 'La falla TRIFÁSICA es balanceada: solo secuencia positiva. Simétricas serían para fallas L-G o L-L.' },
      ]),
      supuestos: [
        { label: 'Falla desde vacío: E″ = 1.0 pu', correcto: true },
        { label: 'Resistencias despreciables (solo reactancia)', correcto: true },
        { label: 'Cambio de base con el MISMO voltaje base (solo razón de MVA)', correcto: true },
        { label: 'La corriente de falla depende del fp nominal', correcto: false },
      ],
      respuestas: [
        { label: 'I″ simétrica', value: Ipp, unit: 'kA' },
        { label: 'X″d (base 100 MVA)', value: XppNew, unit: 'pu' },
      ],
      validacion: mcq(`I″ = ${fmt(Ipp, 1)} kA (${fmt(1 / Xpp, 1)} × la nominal). ¿Orden de magnitud creíble?`, [
        { label: 'Sí: 1/X″ ≈ 4–7 veces la corriente nominal es lo esperable en turbogeneradores', correct: true, feedback: 'El inverso de X″d como múltiplo de la nominal es el chequeo instantáneo de cualquier estudio de cortocircuito.' },
        { label: 'No: la falla debería ser menor que la nominal', feedback: 'Una falla en bornes con solo X″ de por medio SIEMPRE supera varias veces la nominal — por eso existen interruptores.' },
        { label: 'Debería dar 100 veces la nominal', feedback: 'Eso exigiría X″ = 0.01 pu — ninguna máquina real baja de ~0.1.' },
      ]),
      solucion: [
        `I_base = ${S} MVA/(√3·13.8 kV) = ${fmt(Ibase, 2)} kA`,
        `I″ = (1.0/${fmt(Xpp, 2)})·I_base = ${fmt(1 / Xpp, 2)} pu → ${fmt(Ipp, 1)} kA`,
        `X″(100 MVA) = ${fmt(Xpp, 2)}·(100/${S}) = ${fmt(XppNew, 3)} pu`,
        'fp, r/min y clase F: datos de placa reales que este problema no consume.',
      ],
    }
  },
}

const trafo3f: TrainerFamily = {
  id: 'n3-trafo3f',
  title: 'Banco trifásico Δ–Y: relaciones y corrientes',
  chapter: 2,
  level: 3,
  generate() {
    const S = rnd(15, 60, 15) // MVA
    const Vd = 13.8 // Δ primario
    const Vy = 138 // Y secundario
    const aTurns = Vd / (Vy / Math.sqrt(3))
    const Ilp = (S * 1e6) / (Math.sqrt(3) * Vd * 1e3) // línea primario A
    const Ifp = Ilp / Math.sqrt(3) // fase Δ
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 3,
      statement: `Un banco trifásico de ${S} MVA se conecta Δ (primario, 13.8 kV de línea) – Y (secundario, 138 kV de línea) para transmisión. A plena carga halle: (a) la relación de vueltas a de CADA transformador monofásico, (b) la corriente de LÍNEA del primario, y (c) la corriente de FASE (dentro de la Δ).`,
      data: [
        { label: 'S trifásica', value: `${S} MVA`, tag: 'útil' },
        { label: 'V línea primario (Δ)', value: '13.8 kV', tag: 'útil' },
        { label: 'V línea secundario (Y)', value: '138 kV', tag: 'útil' },
        { label: 'Relación de voltajes de línea', value: '13.8:138 = 1:10', tag: 'redundante' },
      ],
      identificar: mcq('La trampa central del banco Δ–Y:', [
        { label: 'La relación de vueltas usa voltajes de FASE de cada devanado — y en la Y el de fase es el de línea ÷ √3', correct: true, feedback: 'Cada transformador monofásico solo conoce SUS terminales: en Δ ve el voltaje de línea, en Y ve el de línea/√3.' },
        { label: 'La relación de vueltas es directamente 13.8/138', feedback: 'Esa es la relación de LÍNEA (dato redundante a propósito). La de vueltas difiere en √3 por la conexión Y.' },
        { label: 'Δ y Y no cambian nada: solo son formas de dibujar', feedback: 'Cambian las relaciones línea/fase de voltaje Y corriente (y el desfase de 30° del grupo vectorial).' },
      ]),
      datos: mcq('El dato «relación de línea 1:10» es…', [
        { label: 'Redundante con los dos voltajes, y PELIGROSO: invita a confundirla con la relación de vueltas (que es √3 mayor aquí)', correct: true, feedback: 'Dato redundante que además tiende una trampa: la marca de un problema de nivel examen.' },
        { label: 'El único dato necesario', feedback: 'Sin los MVA no hay corrientes; sin saber la conexión no hay relación de vueltas.' },
        { label: 'Irrelevante para todo', feedback: 'Redundante (se deduce), no irrelevante: contiene información correcta pero repetida.' },
      ]),
      metodo: mcq('Secuencia de cálculo:', [
        { label: 'a = V_Δ/(V_Y/√3); I_línea = S/(√3·V_línea); dentro de la Δ: I_fase = I_línea/√3', correct: true, feedback: 'Tres reglas de conexión aplicadas con criterio: fase-vs-línea en voltaje (Y) y en corriente (Δ).' },
        { label: 'Todo con S = 3·V·I usando voltajes de fase siempre', feedback: 'Válido si eres impecable con qué V y qué I son «de fase» — la forma √3·V_línea·I_línea es menos propensa a error.' },
        { label: 'a = 138/13.8 y las corrientes con esa relación', feedback: 'Relación invertida Y de línea: doble trampa. Las corrientes de línea salen de S y V, no de a.' },
      ]),
      supuestos: [
        { label: 'Banco ideal (sin pérdidas ni impedancia) para las relaciones pedidas', correcto: true },
        { label: 'Sistema balanceado: las tres fases idénticas', correcto: true },
        { label: 'El desfase de 30° Δ–Y no afecta las MAGNITUDES pedidas', correcto: true },
        { label: 'En Δ, la corriente de fase es mayor que la de línea', correcto: false },
      ],
      respuestas: [
        { label: 'a (por transformador)', value: aTurns, unit: '—' },
        { label: 'I línea primario', value: Ilp, unit: 'A', tolPct: 1 },
        { label: 'I fase en la Δ', value: Ifp, unit: 'A', tolPct: 1 },
      ],
      validacion: mcq('Chequeo del grupo vectorial:', [
        { label: 'La relación de línea (10) ≠ relación de vueltas (a/√3 de ella): en Δ–Y difieren en √3 y además hay 30° de desfase — el «grupo vectorial» del banco', correct: true, feedback: 'Dyn con ±30°: crucial al poner bancos en paralelo — dos bancos con grupos distintos NO pueden conectarse aunque las relaciones de línea coincidan.' },
        { label: 'Línea y vueltas siempre coinciden si el banco es ideal', feedback: 'Solo en Y–Y o Δ–Δ. La mezcla introduce el √3 y los 30°.' },
        { label: 'El desfase de 30° es un defecto de fabricación', feedback: 'Es una propiedad topológica de la conexión — y hasta útil (cancela armónicos en bancos de 12 pulsos).' },
      ]),
      solucion: [
        `V_fase(Y) = 138/√3 = ${fmt(Vy / Math.sqrt(3), 1)} kV → a = 13.8/${fmt(Vy / Math.sqrt(3), 1)} = ${fmt(aTurns, 3)}`,
        `I_línea(prim) = ${S} MVA/(√3·13.8 kV) = ${fmt(Ilp, 0)} A`,
        `I_fase(Δ) = ${fmt(Ilp, 0)}/√3 = ${fmt(Ifp, 0)} A`,
        `La relación de LÍNEA era 10, pero la de VUELTAS es ${fmt(aTurns, 2)} — el √3 de la Y.`,
      ],
    }
  },
}

const motorNema: TrainerFamily = {
  id: 'n3-nema',
  title: 'Placa de motor: hp, corriente y par',
  chapter: 7,
  level: 3,
  generate() {
    const hp = [25, 50, 75, 100][rnd(0, 3)]
    const eta = rnd(90, 94, 1) / 100
    const fp = rnd(84, 90, 2) / 100
    const nm = [1160, 1755, 1764, 3520][rnd(0, 3)]
    const poles = nm > 3000 ? 2 : nm > 1500 ? 4 : 6
    const ns = syncSpeedRpm(60, poles)
    const Pout = hp * 746
    const I = Pout / (eta * Math.sqrt(3) * 460 * fp)
    const s = ((ns - nm) / ns) * 100
    const T = Pout / ((nm * 2 * Math.PI) / 60)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 3,
      statement: `PLACA de un motor de inducción: ${hp} hp · 460 V · 3φ · 60 Hz · ${nm} r/min · η = ${fmt(eta * 100, 0)} % · fp = ${fmt(fp, 2)} · servicio S1 · 40 °C ambiente. Halle (a) la corriente de línea a plena carga, (b) el deslizamiento, y (c) el par NOMINAL en N·m.`,
      data: [
        { label: 'Potencia de salida', value: `${hp} hp`, tag: 'útil' },
        { label: 'V, η, fp', value: `460 V · ${fmt(eta * 100, 0)} % · ${fmt(fp, 2)}`, tag: 'útil' },
        { label: 'Velocidad de placa', value: `${nm} r/min`, tag: 'útil' },
        { label: 'Servicio', value: 'S1 (continuo)', tag: 'irrelevante' },
        { label: 'Ambiente', value: '40 °C', tag: 'irrelevante' },
      ],
      identificar: mcq('Los hp de la placa son potencia…', [
        { label: 'MECÁNICA de salida en el eje — la eléctrica de entrada es mayor (÷η) y en watts: 1 hp = 746 W', correct: true, feedback: 'La placa habla del EJE. Todo lo eléctrico se deriva pasando por η y el fp.' },
        { label: 'Eléctrica de entrada', feedback: 'La entrada es Pout/η — si usas los hp directos como entrada, subestimas la corriente ~8 %.' },
        { label: 'Aparente (los hp son como kVA)', feedback: 'Los hp son potencia REAL mecánica; los kVA aparecen al dividir por η y fp.' },
      ]),
      datos: mcq('¿Dónde está el peligro de UNIDADES en este problema?', [
        { label: 'Doble: hp→W (×746) para potencias, y r/min→rad/s (×2π/60) para el par', correct: true, feedback: 'Las dos conversiones que más puntos cuestan en exámenes de máquinas. Hazlas explícitas SIEMPRE.' },
        { label: 'Solo el voltaje, que debe pasarse a kV', feedback: '460 V en voltios funciona perfecto — el riesgo real está en hp y r/min.' },
        { label: 'Ninguno: todo está en SI', feedback: 'hp y r/min NO son SI — son la herencia de placa americana que este problema entrena.' },
      ]),
      metodo: mcq('Fórmula para la corriente de línea:', [
        { label: 'I = P_out/(η·√3·V_L·fp) — la salida convertida a entrada eléctrica trifásica', correct: true, feedback: 'De la placa a la corriente en una línea: eje → entrada (÷η) → amperes (÷√3·V·fp).' },
        { label: 'I = P_out/(√3·V_L) — el fp no afecta la corriente', feedback: 'El fp ES la fracción útil de la corriente: ignorarlo subestima I un 15 %.' },
        { label: 'I = P_out/V_L (monofásico)', feedback: 'Es trifásico: falta el √3, y también η y fp.' },
      ]),
      supuestos: [
        { label: 'Los datos de placa corresponden a plena carga', correcto: true },
        { label: 'η y fp de placa son los del punto nominal', correcto: true },
        { label: 'El par nominal se calcula con la velocidad REAL (r/min de placa), no con la síncrona', correcto: true },
        { label: 'El servicio S1 limita la corriente admisible', correcto: false },
      ],
      respuestas: [
        { label: 'I línea', value: I, unit: 'A' },
        { label: 's', value: s, unit: '%', tolPct: 4 },
        { label: 'T nominal', value: T, unit: 'N·m' },
      ],
      validacion: mcq(`I = ${fmt(I, 0)} A para ${hp} hp a 460 V. ¿Regla de sanidad?`, [
        { label: 'Regla práctica: a 460 V, un motor toma ≈ 1.1–1.3 A por hp — el resultado cae en esa banda', correct: true, feedback: 'Las reglas de placa (A/hp por nivel de tensión) son el chequeo del ingeniero de campo: úsalas para cazar errores de √3 o de η.' },
        { label: 'La corriente debe ser numéricamente igual a los hp', feedback: 'Solo coincidencia a 575 V aprox. — a 460 V la banda es 1.1–1.3 A/hp.' },
        { label: 'No hay forma de estimar sin el circuito equivalente', feedback: 'La placa + reglas de sanidad estiman en segundos; el circuito es para detalles.' },
      ]),
      solucion: [
        `P_out = ${hp}·746 = ${fmt(Pout / 1000, 1)} kW`,
        `I = ${fmt(Pout / 1000, 1)}k/(${fmt(eta, 2)}·√3·460·${fmt(fp, 2)}) = ${fmt(I, 1)} A (≈ ${fmt(I / hp, 2)} A/hp ✓)`,
        `nₛ = ${ns} (${poles} polos) → s = ${fmt(s, 2)} %`,
        `ω = 2π·${nm}/60 = ${fmt((nm * 2 * Math.PI) / 60, 1)} rad/s → T = P_out/ω = ${fmt(T, 0)} N·m`,
      ],
    }
  },
}

const dcArranque: TrainerFamily = {
  id: 'n3-dcarr',
  title: 'Arranque de motor CC: choque y resistencia',
  chapter: 10,
  level: 3,
  generate() {
    const V = 240
    const Ra = rnd(3, 7, 1) / 10
    const In = rnd(40, 90, 10)
    const lim = rnd(15, 25, 5) / 10
    const Iarr = V / Ra
    const mult = Iarr / In
    const Rext = V / (lim * In) - Ra
    const Pkw = (V * In * 0.88) / 1000
    return {
      familyId: this.id,
      title: this.title,
      chapter: 10,
      level: 3,
      statement: `Motor de CC en derivación: 240 V, corriente nominal de armadura ${In} A, Rₐ = ${fmt(Ra, 1)} Ω, potencia de placa ≈ ${fmt(Pkw, 1)} kW, J total = 2.1 kg·m². Halle (a) la corriente de arranque DIRECTO como múltiplo de la nominal, y (b) la resistencia externa necesaria para limitar el arranque a ${fmt(lim, 1)}·I_nominal.`,
      data: [
        { label: 'V y Rₐ', value: `240 V · ${fmt(Ra, 1)} Ω`, tag: 'útil' },
        { label: 'I nominal', value: `${In} A`, tag: 'útil' },
        { label: 'Límite deseado', value: `${fmt(lim, 1)}·In`, tag: 'útil' },
        { label: 'Potencia de placa', value: `${fmt(Pkw, 1)} kW`, tag: 'redundante' },
        { label: 'J total', value: '2.1 kg·m²', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Por qué el arranque directo es un problema en CC?', [
        { label: 'En reposo Eₐ = 0: nada se opone a V salvo la pequeña Rₐ — la corriente salta a V/Rₐ', correct: true, feedback: 'La FEM es el «freno eléctrico» natural, y en el arranque no existe: solo queda la resistencia óhmica.' },
        { label: 'Porque el campo tarda en establecerse', feedback: 'En derivación el campo se energiza con la línea; el problema es la ARMADURA sin FEM.' },
        { label: 'Por la inercia J, que exige mucha corriente', feedback: 'J alarga el TIEMPO de arranque; el pico inicial de corriente es puramente eléctrico (V/Rₐ), exista o no inercia.' },
      ]),
      datos: mcq('Clasifica los datos sobrantes:', [
        { label: 'kW de placa: REDUNDANTE (≈ V·In); J: IRRELEVANTE para picos de corriente (solo daría tiempos)', correct: true, feedback: 'Dos categorías distintas de dato sobrante — reconocerlas por separado es parte del oficio.' },
        { label: 'Ambos imprescindibles', feedback: 'El pico es V/Rₐ y la Rext sale de V, In y el límite: ni kW ni J entran.' },
        { label: 'La Rₐ es el dato sobrante', feedback: 'Rₐ es EL protagonista: es lo único que limita el arranque directo.' },
      ]),
      metodo: mcq('Para la resistencia externa:', [
        { label: 'En el instante inicial (Eₐ=0): V = I_lim·(Rₐ+R_ext) → despejar R_ext', correct: true, feedback: 'El peor caso es t=0⁺; a medida que acelera, Eₐ crece y la corriente cae — por eso los arrancadores CORTAN etapas.' },
        { label: 'R_ext = V/I_nominal', feedback: 'Eso limitaría a 1.0·In ignorando Rₐ — revisa el planteo con la malla completa.' },
        { label: 'Usar la constante de tiempo τ = L/R', feedback: 'τ describe QUÉ TAN RÁPIDO sube la corriente, no su valor límite — pregunta distinta.' },
      ]),
      supuestos: [
        { label: 'En t = 0⁺ el motor está detenido: Eₐ = 0', correcto: true },
        { label: 'El campo ya está establecido (derivación conectada antes)', correcto: true },
        { label: 'Inductancia de armadura despreciable para el valor pico', correcto: true },
        { label: 'La corriente de arranque depende de la carga mecánica', correcto: false },
      ],
      respuestas: [
        { label: 'I_arranque directo', value: mult, unit: '× In' },
        { label: 'R_ext', value: Rext, unit: 'Ω' },
      ],
      validacion: mcq(`El arranque directo daría ${fmt(mult, 1)}·In. ¿Consecuencia física de permitirlo?`, [
        { label: 'Conmutación destructiva (flameo en el colector) y par de choque ~proporcional a la corriente: se dobla lo mecánico y se quema lo eléctrico', correct: true, feedback: 'T = KΦ·Ia: un pico de 8× corriente es un pico de ~8× par instantáneo sobre acoples y reductores.' },
        { label: 'Ninguna: los motores CC toleran cualquier arranque', feedback: 'Solo los muy pequeños (Rₐ relativamente grande). Del rango de kW hacia arriba, el arrancador es obligatorio.' },
        { label: 'Solo se dispararía el alumbrado de la planta', feedback: 'La caída de tensión ocurre, pero el daño principal es del propio motor: colector y transmisión.' },
      ]),
      solucion: [
        `I_arr = V/Rₐ = 240/${fmt(Ra, 1)} = ${fmt(Iarr, 0)} A = ${fmt(mult, 1)}·In`,
        `R_ext = V/(${fmt(lim, 1)}·${In}) − ${fmt(Ra, 1)} = ${fmt(Rext, 2)} Ω`,
        'kW era redundante (V·In) y J irrelevante para el PICO: pertenece al problema del tiempo de arranque.',
      ],
    }
  },
}

export const TRAINER_FAMILIES: TrainerFamily[] = [
  magCircuito,
  trafoIdeal,
  velocidadSlip,
  dcEmf,
  trafoEnsayos,
  sincFasores,
  indTmax,
  paraleloDroop,
  placaPu,
  trafo3f,
  motorNema,
  dcArranque,
]

/** Los 7 pasos del ciclo del ingeniero, en orden. */
export const CICLO = [
  'Identificar la máquina',
  'Interpretar los datos',
  'Elegir el modelo',
  'Declarar supuestos',
  'Resolver',
  'Unidades y límites',
  'Validar físicamente',
] as const
