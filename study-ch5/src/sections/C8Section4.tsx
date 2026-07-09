import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import FocLab from '../widgets/FocLab'
import { DEFAULT_FOC, fmt, focFlux, focTorque } from '../lib/machine'

/** Capítulo 8, Sección 4 — Control vectorial (FOC). */
export default function C8Section4() {
  const p = DEFAULT_FOC
  const id = 5
  const iq1 = 10
  const iq2 = 20
  const flux = focFlux(p.Lm, id)
  const T1 = focTorque(p, id, iq1)
  const T2 = focTorque(p, id, iq2)

  return (
    <section id="c8-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Capítulo 8 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Control vectorial (FOC): el motor de inducción que se porta como uno de CD
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El clímax del capítulo. Alineando el marco síncrono con el flujo del rotor, el par y el flujo
          se desacoplan en dos perillas independientes — y un motor no lineal responde como un servo.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · La envidia de la máquina de CD"
        idea="En una máquina de corriente directa el par se controla con una sola corriente (la de armadura) y el flujo con otra independiente (la de campo), porque el conmutador las mantiene siempre perpendiculares. Por eso el motor de CD fue el rey de los servos: respuesta instantánea y lineal. El motor de inducción, en cambio, mezcla todo en las mismas corrientes de estator — hasta que el FOC lo desenreda."
        analogy="El motor de CD es un grifo con dos llaves separadas: una para el agua caliente (flujo) y otra para la fría (par). El de inducción trae una sola llave mezcladora que gira: mover el par toca el flujo y viceversa. El FOC le instala, matemáticamente, las dos llaves independientes del de CD."
      >
        <Formula
          latex="\text{CD:}\quad T \propto \Phi_{campo}\cdot i_{armadura} \quad(\text{siempre} \perp) \qquad \text{inducci\'on sin FOC: acoplado}"
          symbols={[
            { sym: 'T \\propto \\Phi\\cdot i_a', meaning: 'En CD el par es el producto del flujo de campo por la corriente de armadura, mantenidos a 90° por el conmutador. Controlas cada uno por separado — control lineal y directo.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="4.2 · Alinear el marco con el flujo del rotor: el desacoplamiento"
        idea="El FOC gira el marco síncrono para que su eje d apunte exactamente al vector de flujo del rotor. Con esa alineación, el flujo del rotor solo depende de la corriente de eje directo id (como la corriente de campo del CD), y el par solo del producto flujo·iq (como la corriente de armadura). id e iq quedan desacopladas: dos perillas, dos efectos."
        analogy="Girar tu mapa hasta que el norte del mapa coincida con tu marcha real: de golpe «adelante» y «a la derecha» se vuelven ejes limpios e independientes. Alinear el eje d con el flujo del rotor hace lo mismo con id (flujo) e iq (par)."
      >
        <Formula
          latex="\lambda_r = L_m\,i_d \qquad T = \frac{3}{2}\cdot\frac{p}{2}\cdot\frac{L_m}{L_r}\,\lambda_r\,i_q"
          symbols={[
            { sym: '\\lambda_r = L_m i_d', meaning: 'Con el eje d sobre el flujo del rotor, el enlace de flujo del rotor depende SOLO de id — el equivalente exacto a la corriente de campo de una máquina de CD.' },
            { sym: 'T \\propto \\lambda_r\\,i_q', meaning: 'El par es el flujo (fijado por id) por la corriente de cuadratura iq. A flujo constante, T es LINEAL en iq: iq es el equivalente a la corriente de armadura. Cambiar iq cambia el par al instante sin tocar el flujo.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="4.3 · Por qué esto habilita servos y robótica"
        idea="Como id se fija en su valor nominal (flujo pleno) y el par se manda solo con iq de forma lineal e instantánea, el motor de inducción responde a cambios bruscos con la agilidad de un motor de CD — pero sin escobillas ni conmutador que se desgasten. Eso lo vuelve apto para servomotores, tracción eléctrica de precisión y robótica, donde el par debe seguir órdenes que cambian en milisegundos."
        analogy="Es como pasar de conducir con un embrague que patina (respuesta lenta y borrosa) a una transmisión directa: pisas y responde YA. El FOC le da al robusto y barato motor de inducción los reflejos del caro motor de CD."
      >
        <p>
          En el laboratorio: con id = {id} A el flujo queda fijo en {fmt(flux, 3)} Wb. Doblar iq de{' '}
          {iq1} a {iq2} A dobla el par de {fmt(T1, 2)} a {fmt(T2, 2)} N·m —{' '}
          <strong>sin que el flujo se mueva</strong>. Mueve las perillas y compruébalo.
        </p>
      </ConceptBlock>

      <FocLab />

      <FeynmanCheck
        id="c8s4-check-desacoplo"
        question="¿Qué hace exactamente el FOC para que id controle solo el flujo e iq solo el par?"
        options={[
          {
            label: 'Alinea el eje d del marco síncrono con el vector de flujo del rotor; con esa referencia, λr = Lm·id (solo id) y T ∝ λr·iq (par por iq a flujo fijo).',
            correct: true,
            feedback:
              'Exacto. La clave es la ELECCIÓN del marco: no cualquier marco síncrono, sino el que tiene su eje d clavado en el flujo del rotor. En ese sistema, la componente del flujo del rotor sobre q es cero por construcción, así que λr depende solo de id, y el par queda como (constante)·λr·iq. Desacoplas los dos como en una máquina de CD.',
          },
          {
            label: 'Aumenta la frecuencia de conmutación del inversor hasta que par y flujo se separan.',
            feedback:
              'La frecuencia de conmutación (PWM) afecta la calidad de la corriente, no el desacoplamiento. El desacoplo es un resultado del CAMBIO DE COORDENADAS (alinear el eje d con el flujo del rotor), no de conmutar más rápido.',
          },
          {
            label: 'Anula la resistencia del rotor mediante realimentación.',
            feedback:
              'El FOC no cancela resistencias físicas. Logra el desacoplo geométricamente: al poner el eje d sobre el flujo del rotor, las ecuaciones del par y del flujo se separan en id e iq de forma natural.',
          },
        ]}
      />

      <FeynmanCheck
        id="c8s4-check-iq"
        question="En FOC, con el flujo fijado en su valor nominal (id constante), necesitas duplicar el par al instante. ¿Qué haces?"
        options={[
          {
            label: 'Duplicar iq: como T ∝ λr·iq y λr es constante, el par es lineal en iq y responde de inmediato — sin tocar el flujo.',
            correct: true,
            feedback:
              'Correcto. Ese es todo el poder del FOC: fijado el flujo con id, el par es una función LINEAL de iq (T = k·λr·iq). Duplicar iq duplica el par en el tiempo que tarda el lazo de corriente (milisegundos), sin transitorio de flujo ni pérdida de sincronismo. Es exactamente cómo se controla el par de un motor de CD con su corriente de armadura.',
          },
          {
            label: 'Duplicar id para reforzar el campo.',
            feedback:
              'Subir id sube el flujo, lo que también sube el par (T ∝ λr·iq) — pero de forma lenta (el flujo del rotor tiene una constante de tiempo grande, Lr/Rr) y arriesga saturar el hierro. El par se manda por iq, que es rápido y lineal; id se reserva para fijar el flujo.',
          },
          {
            label: 'Aumentar la frecuencia de alimentación.',
            feedback:
              'Eso es control escalar (V/f), lento y sin desacoplo. En FOC no mandas frecuencia sino las corrientes id, iq directamente. El par se duplica duplicando iq, no cambiando la frecuencia.',
          },
        ]}
      />

      <SolvedProblem
        id="c8s4-problema-foc"
        numero="35"
        title="Desacoplar flujo y par en FOC"
        statement={
          <>
            En un accionamiento FOC (p = {p.polePairs} pares de polos, Lm = {fmt(p.Lm, 3)} H, Lr ={' '}
            {fmt(p.Lr, 3)} H) se fija id = {id} A para el flujo nominal. Halle <strong>(a)</strong> el
            flujo del rotor, <strong>(b)</strong> el par con iq = {iq1} A y con iq = {iq2} A, y{' '}
            <strong>(c)</strong> explique por qué el flujo no cambia al variar iq.
          </>
        }
        steps={[
          {
            title: '(a) El flujo del rotor lo fija id',
            why: 'Con el eje d alineado al flujo del rotor, λr = Lm·id — depende solo de la corriente de eje directo.',
            work: `\\lambda_r = L_m\\,i_d = ${fmt(p.Lm, 3)} \\times ${id} = ${fmt(flux, 3)}\\ \\text{Wb}`,
          },
          {
            title: '(b) El par lo fija iq (lineal)',
            why: 'T = (3/2)(p/2)(Lm/Lr)·λr·iq. A flujo fijo, doblar iq dobla el par.',
            work: `T(${iq1}) = \\tfrac{3}{2}\\cdot${p.polePairs}\\cdot\\tfrac{${fmt(p.Lm, 3)}}{${fmt(p.Lr, 3)}}\\cdot${fmt(flux, 3)}\\cdot${iq1} = ${fmt(T1, 2)}\\ \\text{N·m} \\quad T(${iq2}) = ${fmt(T2, 2)}\\ \\text{N·m}`,
          },
          {
            title: '(c) Por qué el flujo no se inmuta',
            why: 'λr = Lm·id no contiene iq: la corriente de cuadratura es perpendicular al flujo del rotor y no lo refuerza ni lo debilita. Ese es el desacoplamiento.',
            work: `\\frac{\\partial \\lambda_r}{\\partial i_q} = 0 \\quad\\Rightarrow\\quad \\text{iq mueve el par, jam\\'as el flujo}`,
            note: 'Dos perillas independientes: id (flujo, se deja fijo) e iq (par, se controla). Igual que campo y armadura en una máquina de CD — pero en una jaula de ardilla sin escobillas.',
          },
        ]}
        answer={`\\lambda_r = ${fmt(flux, 3)}\\ \\text{Wb (solo id)} \\quad T: ${fmt(T1, 2)} \\to ${fmt(T2, 2)}\\ \\text{N·m al doblar iq} \\quad \\partial\\lambda_r/\\partial i_q = 0`}
        takeaway="El FOC alinea el marco síncrono con el flujo del rotor y parte la corriente en id (flujo) e iq (par), desacoplados. El par se vuelve lineal e instantáneo en iq — el motor de inducción hereda los reflejos del de CD y conquista la robótica y los servos."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C8 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El FOC alinea el eje d con el flujo del rotor: <InlineMath latex="\lambda_r = L_m i_d" /> (solo id), <InlineMath latex="T\propto\lambda_r i_q" /> (par por iq).</li>
          <li>Desacoplado como una máquina de CD: id = «corriente de campo», iq = «corriente de armadura».</li>
          <li>A flujo fijo, el par es lineal e instantáneo en iq — de ahí los servos, la tracción de precisión y la robótica.</li>
        </ul>
      </div>
    </section>
  )
}
