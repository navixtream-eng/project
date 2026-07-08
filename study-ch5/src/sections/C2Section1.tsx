import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import IdealTransformerLab from '../widgets/IdealTransformerLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 2, Sección 1 — El transformador ideal: la palanca de la
 * electricidad y la reflexión de impedancias.
 */
export default function C2Section1() {
  // Problema 21: exactamente los valores por defecto del laboratorio
  const N1 = 1000
  const N2 = 100
  const V1 = 2400
  const ZL = 1.2
  const a = N1 / N2
  const V2 = V1 / a
  const I2 = V2 / ZL
  const I1 = I2 / a
  const Zref = a * a * ZL

  return (
    <section id="c2-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
          Capítulo 2 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El transformador ideal: la palanca de la electricidad
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Dos bobinas y un núcleo: la máquina sin partes móviles que hizo posible transmitir energía
          a cientos de kilómetros. Primero la versión perfecta — toda la esencia, cero letra pequeña.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · Un solo flujo, voltios por vuelta parejos"
        idea="El transformador ideal es tres suposiciones: μ infinita (magnetizar no cuesta corriente), devanados sin resistencia y cero dispersión (TODO el flujo enlaza a ambas bobinas). Con un único φ compartido, Faraday cobra lo mismo por cada vuelta: V₁/N₁ = V₂/N₂. Y como no hay dónde perder energía, S₁ = S₂: las corrientes escalan al revés que los voltajes."
        analogy="Una palanca perfecta: no crea energía — intercambia fuerza por distancia. El transformador intercambia voltios por amperes con relación a = N₁/N₂. Y como en la palanca, el «peso» que sientes desde el otro extremo cambia: una carga Z₂ se SIENTE como a²·Z₂ desde el primario."
      >
        <Formula
          latex="\frac{V_1}{V_2} = \frac{N_1}{N_2} = a \qquad \frac{I_1}{I_2} = \frac{1}{a} \qquad Z_2' = a^2 Z_2"
          symbols={[
            { sym: 'a', meaning: 'Relación de transformación N₁/N₂: el único número que define al transformador ideal. a > 1 reduce voltaje; a < 1 lo eleva.' },
            { sym: 'V_1/V_2 = a', meaning: 'Mismo φ ⇒ mismos voltios POR VUELTA en ambos lados ⇒ el voltaje total escala con las vueltas. Es Faraday puro.' },
            { sym: 'I_1/I_2 = 1/a', meaning: 'Conservación de energía (S₁ = S₂) y de FMM (N₁I₁ = N₂I₂): lo que ganas en voltios lo pagas en amperes.' },
            { sym: "Z_2' = a^2 Z_2", meaning: 'La reflexión: V se multiplica por a, I se divide entre a ⇒ su cociente (la impedancia) se multiplica por a². La base del acoplamiento de impedancias y del «referir al primario».' },
          ]}
        />
      </ConceptBlock>

      <IdealTransformerLab />

      <FeynmanCheck
        id="c2s1-check-vueltas"
        question="¿Por qué la relación de voltajes es EXACTAMENTE la de vueltas — qué garantiza físicamente que V₁/N₁ = V₂/N₂?"
        options={[
          {
            label: 'La conservación de la energía: si no, se crearía potencia.',
            feedback:
              'La energía fija la relación de CORRIENTES una vez conocida la de voltajes — pero no explica por qué los voltajes van con las vueltas. La razón es magnética: ¿qué comparten físicamente las dos bobinas?',
          },
          {
            label: 'Que AMBAS bobinas abrazan EL MISMO flujo φ (sin dispersión): Faraday induce e = N·dφ/dt en cada una, y con dφ/dt común, el voltaje solo puede diferir en N.',
            correct: true,
            feedback:
              'El «voltio por vuelta» (dφ/dt) es la moneda común del núcleo — míralo en el readout violeta del laboratorio: idéntico en ambos lados siempre. Todo lo que rompa esa comunión (flujo que se fuga = dispersión) rompe la proporción exacta — y eso será X₁ y X₂ en la siguiente sección.',
          },
          {
            label: 'Es una definición, no un hecho físico.',
            feedback:
              'Es medible con dos voltímetros y falsable: un transformador con mucha dispersión NO cumple exactamente V₁/V₂ = N₁/N₂ bajo carga. La igualdad exacta es la firma del flujo perfectamente compartido.',
          },
        ]}
      />

      <FeynmanCheck
        id="c2s1-check-impedancia"
        question="En la reflexión de impedancias aparece a² (no a). ¿De dónde sale el cuadrado?"
        options={[
          {
            label: 'Del hecho de que la potencia va con el cuadrado del voltaje.',
            feedback:
              'La potencia es invariante (S₁ = S₂) — no aporta cuadrados aquí. El truco es más simple: la impedancia es un COCIENTE de dos cosas que se transforman en sentidos opuestos…',
          },
          {
            label: 'Z = V/I, y la transformación pega DOS veces en el mismo sentido: V se multiplica por a e I se divide entre a — el cociente gana a·a = a².',
            correct: true,
            feedback:
              'Z₂′ = V₁/I₁ = (a·V₂)/(I₂/a) = a²·(V₂/I₂) = a²·Z₂. Dos factores de a apilados. Verifícalo en el laboratorio: con a = 10, la carga de 1.2 Ω se ve de 120 Ω. Este a² es el mismo que usará la próxima sección para «referir» R₂ y X₂ al primario — y el mismo que un audiófilo usa para acoplar un parlante de 8 Ω a un amplificador a válvulas.',
          },
          {
            label: 'Es empírico: se mide a² y se acepta.',
            feedback:
              'Sale de un renglón de álgebra con las dos relaciones ideales — nada de empirismo. Pista: escribe Z vista desde el primario como V₁/I₁ y sustituye.',
          },
        ]}
      />

      <SolvedProblem
        id="c2s1-problema-ideal"
        numero="21"
        title="El transformador de distribución ideal"
        statement={
          <>
            Un transformador ideal de <strong>{N1}:{N2}</strong> vueltas alimentado con{' '}
            <strong>V₁ = {fmt(V1, 0)} V</strong> entrega potencia a una carga resistiva de{' '}
            <strong>{fmt(ZL, 1)} Ω</strong>. Halle V₂, las dos corrientes, la impedancia vista desde el
            primario y la potencia transferida.
          </>
        }
        steps={[
          {
            title: 'La palanca: voltajes con las vueltas',
            why: 'Primero el número que define todo: a = N₁/N₂. El secundario recibe el voltaje escalado.',
            work: `a = \\frac{${N1}}{${N2}} = ${fmt(a, 0)} \\qquad V_2 = \\frac{V_1}{a} = \\frac{${fmt(V1, 0)}}{${fmt(a, 0)}} = ${fmt(V2, 0)}\\ \\text{V}`,
          },
          {
            title: 'Corrientes: Ohm en la carga, palanca de regreso',
            why: 'La carga fija I₂ por ley de Ohm; el primario la «siente» dividida entre a (la FMM se equilibra: N₁I₁ = N₂I₂).',
            work: `I_2 = \\frac{V_2}{Z_L} = \\frac{${fmt(V2, 0)}}{${fmt(ZL, 1)}} = ${fmt(I2, 0)}\\ \\text{A} \\qquad I_1 = \\frac{I_2}{a} = ${fmt(I1, 0)}\\ \\text{A}`,
          },
          {
            title: 'Reflexión y verificación por potencia',
            why: 'La impedancia reflejada permite resolver TODO desde el primario sin pensar en el secundario — y la potencia debe cuadrar por ambos caminos (la palanca no crea energía).',
            work: `Z_2' = a^2 Z_L = ${fmt(a, 0)}^2 \\times ${fmt(ZL, 1)} = ${fmt(Zref, 0)}\\ \\Omega \\qquad S = V_2 I_2 = ${fmt((V2 * I2) / 1000, 0)}\\ \\text{kVA} = V_1 I_1\\ \\checkmark`,
            note: 'Reproduce cada número en el laboratorio: son sus valores por defecto. Y nota el porqué de la transmisión en alta tensión: los mismos 48 kVA viajan con 20 A en vez de 200 A — cien veces menos pérdida I²R en el camino.',
          },
        ]}
        answer={`V_2 = ${fmt(V2, 0)}\\ \\text{V} \\quad I_2 = ${fmt(I2, 0)}\\ \\text{A} \\quad I_1 = ${fmt(I1, 0)}\\ \\text{A} \\quad Z_2' = ${fmt(Zref, 0)}\\ \\Omega \\quad S = ${fmt((V2 * I2) / 1000, 0)}\\ \\text{kVA}`}
        takeaway="Tres relaciones (a, 1/a, a²) resuelven cualquier transformador ideal — y explican la red eléctrica entera: subir el voltaje para viajar, bajarlo para consumir, reflejar impedancias para analizar."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C2 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Un solo φ compartido ⇒ voltios por vuelta idénticos ⇒ V escala con N (Faraday).</li>
          <li>S₁ = S₂ ⇒ I escala con 1/a: la palanca intercambia voltios por amperes, nunca crea.</li>
          <li>Z se refleja con a² — dos factores de a apilados (V×a, I÷a). Con eso se «refiere» todo a un solo lado.</li>
        </ul>
      </div>
    </section>
  )
}
