import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DcConnectionLab from '../widgets/DcConnectionLab'
import { DEFAULT_DC, dcOperatingByIa, fmt } from '../lib/machine'

/** Capítulo 9, Sección 3 — Circuitos equivalentes y métodos de excitación. */
export default function C9Section3() {
  const p = DEFAULT_DC
  const shuntFull = dcOperatingByIa('shunt', p, 40)
  const shuntNo = dcOperatingByIa('shunt', p, 4)
  const serieFull = dcOperatingByIa('serie', p, 40)
  const serieLight = dcOperatingByIa('serie', p, 5)
  const droop = ((shuntNo.rpm - shuntFull.rpm) / shuntNo.rpm) * 100

  return (
    <section id="c9-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Capítulo 9 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Circuitos y excitación: cómo se conecta el campo lo cambia todo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El mismo hierro y el mismo cobre, conectados distinto, dan un regulador de velocidad (shunt) o
          una bestia de par que se embala en vacío (serie). El campo es la clave.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · La ecuación de malla: Vt = Ea ± Ia·Ra"
        idea="En un MOTOR, la tensión de terminales vence la contra-FEM más la caída resistiva: Vt = Ea + Ia·Ra. En un GENERADOR, la FEM debe cubrir la tensión más la caída: Ea = Vt + Ia·Ra, es decir Vt = Ea − Ia·Ra. El signo distingue quién empuja a quién. Con Vt = Ea + IaRa y Ea = Ka·Φ·ω sale la velocidad: ω = (Vt − Ia·Ra)/(Ka·Φ)."
        analogy="Subir (motor) o bajar (generador) una cuesta con el freno motor: en subida el motor vence la gravedad más el rozamiento; en bajada la gravedad vence al freno. El signo de la caída resistiva marca la dirección del flujo de energía."
      >
        <Formula
          latex="\text{motor: } V_t = E_a + I_a R_a \qquad \omega_m = \frac{V_t - I_a R_a}{K_a\Phi}"
          symbols={[
            { sym: 'V_t = E_a + I_a R_a', meaning: 'Malla de armadura del motor: la fuente Vt cubre la contra-FEM Ea (que se opone) más la caída en Ra. En generador el signo se invierte: Vt = Ea − Ia·Ra.' },
            { sym: '\\omega_m = \\frac{V_t - I_a R_a}{K_a\\Phi}', meaning: 'La velocidad de un motor de CC: sube con la tensión, baja un poco con la carga (por Ia·Ra), y sube si DEBILITAS el flujo Φ — la base del control por campo.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="3.2 · Shunt / independiente: velocidad casi constante"
        idea="Con el campo en paralelo (shunt) o alimentado aparte (independiente), el flujo Φ es prácticamente FIJO (no depende de la carga). Entonces la velocidad ω = (Vt − Ia·Ra)/(Ka·Φ) solo baja un poquito al cargar, por la pequeña caída Ia·Ra. Resultado: un excelente regulador de velocidad, casi plano de vacío a plena carga."
        analogy="Un control de crucero: pise quien pise, mantiene casi la misma velocidad. El flujo fijo es el que ancla la velocidad; la carga solo la roza."
      >
        <p>
          En el laboratorio, el motor shunt pasa de {fmt(shuntNo.rpm, 0)} r/min en vacío a{' '}
          {fmt(shuntFull.rpm, 0)} r/min a plena carga: una caída de apenas {fmt(droop, 1)} %.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="3.3 · Serie: par cuadrático y el peligro del embalamiento"
        idea="Con el campo en SERIE con la armadura, el flujo Φ crece con la propia corriente Ia. Entonces el par T = Ka·Φ·Ia ∝ Ia² (¡par enorme en el arranque!), ideal para tracción y grúas. Pero al descargar, Ia → 0, el flujo se desvanece y ω = Ea/(Ka·Φ) se DISPARA: el motor serie se embala hasta destruirse. Regla de oro: nunca arranques un motor serie sin carga."
        analogy="Un buey extraordinariamente fuerte para arrancar la carreta cargada (par ∝ Ia²), pero que si le quitas la carga sale corriendo desbocado sin nada que lo frene. La carga es lo que lo mantiene a raya."
      >
        <Formula
          latex="\text{serie: } \Phi \propto I_a \;\Rightarrow\; T = K_a\Phi I_a \propto I_a^2, \quad \omega = \frac{E_a}{K_a\Phi} \xrightarrow{I_a\to 0} \infty"
          symbols={[
            { sym: 'T \\propto I_a^2', meaning: 'Par cuadrático: en el arranque, con Ia grande, el par es enorme. Por eso el motor serie mueve trenes y grúas.' },
            { sym: '\\omega \\to \\infty', meaning: 'Embalamiento en vacío: sin carga, Ia → 0, el flujo colapsa y la velocidad se dispara sin freno eléctrico. Peligro físico real.' },
          ]}
        />
        <p>
          En el laboratorio: el motor serie a {fmt(serieFull.Ia, 0)} A da {fmt(serieFull.T, 0)} N·m a{' '}
          {fmt(serieFull.rpm, 0)} r/min; pero al bajar a {fmt(serieLight.Ia, 0)} A trepa a{' '}
          {fmt(serieLight.rpm, 0)} r/min — camino del embalamiento.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="3.4 · Compuesta: el compromiso"
        idea="La conexión compuesta combina un campo shunt (fijo) con uno serie (variable). En ACUMULATIVA los dos flujos se suman: hereda buen par de arranque del serie pero, gracias al shunt, NO se embala en vacío — el compromiso ideal. En DIFERENCIAL se restan: la velocidad se mantiene aún más plana, pero se vuelve inestable si el serie llega a dominar."
        analogy="Un coche híbrido de par: un motor base siempre presente (shunt) más un refuerzo que aparece con la carga (serie). Tienes empuje extra al arrancar sin perder el control a alta velocidad."
      >
        <p>
          La compuesta acumulativa es la más usada cuando se necesita a la vez arranque enérgico y
          seguridad en vacío. Compáralas todas en el laboratorio.
        </p>
      </ConceptBlock>

      <DcConnectionLab />

      <FeynmanCheck
        id="c9s3-check-shunt"
        question="¿Por qué un motor de CC en conexión shunt mantiene la velocidad casi constante de vacío a plena carga?"
        options={[
          {
            label: 'Porque su campo (y por tanto el flujo Φ) es fijo, así que la velocidad ω = (Vt − Ia·Ra)/(Ka·Φ) solo baja lo poco que aporta la caída Ia·Ra al cargar.',
            correct: true,
            feedback:
              'Exacto. En shunt el campo se alimenta de una tensión constante, así que Φ no cambia con la carga. La velocidad depende de (Vt − Ia·Ra)/(Ka·Φ); como Ra es pequeña, la caída Ia·Ra al cargar es modesta y la velocidad apenas droop. Es el regulador de velocidad natural entre los motores de CC.',
          },
          {
            label: 'Porque la corriente de armadura no cambia con la carga.',
            feedback:
              'Al revés: la corriente de armadura SÍ crece con la carga (es lo que produce más par). Lo que se mantiene constante es el FLUJO Φ (campo shunt fijo), y eso es lo que ancla la velocidad pese a que Ia sube.',
          },
          {
            label: 'Porque la resistencia de armadura es cero.',
            feedback:
              'Ra no es cero (si lo fuera, la velocidad sería PERFECTAMENTE constante). Es pequeña, y por eso la caída Ia·Ra apenas mueve la velocidad. El anclaje principal es el flujo fijo del campo shunt.',
          },
        ]}
      />

      <FeynmanCheck
        id="c9s3-check-serie"
        question="¿Por qué NUNCA se debe arrancar un motor serie sin carga mecánica acoplada?"
        options={[
          {
            label: 'Porque sin carga la corriente cae, el flujo (∝ Ia) se desvanece y la velocidad ω = Ea/(Ka·Φ) se dispara sin freno: el motor se embala hasta destruirse.',
            correct: true,
            feedback:
              'Correcto. En el motor serie el flujo lo hace la propia corriente de armadura (Φ ∝ Ia). Sin carga, Ia se vuelve pequeña, Φ colapsa, y como la velocidad es Ea/(Ka·Φ), con Φ → 0 la velocidad tiende a infinito. No hay ningún mecanismo eléctrico que la limite: la fuerza centrífuga puede reventar la armadura. Por eso los motores serie van siempre acoplados directamente (nunca por correa que pueda soltarse).',
          },
          {
            label: 'Porque sin carga consume demasiada corriente y se quema.',
            feedback:
              'Es lo contrario: sin carga consume POCA corriente. El peligro no es térmico sino de VELOCIDAD: con poca Ia el flujo colapsa y la velocidad se dispara. El embalamiento es mecánico, no un sobrecalentamiento.',
          },
          {
            label: 'Porque el par de arranque sería insuficiente.',
            feedback:
              'El par de arranque del motor serie es justamente su gran virtud (T ∝ Ia², enorme). El problema aparece en el otro extremo: al QUEDAR SIN carga, no al arrancar con ella. Es un problema de sobrevelocidad en vacío.',
          },
        ]}
      />

      <SolvedProblem
        id="c9s3-problema-conexiones"
        numero="39"
        title="Velocidad de un motor shunt y embalamiento del serie"
        statement={
          <>
            Un motor de CC (Vt = {p.Vt} V, Ra = {p.Ra} Ω, campo shunt con Ka·Φ = {p.KE} V·s/rad) acciona
            una carga. <strong>(a)</strong> Halle su velocidad en vacío (Ia = 4 A) y a plena carga
            (Ia = 40 A) y la caída porcentual. <strong>(b)</strong> Conectado en serie
            (Ka·Φ = {p.ks}·Ia, Rs = {p.Rs} Ω), compare su velocidad a 40 A y a 5 A.
          </>
        }
        steps={[
          {
            title: '(a) Shunt: velocidad casi constante',
            why: 'Con Φ fijo, ω = (Vt − Ia·Ra)/(Ka·Φ). Solo cambia la caída Ia·Ra.',
            work: `n_{vac\\'io} = \\frac{${p.Vt}-4\\times${p.Ra}}{${p.KE}}\\cdot\\tfrac{60}{2\\pi} = ${fmt(shuntNo.rpm, 0)}\\ \\text{r/min} \\quad n_{plena} = ${fmt(shuntFull.rpm, 0)}\\ \\text{r/min}`,
            note: `Caída de solo ${fmt(droop, 1)} %: un buen regulador de velocidad.`,
          },
          {
            title: '(b) Serie a plena carga (40 A)',
            why: 'Ahora Ka·Φ = ks·Ia crece con la corriente, y la malla incluye Rs.',
            work: `K_a\\Phi = ${p.ks}\\times 40 = ${fmt(serieFull.kPhi, 2)},\\quad n = \\frac{${p.Vt}-40\\times(${p.Ra}+${p.Rs})}{${fmt(serieFull.kPhi, 2)}}\\cdot\\tfrac{60}{2\\pi} = ${fmt(serieFull.rpm, 0)}\\ \\text{r/min}`,
          },
          {
            title: '(b) Serie descargado (5 A): el embalamiento',
            why: 'Con poca corriente, el flujo colapsa y la velocidad se dispara.',
            work: `K_a\\Phi = ${p.ks}\\times 5 = ${fmt(serieLight.kPhi, 3)},\\quad n = ${fmt(serieLight.rpm, 0)}\\ \\text{r/min}\\ (\\times ${fmt(serieLight.rpm / serieFull.rpm, 1)})`,
            note: 'La velocidad se multiplica al descargar: síntoma del embalamiento. En vacío total tendería a infinito.',
          },
        ]}
        answer={`\\text{Shunt: } ${fmt(shuntNo.rpm, 0)}\\to${fmt(shuntFull.rpm, 0)}\\ \\text{r/min } (${fmt(droop, 1)}\\%) \\qquad \\text{Serie: } ${fmt(serieFull.rpm, 0)}\\to${fmt(serieLight.rpm, 0)}\\ \\text{r/min al descargar}`}
        takeaway="La malla Vt = Ea + Ia·Ra con Ea = Ka·Φ·ω lo gobierna todo. Con Φ fijo (shunt) la velocidad es casi plana; con Φ ∝ Ia (serie) el par es cuadrático pero la máquina se embala al descargar. La compuesta acumulativa es el punto medio seguro."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C9 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Malla: <InlineMath latex="V_t = E_a + I_a R_a" /> (motor); <InlineMath latex="\omega = (V_t - I_a R_a)/K_a\Phi" />.</li>
          <li>Shunt: Φ fijo → velocidad casi constante. Serie: Φ ∝ Ia → <InlineMath latex="T\propto I_a^2" /> pero embalamiento en vacío.</li>
          <li>Compuesta acumulativa: par de arranque del serie sin su embalamiento — el compromiso.</li>
        </ul>
      </div>
    </section>
  )
}
