import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import TransferFunctionLab from '../widgets/TransferFunctionLab'
import { DEFAULT_DCDYN, dcSecondOrder, fmt } from '../lib/machine'

/** Capítulo 10, Sección 3 — Funciones de transferencia y diagramas de bloques. */
export default function C10Section3() {
  const p = DEFAULT_DCDYN
  const so = dcSecondOrder(p)
  const under = dcSecondOrder({ ...p, Ra: 0.15, La: 0.02 })

  return (
    <section id="c10-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
          Capítulo 10 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Función de transferencia: el motor como sistema de segundo orden
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Con Laplace, las dos ODE acopladas se vuelven una función de transferencia Ω(s)/Va(s). Su
          amortiguamiento decide si la velocidad llega suave, justo a tiempo, o con oscilaciones.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · De las ODE a la función de transferencia"
        idea="Aplicando la transformada de Laplace (d/dt → s) a las dos ecuaciones y eliminando la corriente, se obtiene la relación entre la velocidad de salida y la tensión de entrada: un cociente de polinomios en s con denominador de segundo grado. El motor de CC es, formalmente, un sistema dinámico de 2.º orden."
        analogy="Como resumir una receta de dos pasos en una sola fórmula entrada→salida. Laplace convierte las derivadas en álgebra: las dos ecuaciones diferenciales acopladas se funden en una sola expresión manejable."
      >
        <Formula
          latex="\frac{\Omega_m(s)}{V_a(s)} = \frac{K_a\Phi}{L_a J\,s^2 + (R_a J + L_a B)\,s + (R_a B + (K_a\Phi)^2)}"
          symbols={[
            { sym: 's^2', meaning: 'El término de 2.º orden nace del producto de las dos dinámicas (eléctrica × mecánica). Por eso el motor puede oscilar: dos almacenes de energía (La e J) que se intercambian energía.' },
            { sym: '(K_a\\Phi)^2', meaning: 'El acoplamiento electromecánico en el término independiente: es lo que «cierra el lazo» entre par y FEM y da rigidez (velocidad de respuesta) al sistema.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.2 · ωn y ζ: los dos números que resumen la respuesta"
        idea="Todo sistema de 2.º orden se caracteriza por su frecuencia natural ωn (qué tan rápido oscilaría) y su amortiguamiento ζ (cuánto se frena esa oscilación). ζ > 1 sobreamortiguado (lento, sin sobrepaso), ζ = 1 crítico (lo más rápido sin oscilar), ζ < 1 subamortiguado (rápido pero con sobrepaso y oscilaciones)."
        analogy="La puerta con amortiguador: muy apretado (ζ>1) se cierra lentísimo; flojo (ζ<1) da un portazo y rebota; en el punto justo (ζ=1) se cierra rápido y sin golpe. El diseñador busca ese punto justo."
      >
        <Formula
          latex="\omega_n = \sqrt{\frac{R_a B + (K_a\Phi)^2}{L_a J}} \qquad \zeta = \frac{R_a J + L_a B}{2\sqrt{L_a J\,(R_a B + (K_a\Phi)^2)}}"
          symbols={[
            { sym: '\\omega_n', meaning: 'Frecuencia natural [rad/s]: la rapidez intrínseca del sistema. Sube con el acoplamiento (Ka·Φ) y baja con La e J (más «masa» eléctrica y mecánica).' },
            { sym: '\\zeta', meaning: 'Amortiguamiento (adimensional): decide la forma. La resistencia Ra amortigua (sube ζ); La e J grandes reducen ζ y favorecen las oscilaciones.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.3 · Los polos y la respuesta temporal"
        idea="Las raíces del denominador (los POLOS) determinan la respuesta. Con ζ > 1 son reales y negativos (respuesta suma de exponenciales, sin oscilar). Con ζ < 1 son complejos conjugados: su parte imaginaria produce oscilaciones y su parte real (negativa) las amortigua. Diseñar el control es MOVER esos polos donde quieras."
        analogy="Los polos son el ADN de la respuesta: dónde están en el plano s te dice si el sistema será perezoso, ágil o nervioso. El controlador es cirugía sobre esa ubicación."
      >
        <p>
          Con los parámetros base, ζ ≈ {fmt(so.zeta, 2)} ({so.regime}) y ωn ≈ {fmt(so.wn, 0)} rad/s.
          Bajando Ra y subiendo La se llega a ζ ≈ {fmt(under.zeta, 2)} (subamortiguado, con oscilaciones).
          Muévelo en el laboratorio y observa los polos migrar del eje real al plano complejo.
        </p>
      </ConceptBlock>

      <TransferFunctionLab />

      <FeynmanCheck
        id="c10s3-check-orden"
        question="¿Por qué el motor de CC es un sistema de SEGUNDO orden (puede oscilar), y no de primer orden?"
        options={[
          {
            label: 'Porque tiene DOS almacenes de energía independientes —la inductancia La (energía magnética) y la inercia J (energía cinética)— que pueden intercambiarse energía, dando un denominador en s².',
            correct: true,
            feedback:
              'Exacto. El orden de un sistema es el número de almacenes de energía independientes. La guarda energía en el campo magnético (½La·i²) e J en el giro (½J·ω²). El intercambio de energía entre esos dos almacenes es lo que permite la oscilación (como un péndulo intercambia cinética y potencial). Un sistema con un solo almacén (1.º orden) no puede sobrepasar ni oscilar.',
          },
          {
            label: 'Porque tiene dos resistencias.',
            feedback:
              'Las resistencias DISIPAN energía, no la almacenan, y no aumentan el orden del sistema (más bien lo amortiguan). El 2.º orden viene de los dos ALMACENES de energía: la inductancia y la inercia.',
          },
          {
            label: 'Porque la tensión y la corriente son dos variables.',
            feedback:
              'Contar variables no da el orden. Lo que lo fija es el número de almacenes de energía independientes con estado propio: La (magnético) e J (cinético). Esos dos estados hacen el sistema de 2.º orden.',
          },
        ]}
      />

      <FeynmanCheck
        id="c10s3-check-zeta"
        question="Un diseñador quiere que el motor alcance su velocidad lo MÁS rápido posible pero SIN oscilar. ¿Qué amortiguamiento busca?"
        options={[
          {
            label: 'ζ = 1 (amortiguamiento crítico): es la frontera exacta — la respuesta más rápida que no sobrepasa ni oscila.',
            correct: true,
            feedback:
              'Correcto. Con ζ > 1 (sobreamortiguado) no oscila pero es innecesariamente lento. Con ζ < 1 (subamortiguado) es rápido pero sobrepasa y oscila. Justo en ζ = 1 (crítico) los dos polos reales se juntan: es la respuesta más veloz posible sin ningún sobrepaso. Por eso es un objetivo de diseño frecuente (a veces se acepta un ζ ≈ 0.7 para ganar algo de rapidez a cambio de un sobrepaso pequeño).',
          },
          {
            label: 'ζ muy grande (ζ ≫ 1): cuanto más amortiguado, mejor.',
            feedback:
              'Un ζ muy grande evita las oscilaciones pero hace la respuesta LENTÍSIMA (un polo muy cercano al origen domina). No es lo más rápido: el óptimo sin oscilar es exactamente ζ = 1.',
          },
          {
            label: 'ζ = 0 (sin amortiguamiento): así responde instantáneamente.',
            feedback:
              'Con ζ = 0 el sistema oscila indefinidamente sin asentarse — lo peor para un control de velocidad. El equilibrio entre rapidez y ausencia de oscilación está en ζ = 1, no en 0.',
          },
        ]}
      />

      <SolvedProblem
        id="c10s3-problema-2orden"
        numero="44"
        title="Frecuencia natural, amortiguamiento y régimen"
        statement={
          <>
            Para el motor (Ra = {p.Ra} Ω, La = {fmt(p.La * 1000, 0)} mH, Ka·Φ = {p.kPhi}, J = {p.J},
            B = {p.B}), halle <strong>(a)</strong> ωn, <strong>(b)</strong> ζ y el régimen, y{' '}
            <strong>(c)</strong> qué pasa si se reduce Ra a 0.15 Ω y se sube La a 20 mH.
          </>
        }
        steps={[
          {
            title: '(a) Frecuencia natural',
            why: 'De los coeficientes de la función de transferencia de 2.º orden.',
            work: `\\omega_n = \\sqrt{\\frac{R_a B + (K_a\\Phi)^2}{L_a J}} = ${fmt(so.wn, 1)}\\ \\text{rad/s}`,
          },
          {
            title: '(b) Amortiguamiento y régimen',
            why: 'ζ decide la forma de la respuesta.',
            work: `\\zeta = \\frac{R_a J + L_a B}{2\\sqrt{L_a J(R_a B + (K_a\\Phi)^2)}} = ${fmt(so.zeta, 2)} \\;(>1)`,
            note: `ζ = ${fmt(so.zeta, 2)} > 1 ⇒ ${so.regime}: la velocidad llega sin sobrepaso, con polos reales.`,
          },
          {
            title: '(c) Reducir Ra y subir La',
            why: 'Menos resistencia amortigua menos; más inductancia añade «masa» eléctrica: el sistema se vuelve subamortiguado.',
            work: `R_a = 0.15,\\ L_a = 20\\text{ mH} \\;\\Rightarrow\\; \\zeta = ${fmt(under.zeta, 2)} \\;(<1)`,
            note: 'Ahora los polos son complejos conjugados: la velocidad sobrepasa y oscila antes de asentarse.',
          },
        ]}
        answer={`\\omega_n = ${fmt(so.wn, 0)}\\ \\text{rad/s}, \\;\\zeta = ${fmt(so.zeta, 2)}\\ (${so.regime}) \\;\\to\\; \\text{con } R_a\\downarrow, L_a\\uparrow:\\ \\zeta = ${fmt(under.zeta, 2)}\\ (\\text{subamortiguado})`}
        takeaway="El motor de CC es un sistema de 2.º orden (dos almacenes de energía: La e J). ωn y ζ resumen su respuesta; ζ = 1 (crítico) es la más rápida sin oscilar. El control mueve los polos donde se quiera."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C10 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Laplace funde las dos ODE en <InlineMath latex="\Omega(s)/V_a(s)" />, de 2.º orden (La e J = dos almacenes de energía).</li>
          <li><InlineMath latex="\omega_n" /> (rapidez) y <InlineMath latex="\zeta" /> (amortiguamiento) resumen todo; ζ&gt;1 lento, ζ=1 crítico, ζ&lt;1 oscilatorio.</li>
          <li>Los polos (reales o complejos) son el ADN de la respuesta; el control los reubica.</li>
        </ul>
      </div>
    </section>
  )
}
