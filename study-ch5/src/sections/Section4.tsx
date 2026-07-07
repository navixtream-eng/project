import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import CapabilityLab from '../widgets/CapabilityLab'
import CondenserLab from '../widgets/CondenserLab'
import { fmt, fmtDeg, qMaxArmature, qMaxField, solveMotor, toDeg } from '../lib/machine'

/**
 * Sección 4 — Curvas de capacidad y el motor sincrónico (FKU §5.5 y §5.4
 * en modo motor): los límites reales de la máquina y su otra mitad de vida.
 */
export default function Section4() {
  // Problema 6: rango de Q disponible a P = 0.8 (números de la librería)
  const VT = 1.0
  const XS = 1.0
  const SMAX = 1.0
  const EAFMAX = 2.0
  const P6 = 0.8
  const qArm = qMaxArmature(P6, SMAX)! // 0.600
  const qFld = qMaxField(P6, VT, XS, EAFMAX)! // 0.833
  const qPlus = Math.min(qArm, qFld)
  const qStab = -(VT * VT) / XS // −1.0
  const qMinus = Math.max(-qArm, qStab) // −0.600

  // Problema 7: motor sobreexcitado compensando fp (convención motor)
  const P7 = 0.8
  const PF7 = 0.8
  const Q7 = P7 * Math.tan(Math.acos(PF7)) // 0.600 entregada
  const m = solveMotor(VT, P7, Q7, XS)
  const phi7 = Math.acos(PF7)

  return (
    <section id="seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 4</p>
        <h2 className="text-2xl font-black text-zinc-50">
          Curvas de capacidad y el motor sincrónico
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Las secciones anteriores dijeron qué PUEDE hacer la máquina; esta dice hasta dónde. Y de
          paso, la máquina revela su doble vida: motor de velocidad exacta y fábrica de reactivos.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · La carta de operación: los cuatro cercos"
        idea="Un generador no entrega cualquier pareja (P, Q): opera dentro de un corral en el plano P-Q delimitado por cuatro cercos físicos — el calentamiento del estator (|S| ≤ Smax), el calentamiento del rotor (|Eaf| ≤ Eaf,max), la estabilidad (δ < 90°) y el tope de la turbina (P ≤ Pm,max). El despachador de carga vive dentro de ese corral."
        analogy="Es el sobre de vuelo de un avión: velocidad y altitud no se eligen libremente — hay pérdida de sustentación por un lado, límite estructural por el otro y techo de motor arriba. Volar es navegar dentro del sobre; despachar un generador es exactamente igual."
      >
        <p className="mb-2">
          Dos de los cercos son círculos en el plano P-Q (¡por eso la carta se dibuja ahí!): el del
          estator está centrado en el origen; el del rotor, desplazado a Q = −Vt²/Xs:
        </p>
        <Formula
          latex="P^2 + Q^2 \le S_{max}^2 \qquad\qquad P^2 + \left(Q + \frac{V_t^2}{X_s}\right)^{\!2} \le \left(\frac{E_{af,max}\,V_t}{X_s}\right)^{\!2}"
          symbols={[
            { sym: 'S_{max}', meaning: 'Potencia aparente nominal: el límite térmico del COBRE DEL ESTATOR, porque |Ia| = |S|/Vt. Es un círculo centrado en el origen.' },
            { sym: 'E_{af,max}', meaning: 'FEM máxima sostenible: el límite térmico del DEVANADO DE CAMPO (corriente If máxima que el rotor puede disipar).' },
            { sym: '\\tfrac{V_t^2}{X_s}', meaning: 'El descentramiento del círculo de campo. También marca la frontera teórica de estabilidad: en δ = 90°, Q = −Vt²/Xs sin importar Eaf.' },
            { sym: 'Q', meaning: 'Positiva = sobreexcitado, entrega reactivos (zona derecha de la carta). Negativa = subexcitado, los absorbe (zona izquierda, la delicada).' },
          ]}
        />
        <p>
          La geometría cuenta la historia sola: hacia la derecha (mucha Q entregada) el círculo del
          rotor se cierra antes que el del estator — sobreexcitar cuesta corriente de campo. Hacia la
          izquierda, la frontera no es térmica sino de <em>estabilidad</em>: el precipicio de δ = 90°
          que conociste en la Sección 3.
        </p>
      </ConceptBlock>

      <CapabilityLab />

      <FeynmanCheck
        id="s4-check-limites"
        question="¿Por qué la frontera SOBREEXCITADA de la carta (mucha Q entregada) la fija el rotor y no el estator?"
        options={[
          {
            label: 'Porque la potencia reactiva calienta más el cobre del estator que la activa.',
            feedback:
              'Al estator le da igual de qué está hecha la corriente: solo ve |Ia| = |S|/Vt. Un ampere reactivo calienta el estator exactamente igual que uno activo — por eso SU límite es el círculo |S| = Smax, simétrico en P y Q.',
          },
          {
            label: 'Porque entregar mucha Q exige una Eaf grande, y Eaf se fabrica con corriente de campo — que calienta el ROTOR aunque |S| aún quepa en el estator.',
            correct: true,
            feedback:
              'Ahí está la asimetría de la carta: Q positiva empuja a Eaf hacia arriba (lo mediste en la curva V y en el readout «|Eaf| requerida» del laboratorio). El devanado de campo alcanza su tope térmico antes de que el estator proteste — el círculo rojo se cierra antes que el amarillo en la zona derecha.',
          },
          {
            label: 'Porque con mucha Q el ángulo δ crece hasta el límite de estabilidad.',
            feedback:
              'Al revés: entregar Q (sobreexcitar) REDUCE δ y aleja la máquina del precipicio — recuerda el Problema 4. La estabilidad es la frontera del lado IZQUIERDO (subexcitado), no del derecho.',
          },
        ]}
      />

      <SolvedProblem
        id="s4-problema-carta"
        numero="6"
        title="El rango de reactivos disponible a plena carga"
        statement={
          <>
            Generador con Smax = {fmt(SMAX, 1)} pu, Xs = {fmt(XS, 1)} pu, Vt = {fmt(VT, 1)} pu y
            excitación máxima <strong>Eaf,max = {fmt(EAFMAX, 1)} pu</strong>, despachado a{' '}
            <strong>P = {fmt(P6, 1)} pu</strong>. ¿Entre qué valores puede el operador mover la
            potencia reactiva Q?
          </>
        }
        steps={[
          {
            title: 'Cerco del estator a esta altura de P',
            why: 'A P fija, el círculo |S| = Smax deja una franja horizontal de Q disponible: ±√(Smax² − P²). Es simétrico — al cobre del estator le da igual el signo de Q.',
            work: `Q_{arm} = \\pm\\sqrt{S_{max}^2 - P^2} = \\pm\\sqrt{1 - ${fmt(P6 * P6, 2)}} = \\pm${fmt(qArm)}\\ \\text{pu}`,
          },
          {
            title: 'Cerco del rotor (solo muerde por la derecha)',
            why: 'El círculo de campo está descentrado a Q = −Vt²/Xs: su frontera derecha dice cuánta Q puede ENTREGARSE sin fundir el devanado de campo.',
            work: `Q_{campo} = -\\frac{V_t^2}{X_s} + \\sqrt{\\left(\\frac{E_{af,max}V_t}{X_s}\\right)^2 - P^2} = -1 + \\sqrt{4 - ${fmt(P6 * P6, 2)}} = ${fmt(qFld)}\\ \\text{pu}`,
          },
          {
            title: 'Intersectar los cercos y leer el rango',
            why: 'Cada frontera es un MÍNIMO entre cercos: manda el más restrictivo. A la derecha compiten estator (0.6) y rotor (0.833); a la izquierda, estator (−0.6) y estabilidad (−1.0).',
            work: `Q_{+} = \\min(${fmt(qArm)},\\ ${fmt(qFld)}) = ${fmt(qPlus)} \\qquad Q_{-} = \\max(-${fmt(qArm)},\\ ${fmt(Math.abs(qStab), 1)}\\cdot(-1)) = ${fmt(qMinus)}`,
            note: 'Con esta Eaf,max holgada, a P = 0.8 manda el ESTATOR por ambos lados. Baja Eaf,max a ~1.6 en el laboratorio y verás al rotor arrebatarle la frontera derecha.',
          },
        ]}
        answer={`Q \\in [${fmt(qMinus)},\\ ${fmt(qPlus)}]\\ \\text{pu a } P = ${fmt(P6, 1)}\\ \\text{pu}`}
        takeaway="La carta se lee por intersección: en cada punto de la frontera hay UN cerco activo, y saber cuál es te dice qué le duele a la máquina ahí (cobre de estator, cobre de rotor o margen de estabilidad). Reprodúcelo arrastrando el punto en el laboratorio a (0.8, ±0.6)."
      />

      <ConceptBlock
        title="4.2 · El motor sincrónico: el mismo resorte, del otro lado"
        idea="Nada nuevo que fabricar: invierte el flujo de potencia y el generador ES un motor. El campo giratorio ahora arrastra al rotor en vez de ser empujado por él: δ cambia de signo (Eaf ATRASA a Vt) y el resorte magnético tira en vez de empujar. La velocidad sigue clavada en nₛ — el único motor de velocidad exactamente constante."
        analogy="La misma correa elástica entre dos discos de la Sección 3: si tu disco empuja, eres generador; si te dejas arrastrar, eres motor. La correa (el campo) es la misma, solo cambia quién tira de quién — y el estiramiento (δ) apunta al revés."
      >
        <p className="mb-2">
          En convención de motor (la corriente entra por el borne positivo), la ley de Kirchhoff se
          reescribe despejando la tensión de la red:
        </p>
        <Formula
          latex="\hat{V}_t = \hat{E}_{af} + jX_s\,\hat{I}_a \qquad\Leftrightarrow\qquad \hat{E}_{af} = \hat{V}_t - jX_s\,\hat{I}_a,\quad \delta < 0"
          symbols={[
            { sym: '\\delta < 0', meaning: 'La firma del motor: el rotor (Eaf) va DETRÁS del campo del estator. La potencia P = (Eaf·Vt/Xs)·sen δ sale negativa — fluye de la red hacia el eje.' },
            { sym: '\\hat{I}_a', meaning: 'Ahora se mide ENTRANDO al motor. Si además va en adelanto respecto a Vt, el motor sobreexcitado entrega Q mientras consume P: hace dos trabajos a la vez.' },
          ]}
        />
        <p>
          Todo lo aprendido se hereda con espejo: la curva P-δ vale con δ negativo, la curva V es
          idéntica, y la carta de operación tiene su gemela bajo el eje Q. Por eso FKU trata ambos
          modos en un solo capítulo — es <em>una</em> máquina con dos oficios.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="s4-check-motor"
        question="Un motor sincrónico arrastra su carga en régimen permanente. ¿Dónde está el rotor respecto al campo giratorio del estator?"
        options={[
          {
            label: 'Adelante, como en el generador: el rotor siempre lidera.',
            feedback:
              'En el generador el rotor lidera porque la turbina lo EMPUJA contra el resorte magnético. En el motor la energía va al revés: es el campo el que tira del rotor — y el que tira va adelante.',
          },
          {
            label: 'Detrás (δ < 0): el campo del estator lo arrastra, y el atraso crece con la carga en el eje.',
            correct: true,
            feedback:
              'El resorte de torsión trabaja en espejo: más par resistente en el eje, más se estira la correa magnética (δ más negativo), hasta el mismo límite de |δ| = 90° — pasado ese punto el motor «pierde el paso» y se detiene entre sacudidas violentas.',
          },
          {
            label: 'Exactamente alineado: si no, no sería sincrónico.',
            feedback:
              'Sincrónico significa MISMA VELOCIDAD, no mismo ángulo. Sin desalineación no hay par: δ = 0 es la máquina en vacío ideal. El ángulo es precisamente el mecanismo de transmisión del par.',
          },
        ]}
      />

      <ConceptBlock
        title="4.3 · El condensador sincrónico: reactivos con perilla"
        idea="Un motor sincrónico girando en vacío no produce nada mecánico — y justo por eso es útil: con P = 0, TODA su corriente es reactiva, y su signo y magnitud se controlan con la excitación. Es un capacitor (o inductor) gigante cuya «capacitancia» se ajusta girando una perilla de corriente continua."
        analogy="Un empleado sin tareas asignadas pero de guardia: no produce, pero absorbe o entrega lo que la oficina necesite en el momento. Las redes los instalan (o reutilizan viejas centrales) exactamente para eso: sostener la tensión entregando Q donde falta."
      >
        <CondenserLab />
      </ConceptBlock>

      <FeynmanCheck
        id="s4-check-condensador"
        question="Motor sincrónico en vacío, sobreexcitado (Eaf > Vt). Visto desde la red, ¿a qué equivale?"
        options={[
          {
            label: 'A un capacitor: corriente 90° en adelanto, entrega Q — y ajustable con la corriente de campo.',
            correct: true,
            feedback:
              'Con δ = 0 y Eaf > Vt, la corriente Ia = (Eaf−Vt)/jXs queda perpendicular exacta a Vt y la máquina inyecta Q = Vt(Eaf−Vt)/Xs. A diferencia de un banco de capacitores (escalones fijos), aquí Q es CONTINUA y reversible: gira la perilla de If y pasas de capacitor a inductor.',
          },
          {
            label: 'A una resistencia pequeña: algo consume por pérdidas.',
            feedback:
              'Las pérdidas reales existen pero son ínfimas comparadas con la Q que maneja. El modelo ideal (P = 0) captura lo esencial: corriente puramente reactiva, perpendicular a Vt.',
          },
          {
            label: 'A un inductor: toda máquina con devanados absorbe reactivos.',
            feedback:
              'SUBexcitada sí (Eaf < Vt absorbe Q, como inductor). Pero sobreexcitada la FEM interna «empuja» reactivos hacia la red: capacitor. El signo lo decide la excitación, no la naturaleza de los devanados — esa es la gracia del aparato.',
          },
        ]}
      />

      <SolvedProblem
        id="s4-problema-motor"
        numero="7"
        title="Motor sincrónico como compensador de la planta"
        statement={
          <>
            Un motor sincrónico (Xs = {fmt(XS, 1)} pu, Vt = {fmt(VT, 1)} pu) mueve un compresor que
            absorbe <strong>P = {fmt(P7, 1)} pu</strong>. Se le sobreexcita para que además opere con{' '}
            <strong>fp = {fmt(PF7, 1)} en adelanto</strong>, compensando los reactivos de la planta.
            Halle la Q que entrega, el fasor de corriente, Eaf y δ.
          </>
        }
        steps={[
          {
            title: 'Traducir el fp en adelanto a Q entregada',
            why: 'En un motor, «fp en adelanto» significa que ADEMÁS de consumir P, entrega Q a la red (sobreexcitado). El triángulo de potencias da la Q comprometida.',
            work: `\\varphi = \\arccos(${fmt(PF7, 1)}) = ${fmtDeg(phi7)} \\qquad Q = P\\,\\tan\\varphi = ${fmt(P7, 1)} \\times ${fmt(Math.tan(phi7))} = ${fmt(Q7)}\\ \\text{pu}`,
          },
          {
            title: 'El fasor de corriente (entrando al motor, en adelanto)',
            why: 'Con Vt de referencia y S = P − jQ absorbida-entregada, la corriente que ENTRA al motor adelanta a la tensión — la firma visible de la sobreexcitación.',
            work: `\\hat{I}_a = ${fmt(Math.hypot(P7, Q7), 1)}\\,\\angle{+${fmt(toDeg(phi7), 1)}^\\circ} = ${fmt(P7, 1)} + j\\,${fmt(Q7)}\\ \\text{pu}`,
          },
          {
            title: 'KVL en convención motor: Eaf = Vt − jXs·Ia',
            why: 'El mismo ritual de la Sección 2, con el signo del motor: la caída se RESTA. Girar +90° la corriente adelantada arroja una componente real positiva y una imaginaria negativa: Eaf cae DETRÁS de Vt.',
            work: `\\hat{E}_{af} = 1 - j(1)(${fmt(P7, 1)} + j\\,${fmt(Q7)}) = ${fmt(m.Eaf.re)} - j\\,${fmt(-m.Eaf.im)} = ${fmt(m.EafMag)}\\,\\angle{${fmtDeg(m.delta)}}\\ \\text{pu}`,
            note: `δ = ${fmt(toDeg(m.delta), 1)}° — negativo, como debía: el rotor va detrás del campo, arrastrado. Y |Eaf| = ${fmt(m.EafMag)} > 1: sobreexcitado, coherente con el fp en adelanto.`,
          },
        ]}
        answer={`Q = ${fmt(Q7)}\\ \\text{pu entregada} \\qquad \\hat{E}_{af} = ${fmt(m.EafMag)}\\,\\angle{${fmtDeg(m.delta)}}\\ \\text{pu} \\qquad \\delta = ${fmtDeg(m.delta)}`}
        takeaway="Un solo equipo hace dos trabajos: mueve el compresor Y corrige el factor de potencia de toda la planta — por eso la industria paga el sobreprecio del motor sincrónico frente al de inducción. El cálculo es el ritual de siempre con un signo espejado: Eaf = Vt − jXs·Ia y δ < 0."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            La carta de operación es el corral (P, Q) entre cuatro cercos: estator (círculo{' '}
            <InlineMath latex="|S| \le S_{max}" />), rotor (círculo de <InlineMath latex="E_{af,max}" />{' '}
            descentrado a −Vt²/Xs), estabilidad (δ = 90°) y turbina. En cada tramo de frontera manda
            un cerco distinto — y te dice qué le duele a la máquina ahí.
          </li>
          <li>
            Motor = generador en espejo: <InlineMath latex="\hat{E}_{af} = \hat{V}_t - jX_s\hat{I}_a" />,
            δ &lt; 0, el campo arrastra al rotor. Mismas curvas, mismo límite de 90°, misma álgebra.
          </li>
          <li>
            En vacío (P = 0) la máquina queda reducida a su esencia reactiva: condensador o inductor
            giratorio con Q = Vt(Eaf−Vt)/Xs, gobernada por una perilla de corriente continua.
          </li>
        </ul>
      </div>
    </section>
  )
}
