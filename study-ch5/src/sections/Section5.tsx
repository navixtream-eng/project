import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import OccSccLab from '../widgets/OccSccLab'
import {
  DEFAULT_OCC,
  extractTestResults,
  fmt,
  fmtDeg,
  sccCurrent,
  solveFromPf,
} from '../lib/machine'

/**
 * Sección 5 — Ensayos de circuito abierto y cortocircuito, y saturación
 * (FKU §5.3): cómo se le arrancan los parámetros a una máquina real.
 */
export default function Section5() {
  // Problema 8: los datos del enunciado y los resultados salen del MISMO
  // modelo del laboratorio (extractTestResults), anclados a 350 A ≙ AFNL.
  const XSU = 1.1
  const r = extractTestResults(DEFAULT_OCC, XSU)
  const AFNL_A = 350
  const AFSC_A = (AFNL_A * r.afsc) / r.afnl
  const AG_A = (AFNL_A * (1 / DEFAULT_OCC.k)) / r.afnl
  const iscAtAfnl = sccCurrent(r.afnl, DEFAULT_OCC, XSU)

  // Problema 9: el mismo punto de carga con las dos Xs
  const p9sat = solveFromPf(1, 0.9, 0.9, true, r.xsSat)
  const p9uns = solveFromPf(1, 0.9, 0.9, true, r.xsUnsat)

  return (
    <section id="seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 5</p>
        <h2 className="text-2xl font-black text-zinc-50">
          Ensayos OCC/SCC y saturación
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Hasta aquí, Xs cayó del cielo. En la vida real se mide — con dos ensayos de una sencillez
          brutal: dejar la máquina en vacío y ponerla en corto. La curva que se dobla y la recta que
          no, juntas, entregan todos los parámetros.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · El ensayo de circuito abierto: la curva que se dobla"
        idea="Gira la máquina a velocidad síncrona con los bornes al aire, sube la corriente de campo por escalones y anota la tensión. Al principio la curva es una recta (la «línea de entrehierro»); después se dobla: el hierro se satura y cada amperio extra de campo produce cada vez menos flujo."
        analogy="Una esponja bajo el grifo: seca, absorbe cada gota (tramo recto); a medio empapar, absorbe a regañadientes (el codo); empapada, el agua extra apenas entra (saturación). El «agua» es el flujo; la «esponja», el hierro; el tramo recto inicial existe porque la reluctancia del ENTREHIERRO — que es aire y no se satura jamás — domina el circuito magnético."
      >
        <p className="mb-2">
          La OCC es la huella dactilar magnética de la máquina: relaciona If con la FEM interna sin
          que la armadura intervenga (Ia = 0 ⇒ Voc = Eaf exactamente). Su tramo recto extrapolado es
          la <em>línea de entrehierro</em>: cómo respondería la máquina si el hierro fuera infinito
          de bueno.
        </p>
        <Formula
          latex="V_{oc}\big|_{I_a=0} = E_{af}(I_f) \qquad\qquad V_{ag} = k\,I_f\ \text{(línea de entrehierro)}"
          symbols={[
            { sym: 'V_{oc}', meaning: 'Tensión medida en bornes durante el ensayo. Sin corriente de armadura no hay caída en Xs: lo que mides ES la FEM interna.' },
            { sym: 'I_f', meaning: 'Corriente continua del devanado de campo: la variable independiente de ambos ensayos.' },
            { sym: 'V_{ag}', meaning: 'La recta que seguiría la tensión si solo existiera la reluctancia del entrehierro (aire, lineal siempre).' },
            { sym: 'k', meaning: 'Pendiente de la línea de entrehierro [pu de tensión por pu de campo]: la ganancia magnética de la máquina sin saturar.' },
          ]}
        />
      </ConceptBlock>

      <FeynmanCheck
        id="s5-check-occ"
        question="¿Por qué la OCC arranca perfectamente recta si el hierro es un material tan alineal?"
        options={[
          {
            label: 'Porque a baja excitación el flujo es pequeño y el hierro, lejos de saturar, es casi «gratis»: la reluctancia total la domina el ENTREHIERRO, que es aire y es lineal siempre.',
            correct: true,
            feedback:
              'El circuito magnético es hierro + entrehierro en serie. Sin saturar, la permeabilidad del hierro es tan alta que su reluctancia es despreciable: manda el aire, y el aire es rigurosamente lineal. Solo cuando el flujo crece, el hierro «se llena», su reluctancia se dispara y la curva se dobla apartándose de la línea de entrehierro.',
          },
          {
            label: 'Porque a baja If los instrumentos no resuelven la curvatura.',
            feedback:
              'Es física, no metrología: con flujo bajo el hierro opera en su zona de permeabilidad altísima y el circuito lo gobierna la reluctancia lineal del entrehierro. La recta es real.',
          },
          {
            label: 'No arranca recta: toda la curva es un arco suave.',
            feedback:
              'Mira el laboratorio: hasta ~0.5 pu de If, la OCC y la línea de entrehierro son indistinguibles. El tramo recto es tan real que se usa como referencia (de él sale la Xs no saturada).',
          },
        ]}
      />

      <ConceptBlock
        title="5.2 · El ensayo de cortocircuito: la recta que no se dobla"
        idea="Ahora los bornes en cortocircuito franco, girando a velocidad síncrona, y sube If midiendo la corriente de armadura. Resultado desconcertante: una RECTA perfecta hasta mucho más allá de la corriente nominal. ¿Dónde quedó la saturación? La reacción de armadura la canceló: en corto, la FMM de la armadura se opone casi exactamente a la del campo, el flujo resultante es minúsculo y el hierro ni se entera."
        analogy="Dos personas empujando una puerta giratoria en sentidos opuestos con fuerzas casi iguales: por más que ambas empujen fortísimo (If y la reacción de armadura enormes), la puerta apenas se mueve (flujo diminuto). La esponja nunca se moja — trabaja siempre en su tramo lineal."
      >
        <Formula
          latex="I_{sc}(I_f) = \frac{E_{ag}(I_f)}{X_{s,ag}} = \frac{k\,I_f}{X_{s,ag}} \quad\text{(lineal en } I_f\text{)}"
          symbols={[
            { sym: 'I_{sc}', meaning: 'Corriente de armadura de régimen medida en el ensayo (no confundir con la corriente transitoria de una falla real: aquí se sube If despacio).' },
            { sym: 'E_{ag}', meaning: 'La FEM se evalúa sobre la LÍNEA DE ENTREHIERRO, no sobre la OCC saturada: en corto la máquina está desaturada.' },
            { sym: 'X_{s,ag}', meaning: 'Reactancia sincrónica NO saturada: la que limita la corriente cuando el hierro trabaja en su zona lineal.' },
          ]}
        />
        <p>
          Esa cancelación es la clave de lectura de todo el ensayo: el cociente entre las dos curvas
          no es un número único, porque una satura y la otra no — y de esa asimetría nacen las{' '}
          <em>dos</em> reactancias de la sección siguiente.
        </p>
      </ConceptBlock>

      <OccSccLab />

      <FeynmanCheck
        id="s5-check-scc"
        question="En el ensayo de cortocircuito llevas If hasta el doble del valor nominal de campo. ¿Qué le pasa a la recta SCC?"
        options={[
          {
            label: 'Se dobla como la OCC: el doble de campo satura el hierro sí o sí.',
            feedback:
              'La saturación no depende de If sino del FLUJO — y en corto el flujo resultante es diminuto porque la reacción de armadura desmagnetiza casi todo. Duplicar If duplica también la corriente de armadura que se le opone: el flujo neto sigue siendo pequeño.',
          },
          {
            label: 'Sigue recta: el flujo neto es tan pequeño (reacción de armadura desmagnetizante) que el hierro nunca sale de su zona lineal.',
            correct: true,
            feedback:
              'Esa es la belleza del ensayo: en corto, la corriente es casi puramente inductiva y su FMM se opone frontalmente a la del campo. La máquina es internamente un forcejeo de FMMs gigantes con un flujo residual mínimo — el hierro trabaja frío y lineal, y la SCC es recta hasta donde el cobre aguante.',
          },
          {
            label: 'Se dobla hacia arriba: menos flujo = menos reactancia = más corriente por amperio de campo.',
            feedback:
              'La proporción Isc/If es constante justamente porque el sistema queda lineal de punta a punta: FEM de entrehierro lineal en If, dividida por una Xs constante (no saturada). Recta, ni más ni menos.',
          },
        ]}
      />

      <ConceptBlock
        title="5.3 · Dos reactancias y un número de mérito: la SCR"
        idea="Del par de ensayos salen DOS reactancias: la no saturada (línea de entrehierro ÷ SCC — constante) y la saturada (definida en el punto de tensión nominal: 1.0 pu ÷ Isc en AFNL — más pequeña, porque el hierro saturado produce menos flujo por amperio). Y un número de mérito: la relación de cortocircuito SCR = AFNL/AFSC, que en pu es exactamente 1/Xs,sat."
        analogy="Preguntarle la rigidez a un resorte que se endurece: la respuesta depende de cuánto lo tengas estirado. «¿Qué Xs uso?» tiene la misma respuesta: la del punto donde vas a trabajar — cerca de la tensión nominal, la saturada."
      >
        <Formula
          latex="X_{s,ag} = \frac{V_{ag}(I_f)}{I_{sc}(I_f)} \qquad X_{s,sat} = \frac{1.0\ \text{pu}}{I_{sc}(\text{AFNL})} \qquad \text{SCR} = \frac{\text{AFNL}}{\text{AFSC}} = \frac{1}{X_{s,sat}\,[\text{pu}]}"
          symbols={[
            { sym: '\\text{AFNL}', meaning: '«Amperios de campo a vacío nominal»: la If que produce 1.0 pu de tensión en circuito abierto. Se lee en la OCC.' },
            { sym: '\\text{AFSC}', meaning: '«Amperios de campo a corto nominal»: la If que produce 1.0 pu de corriente en cortocircuito. Se lee en la SCC.' },
            { sym: 'X_{s,sat}', meaning: 'La reactancia efectiva con el hierro saturado al nivel de la tensión nominal: la que se usa para estudios cerca del punto de operación normal.' },
            { sym: '\\text{SCR}', meaning: 'Relación de cortocircuito. SCR alta = Xs pequeña = máquina «rígida»: mucha corriente de falla y mucho margen de estabilidad, a cambio de más hierro y más costo.' },
          ]}
        />
        <p>
          La SCR condensa un compromiso de diseño completo en un solo número: las máquinas modernas
          se construyen con SCR cada vez más baja (Xs alta) porque el hierro es caro — pagando el
          precio en margen de estabilidad, exactamente el que mediste en la Sección 3.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="s5-check-xsat"
        question="El hierro se satura al nivel de tensión nominal. ¿La Xs efectiva de la máquina sube o baja respecto a la no saturada?"
        options={[
          {
            label: 'Sube: el hierro saturado «estorba» más al flujo.',
            feedback:
              'El estorbo es real (la reluctancia del circuito magnético sube), pero cuidado con qué mide Xs: es la TENSIÓN inducida por amperio de armadura. Menos flujo por amperio = menos tensión inducida por amperio = MENOS reactancia. El razonamiento correcto invierte la conclusión.',
          },
          {
            label: 'Baja: saturado, cada amperio produce menos flujo (menos enlaces de flujo por amperio = menos inductancia).',
            correct: true,
            feedback:
              'La inductancia ES enlaces de flujo por amperio (L = λ/i). Hierro saturado ⇒ menos λ por cada amperio ⇒ menos L ⇒ menos Xs. Por eso Xs,sat < Xs,ag — compruébalo en el laboratorio: el cociente Voc/Isc del cursor cae al subir If. Consecuencia práctica: la máquina saturada es algo MÁS rígida de lo que predice el valor no saturado.',
          },
          {
            label: 'No cambia: Xs es una constante constructiva de la máquina.',
            feedback:
              'Xs no es una constante grabada en la placa: es la pendiente local de una curva magnética alineal. Por eso el ensayo entrega dos valores y el ingeniero elige según el punto de trabajo.',
          },
        ]}
      />

      <SolvedProblem
        id="s5-problema-ensayos"
        numero="8"
        title="De las curvas de ensayo a los parámetros"
        statement={
          <>
            A un generador se le practican ambos ensayos a velocidad síncrona. Resultados: en{' '}
            <strong>circuito abierto</strong>, la tensión nominal se alcanza con If ={' '}
            <strong>{fmt(AFNL_A, 0)} A</strong> (la línea de entrehierro extrapolada la alcanzaría ya
            con {fmt(AG_A, 0)} A); en <strong>cortocircuito</strong>, la corriente nominal se alcanza
            con If = <strong>{fmt(AFSC_A, 0)} A</strong>. Halle Xs no saturada, Xs saturada y la SCR.
          </>
        }
        steps={[
          {
            title: 'Xs no saturada: línea de entrehierro ÷ SCC',
            why: 'En corto la máquina está desaturada, así que el numerador coherente es la LÍNEA DE ENTREHIERRO (no la OCC doblada). Evaluamos ambas rectas en la misma If — por ejemplo AFSC, donde Isc = 1.0 pu. En la línea de entrehierro, la tensión a AFSC es (AFSC/If_ag) × 1.0 pu.',
            work: `X_{s,ag} = \\frac{V_{ag}(\\text{AFSC})}{I_{sc}(\\text{AFSC})} = \\frac{${fmt(AFSC_A, 0)}/${fmt(AG_A, 0)}}{1.0} = ${fmt(r.xsUnsat, 2)}\\ \\text{pu}`,
            note: 'Como ambas características son rectas, este cociente da lo mismo en cualquier If: por eso la Xs no saturada es UN número y no una curva.',
          },
          {
            title: 'Xs saturada: la definición de FKU en el punto nominal',
            why: 'Para operar cerca de la tensión nominal interesa el hierro TAL COMO ESTÁ ahí: saturado al nivel de 1.0 pu. La receta: leer Isc a la If que da tensión nominal en vacío (AFNL) y dividir.',
            work: `I_{sc}(\\text{AFNL}) = 1.0 \\times \\frac{${fmt(AFNL_A, 0)}}{${fmt(AFSC_A, 0)}} = ${fmt(iscAtAfnl)}\\ \\text{pu} \\qquad X_{s,sat} = \\frac{1.0}{${fmt(iscAtAfnl)}} = ${fmt(r.xsSat, 3)}\\ \\text{pu}`,
          },
          {
            title: 'La SCR y su identidad con Xs saturada',
            why: 'La relación de cortocircuito es el cociente de los dos «amperajes de campo nominales». En por unidad es exactamente el recíproco de la Xs saturada — una verificación cruzada gratuita de todo el cálculo.',
            work: `\\text{SCR} = \\frac{\\text{AFNL}}{\\text{AFSC}} = \\frac{${fmt(AFNL_A, 0)}}{${fmt(AFSC_A, 0)}} = ${fmt(r.scr, 3)} = \\frac{1}{X_{s,sat}}\\ \\checkmark`,
          },
        ]}
        answer={`X_{s,ag} = ${fmt(r.xsUnsat, 2)}\\ \\text{pu} \\qquad X_{s,sat} = ${fmt(r.xsSat, 3)}\\ \\text{pu} \\qquad \\text{SCR} = ${fmt(r.scr, 3)}`}
        takeaway="Dos ensayos baratos (un voltímetro, un amperímetro y una mañana de trabajo) caracterizan una máquina de millones de dólares. Reproduce estos números en el laboratorio: son EXACTAMENTE su configuración por defecto."
      />

      <SolvedProblem
        id="s5-problema-comparacion"
        numero="9"
        title="¿Y qué tanto importa cuál Xs uses?"
        statement={
          <>
            Con la máquina del Problema 8 entregando Ia = 0.9 pu, fp = 0.9 en atraso, Vt = 1.0 pu,
            calcule Eaf y δ usando <strong>(a)</strong> la Xs saturada ({fmt(r.xsSat, 3)} pu) y{' '}
            <strong>(b)</strong> la no saturada ({fmt(r.xsUnsat, 2)} pu). Compare.
          </>
        }
        steps={[
          {
            title: '(a) Con la Xs saturada — el ritual de la Sección 2',
            why: 'Cerca de la tensión nominal el hierro ESTÁ saturado: este es el valor que corresponde al punto de operación real.',
            work: `\\hat{E}_{af} = 1 + j(${fmt(r.xsSat, 3)})(${fmt(p9sat.Ia.re)} - j\\,${fmt(-p9sat.Ia.im)}) = ${fmt(p9sat.EafMag)}\\,\\angle{${fmtDeg(p9sat.delta)}}\\ \\text{pu}`,
          },
          {
            title: '(b) Con la Xs no saturada',
            why: 'El mismo cálculo con el valor «optimista» de la línea de entrehierro, para dimensionar el error que se comete al ignorar la saturación.',
            work: `\\hat{E}_{af} = 1 + j(${fmt(r.xsUnsat, 2)})(${fmt(p9uns.Ia.re)} - j\\,${fmt(-p9uns.Ia.im)}) = ${fmt(p9uns.EafMag)}\\,\\angle{${fmtDeg(p9uns.delta)}}\\ \\text{pu}`,
          },
          {
            title: 'Comparar y decidir',
            why: 'La diferencia no es académica: sobreestimar Eaf significa exigirle al sistema de excitación una corriente de campo que quizá no tiene, y errar δ altera el margen de estabilidad calculado.',
            work: `\\Delta|E_{af}| = ${fmt(((p9uns.EafMag - p9sat.EafMag) / p9sat.EafMag) * 100, 1)}\\% \\qquad \\Delta\\delta = ${fmt(Math.abs(p9uns.delta - p9sat.delta) * (180 / Math.PI), 1)}^\\circ`,
            note: 'Regla práctica de FKU: para estudios de régimen permanente cerca de la tensión nominal, usa la Xs SATURADA; la no saturada queda para fenómenos donde el flujo colapsa (como el cortocircuito del ensayo… o del simulador SyncLab).',
          },
        ]}
        answer={`\\textbf{(a)}\\ ${fmt(p9sat.EafMag)}\\,\\angle{${fmtDeg(p9sat.delta)}} \\qquad \\textbf{(b)}\\ ${fmt(p9uns.EafMag)}\\,\\angle{${fmtDeg(p9uns.delta)}} \\quad (\\Delta \\approx ${fmt(((p9uns.EafMag - p9sat.EafMag) / p9sat.EafMag) * 100, 0)}\\%)`}
        takeaway="Elegir la reactancia equivocada mete errores de dos dígitos porcentuales en la excitación requerida. El parámetro correcto no es el «verdadero» — es el coherente con el estado magnético del punto de trabajo."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 5
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            OCC: en vacío, Voc = Eaf(If). Recta mientras manda el entrehierro (aire, lineal); se dobla
            cuando el hierro se llena — la esponja bajo el grifo.
          </li>
          <li>
            SCC: recta SIEMPRE, porque la reacción de armadura desmagnetiza el hierro — un forcejeo de
            FMMs gigantes con flujo diminuto.
          </li>
          <li>
            De su cociente salen dos reactancias — <InlineMath latex="X_{s,ag}" /> (línea de
            entrehierro ÷ SCC) y <InlineMath latex="X_{s,sat} = 1/\text{SCR}" /> (la del punto
            nominal, más pequeña) — y la regla: usa la coherente con el estado magnético del punto de
            trabajo.
          </li>
        </ul>
      </div>
    </section>
  )
}
