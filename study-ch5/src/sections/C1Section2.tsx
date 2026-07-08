import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import HysteresisLab from '../widgets/HysteresisLab'
import EddyLab from '../widgets/EddyLab'
import ExcitingCurrentLab from '../widgets/ExcitingCurrentLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 1, Sección 2 — Materiales magnéticos reales: saturación,
 * histéresis, pérdidas del núcleo y la corriente de excitación en CA.
 */
export default function C1Section2() {
  // Problema 20: separación de pérdidas por el método de las dos frecuencias.
  // Los "datos medidos" se GENERAN con kh y ke conocidos — coherencia garantizada.
  const KH = 0.024 // W/kg por Hz (histéresis, a Bmax constante)
  const KE = 0.00032 // W/kg por Hz² (Foucault)
  const F1 = 50
  const F2 = 60
  const P1 = KH * F1 + KE * F1 * F1 // 2.000
  const P2 = KH * F2 + KE * F2 * F2 // 2.592
  // Resolución del sistema 2x2 (como lo haría el estudiante)
  const keSol = (P2 / F2 - P1 / F1) / (F2 - F1)
  const khSol = P1 / F1 - keSol * F1
  const F3 = 25
  const P3 = khSol * F3 + keSol * F3 * F3
  const ph60 = khSol * F2
  const pe60 = keSol * F2 * F2

  return (
    <section id="c1-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-400">
          Capítulo 1 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Materiales reales: saturación, histéresis y las dos facturas del núcleo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Adiós al hierro ideal: el acero se llena, recuerda, y cobra dos peajes distintos por cada
          ciclo de CA. Y de regalo: la corriente de excitación deja de ser senoidal.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · La curva B-H y el ciclo de histéresis: el hierro recuerda"
        idea="El acero se magnetiza orientando sus dominios magnéticos. Al principio cuesta poco (mucho B por poco H); cerca de 1.6–1.8 T ya casi no quedan dominios por orientar: SATURACIÓN, el material se comporta como aire. Y al retirar el campo, los dominios no vuelven solos: queda magnetismo remanente (Br), y hace falta campo inverso (la coercitiva Hc) para borrarlo. Ese ir y venir con memoria dibuja el CICLO DE HISTÉRESIS — y su área es energía convertida en calor en cada vuelta."
        analogy="Peinar a contrapelo un cepillo de cerdas: orientarlas cuesta trabajo (magnetizar), al soltar quedan medio peinadas (remanencia), y despeinarlas exige pasar el peine al revés (coercitiva). Cada ciclo completo de peinado-despeinado disipa el trabajo en fricción — el área del lazo."
      >
        <HysteresisLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c1s2-check-histeresis"
        question="El área del ciclo de histéresis, ¿qué representa físicamente y por qué a las máquinas de CA les importa tanto?"
        options={[
          {
            label: 'La energía máxima que el núcleo puede almacenar.',
            feedback:
              'La energía ALMACENADA (y recuperable) es otra cuenta — vive en el entrehierro sobre todo. El área del lazo es energía que NO regresa: se queda en el material. ¿En qué forma?',
          },
          {
            label: 'Energía disipada como calor en CADA ciclo (reorientar dominios tiene fricción): en CA se paga f veces por segundo — Ph = kh·f·(área) — la primera factura del núcleo.',
            correct: true,
            feedback:
              'Exacto: ∮H·dB es trabajo por unidad de volumen que los dominios disipan al reordenarse. A 60 Hz el lazo se recorre 60 veces por segundo: por eso las máquinas usan acero al silicio de lazo FLACO, y por eso el material duro del laboratorio (lazo ~50× más gordo) sería un horno — aunque es perfecto como imán permanente, que recorre su lazo cero veces.',
          },
          {
            label: 'El flujo máximo alcanzable antes de saturar.',
            feedback:
              'Eso lo marca Bsat (la altura del lazo), no su área. El ancho×alto — el área — es energía por ciclo: la clave está en las UNIDADES: T × A/m = J/m³.',
          },
        ]}
      />

      <ConceptBlock
        title="2.2 · La segunda factura: corrientes de Foucault y el sándwich de láminas"
        idea="El núcleo es acero: conduce electricidad. El flujo alterno le induce FEM a su propio cuerpo, y nacen lazos de corriente internos (Foucault/eddy) que solo calientan. La cura es quirúrgica: rebanar el núcleo en láminas delgadas aisladas entre sí — cada lazo queda confinado a su lámina y la pérdida cae con el CUADRADO del espesor."
        analogy="Remar en una olla de agua vs. en una hielera con separadores: los remolinos grandes (lazos de corriente en el bloque macizo) disipan muchísimo; ponle separadores (láminas aisladas) y solo caben remolinos diminutos. Misma agua, misma agitación, fracción de la pérdida."
      >
        <EddyLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c1s2-check-laminas"
        question="Las laminaciones cortan las pérdidas de Foucault, pero el rotor de un generador síncrono suele ser un cilindro de acero MACIZO. ¿Contradicción?"
        options={[
          {
            label: 'Sí: es un defecto de diseño heredado que las máquinas modernas corrigen.',
            feedback:
              'Ningún defecto — hay una razón física precisa. Pregúntate QUÉ flujo ve el rotor de una máquina síncrona en régimen permanente… desde su propio marco de referencia.',
          },
          {
            label: 'No: el rotor gira EN SINCRONISMO con el campo — desde su marco, el flujo es CONSTANTE (dφ/dt = 0), y sin variación no hay Foucault que laminar. El estator, en cambio, ve 60 Hz y va laminado siempre.',
            correct: true,
            feedback:
              'La condición para las pérdidas es FLUJO VARIABLE, no flujo a secas. El rotor síncrono navega congelado con su campo (por eso hasta puede ser forjado macizo — y esa masa conductora hace además de amortiguador natural en los transitorios, ¡el Cap. 6 otra vez!). El estator no tiene ese privilegio: sus 60 Hz obligan al sándwich de chapas.',
          },
          {
            label: 'El rotor macizo se lamina por dentro, pero no se ve.',
            feedback:
              'Los turborrotores son forjas de una sola pieza — auditables en fábrica. La respuesta está en el marco de referencia: ¿cuánto varía el flujo QUE EL ROTOR VE?',
          },
        ]}
      />

      <ConceptBlock
        title="2.3 · Magnetización en CA: la corriente que se vuelve picuda"
        idea="Cuando conectas un núcleo a la red, la TENSIÓN manda: Faraday obliga al flujo a ser senoidal (φ ∝ ∫v·dt). Pero la curva B-H no es lineal: para sostener las crestas senoidales de B en la zona saturada, la corriente de excitación debe estirarse desproporcionadamente. Resultado: i(t) picuda, con armónicos impares — el tercero a la cabeza."
        analogy="Un coro obligado a sostener la nota más aguda (la cresta de B): las notas cómodas salen con esfuerzo parejo (zona lineal), pero la última nota exige gritar (zona saturada). La «fuerza vocal» (corriente) deja de ser proporcional a la nota — y el grito se oye: es el zumbido a 180 Hz de los transformadores."
      >
        <ExcitingCurrentLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c1s2-check-excitacion"
        question="Si el flujo es senoidal y la corriente de excitación picuda... ¿por qué no al revés? ¿Quién decidió que el flujo fuera el senoidal?"
        options={[
          {
            label: 'El hierro: la saturación siempre suaviza el flujo.',
            feedback:
              'El hierro no decide nada — solo impone su curva B-H entre las dos variables. La decisión viene de AFUERA: ¿qué le está imponiendo la fuente al devanado?',
          },
          {
            label: 'La RED: impone la tensión senoidal, y v = N·dφ/dt obliga al flujo a ser su integral — senoidal sí o sí. La curva B-H descarga entonces toda la distorsión sobre la corriente, la única variable libre.',
            correct: true,
            feedback:
              'Faraday es el árbitro: con v(t) impuesta, φ(t) queda determinado (senoidal, atrasado 90°). La no-linealidad TIENE que salir por algún lado, y sale por i(t). La moraleja invertible del laboratorio: si un convertidor FORZARA corriente senoidal, la distorsión brotaría en el flujo y la tensión. Algo cede siempre — la fuente elige qué.',
          },
          {
            label: 'Es una aproximación de los libros: en la realidad ambos se distorsionan por igual.',
            feedback:
              'Con fuente de tensión rígida (la red), la medición real confirma flujo casi perfecto y corriente picuda con ~10–30% de 3er armónico. La asimetría no es didáctica: es Faraday actuando de árbitro.',
          },
        ]}
      />

      <SolvedProblem
        id="c1s2-problema-perdidas"
        numero="20"
        title="Separar las dos facturas: el método de las dos frecuencias"
        statement={
          <>
            A un núcleo se le mide la pérdida total a Bmax constante en dos frecuencias:{' '}
            <strong>{fmt(P1, 3)} W/kg a {F1} Hz</strong> y <strong>{fmt(P2, 3)} W/kg a {F2} Hz</strong>.
            Sabiendo que Ph = kh·f y Pe = ke·f², separe ambas componentes, halle el reparto a {F2} Hz
            y prediga la pérdida a {F3} Hz.
          </>
        }
        steps={[
          {
            title: 'El truco: dividir entre f linealiza el sistema',
            why: 'Pc = kh·f + ke·f² mezcla una recta y una parábola. Dividiendo entre f, Pc/f = kh + ke·f es una RECTA en f: dos mediciones bastan para pendiente (ke) y ordenada (kh).',
            work: `\\frac{P_1}{f_1} = k_h + k_e f_1 = ${fmt(P1 / F1, 4)} \\qquad \\frac{P_2}{f_2} = k_h + k_e f_2 = ${fmt(P2 / F2, 4)}`,
          },
          {
            title: 'Resolver el par de ecuaciones',
            why: 'Restar elimina kh y despeja ke de la diferencia; kh sale de vuelta en cualquiera de las dos.',
            work: `k_e = \\frac{P_2/f_2 - P_1/f_1}{f_2 - f_1} = ${fmt(keSol * 1000, 3)}\\!\\times\\!10^{-3} \\qquad k_h = \\frac{P_1}{f_1} - k_e f_1 = ${fmt(khSol, 4)}\\ \\text{W/kg·Hz}`,
          },
          {
            title: 'Repartir a 60 Hz y predecir a 25 Hz',
            why: 'Con los coeficientes separados, cada frecuencia tiene su desglose — y el modelo predice frecuencias que nunca mediste (la prueba de fuego de todo modelo).',
            work: `\\text{a } ${F2}\\ \\text{Hz: } P_h = ${fmt(ph60, 2)}\\ (${fmt((ph60 / P2) * 100, 0)}\\%), \\; P_e = ${fmt(pe60, 3)}\\ (${fmt((pe60 / P2) * 100, 0)}\\%) \\qquad P_c(${F3}) = ${fmt(P3, 2)}\\ \\text{W/kg}`,
            note: 'Observa el patrón: al subir la frecuencia, Foucault (∝f²) le gana terreno a histéresis (∝f). Por eso los núcleos de alta frecuencia se obsesionan con láminas ultradelgadas — o abandonan el acero.',
          },
        ]}
        answer={`k_h = ${fmt(khSol, 3)}\\ \\text{W/kg·Hz}, \\; k_e = ${fmt(keSol * 1000, 2)}\\!\\times\\!10^{-3}\\ \\text{W/kg·Hz}^2 \\qquad P_c(${F3}\\ \\text{Hz}) = ${fmt(P3, 2)}\\ \\text{W/kg}`}
        takeaway="Dos mediciones + saber CÓMO escala cada fenómeno (f vs. f²) = separar lo inseparable. Este método de las dos frecuencias es el mismo espíritu del ensayo OCC/SCC del Cap. 5: la física de las escalas hace de bisturí."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C1 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            El hierro se llena (saturación ~1.6–1.8 T) y recuerda (Br, Hc). El área del lazo de
            histéresis es calor por ciclo: lazo flaco para máquinas, lazo gordo para imanes.
          </li>
          <li>
            Dos facturas del núcleo: histéresis <InlineMath latex="\propto f" /> y Foucault{' '}
            <InlineMath latex="\propto t^2 f^2" /> — esta última se ejecuta con el sándwich de láminas
            (1/n²). El rotor síncrono se salva: ve flujo constante.
          </li>
          <li>
            En CA la red impone la tensión ⇒ Faraday impone flujo senoidal ⇒ la saturación descarga
            toda la distorsión en la corriente de excitación: picuda, con 3er armónico protagonista.
          </li>
        </ul>
      </div>
    </section>
  )
}
