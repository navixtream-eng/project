import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import CommutationLab from '../widgets/CommutationLab'
import { fmt } from '../lib/machine'

/** Capítulo 9, Sección 1 — Construcción y principios de conmutación. */
export default function C9Section1() {
  const K = 12
  const rizo = (1 - Math.cos(Math.PI / (2 * K))) * 100

  return (
    <section id="c9-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Capítulo 9 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Construcción y conmutación: la máquina que rectifica sola
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Por dentro, una máquina de CC es de corriente ALTERNA. El colector de delgas y las escobillas
          son un rectificador mecánico que la convierte en continua justo en las terminales.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · La geometría: estator de campo, rotor de armadura"
        idea="El estator lleva los POLOS DE CAMPO (que fabrican el flujo Φ) y, entre ellos, los INTERPOLOS o polos de conmutación (pequeños, para conmutar sin chispas). El rotor —la armadura— es un núcleo laminado ranurado con el devanado donde se induce la FEM y por donde circula la corriente que produce el par. Al revés que en las máquinas de CA: aquí el devanado de potencia gira."
        analogy="Un molino: los polos de campo son el viento constante (el flujo), y la armadura giratoria son las aspas que recogen ese viento y lo convierten en trabajo. El colector es el eje que saca ese trabajo al exterior de forma ordenada."
      >
        <p>
          A diferencia de las máquinas de CA (Cap. 4–8), en la de CC el devanado de potencia está en el
          ROTOR y el de campo en el estator. Eso obliga a sacar la corriente por contactos deslizantes —
          y ahí entra el colector.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · El colector de delgas: rectificación mecánica"
        idea="Cuando la armadura gira en el campo, la FEM inducida en cada bobina es ALTERNA (cambia de signo cada media vuelta, como en cualquier máquina rotativa). El colector —un anillo de delgas de cobre aisladas— gira con la armadura, y las escobillas fijas siempre tocan las delgas de la bobina que está pasando frente a los polos. Así, aunque la bobina invierte su FEM, las escobillas siempre entregan la misma polaridad: la salida es CONTINUA."
        analogy="Un ventilador de techo con un espejo: aunque cada aspa pasa y se va (FEM que sube y baja), si siempre miras el aspa que está justo arriba, ves algo casi quieto. La escobilla «mira» siempre la bobina en su mejor posición, y por eso la tensión externa no se invierte."
      >
        <Formula
          latex="\text{FEM en una bobina:}\ e = E_{max}\sin\omega t \quad\xrightarrow{\text{colector}}\quad \text{terminales:}\ |e|\ \text{(CC con rizo)}"
          symbols={[
            { sym: 'e = E_{max}\\sin\\omega t', meaning: 'La FEM interna de cada bobina es alterna: sube, cae, se invierte. Es la misma inducción de Faraday de siempre; nada aquí es continuo por dentro.' },
            { sym: '\\text{colector}', meaning: 'El conmutador mecánico: voltea la conexión de la bobina cada vez que su FEM cambiaría de signo, de modo que en el exterior la polaridad se mantiene.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="1.3 · Muchas delgas → menos rizo"
        idea="Con una sola bobina, la salida es una CC muy «bombeada» (rizo del 100 %, como un seno rectificado). Al poner muchas bobinas repartidas y muchas delgas, las escobillas siempre tocan la bobina que está cerca de su PICO de FEM: la salida se aplana y el rizo se desploma. Una máquina real tiene decenas de delgas y su CC es casi perfecta."
        analogy="Relevos en una carrera: si un solo corredor tiene que dar toda la vuelta, su velocidad sube y baja; si muchos corredores se van pasando el testigo, siempre corre el que está fresco y la velocidad media es casi constante. Cada delga es un relevo de la FEM."
      >
        <p>
          En el laboratorio, con {K} delgas el rizo baja a ≈ {fmt(rizo, 1)} %. La CC de una máquina real
          es tan limpia que se puede tratar como continua pura para el análisis de los capítulos siguientes.
        </p>
      </ConceptBlock>

      <CommutationLab />

      <FeynmanCheck
        id="c9s1-check-conmutacion"
        question="Se suele decir que «la máquina de CC genera corriente continua». ¿Qué tiene esto de engañoso?"
        options={[
          {
            label: 'Nada, la armadura genera CC directamente por su construcción.',
            feedback:
              'No: cualquier conductor que gira en un campo fijo induce una FEM que cambia de signo cada media vuelta — es ALTERNA por fuerza. La armadura de una máquina de CC no es la excepción.',
          },
          {
            label: 'Por dentro la FEM es ALTERNA; lo que la vuelve continua es el colector, un rectificador MECÁNICO en las terminales. La máquina no «genera» CC, la RECTIFICA.',
            correct: true,
            feedback:
              'Exacto. La inducción de Faraday da una FEM alterna en cada bobina de la armadura. El colector de delgas + escobillas voltea la conexión sincronizadamente con el giro, de modo que en el exterior la polaridad no se invierte. La CC aparece SOLO en las terminales, gracias a la conmutación mecánica — por dentro todo es CA.',
          },
          {
            label: 'La CC aparece porque el campo del estator es de corriente continua.',
            feedback:
              'El campo de CC crea un flujo constante, pero eso no basta: un conductor girando en un flujo constante induce igualmente una FEM alterna. Lo que convierte esa CA en CC es el colector, no la naturaleza del campo.',
          },
        ]}
      />

      <FeynmanCheck
        id="c9s1-check-escobillas"
        question="Al aumentar el número de delgas del colector, ¿por qué mejora la calidad de la CC de salida?"
        options={[
          {
            label: 'Porque las escobillas siempre tocan la bobina que está cerca de su pico de FEM, así que la salida sigue la cresta de muchos senos solapados y el rizo se reduce.',
            correct: true,
            feedback:
              'Correcto. Con una delga, la salida recorre todo el semiciclo del seno (de cero a pico y vuelta): mucho rizo. Con muchas delgas, la escobilla conmuta a la siguiente bobina justo cuando la actual empieza a caer, tomando siempre la porción cercana al pico. La salida es la envolvente superior de muchos senos: casi plana. Más delgas = menos rizo.',
          },
          {
            label: 'Porque más delgas aumentan la tensión de salida.',
            feedback:
              'El número de delgas afecta principalmente el RIZO (la suavidad), no el nivel medio de tensión, que lo fijan el flujo, la velocidad y el número de conductores. Lo que mejora es la calidad de la CC, no su magnitud.',
          },
          {
            label: 'Porque reduce las chispas en las escobillas.',
            feedback:
              'Las chispas se combaten con interpolos y compensación (Sección 4), no principalmente con el número de delgas. Más delgas mejoran el RIZO de la tensión — un efecto distinto.',
          },
        ]}
      />

      <SolvedProblem
        id="c9s1-problema-construccion"
        numero="37"
        title="El rizo de la tensión conmutada"
        statement={
          <>
            Una máquina de CC elemental tiene una sola bobina de armadura girando en un campo uniforme,
            con FEM interna de pico E_max. <strong>(a)</strong> ¿Qué forma tiene la tensión en las
            escobillas con 1 delga? <strong>(b)</strong> ¿Y con {K} delgas? <strong>(c)</strong> Estime
            el rizo en cada caso.
          </>
        }
        steps={[
          {
            title: '(a) Una sola delga: seno rectificado',
            why: 'El colector voltea la bobina cada semiciclo, así que la salida es |E_max·sen ωt|: sube de 0 a E_max y vuelve a 0 cada medio giro.',
            work: `v_{term} = |E_{max}\\sin\\omega t| \\;\\Rightarrow\\; \\text{va de } 0 \\text{ a } E_{max}`,
            note: 'Rizo del 100 %: la tensión toca cero dos veces por vuelta. Es CC solo en el signo, no en la suavidad.',
          },
          {
            title: `(b) ${K} delgas: la envolvente de picos`,
            why: 'Con K bobinas repartidas, la escobilla siempre toma la que está a menos de π/(2K) de su pico. La tensión oscila solo entre E_max·cos(π/2K) y E_max.',
            work: `v_{term} \\in [\\,E_{max}\\cos\\tfrac{\\pi}{2K},\\; E_{max}\\,] = [\\,${fmt(Math.cos(Math.PI / (2 * K)), 3)}\\,E_{max},\\; E_{max}\\,]`,
          },
          {
            title: '(c) El rizo',
            why: 'El rizo es la caída relativa desde el pico hasta el mínimo de la envolvente.',
            work: `\\text{rizo} = 1 - \\cos\\tfrac{\\pi}{2K} = 1 - ${fmt(Math.cos(Math.PI / (2 * K)), 3)} = ${fmt(rizo / 100, 3)}\\;(${fmt(rizo, 1)}\\%)`,
            note: `De 100 % con 1 delga a ${fmt(rizo, 1)} % con ${K}: por eso las máquinas reales tienen decenas de delgas y su CC es casi pura.`,
          },
        ]}
        answer={`\\text{1 delga: rizo } 100\\% \\quad\\to\\quad ${K}\\text{ delgas: rizo } \\approx ${fmt(rizo, 1)}\\%`}
        takeaway="La FEM de la armadura es alterna; el colector la rectifica mecánicamente. El rizo, no el nivel, es lo que mejora con más delgas: 1 − cos(π/2K) → 0. Por dentro CA, por fuera CC."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C9 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Estator = polos de campo + interpolos; rotor = armadura laminada. Al revés que en CA, el devanado de potencia gira.</li>
          <li>La FEM de la armadura es <strong>alterna</strong>; el colector de delgas + escobillas la <strong>rectifica mecánicamente</strong> a CC en las terminales.</li>
          <li>Más delgas → la escobillas toman siempre la bobina cerca del pico → el rizo <InlineMath latex="1-\cos(\pi/2K)" /> se desploma.</li>
        </ul>
      </div>
    </section>
  )
}
