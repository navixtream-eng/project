import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import InductionCircuitLab from '../widgets/InductionCircuitLab'
import { DEFAULT_INDUCTION, fmt, inductionSolve } from '../lib/machine'

/** Capítulo 7, Sección 3 — El circuito equivalente por fase y la partición de R₂/s. */
export default function C7Section3() {
  const p = DEFAULT_INDUCTION
  const s = 0.03
  const r = inductionSolve(p, s)
  const R2s = p.R2 / s
  const Rmech = (p.R2 * (1 - s)) / s

  return (
    <section id="c7-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El circuito equivalente: un transformador con una resistencia que respira
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El núcleo analítico del capítulo. El motor se modela como un transformador donde la «carga»
          es una sola resistencia, R₂/s, que crece o se encoge con la velocidad — y que se puede
          partir en calor y trabajo.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · El circuito por fase: estator, magnetización y rotor"
        idea="Igual que un transformador: el estator aporta R₁ y X₁ (resistencia y dispersión), una rama de magnetización Rc∥Xm cuelga en el entrehierro (pérdidas de hierro y corriente magnetizante), y el rotor referido al estator aporta X₂ y una resistencia R₂/s. Toda la física del movimiento entra por ese único término R₂/s."
        analogy="Un transformador cuyo secundario alimenta un reóstato motorizado: cuando el motor va rápido (s pequeño) el reóstato R₂/s se vuelve enorme (poca corriente, poca carga); cuando está parado (s=1) el reóstato es mínimo (R₂) y entra un cortocircuito de corriente."
      >
        <Formula
          latex="\text{rotor:}\quad \frac{R_2}{s} + jX_2 \qquad \text{magnetización:}\quad R_c \parallel jX_m \qquad \text{estator:}\quad R_1 + jX_1"
          symbols={[
            { sym: 'R_1,\\ X_1', meaning: 'Resistencia y reactancia de dispersión del estator: el cobre y el flujo que se fuga del devanado del estator (idénticos al primario de un transformador).' },
            { sym: 'R_c \\parallel jX_m', meaning: 'Rama de excitación: Rc modela las pérdidas en el hierro; Xm, la corriente magnetizante que fabrica el campo del entrehierro. Aquí Xm es pequeña comparada con la de un transformador (¡hay entrehierro!).' },
            { sym: 'jX_2', meaning: 'Reactancia de dispersión del rotor referida al estator, evaluada a frecuencia de línea (ya se dividió por s).' },
            { sym: 'R_2/s', meaning: 'La joya: una sola resistencia que contiene TODA la dependencia con la velocidad. Grande en marcha (s→0), pequeña en arranque (s=1).' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.2 · La partición mágica: calor + trabajo"
        idea="R₂/s se separa en dos: la R₂ original (pérdidas Joule reales en el cobre del rotor) y un término R₂(1−s)/s que NO existe físicamente — es una resistencia ficticia cuyo «consumo» es exactamente la potencia mecánica entregada al eje. El circuito convierte trabajo mecánico en una resistencia eléctrica equivalente."
        analogy="Una factura de electricidad que separas en dos líneas: lo que se fue en calor (R₂, pérdida real) y lo que se fue en trabajo útil (R₂(1−s)/s). La segunda línea no calienta nada — representa los watts que salieron por el eje convertidos en giro."
      >
        <Formula
          latex="\frac{R_2}{s} = R_2 + R_2\,\frac{1-s}{s}"
          symbols={[
            { sym: 'R_2', meaning: 'Pérdida real por calor en los conductores del rotor (efecto Joule I₂²R₂). Siempre presente, siempre desperdicio.' },
            { sym: 'R_2\\frac{1-s}{s}', meaning: 'Resistencia FICTICIA de carga: la potencia que «disipa» en el modelo es la potencia mecánica desarrollada. En s=1 vale 0 (nada de mecánica); en s→0 tiende a ∞ (toda la potencia es mecánica).' },
          ]}
        />
        <p>
          Esta separación es la que permite leer el reparto de potencia directamente del circuito:
          la corriente del rotor <InlineMath latex="I_2" /> al cuadrado por cada resistencia da,
          respectivamente, la pérdida en el cobre del rotor y la potencia mecánica — el tema de la
          Sección 4.
        </p>
      </ConceptBlock>

      <InductionCircuitLab />

      <FeynmanCheck
        id="c7s3-check-circuito"
        question="Cerca de la velocidad síncrona (s → 0), ¿cómo se comporta el término R₂/s y qué le pasa a la corriente que toma el motor?"
        options={[
          {
            label: 'R₂/s → ∞: la rama del rotor casi se abre, el motor toma poca corriente (como un transformador en vacío).',
            correct: true,
            feedback:
              'Correcto. Con s pequeño, R₂/s se dispara y limita fuertemente la corriente del rotor. El motor «casi en vacío» se parece a un transformador con el secundario abierto: solo circula la corriente de magnetización más una pequeña corriente de carga. Por eso un motor sin carga toma poca corriente activa pero mucha reactiva.',
          },
          {
            label: 'R₂/s → 0: la rama del rotor se pone en cortocircuito y la corriente se dispara.',
            feedback:
              'Eso ocurre en el ARRANQUE (s = 1), no cerca de nₛ. Con s → 0, R₂/s crece sin límite (divides por un número diminuto), no se anula. La corriente de arranque enorme viene del caso opuesto.',
          },
          {
            label: 'R₂/s se mantiene constante porque R₂ no cambia.',
            feedback:
              'R₂ es constante, pero lo divides por s, que sí cambia (y muchísimo). R₂/s va desde R₂ en el arranque hasta valores enormes cerca de la velocidad síncrona — es la variable que gobierna todo el comportamiento.',
          },
        ]}
      />

      <FeynmanCheck
        id="c7s3-check-particion"
        question="En la partición R₂/s = R₂ + R₂(1−s)/s, ¿qué representa físicamente el segundo término y por qué se llama resistencia «ficticia»?"
        options={[
          {
            label: 'Representa las pérdidas de hierro del rotor, que crecen con la carga.',
            feedback:
              'Las pérdidas de hierro se modelan aparte, en la rama Rc de magnetización. El término R₂(1−s)/s no tiene que ver con el hierro: representa energía que SALE del circuito eléctrico, no que se disipe dentro de él.',
          },
          {
            label: 'Representa la potencia mecánica entregada al eje: es «ficticia» porque no disipa calor, sino que modela la energía que abandona el circuito como trabajo.',
            correct: true,
            feedback:
              'Exacto. La potencia «consumida» por esa resistencia en el modelo, 3·I₂²·R₂(1−s)/s, es igual a la potencia mecánica desarrollada. Se llama ficticia porque no es un componente real que se caliente: es un truco contable para que el trabajo mecánico aparezca como una carga eléctrica en el circuito. En s=1 vale 0 (motor parado = 0 potencia mecánica); crece sin límite al acercarse a nₛ.',
          },
          {
            label: 'Es la resistencia de los anillos rozantes del rotor devanado.',
            feedback:
              'No: el término aparece en TODO motor de inducción, incluso en el de jaula sin anillos ni escobillas. Es puramente un artificio del modelo para representar la conversión electromecánica de potencia.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s3-problema-circuito"
        numero="28"
        title="El circuito equivalente a plena carga"
        statement={
          <>
            Un motor de inducción de 4 polos, 60 Hz, 460 V (línea), con R₁ = {fmt(p.R1, 2)} Ω, X₁ ={' '}
            {fmt(p.X1, 2)} Ω, R₂ = {fmt(p.R2, 2)} Ω, X₂ = {fmt(p.X2, 2)} Ω, Xm = {fmt(p.Xm, 0)} Ω, opera
            con deslizamiento s = {fmt(s, 2)}. Halle <strong>(a)</strong> la resistencia total de la rama
            del rotor R₂/s, <strong>(b)</strong> su partición en cobre y carga mecánica, y{' '}
            <strong>(c)</strong> la corriente de línea y la potencia mecánica desarrollada.
          </>
        }
        steps={[
          {
            title: '(a) La resistencia de la rama del rotor',
            why: 'Todo el efecto de la velocidad entra por aquí: con s pequeño, R₂/s es mucho mayor que la R₂ física.',
            work: `\\frac{R_2}{s} = \\frac{${fmt(p.R2, 2)}}{${fmt(s, 2)}} = ${fmt(R2s, 2)}\\ \\Omega`,
          },
          {
            title: '(b) Partirla: cobre + potencia mecánica',
            why: 'La R₂ original es calor; el resto es el modelo de la carga en el eje.',
            work: `\\frac{R_2}{s} = R_2 + R_2\\frac{1-s}{s} = ${fmt(p.R2, 2)} + ${fmt(Rmech, 2)}\\ \\Omega`,
            note: `De los ${fmt(R2s, 2)} Ω, solo ${fmt(p.R2, 2)} Ω son pérdida real; los ${fmt(Rmech, 2)} Ω restantes son potencia mecánica disfrazada de resistencia.`,
          },
          {
            title: '(c) Resolver el circuito',
            why: 'Con la rama del rotor R₂/s + jX₂ en paralelo con jXm, y R₁ + jX₁ en serie, se halla la corriente de línea; la potencia mecánica es 3·I₂²·R₂(1−s)/s.',
            work: `I_1 = ${fmt(r.I1mag, 1)}\\ \\text{A} \\qquad P_{mec} = (1-s)P_{gap} = ${fmt(r.Pmech / 1000, 1)}\\ \\text{kW}`,
            note: 'La corriente de línea de ~53 A es modesta comparada con los ~255 A del arranque — porque en marcha R₂/s es grande y frena la corriente.',
          },
        ]}
        answer={`\\frac{R_2}{s} = ${fmt(R2s, 2)}\\ \\Omega = ${fmt(p.R2, 2)} + ${fmt(Rmech, 2)} \\qquad I_1 = ${fmt(r.I1mag, 1)}\\ \\text{A} \\qquad P_{mec} = ${fmt(r.Pmech / 1000, 1)}\\ \\text{kW}`}
        takeaway="El circuito equivalente es un transformador con una carga que respira: R₂/s. Partirla en R₂ (calor) + R₂(1−s)/s (trabajo) convierte el circuito en una máquina de contar potencia — lo que explota la Sección 4."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El motor es un transformador: R₁, X₁ (estator), Rc∥Xm (magnetización) y R₂/s + jX₂ (rotor).</li>
          <li>Toda la dependencia con la velocidad vive en <InlineMath latex="R_2/s" />: enorme en marcha, mínima en arranque.</li>
          <li>La partición <InlineMath latex="R_2/s = R_2 + R_2(1-s)/s" /> separa calor (cobre) de trabajo (potencia mecánica ficticia).</li>
        </ul>
      </div>
    </section>
  )
}
