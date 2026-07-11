import { type Complex, abs, add, arg, cdiv, cis, cmul, cpar, cx, scale, sub, toDeg } from './machine'

// ---------------------------------------------------------------------------
// Capítulo 11 — Componentes simétricas y fallas desbalanceadas.
// Transformación de Fortescue, redes de secuencia y el solucionador general
// de fallas en derivación (3φ, SLG, L-L, LLG) con impedancia de falla y de
// neutro. Convención: E de prefalla en el eje real, impedancias complejas.
// ---------------------------------------------------------------------------

/** Operador de rotación a = 1∠120°. */
export const A_OP: Complex = cis(1, (2 * Math.PI) / 3)
export const A2_OP: Complex = cis(1, (-2 * Math.PI) / 3)

export interface Tripleta {
  a: Complex
  b: Complex
  c: Complex
}
export interface Secuencias {
  s0: Complex
  s1: Complex
  s2: Complex
}

/** abc → 012 (síntesis de Fortescue): X0 = ⅓(a+b+c), X1 = ⅓(a + a·b + a²·c)… */
export function abcTo012(t: Tripleta): Secuencias {
  const third = 1 / 3
  return {
    s0: scale(add(add(t.a, t.b), t.c), third),
    s1: scale(add(add(t.a, cmul(A_OP, t.b)), cmul(A2_OP, t.c)), third),
    s2: scale(add(add(t.a, cmul(A2_OP, t.b)), cmul(A_OP, t.c)), third),
  }
}

/** 012 → abc: a = X0+X1+X2, b = X0+a²X1+aX2, c = X0+aX1+a²X2. */
export function seq012ToAbc(s: Secuencias): Tripleta {
  return {
    a: add(add(s.s0, s.s1), s.s2),
    b: add(add(s.s0, cmul(A2_OP, s.s1)), cmul(A_OP, s.s2)),
    c: add(add(s.s0, cmul(A_OP, s.s1)), cmul(A2_OP, s.s2)),
  }
}

export type FaultKind = '3f' | 'slg' | 'll' | 'llg'

export interface FaultInput {
  kind: FaultKind
  /** FEM interna de prefalla [pu], sobre el eje real */
  E: number
  Z1: Complex
  Z2: Complex
  /** Z0 del punto de falla SIN incluir el neutro */
  Z0: Complex
  /** Impedancia de falla (por fase, franca = 0) */
  Zf: Complex
  /** Impedancia de puesta a tierra del neutro (entra como 3·Zn en la red cero) */
  Zn: Complex
}

export interface FaultSolution {
  kind: FaultKind
  seqI: Secuencias
  seqV: Secuencias
  phaseI: Tripleta
  phaseV: Tripleta
  /** Corriente de la(s) fase(s) falladas (magnitud representativa) [pu] */
  iFalla: number
  /** Corriente residual 3·I0 que ve un relé de tierra [pu] */
  iResidual: number
}

const ZERO = cx(0, 0)

/**
 * Resuelve la falla en derivación conectando las redes de secuencia según el
 * tipo: 3φ (solo positiva), SLG (las tres en serie con 3Zf+3Zn), L-L
 * (positiva y negativa en paralelo vía Zf), LLG (negativa ∥ cero, con 3Zf+3Zn
 * en la rama cero).
 */
export function solveFault(inp: FaultInput): FaultSolution {
  const E = cx(inp.E, 0)
  const Z0T = add(inp.Z0, scale(inp.Zn, 3)) // red cero completa (con 3Zn)
  let I0 = ZERO
  let I1 = ZERO
  let I2 = ZERO

  switch (inp.kind) {
    case '3f': {
      I1 = cdiv(E, add(inp.Z1, inp.Zf))
      break
    }
    case 'slg': {
      const Zser = add(add(add(inp.Z1, inp.Z2), Z0T), scale(inp.Zf, 3))
      I1 = cdiv(E, Zser)
      I2 = I1
      I0 = I1
      break
    }
    case 'll': {
      I1 = cdiv(E, add(add(inp.Z1, inp.Z2), inp.Zf))
      I2 = scale(I1, -1)
      break
    }
    case 'llg': {
      const Zcero = add(Z0T, scale(inp.Zf, 3))
      I1 = cdiv(E, add(inp.Z1, cpar(inp.Z2, Zcero)))
      // Divisor de corriente entre la red negativa y la cero
      I2 = scale(cmul(I1, cdiv(Zcero, add(inp.Z2, Zcero))), -1)
      I0 = scale(cmul(I1, cdiv(inp.Z2, add(inp.Z2, Zcero))), -1)
      break
    }
  }

  const seqI: Secuencias = { s0: I0, s1: I1, s2: I2 }
  const seqV: Secuencias = {
    s0: scale(cmul(I0, Z0T), -1),
    s1: sub(E, cmul(I1, inp.Z1)),
    s2: scale(cmul(I2, inp.Z2), -1),
  }
  const phaseI = seq012ToAbc(seqI)
  const phaseV = seq012ToAbc(seqV)

  const iFalla =
    inp.kind === '3f' || inp.kind === 'slg'
      ? abs(phaseI.a)
      : inp.kind === 'll'
        ? abs(phaseI.b)
        : Math.max(abs(phaseI.b), abs(phaseI.c))

  return { kind: inp.kind, seqI, seqV, phaseI, phaseV, iFalla, iResidual: 3 * abs(I0) }
}

/** Formatea un complejo como «mag∠ang°» para los laboratorios. */
export const fmtPolar = (z: Complex, digits = 2): string =>
  `${abs(z).toFixed(digits)}∠${toDeg(arg(z)).toFixed(1)}°`

/** Factor de desequilibrio de tensión: |V2|/|V1| en %. */
export const unbalanceFactor = (s: Secuencias): number =>
  abs(s.s1) < 1e-9 ? 0 : (abs(s.s2) / abs(s.s1)) * 100

/**
 * Topología de la red de secuencia CERO de un transformador de dos devanados
 * según la conexión de cada lado. Regla clásica: Yg deja PASAR la corriente
 * de secuencia cero hacia la línea; Δ la atrapa circulando dentro (camino a
 * la barra de referencia pero NO a la línea); Y aislada la bloquea del todo.
 */
export type Conexion = 'Yg' | 'Y' | 'D'
export interface ZeroSeqTopology {
  /** ¿Puede circular I0 entre la línea del lado 1 y la del lado 2? */
  through: boolean
  /** ¿Hay camino a referencia (por la Δ o el Yg del otro lado) desde el lado 1/2? */
  shunt1: boolean
  shunt2: boolean
  regla: string
}
export function zeroSeqTopology(lado1: Conexion, lado2: Conexion): ZeroSeqTopology {
  const pasa = (c: Conexion) => c === 'Yg'
  const atrapa = (c: Conexion) => c === 'D'
  const through = pasa(lado1) && pasa(lado2)
  const shunt1 = pasa(lado1) && atrapa(lado2)
  const shunt2 = pasa(lado2) && atrapa(lado1)
  let regla: string
  if (through) regla = 'Yg–Yg: la corriente de secuencia cero ATRAVIESA el transformador — las dos redes quedan unidas por su impedancia.'
  else if (shunt1 || shunt2)
    regla = 'Yg–Δ: la I0 entra por el lado Yg y se queda CIRCULANDO dentro de la delta: camino a referencia (derivación) pero circuito ABIERTO hacia la otra línea.'
  else if (lado1 === 'Y' || lado2 === 'Y')
    regla = 'Con un lado Y aislado no hay retorno por tierra: la red de secuencia cero queda ABIERTA en ese lado — ninguna I0 puede entrar.'
  else regla = 'Δ–Δ: ambas deltas atrapan; sin neutro a tierra no entra ni sale I0 — red cero abierta hacia ambas líneas.'
  return { through, shunt1, shunt2, regla }
}
