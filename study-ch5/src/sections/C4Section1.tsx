import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import SolvedProblem from '../components/SolvedProblem'
import AnatomyLab from '../widgets/AnatomyLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 4, Sección 1 — Conceptos elementales: la geometría común de
 * toda máquina rotativa y los dos oficios de sus devanados.
 */
export default function C4Section1() {
  // Problema 16: frecuencia generada por una máquina de P polos a n rpm
  const POLES = 12
  const RPM = 600
  const f = (POLES * RPM) / 120

  return (
    <section id="c4-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
          Capítulo 4 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Anatomía de la máquina rotativa: estator, rotor y el escenario de aire
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Antes de las ecuaciones, el fierro: todas las máquinas rotativas — síncronas, de inducción,
          de CD — comparten tres piezas y un principio. Este es el capítulo de los cimientos.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · Tres piezas, un escenario"
        idea="Toda máquina rotativa es lo mismo visto de cerca: una parte fija (ESTATOR), una parte que gira (ROTOR) y un delgadísimo espacio de aire entre ambas (ENTREHIERRO) donde ocurre absolutamente todo — ahí los campos magnéticos de las dos partes se encuentran, se jalan, y transmiten el par."
        analogy="Un escenario de teatro: el estator es el público (fijo, numeroso, donde está el dinero), el rotor es el actor (se mueve, concentra la atención), y el entrehierro es el escenario mismo — estrecho, pero es el ÚNICO lugar donde la función sucede. Todo lo demás (hierro, cobre, aislamiento) existe para llevar actores y público hasta ahí."
      >
        <p className="mb-2">
          El entrehierro merece su fama: aunque mide típicamente entre décimas de milímetro (inducción)
          y unos centímetros (grandes síncronas), el aire es ~5000 veces más «resistente» al flujo que
          el acero — así que casi toda la FMM del circuito magnético se consume cruzándolo. La máquina
          entera se diseña alrededor de ese cruce.
        </p>
        <p>
          Y los devanados tienen dos oficios inconfundibles: el de <strong>CAMPO</strong> fabrica el
          flujo principal (poca potencia, a menudo corriente continua), y el de{' '}
          <strong>ARMADURA o inducido</strong> cosecha la potencia (ahí se induce la FEM y por ahí
          fluyen los megawatts). En las máquinas de CA la armadura vive en el estator — nadie quiere
          sacar megawatts por contactos deslizantes.
        </p>
      </ConceptBlock>

      <AnatomyLab />

      <FeynmanCheck
        id="c4s1-check-entrehierro"
        question="Si el acero conduce el flujo casi «gratis», ¿por qué los diseñadores se obsesionan con hacer el entrehierro tan pequeño como la mecánica lo permita?"
        options={[
          {
            label: 'Para que el rotor no vibre al girar.',
            feedback:
              'La holgura mecánica es una RESTRICCIÓN (no puedes hacerlo cero porque el rotor rozaría), no la razón del deseo. La razón es magnética: pregúntate quién consume la FMM del circuito.',
          },
          {
            label: 'Porque el aire consume casi toda la FMM disponible: cada milímetro extra de entrehierro exige más corriente de excitación para el mismo flujo.',
            correct: true,
            feedback:
              'El circuito magnético es acero (casi gratis) + aire (carísimo): la reluctancia del entrehierro domina todo. Un entrehierro doble exige ~el doble de FMM de excitación para el mismo flujo — más corriente de campo (síncrona) o más corriente magnetizante con peor fp (inducción). Nota el matiz: en las síncronas grandes se hace ADREDE más grande, comprando estabilidad (Xs baja, SCR alta) a cambio de más excitación — el compromiso de la Sección 5 del Cap. 5.',
          },
          {
            label: 'Para reducir el ruido audible.',
            feedback:
              'El ruido importa, pero es secundario. Lo primario: el aire es ~5000 veces más reluctante que el acero, así que el tamaño del entrehierro fija cuánta excitación cuesta magnetizar la máquina.',
          },
        ]}
      />

      <FeynmanCheck
        id="c4s1-check-devanados"
        question="En un generador síncrono, ¿por qué el devanado de POTENCIA (armadura) va en el estator y el de CAMPO en el rotor, y no al revés?"
        options={[
          {
            label: 'Es una convención histórica sin razón técnica: las hay al revés.',
            feedback:
              'Las máquinas de CD son «al revés» (armadura en el rotor) — y pagan el precio: conmutador, escobillas, chispas y mantenimiento. En CA de potencia la elección tiene una razón económica contundente.',
          },
          {
            label: 'Porque la armadura maneja los megawatts y conviene que tenga terminales FIJAS; el campo maneja ~1% de la potencia y puede permitirse anillos rozantes.',
            correct: true,
            feedback:
              'Sacar 500 MW por contactos deslizantes sería un incendio programado; sacar los ~500 kW de excitación por anillos (o eliminarlos con excitatriz sin escobillas) es trivial. Regla general de diseño: la potencia grande por conexiones fijas, la potencia chica por las móviles. La máquina de inducción lo lleva al extremo: su «campo» (la jaula) no necesita NINGUNA conexión.',
          },
          {
            label: 'Porque el estator es más grande y caben más vueltas.',
            feedback:
              'El espacio importa, pero no decide: hay rotores enormes. Lo que decide es por dónde salen los megawatts — y la respuesta correcta es «por terminales que no se muevan».',
          },
        ]}
      />

      <SolvedProblem
        id="c4s1-problema-frecuencia"
        numero="16"
        title="La frecuencia que fabrica el rotor"
        statement={
          <>
            Un generador síncrono elemental de <strong>{POLES} polos</strong> gira a{' '}
            <strong>{RPM} r/min</strong>. <strong>(a)</strong> ¿Cuántos grados eléctricos avanza el
            campo por cada vuelta mecánica? <strong>(b)</strong> ¿Qué frecuencia genera?
          </>
        }
        steps={[
          {
            title: '(a) Grados eléctricos vs. mecánicos',
            why: 'Cada PAR de polos (N-S) que pasa frente a una bobina completa un ciclo eléctrico (360° eléctricos). Con P polos, una vuelta mecánica contiene P/2 ciclos.',
            work: `\\theta_e = \\frac{P}{2}\\,\\theta_m \\;\\Rightarrow\\; \\text{una vuelta} = \\frac{${POLES}}{2} \\times 360^\\circ = ${fmt((POLES / 2) * 360, 0)}^\\circ\\ \\text{eléctricos}`,
          },
          {
            title: '(b) De vueltas por minuto a ciclos por segundo',
            why: 'La frecuencia es ciclos por segundo: (P/2) ciclos por vuelta × n/60 vueltas por segundo. Reordenando aparece la fórmula gemela de nₛ = 120f/p — la misma ecuación leída al revés.',
            work: `f = \\frac{P}{2}\\cdot\\frac{n}{60} = \\frac{P\\,n}{120} = \\frac{${POLES} \\times ${RPM}}{120} = ${fmt(f, 0)}\\ \\text{Hz}`,
            note: 'La relación es un candado de dos vías: en el Cap. 5 la red fijaba f y despejábamos la velocidad; aquí la turbina fija n y sale la frecuencia. Misma física, distinto despeje.',
          },
        ]}
        answer={`\\textbf{(a)}\\ ${fmt((POLES / 2) * 360, 0)}^\\circ\\ \\text{eléctricos/vuelta} \\qquad \\textbf{(b)}\\ f = ${fmt(f, 0)}\\ \\text{Hz}`}
        takeaway="Los grados eléctricos son la moneda de todo el libro: P/2 veces más rápidos que los mecánicos. Cuando en cualquier capítulo veas un ángulo, pregúntate siempre en cuál de las dos monedas está."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C4 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Tres piezas: estator (fijo), rotor (gira), entrehierro (el escenario donde TODO sucede —
            y que consume casi toda la FMM por ser aire).
          </li>
          <li>
            Dos oficios: campo fabrica flujo (poca potencia, puede viajar en el rotor); armadura
            cosecha potencia (terminales fijas, siempre que se pueda en el estator).
          </li>
          <li>
            Las dos grandes familias de CA comparten estator; se distinguen por el rotor: devanado de
            CD con anillos (síncrona) o jaula que se excita sola con deslizamiento (inducción).
          </li>
        </ul>
      </div>
    </section>
  )
}
