import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import PowerAngleLab from '../widgets/PowerAngleLab'
import { fmt, fmtDeg, pMax, solveFromPf, toDeg } from '../lib/machine'

/**
 * Sección 3 — Característica potencia-ángulo y operación en barra infinita
 * (FKU §5.4): cómo fluye la potencia activa y dónde está la frontera del
 * sincronismo.
 */
export default function Section3() {
  // Problema 4: el generador de los Problemas 2 y 3 (Eaf calculada, no tecleada)
  const VT = 1.0
  const XS = 1.0
  const gen = solveFromPf(VT, 0.9, 0.9, true, XS) // punto del Problema 2
  const EAF = gen.EafMag // 1.611 pu
  const PMAX4 = pMax(EAF, VT, XS)
  const P4 = 0.9
  const delta4 = Math.asin(P4 / PMAX4)
  const margin4 = ((PMAX4 - P4) / PMAX4) * 100
  const stiff4 = PMAX4 * Math.cos(delta4)

  // Problema 5: bajar la excitación con la turbina fija
  const EAF5 = 1.0
  const delta5 = Math.asin(P4 / pMax(EAF5, VT, XS))
  const margin5 = ((pMax(EAF5, VT, XS) - P4) / pMax(EAF5, VT, XS)) * 100
  const EAF5b = 0.85

  return (
    <section id="seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 3</p>
        <h2 className="text-2xl font-black text-zinc-50">
          La característica potencia-ángulo y la barra infinita
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Ya sabes fabricar el campo (Sección 1) y modelar la máquina (Sección 2). Ahora la pregunta
          de fondo: ¿cómo fluye la potencia, quién la controla, y dónde está el precipicio?
        </p>
      </header>

      <ConceptBlock
        title="3.1 · La barra infinita: el interlocutor inamovible"
        idea="Una barra infinita es una red eléctrica tan grande comparada con tu máquina que nada de lo que hagas altera su tensión ni su frecuencia. Vt y f son datos inamovibles; lo único negociable es cuánta P y cuánta Q intercambias con ella."
        analogy="Es el océano: puedes bombear agua hacia él o extraerla, y su nivel no se inmuta. Tu generador de 100 MVA conectado a un sistema interconectado de 100 GW es exactamente eso — una gota con opiniones."
      >
        <p>
          La consecuencia práctica es liberadora: como Vt y f están clavadas, todo el comportamiento de
          la máquina queda descrito por solo dos variables de control — el par de la turbina y la
          corriente de campo — y dos variables de salida — P y Q. Esta sección resuelve la primera
          pareja: <strong>turbina → P, vía el ángulo δ</strong>.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="3.2 · P(δ): el resorte magnético entre el rotor y la red"
        idea="La potencia que cruza la reactancia Xs depende del seno del ángulo entre Eaf y Vt. δ es un resorte de torsión magnético: girar el rotor unos grados hacia adelante «estira el resorte» y la potencia fluye. Pero como es un seno, el resorte tiene un tope: pasado δ = 90°, estirar más lo DEBILITA — y se rompe el sincronismo."
        analogy="Dos discos unidos por un resorte espiral: el motor (turbina) tuerce uno, la carga (red) retiene el otro. A más torsión, más par transmitido… hasta el tope elástico. Pasado el tope, el resorte cede y los discos patinan — eso es deslizar polos."
      >
        <p className="mb-2">
          Dividiendo la potencia compleja entre los fasores del circuito equivalente (y despreciando la
          resistencia de armadura) queda la ecuación más famosa de los sistemas de potencia:
        </p>
        <Formula
          latex="P = \frac{E_{af}\,V_t}{X_s}\,\text{sen}\,\delta \qquad\Rightarrow\qquad P_{max} = \frac{E_{af}\,V_t}{X_s}"
          tag="(5.47)"
          symbols={[
            { sym: 'P', meaning: 'Potencia activa por fase (o total, en pu) que fluye de la máquina hacia la barra infinita.' },
            { sym: '\\delta', meaning: 'Ángulo de potencia: el adelanto físico del rotor (de Eaf) respecto a Vt. Es la variable que «negocia» la potencia.' },
            { sym: 'E_{af},\\ V_t', meaning: 'Las dos «presiones» del sistema: la interna (controlable con If) y la de la red (fija).' },
            { sym: 'X_s', meaning: 'La reactancia sincrónica en medio: cuanto mayor, menos potencia transmisible con el mismo δ.' },
            { sym: 'P_{max}', meaning: 'Límite de estabilidad estática: la cresta de la senoide en δ = 90°. Operar cerca de ella es caminar por la cornisa.' },
          ]}
        />
        <p>
          Fíjate en lo que <em>no</em> aparece: la potencia no depende del factor de potencia ni de la
          corriente — solo de las dos tensiones, la reactancia y el seno de δ. Y la derivada{' '}
          <InlineMath latex="dP/d\delta" /> (la «rigidez» del resorte) se anula exactamente en la
          cresta: el sistema pierde su capacidad de auto-corregirse justo donde más cargado está.
        </p>
      </ConceptBlock>

      <PowerAngleLab />

      <FeynmanCheck
        id="s3-check-resorte"
        question="El generador opera en δ = 30° y una ráfaga de carga lo frena ligeramente (δ crece un poco). ¿Por qué NO pierde el sincronismo?"
        options={[
          {
            label: 'Porque al crecer δ crece también P entregada: el exceso de potencia eléctrica frena…, no: acelera… (déjame pensar)',
            feedback:
              'Vas bien encaminado pero enredado — míralo con energía: si δ crece, P eléctrica entregada crece por encima de Pm, la máquina entrega más de lo que recibe y el DÉFICIT desacelera… espera, el rotor ya iba frenado. Revisa la opción correcta.',
          },
          {
            label: 'Porque en δ < 90° la curva tiene pendiente positiva: cualquier desviación de δ genera un desbalance P que empuja al rotor DE VUELTA al equilibrio.',
            correct: true,
            feedback:
              'Ese es el par sincronizante. Si δ crece, Pe > Pm y el exceso de potencia eléctrica frena el avance extra; si δ decrece, Pe < Pm y el sobrante mecánico lo vuelve a adelantar. La pendiente dP/dδ es literalmente la rigidez del resorte — positiva = estable. En δ > 90° la pendiente se invierte y el mismo mecanismo se vuelve suicida.',
          },
          {
            label: 'Porque la red (barra infinita) impone la velocidad y el rotor no puede desviarse.',
            feedback:
              'La red impone la FRECUENCIA de las tensiones, pero al rotor no lo sujeta nada mecánico: puede adelantarse o atrasarse (δ). Lo que lo devuelve al equilibrio es el par sincronizante — la pendiente positiva de P(δ).',
          },
        ]}
      />

      <FeynmanCheck
        id="s3-check-mandos"
        question="Quieres que tu generador entregue MÁS potencia activa a la barra infinita. ¿Qué mando mueves?"
        options={[
          {
            label: 'Subo la corriente de campo If: más Eaf, más potencia.',
            feedback:
              'Subir Eaf sube la CURVA (más Pmax de reserva) pero no cambia P: sin más vapor/agua, la máquina se reacomoda a un δ menor y entrega la MISMA P con más Q. Lo viste en la curva V de la Sección 2. La potencia activa entra por el eje, no por el campo.',
          },
          {
            label: 'Abro la admisión de la turbina: más Pm, el rotor avanza a un δ mayor y P sube.',
            correct: true,
            feedback:
              'La energía activa solo puede venir de la fuente mecánica. Al abrir la turbina, Pm > Pe transitoriamente, el rotor se adelanta, δ crece, y Pe sube hasta reequilibrarse en el nuevo δ. Regla de oro contra barra infinita: turbina ↔ P (vía δ); excitación ↔ Q (vía Eaf).',
          },
          {
            label: 'Ambos por igual: P depende del producto Eaf·sen δ.',
            feedback:
              'El producto aparece en la fórmula, sí — pero en régimen permanente δ no es una variable libre: se ACOMODA hasta que P(δ) = Pm. Si no cambias Pm, cambiar Eaf solo cambia el δ de equilibrio (y la Q), nunca la P.',
          },
        ]}
      />

      <FeynmanCheck
        id="s3-check-pmax"
        question="Predice antes de probarlo en el laboratorio: subes Pm lentamente hasta rebasar la cresta Pmax. ¿Qué ocurre en el instante en que Pm > Pmax?"
        options={[
          {
            label: 'La máquina se sobrecarga pero sigue en sincronismo con δ > 90°.',
            feedback:
              'δ > 90° con pendiente negativa no es un equilibrio operable: cualquier microdesviación crece en vez de corregirse. No hay operación estable al otro lado de la cresta (para Pm constante).',
          },
          {
            label: 'La recta Pm deja de cortar la curva: no existe δ de equilibrio, el rotor acelera sin freno y desliza polos.',
            correct: true,
            feedback:
              'Exacto — míralo geométricamente en el laboratorio: el punto amarillo desaparece porque Pm ya no intersecta a P(δ). Todo el exceso Pm − Pe acelera el rotor, δ crece sin límite y la protección de pérdida de paso debe desconectar la máquina. La frontera es geométrica: o hay intersección o no la hay.',
          },
          {
            label: 'La red le presta la potencia faltante y la frecuencia baja un poco.',
            feedback:
              'Contra una barra infinita la frecuencia NO cede (esa es su definición). Sin punto de equilibrio, el destino es la aceleración del rotor y la pérdida de sincronismo.',
          },
        ]}
      />

      <ConceptBlock
        title="3.3 · Polos salientes: la potencia que existe sin excitación"
        idea="En un rotor de polos salientes el entrehierro no es uniforme: el flujo «prefiere» alinearse con el eje del polo (menor reluctancia). Ese apetito de alineación produce un par extra — el par de reluctancia — que se suma al principal y desplaza la cresta de la curva a δ < 90°."
        analogy="Un clip frente a un imán gira para alinearse aunque el clip no esté imantado. El rotor saliente hace lo mismo frente al campo del estator: aún con If = 0 (sin «imán propio»), el hierro busca alinearse y transmite algo de potencia."
      >
        <p className="mb-2">
          La característica completa (que ya usaste sin saberlo en el simulador de transitorios
          SyncLab, versión transitoria) es:
        </p>
        <Formula
          latex="P = \frac{E_{af}V_t}{X_d}\,\text{sen}\,\delta \;+\; \frac{V_t^2}{2}\!\left(\frac{1}{X_q}-\frac{1}{X_d}\right)\text{sen}\,2\delta"
          symbols={[
            { sym: 'X_d,\\ X_q', meaning: 'Reactancias de eje directo (alineado con el polo) y de cuadratura (entre polos). En polos salientes Xq < Xd porque el entrehierro es mayor entre polos.' },
            { sym: '\\text{sen}\\,2\\delta', meaning: 'El par de reluctancia se repite cada 180°: el hierro se alinea igual con un polo norte que con un sur. Su máximo está en δ = 45°.' },
            { sym: '\\tfrac{V_t^2}{2}(\\cdot)', meaning: 'No contiene a Eaf: este término existe AUNQUE la excitación sea cero. Es potencia «gratis» de la geometría del rotor.' },
          ]}
        />
        <p>
          Actívalo en el laboratorio de arriba (checkbox «polos salientes») y verifica las dos firmas
          del fenómeno: la cresta se adelanta a δ &lt; 90°, y con |Eaf| → 0 la curva no muere — queda
          la joroba de reluctancia en sen 2δ.
        </p>
      </ConceptBlock>

      <SolvedProblem
        id="s3-problema-pdelta"
        numero="4"
        title="Punto de operación y margen de estabilidad"
        statement={
          <>
            El generador de los Problemas 2 y 3 (Xs = {fmt(XS, 1)} pu, Vt = {fmt(VT, 1)} pu) opera
            sobreexcitado con la Eaf que calculamos: <strong>|Eaf| = {fmt(EAF)} pu</strong>. La turbina
            entrega <strong>P = {fmt(P4, 1)} pu</strong>. Halle Pmax, el ángulo de operación δ, el
            margen de reserva y la rigidez sincronizante dP/dδ.
          </>
        }
        steps={[
          {
            title: 'La cresta de la curva: Pmax',
            why: 'Antes de ubicar el punto de operación conviene conocer el techo. Pmax es la amplitud de la senoide: el producto de las dos tensiones dividido por la reactancia que las separa.',
            work: `P_{max} = \\frac{E_{af}V_t}{X_s} = \\frac{${fmt(EAF)} \\times ${fmt(VT, 1)}}{${fmt(XS, 1)}} = ${fmt(PMAX4)}\\ \\text{pu}`,
          },
          {
            title: 'El ángulo de operación: invertir el seno',
            why: 'En régimen permanente la máquina se acomoda exactamente donde P(δ) = P de la turbina. De las dos soluciones matemáticas del seno, la física es la de δ < 90° (pendiente positiva = equilibrio estable).',
            work: `\\delta = \\text{arcsen}\\!\\left(\\frac{P}{P_{max}}\\right) = \\text{arcsen}\\!\\left(\\frac{${fmt(P4, 1)}}{${fmt(PMAX4)}}\\right) = ${fmtDeg(delta4)}`,
            note: `La otra solución, 180° − ${fmt(toDeg(delta4), 1)}° = ${fmt(180 - toDeg(delta4), 1)}°, es el equilibrio inestable (el punto hueco del laboratorio): mismo P, pendiente negativa.`,
          },
          {
            title: 'Margen de reserva y rigidez',
            why: 'Dos métricas de salud: cuánta potencia extra cabe antes de la cresta (margen), y qué tan fuerte responde el resorte ante una perturbación (dP/dδ = Pmax·cos δ, la pendiente en el punto).',
            work: `\\text{margen} = \\frac{P_{max}-P}{P_{max}} = ${fmt(margin4, 0)}\\% \\qquad \\left.\\frac{dP}{d\\delta}\\right|_{\\delta} = P_{max}\\cos\\delta = ${fmt(stiff4, 2)}\\ \\text{pu/rad}`,
          },
        ]}
        answer={`P_{max} = ${fmt(PMAX4)}\\ \\text{pu} \\qquad \\delta = ${fmtDeg(delta4)} \\qquad \\text{margen} = ${fmt(margin4, 0)}\\% \\qquad dP/d\\delta = ${fmt(stiff4, 2)}\\ \\text{pu/rad}`}
        takeaway="Un generador bien excitado entregando 0.9 pu usa apenas 34° de los 90° disponibles: margen del 44%. Reproduce este punto en el laboratorio (Pm = 0.9, |Eaf| = 1.61) y verifica los cuatro números."
      />

      <SolvedProblem
        id="s3-problema-excitacion"
        numero="5"
        title="El peligro de operar subexcitado"
        statement={
          <>
            Con la turbina fija en <strong>P = {fmt(P4, 1)} pu</strong>, el operador reduce la
            excitación hasta <strong>|Eaf| = {fmt(EAF5, 1)} pu</strong>. <strong>(a)</strong> ¿Nuevo δ y
            margen? <strong>(b)</strong> ¿Qué ocurre si sigue bajando hasta |Eaf| = {fmt(EAF5b, 2)} pu?
          </>
        }
        steps={[
          {
            title: 'Recalcular la curva: bajar Eaf aplasta la senoide',
            why: 'La potencia de la turbina no cambió — la curva sí. Con menos excitación, Pmax cae proporcionalmente y el MISMO P exige un ángulo mayor: el punto trepa hacia la cresta.',
            work: `P_{max} = \\frac{${fmt(EAF5, 1)} \\times 1}{1} = ${fmt(EAF5, 1)}\\ \\text{pu} \\qquad \\delta = \\text{arcsen}\\!\\left(\\frac{${fmt(P4, 1)}}{${fmt(EAF5, 1)}}\\right) = ${fmtDeg(delta5)}`,
          },
          {
            title: 'Leer el margen — y preocuparse',
            why: 'De 44% de reserva pasamos a un margen exiguo, con la rigidez dP/dδ desplomada. La máquina sigue en sincronismo, pero cualquier perturbación apreciable (un cortocircuito lejano, una ráfaga de carga) puede empujarla al otro lado.',
            work: `\\text{margen} = \\frac{${fmt(EAF5, 1)} - ${fmt(P4, 1)}}{${fmt(EAF5, 1)}} = ${fmt(margin5, 0)}\\% \\qquad \\frac{dP}{d\\delta} = ${fmt(EAF5, 1)}\\cos(${fmt(toDeg(delta5), 1)}^\\circ) = ${fmt(EAF5 * Math.cos(delta5), 2)}\\ \\text{pu/rad}`,
          },
          {
            title: '(b) El punto de no retorno',
            why: 'Con |Eaf| = 0.85 pu, la cresta de la curva queda en Pmax = 0.85 pu — POR DEBAJO de lo que la turbina insiste en entregar (0.9 pu). La recta Pm ya no corta la senoide: no existe equilibrio.',
            work: `P_{max} = ${fmt(EAF5b, 2)}\\ \\text{pu} < P_m = ${fmt(P4, 1)}\\ \\text{pu} \\;\\Rightarrow\\; \\nexists\\,\\delta:\\ P(\\delta)=P_m`,
            note: 'El rotor acelera sin freno eléctrico, desliza polos, y la protección de pérdida de paso desconecta la máquina. Reprodúcelo en el laboratorio: Pm = 0.9 y baja |Eaf| despacio — verás morir el punto amarillo al cruzar 0.90.',
          },
        ]}
        answer={`\\textbf{(a)}\\ \\delta = ${fmtDeg(delta5)},\\ \\text{margen} = ${fmt(margin5, 0)}\\% \\qquad \\textbf{(b)}\\ P_{max}=${fmt(EAF5b, 2)} < ${fmt(P4, 1)}\\ \\text{pu} \\Rightarrow \\text{pérdida de sincronismo}`}
        takeaway="La excitación no controla la P — pero sí controla CUÁNTO MARGEN tienes para entregarla. Bajar If con la turbina cargada es recortar la cornisa por la que caminas. Este es el fundamento del limitador de subexcitación de los reguladores de tensión reales."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Contra barra infinita, Vt y f son inamovibles: solo negocias P y Q. La potencia activa fluye
            por el resorte magnético: <InlineMath latex="P = (E_{af}V_t/X_s)\,\text{sen}\,\delta" />.
          </li>
          <li>
            Dos mandos, dos monedas: <strong className="text-amber-300">turbina → P</strong> (desliza el
            punto por la curva, vía δ); <strong className="text-emerald-300">excitación → Q</strong>{' '}
            (cambia la altura de la curva y el margen).
          </li>
          <li>
            La cresta es la frontera: pendiente dP/dδ positiva = par sincronizante que perdona
            perturbaciones; en la cresta la rigidez es cero y más allá no hay equilibrio. Subexcitar con
            carga es acercar la frontera hacia ti.
          </li>
          <li>
            Polos salientes: el hierro que busca alinearse regala un término en sen 2δ — potencia sin
            excitación y cresta antes de 90°.
          </li>
        </ul>
      </div>
    </section>
  )
}
