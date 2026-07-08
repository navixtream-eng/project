import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import MutualTorqueLab from '../widgets/MutualTorqueLab'
import PermanentMagnetLab from '../widgets/PermanentMagnetLab'
import { fmt, mutualTorque } from '../lib/machine'

/**
 * Capítulo 3, Sección 2 — Excitación múltiple (par por inductancia mutua)
 * y fuerzas en sistemas de imán permanente.
 */
export default function C3Section2() {
  // Problema 25: par de un sistema de doble excitación
  const M = 0.4
  const IS = 3
  const IR = 3
  const THETA = 60
  const T = mutualTorque(M, IS, IR, (THETA * Math.PI) / 180)
  const Tmax = M * IS * IR

  return (
    <section id="c3-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-400">
          Capítulo 3 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Excitación múltiple e imanes permanentes: el par nace aquí
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Con dos bobinas —estator y rotor— aparece la inductancia mutua, y de su variación con el
          ángulo sale el par de TODAS las máquinas rotativas. Y al final, el imán que se excita solo.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · Dos bobinas, una mutua que gira: el origen del par"
        idea="Añade una segunda bobina y la coenergía gana un término nuevo: Lsr·is·ir, donde la mutua Lsr(θ) DEPENDE del ángulo del rotor (máxima alineados, nula en cuadratura). El par es la derivada de la coenergía respecto a θ — y como solo la mutua depende del ángulo, T = is·ir·dLsr/dθ. Con Lsr = M·cos θ resulta T = −M·is·ir·sen θ: el par de alineación de todo el electromagnetismo de máquinas."
        analogy="Dos imanes de mano: si los alineas, no giran (par cero, equilibrio). Si los cruzas 90°, cada uno tuerce al otro con toda su fuerza. El par mide cuánto CAMBIA el acoplamiento al girar — no el acoplamiento en sí. Alineados el acoplamiento es máximo pero su derivada es cero; por eso ahí no hay par."
      >
        <Formula
          latex="W'_{fld} = \tfrac{1}{2}L_{ss}i_s^2 + \tfrac{1}{2}L_{rr}i_r^2 + L_{sr}(\theta)\,i_s i_r \quad\Rightarrow\quad T_{fld} = i_s i_r \frac{dL_{sr}(\theta)}{d\theta} = -M\,i_s i_r\,\text{sen}\,\theta"
          symbols={[
            { sym: 'L_{ss}, L_{rr}', meaning: 'Autoinductancias de estator y rotor. En una máquina de rotor cilíndrico NO dependen de θ, así que no aportan par (su derivada es cero).' },
            { sym: 'L_{sr}(\\theta)', meaning: 'Inductancia MUTUA: cuánto flujo de una bobina enlaza a la otra. Varía con el ángulo — máxima alineadas, cero en cuadratura. Es la única que produce par.' },
            { sym: 'dL_{sr}/d\\theta', meaning: 'La clave: el par lo produce la VARIACIÓN de la mutua, no su valor. Por eso el par es máximo donde Lsr cambia más rápido (θ = 90°), no donde Lsr es máxima (θ = 0).' },
            { sym: '-M\\,i_s i_r\\,\\text{sen}\\,\\theta', meaning: 'El par restaurador: empuja el rotor hacia θ = 0 (alineación). Es EXACTAMENTE la ley T ∝ sen δ del Cap. 4 — aquí deducida desde la energía.' },
          ]}
        />
        <MutualTorqueLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c3s2-check-mutua"
        question="El par es T = is·ir·dLsr/dθ. Con Lsr = M·cos θ, ¿por qué el par es MÁXIMO en θ = 90° si ahí la inductancia mutua es CERO?"
        options={[
          {
            label: 'Es un error: el par debería ser máximo donde la mutua es máxima (θ = 0).',
            feedback:
              'En θ = 0 la mutua es máxima pero su PENDIENTE es cero (la cima de un coseno es plana): sin variación no hay par. El par no depende del valor de Lsr sino de su derivada.',
          },
          {
            label: 'Porque el par lo produce la derivada dLsr/dθ = −M·sen θ, que es máxima en θ = 90° — es la RAPIDEZ de cambio del acoplamiento lo que genera par, no el acoplamiento en sí.',
            correct: true,
            feedback:
              'La derivada del coseno es el seno: máxima donde el coseno cruza por cero. En cuadratura, un pequeño giro cambia muchísimo el enlace mutuo ⇒ máximo intercambio de energía ⇒ máximo par. Alineados, el acoplamiento es máximo pero «plano»: girar no cambia nada, par cero. Es la misma razón por la que la cresta de la curva P-δ está en 90°.',
          },
          {
            label: 'Porque en θ = 90° las corrientes son máximas.',
            feedback:
              'Las corrientes is e ir las fijas tú con los sliders — no dependen de θ. Lo que varía con el ángulo es la mutua, y el par sigue a su DERIVADA, máxima en cuadratura.',
          },
        ]}
      />

      <ConceptBlock
        title="2.2 · El imán permanente: excitación sin bobina"
        idea="Un imán de neodimio no tiene corriente, pero produce flujo: sus dominios están «congelados» alineados. Su estado de operación no lo fija una fuente sino la GEOMETRÍA: el punto donde su curva de desmagnetización (segundo cuadrante B-H) corta la recta de carga que impone el circuito magnético. Cerrar el gap endereza la recta y sube el flujo; abrirlo lo tumba. La energía disponible se mide por el producto |BH|."
        analogy="Un resorte precomprimido dentro de una caja: no aplicas fuerza tú (no hay bobina), pero el resorte empuja según cuánto lo deje expandirse la caja (la geometría). Cambia el tamaño de la caja (el gap) y cambia la fuerza que entrega, aunque el resorte sea el mismo. El imán entrega más flujo cuanto más cerrado el circuito."
      >
        <Formula
          latex="B_m = B_r + \mu_{rec}\mu_0 H_m \quad\text{(imán)} \qquad B_m = -\mathcal{P}\,\mu_0 H_m \quad\text{(recta de carga)}"
          symbols={[
            { sym: 'B_r', meaning: 'Remanencia: el flujo del imán en circuito cerrado (H = 0). Neodimio ~1.2 T. El punto de partida de la curva de desmagnetización.' },
            { sym: '\\mu_{rec}', meaning: 'Permeabilidad de retroceso: la pendiente de la recta de desmagnetización. Cercana a 1 en imanes modernos — casi como el aire, por eso trabajan «rígidos».' },
            { sym: '\\mathcal{P}', meaning: 'Permeancia del circuito: la geometría (áreas y longitud del gap). Gap chico = permeancia alta = recta empinada = punto de operación alto.' },
            { sym: '|BH|', meaning: 'Producto de energía [J/m³]: mide la energía que el imán entrega al entrehierro. Los imanes se clasifican por su |BH|máx (el «grado» N42, N52…).' },
          ]}
        />
        <PermanentMagnetLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c3s2-check-iman"
        question="Un imán de neodimio con Br = 1.2 T se saca de su circuito magnético y queda al aire (gap enorme). ¿Qué le pasa a su densidad de flujo B?"
        options={[
          {
            label: 'Sigue siendo 1.2 T: es una propiedad del material.',
            feedback:
              '1.2 T es la remanencia — el flujo SOLO en circuito cerrado (H = 0). Al aire, la geometría impone una recta de carga muy tumbada y el punto de operación cae bien por debajo de Br. El material no cambió, pero su punto de trabajo sí.',
          },
          {
            label: 'Cae muy por debajo de Br: con el gap enorme la recta de carga se tumba y el punto de operación baja por la curva de desmagnetización — el imán se «auto-desmagnetiza» geométricamente (reversible mientras no cruce el codo).',
            correct: true,
            feedback:
              'La geometría manda: gap grande = permeancia baja = recta de carga casi horizontal = punto de operación de bajo B (y H muy negativo). Es reversible si no pasas el codo de la curva. Compruébalo en el laboratorio bajando la permeancia: el punto Q se desploma aunque Br sea fijo. Por eso los imanes se guardan con «keeper» de hierro que cierra su circuito.',
          },
          {
            label: 'Sube por encima de Br al no tener oposición.',
            feedback:
              'Br es el máximo B que da el imán (circuito cerrado, H = 0). Al abrir el circuito H se vuelve negativo y B solo puede BAJAR desde Br a lo largo de la curva de desmagnetización.',
          },
        ]}
      />

      <SolvedProblem
        id="c3s2-problema-torque"
        numero="25"
        title="El par de un sistema de doble excitación"
        statement={
          <>
            Dos devanados acoplados tienen inductancia mutua Lsr(θ) = M·cos θ con{' '}
            <strong>M = {fmt(M, 1)} H</strong>. Circulan corrientes constantes is ={' '}
            <strong>{fmt(IS, 0)} A</strong> e ir = <strong>{fmt(IR, 0)} A</strong>. Halle:{' '}
            <strong>(a)</strong> el par en θ = {THETA}°; <strong>(b)</strong> el par máximo y dónde
            ocurre; <strong>(c)</strong> los puntos de equilibrio y cuál es estable.
          </>
        }
        steps={[
          {
            title: '(a) El par en el ángulo pedido',
            why: 'Como las autoinductancias no dependen de θ (rotor cilíndrico), solo la mutua aporta par: T = is·ir·dLsr/dθ = −M·is·ir·sen θ.',
            work: `T = -M\\,i_s i_r\\,\\text{sen}\\,\\theta = -${fmt(M, 1)}\\times${fmt(IS, 0)}\\times${fmt(IR, 0)}\\times\\text{sen}\\,${THETA}^\\circ = ${fmt(T, 2)}\\ \\text{N·m}`,
            note: 'El signo negativo indica que el par empuja a REDUCIR θ (hacia la alineación).',
          },
          {
            title: '(b) El par máximo',
            why: 'La magnitud del par es M·is·ir·|sen θ|, máxima cuando |sen θ| = 1, es decir en cuadratura — donde la mutua CAMBIA más rápido, aunque ahí valga cero.',
            work: `|T|_{max} = M\\,i_s i_r = ${fmt(M, 1)}\\times${fmt(IS, 0)}\\times${fmt(IR, 0)} = ${fmt(Tmax, 2)}\\ \\text{N·m} \\quad\\text{en}\\quad \\theta = 90^\\circ`,
          },
          {
            title: '(c) Equilibrios y estabilidad',
            why: 'El par se anula en θ = 0 y θ = 180°. La estabilidad la decide la pendiente dT/dθ: negativa = restaurador = estable (como el par sincronizante del Cap. 5).',
            work: `T = 0:\\ \\theta = 0^\\circ\\ (\\text{estable, } dT/d\\theta < 0) \\quad\\text{y}\\quad \\theta = 180^\\circ\\ (\\text{inestable})`,
            note: 'θ = 0 es el pozo de energía (mutua máxima): cualquier desviación genera par que devuelve. θ = 180° es la cima: par cero pero cualquier soplo lo vuelca. Reprodúcelo en el laboratorio con «soltar rotor».',
          },
        ]}
        answer={`\\textbf{(a)}\\ T = ${fmt(T, 2)}\\ \\text{N·m} \\qquad \\textbf{(b)}\\ |T|_{max} = ${fmt(Tmax, 2)}\\ \\text{N·m @ } 90^\\circ \\qquad \\textbf{(c)}\\ \\theta=0^\\circ\\ \\text{estable}`}
        takeaway="T = is·ir·dLsr/dθ es la fórmula madre del par en máquinas: dos corrientes y una mutua que cambia con el ángulo. De aquí salen el par síncrono, el de inducción y el de reluctancia — todo el Capítulo 4 y más allá es esta ecuación con distintas Lsr(θ)."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C3 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Dos bobinas ⇒ la coenergía gana el término Lsr(θ)·is·ir, y el par es{' '}
            <InlineMath latex="T = i_s i_r\,dL_{sr}/d\theta" />. Lo produce la VARIACIÓN de la mutua,
            no su valor: máximo en cuadratura, nulo (y estable) alineados.
          </li>
          <li>
            Es la deducción energética del par de alineación T ∝ sen θ del Cap. 4 — el mismo resorte
            magnético, ahora demostrado desde la conservación de energía.
          </li>
          <li>
            El imán permanente se excita solo: su punto de operación es la intersección de la curva de
            desmagnetización con la recta de carga geométrica. El flujo útil lo decide el gap; la
            energía, el producto |BH|.
          </li>
        </ul>
      </div>
    </section>
  )
}
