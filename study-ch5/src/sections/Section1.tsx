import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import RotatingFieldLab from '../widgets/RotatingFieldLab'
import SyncSpeedChart from '../widgets/SyncSpeedChart'
import { fmt, syncSpeedRpm } from '../lib/machine'

/**
 * Sección 1 — El campo magnético giratorio y la velocidad síncrona
 * (FKU §4.5 y §5.1: la base sobre la que se construye todo el capítulo 5).
 */
export default function Section1() {
  // Problema 1: valores calculados por la librería (nunca tecleados a mano)
  const nsTarget = 120 // r/min de la turbina hidráulica
  const f60 = 60
  const poles = (120 * f60) / nsTarget // = 60 polos
  const ns50 = syncSpeedRpm(50, poles)

  return (
    <section id="seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 1</p>
        <h2 className="text-2xl font-black text-zinc-50">
          El campo magnético giratorio y la velocidad síncrona
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Todo el capítulo 5 se apoya en un solo truco: fabricar un imán que gira sin que nada
          mecánico lo empuje. Aquí lo construyes tú mismo.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · El truco del imán giratorio"
        idea="Tres bobinas quietas, colocadas a 120° entre sí y alimentadas con tres corrientes desfasadas 120° en el tiempo, producen exactamente el mismo campo magnético que un imán de barra girando a velocidad constante. Nada se mueve — y sin embargo el campo gira."
        analogy="Es como hacer «la ola» en un estadio: ningún espectador se desplaza de su asiento, pero la ola recorre las gradas a velocidad constante. Cada bobina solo «se levanta y se sienta» (su corriente pulsa), y la coordinación temporal crea el movimiento."
      >
        <p className="mb-2">
          Cada fase, por sí sola, produce una fuerza magnetomotriz (FMM) que <em>pulsa</em> a lo largo
          de su eje fijo: crece, se anula, se invierte. La magia está en la <strong>suma</strong>. Si la
          fase b hace lo mismo que la a pero 120° más tarde, y la c 240° más tarde, la suma de las tres
          pulsaciones es un vector de <strong>amplitud constante</strong> que rota:
        </p>
        <Formula
          latex="\mathcal{F}(\theta_{ae},t) = \tfrac{3}{2}\,F_{max}\,\cos(\theta_{ae} - \omega_e t)"
          tag="(4.41)"
          symbols={[
            { sym: '\\mathcal{F}', meaning: 'FMM resultante en el entrehierro: el «imán» que las tres bobinas fabrican juntas.' },
            { sym: '\\tfrac{3}{2}F_{max}', meaning: 'Amplitud constante: 1.5 veces el pico de una fase sola. Constante = giro suave, sin vibración de par.' },
            { sym: '\\theta_{ae}', meaning: 'Posición angular eléctrica alrededor del entrehierro, medida desde el eje de la fase a.' },
            { sym: '\\omega_e t', meaning: 'El pico de la onda se encuentra donde θae = ωe·t: el máximo VIAJA a velocidad angular eléctrica ωe = 2πf.' },
          ]}
        />
        <p>
          Lee la fórmula como una historia: es una onda coseno en el espacio (θ<sub>ae</sub>) cuyo
          máximo se muda de lugar a razón de ω<sub>e</sub> radianes eléctricos por segundo. Compruébalo
          en el laboratorio: congela la animación y verifica que la flecha blanca siempre mide
          1.5·F<sub>max</sub>.
        </p>
      </ConceptBlock>

      <RotatingFieldLab />

      <FeynmanCheck
        id="s1-check-secuencia"
        question="Predice ANTES de tocar el laboratorio: si intercambias las corrientes de las fases b y c (secuencia abc → acb), ¿qué le pasa al campo giratorio?"
        options={[
          {
            label: 'Gira en sentido contrario, a la misma velocidad.',
            correct: true,
            feedback:
              'Invertir la secuencia hace que el «turno» de cada bobina llegue en orden inverso: la ola del estadio corre al revés. Amplitud y velocidad no cambian. Por eso, para invertir un motor trifásico basta intercambiar dos fases cualesquiera.',
          },
          {
            label: 'Se detiene: las fases se cancelan.',
            feedback:
              'No se cancelan: las tres corrientes siguen sumando una FMM de amplitud 1.5·Fmax. Solo cambia el ORDEN temporal de los turnos, es decir, el sentido de giro.',
          },
          {
            label: 'Gira igual pero al doble de velocidad.',
            feedback:
              'La velocidad la fija la frecuencia eléctrica ωe, que no cambió. Lo único que se altera con la secuencia es el sentido.',
          },
          {
            label: 'Empieza a vibrar sin girar de forma definida.',
            feedback:
              'Eso ocurre en el caso MONOFÁSICO (campo pulsante). Con tres fases balanceadas —en cualquier secuencia— el campo siempre gira limpiamente.',
          },
        ]}
      />

      <FeynmanCheck
        id="s1-check-monofasico"
        question="Segundo experimento mental: deja SOLO la fase a conectada (modo monofásico). ¿Qué campo produce?"
        options={[
          {
            label: 'Un campo que gira más lento.',
            feedback:
              'Una sola bobina no puede definir un sentido de giro: no hay «siguiente» bobina que tome el relevo. El campo no gira lento — no gira en absoluto.',
          },
          {
            label: 'Un campo que pulsa sobre un eje fijo, sin girar.',
            correct: true,
            feedback:
              'Exacto: la FMM crece, se anula y se invierte siempre sobre el eje de la fase a. (De hecho, un campo pulsante equivale a DOS campos girando en sentidos opuestos — por eso el motor monofásico no sabe hacia dónde arrancar y necesita un devanado auxiliar.)',
          },
          {
            label: 'Ningún campo: se necesitan las tres fases.',
            feedback:
              'Sí hay campo — la bobina sigue siendo un electroimán. Lo que se pierde no es el campo sino el GIRO, que nacía de la coordinación entre fases.',
          },
        ]}
      />

      <ConceptBlock
        title="1.2 · La velocidad síncrona: el candado entre frecuencia y r/min"
        idea="El rotor de una máquina sincrónica está obligado a girar exactamente a la velocidad del campo. Esa velocidad solo depende de dos números: la frecuencia de la red y cuántos polos construiste. No hay deslizamiento, no hay «casi»: o giras a nₛ o no eres sincrónica."
        analogy="Como un tiovivo con caballos imantados: el motor del tiovivo (la red) fija las vueltas por minuto y el caballo (rotor) queda enganchado magnéticamente a su plataforma. Puede adelantarse o atrasarse unos grados (eso será δ en la sección de potencia), pero da las mismas vueltas."
      >
        <p className="mb-2">
          Con p polos, una vuelta mecánica «ve» p/2 ciclos eléctricos. De ahí que la velocidad mecánica
          sea la eléctrica dividida entre p/2 — y en revoluciones por minuto:
        </p>
        <Formula
          latex="n_s = \frac{120\,f}{p}\ \left[\text{r/min}\right]"
          tag="(4.44)"
          symbols={[
            { sym: 'n_s', meaning: 'Velocidad síncrona en revoluciones por minuto: la única velocidad de régimen posible para la máquina.' },
            { sym: 'f', meaning: 'Frecuencia eléctrica de la red en Hz (50 o 60 según el país).' },
            { sym: 'p', meaning: 'Número de polos magnéticos del rotor (siempre par). Más polos = más «dientes» del engranaje magnético = menos r/min.' },
            { sym: '120', meaning: 'Viene de 60 s/min × 2 (cada par de polos consume un ciclo por vuelta): 60·f/(p/2) = 120·f/p.' },
          ]}
        />
        <p>
          El 120 no es magia: 60 convierte segundos en minutos y el 2 aparece porque cada{' '}
          <em>par</em> de polos consume un ciclo eléctrico completo por vuelta. Si puedes reconstruir
          ese 120 tú solo, la fórmula es tuya para siempre.
        </p>
      </ConceptBlock>

      <SyncSpeedChart />

      <FeynmanCheck
        id="s1-check-ns"
        question="Sin calculadora: un motor sincrónico de 4 polos conectado a la red de 60 Hz, ¿a cuántas r/min gira?"
        options={[
          {
            label: '3600 r/min',
            feedback: 'Esa es la velocidad de 2 polos (120·60/2). Con 4 polos, cada vuelta mecánica consume 2 ciclos eléctricos: gira a la mitad.',
          },
          {
            label: '1800 r/min',
            correct: true,
            feedback: 'nₛ = 120·60/4 = 1800 r/min. Patrón útil de memorizar en 60 Hz: 2 polos → 3600, 4 → 1800, 6 → 1200, 8 → 900.',
          },
          {
            label: '1500 r/min',
            feedback: '1500 sería con red de 50 Hz (120·50/4). En 60 Hz, 4 polos dan 1800 r/min.',
          },
          {
            label: '900 r/min',
            feedback: '900 corresponde a 8 polos en 60 Hz. Con 4 polos: 120·60/4 = 1800 r/min.',
          },
        ]}
      />

      <SolvedProblem
        id="s1-problema-hidro"
        numero="1"
        title="Los polos de una central hidroeléctrica"
        statement={
          <>
            La turbina hidráulica de una central opera con máximo rendimiento a{' '}
            <strong>{nsTarget} r/min</strong> y debe alimentar la red de <strong>60 Hz</strong>.
            <br />
            <strong>(a)</strong> ¿Cuántos polos necesita el generador? <strong>(b)</strong> Si esa misma
            máquina se instalara en un país de 50 Hz, ¿a qué velocidad debería girar la turbina?
          </>
        }
        steps={[
          {
            title: 'Reconocer qué está fijo y qué se diseña',
            why: 'La turbina manda: la hidráulica fija nₛ = 120 r/min (ahí rinde). La red manda: f = 60 Hz. Lo único que el ingeniero puede elegir es p — el número de polos se DISEÑA para casar turbina con red.',
            work: 'n_s = \\frac{120\\,f}{p} \\;\\Rightarrow\\; p = \\frac{120\\,f}{n_s}',
          },
          {
            title: 'Despejar y sustituir',
            why: 'Despejamos p porque es la incógnita. Verifica siempre que salga un número PAR (los polos vienen en pares N-S); si no sale par, la velocidad pedida no es alcanzable exactamente.',
            work: `p = \\frac{120 \\times ${f60}}{${nsTarget}} = ${fmt(poles, 0)}\\ \\text{polos}\\;\\checkmark\\ (\\text{par})`,
            note: 'Un rotor de 60 polos es enorme y lento: por eso los generadores hidráulicos son «ruedas» de gran diámetro con polos salientes, mientras que un turbogenerador de vapor (3600 r/min) tiene solo 2 polos y es un cilindro largo y delgado.',
          },
          {
            title: 'Responder (b) con la misma máquina en 50 Hz',
            why: 'El número de polos ya quedó construido en el hierro: ahora p es el dato y la nueva frecuencia impone otra velocidad. La misma fórmula, usada en el otro sentido.',
            work: `n_s = \\frac{120 \\times 50}{${fmt(poles, 0)}} = ${fmt(ns50, 0)}\\ \\text{r/min}`,
          },
        ]}
        answer={`\\textbf{(a)}\\ p = ${fmt(poles, 0)}\\ \\text{polos} \\qquad \\textbf{(b)}\\ n_s = ${fmt(ns50, 0)}\\ \\text{r/min}`}
        takeaway="La fórmula nₛ = 120f/p es un contrato a tres partes: turbina (nₛ), red (f) y constructor (p). Dados dos, el tercero queda obligado. Y explica de un vistazo por qué las máquinas hidráulicas y las térmicas no se parecen en nada físicamente."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Tres corrientes desfasadas 120° en tres bobinas a 120° = un imán giratorio de amplitud
            constante <InlineMath latex="\tfrac{3}{2}F_{max}" />. La «ola del estadio»: nadie se mueve,
            la ola sí.
          </li>
          <li>Invertir dos fases invierte el giro. Una sola fase no gira: pulsa.</li>
          <li>
            <InlineMath latex="n_s = 120f/p" />: la red fija f, la turbina pide nₛ, el diseñador paga
            con p. Sin deslizamiento: sincrónica significa <em>exactamente</em> a nₛ.
          </li>
        </ul>
      </div>
    </section>
  )
}
