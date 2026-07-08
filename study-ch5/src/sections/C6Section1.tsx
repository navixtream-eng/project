import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ParkLab from '../widgets/ParkLab'
import { fmt, fmtDeg, pMax, solveFromPQ } from '../lib/machine'

/**
 * Capítulo 6, Sección 1 — Naturaleza del transitorio y la transformación
 * de Park: qué se conserva en el instante de la perturbación y desde qué
 * asiento conviene mirar la máquina.
 */
export default function C6Section1() {
  // Problema 12: E' tras X'd del punto de carga habitual, comparada con Eaf
  const VT = 1.0
  const P = 0.9
  const Q = P * Math.tan(Math.acos(0.9))
  const XD1 = 0.3
  const XD = 1.1
  const ep = solveFromPQ(VT, P, Q, XD1)
  const eaf = solveFromPQ(VT, P, Q, XD)
  const pmaxTr = pMax(ep.EafMag, VT, XD1)
  const pmaxSs = pMax(eaf.EafMag, VT, XD)

  return (
    <section id="c6-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
          Capítulo 6 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Del régimen permanente al transitorio: el flujo atrapado y la mirada de Park
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Los fasores del Capítulo 5 describen la máquina en paz. Cuando llega la perturbación —
          una falla, un rechazo de carga — mandan otras dos ideas: qué se CONSERVA en el primer
          instante, y desde qué sistema de referencia conviene mirar el caos.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · El teorema del flujo atrapado"
        idea="En el instante exacto de una perturbación, el enlace de flujo λ de cada devanado cerrado NO puede saltar: un salto de λ exigiría una tensión infinita (e = −dλ/dt). El campo y los amortiguadores reaccionan induciendo las corrientes que hagan falta para sostener su flujo — y esa defensa del flujo es la raíz de TODO el comportamiento transitorio."
        analogy="Un frenazo en una autopista llena: los autos (el flujo) no pueden teletransportarse — cada uno conserva su posición y velocidad en el instante del susto, y lo que sigue (la onda de frenadas) es la transición gradual hacia el nuevo orden. Los primeros metros son violentos (subtransitorio), luego la cosa se ordena (transitorio) y al final el tráfico fluye al nuevo ritmo (permanente)."
      >
        <p className="mb-2">
          De ahí la diferencia radical entre los dos regímenes: en el permanente el flujo del campo lo
          fija If (una constante de operación); en el transitorio lo fija la <em>historia</em> — lo que
          el devanado tenía atrapado cuando ocurrió el evento:
        </p>
        <Formula
          latex="e = -\frac{d\lambda}{dt} \;\Rightarrow\; \lambda(0^+) = \lambda(0^-)\quad \text{en todo devanado cerrado}"
          symbols={[
            { sym: '\\lambda(0^+) = \\lambda(0^-)', meaning: 'La condición de continuidad: el enlace de flujo un instante después de la perturbación es EXACTAMENTE el de un instante antes. Es la condición inicial de todas las ecuaciones diferenciales del capítulo.' },
            { sym: 'e = -d\\lambda/dt', meaning: 'Ley de Faraday: si λ intentara saltar, dλ/dt → ∞ y la tensión inducida sería infinita. La naturaleza no firma ese cheque.' },
          ]}
        />
        <p>
          Consecuencia inmediata: durante los primeros instantes la máquina se comporta como si tuviera
          reactancias <em>mucho menores</em> (el flujo atrapado en campo y amortiguadores «no deja
          entrar» al flujo nuevo de la armadura) — esas serán X″d y X′d en la Sección 2.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="c6s1-check-flujo"
        question="En el microsegundo posterior a un cortocircuito, ¿qué magnitud física se conserva exactamente en el devanado de campo (que sigue cerrado sobre su excitatriz)?"
        options={[
          {
            label: 'Su corriente If: la fuente de excitación la mantiene fija.',
            feedback:
              'Al contrario: la corriente de campo PEGA UN SALTO hacia arriba en el instante de la falla — precisamente para defender otra cosa que sí se conserva. La excitatriz fija el promedio en régimen, no el instante.',
          },
          {
            label: 'Su enlace de flujo λf: cualquier salto exigiría tensión infinita, así que el devanado induce la corriente extra necesaria para sostenerlo.',
            correct: true,
            feedback:
              'Ese es el teorema. La armadura en falla lanza una FMM desmagnetizante contra el rotor; el campo responde con un pico de corriente inducida que mantiene λf continuo. Mientras ese refuerzo dura (se extingue con T′d), la máquina «parece» tener una reactancia pequeña: X′d. Los amortiguadores hacen lo mismo, más rápido: X″d y T″d.',
          },
          {
            label: 'Su tensión: la excitatriz es una fuente de tensión constante.',
            feedback:
              'La tensión del devanado de campo también se sacude durante el transitorio. Lo inviolable es λf: la tensión y la corriente se acomodan como haga falta para no romper la continuidad del flujo.',
          },
        ]}
      />

      <ConceptBlock
        title="1.2 · La transformación de Park (d-q-0): subirse al rotor"
        idea="Vistas desde el estator, las inductancias de la máquina cambian con la posición del rotor: las ecuaciones diferenciales tienen coeficientes que giran a 60 Hz — un infierno matemático. Park propone cambiar de asiento: proyectar todo sobre dos ejes que VIAJAN con el rotor (d sobre el polo, q a 90° eléctricos). Desde ahí la geometría relativa ya no cambia: las inductancias se vuelven constantes y las ecuaciones, resolubles."
        analogy="Intentar conversar con alguien que va en un carrusel: desde afuera pasa frente a ti una vez por vuelta (todo oscila); súbete al carrusel y la conversación es normal (todo constante). Park no cambia la física — cambia el asiento del observador."
      >
        <Formula
          latex="i_d = \tfrac{2}{3}\!\left[i_a\cos\theta + i_b\cos(\theta - 120^\circ) + i_c\cos(\theta + 120^\circ)\right] \qquad i_q = -\tfrac{2}{3}\!\left[i_a\,\text{sen}\,\theta + \cdots\right]"
          symbols={[
            { sym: 'i_d,\\ i_q', meaning: 'Las corrientes de armadura proyectadas sobre los ejes del rotor. En régimen balanceado son CONSTANTES: la variable tiempo desaparece de las inductancias.' },
            { sym: '\\theta', meaning: 'Posición eléctrica del rotor (θ = ωt en sincronismo): el ángulo del «carrusel» al que nos subimos.' },
            { sym: '\\tfrac{2}{3}', meaning: 'Normalización (convención invariante en amplitud, la de FKU): hace que |id, iq| coincidan con las amplitudes de fase.' },
            { sym: '0', meaning: 'La tercera componente (secuencia cero, i0 = (ia+ib+ic)/3) es nula en sistemas balanceados — por eso casi nunca se la nombra.' },
          ]}
        />
        <p>
          El premio es enorme: λ<sub>d</sub> = L<sub>d</sub>·i<sub>d</sub> + ... con L<sub>d</sub>,{' '}
          L<sub>q</sub> <em>constantes</em>. Sobre esos ejes se definen las reactancias de eje directo
          y de cuadratura de todo el capítulo — y los polos salientes dejan de ser un problema: cada
          eje lleva su propia contabilidad.
        </p>
      </ConceptBlock>

      <ParkLab />

      <FeynmanCheck
        id="c6s1-check-park"
        question="¿POR QUÉ exactamente la transformación de Park convierte las inductancias variables del estator en constantes?"
        options={[
          {
            label: 'Porque filtra las componentes de alta frecuencia de las corrientes.',
            feedback:
              'No es un filtro: es un cambio de coordenadas exacto e invertible — no se pierde ni un microamperio (verifica id²+iq²=|I|² en el laboratorio). La clave es geométrica, no espectral.',
          },
          {
            label: 'Porque los ejes d-q giran CON el rotor: la posición relativa entre los devanados equivalentes y el hierro del rotor ya no cambia — y la inductancia es pura geometría relativa.',
            correct: true,
            feedback:
              'Exacto. Las inductancias del estator variaban porque el hierro saliente del rotor pasaba frente a bobinas fijas (la reluctancia vista cambiaba con θ). Montados en el rotor, los devanados equivalentes d y q ven SIEMPRE el mismo hierro en la misma posición: Ld y Lq constantes, ecuaciones diferenciales con coeficientes fijos, y el capítulo entero se vuelve tratable.',
          },
          {
            label: 'Porque promedia las tres fases y el promedio es constante.',
            feedback:
              'El promedio de las tres corrientes balanceadas es cero (esa es la componente 0). Park no promedia: PROYECTA sobre ejes giratorios, conservando toda la información en dos números.',
          },
        ]}
      />

      <SolvedProblem
        id="c6s1-problema-eprima"
        numero="12"
        title="E′: la tensión que el flujo atrapado congela"
        statement={
          <>
            El generador de siempre opera con <strong>P = {fmt(P, 1)} pu, fp = 0.9 en atraso</strong>,
            Vt = 1.0 pu. Sus reactancias: Xd = {fmt(XD, 1)} pu (sincrónica) y{' '}
            <strong>X′d = {fmt(XD1, 1)} pu</strong> (transitoria). Calcule la tensión transitoria
            interna E′ (detrás de X′d) y compare la potencia máxima transferible en régimen permanente
            vs. durante el transitorio.
          </>
        }
        steps={[
          {
            title: 'Por qué existe E′ — el teorema del flujo en acción',
            why: 'En el instante de una perturbación, λf no salta ⇒ la tensión interna asociada al flujo del campo queda CONGELADA en su valor pre-falla. Esa tensión congelada, vista detrás de la reactancia transitoria, es E′: la «foto» del estado magnético al momento del susto.',
            work: `\\hat{E}' = \\hat{V}_t + jX'_d\\,\\hat{I}_a \\quad (\\text{mismo ritual de la Sección 2 del Cap. 5, con } X'_d)`,
          },
          {
            title: 'Calcular E′ con el punto de carga',
            why: 'La corriente es la misma del régimen previo (Ia = 1.0∠−25.8°); solo cambia la reactancia con la que se «retrocede» hacia adentro de la máquina.',
            work: `\\hat{E}' = 1 + j(${fmt(XD1, 1)})(${fmt(ep.Ia.re)} - j\\,${fmt(-ep.Ia.im)}) = ${fmt(ep.Eaf.re)} + j\\,${fmt(ep.Eaf.im)} = ${fmt(ep.EafMag)}\\,\\angle{${fmtDeg(ep.delta)}}\\ \\text{pu}`,
            note: `Compárala con la FEM de régimen: Eaf = ${fmt(eaf.EafMag)} pu (detrás de Xd = ${fmt(XD, 1)}). E′ es menor — pero está detrás de una reactancia CUATRO veces menor.`,
          },
          {
            title: 'La sorpresa: la máquina es MÁS rígida en el transitorio',
            why: 'La potencia máxima transferible es E·Vt/X. Aunque E′ < Eaf, la X′d pequeña gana por goleada: durante el transitorio la curva P-δ es mucho más alta que la de régimen.',
            work: `P_{max}^{perm} = \\frac{${fmt(eaf.EafMag)}}{${fmt(XD, 1)}} = ${fmt(pmaxSs, 2)}\\ \\text{pu} \\qquad P_{max}^{trans} = \\frac{${fmt(ep.EafMag)}}{${fmt(XD1, 1)}} = ${fmt(pmaxTr, 2)}\\ \\text{pu}`,
            note: 'Esta es la razón física de que los generadores sobrevivan fallas: el flujo atrapado les presta, por unos cientos de milisegundos, un par sincronizante mucho más fuerte que el de régimen. La Sección 3 explota exactamente este modelo.',
          },
        ]}
        answer={`\\hat{E}' = ${fmt(ep.EafMag)}\\,\\angle{${fmtDeg(ep.delta)}}\\ \\text{pu} \\qquad P_{max}^{trans} = ${fmt(pmaxTr, 2)}\\ \\text{pu} \\;(\\approx ${fmt(pmaxTr / pmaxSs, 1)}\\times\\ \\text{la de régimen})`}
        takeaway="E′ no es una tensión nueva que aparezca: es la manifestación circuital del flujo que NO pudo saltar. El modelo «E′ tras X′d» — una fuente congelada tras una reactancia pequeña — es la máquina entera para los estudios de estabilidad."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C6 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            En el instante de la perturbación, <InlineMath latex="\lambda(0^+) = \lambda(0^-)" /> en
            todo devanado cerrado: el flujo es el «momentum» magnético y no se teletransporta.
            Campo y amortiguadores inducen lo que haga falta para defenderlo.
          </li>
          <li>
            Park = cambiar de asiento: ejes d-q montados en el rotor ⇒ inductancias constantes ⇒
            ecuaciones resolubles. Misma física, mejor butaca.
          </li>
          <li>
            E′ (tras X′d) es la foto del flujo atrapado. Y como X′d ≪ Xd, la máquina es
            transitoriamente MÁS rígida que en régimen — su seguro de vida ante fallas.
          </li>
        </ul>
      </div>
    </section>
  )
}
