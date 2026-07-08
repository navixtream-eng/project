import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import MagneticCircuitLab from '../widgets/MagneticCircuitLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 1, Sección 1 — Circuitos magnéticos: la ley de Ohm del flujo
 * y el entrehierro que se queda con casi toda la FMM.
 */
export default function C1Section1() {
  // Problema 19: exactamente la configuración por defecto del laboratorio
  const MU0 = 4 * Math.PI * 1e-7
  const N = 500
  const I = 1.0
  const LC = 0.4
  const SIDE = 0.04
  const AC = SIDE * SIDE
  const MUR = 4000
  const G = 0.001
  const Rc = LC / (MUR * MU0 * AC)
  const Ag = (SIDE + G) * (SIDE + G)
  const Rg = G / (MU0 * Ag)
  const phi = (N * I) / (Rc + Rg)
  const Bc = phi / AC
  const Bg = phi / Ag
  const share = Rg / (Rc + Rg)

  return (
    <section id="c1-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-400">
          Capítulo 1 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Circuitos magnéticos: la ley de Ohm del flujo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El primer gran truco del libro: tratar los caminos del flujo magnético como si fueran un
          circuito eléctrico. Una analogía tan buena que el resto de los capítulos vive de ella.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · La analogía que lo arranca todo"
        idea="Una bobina de N vueltas con corriente I fabrica una «presión magnética»: la fuerza magnetomotriz F = N·I (ley de Ampère condensada). Esa presión empuja flujo φ a través de caminos que se resisten con una reluctancia R = l/(μA). El paralelo es exacto: F ↔ voltaje, φ ↔ corriente, R ↔ resistencia — y F = φ·R es la ley de Ohm magnética."
        analogy="Un circuito de agua: la bomba (la bobina, F = N·I) impulsa el caudal (φ) por tuberías cuya oposición depende del largo (l), el grosor (A) y qué tan «resbaloso» es el material (μ). El acero es tubería ancha y pulida; el aire, un estrangulamiento brutal."
      >
        <Formula
          latex="\mathcal{F} = N\,I \qquad \mathcal{R} = \frac{l}{\mu A} \qquad \mathcal{F} = \phi\,\mathcal{R} \qquad B = \mu H"
          symbols={[
            { sym: '\\mathcal{F} = NI', meaning: 'Fuerza magnetomotriz [A·vuelta]: la «tensión» del circuito magnético. Sale directo de la ley de Ampère: ∮H·dl = corriente enlazada.' },
            { sym: '\\mathcal{R}', meaning: 'Reluctancia [A·v/Wb]: la «resistencia» al flujo. Crece con el largo del camino, cae con el área y con la permeabilidad μ — la fórmula gemela de R = l/(σA).' },
            { sym: '\\phi', meaning: 'Flujo magnético [Wb]: la «corriente» de la analogía. Como la corriente, se conserva en los nodos (el flujo no se acumula).' },
            { sym: 'B = \\mu H', meaning: 'La relación constitutiva local: B [T] es densidad de flujo (φ/A), H [A/m] es intensidad de campo (F/l). μ = μr·μ0 traduce entre ambas — y su no-linealidad será el tema de la Sección 2.' },
          ]}
        />
        <p>
          La letra pequeña de la analogía: la «conductividad» magnética del acero (μr ≈ 2000–8000)
          es solo miles de veces mejor que la del aire — no <em>billones</em> de veces, como el cobre
          frente al aire en lo eléctrico. Por eso el flujo sí se fuga (dispersión) y por eso el
          entrehierro, aunque diminuto, domina el circuito entero.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · El entrehierro: el peaje que domina el camino"
        idea="Las máquinas rotativas NECESITAN un espacio de aire para que el rotor gire. Y ese milímetro de aire, con μr = 1, puede ser cientos de veces más reluctante que los 40 cm de acero que lo rodean: casi toda la FMM de la bobina se consume en cruzarlo. Además, al cruzar, las líneas de flujo se «desparraman» por los bordes (franjeo): el área efectiva del cruce crece, y el libro lo corrige sumando g a cada dimensión del núcleo."
        analogy="Una autopista de 8 carriles (el acero) con UNA caseta de peaje de un solo carril (el gap): no importa qué tan buena sea la autopista — el tiempo del viaje lo fija la caseta. Y el franjeo es la gente saliéndose por el acotamiento para esquivar la fila: el «carril» efectivo se ensancha un poco."
      >
        <MagneticCircuitLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c1s1-check-ohm"
        question="En el laboratorio, con el gap abierto, duplicas μr del hierro (¡un acero premium!) y el flujo apenas se mueve. ¿Por qué la mejora no sirve de casi nada?"
        options={[
          {
            label: 'Porque el flujo está saturado y no puede crecer más.',
            feedback:
              'La saturación es otra historia (Sección 2) y el laboratorio te avisa cuando ocurre. Aquí el argumento es de CIRCUITO: dos reluctancias en serie — ¿cuál domina la suma?',
          },
          {
            label: 'Porque las reluctancias están en SERIE y la del aire domina la suma: mejorar el hierro es optimizar el término pequeño — la caseta de peaje sigue siendo la misma.',
            correct: true,
            feedback:
              'φ = F/(Rc + Rg), y con 1 mm de gap, Rg es ~10 veces Rc: duplicar μr divide Rc a la mitad pero la SUMA casi no cambia. Es la lección de diseño más importante del capítulo: en cuanto hay entrehierro, el aire manda — el hierro solo necesita ser «suficientemente bueno». (Y su corolario del Cap. 5: por eso la reactancia de magnetización de una máquina la fija su entrehierro.)',
          },
          {
            label: 'Porque μr no afecta a la reluctancia, solo a las pérdidas.',
            feedback:
              'μ está en el denominador de R = l/(μA): sí la afecta, y mucho. Lo que pasa es que solo afecta a la del HIERRO — y esa es la sumando chico del circuito en cuanto el gap se abre.',
          },
        ]}
      />

      <FeynmanCheck
        id="c1s1-check-fringing"
        question="Por el franjeo, las líneas de flujo se desparraman al cruzar el gap. ¿Qué le hace eso a la densidad B en el entrehierro comparada con la del hierro?"
        options={[
          {
            label: 'B es igual en ambos: el flujo se conserva.',
            feedback:
              'El FLUJO φ sí se conserva (es la «corriente» del circuito) — pero B = φ/A, y el franjeo cambia justamente el ÁREA por la que cruza. Mismo caudal, tubería más ancha…',
          },
          {
            label: 'B del gap es MENOR: el mismo flujo cruza por un área efectiva mayor, (a+g)·(b+g). Y de paso, la reluctancia del gap baja un poco.',
            correct: true,
            feedback:
              'φ constante + área mayor = B menor. La corrección empírica del libro (sumar g a cada dimensión) captura el desparrame con precisión sorprendente para gaps pequeños. Actívalo y desactívalo en el laboratorio con g = 5 mm y compara los dos readouts de B. En las máquinas, el franjeo también redondea la forma del campo bajo cada polo.',
          },
          {
            label: 'B del gap es MAYOR: el aire concentra el campo.',
            feedback:
              'Al revés: el aire no concentra nada — las líneas se REPELEN entre sí y aprovechan los bordes para separarse. Área efectiva mayor ⇒ B menor que en el hierro adyacente.',
          },
        ]}
      />

      <SolvedProblem
        id="c1s1-problema-nucleo"
        numero="19"
        title="El circuito magnético completo, a mano"
        statement={
          <>
            El núcleo del laboratorio: longitud media {fmt(LC * 100, 0)} cm, sección cuadrada de{' '}
            {fmt(SIDE * 100, 0)}×{fmt(SIDE * 100, 0)} cm (Ac = {fmt(AC * 1e4, 0)} cm²), μr ={' '}
            {fmt(MUR, 0)}, entrehierro g = 1 mm, bobina de N = {fmt(N, 0)} vueltas con I ={' '}
            {fmt(I, 1)} A. Con corrección de franjeo, halle las reluctancias, el flujo φ, y B en el
            hierro y en el gap.
          </>
        }
        steps={[
          {
            title: 'Reluctancia del hierro',
            why: 'El camino de acero: largo, pero con μ = μr·μ0 miles de veces mejor que el aire. La fórmula es la gemela magnética de R = l/(σA).',
            work: `\\mathcal{R}_c = \\frac{l_c}{\\mu_r \\mu_0 A_c} = \\frac{${fmt(LC, 1)}}{${fmt(MUR, 0)} \\times 4\\pi\\!\\times\\!10^{-7} \\times ${fmt(AC * 1e4, 0)}\\!\\times\\!10^{-4}} = ${fmt(Rc / 1000, 1)}\\ \\text{kA·v/Wb}`,
          },
          {
            title: 'Reluctancia del gap, con franjeo',
            why: 'Primero el área efectiva: el desparrame se corrige sumando g a cada lado de la sección. Luego la misma fórmula con μ = μ0 — y aparece el gigante del circuito.',
            work: `A_g = (a+g)^2 = (${fmt(SIDE * 100, 0)} + 0.1)^2\\ \\text{cm}^2 = ${fmt(Ag * 1e4, 2)}\\ \\text{cm}^2 \\qquad \\mathcal{R}_g = \\frac{g}{\\mu_0 A_g} = ${fmt(Rg / 1000, 1)}\\ \\text{kA·v/Wb}`,
            note: `Compara: 1 mm de aire opone ${fmt(Rg / Rc, 1)} veces más que ${fmt(LC * 100, 0)} cm de acero — el ${fmt(share * 100, 1)}% de la FMM se gastará en la caseta de peaje.`,
          },
          {
            title: 'Ley de Ohm magnética y densidades',
            why: 'Reluctancias en serie se suman (mismo flujo las cruza a ambas — como resistencias en serie con la misma corriente). Después, B = φ/A en cada tramo con SU área.',
            work: `\\phi = \\frac{NI}{\\mathcal{R}_c + \\mathcal{R}_g} = \\frac{${fmt(N * I, 0)}}{${fmt((Rc + Rg) / 1000, 1)}\\ \\text{k}} = ${fmt(phi * 1000, 3)}\\ \\text{mWb} \\qquad B_c = ${fmt(Bc, 3)}\\ \\text{T} \\quad B_g = ${fmt(Bg, 3)}\\ \\text{T}`,
            note: 'Bg < Bc por el franjeo (misma φ, área mayor). Reproduce todo en el laboratorio: son exactamente sus valores por defecto.',
          },
        ]}
        answer={`\\mathcal{R}_c = ${fmt(Rc / 1000, 1)},\\ \\mathcal{R}_g = ${fmt(Rg / 1000, 1)}\\ \\text{kA·v/Wb} \\qquad \\phi = ${fmt(phi * 1000, 3)}\\ \\text{mWb} \\qquad B_c = ${fmt(Bc, 2)}\\ \\text{T},\\ B_g = ${fmt(Bg, 2)}\\ \\text{T}`}
        takeaway="El ritual de todo circuito magnético: F = NI, cada tramo su R = l/(μA) (con franjeo en los gaps), sumar en serie, dividir. Es el mismo ritual de los circuitos eléctricos — esa es la gracia."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C1 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            La analogía: <InlineMath latex="\mathcal{F}=NI" /> ↔ tensión, φ ↔ corriente,{' '}
            <InlineMath latex="\mathcal{R}=l/\mu A" /> ↔ resistencia, y{' '}
            <InlineMath latex="\mathcal{F}=\phi\mathcal{R}" /> es Ohm.
          </li>
          <li>
            El entrehierro domina en serie: 1 mm de aire &gt; 40 cm de acero. Mejorar el hierro con
            gap abierto es cosmético — el aire manda.
          </li>
          <li>
            Franjeo: las líneas se desparraman en los bordes del gap ⇒ área efectiva (a+g)(b+g) ⇒
            B del gap algo menor. La corrección del libro: sumar g a cada dimensión.
          </li>
        </ul>
      </div>
    </section>
  )
}
