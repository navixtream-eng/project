import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import PwmLab from '../widgets/PwmLab'
import { fmt, pwmFundamental } from '../lib/machine'

/** Capítulo 8, Sección 5 — Inversores y PWM. */
export default function C8Section5() {
  const Vdc = 600
  const m = 0.9
  const V1peak = pwmFundamental(m, Vdc)
  const V1rms = V1peak / Math.SQRT2

  return (
    <section id="c8-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Capítulo 8 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Inversores y PWM: la máquina que fabrica V y f a voluntad
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Los controles de las secciones anteriores piden tensiones de amplitud y frecuencia arbitrarias.
          El inversor trifásico con PWM las fabrica conmutando un bus de continua a miles de hercios.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · El inversor trifásico: seis interruptores y un bus de CD"
        idea="Un inversor toma una tensión continua fija (el bus de CD, de un rectificador o una batería) y, con seis transistores (IGBTs) organizados en tres ramas, conecta cada fase del motor al polo positivo o negativo del bus. Abriendo y cerrando esos interruptores en el patrón correcto, sintetiza tres tensiones alternas de la amplitud y frecuencia que se quieran."
        analogy="Como pintar grises con solo tinta negra y papel blanco: si alternas puntos negros y blancos muy finos y muy rápido, el ojo (o el motor) ve un gris de la intensidad que elijas. El inversor solo tiene «+Vdc» y «−Vdc», pero conmutando rápido finge cualquier tensión intermedia."
      >
        <Formula
          latex="\text{3 ramas} \times 2\ \text{IGBTs} = 6\ \text{interruptores} \;\Rightarrow\; v_{fase} \in \{+\tfrac{V_{dc}}{2},\, -\tfrac{V_{dc}}{2}\}"
          symbols={[
            { sym: 'V_{dc}', meaning: 'Tensión del bus de continua: la materia prima. Fija el techo de tensión de salida; su valor determina la máxima velocidad/tensión alcanzable.' },
            { sym: 'IGBT', meaning: 'Transistor bipolar de puerta aislada: el interruptor de potencia que conmuta miles de veces por segundo con pérdidas bajas. La tecnología que hizo baratos y compactos los variadores.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.2 · Modulación por ancho de pulsos (PWM): el promedio es la señal"
        idea="La PWM senoidal compara una onda de referencia (la senoide que se quiere, de amplitud y frecuencia deseadas) con una portadora triangular rápida. Cuando la referencia supera a la portadora, el interruptor va arriba; si no, abajo. El resultado es un tren de pulsos cuyo ANCHO varía: su valor promedio (a lo largo de un periodo de portadora) sigue a la senoide de referencia. La propia inductancia del motor alisa los pulsos y ve solo ese promedio."
        analogy="Regar con una manguera de caudal fijo abriendo y cerrando el grifo: si lo abres mucho tiempo, cae mucha agua; poco tiempo, poca. Variando la proporción abierto/cerrado a lo largo del recorrido, el promedio de agua dibuja la forma que quieras — aunque el grifo solo sepa estar abierto o cerrado."
      >
        <Formula
          latex="\hat V_1 = m\cdot\frac{V_{dc}}{2} \quad (m \le 1,\ \text{regi\'on lineal}) \qquad f_{portadora} \gg f_{referencia}"
          symbols={[
            { sym: 'm', meaning: 'Índice de modulación: la amplitud de la referencia relativa a la portadora. Fija la amplitud del fundamental de salida. m ≤ 1 es la región lineal; m > 1 es sobremodulación (más tensión pero con armónicos de baja frecuencia).' },
            { sym: '\\hat V_1 = m V_{dc}/2', meaning: 'Amplitud del fundamental (la componente útil) de la tensión de salida. Ajustando m, el inversor entrega exactamente la tensión que pide el control V/f o el FOC.' },
            { sym: 'f_{portadora}', meaning: 'Frecuencia de conmutación (portadora): cuanto más alta, más limpia la corriente y más lejos (y fáciles de filtrar) los armónicos — a costa de más pérdidas de conmutación en los IGBTs.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.3 · Cómo se cierra el lazo con el control"
        idea="El algoritmo de control (V/f o FOC) calcula, a cada instante, las tres tensiones que el motor debe recibir. La PWM las traduce en patrones de conmutación de los IGBTs. Así, el inversor es el músculo que ejecuta las órdenes del cerebro de control: el FOC decide 'quiero tal id y tal iq', los transforma a tensiones abc de referencia, y la PWM las materializa conmutando el bus."
        analogy="El control es el director de orquesta que marca qué nota suena; el inversor con PWM es la orquesta que la toca. Sin músicos (electrónica de potencia) la partitura más brillante (el algoritmo) no suena; sin director, los músicos no saben qué tocar."
      >
        <p>
          Con un bus de {Vdc} V y m = {m}, el fundamental de salida tiene una amplitud de{' '}
          {fmt(V1peak, 0)} V pico ({fmt(V1rms, 0)} V eficaces por fase). Ajustando m y la frecuencia de
          la referencia, ese mismo inversor entrega desde 5 Hz para un arranque suave hasta 90 Hz para
          sobrevelocidad — la V y la f exactas que pidieron las secciones anteriores.
        </p>
      </ConceptBlock>

      <PwmLab />

      <FeynmanCheck
        id="c8s5-check-pwm"
        question="Un inversor solo puede conectar cada fase a +Vdc/2 o −Vdc/2 (dos niveles). ¿Cómo consigue entonces entregar una tensión senoidal suave al motor?"
        options={[
          {
            label: 'Conmutando muy rápido con ancho de pulso variable: el PROMEDIO de la onda cuadrada (en cada periodo de portadora) sigue a la senoide de referencia, y la inductancia del motor alisa el resto.',
            correct: true,
            feedback:
              'Exacto. La tensión instantánea es siempre ±Vdc/2, pero su valor MEDIO móvil dibuja la senoide: donde la referencia es alta, los pulsos «arriba» son anchos; donde es baja, estrechos. El motor, por su inductancia, responde a la corriente, que integra la tensión y ve solo el promedio suave (el fundamental) más un rizo pequeño a la frecuencia de conmutación. Nunca hay una tensión senoidal «real», pero el motor se comporta como si la hubiera.',
          },
          {
            label: 'Con un condensador grande que convierte los pulsos en una senoide antes del motor.',
            feedback:
              'Los variadores no ponen un filtro senoidal entre el inversor y el motor (sería caro y voluminoso). El alisado lo hace la propia inductancia del motor sobre la CORRIENTE. La tensión sigue siendo pulsos; es la corriente la que sale suave.',
          },
          {
            label: 'Usando muchos niveles de tensión distintos en el bus de CD.',
            feedback:
              'Existen inversores multinivel, pero el inversor básico de dos niveles ya logra la senoide equivalente solo con PWM — variando el ANCHO de los pulsos, no su altura. La clave es el promedio temporal, no tener muchos niveles.',
          },
        ]}
      />

      <SolvedProblem
        id="c8s5-problema-inversor"
        numero="36"
        title="Tensión de salida de un inversor PWM"
        statement={
          <>
            Un inversor con bus de CD de <strong>{Vdc} V</strong> alimenta un motor con PWM senoidal en
            la región lineal, índice de modulación <strong>m = {m}</strong>. Halle <strong>(a)</strong>{' '}
            la amplitud del fundamental de la tensión de fase, <strong>(b)</strong> su valor eficaz, y{' '}
            <strong>(c)</strong> qué se gana y se pierde subiendo la frecuencia de la portadora.
          </>
        }
        steps={[
          {
            title: '(a) Amplitud del fundamental',
            why: 'En la región lineal (m ≤ 1), la componente fundamental de la tensión de fase es m·Vdc/2.',
            work: `\\hat V_1 = m\\cdot\\frac{V_{dc}}{2} = ${m}\\times\\frac{${Vdc}}{2} = ${fmt(V1peak, 0)}\\ \\text{V pico}`,
          },
          {
            title: '(b) Valor eficaz',
            why: 'El eficaz de una senoide es su pico dividido por √2.',
            work: `V_{1,rms} = \\frac{\\hat V_1}{\\sqrt 2} = \\frac{${fmt(V1peak, 0)}}{\\sqrt 2} = ${fmt(V1rms, 0)}\\ \\text{V por fase}`,
            note: 'Ajustando m entre 0 y 1, el inversor barre la tensión desde 0 hasta este máximo lineal — justo la perilla que necesita el control V/f.',
          },
          {
            title: '(c) El compromiso de la frecuencia de portadora',
            why: 'Más conmutaciones por segundo mejoran la forma de onda pero cuestan energía en cada encendido/apagado del IGBT.',
            work: `f_{portadora}\\uparrow:\\ \\text{corriente m\\'as limpia, arm\\'onicos lejanos} \\;/\\; \\text{m\\'as p\\'erdidas de conmutaci\\'on}`,
            note: 'Típicamente 2–16 kHz: alto para silencio acústico y corriente limpia, pero limitado por el calentamiento de los transistores. Es el balance central del diseño del inversor.',
          },
        ]}
        answer={`\\hat V_1 = ${fmt(V1peak, 0)}\\ \\text{V pico} \\quad V_{1,rms} = ${fmt(V1rms, 0)}\\ \\text{V/fase} \\quad f_{port}\\uparrow \\Rightarrow \\text{limpieza vs p\\'erdidas}`}
        takeaway="El inversor trifásico de IGBTs con PWM fabrica cualquier V y f conmutando un bus de CD: el ancho de pulso codifica la amplitud (V₁ = m·Vdc/2) y el ritmo de la referencia, la frecuencia. Es el músculo que ejecuta las órdenes del control V/f y del FOC."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C8 Sección 5 · Cierre del capítulo
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El inversor trifásico (6 IGBTs + bus de CD) conecta cada fase a ±Vdc/2; la PWM varía el ancho de pulso para que el promedio siga una senoide.</li>
          <li>El fundamental es <InlineMath latex="\hat V_1 = m\,V_{dc}/2" />: m fija la tensión, la referencia fija la frecuencia. Más portadora = corriente más limpia pero más pérdidas.</li>
          <li>Cierra el círculo del capítulo: modelo dinámico → marcos d-q → control (V/f, FOC) → inversor PWM que lo ejecuta. Del monstruo no lineal al servo de precisión.</li>
        </ul>
      </div>
    </section>
  )
}
