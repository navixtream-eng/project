import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import CoenergyLab from '../widgets/CoenergyLab'
import ActuatorForceLab from '../widgets/ActuatorForceLab'
import { actuatorForce, actuatorL, fmt } from '../lib/machine'

/**
 * Capítulo 3, Sección 1 — El campo de acoplamiento, energía, coenergía y
 * la fuerza en un sistema de excitación simple.
 */
export default function C3Section1() {
  // Problema 24: fuerza de un actuador de émbolo (valores del laboratorio)
  const N = 500
  const A = 4e-4
  const I = 2.0
  const G = 2.0
  const L = actuatorL(N, A, G)
  const Wc = 0.5 * L * I * I
  const F = actuatorForce(N, A, I, G)
  const Fhalf = actuatorForce(N, A, I, G / 2)

  return (
    <section id="c3-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-400">
          Capítulo 3 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El campo de acoplamiento: energía, coenergía y fuerza
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El puente entre lo eléctrico y lo mecánico. Toda máquina convierte energía a través de un
          intermediario: el campo magnético. De cuánta energía guarda ese campo y cómo cambia con la
          posición sale, literalmente, toda fuerza y todo par.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · La caja negra: el balance de energía"
        idea="Ve el conversor como una caja con dos puertas: por la eléctrica entra energía (v·i·dt), por la mecánica sale trabajo (f·dx). En medio hay un almacén: el campo magnético. Sin pérdidas, lo que entra por una puerta o sale por la otra o se guarda en el campo — nada se pierde, solo se transforma o se almacena."
        analogy="Una cuenta bancaria con dos cajeros: depósitos (energía eléctrica) y retiros (trabajo mecánico). El saldo es la energía del campo. La regla contable es inviolable: depósito = retiro + cambio de saldo. Toda la mecánica de las máquinas es leer ese libro contable."
      >
        <Formula
          latex="\underbrace{dW_{elec}}_{v\,i\,dt} = \underbrace{dW_{mec}}_{f_{fld}\,dx} + \underbrace{dW_{fld}}_{\text{cambio del almacén}}"
          symbols={[
            { sym: 'dW_{elec} = v\\,i\\,dt', meaning: 'Energía eléctrica que entra. Con v = dλ/dt (Faraday), esto es i·dλ: la corriente por el cambio de enlace de flujo.' },
            { sym: 'dW_{mec} = f_{fld}\\,dx', meaning: 'Trabajo mecánico entregado: la fuerza del campo por el desplazamiento. Lo que queremos calcular.' },
            { sym: 'dW_{fld}', meaning: 'Cambio en la energía almacenada en el campo magnético — el intermediario que hace posible toda la conversión.' },
          ]}
        />
        <p>
          La estrategia del capítulo cabe en una frase: si sé cuánta energía guarda el campo{' '}
          <em>en función de la posición</em>, la fuerza es cuánto cambia esa energía al moverme.
          Todo se reduce a cuantificar el almacén.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · Energía y coenergía: el rectángulo partido por la curva"
        idea="Con la corriente conectada, el campo guarda una energía Wfld = ∫i·dλ (el área a la IZQUIERDA de la curva de magnetización). Pero como el hierro satura, esa integral en λ es incómoda. El truco: definir la COENERGÍA W′fld = ∫λ·di (el área ABAJO de la curva) — el complemento. Juntas llenan el rectángulo λ·i. En un sistema lineal son idénticas (½Li²); al saturar, se separan."
        analogy="Cortar una rebanada de pastel rectangular con un cuchillo curvo: un pedazo es la energía, el otro la coenergía, y juntos son el pastel entero (λ·i). Si el corte es recto (sistema lineal), las dos mitades son iguales; si el cuchillo se curva (saturación), una crece a costa de la otra."
      >
        <Formula
          latex="W_{fld} = \int_0^\lambda i\,d\lambda \qquad W'_{fld} = \int_0^i \lambda\,di \qquad W_{fld} + W'_{fld} = \lambda\,i"
          symbols={[
            { sym: 'W_{fld}', meaning: 'Energía del campo: variable natural λ. Área a la izquierda de la curva λ-i. Con ella la fuerza sale con signo NEGATIVO (a flujo constante).' },
            { sym: "W'_{fld}", meaning: 'Coenergía: variable natural i. Área bajo la curva. Con ella la fuerza sale con signo POSITIVO (a corriente constante) — el camino cómodo, porque la corriente es lo que controlas.' },
            { sym: '\\tfrac{1}{2}Li^2', meaning: 'El valor común de ambas EN SISTEMAS LINEALES. La coenergía es la que usarás casi siempre porque la corriente es el dato.' },
          ]}
        />
        <CoenergyLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c3s1-check-almacen"
        question="En un sistema SIN pérdidas, empujas el émbolo lentamente manteniendo la corriente constante. ¿De dónde sale la energía mecánica que entregas?"
        options={[
          {
            label: 'Solo de la energía almacenada en el campo, que disminuye.',
            feedback:
              'A corriente constante ocurre algo más sutil: al moverse el émbolo cambia la inductancia, cambia λ, y la fuente ELÉCTRICA inyecta energía extra (v·i·dt con v = dλ/dt). No sale solo del almacén.',
          },
          {
            label: 'De la fuente eléctrica: al moverse el émbolo cambia λ, la fuente entrega i·dλ, y esa energía se reparte entre el trabajo mecánico Y el aumento del campo — de hecho a corriente constante la fuente aporta el DOBLE del trabajo mecánico.',
            correct: true,
            feedback:
              'El resultado elegante del capítulo: a i constante, dWelec = i·dλ = 2·dW′fld, y como dWmec = dW′fld, la fuente entrega exactamente la mitad al trabajo y la mitad al campo. La energía mecánica NO viene del almacén (que hasta crece) sino de la fuente, canalizada por el campo. Por eso la coenergía —función de i— es la herramienta natural.',
          },
          {
            label: 'De la energía cinética del émbolo.',
            feedback:
              'El movimiento es cuasiestático (lento): sin energía cinética apreciable. La energía mecánica que entregas viene de la fuente eléctrica a través del campo de acoplamiento.',
          },
        ]}
      />

      <FeynmanCheck
        id="c3s1-check-coenergy"
        question="¿Por qué se inventa la coenergía si en sistemas lineales vale exactamente lo mismo que la energía?"
        options={[
          {
            label: 'Por elegancia matemática, sin ventaja real.',
            feedback:
              'Hay una ventaja muy concreta y práctica: tiene que ver con QUÉ variable controlas en un problema real. ¿Mides/fijas el flujo λ o la corriente i?',
          },
          {
            label: 'Porque la coenergía es función de la CORRIENTE (lo que realmente controlas y mides), mientras la energía es función del flujo λ (incómodo de fijar) — y en materiales saturables la integral en i es mucho más manejable.',
            correct: true,
            feedback:
              'En el laboratorio controlas la corriente, no el enlace de flujo. La fuerza por coenergía, f = +∂W′/∂x|i, se evalúa con la variable que tienes a mano. Además, con saturación, λ(i) es una función explícita que integras fácil en i; la inversa i(λ) para la energía es más engorrosa. Misma física, herramienta más cómoda.',
          },
          {
            label: 'Porque la coenergía incluye las pérdidas y la energía no.',
            feedback:
              'Ninguna de las dos incluye pérdidas — todo este análisis es del sistema conservativo. La diferencia es cuál variable es la independiente: i (coenergía) vs. λ (energía).',
          },
        ]}
      />

      <ConceptBlock
        title="1.3 · La fuerza: derivar el almacén respecto a la posición"
        idea="Aquí está el corazón práctico: la fuerza del campo es la derivada de la energía (o coenergía) respecto a la posición. Con la coenergía y corriente constante, f = +∂W′/∂x: el campo empuja en la dirección que AUMENTA la coenergía (baja la reluctancia, cierra los gaps). El signo opuesto con la energía a flujo constante refleja el mismo hecho físico desde la otra variable."
        analogy="Una pelota en un valle: la fuerza apunta hacia donde la energía potencial baja. El campo magnético hace lo mismo — busca la configuración de mínima «resistencia magnética», arrastrando las piezas móviles para cerrar los entrehierros."
      >
        <Formula
          latex="f_{fld} = -\left.\frac{\partial W_{fld}(\lambda, x)}{\partial x}\right|_{\lambda} = +\left.\frac{\partial W'_{fld}(i, x)}{\partial x}\right|_{i} \;\;\xrightarrow{\text{lineal}}\;\; f_{fld} = \tfrac{1}{2}i^2\frac{dL(x)}{dx}"
          symbols={[
            { sym: '-\\partial W/\\partial x|_\\lambda', meaning: 'A FLUJO constante, la fuerza reduce la energía almacenada. Signo negativo: el sistema «cae» hacia menor energía.' },
            { sym: '+\\partial W\'/\\partial x|_i', meaning: 'A CORRIENTE constante, la fuerza aumenta la coenergía. Signo positivo. Los dos signos describen el MISMO empuje físico, medido con variables distintas.' },
            { sym: '\\tfrac{1}{2}i^2\\,dL/dx', meaning: 'La fórmula de trabajo para sistemas lineales: la fuerza es proporcional a i² y a cómo cambia la inductancia con la posición. Si L crece al cerrar el gap (dL/dx contra la apertura), el campo cierra el gap.' },
          ]}
        />
        <ActuatorForceLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c3s1-check-force-sign"
        question="La fuerza de un electroimán SIEMPRE cierra el entrehierro (atrae), nunca lo abre. ¿Qué principio energético lo garantiza?"
        options={[
          {
            label: 'Que la corriente siempre es positiva.',
            feedback:
              'La fuerza va con i², así que el signo de la corriente da igual (por eso un electroimán de CA atrae en ambos semiciclos). El sentido de la fuerza no lo decide i sino cómo cambia la ENERGÍA con la posición.',
          },
          {
            label: 'Que cerrar el gap AUMENTA la inductancia (baja la reluctancia): a corriente constante eso sube la coenergía, y f = +∂W′/∂x empuja precisamente hacia donde la coenergía crece.',
            correct: true,
            feedback:
              'El campo siempre busca subir L / bajar la reluctancia — cerrar el aire. Como f = ½i²·dL/dx y dL/dx apunta hacia el gap cerrado, la fuerza es de atracción, con cualquier signo de corriente. Es el mismo principio del par de reluctancia (Cap. 4): el hierro se mueve para dejar pasar más flujo con menos esfuerzo.',
          },
          {
            label: 'Que el flujo magnético es siempre atractivo entre polos opuestos.',
            feedback:
              'La atracción polo-a-polo es una descripción, no el principio general. El criterio que SIEMPRE funciona (incluso sin polos definidos) es energético: la fuerza empuja hacia mayor coenergía = menor reluctancia = gap cerrado.',
          },
        ]}
      />

      <SolvedProblem
        id="c3s1-problema-actuador"
        numero="24"
        title="La fuerza de un actuador de émbolo"
        statement={
          <>
            Un actuador tiene N = {fmt(N, 0)} vueltas, sección de entrehierro A = {fmt(A * 1e4, 0)} cm²
            y un entrehierro g = {fmt(G, 1)} mm, con corriente i = {fmt(I, 1)} A. Despreciando la
            reluctancia del hierro: <strong>(a)</strong> halle L(g) y la coenergía;{' '}
            <strong>(b)</strong> la fuerza sobre el émbolo; <strong>(c)</strong> compárela con la
            fuerza si el gap se reduce a la mitad.
          </>
        }
        steps={[
          {
            title: '(a) Inductancia y coenergía',
            why: 'Con el hierro «gratis», toda la reluctancia es del aire: L = μ₀N²A/g. La coenergía de un sistema lineal es ½Li².',
            work: `L = \\frac{\\mu_0 N^2 A}{g} = \\frac{4\\pi\\!\\times\\!10^{-7} \\times ${fmt(N, 0)}^2 \\times ${fmt(A * 1e4, 0)}\\!\\times\\!10^{-4}}{${fmt(G, 1)}\\!\\times\\!10^{-3}} = ${fmt(L * 1000, 2)}\\ \\text{mH} \\qquad W'_{fld} = \\tfrac{1}{2}Li^2 = ${fmt(Wc * 1000, 1)}\\ \\text{mJ}`,
          },
          {
            title: '(b) Derivar respecto a la posición',
            why: 'La fuerza es f = ½i²·dL/dg. Como L ∝ 1/g, dL/dg = −μ₀N²A/g²: negativa, es decir, la fuerza actúa para DISMINUIR g (cerrar el gap).',
            work: `|f| = \\tfrac{1}{2}i^2\\frac{\\mu_0 N^2 A}{g^2} = \\frac{1}{2}\\cdot${fmt(I, 1)}^2\\cdot\\frac{4\\pi\\!\\times\\!10^{-7}\\times${fmt(N, 0)}^2\\times${fmt(A * 1e4, 0)}\\!\\times\\!10^{-4}}{(${fmt(G, 1)}\\!\\times\\!10^{-3})^2} = ${fmt(F, 1)}\\ \\text{N}`,
            note: 'Equivalentemente, F = B²A/(2μ₀) (la tensión de Maxwell): mismo número por otro camino. La fuerza atrae el émbolo hacia el yugo.',
          },
          {
            title: '(c) La dependencia 1/g²',
            why: 'La fuerza va con el INVERSO DEL CUADRADO del gap: reducirlo a la mitad la cuadruplica. Esto explica el «tirón» final abrupto de relés y contactores.',
            work: `|f(g/2)| = ${fmt(Fhalf, 0)}\\ \\text{N} = 4\\times|f(g)| \\quad\\text{(pues } (g/2)^{-2} = 4g^{-2})`,
          },
        ]}
        answer={`L = ${fmt(L * 1000, 2)}\\ \\text{mH} \\quad W'_{fld} = ${fmt(Wc * 1000, 1)}\\ \\text{mJ} \\quad |f| = ${fmt(F, 1)}\\ \\text{N} \\quad |f(g/2)| = ${fmt(Fhalf, 0)}\\ \\text{N}`}
        takeaway="La receta universal de la fuerza magnética: escribe la coenergía en función de la posición, y deriva. f = ½i²·dL/dx resuelve cualquier actuador de reluctancia — y es la semilla del par de todas las máquinas."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C3 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Balance de la caja negra:{' '}
            <InlineMath latex="dW_{elec} = dW_{mec} + dW_{fld}" /> — la energía entra, sale o se
            guarda en el campo. Nada se pierde (sistema conservativo).
          </li>
          <li>
            Energía (∫i dλ, izquierda de la curva) y coenergía (∫λ di, abajo) parten el rectángulo
            λ·i. Iguales si es lineal; se separan al saturar. La coenergía es cómoda porque su
            variable es la corriente.
          </li>
          <li>
            La fuerza es la derivada del almacén respecto a la posición:{' '}
            <InlineMath latex="f = +\partial W'/\partial x|_i = \tfrac{1}{2}i^2 dL/dx" />. Siempre
            empuja a cerrar gaps (subir L, bajar reluctancia).
          </li>
        </ul>
      </div>
    </section>
  )
}
