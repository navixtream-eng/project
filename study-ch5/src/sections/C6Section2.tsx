import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ShortCircuitLab from '../widgets/ShortCircuitLab'
import { DEFAULT_TRANSIENT, fmt, scEnvelope, scLevels, scPhaseCurrent } from '../lib/machine'

/**
 * Capítulo 6, Sección 2 — El cortocircuito trifásico súbito: los tres
 * periodos de la corriente, el offset DC y la escalera de reactancias
 * con sus constantes de tiempo.
 */
export default function C6Section2() {
  // Problema 13: números del laboratorio (misma máquina por defecto)
  const p = DEFAULT_TRANSIENT
  const E = 1.0
  const lv = scLevels(E, p)
  const env01 = scEnvelope(0.1, E, p)
  // Tiempo en que la envolvente cae a 1.2·Iss (bisección)
  const target = 1.2 * lv.Iss
  let lo = 0
  let hi = 6
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (scEnvelope(mid, E, p) > target) lo = mid
    else hi = mid
  }
  const tDecay = (lo + hi) / 2
  // Pico máximo asimétrico (α = 0), búsqueda numérica en el primer semiciclo
  let peak = 0
  for (let t = 0; t <= 0.03; t += 1e-5) {
    const i = Math.abs(scPhaseCurrent(t, 0, E, p))
    if (i > peak) peak = i
  }

  return (
    <section id="c6-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
          Capítulo 6 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El cortocircuito trifásico súbito: tres periodos y un offset
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          La corriente de falla no es una: son tres regímenes encadenados — cada uno con su reactancia
          y su constante de tiempo — más una componente continua que depende del azar del instante.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · La escalera de reactancias: capas de cebolla que se rinden por turnos"
        idea="La corriente inicial es enorme porque el flujo atrapado en los AMORTIGUADORES y el CAMPO bloquea el paso del flujo de armadura: la máquina «parece» tener la reactancia diminuta X″d. Los amortiguadores se rinden primero (T″d, 2-3 ciclos) → queda X′d. El campo resiste más (T′d, ~1 s) → al final solo queda la reactancia sincrónica Xd y la corriente aterriza en su valor permanente."
        analogy="Una multitud que empuja una puerta defendida por dos porteros: el portero ágil (amortiguadores) aguanta segundos y cede; el portero fuerte (campo) aguanta un rato más; al final solo queda la puerta misma (Xd). La resistencia total va cediendo por capas — y la corriente que entra crece por etapas… o mejor: entra muchísima al principio e irá siendo expulsada por etapas."
      >
        <Formula
          latex="I(t) = \left(\frac{E}{X''_d} - \frac{E}{X'_d}\right)e^{-t/T''_d} + \left(\frac{E}{X'_d} - \frac{E}{X_d}\right)e^{-t/T'_d} + \frac{E}{X_d}"
          symbols={[
            { sym: "I''=E/X''_d", meaning: 'Corriente subtransitoria (eficaz): la de los primeros ciclos, con amortiguadores Y campo defendiendo su flujo. La más grande — dimensiona interruptores y esfuerzos mecánicos.' },
            { sym: "I'=E/X'_d", meaning: 'Corriente transitoria: los amortiguadores ya se rindieron, el campo todavía no. Domina entre ~3 ciclos y ~1 segundo.' },
            { sym: 'I_{ss}=E/X_d', meaning: 'Corriente permanente de falla: solo queda la reactancia sincrónica. Nota la ironía: la falla SOSTENIDA es la corriente más pequeña de las tres.' },
            { sym: "T''_d,\\ T'_d", meaning: 'Las constantes de tiempo de CADA rendición: la de los amortiguadores (0.02–0.05 s) y la del campo (0.5–2 s). Se miden en el oscilograma del ensayo de cortocircuito súbito.' },
          ]}
        />
        <p>
          Cada término de la ecuación es una capa que muere: resta lo que la capa aportaba y decae con
          su propia constante. Con eso, el oscilograma completo de una falla se lee como una biografía:
          quién defendía flujo, cuánto aguantó, qué quedó al final.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · El offset DC: la falla no elige el instante"
        idea="La corriente en una inductancia tampoco puede saltar: si la falla llega cuando la onda «debería» arrancar en pleno vuelo, la naturaleza le suma una componente CONTINUA que la baja hasta cero en t = 0. Ese offset decae con Ta (la constante de armadura) y hace la onda asimétrica — y como las tres fases están separadas 120°, a cada una le toca un offset distinto: alguna siempre sale malparada."
        analogy="Subirse a un carrusel en marcha: si tu caballo pasa justo frente a ti (falla en el pico de tensión, α = 0), montas limpio; si está en el punto más lejano (cruce por cero, α = ±90°), la subida es un tirón violento. El tirón es el offset DC — y no eliges dónde está tu caballo cuando llega la falla."
      >
        <Formula
          latex="i(t) = \sqrt{2}\,I(t)\cos(\omega t + \alpha - 90^\circ) \;-\; \underbrace{\sqrt{2}\,\frac{E}{X''_d}\cos(\alpha - 90^\circ)\,e^{-t/T_a}}_{\text{offset DC}}"
          symbols={[
            { sym: '\\alpha', meaning: 'Ángulo de la tensión de ESA fase en el instante de la falla (v ∝ cos(ωt+α)). α = 0 (falla en el pico de tensión): onda simétrica. α = ±90° (falla en el cruce por cero): asimetría máxima, el pico puede rozar 2·√2·I″. Puro azar del instante.' },
            { sym: 'T_a', meaning: 'Constante de tiempo de armadura (~0.05–0.3 s): el ritmo al que el circuito del estator deja morir su componente continua.' },
            { sym: 'i(0) = 0', meaning: 'Verifícalo: en t = 0 los dos términos se cancelan exactamente. El offset existe PARA eso — la corriente venía siendo cero (vacío) y no puede saltar.' },
          ]}
        />
      </ConceptBlock>

      <ShortCircuitLab />

      <FeynmanCheck
        id="c6s2-check-periodos"
        question="¿Por qué la corriente de falla INICIAL (I″) es 5 veces mayor que la de falla SOSTENIDA (Iss), si el cortocircuito es el mismo?"
        options={[
          {
            label: 'Porque al inicio la tensión interna es mayor y luego se desploma.',
            feedback:
              'La E interna (el flujo del campo) es justamente lo que MÁS se conserva al inicio — y decae poco. Lo que cambia radicalmente entre el inicio y el final no es la fuente: es la REACTANCIA aparente.',
          },
          {
            label: 'Porque al inicio el flujo atrapado en amortiguadores y campo bloquea la reacción de armadura: la reactancia aparente es X″d, chica. Cuando esas defensas se extinguen, queda la Xd grande y la corriente cae.',
            correct: true,
            feedback:
              'La misma E dividida entre reactancias que crecen por etapas: E/X″d → E/X′d → E/Xd. Cada «rendición» (amortiguadores con T″d, campo con T′d) le devuelve a la armadura su capacidad desmagnetizante y sube la reactancia efectiva. La falla sostenida es la más mansa — el peligro son los primeros ciclos.',
          },
          {
            label: 'Porque los interruptores van recortando la corriente progresivamente.',
            feedback:
              'El oscilograma clásico se mide SIN despejar la falla (ensayo de cortocircuito súbito). El decaimiento es interno a la máquina: capas de flujo atrapado que se extinguen con sus constantes de tiempo.',
          },
        ]}
      />

      <FeynmanCheck
        id="c6s2-check-dc"
        question="Predice antes de mover el slider α: ¿en qué instante de la onda de tensión debe ocurrir la falla para que la corriente de ESA fase salga perfectamente simétrica (sin offset DC)?"
        options={[
          {
            label: 'Cuando la tensión pasa por cero (α = ±90° en el laboratorio).',
            feedback:
              'Al revés — y la trampa es sutil: en una inductancia la corriente va 90° DETRÁS de la tensión. Si la tensión cruza cero, la corriente de régimen «debería» nacer en su pico: para bajarla a cero hace falta el MÁXIMO offset. Muévelo en el laboratorio y míralo.',
          },
          {
            label: 'Cuando la tensión pasa por su pico (α = 0° en el laboratorio): la corriente, que va 90° detrás, nace naturalmente en cero y no hay nada que compensar.',
            correct: true,
            feedback:
              'Exacto: en el pico de tensión, la corriente inductiva de régimen vale cero — justo lo que la continuidad exige — y el offset no tiene trabajo que hacer. Y como las tres fases llevan α separados 120°, NUNCA pueden estar las tres en ese caso feliz: toda falla trifásica real tiene al menos una fase fuertemente asimétrica. Por eso los interruptores se dimensionan para el peor α, no para el promedio.',
          },
          {
            label: 'El instante no importa: la asimetría depende solo de Ta.',
            feedback:
              'Ta gobierna cuánto DURA el offset, pero su TAMAÑO inicial lo fija α — el punto de la onda donde cayó la falla. Barre el slider de −90° a +90° y observa la onda pasar de simétrica a colgada.',
          },
        ]}
      />

      <FeynmanCheck
        id="c6s2-check-amortiguadores"
        question="Los devanados amortiguadores (barras en cortocircuito sobre las caras polares) no llevan corriente en régimen permanente. ¿Cuáles son sus DOS trabajos?"
        options={[
          {
            label: 'Refrigerar el rotor y sostener mecánicamente los polos.',
            feedback:
              'Son conductores, no ventilación ni estructura. Su oficio es electromagnético — y solo aparece cuando algo CAMBIA: en régimen perfecto están ociosos (sin deslizamiento, no ven variación de flujo, no llevan corriente).',
          },
          {
            label: 'Definir el periodo subtransitorio (atrapan flujo en los primeros ciclos → X″d, T″d) y amortiguar las oscilaciones mecánicas del rotor (el «canceleo» tras cada perturbación).',
            correct: true,
            feedback:
              'Dos oficios, un mecanismo: cualquier variación de flujo les induce corrientes que se le oponen (Lenz). Ante una falla, esa oposición es X″d con vida T″d. Ante oscilaciones de δ, actúan como una mini jaula de inducción que frena el vaivén — el término D de la ecuación de oscilación de la Sección 3. Sin ellos, cada cambio de carga dejaría al rotor oscilando minutos.',
          },
          {
            label: 'Arrancar la máquina como motor de inducción, y nada más.',
            feedback:
              'Ese es un tercer oficio real (arranque asíncrono de motores sincrónicos) — pero dijiste «nada más»: te faltan precisamente los dos del capítulo: el periodo subtransitorio y el amortiguamiento de oscilaciones.',
          },
        ]}
      />

      <SolvedProblem
        id="c6s2-problema-niveles"
        numero="13"
        title="Leer la biografía de una falla"
        statement={
          <>
            La máquina del laboratorio (E = {fmt(E, 1)} pu en vacío, X″d = {fmt(p.Xd2, 1)}, X′d ={' '}
            {fmt(p.Xd1, 1)}, Xd = {fmt(p.Xd, 1)} pu; T″d = {fmt(p.Td2, 3)} s, T′d = {fmt(p.Td1, 1)} s,
            Ta = {fmt(p.Ta, 2)} s) sufre un cortocircuito trifásico en bornes. Halle:{' '}
            <strong>(a)</strong> los tres niveles de corriente, <strong>(b)</strong> la envolvente en
            t = 0.1 s, <strong>(c)</strong> el peor pico instantáneo posible, y <strong>(d)</strong>{' '}
            cuánto tarda la envolvente en caer a 1.2·Iss.
          </>
        }
        steps={[
          {
            title: '(a) Los tres niveles: la misma E, tres reactancias',
            why: 'Cada periodo es E dividida por la reactancia de su capa. Son los tres «escalones» que el oscilograma va bajando.',
            work: `I'' = \\frac{1}{${fmt(p.Xd2, 1)}} = ${fmt(lv.Isub, 2)}\\ \\text{pu} \\qquad I' = \\frac{1}{${fmt(p.Xd1, 1)}} = ${fmt(lv.Itrans, 2)}\\ \\text{pu} \\qquad I_{ss} = \\frac{1}{${fmt(p.Xd, 1)}} = ${fmt(lv.Iss, 3)}\\ \\text{pu}`,
          },
          {
            title: '(b) La envolvente en t = 0.1 s',
            why: 'A los 100 ms el término subtransitorio ya casi murió (t/T″d ≈ 3), pero el transitorio apenas se ha gastado (t/T′d = 0.1): la corriente vive todavía en el mundo del campo.',
            work: `I(0.1) = (${fmt(lv.Isub, 2)}-${fmt(lv.Itrans, 2)})e^{-0.1/${fmt(p.Td2, 3)}} + (${fmt(lv.Itrans, 2)}-${fmt(lv.Iss, 3)})e^{-0.1/${fmt(p.Td1, 1)}} + ${fmt(lv.Iss, 3)} = ${fmt(env01, 2)}\\ \\text{pu}`,
          },
          {
            title: '(c) El peor pico: α = 0 y el offset completo',
            why: 'El máximo esfuerzo instantáneo ocurre en la fase con offset DC máximo, cerca del primer semiciclo, cuando la onda AC y la DC suman de lleno. Se localiza numéricamente sobre i(t).',
            work: `i_{pico} = ${fmt(peak, 2)}\\ \\text{pu} \\;\\approx\\; ${fmt(peak / (Math.SQRT2 * lv.Isub), 2)} \\times \\sqrt{2}\\,I''`,
            note: 'Ese factor de asimetría (~1.8 típico) es el que usan las normas para dimensionar el poder de CIERRE de interruptores y los esfuerzos electrodinámicos de barras y devanados.',
          },
          {
            title: '(d) ¿Cuándo se calma? Resolver I(t) = 1.2·Iss',
            why: 'No tiene despeje algebraico limpio (dos exponenciales) — se resuelve numéricamente. El resultado enseña quién manda en la agonía de la falla: la constante LENTA.',
            work: `I(t) = ${fmt(target, 2)}\\ \\text{pu} \\;\\Rightarrow\\; t \\approx ${fmt(tDecay, 2)}\\ \\text{s} \\;(\\approx ${fmt(tDecay / p.Td1, 1)}\\,T'_d)`,
            note: 'Varios segundos — una eternidad eléctrica. Por eso las protecciones no esperan a que la falla «se calme»: la despejan en los primeros ciclos, cuando la corriente todavía es subtransitoria.',
          },
        ]}
        answer={`I'' = ${fmt(lv.Isub, 2)},\\ I' = ${fmt(lv.Itrans, 2)},\\ I_{ss} = ${fmt(lv.Iss, 3)}\\ \\text{pu} \\qquad I(0.1) = ${fmt(env01, 2)}\\ \\text{pu} \\qquad i_{pico} = ${fmt(peak, 2)}\\ \\text{pu} \\qquad t_{1.2 I_{ss}} \\approx ${fmt(tDecay, 2)}\\ \\text{s}`}
        takeaway="El oscilograma de una falla se lee por capas: X″d/T″d (amortiguadores), X′d/T′d (campo), Xd (lo que queda), más el offset DC con Ta. Estos son exactamente los parámetros que alimentan al simulador SyncLab."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C6 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Tres periodos = tres capas defendiendo flujo: amortiguadores (X″d, T″d), campo (X′d, T′d)
            y al final solo la máquina desnuda (Xd). La falla sostenida es la más pequeña; el peligro
            vive en los primeros ciclos.
          </li>
          <li>
            El offset DC existe para que <InlineMath latex="i(0)=0" />: su tamaño lo sortea α (el
            instante de la falla) y su duración la fija Ta. Tres fases a 120° ⇒ siempre hay una
            malparada.
          </li>
          <li>
            Los amortiguadores tienen dos oficios: fabricar el periodo subtransitorio y amortiguar el
            vaivén mecánico del rotor. Ociosos en régimen, héroes en el transitorio.
          </li>
        </ul>
      </div>
    </section>
  )
}
