import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import SequenceNetworkLab from '../widgets/SequenceNetworkLab'
import { fmt } from '../lib/machine'

/** Capítulo 11, Sección 2 — Redes e impedancias de secuencia; el neutro. */
export default function C11Section2() {
  // Problema 51: diseñar el reactor de neutro
  const X1 = 0.2
  const X0 = 0.08
  const if3f = 1 / X1
  const sinZn = 3 / (2 * X1 + X0)
  const xnMin = (3 / if3f - (2 * X1 + X0)) / 3

  return (
    <section id="c11-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Cada secuencia ve una máquina distinta: las redes
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          La descomposición solo paga si cada componente es fácil de analizar. Y lo es: cada
          secuencia viaja por su propia RED, con sus propias impedancias — y solo la positiva
          tiene fuentes. Construir esas tres redes es EL oficio de este capítulo.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · Por qué Z₁ ≠ Z₂ ≠ Z₀ en las máquinas"
        idea="En elementos estáticos (líneas, transformadores) Z₁ = Z₂: al hierro le da igual el orden de las fases. En las MÁQUINAS no: la positiva gira CON el rotor (ve la reactancia síncrona o la de régimen), la negativa gira CONTRA él a 2× velocidad relativa (ve algo parecido a la subtransitoria: los amortiguadores la apantallan), y la cero apenas cruza el entrehierro (tres devanados en fase casi se cancelan espacialmente): X₀ es la MÁS pequeña. Además, todo lo que esté en el neutro aparece en la red cero multiplicado por 3 — porque por el neutro regresan las TRES corrientes de secuencia cero juntas."
        analogy="Tres viajeros sobre una banda transportadora (el rotor): el que camina con la banda (positiva) la siente suave; el que camina en contra (negativa) la siente rugosa y rápida; el que intenta cruzarla de lado (cero) casi no interactúa con ella. El mismo piso, tres experiencias — la misma máquina, tres impedancias."
      >
        <Formula
          latex="Z_{0,\text{red}} = Z_0 + 3Z_n \qquad X_0 < X_2 \approx X''_d < X_1"
          symbols={[
            { sym: '3Z_n', meaning: 'La impedancia del neutro TRIPLICADA en la red cero: por el neutro circula Ia+Ib+Ic = 3I₀, así que su caída es 3·Zn·I₀ — la red «ve» 3Zn. Es el factor 3 más olvidado del capítulo.' },
            { sym: "X_2 \\approx X''_d", meaning: 'La negativa ve el campo girando a ~2× respecto al rotor: los devanados amortiguadores la apantallan como en el primer instante de una falla — por eso se parece a la subtransitoria.' },
            { sym: 'X_0', meaning: 'Típicamente 0.03–0.10 pu en generadores: el flujo de secuencia cero casi no enlaza — y esa pequeñez es la razón de que las fallas a tierra sean tan violentas cerca de máquinas sólidamente aterrizadas.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · Las tres redes del generador (y el dilema del neutro)"
        idea="Red positiva: la FEM E en serie con Z₁ — la única con fuente (los generadores solo fabrican secuencia positiva). Red negativa: Z₂ a secas. Red cero: Z₀ en serie con 3Zn hasta la barra de referencia. El diseño del aterrizamiento es un dilema clásico: sólido → fallas a tierra enormes pero sin sobretensiones; con reactor → corriente domada al valor elegido; aislado → casi sin corriente de falla, pero las fases sanas suben a tensión de línea y la falla queda «invisible» esperando una segunda."
        analogy="El neutro es la puerta trasera de la casa: abierta de par en par (sólido), cualquier fuga sale con violencia pero la presión interna nunca sube; con un resorte calibrado (reactor), sale lo justo para que la alarma la detecte; tapiada (aislado), nada sale — y la presión busca las ventanas."
      >
        <p>
          Nota de construcción de redes en SISTEMAS: cada elemento (generador, transformador,
          línea) aporta su impedancia a cada red, todas en la MISMA base de por-unidad (Cap. 6).
          La red positiva del sistema es exactamente el diagrama de reactancias que ya usabas para
          fallas trifásicas; la negativa es su copia sin fuentes; la cero… la cero tiene topología
          propia — los transformadores la reconfiguran (Sección 3).
        </p>
      </ConceptBlock>

      <SequenceNetworkLab />

      <FeynmanCheck
        id="c11s2-check-fuente"
        question="¿Por qué las redes de secuencia negativa y cero NO llevan fuentes de FEM?"
        options={[
          {
            label: 'Porque un generador sano produce tres FEM balanceadas — pura secuencia positiva. Las otras componentes solo APARECEN como respuesta a un desbalance externo (la falla), nunca nacen en la máquina.',
            correct: true,
            feedback:
              'Exacto: el desbalance es de la RED (la falla), no de la fuente. Por eso la positiva «empuja» y las otras dos solo ofrecen impedancia al paso de las corrientes que la conexión de la falla les impone.',
          },
          {
            label: 'Por simplificación: sí tienen fuentes pero pequeñas.',
            feedback:
              'No es simplificación: con devanados y FEM simétricos, la descomposición de las tres FEM da exactamente (E, 0, 0). Una máquina con FEM de secuencia negativa apreciable estaría averiada (espiras en corto).',
          },
          {
            label: 'Porque esas redes no llevan corriente.',
            feedback:
              'Llevan mucha (¡en una SLG la misma que la positiva!) — lo que no tienen es quién las EMPUJE desde dentro: la empuja la conexión de la falla.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s2-check-aislado"
        question="Un sistema industrial opera con neutro AISLADO y sufre una falla monofásica a tierra. ¿Cuál es el verdadero peligro, si la corriente de falla es casi nula?"
        options={[
          {
            label: 'Las fases sanas quedan a tensión de LÍNEA respecto a tierra (√3 veces más) y la falla persiste sin ser despejada: el aislamiento envejece esperando la SEGUNDA falla a tierra — que ya sería bifásica y violenta.',
            correct: true,
            feedback:
              'El clásico de plantas con continuidad de servicio: la primera falla no interrumpe (ventaja) pero deja el sistema armado (riesgo). Por eso los sistemas aislados exigen detectores de primera falla (59N/vigilantes de aislamiento).',
          },
          {
            label: 'Ninguno: sin corriente no hay problema.',
            feedback:
              'La corriente es solo la mitad de la historia — la otra mitad son las TENSIONES: el triángulo de línea no cambia, pero su «centro» se corre a la fase fallada y las sanas suben √3.',
          },
          {
            label: 'El generador pierde el sincronismo.',
            feedback:
              'Una falla de secuencia cero casi sin corriente apenas perturba el par — el problema es dieléctrico y de detección, no de estabilidad.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s2-problema-reactor"
        numero="51"
        title="Diseñar el reactor de neutro"
        statement={
          <>
            Un generador tiene X₁ = X₂ = {fmt(X1, 2)} pu y X₀ = {fmt(X0, 2)} pu. Sólidamente
            aterrizado, su falla monofásica supera a la trifásica. Especifique la reactancia de
            neutro Xₙ mínima para que la falla SLG en bornes NO exceda a la trifásica.
          </>
        }
        steps={[
          {
            title: 'Las dos corrientes a igualar',
            why: 'La 3φ solo ve la red positiva; la SLG ve las tres redes en serie más 3Xₙ.',
            work: `I_{3\\phi} = \\frac{1}{X_1} = ${fmt(if3f, 2)}\\ \\text{pu} \\qquad I_{SLG} = \\frac{3}{X_1+X_2+X_0+3X_n}`,
          },
          {
            title: 'Verificar el problema (sin reactor)',
            why: 'Con Xₙ = 0, el denominador de la SLG es pequeño porque X₀ < X₁.',
            work: `I_{SLG} = \\frac{3}{${fmt(2 * X1 + X0, 2)}} = ${fmt(sinZn, 2)}\\ \\text{pu} > ${fmt(if3f, 2)}\\ \\text{pu} \\;\\;⚠`,
          },
          {
            title: 'Imponer la igualdad y despejar Xₙ',
            why: 'El reactor añade 3Xₙ SOLO a la red cero: es una perilla que la trifásica ni nota.',
            work: `\\frac{3}{${fmt(2 * X1 + X0, 2)} + 3X_n} \\le ${fmt(if3f, 2)} \\;\\Rightarrow\\; X_n \\ge \\frac{3/${fmt(if3f, 2)} - ${fmt(2 * X1 + X0, 2)}}{3} = ${fmt(xnMin, 3)}\\ \\text{pu}`,
            note: 'Así se especifica el reactor de neutro real de un generador: el factor 3 trabaja a tu favor — un reactor pequeño en el neutro vale por el triple en la red.',
          },
        ]}
        answer={`X_n \\ge ${fmt(xnMin, 3)}\\ \\text{pu} \\;\\;(I_{SLG} = I_{3\\phi} = ${fmt(if3f, 1)}\\ \\text{pu})`}
        takeaway="La red cero es la única con perilla de diseño (3Zn). Aterrizar no es un detalle constructivo: es elegir cuánta corriente de falla a tierra QUIERES tener."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Tres redes: positiva (con E), negativa (Z₂ ≈ X″d en máquinas), cero (Z₀ + 3Zn). Estáticos: Z₁ = Z₂; máquinas: cada secuencia ve otra física.</li>
          <li>El neutro entra TRIPLICADO en la red cero (3I₀ pasan por él) — la única perilla de diseño de las corrientes de tierra.</li>
          <li>Sólido / reactor / aislado: corriente máxima sin sobretensión ↔ corriente elegida ↔ continuidad con sobretensión √3 y falla latente.</li>
        </ul>
      </div>
    </section>
  )
}
