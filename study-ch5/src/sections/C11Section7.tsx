import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DyShiftLab from '../widgets/DyShiftLab'
import EvolvingFaultLab from '../widgets/EvolvingFaultLab'
import { fmt } from '../lib/machine'

/** Capítulo 11, Sección 7 — Desfases del banco, motores en la falla y fallas que evolucionan. */
export default function C11Section7() {
  // Problema 57: SLG a través del Dyn1
  const if57 = 3 / (0.2 + 0.2 + 0.08)
  const iDelta = if57 / Math.sqrt(3)

  // Problema 58: aporte del motor con cambio de base
  const iRed = 1 / 0.15
  const xMot = 0.2 * (10 / 2)
  const iMot = 1 / xMot
  const total = iRed + iMot

  return (
    <section id="c11-seccion-7" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 7
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Los refinamientos: desfases, motores y fallas que evolucionan
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Tres verdades del mundo real que separan al que aprobó el curso del que ajusta
          protecciones: la falla CAMBIA DE FORMA al cruzar un banco Δ-Y, los motores devuelven
          corriente, y las fallas no se quedan quietas — evolucionan de un arco a tierra al
          trifásico en décimas de segundo.
        </p>
      </header>

      <ConceptBlock
        title="7.1 · El ±30° del grupo vectorial, aplicado a las secuencias"
        idea="Un banco Dyn1 desfasa la secuencia POSITIVA +30° y la NEGATIVA −30° — signos OPUESTOS (la negativa es un sistema a-c-b: el mismo conexionado la gira al revés). La cero, ya lo sabes, ni cruza. Consecuencia espectacular: una falla monofásica del lado Yg (patrón If, 0, 0) aparece del lado delta como un patrón BIFÁSICO (If/√3, 0, If/√3) con residual cero. La falla no solo se atenúa al cruzar: se TRANSFIGURA. Todo relé, todo ajuste y todo oscilograma del otro lado del banco se lee con esta transformación en mente."
        analogy="Como un prisma con la luz: el rayo entra blanco (la falla original) y sale descompuesto y desviado — y cada color (secuencia) se desvía con su propio ángulo. Quien mira del otro lado del prisma no ve «la misma luz más débil»: ve otra figura, y debe saber de óptica para reconstruir la original."
      >
        <Formula
          latex="\hat I_1' = \hat I_1\,e^{+j30^\circ} \qquad \hat I_2' = \hat I_2\,e^{-j30^\circ} \qquad \hat I_0' = 0 \;\;\Rightarrow\;\; (I_f,0,0)_{Yg} \to \left(\tfrac{I_f}{\sqrt 3},\,0,\,\tfrac{I_f}{\sqrt 3}\right)_\Delta"
          symbols={[
            { sym: 'e^{\\pm j30^\\circ}', meaning: 'El desfase del grupo (Dyn1 = 30°). El signo OPUESTO para la negativa es lo no obvio: ambas secuencias giran, pero en sentidos contrarios — olvidarlo arruina el cálculo de corrientes a través del banco.' },
            { sym: '(I_f/\\sqrt 3, 0, I_f/\\sqrt 3)', meaning: 'El patrón transformado de la SLG: dos fases vivas y una muerta — parece L-L. Un relé de fase del lado delta la ve √3 veces más chica; uno de tierra, no la ve en absoluto.' },
          ]}
        />
      </ConceptBlock>

      <DyShiftLab />

      <ConceptBlock
        title="7.2 · Fallas evolutivas y fallas en dos puntos"
        idea="Una falla real rara vez nace trifásica: empieza como un arco a tierra (SLG resistiva), el arco ioniza el aire y toca la fase vecina (LLG), y el plasma termina envolviendo las tres (3φ). Cada etapa tiene sus corrientes y su firma de secuencias — y la protección corre una carrera contra la evolución: despejar en la etapa SLG cuesta un recierre; despejar en la 3φ cuesta un interruptor al límite. El pariente topológico es la falla en DOS PUNTOS (cross-country): típica de sistemas aislados/compensados, donde la primera falla a tierra no se despeja (Sección 2) y una segunda aparece en OTRA fase y OTRO lugar — se analiza conectando las redes de secuencia en dos puntos simultáneamente, con matrices de dos puertos: el mismo método de este capítulo, con más contabilidad."
        analogy="Un incendio: la chispa (SLG) se apaga con un vaso de agua si llegas en segundos; el cuarto en llamas (LLG) exige extintor; la casa completa (3φ), a los bomberos. El tiempo de detección no es un detalle del sistema de alarmas — ES la diferencia entre las tres facturas."
      >
        <p>
          La firma del registro real: el residual 3I₀ <em>sube</em> con la SLG, <em>crece</em> en la
          LLG… y <em>muere</em> al llegar la 3φ (balanceada). Un oscilograma donde el 3I₀ aparece y
          luego desaparece mientras las corrientes de fase explotan cuenta la evolución completa —
          leerlo es análisis de secuencias aplicado forense.
        </p>
      </ConceptBlock>

      <EvolvingFaultLab />

      <FeynmanCheck
        id="c11s7-check-desfase"
        question="Una SLG franca del lado Yg de un Dyn1. Del lado delta hay un relé de tierra (51N) bien ajustado y sensible. ¿Qué registra durante la falla?"
        options={[
          {
            label: 'Nada: la secuencia cero no cruza el banco — el residual del lado delta es cero, y la falla aparece allá como un patrón bifásico (If/√3 en dos fases) que solo los relés de FASE pueden ver.',
            correct: true,
            feedback:
              'Correcto — y es diseño, no defecto: la delta parte el sistema en zonas de tierra independientes. La protección de tierra de cada zona vigila SOLO su zona; los respaldos entre zonas son de fase.',
          },
          {
            label: 'La misma corriente de falla dividida por la relación de vueltas.',
            feedback:
              'Las magnitudes escalan con la relación, sí — pero el residual no se «escala»: se ANULA, porque I₀ no tiene camino a través de la delta.',
          },
          {
            label: 'Una corriente √3 veces mayor.',
            feedback:
              'Al revés: las fases vivas del lado delta llevan If/√3 — y el residual, cero. El banco atenúa Y transfigura.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s7-check-evolutiva"
        question="En el registro de una falla ves: 3I₀ arranca en 4 pu, sube a 7 pu a los 150 ms, y cae a CERO a los 300 ms mientras las tres corrientes de fase saltan a 6 pu. ¿Qué pasó?"
        options={[
          {
            label: 'Una falla evolutiva completa: SLG (residual presente) → LLG (residual mayor) → trifásica (residual cero por balanceada). El 3I₀ que desaparece con las fases al máximo es la firma inconfundible.',
            correct: true,
            feedback:
              'Análisis forense de secuencias: el residual es el narrador de la historia de tierra. Su muerte súbita con corrientes máximas = la falla «se completó». Los registradores de fallas se leen exactamente así.',
          },
          {
            label: 'El relé de tierra falló y dejó de medir.',
            feedback:
              'Un canal muerto no coincidiría exactamente con el salto de las fases a 6 pu balanceadas: la física (falla ya trifásica → I₀ = 0) explica todo sin suponer averías.',
          },
          {
            label: 'La falla se extinguió sola a los 300 ms.',
            feedback:
              'Con las corrientes de fase en 6 pu nada se extinguió — lo que terminó fue el DESBALANCE, no la falla.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s7-problema-dy"
        numero="57"
        title="La SLG que cruza el banco"
        statement={
          <>
            Sistema con X₁ = X₂ = 0.20 pu, X₀ = 0.08 pu en el lado Yg de un banco Dyn1. Ocurre una
            SLG franca en la fase a de ese lado. Halle las corrientes de línea en AMBOS lados del
            banco (en pu de sus respectivas bases) y el residual de cada lado.
          </>
        }
        steps={[
          {
            title: 'La falla en su lado de origen',
            why: 'SLG clásica: redes en serie, If = 3I₁ en la fase a; las otras dos en cero.',
            work: `I_f = \\frac{3}{0.48} = ${fmt(if57, 2)}\\ \\text{pu} \\Rightarrow (${fmt(if57, 2)},\\,0,\\,0) \\quad 3I_0 = ${fmt(if57, 2)}\\ \\text{pu}`,
          },
          {
            title: 'Cruzar el banco: secuencias con sus desfases',
            why: 'I₁ gira +30°, I₂ gira −30°, I₀ muere en la delta. Con I₁ = I₂ = I₀ = If/3 esto tiene forma cerrada.',
            work: `I_a' = 2\\tfrac{I_f}{3}\\cos 30^\\circ = \\tfrac{I_f}{\\sqrt 3} = ${fmt(iDelta, 2)} \\quad I_b' = 0 \\quad I_c' = ${fmt(iDelta, 2)}\\ \\text{pu}`,
          },
          {
            title: 'El residual del lado delta',
            why: 'Sin secuencia cero no hay residual: la suma de las tres corrientes transformadas es cero.',
            work: `3I_0' = 0 \\;\\;(\\text{el relé de tierra del lado } \\Delta \\text{ no ve nada — por diseño})`,
            note: `Patrón final: (${fmt(if57, 2)}, 0, 0) de un lado; (${fmt(iDelta, 2)}, 0, ${fmt(iDelta, 2)}) del otro. La misma falla, dos fotografías — el ±30° con signos opuestos hizo la transformación.`,
          },
        ]}
        answer={`\\text{Yg: } (${fmt(if57, 2)}, 0, 0),\\; 3I_0 = ${fmt(if57, 2)} \\qquad \\Delta: (${fmt(iDelta, 2)}, 0, ${fmt(iDelta, 2)}),\\; 3I_0' = 0`}
        takeaway="A través de un banco Δ-Y, las fallas desbalanceadas se calculan POR SECUENCIA (cada una con su desfase) y se recombinan del otro lado. Nunca «traduzcas» corrientes de fase directamente."
      />

      <SolvedProblem
        id="c11s7-problema-motor"
        numero="58"
        title="El aporte del motor al deber momentáneo"
        statement={
          <>
            Una barra industrial se alimenta de la red (X_red = 0.15 pu en base 10 MVA) y tiene
            conectado un motor de inducción de 2 MVA con X″ = 0.20 pu (en SU base). Falla trifásica
            franca en la barra. Halle el aporte de cada fuente, la corriente momentánea total y la
            de interrupción (5 ciclos, cuando el motor ya no aporta).
          </>
        }
        steps={[
          {
            title: 'Cambio de base del motor (el eslabón que siempre se olvida)',
            why: 'Todo a la base común de 10 MVA antes de combinar — mismo voltaje, razón de potencias.',
            work: `X''_{mot}(10\\ \\text{MVA}) = 0.20 \\times \\frac{10}{2} = ${fmt(xMot, 2)}\\ \\text{pu}`,
          },
          {
            title: 'Los dos aportes en el primer medio ciclo',
            why: 'La red empuja con su Thévenin; el motor, con su FEM atrapada tras X″ — ambos hacia la barra fallada (V = 0).',
            work: `I_{red} = \\frac{1}{0.15} = ${fmt(iRed, 2)} \\qquad I_{mot} = \\frac{1}{${fmt(xMot, 2)}} = ${fmt(iMot, 2)}\\ \\text{pu}`,
          },
          {
            title: 'Momentáneo vs interrupción',
            why: 'El pico momentáneo (cierre/soporte) los suma; a los 3–5 ciclos el flujo atrapado del motor de inducción ya se desvaneció.',
            work: `I_{momentánea} = ${fmt(total, 2)}\\ \\text{pu} \\qquad I_{interrupción} \\approx ${fmt(iRed, 2)}\\ \\text{pu}`,
            note: 'El motor añadió un 15 % al deber momentáneo. En barras con MUCHOS motores (plantas, centros comerciales) el aporte agregado puede acercarse al de la red — dimensionar sin él es subdimensionar.',
          },
        ]}
        answer={`I_{mot} = ${fmt(iMot, 1)}\\ \\text{pu} \\qquad I_{momentánea} = ${fmt(total, 2)}\\ \\text{pu} \\qquad I_{int} \\approx ${fmt(iRed, 2)}\\ \\text{pu}`}
        takeaway="Durante una falla, todo lo que gira es fuente. El deber momentáneo del interruptor se calcula con los motores dentro; el de interrupción, con los de inducción ya apagados."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 7
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El grupo vectorial actúa sobre las secuencias con signos opuestos (+30° la positiva, −30° la negativa, nada la cero): la SLG se vuelve patrón bifásico con residual cero al cruzar el Dyn1.</li>
          <li>Los motores son fuentes durante los primeros ciclos (1/X″ tras cambio de base): momentáneo con ellos, interrupción sin los de inducción.</li>
          <li>Las fallas evolucionan (SLG→LLG→3φ) y el residual narra la historia: despejar temprano es la diferencia entre un recierre y un interruptor al límite. Dos puntos (cross-country): mismas redes, conexión en dos puertos.</li>
        </ul>
      </div>
    </section>
  )
}
