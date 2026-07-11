import { useEffect, useRef, useState, type ComponentType } from 'react'
import {
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Moon,
  Presentation,
  RotateCcw,
  Sun,
  Zap,
} from 'lucide-react'
import { ALL_CHECK_IDS, useProgress } from './ProgressContext'
import TeacherHub from './TeacherHub'
import Section1 from '../sections/Section1'
import Section2 from '../sections/Section2'
import Section3 from '../sections/Section3'
import Section4 from '../sections/Section4'
import Section5 from '../sections/Section5'
import Section6 from '../sections/Section6'
import Section7 from '../sections/Section7'
import C6Section1 from '../sections/C6Section1'
import C6Section2 from '../sections/C6Section2'
import C6Section3 from '../sections/C6Section3'
import C6Section4 from '../sections/C6Section4'
import C4Section1 from '../sections/C4Section1'
import C4Section2 from '../sections/C4Section2'
import C4Section3 from '../sections/C4Section3'
import C1Section1 from '../sections/C1Section1'
import C1Section2 from '../sections/C1Section2'
import C2Section1 from '../sections/C2Section1'
import C2Section2 from '../sections/C2Section2'
import C2Section3 from '../sections/C2Section3'
import C3Section1 from '../sections/C3Section1'
import C3Section2 from '../sections/C3Section2'
import C7Section1 from '../sections/C7Section1'
import C7Section2 from '../sections/C7Section2'
import C7Section3 from '../sections/C7Section3'
import C7Section4 from '../sections/C7Section4'
import C7Section5 from '../sections/C7Section5'
import C7Section6 from '../sections/C7Section6'
import C8Section1 from '../sections/C8Section1'
import C8Section2 from '../sections/C8Section2'
import C8Section3 from '../sections/C8Section3'
import C8Section4 from '../sections/C8Section4'
import C8Section5 from '../sections/C8Section5'
import C9Section1 from '../sections/C9Section1'
import C9Section2 from '../sections/C9Section2'
import C9Section3 from '../sections/C9Section3'
import C9Section4 from '../sections/C9Section4'
import C9Section5 from '../sections/C9Section5'
import C10Section1 from '../sections/C10Section1'
import C10Section2 from '../sections/C10Section2'
import C10Section3 from '../sections/C10Section3'
import C10Section4 from '../sections/C10Section4'
import C10Section5 from '../sections/C10Section5'

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/** Acentos por capítulo: …, naranja (CC), cian (dinámica CC) */
export const ACC: Record<ChapterId, { tab: string; btnOn: string; btnTxt: string; box: string; num: string; boxOn: string; lbl: string }> = {
  1: { tab: 'text-violet-300', btnOn: 'border-violet-500/50 bg-violet-500/10', btnTxt: 'text-violet-300', box: 'border-violet-500/30', num: 'text-violet-400', boxOn: 'border-violet-500/40 bg-violet-500/5', lbl: 'text-violet-400/70' },
  2: { tab: 'text-amber-300', btnOn: 'border-amber-500/50 bg-amber-500/10', btnTxt: 'text-amber-300', box: 'border-amber-500/30', num: 'text-amber-400', boxOn: 'border-amber-500/40 bg-amber-500/5', lbl: 'text-amber-400/70' },
  3: { tab: 'text-rose-300', btnOn: 'border-rose-500/50 bg-rose-500/10', btnTxt: 'text-rose-300', box: 'border-rose-500/30', num: 'text-rose-400', boxOn: 'border-rose-500/40 bg-rose-500/5', lbl: 'text-rose-400/70' },
  4: { tab: 'text-sky-300', btnOn: 'border-sky-500/50 bg-sky-500/10', btnTxt: 'text-sky-300', box: 'border-sky-500/30', num: 'text-sky-400', boxOn: 'border-sky-500/40 bg-sky-500/5', lbl: 'text-sky-400/70' },
  5: { tab: 'text-emerald-300', btnOn: 'border-emerald-500/50 bg-emerald-500/10', btnTxt: 'text-emerald-300', box: 'border-emerald-500/30', num: 'text-emerald-400', boxOn: 'border-emerald-500/40 bg-emerald-500/5', lbl: 'text-emerald-500/70' },
  6: { tab: 'text-red-300', btnOn: 'border-red-500/50 bg-red-500/10', btnTxt: 'text-red-300', box: 'border-red-500/30', num: 'text-red-400', boxOn: 'border-red-500/40 bg-red-500/5', lbl: 'text-red-400/70' },
  7: { tab: 'text-teal-300', btnOn: 'border-teal-500/50 bg-teal-500/10', btnTxt: 'text-teal-300', box: 'border-teal-500/30', num: 'text-teal-400', boxOn: 'border-teal-500/40 bg-teal-500/5', lbl: 'text-teal-400/70' },
  8: { tab: 'text-fuchsia-300', btnOn: 'border-fuchsia-500/50 bg-fuchsia-500/10', btnTxt: 'text-fuchsia-300', box: 'border-fuchsia-500/30', num: 'text-fuchsia-400', boxOn: 'border-fuchsia-500/40 bg-fuchsia-500/5', lbl: 'text-fuchsia-400/70' },
  9: { tab: 'text-orange-300', btnOn: 'border-orange-500/50 bg-orange-500/10', btnTxt: 'text-orange-300', box: 'border-orange-500/30', num: 'text-orange-400', boxOn: 'border-orange-500/40 bg-orange-500/5', lbl: 'text-orange-400/70' },
  10: { tab: 'text-cyan-300', btnOn: 'border-cyan-500/50 bg-cyan-500/10', btnTxt: 'text-cyan-300', box: 'border-cyan-500/30', num: 'text-cyan-400', boxOn: 'border-cyan-500/40 bg-cyan-500/5', lbl: 'text-cyan-400/70' },
}

export interface SectionDef {
  chapter: ChapterId
  num: number
  /** Prefijo de los ids de hitos de esta sección (ProgressContext) */
  prefix: string
  /** Título corto para la pestaña */
  short: string
  title: string
  items: string[]
  component: ComponentType
}

export const SECTIONS: SectionDef[] = [
  {
    chapter: 1,
    num: 1,
    prefix: 'c1s1-',
    short: 'Circuito magnético',
    title: 'Circuitos magnéticos: la ley de Ohm del flujo',
    items: ['F = NI, R = l/μA, F = φR', 'El entrehierro domina · franjeo', 'Problema 19: núcleo con gap completo'],
    component: C1Section1,
  },
  {
    chapter: 1,
    num: 2,
    prefix: 'c1s2-',
    short: 'Materiales',
    title: 'Materiales: histéresis, pérdidas y excitación CA',
    items: ['Ciclo de histéresis: Br, Hc y su área', 'Foucault y laminaciones (1/n²)', 'Corriente picuda y 3er armónico', 'Problema 20: separar las pérdidas'],
    component: C1Section2,
  },
  {
    chapter: 2,
    num: 1,
    prefix: 'c2s1-',
    short: 'Ideal',
    title: 'El transformador ideal',
    items: ['V₁/V₂ = a, I₁/I₂ = 1/a', 'Reflexión: Z′ = a²Z', 'Problema 21: el transformador de distribución'],
    component: C2Section1,
  },
  {
    chapter: 2,
    num: 2,
    prefix: 'c2s2-',
    short: 'Real y ensayos',
    title: 'Circuito equivalente y ensayos OC/SC',
    items: ['El circuito por capas (R, X, Rc∥Xm)', 'OC mide el hierro · SC mide el cobre', 'Problema 22: del laboratorio al circuito'],
    component: C2Section2,
  },
  {
    chapter: 2,
    num: 3,
    prefix: 'c2s3-',
    short: 'VR, η y pu',
    title: 'Regulación, eficiencia, por unidad y variantes',
    items: ['VR% y el fp que la dirige', 'pu: el a² desaparece', 'Auto y trifásicos (±30°)', 'Problema 23: VR y η del medido'],
    component: C2Section3,
  },
  {
    chapter: 3,
    num: 1,
    prefix: 'c3s1-',
    short: 'Energía y fuerza',
    title: 'Campo de acoplamiento: energía, coenergía y fuerza',
    items: ['El balance de la caja negra', 'Energía vs. coenergía (el rectángulo λ·i)', 'f = ∂W′/∂x', 'Problema 24: fuerza de un actuador'],
    component: C3Section1,
  },
  {
    chapter: 3,
    num: 2,
    prefix: 'c3s2-',
    short: 'Par e imanes',
    title: 'Excitación múltiple e imanes permanentes',
    items: ['T = is·ir·dLsr/dθ (el par de alineación)', 'El imán que se excita solo', 'Problema 25: par de doble excitación'],
    component: C3Section2,
  },
  {
    chapter: 4,
    num: 1,
    prefix: 'c4s1-',
    short: 'Anatomía',
    title: 'Anatomía: estator, rotor y entrehierro',
    items: ['Las tres piezas y el escenario de aire', 'Campo vs. armadura', 'Problema 16: grados eléctricos y frecuencia'],
    component: C4Section1,
  },
  {
    chapter: 4,
    num: 2,
    prefix: 'c4s2-',
    short: 'FMM distribuida',
    title: 'FMM de devanados distribuidos',
    items: ['La escalera que quiere ser seno (Fourier)', 'kd: el descuento del abanico', 'Problema 17: factor de distribución'],
    component: C4Section2,
  },
  {
    chapter: 4,
    num: 3,
    prefix: 'c4s3-',
    short: 'Voltaje y par',
    title: 'Voltaje generado, par y máquinas lineales',
    items: ['E = 4.44·f·N·kw·Φ', 'T ∝ sen δ: imanes que se alinean', 'Saturación y dispersión', 'Problema 18: voltaje de fase y línea'],
    component: C4Section3,
  },
  {
    chapter: 5,
    num: 1,
    prefix: 's1-',
    short: 'Campo giratorio',
    title: 'Campo giratorio y velocidad síncrona',
    items: ['El truco del imán giratorio', 'nₛ = 120f/p', 'Problema 1: central hidroeléctrica'],
    component: Section1,
  },
  {
    chapter: 5,
    num: 2,
    prefix: 's2-',
    short: 'Circuito y fasores',
    title: 'FEM interna y diagrama fasorial',
    items: ['Eaf = Vt + jXs·Ia', 'Inductancias: Ls = 3/2·Laa0 + Lal (§5.2)', 'La curva V de excitación', 'Problemas 2 y 3: sobre/subexcitado'],
    component: Section2,
  },
  {
    chapter: 5,
    num: 3,
    prefix: 's3-',
    short: 'Potencia-ángulo',
    title: 'Potencia-ángulo y barra infinita',
    items: ['P = Eaf·Vt·sen δ / Xs', 'Los dos mandos y el par sincronizante', 'Problemas 4 y 5: margen y pérdida de paso'],
    component: Section3,
  },
  {
    chapter: 5,
    num: 4,
    prefix: 's4-',
    short: 'Capacidad y motor',
    title: 'Curvas de capacidad y motor sincrónico',
    items: ['La carta de operación P-Q', 'Motor: δ < 0, el campo arrastra', 'Problemas 6 y 7: carta y compensador'],
    component: Section4,
  },
  {
    chapter: 5,
    num: 5,
    prefix: 's5-',
    short: 'Ensayos OCC/SCC',
    title: 'Ensayos OCC/SCC y saturación',
    items: ['La curva que se dobla y la recta que no', 'Xs saturada, no saturada y SCR', 'Problemas 8 y 9: parámetros del ensayo'],
    component: Section5,
  },
  {
    chapter: 5,
    num: 6,
    prefix: 's6-',
    short: 'Rendimiento',
    title: 'Pérdidas y rendimiento',
    items: ['Costos fijos vs variables', 'η máximo: cuadráticas = resto', 'Problemas 10 y 11: desglose y punto dulce'],
    component: Section6,
  },
  {
    chapter: 5,
    num: 7,
    prefix: 's7-',
    short: 'En paralelo',
    title: 'Generadores en paralelo',
    items: ['Tablero de sincronización y lámparas', 'Gobernadores: f y los MW (Fig. 5-29)', 'Excitación: V y los kVAR (Fig. 5-30)', 'Barra infinita vs red aislada · límites y protecciones', 'Sala de control: misión integradora', 'Problemas 47–49'],
    component: Section7,
  },
  {
    chapter: 6,
    num: 1,
    prefix: 'c6s1-',
    short: 'Flujo y Park',
    title: 'Del permanente al transitorio: flujo atrapado y Park',
    items: ['λ(0⁺) = λ(0⁻): el teorema del flujo', 'La transformación d-q-0', 'Problema 12: E′ tras X′d'],
    component: C6Section1,
  },
  {
    chapter: 6,
    num: 2,
    prefix: 'c6s2-',
    short: 'Cortocircuito',
    title: 'El cortocircuito trifásico súbito',
    items: ['Tres periodos: X″d, X′d, Xd y sus T', 'El offset DC y el instante α', 'Problema 13: biografía de una falla'],
    component: C6Section2,
  },
  {
    chapter: 6,
    num: 3,
    prefix: 'c6s3-',
    short: 'Estabilidad',
    title: 'Dinámica y estabilidad: E′ y la ecuación de oscilación',
    items: ['El modelo E′ tras X′d', 'La ecuación de oscilación y t_cr', 'El criterio de áreas iguales (A1 = A2)', 'Problema 14: presupuesto de las protecciones'],
    component: C6Section3,
  },
  {
    chapter: 6,
    num: 4,
    prefix: 'c6s4-',
    short: 'Curva y modelos',
    title: 'Curva P-δ transitoria, circuitos del rotor y modelos',
    items: ['Saliencia invertida: cresta > 90°', 'Escalera de reactancias y T′d0 = T′d·Xd/X′d', 'La escalera de modelos', 'Problema 15: la curva completa'],
    component: C6Section4,
  },
  {
    chapter: 7,
    num: 1,
    prefix: 'c7s1-',
    short: 'Concepto y s',
    title: 'El motor de inducción: campo giratorio y deslizamiento',
    items: ['nₛ = 120f/p: el campo que gira solo', 'Inducción: transformador con movimiento', 's = (nₛ−nₘ)/nₛ', 'Problema 26: deslizamiento y fᵣ'],
    component: C7Section1,
  },
  {
    chapter: 7,
    num: 2,
    prefix: 'c7s2-',
    short: 'Frecuencia rotor',
    title: 'Frecuencia, FEM y reactancia del rotor (todo con s)',
    items: ['fᵣ = s·fₑ', 'E₂ₛ = s·E₂, X₂ₛ = s·X₂', 'Problema 27: arranque vs marcha'],
    component: C7Section2,
  },
  {
    chapter: 7,
    num: 3,
    prefix: 'c7s3-',
    short: 'Circuito equiv.',
    title: 'El circuito equivalente y la partición de R₂/s',
    items: ['R₁, X₁, Rc∥Xm, X₂, R₂/s', 'R₂/s = R₂ + R₂(1−s)/s', 'Problema 28: circuito a plena carga'],
    component: C7Section3,
  },
  {
    chapter: 7,
    num: 4,
    prefix: 'c7s4-',
    short: 'Rendimiento',
    title: 'Potencia de entrehierro, par y rendimiento',
    items: ['Pgap y el reparto 1 : s : (1−s)', 'Tind = Pgap/ωs · Thévenin', 'Árbol de pérdidas y η', 'Problema 29: par y eficiencia'],
    component: C7Section4,
  },
  {
    chapter: 7,
    num: 5,
    prefix: 'c7s5-',
    short: 'Par-velocidad',
    title: 'Característica par-velocidad: arranque, Tmax y R₂',
    items: ['Arranque, ruptura y tramo estable', 'Tmax ⊥ R₂; s_maxT ∝ R₂', 'Problema 30: arranque y ruptura'],
    component: C7Section5,
  },
  {
    chapter: 7,
    num: 6,
    prefix: 'c7s6-',
    short: 'Jaula vs devanado',
    title: 'Jaula, doble jaula y rotor devanado',
    items: ['El dilema de R₂', 'Barra profunda: R₂ que cambia sola', 'Rotor devanado: R externa', 'Problema 31: R₂ para Tmax en arranque'],
    component: C7Section6,
  },
  {
    chapter: 8,
    num: 1,
    prefix: 'c8s1-',
    short: 'Modelo dinámico',
    title: 'Modelado dinámico: v = Ri + dλ/dt e inductancias móviles',
    items: ['Las ecuaciones diferenciales reales', 'Mutuas M·cos θ → no lineal', 'Problema 32: cuándo importa'],
    component: C8Section1,
  },
  {
    chapter: 8,
    num: 2,
    prefix: 'c8s2-',
    short: 'Marcos d-q',
    title: 'Teoría de marcos de referencia (d-q)',
    items: ['Park: abc → d-q', 'Estacionario, rotor, síncrono', 'Síncrono: la CA se vuelve CD', 'Problema 33: proyectar a d-q'],
    component: C8Section2,
  },
  {
    chapter: 8,
    num: 3,
    prefix: 'c8s3-',
    short: 'Control V/f',
    title: 'Control escalar V/f: flujo constante',
    items: ['V/f = cte conserva el flujo', 'Par constante vs debilitamiento', 'Problema 34: ajustar el variador'],
    component: C8Section3,
  },
  {
    chapter: 8,
    num: 4,
    prefix: 'c8s4-',
    short: 'FOC vectorial',
    title: 'Control vectorial (FOC): id → flujo, iq → par',
    items: ['La envidia de la máquina de CD', 'Alinear el marco con el flujo', 'Desacoplo: dos perillas', 'Problema 35: desacoplar flujo y par'],
    component: C8Section4,
  },
  {
    chapter: 8,
    num: 5,
    prefix: 'c8s5-',
    short: 'Inversor y PWM',
    title: 'Inversores y PWM: fabricar V y f',
    items: ['6 IGBTs + bus de CD', 'PWM: el promedio es la señal', 'V₁ = m·Vdc/2', 'Problema 36: tensión de salida'],
    component: C8Section5,
  },
  {
    chapter: 9,
    num: 1,
    prefix: 'c9s1-',
    short: 'Construcción',
    title: 'Construcción y conmutación: rectificación mecánica',
    items: ['Estator de campo + interpolos, rotor de armadura', 'El colector rectifica la CA interna', 'Más delgas → menos rizo', 'Problema 37: el rizo conmutado'],
    component: C9Section1,
  },
  {
    chapter: 9,
    num: 2,
    prefix: 'c9s2-',
    short: 'Ecuaciones Ka',
    title: 'Acoplamiento: Ka, Ea = KaΦω, T = KaΦIa',
    items: ['Ka = P·Z/(2π·a) (geometría)', 'Ea y T comparten Ka·Φ', 'Ea·Ia = T·ω', 'Problema 38: FEM, par y potencia'],
    component: C9Section2,
  },
  {
    chapter: 9,
    num: 3,
    prefix: 'c9s3-',
    short: 'Excitación',
    title: 'Circuitos y excitación: shunt, serie, compuesta',
    items: ['Vt = Ea ± Ia·Ra', 'Shunt: velocidad casi constante', 'Serie: T ∝ Ia² y embalamiento', 'Problema 39: shunt vs serie'],
    component: C9Section3,
  },
  {
    chapter: 9,
    num: 4,
    prefix: 'c9s4-',
    short: 'Reacción armadura',
    title: 'Reacción de armadura y limitaciones reales',
    items: ['El flujo se ladea (FMM cruzada)', 'Neutro corrido + flujo debilitado', 'Interpolos y compensación', 'Problema 40: distorsión y corrección'],
    component: C9Section4,
  },
  {
    chapter: 9,
    num: 5,
    prefix: 'c9s5-',
    short: 'Potencia y η',
    title: 'Flujo de potencia, pérdidas y eficiencia',
    items: ['Pin → Pdev = Ea·Ia → Peje', 'Cobre, núcleo, mecánicas, stray', 'η con forma de campana', 'Problema 41: balance y rendimiento'],
    component: C9Section5,
  },
  {
    chapter: 10,
    num: 1,
    prefix: 'c10s1-',
    short: 'ODE acopladas',
    title: 'Modelado dinámico: las dos ecuaciones diferenciales',
    items: ['va = Ra·ia + La·di/dt + ea', 'T − Tcarga = J·dω/dt + B·ω', 'Acoplamiento y pico de arranque', 'Problema 42: ODE y arranque'],
    component: C10Section1,
  },
  {
    chapter: 10,
    num: 2,
    prefix: 'c10s2-',
    short: 'Constantes τ',
    title: 'Constantes de tiempo eléctrica y mecánica',
    items: ['τe = La/Ra (rápida)', 'τm = J·Ra/(KaΦ)² (lenta)', 'τm ≫ τe → control en cascada', 'Problema 43: las dos constantes'],
    component: C10Section2,
  },
  {
    chapter: 10,
    num: 3,
    prefix: 'c10s3-',
    short: '2.º orden',
    title: 'Función de transferencia y diagramas de bloques',
    items: ['Ω(s)/Va(s) de 2.º orden', 'ωn y ζ; polos en el plano s', 'Sobre / crítico / subamortiguado', 'Problema 44: ωn, ζ y régimen'],
    component: C10Section3,
  },
  {
    chapter: 10,
    num: 4,
    prefix: 'c10s4-',
    short: 'Arranque y corto',
    title: 'Transitorios: arranque directo y cortocircuito',
    items: ['Iarr = Vt/Ra (sin FEM)', 'Resistencia de arranque por pasos', 'Cortocircuito del generador', 'Problema 45: limitar el arranque'],
    component: C10Section4,
  },
  {
    chapter: 10,
    num: 5,
    prefix: 'c10s5-',
    short: 'Drives (PI)',
    title: 'Control dinámico de velocidad (drives)',
    items: ['Lazo cerrado PI y error cero', 'Lazo interno de corriente (limita par)', 'Lazo externo de velocidad (rampa)', 'Problema 46: control en cascada'],
    component: C10Section5,
  },
]

export const CHAPTERS: { id: ChapterId; label: string; sub: string }[] = [
  { id: 1, label: 'Capítulo 1', sub: 'Circuitos magnéticos' },
  { id: 2, label: 'Capítulo 2', sub: 'Transformadores' },
  { id: 3, label: 'Capítulo 3', sub: 'Conversión de energía' },
  { id: 4, label: 'Capítulo 4', sub: 'Conceptos básicos' },
  { id: 5, label: 'Capítulo 5', sub: 'Régimen permanente' },
  { id: 6, label: 'Capítulo 6', sub: 'Régimen transitorio' },
  { id: 7, label: 'Capítulo 7', sub: 'Máquinas de inducción' },
  { id: 8, label: 'Capítulo 8', sub: 'Dinámica y control' },
  { id: 9, label: 'Capítulo 9', sub: 'Máquinas de CC' },
  { id: 10, label: 'Capítulo 10', sub: 'Dinámica de CC' },
]

const ACTIVE_KEY = 'fku-ch5-active-section'
const THEME_KEY = 'fku-theme'

type Theme = 'dark' | 'light'

function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark') return t
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function loadActive(): number {
  try {
    const n = Number(localStorage.getItem(ACTIVE_KEY))
    return Number.isInteger(n) && n >= 0 && n < SECTIONS.length ? n : 0
  } catch {
    return 0
  }
}

/**
 * Cascarón del documento: selector de capítulo + pestañas por sección,
 * con progreso individual por pestaña y por capítulo, índice lateral y
 * botones anterior/siguiente. La sección activa persiste entre visitas.
 */
export default function StudyShell() {
  const { percent, completed, reset } = useProgress()
  const [active, setActive] = useState(loadActive)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const activeChapterBtnRef = useRef<HTMLButtonElement>(null)
  const activeTabBtnRef = useRef<HTMLButtonElement>(null)
  const [teacherOpen, setTeacherOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* sin almacenamiento: el tema no persiste */
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, String(active))
    } catch {
      /* almacenamiento no disponible: la pestaña simplemente no persiste */
    }
    window.scrollTo({ top: 0 })
  }, [active])

  // Mantener visibles el capítulo y la pestaña activos al navegar (revela los de la derecha)
  useEffect(() => {
    activeChapterBtnRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    activeTabBtnRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const sectionProgress = (def: SectionDef) => {
    const ids = ALL_CHECK_IDS.filter((id) => id.startsWith(def.prefix))
    return { done: ids.filter((id) => completed.has(id)).length, total: ids.length }
  }
  const chapterProgress = (ch: ChapterId) => {
    const defs = SECTIONS.filter((s) => s.chapter === ch)
    return defs.reduce(
      (acc, d) => {
        const p = sectionProgress(d)
        return { done: acc.done + p.done, total: acc.total + p.total }
      },
      { done: 0, total: 0 },
    )
  }

  const section = SECTIONS[active]
  const activeChapter = section.chapter
  const chapterSections = SECTIONS.filter((s) => s.chapter === activeChapter)
  const ActiveSection = section.component

  const goToChapter = (ch: ChapterId) => {
    if (ch === activeChapter) return
    setActive(SECTIONS.findIndex((s) => s.chapter === ch))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TeacherHub open={teacherOpen} onClose={() => setTeacherOpen(false)} />
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        {/* Fila 1: marca + tema + progreso */}
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3">
          <GraduationCap size={24} className="shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-black tracking-wide sm:text-base">
              Máquinas Eléctricas · Documento de Estudio
            </h1>
            <p className="hidden truncate text-[11px] text-zinc-500 sm:block">
              Interactivo · basado en Fitzgerald–Kingsley–Umans, <em>Máquinas Eléctricas</em> · 10 capítulos
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden h-2 w-20 overflow-hidden rounded-full bg-zinc-800 sm:block">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300">{percent}%</span>
            {completed.size > 0 && (
              <button
                type="button"
                onClick={reset}
                title="Reiniciar progreso"
                className="text-zinc-600 transition-colors hover:text-zinc-300"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setTeacherOpen(true)}
              title="Panel docente"
              className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-700 px-2.5 text-xs font-semibold text-zinc-400 transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-300"
            >
              <Presentation size={14} />
              <span className="hidden sm:inline">Docente</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Fila 2: selector de capítulo — fila propia y desplazable */}
        <div className="relative">
          <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 pt-2.5 pb-1 [scrollbar-width:thin]">
            {CHAPTERS.map((ch) => {
              const p = chapterProgress(ch.id)
              const isActive = ch.id === activeChapter
              return (
                <button
                  key={ch.id}
                  ref={isActive ? activeChapterBtnRef : undefined}
                  type="button"
                  onClick={() => goToChapter(ch.id)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                    isActive ? ACC[ch.id].btnOn : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 text-[11px] font-black ${isActive ? ACC[ch.id].btnTxt : 'text-zinc-400'}`}>
                    Cap. {ch.id}
                    <span className={`font-mono text-[9px] ${p.done === p.total && p.total > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {p.done}/{p.total}
                    </span>
                  </span>
                  <span className="block text-[9px] text-zinc-500">{ch.sub}</span>
                </button>
              )
            })}
          </div>
          {/* Desvanecidos laterales que insinúan más capítulos */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-zinc-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-zinc-950 to-transparent" />
        </div>

        {/* Barra de pestañas del capítulo activo */}
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-0 pt-2">
          {chapterSections.map((s) => {
            const { done, total } = sectionProgress(s)
            const flatIndex = SECTIONS.indexOf(s)
            const isActive = flatIndex === active
            const complete = done === total
            const accent = ACC[s.chapter].tab
            return (
              <button
                key={s.prefix}
                ref={isActive ? activeTabBtnRef : undefined}
                type="button"
                onClick={() => setActive(flatIndex)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg border-x border-t px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? `border-zinc-700 bg-zinc-900 ${accent}`
                    : 'border-transparent bg-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                    complete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isActive
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {complete ? <Check size={11} /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.short}</span>
                <span
                  className={`font-mono text-[10px] ${complete ? 'text-emerald-400' : 'text-zinc-600'}`}
                >
                  {done}/{total}
                </span>
              </button>
            )
          })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        {/* Índice lateral de la sección activa */}
        <aside className="sticky top-32 hidden h-fit w-64 shrink-0 lg:block">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <BookOpenText size={13} />
            En esta sección
          </p>
          <div className={`rounded-xl border p-3 ${ACC[activeChapter].box} bg-zinc-900/50`}>
            <p className="text-xs font-bold text-zinc-200">
              <span className={`mr-1.5 ${ACC[activeChapter].num}`}>
                {activeChapter}.{section.num}
              </span>
              {section.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {section.items.map((it) => (
                <li key={it} className="text-[11px] leading-snug text-zinc-500">
                  · {it}
                </li>
              ))}
            </ul>
          </div>

          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Todo el documento
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((s, i) => {
              const { done, total } = sectionProgress(s)
              const first = i === 0 || SECTIONS[i - 1].chapter !== s.chapter
              return (
                <div key={s.prefix}>
                  {first && (
                    <p className={`mb-1 mt-2 text-[9px] font-black uppercase tracking-widest ${ACC[s.chapter].lbl}`}>
                      Capítulo {s.chapter}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition-colors ${
                      i === active
                        ? `${ACC[s.chapter].boxOn} text-zinc-200`
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <span className={`font-bold ${ACC[s.chapter].num}`}>{s.num}</span>
                    <span className="flex-1 truncate">{s.short}</span>
                    <span className={`font-mono text-[10px] ${done === total ? 'text-emerald-400' : 'text-zinc-600'}`}>
                      {done}/{total}
                    </span>
                  </button>
                </div>
              )
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-[11px] leading-relaxed text-zinc-400">
            <p className="mb-1 font-bold text-violet-300">Método de uso (Feynman)</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Lee «la idea en simple».</li>
              <li>PREDICE en cada chequeo antes de tocar nada.</li>
              <li>Compruébalo en el laboratorio.</li>
              <li>Resuelve el problema en papel; revela pasos solo para comparar.</li>
            </ol>
          </div>
        </aside>

        {/* Cuerpo: solo la sección activa */}
        <main className="min-w-0 flex-1">
          {active === 0 && (
            <div className="mb-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <Zap size={13} />
                Cómo absorber este documento
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                Este documento no se puede «leer»: se <strong>trabaja</strong>. Cada concepto llega en
                tres capas — idea simple, analogía, formalización — y luego te obliga a{' '}
                <strong>predecir</strong> antes de mostrarte la respuesta. Los laboratorios ejecutan la
                física real (las mismas ecuaciones del libro, resueltas en vivo), y los problemas se
                revelan paso a paso con el <em>porqué</em> antes del <em>cómo</em>. Tu progreso (
                <span className="font-mono text-emerald-300">{percent}%</span>) solo avanza cuando
                superas predicciones y problemas. Arriba a la derecha eliges el capítulo:{' '}
                <span className="text-violet-300">1 · Circuitos magnéticos</span>,{' '}
                <span className="text-amber-300">2 · Transformadores</span>,{' '}
                <span className="text-rose-300">3 · Conversión de energía</span>,{' '}
                <span className="text-sky-300">4 · Conceptos básicos</span>,{' '}
                <span className="text-emerald-300">5 · Régimen permanente</span>,{' '}
                <span className="text-red-300">6 · Régimen transitorio</span>,{' '}
                <span className="text-teal-300">7 · Máquinas de inducción</span>,{' '}
                <span className="text-fuchsia-300">8 · Dinámica y control</span>,{' '}
                <span className="text-orange-300">9 · Máquinas de CC</span> o{' '}
                <span className="text-cyan-300">10 · Dinámica de CC</span>.
              </p>
            </div>
          )}

          <ActiveSection />

          {/* Navegación anterior / siguiente (cruza capítulos) */}
          <div className="mt-10 flex items-stretch gap-3 border-t border-zinc-800 pt-6">
            {active > 0 ? (
              <button
                type="button"
                onClick={() => setActive(active - 1)}
                className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-emerald-500/40"
              >
                <ChevronLeft size={18} className="shrink-0 text-emerald-400" />
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Anterior</span>
                  <span className="block text-xs font-semibold text-zinc-200">
                    C{SECTIONS[active - 1].chapter}·{SECTIONS[active - 1].num}. {SECTIONS[active - 1].title}
                  </span>
                </span>
              </button>
            ) : (
              <span className="flex-1" />
            )}
            {active < SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActive(active + 1)}
                className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-right transition-colors hover:border-emerald-500/40"
              >
                <span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-500">Siguiente</span>
                  <span className="block text-xs font-semibold text-zinc-200">
                    C{SECTIONS[active + 1].chapter}·{SECTIONS[active + 1].num}. {SECTIONS[active + 1].title}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-emerald-400" />
              </button>
            ) : (
              <span className="flex flex-1 items-center justify-end rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs font-semibold text-emerald-300">
                Fin del documento — ¡revisa tu progreso en las pestañas! 🎓
              </span>
            )}
          </div>

          <footer className="mt-10 border-t border-zinc-800 pt-6 pb-10 text-center text-[11px] leading-relaxed text-zinc-600">
            Documento de estudio interactivo · 10 capítulos, de los circuitos magnéticos al control de
            accionamientos, basado en <em>Máquinas Eléctricas</em> (Fitzgerald, Kingsley &amp; Umans) ·
            Los valores numéricos de los problemas se calculan en vivo con el mismo motor de los
            laboratorios.
            <br />
            El fenómeno transitorio de la máquina sincrónica — corrientes, fasores animados y criterio de
            áreas iguales — vive además en el simulador SyncLab de este mismo repositorio.
          </footer>
        </main>
      </div>
    </div>
  )
}
