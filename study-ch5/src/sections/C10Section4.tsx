import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import StartingTransientLab from '../widgets/StartingTransientLab'
import { DEFAULT_DCDYN, dcStartCurrent, fmt } from '../lib/machine'

/** Capítulo 10, Sección 4 — Transitorios por cortocircuito y arranque directo. */
export default function C10Section4() {
  const p = DEFAULT_DCDYN
  const IRated = 60
  const Iarr = dcStartCurrent(p.Vt, p.Ra)
  const Rstart = 2.0
  const IarrR = dcStartCurrent(p.Vt, p.Ra + Rstart)

  return (
    <section id="c10-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
          Capítulo 10 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Arranque directo y cortocircuito: la corriente sin freno
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sin contra-FEM que la limite, la corriente solo la frena la resistencia de armadura. En el
          arranque y en una falla, eso significa corrientes enormes y fuerzas destructivas.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · El arranque directo: Iarr = Vt/Ra"
        idea="A rotor parado (ω = 0) no hay FEM inducida (Ea = 0), así que la corriente de armadura solo la limita la resistencia Ra, que es diminuta: Iarr = Vt/Ra puede ser 10-20 veces la nominal. Ese pico da un tirón de par brutal y puede quemar las escobillas y el colector. Conforme el motor acelera, la FEM crece y la corriente cae exponencialmente hacia su valor de trabajo."
        analogy="Soltar de golpe un resorte comprimido: sin nada que frene el primer instante, el impulso es máximo. La contra-FEM es el freno que solo aparece cuando el motor ya se mueve — al principio no está."
      >
        <Formula
          latex="I_{arr} = \frac{V_t - E_a}{R_a}\Big|_{\omega=0} = \frac{V_t}{R_a} \;\gg\; I_{nom}"
          symbols={[
            { sym: 'E_a = 0', meaning: 'A velocidad cero no hay contra-FEM: nada resta a Vt. Este es el instante más peligroso del arranque.' },
            { sym: 'V_t/R_a', meaning: 'La corriente de arranque a rotor bloqueado. Como Ra es pequeña (para tener buen rendimiento), esta corriente es enorme — de ahí la necesidad de arrancadores.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="4.2 · La solución: resistencia de arranque por pasos"
        idea="Para limitar ese pico se inserta una resistencia en SERIE con la armadura durante el arranque: Iarr = Vt/(Ra + Rarr). A medida que el motor gana velocidad y aparece la FEM, la resistencia se retira por pasos, hasta quedar solo Ra en marcha. Los variadores electrónicos hacen lo mismo, pero limitando la corriente por control (Sección 5), sin resistencias que disipen energía."
        analogy="Arrancar en una cuesta soltando el embrague poco a poco en vez de de golpe: la resistencia de arranque «desliza» la conexión para que el tirón inicial no sea brutal."
      >
        <p>
          Con los parámetros del laboratorio, el arranque directo daría{' '}
          <InlineMath latex={`I_{arr} = ${fmt(Iarr, 0)}`} /> A (≈ {fmt(Iarr / IRated, 1)}× la nominal);
          con una resistencia de arranque de {Rstart} Ω baja a{' '}
          <InlineMath latex={`${fmt(IarrR, 0)}`} /> A. Muévela en el laboratorio.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="4.3 · El cortocircuito de un generador de CC"
        idea="Un generador de CC que sufre un cortocircuito en sus terminales vive el mismo drama al revés: en el primer instante, la FEM Ea sigue presente (la velocidad no cambia de golpe) y se descarga sobre la resistencia diminuta del circuito, dando una corriente de falla máxima ≈ Ea/Ra. Esa corriente, sumada al flujo, genera fuerzas mecánicas enormes sobre las bobinas y el colector en los primeros milisegundos — capaces de deformar conductores o arrancar delgas."
        analogy="Una presa que revienta: toda la energía almacenada (el flujo y la inercia) se libera de golpe por la brecha (el cortocircuito). Los primeros milisegundos son los más violentos, antes de que el sistema decaiga."
      >
        <p>
          En ambos casos —arranque directo y cortocircuito— la lección es la misma: sin FEM que la
          limite (o con la FEM descargándose sin control), la corriente la fija solo Ra, y las fuerzas
          mecánicas asociadas (F ∝ B·i) pueden ser destructivas. Por eso todo diseño incluye limitación
          de corriente.
        </p>
      </ConceptBlock>

      <StartingTransientLab />

      <FeynmanCheck
        id="c10s4-check-arranque"
        question="¿Por qué la corriente de arranque directo de un motor de CC es tan grande (Vt/Ra), muchas veces la nominal?"
        options={[
          {
            label: 'Porque a rotor parado la contra-FEM Ea = Ka·Φ·ω es cero (ω = 0), así que nada resta a Vt y la corriente solo la limita la pequeña Ra.',
            correct: true,
            feedback:
              'Exacto. En marcha, la corriente es (Vt − Ea)/Ra, y Ea es casi tan grande como Vt, dejando una corriente modesta. Pero al arrancar, ω = 0 → Ea = 0, y la corriente es Vt/Ra completa. Como Ra se diseña pequeña (para no desperdiciar energía en marcha), esta corriente de arranque es enorme — típicamente 10-20× la nominal. La contra-FEM es el «regulador» natural que en el arranque todavía no existe.',
          },
          {
            label: 'Porque la inductancia La deja pasar toda la corriente al arrancar.',
            feedback:
              'La inductancia en realidad RALENTIZA la subida de la corriente (le da su τe). El pico enorme se debe a la AUSENCIA de contra-FEM a velocidad cero, no a la inductancia. La·di/dt limita la rapidez, pero el valor hacia el que tiende es Vt/Ra.',
          },
          {
            label: 'Porque el par de carga es máximo en el arranque.',
            feedback:
              'El par de carga influye en el régimen final, pero el pico de corriente de arranque es un fenómeno ELÉCTRICO: aparece incluso sin carga, porque a ω = 0 no hay contra-FEM y la corriente es Vt/Ra.',
          },
        ]}
      />

      <FeynmanCheck
        id="c10s4-check-corto"
        question="En un cortocircuito de un generador de CC, ¿por qué las fuerzas mecánicas son máximas en los primeros milisegundos?"
        options={[
          {
            label: 'Porque la velocidad (y con ella la FEM) no puede cambiar instantáneamente: en el primer instante Ea sigue alta y se descarga sobre Ra ≈ 0, dando la corriente de falla máxima, y la fuerza va con B·i.',
            correct: true,
            feedback:
              'Correcto. La inercia impide que la velocidad (y la FEM Ea = Ka·Φ·ω) caiga de golpe. Así, justo tras el cortocircuito, esa FEM casi intacta ve una resistencia casi nula (Ra) y produce una corriente de falla enorme ≈ Ea/Ra. Como la fuerza sobre los conductores es F ∝ B·i, esa corriente máxima da fuerzas máximas — capaces de deformar bobinas o arrancar delgas. Luego el sistema se frena y decae, así que el peligro está al principio.',
          },
          {
            label: 'Porque el cortocircuito calienta el cobre y lo dilata.',
            feedback:
              'El calentamiento existe pero es más lento y no es la causa de las fuerzas mecánicas destructivas del primer instante. Esas fuerzas (F ∝ B·i) vienen de la corriente de falla máxima, que ocurre justo tras la falla porque la FEM aún no ha decaído.',
          },
          {
            label: 'Porque la inductancia libera toda su energía de golpe.',
            feedback:
              'La inductancia de hecho SUAVIZA el cambio de corriente. La corriente de falla máxima la fija la FEM (que la inercia mantiene) dividida por la resistencia diminuta. Las fuerzas máximas coinciden con esa corriente máxima inicial.',
          },
        ]}
      />

      <SolvedProblem
        id="c10s4-problema-arranque"
        numero="45"
        title="Limitar la corriente de arranque"
        statement={
          <>
            Un motor de CC (Vt = {p.Vt} V, Ra = {p.Ra} Ω, corriente nominal {IRated} A) va a arrancar.
            Halle <strong>(a)</strong> la corriente de arranque directo y su múltiplo de la nominal,{' '}
            <strong>(b)</strong> la resistencia de arranque necesaria para limitarla a 2× la nominal, y{' '}
            <strong>(c)</strong> comente el paralelo con el cortocircuito de un generador.
          </>
        }
        steps={[
          {
            title: '(a) Arranque directo',
            why: 'A ω = 0, Ea = 0: la corriente es Vt/Ra.',
            work: `I_{arr} = \\frac{V_t}{R_a} = \\frac{${p.Vt}}{${p.Ra}} = ${fmt(Iarr, 0)}\\ \\text{A} = ${fmt(Iarr / IRated, 1)}\\times I_{nom}`,
            note: 'Ocho veces la nominal: inaceptable para las escobillas y el par.',
          },
          {
            title: '(b) Resistencia de arranque para 2× nominal',
            why: 'Queremos Vt/(Ra + Rarr) = 2·Inom; despejamos Rarr.',
            work: `R_a + R_{arr} = \\frac{V_t}{2 I_{nom}} = \\frac{${p.Vt}}{${2 * IRated}} = ${fmt(p.Vt / (2 * IRated), 2)}\\ \\Omega \\;\\Rightarrow\\; R_{arr} = ${fmt(p.Vt / (2 * IRated) - p.Ra, 2)}\\ \\Omega`,
            note: 'Se retira por pasos al ganar velocidad, hasta quedar solo Ra en marcha.',
          },
          {
            title: '(c) El paralelo con el cortocircuito',
            why: 'Ambos son «corriente sin contra-FEM que la limite».',
            work: `\\text{arranque: } E_a = 0 \\;/\\; \\text{cortocircuito: } E_a \\text{ intacta sobre } R_a\\approx 0 \\;\\Rightarrow\\; i \\text{ enorme}`,
            note: 'En los dos casos la corriente la fija solo Ra, y las fuerzas (F ∝ B·i) pueden ser destructivas. La cura moderna: limitar la corriente por control.',
          },
        ]}
        answer={`I_{arr} = ${fmt(Iarr, 0)}\\ \\text{A} = ${fmt(Iarr / IRated, 1)}\\times I_{nom}; \\;\\; R_{arr} = ${fmt(p.Vt / (2 * IRated) - p.Ra, 2)}\\ \\Omega \\text{ para limitar a } 2\\times`}
        takeaway="Sin contra-FEM, la corriente la fija solo Ra: Iarr = Vt/Ra en el arranque, y ≈ Ea/Ra en un cortocircuito de generador. Ambas son enormes y con fuerzas destructivas. La solución: resistencia de arranque por pasos o, mejor, limitación de corriente por control."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C10 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Arranque directo: <InlineMath latex="I_{arr} = V_t/R_a" /> (ω = 0 ⇒ sin FEM), decae al ganar velocidad.</li>
          <li>Cortocircuito de generador: la FEM (que la inercia mantiene) se descarga sobre Ra ≈ 0 → corriente y fuerzas máximas al inicio.</li>
          <li>Solución clásica: resistencia de arranque por pasos; solución moderna: limitación de corriente por control (Sección 5).</li>
        </ul>
      </div>
    </section>
  )
}
