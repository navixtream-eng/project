import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import TimeConstantLab from '../widgets/TimeConstantLab'
import { DEFAULT_DCDYN, dcTimeConstants, fmt } from '../lib/machine'

/** Capítulo 10, Sección 2 — Constantes de tiempo de la máquina. */
export default function C10Section2() {
  const p = DEFAULT_DCDYN
  const { taue, taum } = dcTimeConstants(p)

  return (
    <section id="c10-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
          Capítulo 10 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Dos relojes: la constante eléctrica τe y la mecánica τm
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Cada ecuación tiene su ritmo. La corriente responde rápido (τe); la velocidad, lastrada por la
          inercia, responde despacio (τm). Casi siempre τm ≫ τe — y eso lo cambia todo.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · La constante de tiempo eléctrica τe = La/Ra"
        idea="Si el rotor estuviera bloqueado, la corriente respondería a un escalón de tensión como un circuito RL: sube exponencialmente hacia Vt/Ra con constante de tiempo τe = La/Ra. Es el ritmo al que la máquina puede CAMBIAR su corriente — y por tanto su par. Típicamente son unos pocos milisegundos: rápido."
        analogy="El tiempo que tarda en llenarse una tubería corta al abrir la llave. La inductancia es la «inercia» de la corriente; τe mide cuánto tarda en establecerse."
      >
        <Formula
          latex="\tau_e = \frac{L_a}{R_a}"
          symbols={[
            { sym: '\\tau_e', meaning: 'Constante de tiempo eléctrica [s]: en ~τe la corriente alcanza el 63 % de su valor final; en ~4τe, prácticamente todo. Fija la rapidez del lazo de corriente del control.' },
            { sym: 'L_a/R_a', meaning: 'Más inductancia → corriente más «perezosa»; más resistencia → más rápida (pero más pérdidas). Pocos ms en máquinas típicas.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · La constante de tiempo mecánica τm y el acoplamiento inercial"
        idea="La velocidad responde con τm = J·Ra/(Ka·Φ)², que combina la inercia del rotor (J) con la capacidad del par magnético para acelerarla. Es mucho mayor que τe: la masa giratoria tarda en cambiar de velocidad. Este 'acoplamiento inercial' es lo que hace que, para el rápido lazo de corriente, la velocidad parezca casi congelada."
        analogy="Arrancar un tren pesado (J grande): aunque el motor dé par al instante, el tren tarda en tomar velocidad. τm es ese tiempo de arrastre de la masa."
      >
        <Formula
          latex="\tau_m = \frac{J\,R_a}{(K_a\Phi)^2} \qquad\qquad \tau_m \gg \tau_e"
          symbols={[
            { sym: '\\tau_m', meaning: 'Constante de tiempo mecánica [s]: cuánto tarda la velocidad en asentarse. Domina el tiempo de arranque. Crece con la inercia J.' },
            { sym: '(K_a\\Phi)^2', meaning: 'El par por amperio al cuadrado: un flujo fuerte acelera la inercia más rápido, reduciendo τm. Debilitar el campo agranda τm.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.3 · Por qué la separación τm ≫ τe habilita el control en cascada"
        idea="Como la velocidad cambia mucho más despacio que la corriente, se pueden diseñar por separado: un lazo INTERNO rápido que controla la corriente (viendo la velocidad como casi constante) y un lazo EXTERNO lento que controla la velocidad. Es la 'separación de escalas de tiempo', el cimiento de todo variador de CC (Sección 5)."
        analogy="Conducir: ajustas el acelerador (corriente, rápido) muchas veces por segundo mientras la velocidad del coche (mecánica, lenta) cambia poco a poco. Puedes pensar en las dos por separado porque van a ritmos distintos."
      >
        <p>
          Con los parámetros del laboratorio, τe ≈ {fmt(taue * 1000, 1)} ms y τm ≈ {fmt(taum * 1000, 1)}{' '}
          ms: una separación de ≈ {fmt(taum / taue, 1)}×. Sube La o J y observa cómo cada reloj cambia
          por separado.
        </p>
      </ConceptBlock>

      <TimeConstantLab />

      <FeynmanCheck
        id="c10s2-check-taue"
        question="¿Por qué la constante de tiempo mecánica τm suele ser mucho mayor que la eléctrica τe?"
        options={[
          {
            label: 'Porque la inercia mecánica del rotor (masa girando) es «grande» comparada con la rapidez con que la inductancia deja pasar la corriente: cuesta mucho más cambiar la velocidad de una masa que la corriente de un circuito.',
            correct: true,
            feedback:
              'Correcto. τe = La/Ra son unos pocos ms (un circuito RL responde rápido), mientras que τm = J·Ra/(Ka·Φ)² es mucho mayor porque J (la inercia) representa una masa física que hay que acelerar. Cambiar la corriente es cuestión de electrones; cambiar la velocidad es mover kilogramos de hierro. Por eso τm ≫ τe casi siempre, y las dos dinámicas se pueden tratar por separado.',
          },
          {
            label: 'Porque la resistencia mecánica es mayor que la eléctrica.',
            feedback:
              'No hay una «resistencia mecánica» que comparar directamente. La diferencia viene de la INERCIA J (masa girando) frente a la rapidez de un circuito RL. Curiosamente, Ra aparece en AMBAS constantes.',
          },
          {
            label: 'Porque τm no depende de la inductancia.',
            feedback:
              'Es cierto que τm no depende de La, pero eso no explica por qué es mayor. La razón es la inercia J: mover una masa giratoria es intrínsecamente más lento que establecer una corriente en un circuito.',
          },
        ]}
      />

      <FeynmanCheck
        id="c10s2-check-cascada"
        question="El control en cascada usa un lazo de corriente rápido DENTRO de un lazo de velocidad lento. ¿Qué propiedad de la máquina lo justifica?"
        options={[
          {
            label: 'La separación de escalas de tiempo (τm ≫ τe): el lazo de corriente actúa tan rápido que, desde su punto de vista, la velocidad es casi constante — así se pueden diseñar por separado.',
            correct: true,
            feedback:
              'Exacto. Como la corriente se establece en ~τe (ms) y la velocidad cambia en ~τm (mucho mayor), el lazo interno de corriente «ve» la velocidad prácticamente congelada durante su acción. Eso permite diseñar el lazo de corriente ignorando la dinámica de velocidad, y luego el lazo de velocidad tratando el lazo de corriente ya cerrado como casi instantáneo. Sin esta separación, el diseño acoplado sería mucho más difícil.',
          },
          {
            label: 'Que la corriente y la velocidad son la misma variable.',
            feedback:
              'Son variables distintas (una eléctrica, otra mecánica), acopladas pero separadas. Lo que habilita la cascada no es que sean iguales, sino que responden a ritmos MUY distintos (τm ≫ τe).',
          },
          {
            label: 'Que el motor no tiene inercia.',
            feedback:
              'Al contrario: la inercia existe y es justo la que hace τm grande. Es esa lentitud mecánica (frente a la rapidez eléctrica) la que permite anidar un lazo rápido dentro de uno lento.',
          },
        ]}
      />

      <SolvedProblem
        id="c10s2-problema-constantes"
        numero="43"
        title="Calcular las dos constantes de tiempo"
        statement={
          <>
            Para el motor (Ra = {p.Ra} Ω, La = {fmt(p.La * 1000, 0)} mH, Ka·Φ = {p.kPhi} V·s/rad, J ={' '}
            {p.J} kg·m²), halle <strong>(a)</strong> τe, <strong>(b)</strong> τm y <strong>(c)</strong>{' '}
            su relación, y comente qué implica para el control.
          </>
        }
        steps={[
          {
            title: '(a) Constante eléctrica',
            why: 'El circuito de armadura es un RL: su ritmo es La/Ra.',
            work: `\\tau_e = \\frac{L_a}{R_a} = \\frac{${fmt(p.La, 3)}}{${p.Ra}} = ${fmt(taue * 1000, 1)}\\ \\text{ms}`,
          },
          {
            title: '(b) Constante mecánica',
            why: 'Combina la inercia con el par por amperio al cuadrado.',
            work: `\\tau_m = \\frac{J\\,R_a}{(K_a\\Phi)^2} = \\frac{${p.J}\\times ${p.Ra}}{${p.kPhi}^2} = ${fmt(taum * 1000, 1)}\\ \\text{ms}`,
          },
          {
            title: '(c) Relación e implicación',
            why: 'Si τm ≫ τe, las dinámicas se separan y el control en cascada es válido.',
            work: `\\frac{\\tau_m}{\\tau_e} = ${fmt(taum / taue, 1)} \\;\\gg\\; 1`,
            note: 'La corriente se establece ~6 veces más rápido que la velocidad: el lazo de corriente puede diseñarse viendo la velocidad como constante.',
          },
        ]}
        answer={`\\tau_e = ${fmt(taue * 1000, 1)}\\ \\text{ms}, \\quad \\tau_m = ${fmt(taum * 1000, 1)}\\ \\text{ms}, \\quad \\tau_m/\\tau_e = ${fmt(taum / taue, 1)}`}
        takeaway="τe = La/Ra (rápida) y τm = J·Ra/(Ka·Φ)² (lenta) son los dos relojes de la máquina. Su gran separación (τm ≫ τe) es lo que hace posible el control en cascada de los variadores."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C10 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li><InlineMath latex="\tau_e = L_a/R_a" /> (ms): ritmo de la corriente y del par.</li>
          <li><InlineMath latex="\tau_m = JR_a/(K_a\Phi)^2" />: ritmo de la velocidad; crece con la inercia.</li>
          <li><InlineMath latex="\tau_m \gg \tau_e" /> permite separar las dinámicas: base del control en cascada.</li>
        </ul>
      </div>
    </section>
  )
}
