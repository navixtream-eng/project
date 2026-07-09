import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import TorqueSpeedLab from '../widgets/TorqueSpeedLab'
import { DEFAULT_INDUCTION, fmt, inductionMaxTorque, inductionStartTorque } from '../lib/machine'

/** Capítulo 7, Sección 5 — La característica par-velocidad: arranque, Tmax y el efecto de R₂. */
export default function C7Section5() {
  const p = DEFAULT_INDUCTION
  const { Tmax, sMax } = inductionMaxTorque(p)
  const Tstart = inductionStartTorque(p)
  // R₂ doblada: mismo Tmax, distinto sMax
  const p2 = { ...p, R2: p.R2 * 2 }
  const m2 = inductionMaxTorque(p2)

  return (
    <section id="c7-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          La curva par-velocidad: arranque, ruptura y la joya de R₂
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Una sola curva cuenta toda la vida del motor: con cuánto par arranca, cuánto aguanta antes de
          calarse, y por qué la resistencia del rotor mueve el par máximo de sitio sin cambiar su altura.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · La forma de la curva: de arranque a ruptura"
        idea="La curva de par contra velocidad nace en el par de ARRANQUE (rotor parado, s=1), sube hasta un máximo — el par de RUPTURA o breakdown — y de ahí cae a cero al llegar a la velocidad síncrona. El motor opera de forma estable en el tramo empinado entre el par máximo y nₛ, donde un aumento de carga se traduce en un pequeño frenado que produce más par."
        analogy="Un ciclista subiendo una cuesta: al principio (parado) empuja fuerte pero avanza poco; conforme acelera encuentra su punto de máxima fuerza (ruptura); y si la cuesta empina más allá de ese punto, ya no puede — pierde velocidad y se cala. El motor vive justo antes de esa cima, donde todavía puede responder."
      >
        <Formula
          latex="T_{ind} = \frac{3}{\omega_s}\cdot\frac{V_{th}^2\,(R_2/s)}{(R_{th}+R_2/s)^2 + (X_{th}+X_2)^2}"
          symbols={[
            { sym: 'V_{th}^2', meaning: 'El par va con el CUADRADO de la tensión: bajar la tensión un 10% baja el par un 19%. Por eso el arranque es tan sensible a las caídas de tensión de la red.' },
            { sym: 'R_2/s', meaning: 'El término que barre toda la curva: al variar s desde 1 hasta 0, R_2/s recorre desde R₂ hasta ∞, y el par sube, alcanza su máximo y cae.' },
            { sym: 'R_{th},\\ X_{th}', meaning: 'Resistencia y reactancia de Thévenin del estator vistas por el rotor. Fijan la altura y la posición de la curva junto con V_th.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.2 · La joya: Tmax no depende de R₂, pero su deslizamiento sí"
        idea="Derivando el par respecto a s y buscando el máximo se descubre algo hermoso: el par de ruptura Tmax NO depende de la resistencia del rotor — solo de la tensión y las reactancias. Lo que R₂ SÍ controla es el deslizamiento al que ocurre ese máximo: s_maxT = R₂/√(Rth² + (Xth+X₂)²), directamente proporcional a R₂."
        analogy="La altura de una montaña (Tmax) está fijada por el terreno (tensión y reactancias); pero DÓNDE está la cima a lo largo del camino (s_maxT) lo decides tú eligiendo la ruta (R₂). Más resistencia = la cima se corre hacia el arranque; misma altura, distinto lugar."
      >
        <Formula
          latex="s_{maxT} = \frac{R_2}{\sqrt{R_{th}^2 + (X_{th}+X_2)^2}} \qquad T_{max} = \frac{3}{2\omega_s}\cdot\frac{V_{th}^2}{R_{th} + \sqrt{R_{th}^2 + (X_{th}+X_2)^2}}"
          symbols={[
            { sym: 's_{maxT} \\propto R_2', meaning: 'El deslizamiento del par máximo es proporcional a R₂. Subir R₂ mueve la cima hacia velocidades bajas (hacia el arranque) — el truco para arrancar con fuerza.' },
            { sym: 'T_{max}', meaning: 'Par de ruptura: NO contiene R₂. Depende de V_th² y de Rth, Xth, X₂. Añadir resistencia al rotor NO cambia cuánto par máximo puede dar el motor — solo a qué velocidad lo da.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.3 · Por qué esto es tan útil"
        idea="Si pudieras poner mucha R₂ solo en el arranque, tendrías el par máximo justo al arrancar (gran empuje, poca corriente de línea) y luego, quitándola, moverías la cima de vuelta hacia nₛ para tener buen rendimiento en marcha. Eso es exactamente lo que hacen el rotor devanado (R externa conmutable) y la doble jaula (R que cambia sola) de la Sección 6."
        analogy="Cambiar de marcha en una bici: una relación corta (mucha R₂) para arrancar la cuesta con fuerza, una larga (poca R₂) para rodar rápido y eficiente en llano. La curva par-velocidad te dice cuándo conviene cada marcha."
      >
        <p>
          Con R₂ = {fmt(p.R2, 2)} Ω el par máximo ocurre a s = {fmt(sMax, 3)}; al doblar R₂ a{' '}
          {fmt(p2.R2, 2)} Ω, s_maxT se dobla a {fmt(m2.sMax, 3)} — pero Tmax sigue siendo{' '}
          {fmt(Tmax, 0)} N·m en ambos casos. Compruébalo moviendo el laboratorio.
        </p>
      </ConceptBlock>

      <TorqueSpeedLab />

      <FeynmanCheck
        id="c7s5-check-tmax"
        question="Duplicas la resistencia del rotor R₂ de un motor. Predice qué le pasa al par MÁXIMO (de ruptura) y al deslizamiento donde ocurre."
        options={[
          {
            label: 'El par máximo se duplica y ocurre al mismo deslizamiento.',
            feedback:
              'Ninguna de las dos. El par máximo NO cambia con R₂ (mira la fórmula de Tmax: no contiene R₂). Y el deslizamiento sí cambia — se duplica. Es justo al revés de lo que parece intuitivo.',
          },
          {
            label: 'El par máximo no cambia; el deslizamiento del par máximo se duplica (la cima se corre hacia el arranque).',
            correct: true,
            feedback:
              'Exacto. Tmax es independiente de R₂ — solo depende de V_th, Rth, Xth, X₂. Pero s_maxT ∝ R₂, así que al doblar R₂, la cima de la curva se corre hacia velocidades más bajas (hacia s = 1). Resultado: MÁS par de arranque, misma capacidad de ruptura. Es el principio de todo control por resistencia de rotor.',
          },
          {
            label: 'El par máximo se reduce a la mitad y el deslizamiento no cambia.',
            feedback:
              'Tmax no baja: es independiente de R₂. Y el deslizamiento del máximo sí cambia (se duplica). La resistencia del rotor reubica la curva, no la encoge.',
          },
        ]}
      />

      <FeynmanCheck
        id="c7s5-check-arranque"
        question="Un motor de jaula estándar arranca con poco par. ¿Por qué añadir resistencia al rotor MEJORA el par de arranque, si Tmax no cambia?"
        options={[
          {
            label: 'Porque al mover s_maxT hacia s = 1, la CIMA de la curva se acerca al punto de arranque: el motor arranca cerca de su par máximo en vez de en el pie de la curva.',
            correct: true,
            feedback:
              'Correcto. El par de arranque es el valor de la curva EN s = 1. Con R₂ baja, la cima está cerca de nₛ y en s = 1 la curva apenas ha subido → poco par de arranque. Al subir R₂, la cima s_maxT se corre hacia s = 1, de modo que el arranque cae cerca (o encima) del par máximo. No cambias la altura de la montaña, solo la pones donde la necesitas.',
          },
          {
            label: 'Porque más resistencia significa más disipación y por tanto más fuerza.',
            feedback:
              'Más disipación no es más par — de hecho la resistencia extra empeora el rendimiento en marcha. El beneficio en el arranque es geométrico: reubica el par máximo hacia s = 1, no «genera» par por calentar.',
          },
          {
            label: 'Porque la corriente de arranque aumenta con R₂.',
            feedback:
              'Al contrario: añadir R₂ REDUCE la corriente de arranque (más impedancia en la rama del rotor). Ese es un beneficio adicional — más par Y menos corriente de línea a la vez, la gran ventaja del rotor devanado.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s5-problema-parvel"
        numero="30"
        title="Par de arranque, par de ruptura y el efecto de R₂"
        statement={
          <>
            Para el motor de 460 V, 4 polos, 60 Hz (R₁ = {fmt(p.R1, 2)}, X₁ = {fmt(p.X1, 2)}, R₂ ={' '}
            {fmt(p.R2, 2)}, X₂ = {fmt(p.X2, 2)}, Xm = {fmt(p.Xm, 0)} Ω), halle <strong>(a)</strong> el
            par de arranque, <strong>(b)</strong> el par de ruptura y el deslizamiento al que ocurre, y{' '}
            <strong>(c)</strong> qué pasa con ambos si se duplica R₂.
          </>
        }
        steps={[
          {
            title: '(a) Par de arranque (s = 1)',
            why: 'Es el valor de la fórmula de par evaluada en s = 1, con la fuente de Thévenin del estator.',
            work: `T_{arr} = \\frac{3}{\\omega_s}\\frac{V_{th}^2 R_2}{(R_{th}+R_2)^2+(X_{th}+X_2)^2} = ${fmt(Tstart, 0)}\\ \\text{N·m}`,
          },
          {
            title: '(b) Par de ruptura y su deslizamiento',
            why: 'El máximo de la curva: s_maxT sale de derivar el par; Tmax de sustituirlo.',
            work: `s_{maxT} = \\frac{R_2}{\\sqrt{R_{th}^2+(X_{th}+X_2)^2}} = ${fmt(sMax, 3)} \\qquad T_{max} = ${fmt(Tmax, 0)}\\ \\text{N·m}`,
            note: `El arranque (${fmt(Tstart, 0)} N·m) es menor que la ruptura (${fmt(Tmax, 0)} N·m): con R₂ baja la cima está lejos de s = 1.`,
          },
          {
            title: '(c) Doblar R₂: la joya en acción',
            why: 'Tmax no depende de R₂; s_maxT sí (∝ R₂). Doblar R₂ dobla s_maxT y deja Tmax intacto.',
            work: `R_2 \\to ${fmt(p2.R2, 2)}\\ \\Omega:\\quad s_{maxT} \\to ${fmt(m2.sMax, 3)} \\quad(\\times 2) \\qquad T_{max} = ${fmt(m2.Tmax, 0)}\\ \\text{N·m}\\ (\\text{igual})`,
            note: 'Al correr la cima hacia el arranque, el par de arranque sube — sin tocar el par de ruptura. Eso es control por resistencia de rotor.',
          },
        ]}
        answer={`T_{arr} = ${fmt(Tstart, 0)}\\ \\text{N·m} \\quad T_{max} = ${fmt(Tmax, 0)}\\ \\text{N·m} @ s = ${fmt(sMax, 3)} \\quad (\\text{doblar } R_2:\\ s_{maxT} = ${fmt(m2.sMax, 3)},\\ T_{max}\\ \\text{igual})`}
        takeaway="La curva par-velocidad se resume en tres números: par de arranque (en s=1), par de ruptura Tmax (independiente de R₂) y s_maxT (∝ R₂). Mover R₂ desliza la cima sin cambiar su altura — la base del arranque de los motores de inducción."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 5
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>La curva va del par de arranque (s=1) al par de ruptura Tmax y cae a cero en nₛ; se opera en el tramo estable cerca de nₛ.</li>
          <li>El par va con <InlineMath latex="V^2" />: caídas de tensión castigan el arranque al cuadrado.</li>
          <li>La joya: <InlineMath latex="T_{max}" /> no depende de R₂, pero <InlineMath latex="s_{maxT}\propto R_2" /> — mover R₂ reubica la cima sin cambiar su altura.</li>
        </ul>
      </div>
    </section>
  )
}
