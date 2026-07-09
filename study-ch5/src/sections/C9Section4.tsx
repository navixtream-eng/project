import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ArmatureReactionLab from '../widgets/ArmatureReactionLab'
import { armatureReaction, fmt } from '../lib/machine'

/** Capítulo 9, Sección 4 — Reacción de armadura y limitaciones reales. */
export default function C9Section4() {
  const full = armatureReaction(0.8, false)
  const comp = armatureReaction(0.8, true)

  return (
    <section id="c9-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Capítulo 9 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Reacción de armadura: cuando la máquina se estorba a sí misma
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          La propia corriente de armadura crea un campo que ladea el flujo, corre el eje neutro y roba
          flujo por saturación. Interpolos y devanados de compensación son la cura.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · La distorsión: el flujo se ladea"
        idea="La corriente de armadura crea su propia FMM, orientada en cuadratura (a 90°) con el campo principal. Esa FMM cruzada se SUMA al flujo del campo en una mitad del polo y se RESTA en la otra: el flujo se apila en una punta polar y se vacía en la contraria. La distribución de flujo, antes simétrica, queda ladeada."
        analogy="Empujar un río de lado con una manguera: el agua se amontona en una orilla y baja en la otra. La FMM de armadura es esa manguera lateral que desequilibra el flujo del campo."
      >
        <Formula
          latex="B(x) = \underbrace{B_{campo}}_{\text{uniforme}} + \underbrace{k\,I_a\,x}_{\text{FMM de armadura (cruzada)}}"
          symbols={[
            { sym: 'B_{campo}', meaning: 'El flujo que fabrican los polos de campo: uniforme bajo el arco polar, simétrico respecto al centro.' },
            { sym: 'k\\,I_a\\,x', meaning: 'La contribución de la armadura: crece con la corriente Ia y varía linealmente a lo ancho del polo (x), sumándose en una punta y restándose en la otra. Es cero en el centro.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="4.2 · Dos consecuencias: neutro corrido y flujo debilitado"
        idea="Primera: el eje NEUTRO (donde el flujo se anula, y donde deben conmutar las escobillas) se desplaza en el sentido del giro. Si las escobillas no se recolocan, conmutan bajo tensión → CHISPAS y desgaste. Segunda: la punta polar donde el flujo se apila SATURA, así que no gana tanto como pierde la otra punta — resultado NETO: el flujo total baja. La reacción de armadura DEBILITA el campo."
        analogy="Un balancín con tope: si empujas un lado hacia arriba, el otro baja libremente, pero el que sube choca con un techo (saturación) y no sube todo lo que debería. La suma neta queda por debajo del equilibrio."
      >
        <p>
          En el laboratorio, a Ia = 80 % sin compensar, el neutro se corre {fmt(full.neutralShiftDeg, 0)}°
          y el flujo neto cae {fmt(full.fluxLoss * 100, 1)} % — puro efecto de la saturación de la punta
          apilada.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="4.3 · La cura: interpolos y devanados de compensación"
        idea="Los INTERPOLOS (polos de conmutación) son pequeños polos entre los principales, alimentados con la propia corriente de armadura, que crean justo el flujo local necesario para conmutar sin chispas en el neutro corrido. Los DEVANADOS DE COMPENSACIÓN, embebidos en las caras polares y también en serie con la armadura, cancelan la FMM de armadura punta a punta, devolviendo la simetría del flujo. Como ambos van en serie con Ia, se autoajustan a cualquier carga."
        analogy="Un contrapeso que sigue automáticamente a la carga: como se alimentan de la misma corriente de armadura, cuando la reacción crece, la compensación crece igual. Un antídoto proporcional a la enfermedad."
      >
        <p>
          Con compensación, la distorsión prácticamente desaparece: el neutro se queda en{' '}
          {fmt(comp.neutralShiftDeg, 0)}° y la pérdida de flujo en {fmt(comp.fluxLoss * 100, 1)} %. Y no
          hay que olvidar la CURVA DE MAGNETIZACIÓN real: como el acero satura, más corriente de campo da
          cada vez menos flujo — el control por campo pierde efecto en la zona saturada.
        </p>
      </ConceptBlock>

      <ArmatureReactionLab />

      <FeynmanCheck
        id="c9s4-check-neutro"
        question="La reacción de armadura desplaza el eje neutro. ¿Por qué esto provoca chispas en las escobillas?"
        options={[
          {
            label: 'Porque las escobillas conmutan (cortocircuitan brevemente cada bobina) en una posición donde ya NO hay flujo nulo: la bobina conmuta con tensión inducida, y esa energía salta como arco.',
            correct: true,
            feedback:
              'Exacto. La conmutación debe ocurrir en el eje neutro, donde la bobina no corta flujo y su FEM es cero — así se puede invertir su conexión sin chispa. Pero la reacción de armadura corre ese neutro; si las escobillas se quedan en la posición geométrica, conmutan una bobina que SÍ está cortando flujo (FEM ≠ 0), y al cortocircuitarla brevemente esa tensión provoca un arco. De ahí las chispas, el desgaste y las quemaduras del colector.',
          },
          {
            label: 'Porque el flujo neto aumenta y sobrecarga las escobillas.',
            feedback:
              'El flujo neto en realidad DISMINUYE (por saturación de la punta apilada), no aumenta. Y las chispas no vienen del nivel de flujo sino de conmutar en una posición donde la bobina tiene FEM inducida (neutro corrido).',
          },
          {
            label: 'Porque aumenta la resistencia de armadura.',
            feedback:
              'La reacción de armadura no cambia apreciablemente Ra. Las chispas nacen de la CONMUTACIÓN fuera del neutro real: la escobilla cortocircuita una bobina con FEM no nula y salta el arco.',
          },
        ]}
      />

      <FeynmanCheck
        id="c9s4-check-interpolos"
        question="Los interpolos y devanados de compensación se conectan en SERIE con la armadura. ¿Por qué es esto una ventaja?"
        options={[
          {
            label: 'Porque así llevan la misma corriente Ia que causa la reacción: cuando la distorsión crece con la carga, la corrección crece exactamente igual — se autoajusta a cualquier punto de operación.',
            correct: true,
            feedback:
              'Correcto. La reacción de armadura es proporcional a Ia; si el antídoto también es proporcional a Ia (por estar en serie), la cancelación es automática en toda la gama de carga, sin control externo. A poca carga, poca reacción y poca compensación; a plena carga, ambas grandes y en equilibrio. Es una corrección auto-regulada, elegante y robusta.',
          },
          {
            label: 'Porque en serie disipan menos potencia.',
            feedback:
              'La razón no es el ahorro de potencia sino el AUTOAJUSTE: al llevar la misma Ia que causa la reacción, la compensación sigue automáticamente a la carga. Es un tema de seguimiento proporcional, no de eficiencia.',
          },
          {
            label: 'Porque en serie aumentan el flujo del campo principal.',
            feedback:
              'No refuerzan el campo principal; su función es CANCELAR localmente la FMM de armadura y fabricar el flujo de conmutación en el neutro. Van en serie para escalar con Ia y corregir en la medida justa a cada carga.',
          },
        ]}
      />

      <SolvedProblem
        id="c9s4-problema-reaccion"
        numero="40"
        title="Efecto de la reacción de armadura y su corrección"
        statement={
          <>
            Un motor de CC trabaja a plena carga (Ia relativa = 0.8). <strong>(a)</strong> Sin
            compensación, ¿cuánto se corre el eje neutro y cuánto flujo neto se pierde?{' '}
            <strong>(b)</strong> ¿Por qué la pérdida de flujo se debe a la saturación?{' '}
            <strong>(c)</strong> ¿Qué logran los interpolos y la compensación?
          </>
        }
        steps={[
          {
            title: '(a) Distorsión sin compensar',
            why: 'La FMM cruzada corre el neutro y apila el flujo; la punta saturada no compensa lo que pierde la otra.',
            work: `\\text{desplazamiento del neutro} \\approx ${fmt(full.neutralShiftDeg, 0)}^\\circ, \\quad \\text{p\\'erdida de flujo neto} \\approx ${fmt(full.fluxLoss * 100, 1)}\\%`,
          },
          {
            title: '(b) Por qué se pierde flujo neto',
            why: 'Si el hierro fuera lineal, lo que gana una punta lo perdería la otra y el flujo neto no cambiaría. Pero la punta apilada SATURA: su ganancia se recorta al llegar a Bsat, mientras la otra punta pierde libremente.',
            work: `\\text{ganancia (saturada) } < \\text{ p\\'erdida (libre)} \\;\\Rightarrow\\; \\Phi_{neto}\\downarrow`,
            note: 'Sin saturación no habría pérdida neta: es un efecto puramente no lineal del acero.',
          },
          {
            title: '(c) La corrección',
            why: 'Interpolos: fabrican el flujo de conmutación en el neutro corrido, borrando las chispas. Compensación: cancela la FMM de armadura punta a punta. Ambos en serie con Ia → autoajuste.',
            work: `\\text{con compensaci\\'on: neutro} \\approx ${fmt(comp.neutralShiftDeg, 0)}^\\circ, \\quad \\text{p\\'erdida} \\approx ${fmt(comp.fluxLoss * 100, 1)}\\%`,
            note: 'La distorsión prácticamente desaparece y la conmutación vuelve a ser limpia en toda la gama de carga.',
          },
        ]}
        answer={`\\text{Sin comp.: neutro } ${fmt(full.neutralShiftDeg, 0)}^\\circ,\\ \\Phi\\downarrow ${fmt(full.fluxLoss * 100, 1)}\\% \\;\\to\\; \\text{con interpolos+compensaci\\'on: } \\approx 0`}
        takeaway="La corriente de armadura ladea el flujo: corre el neutro (chispas) y, por saturación de la punta apilada, debilita el campo neto. Interpolos (conmutación) y devanados de compensación (cancelan la FMM), en serie con Ia, lo corrigen de forma autoajustada."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C9 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>La FMM de armadura (cruzada) ladea el flujo: apila una punta polar, vacía la otra.</li>
          <li>Dos daños: el <strong>neutro se corre</strong> (chispas al conmutar) y, por <strong>saturación</strong>, el flujo neto baja.</li>
          <li>Cura: <strong>interpolos</strong> (conmutación limpia) + <strong>compensación</strong> (cancela la FMM), en serie con Ia para autoajustarse. Y ojo con la <InlineMath latex="\Phi(I_f)" /> saturada.</li>
        </ul>
      </div>
    </section>
  )
}
