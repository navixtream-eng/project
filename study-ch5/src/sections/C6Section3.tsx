import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import SwingLab from '../widgets/SwingLab'
import EqualAreaLab from '../widgets/EqualAreaLab'
import { criticalClearingTime, fmt, pMax, solveFromPQ, toDeg } from '../lib/machine'

/**
 * Capítulo 6, Sección 3 — Dinámica y estabilidad: el modelo E' tras X'd,
 * la ecuación de oscilación y el tiempo crítico de despeje.
 */
export default function C6Section3() {
  // Problema 14: los números del laboratorio (mismos parámetros por defecto)
  const VT = 1.0
  const XD1 = 0.3
  const D = 0.15
  const F = 60
  const PM = 0.9
  const H1 = 3.5
  const H2 = 7.0
  const Q = PM * Math.tan(Math.acos(0.9))
  const ep = solveFromPQ(VT, PM, Q, XD1)
  const pmaxTr = pMax(ep.EafMag, VT, XD1)
  const delta0 = Math.asin(PM / pmaxTr)
  const tcr1 = criticalClearingTime(PM, ep.EafMag, VT, XD1, H1, D, F)!
  const tcr2 = criticalClearingTime(PM, ep.EafMag, VT, XD1, H2, D, F)!

  return (
    <section id="c6-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
          Capítulo 6 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Dinámica y estabilidad: E′ tras X′d y la ecuación de oscilación
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Todo el capítulo converge aquí: el flujo atrapado (S1) presta la curva P-δ transitoria, la
          falla (S2) descarga al rotor, y la pregunta final es de vida o muerte eléctrica —
          ¿las protecciones llegan antes que el deslizamiento de polos?
        </p>
      </header>

      <ConceptBlock
        title="3.1 · El modelo para estudios de estabilidad"
        idea="Para estudiar la estabilidad de un sistema con decenas de máquinas no hace falta el modelo completo: basta representar cada generador como su tensión congelada E′ detrás de X′d, y dejar que la única dinámica sea la MECÁNICA del rotor — la ecuación de oscilación. Dos números eléctricos y una ley de Newton rotacional."
        analogy="El médico de urgencias no pide el genoma del paciente: pulso y presión. E′ y X′d son el pulso y la presión del generador durante los primeros cientos de milisegundos — que es exactamente la ventana donde se decide la estabilidad."
      >
        <Formula
          latex="\frac{2H}{\omega_s}\,\frac{d^2\delta}{dt^2} = P_m - P_e - D\,\frac{\Delta\omega}{\omega_s} \qquad P_e = \frac{E'\,V_t}{X'_d}\,\text{sen}\,\delta"
          symbols={[
            { sym: 'H', meaning: 'Constante de inercia [s]: energía cinética almacenada a velocidad nominal / potencia base. El «peso» del rotor en unidades eléctricas: H grande = rotor difícil de acelerar.' },
            { sym: '\\delta', meaning: 'El mismo ángulo de carga del Capítulo 5 — pero ahora es una VARIABLE DINÁMICA gobernada por una ecuación diferencial, no un punto de equilibrio.' },
            { sym: 'P_m - P_e', meaning: 'El desbalance que acelera o frena: durante una falla trifásica en bornes Pe = 0 y TODA Pm empuja al rotor hacia adelante.' },
            { sym: 'D', meaning: 'El amortiguamiento — cortesía de los devanados amortiguadores de la Sección 2. Sin él, cada oscilación duraría para siempre.' },
            { sym: "E'/X'_d", meaning: 'La curva P-δ transitoria (Problema 12): más alta que la de régimen. Es el resorte con el que el rotor pelea su regreso.' },
          ]}
        />
        <p className="mb-2">
          El guion de una falla, en tres actos: <strong>(1)</strong> falla en bornes ⇒ Pe = 0 ⇒ el
          rotor acelera y δ trepa (gana energía cinética); <strong>(2)</strong> despeje en t_clear ⇒
          reaparece la curva P-δ transitoria y, si δ aún está del lado bueno, Pe &gt; Pm frena al
          rotor; <strong>(3)</strong> o el frenado alcanza antes de δ ≈ 180° (oscila y se amortigua) o
          no alcanza (desliza polos). La frontera entre ambos destinos es el{' '}
          <strong>tiempo crítico de despeje t_cr</strong>.
        </p>
      </ConceptBlock>

      <SwingLab />

      <FeynmanCheck
        id="c6s3-check-transitoria"
        question="En los estudios de estabilidad se usa la curva P-δ con E′/X′d y no la de régimen con Eaf/Xd. ¿Por qué es esa la correcta durante el transitorio?"
        options={[
          {
            label: 'Por conservadurismo: E′/X′d da una curva más baja y deja margen de seguridad.',
            feedback:
              'Es al revés: la curva transitoria es más ALTA (X′d ≪ Xd gana sobre E′ < Eaf — lo calculaste en el Problema 12). No es pesimismo prudente: es la física del primer medio segundo.',
          },
          {
            label: 'Porque durante el primer medio segundo el flujo del campo está atrapado (λf continuo): la tensión interna efectiva es la E′ congelada, vista tras la reactancia transitoria.',
            correct: true,
            feedback:
              'El teorema del flujo (S1) elige el modelo: mientras T′d no agote el refuerzo del campo, la máquina ES «E′ tras X′d». Y la ventana de decisión de la estabilidad (el primer vaivén de δ, ~0.5–1 s) cabe dentro de esa vigencia. Para estudios largos (varios segundos) los modelos agregan el decaimiento de E′ y el regulador de tensión — pero el primer vaivén, que suele decidirlo todo, se juega con E′ constante.',
          },
          {
            label: 'Porque Xd solo vale para máquinas de polos salientes.',
            feedback:
              'Xd es la reactancia sincrónica de cualquier máquina (cilíndrica o saliente). La elección E′/X′d vs Eaf/Xd no distingue geometrías: distingue ESCALAS DE TIEMPO — transitorio vs régimen.',
          },
        ]}
      />

      <FeynmanCheck
        id="c6s3-check-tcr"
        question="Predice antes de tocar el slider H: si duplicas la inercia del rotor (H: 3.5 → 7 s), ¿el tiempo crítico de despeje se duplica?"
        options={[
          {
            label: 'Sí, exactamente: el doble de inercia aguanta el doble de tiempo.',
            feedback:
              'Casi — pero la cinemática dice otra cosa: con Pe = 0 la aceleración es constante (∝ 1/H) y el ángulo crece con t². Para llegar al MISMO δ crítico: t ∝ √H. Duplicar H no duplica el tiempo: lo multiplica por √2 ≈ 1.41.',
          },
          {
            label: 'Crece, pero solo ≈ √2 veces: durante la falla δ crece con t² (aceleración constante ∝ 1/H), así que el tiempo para alcanzar el mismo ángulo crítico escala con √H.',
            correct: true,
            feedback:
              'δ(t) ≈ δ₀ + (ωs·Pm/4H)·t² durante la falla ⇒ t_cr ∝ √H con el mismo δ crítico. Verifícalo en el laboratorio: duplica H y compara los t_cr. Es la razón por la que la inercia ayuda pero no rescata: para GRANDES márgenes hay que despejar más rápido o descargar la máquina, no solo agrandar el volante.',
          },
          {
            label: 'No cambia: t_cr depende solo del ángulo crítico, no de la inercia.',
            feedback:
              'El ÁNGULO crítico no depende de H (es geometría de áreas en la curva P-δ) — pero el TIEMPO para llegar a él sí: un rotor pesado tarda más en recorrer el mismo arco. δ_cr fijo + aceleración ∝ 1/H ⇒ t_cr ∝ √H.',
          },
        ]}
      />

      <ConceptBlock
        title="3.2 · El criterio de áreas iguales: la contabilidad energética"
        idea="No hace falta integrar la ecuación de oscilación para saber el destino del rotor: basta un balance de energía sobre la curva P-δ. Durante la falla (Pe = 0), todo el exceso Pm se deposita como energía cinética — el área A1 bajo la recta Pm. Tras el despeje, el rotor dispone del área A2 (entre la curva y Pm, hasta δu) para devolver ese depósito frenando. Si A1 ≤ A2, sobrevive; si el depósito no cabe, cruza δu y desliza polos."
        analogy="Un ciclista que baja una pendiente sin frenos (la falla) y debe detenerse en la contrapendiente que sigue (el frenado post-despeje). La energía que ganó bajando tiene que caber en la subida disponible: si la bajada fue demasiado larga (despeje tardío), ninguna contrapendiente lo salva — pasa la cresta δu y ya no hay regreso."
      >
        <p className="mb-2">
          Con Pe = 0 durante la falla, las dos cuentas — y el ángulo crítico donde empatan — tienen
          forma cerrada:
        </p>
        <Formula
          latex="\underbrace{P_m(\delta_{cl}-\delta_0)}_{A_1} \;=\; \underbrace{P_{max}(\cos\delta_{cl}-\cos\delta_u) - P_m(\delta_u-\delta_{cl})}_{A_2} \;\;\Rightarrow\;\; \cos\delta_{cr} = \cos\delta_u + \frac{P_m}{P_{max}}(\delta_u-\delta_0)"
          symbols={[
            { sym: 'A_1', meaning: 'Energía cinética depositada en el rotor durante la falla [pu·rad]: el rectángulo bajo Pm entre δ0 y el despeje. Crece con la duración de la falla — es la cuenta del enemigo.' },
            { sym: 'A_2', meaning: 'Capacidad de frenado post-falla: el área entre la curva Pe(δ) y Pm hasta el equilibrio inestable δu = π − δ0. Es todo el presupuesto disponible — más allá de δu, la curva cae por debajo de Pm y el «freno» se convierte en acelerador.' },
            { sym: '\\delta_{cr}', meaning: 'El ángulo de despeje donde A1 = A2 exactamente: la frontera geométrica de la estabilidad. Despejar antes = sobrevivir; después = deslizar polos.' },
          ]}
        />
        <p>
          Y la joya del caso Pe = 0: como la aceleración es constante durante la falla, δcr se
          traduce a tiempo con una fórmula exacta —{' '}
          <InlineMath latex="t_{cr} = \sqrt{4H(\delta_{cr}-\delta_0)/(\omega_s P_m)}" /> — el mismo
          número que el laboratorio de oscilación encontró por fuerza bruta con RK4. Dos caminos
          (energía y integración), una sola respuesta: así se sabe que ambos están bien.
        </p>
        <EqualAreaLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c6s3-check-areas"
        question="En el criterio de áreas iguales, ¿por qué el «presupuesto de frenado» A2 termina exactamente en δu = 180° − δ0 y ni un grado más allá?"
        options={[
          {
            label: 'Porque a 180° la máquina se desconecta automáticamente.',
            feedback:
              'No hay ningún interruptor en δu — es una frontera de la FÍSICA, no de la protección. Mira la curva: ¿qué pasa con Pe respecto a Pm justo después de δu?',
          },
          {
            label: 'Porque pasado δu la curva Pe cae por debajo de Pm otra vez: el freno (Pe > Pm) se convierte en acelerador (Pm > Pe) y ya nada puede detener al rotor.',
            correct: true,
            feedback:
              'Exacto: δu es el segundo cruce de Pm con la curva — el equilibrio INESTABLE. Entre δcl y δu, Pe > Pm frena; más allá, el desbalance cambia de signo y empuja hacia adelante para siempre. Por eso A2 se integra solo hasta δu: es literalmente todo el frenado que el universo ofrece. Si la energía A1 no cabe ahí, el destino está sellado aunque el rotor aún no haya llegado a δu.',
          },
          {
            label: 'Porque el seno es máximo en 90° y después ya no hay potencia.',
            feedback:
              'Después de 90° la potencia BAJA pero sigue existiendo — y sigue frenando mientras Pe > Pm. El frenado no termina en la cresta: termina donde la curva vuelve a cruzar a Pm, en δu = 180° − δ0.',
          },
        ]}
      />

      <SolvedProblem
        id="c6s3-problema-estabilidad"
        numero="14"
        title="El presupuesto de tiempo de las protecciones"
        statement={
          <>
            El generador del Problema 12 (E′ = {fmt(ep.EafMag)} pu tras X′d = {fmt(XD1, 1)} pu) opera
            con <strong>Pm = {fmt(PM, 1)} pu</strong> y H = {fmt(H1, 1)} s cuando sufre una falla
            trifásica en bornes. Halle: <strong>(a)</strong> δ₀ y la Pmax transitoria,{' '}
            <strong>(b)</strong> el tiempo crítico de despeje, <strong>(c)</strong> el t_cr si la
            máquina tuviera H = {fmt(H2, 1)} s, verificando la regla √H.
          </>
        }
        steps={[
          {
            title: '(a) El punto de partida sobre la curva transitoria',
            why: 'El rotor arranca su carrera desde el δ₀ de equilibrio pre-falla — pero sobre la curva TRANSITORIA (E′/X′d), que es la vigente durante el evento.',
            work: `P_{max}^{tr} = \\frac{${fmt(ep.EafMag)} \\times 1}{${fmt(XD1, 1)}} = ${fmt(pmaxTr, 2)}\\ \\text{pu} \\qquad \\delta_0 = \\text{arcsen}\\!\\left(\\frac{${fmt(PM, 1)}}{${fmt(pmaxTr, 2)}}\\right) = ${fmt(toDeg(delta0), 1)}^\\circ`,
          },
          {
            title: '(b) t_cr por integración de la ecuación de oscilación',
            why: 'Durante la falla Pe = 0 y δ trepa con t²; tras el despeje decide la carrera entre la energía cinética ganada y el frenado disponible. La frontera exacta se encuentra por bisección sobre el integrador RK4 — el mismo método del laboratorio.',
            work: `t_{cr}(H = ${fmt(H1, 1)}) = ${fmt(tcr1, 3)}\\ \\text{s} \\;(\\approx ${fmt(tcr1 * 60, 0)}\\ \\text{ciclos de 60 Hz})`,
            note: 'Ese es el presupuesto TOTAL para que relé + interruptor detecten y despejen. Las protecciones modernas usan 3–6 ciclos (0.05–0.1 s): el margen existe, pero no es infinito.',
          },
          {
            title: '(c) Duplicar la inercia y verificar la regla √H',
            why: 'Con aceleración ∝ 1/H durante la falla y el mismo δ crítico como meta, el tiempo escala con la raíz de la inercia — no linealmente.',
            work: `t_{cr}(H = ${fmt(H2, 1)}) = ${fmt(tcr2, 3)}\\ \\text{s} \\qquad \\frac{${fmt(tcr2, 3)}}{${fmt(tcr1, 3)}} = ${fmt(tcr2 / tcr1, 2)} \\approx \\sqrt{2} = ${fmt(Math.SQRT2, 2)}\\ \\checkmark`,
          },
        ]}
        answer={`\\delta_0 = ${fmt(toDeg(delta0), 1)}^\\circ \\qquad t_{cr} = ${fmt(tcr1, 3)}\\ \\text{s}\\ (H=${fmt(H1, 1)}) \\qquad t_{cr} = ${fmt(tcr2, 3)}\\ \\text{s}\\ (H=${fmt(H2, 1)}) \\;\\propto \\sqrt{H}\\ \\checkmark`}
        takeaway="La estabilidad transitoria es una carrera contra reloj con presupuesto calculable: t_cr. Reproduce estos números en el laboratorio (son sus valores por defecto) — y para el cuadro completo con corrientes, fasores animados y criterio de áreas iguales, abre el simulador SyncLab: usa exactamente esta misma física."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C6 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Modelo de urgencias: E′ congelada tras X′d + ecuación de oscilación{' '}
            <InlineMath latex="(2H/\omega_s)\ddot{\delta} = P_m - P_e - D\Delta\omega/\omega_s" />.
            Dos números eléctricos y Newton rotacional.
          </li>
          <li>
            El guion de la falla: Pe = 0 ⇒ δ trepa con t² ⇒ despeje ⇒ carrera entre frenado y 180°.
            La frontera es t_cr — el presupuesto de las protecciones — y escala con √H.
          </li>
          <li>
            Los tres pilares del capítulo trabajan juntos aquí: el flujo atrapado presta la curva alta
            (S1), la falla descarga al rotor (S2) y los amortiguadores apagan el vaivén superviviente.
          </li>
        </ul>
      </div>
    </section>
  )
}
