import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import VfControlLab from '../widgets/VfControlLab'
import { DEFAULT_INDUCTION, fmt, inductionAtFreq, inductionMaxTorque, vfVoltage } from '../lib/machine'

/** Capítulo 8, Sección 3 — Control escalar V/f. */
export default function C8Section3() {
  const base = DEFAULT_INDUCTION
  const fBase = 60
  const Vrated = base.V
  const boost = 15
  const Vline = Math.round(Vrated * Math.sqrt(3))

  const tmaxAt = (f: number) => inductionMaxTorque(inductionAtFreq(base, f, vfVoltage(f, fBase, Vrated, boost))).Tmax
  const T30 = tmaxAt(30)
  const T60 = tmaxAt(60)
  const T90 = tmaxAt(90)
  const V30 = vfVoltage(30, fBase, Vrated, boost)

  return (
    <section id="c8-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Capítulo 8 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Control escalar V/f: mover la curva sin perder el flujo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El método más usado en variadores comerciales. Para cambiar la velocidad se cambia la
          frecuencia — pero hay que subir la tensión con ella, o el motor se ahoga o se satura.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · Cambiar la velocidad = cambiar la frecuencia"
        idea="La velocidad síncrona es nₛ = 120f/p: la única forma limpia de cambiarla es cambiar la frecuencia f. Un inversor puede entregar cualquier f, así que barriendo la frecuencia se barre la velocidad. Toda la familia de curvas par-velocidad se desliza horizontalmente con f."
        analogy="La frecuencia es el metrónomo del campo giratorio: acelerarlo o frenarlo mueve la velocidad de toda la orquesta. El inversor es un metrónomo ajustable — y la curva par-velocidad sigue al compás."
      >
        <Formula
          latex="n_s = \frac{120\,f}{p} \quad\Rightarrow\quad \text{variar } f \text{ desliza toda la curva } T\text{-}n"
          symbols={[
            { sym: 'f', meaning: 'Frecuencia de salida del inversor: la perilla de velocidad. Baja f → curva a la izquierda (motor lento); alta f → curva a la derecha (sobrevelocidad).' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.2 · V/f constante: el secreto del flujo"
        idea="El flujo del entrehierro es proporcional a V/f (de la ley de Faraday: E ≈ 4.44·f·N·Φ, con E ≈ V). Si bajas la frecuencia sin bajar la tensión, el flujo se dispara y el hierro se SATURA (corriente enorme). Si la subes sin subir la tensión, el flujo se derrumba y el par se pierde. La regla de oro: mantener V/f constante conserva el flujo — y con él, el par máximo."
        analogy="Como ajustar el gas y el aire de un quemador a la vez: si cambias uno solo, o apagas la llama (poco flujo) o la conviertes en un soplete peligroso (saturación). V/f constante mantiene la mezcla — la llama (el flujo) arde igual a cualquier potencia."
      >
        <Formula
          latex="\Phi \propto \frac{V}{f} = \text{constante} \quad\Rightarrow\quad T_{max} \text{ se mantiene}"
          symbols={[
            { sym: '\\Phi \\propto V/f', meaning: 'El flujo del entrehierro sigue el cociente tensión/frecuencia. Mantenerlo constante evita saturar el hierro a baja f y perder par a alta f.' },
            { sym: 'T_{max}', meaning: 'El par de ruptura depende del flujo al cuadrado. Con V/f constante el flujo no cambia, así que Tmax se conserva mientras subes la velocidad — región de par constante.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.3 · Dos regiones: par constante y debilitamiento de campo"
        idea="Por debajo de la frecuencia nominal se mantiene V/f constante: flujo pleno, par máximo disponible constante (región de PAR CONSTANTE). Pero la tensión no puede pasar de su límite físico (el del bus de CD). Por encima de la nominal, V se estanca y solo sube f: el flujo cae como 1/f y el par máximo como 1/f². El producto par×velocidad se mantiene ≈ constante: es la región de POTENCIA CONSTANTE o debilitamiento de campo."
        analogy="Una bici con cambios: abajo (par constante) pedaleas con la misma fuerza a distintas velocidades. Al llegar al plato más grande (tensión al máximo) ya no puedes meter más fuerza; para ir más rápido solo aumentas cadencia y la fuerza en el pedal baja — misma potencia, menos par. Eso es el debilitamiento de campo."
      >
        <p>
          En el laboratorio: con V/f constante, Tmax a 30 Hz ({fmt(T30, 0)} N·m) y a 60 Hz ({fmt(T60, 0)}{' '}
          N·m) son casi iguales; pero a 90 Hz, con la tensión ya saturada, cae a {fmt(T90, 0)} N·m
          (≈ Tmax·(60/90)²). Barre la frecuencia y observa las dos regiones.
        </p>
      </ConceptBlock>

      <VfControlLab />

      <FeynmanCheck
        id="c8s3-check-vf"
        question="Quieres operar un motor a la mitad de su velocidad nominal. Bajas la frecuencia a 30 Hz pero dejas la tensión en su valor de 60 Hz. ¿Qué ocurre?"
        options={[
          {
            label: 'El motor funciona perfecto a media velocidad con más par disponible.',
            feedback:
              'No: al dejar la tensión alta y bajar f, el cociente V/f se DUPLICA, y con él el flujo. El hierro se satura muchísimo, la corriente magnetizante se dispara y el motor se sobrecalienta. Más V/f no es «más par gratis», es saturación.',
          },
          {
            label: 'El flujo se duplica (V/f al doble), el núcleo se satura y la corriente magnetizante se dispara: hay que BAJAR también la tensión para mantener V/f constante.',
            correct: true,
            feedback:
              'Correcto. Φ ∝ V/f: si f baja a la mitad y V se queda igual, el flujo intenta duplicarse. Pero el hierro satura mucho antes, así que en realidad la corriente crece sin límite útil, el motor zumba y se calienta. La regla V/f constante existe justo para evitar esto: a 30 Hz la tensión debe bajar a ~la mitad (más el pequeño boost). Ese es el corazón del control escalar.',
          },
          {
            label: 'No pasa nada porque el flujo solo depende de la corriente.',
            feedback:
              'El flujo del entrehierro lo fija la tensión aplicada y la frecuencia (E ≈ 4.44·f·N·Φ, con E ≈ V), no directamente la corriente. Al fijar V y bajar f, obligas al flujo a subir, y la corriente magnetizante es la CONSECUENCIA (enorme, por la saturación), no la causa.',
          },
        ]}
      />

      <FeynmanCheck
        id="c8s3-check-debilitamiento"
        question="Por encima de la frecuencia nominal, ¿por qué el par máximo disponible cae aunque el inversor entregue más frecuencia?"
        options={[
          {
            label: 'Porque la tensión ya está en su límite físico (el bus de CD): no puede seguir a la frecuencia, así que V/f (y el flujo) caen como 1/f, y el par máximo, que va con el flujo², cae como 1/f².',
            correct: true,
            feedback:
              'Exacto. La región de debilitamiento de campo. Por debajo de la nominal V sube con f (flujo constante, par constante). Pero V topa en el máximo del bus; por encima, subir f con V fija hace V/f ∝ 1/f → flujo ∝ 1/f → Tmax ∝ flujo² ≈ 1/f². El motor da más velocidad a costa de par, manteniendo ≈ potencia constante — igual que las marchas largas de una bici.',
          },
          {
            label: 'Porque la resistencia del rotor aumenta con la frecuencia.',
            feedback:
              'La resistencia efectiva puede variar algo con la frecuencia (efecto pelicular), pero no es la causa del debilitamiento de campo. La razón es que la tensión no puede pasar de su tope, así que el flujo cae con 1/f y arrastra al par máximo con 1/f².',
          },
          {
            label: 'Porque a alta velocidad la fricción consume todo el par.',
            feedback:
              'La fricción crece con la velocidad pero no explica la caída del par MÁXIMO DISPONIBLE (una propiedad electromagnética). Esa caída viene del flujo debilitado cuando la tensión se satura por encima de la frecuencia nominal.',
          },
        ]}
      />

      <SolvedProblem
        id="c8s3-problema-vf"
        numero="34"
        title="Ajustar la tensión de un variador V/f"
        statement={
          <>
            Un motor de {Vline} V, 60 Hz se controla con un variador V/f (tensión nominal por fase{' '}
            {fmt(Vrated, 0)} V, con un pequeño boost de {boost} V). Halle <strong>(a)</strong> la
            tensión que debe aplicar el inversor a 30 Hz, <strong>(b)</strong> por qué el par máximo a
            30 Hz es casi igual al de 60 Hz, y <strong>(c)</strong> qué pasa con el par máximo a 90 Hz.
          </>
        }
        steps={[
          {
            title: '(a) Tensión a 30 Hz (región de par constante)',
            why: 'V/f constante con boost: la tensión sube linealmente con la frecuencia desde el boost hasta la nominal.',
            work: `V(30) = ${boost} + (${fmt(Vrated, 0)} - ${boost})\\tfrac{30}{60} = ${fmt(V30, 0)}\\ \\text{V}`,
            note: 'Aproximadamente la mitad de la tensión nominal (más el boost) — así V/f se mantiene y el flujo también.',
          },
          {
            title: '(b) Par máximo a 30 Hz ≈ a 60 Hz',
            why: 'Como V/f (y el flujo) se conserva, el par de ruptura, que depende del flujo, apenas cambia: la curva solo se desliza a la izquierda.',
            work: `T_{max}(30) = ${fmt(T30, 0)}\\ \\text{N·m} \\;\\approx\\; T_{max}(60) = ${fmt(T60, 0)}\\ \\text{N·m}`,
            note: 'La ligera diferencia se debe a la caída en R₁, más notable a baja frecuencia — por eso existe el boost.',
          },
          {
            title: '(c) Par máximo a 90 Hz (debilitamiento de campo)',
            why: 'A 90 Hz la tensión ya no puede crecer (topa en la nominal), así que V/f cae como 60/90 y el par máximo como (60/90)².',
            work: `T_{max}(90) \\approx T_{max}(60)\\left(\\tfrac{60}{90}\\right)^2 = ${fmt(T60, 0)} \\times 0.44 \\approx ${fmt(T90, 0)}\\ \\text{N·m}`,
            note: 'El motor gira 50% más rápido que su nominal pero con menos de la mitad del par máximo: región de potencia constante.',
          },
        ]}
        answer={`V(30) = ${fmt(V30, 0)}\\ \\text{V} \\quad T_{max}(30)\\approx T_{max}(60) = ${fmt(T60, 0)}\\ \\text{N·m} \\quad T_{max}(90) \\approx ${fmt(T90, 0)}\\ \\text{N·m}`}
        takeaway="V/f constante mantiene el flujo y desliza la curva de par sin perder altura (par constante) hasta la frecuencia nominal. Por encima, la tensión se satura y el par cae como 1/f² (debilitamiento de campo, potencia constante). Es el control de velocidad más simple y extendido."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C8 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Se cambia la velocidad cambiando la frecuencia; la curva par-velocidad se desliza con f.</li>
          <li>El flujo es <InlineMath latex="\Phi\propto V/f" />: mantener V/f constante evita saturar (baja f) y perder par (alta f).</li>
          <li>Debajo de la nominal: par constante. Encima: la tensión se satura, <InlineMath latex="T_{max}\propto 1/f^2" /> — debilitamiento de campo (potencia constante).</li>
        </ul>
      </div>
    </section>
  )
}
