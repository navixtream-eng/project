import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import TransientPALab from '../widgets/TransientPALab'
import { fmt, pSalient, solveFromPQ, toRad } from '../lib/machine'

/** Escalera de reactancias típica: cada circuito adicional del rotor añade un peldaño. */
const LADDER: { sym: string; value: number; group: string; note: string }[] = [
  { sym: 'Xd', value: 1.1, group: 'sincrónicas', note: 'sin defensas: solo entrehierro y armadura' },
  { sym: 'Xq', value: 0.65, group: 'sincrónicas', note: 'menor que Xd por el entrehierro grande entre polos' },
  { sym: 'X′q', value: 0.65, group: 'transitorias', note: '≈ Xq en polos salientes: NO hay devanado de campo en el eje q' },
  { sym: 'X′d', value: 0.3, group: 'transitorias', note: 'el campo defiende su flujo en el eje d' },
  { sym: 'X″q', value: 0.25, group: 'subtransitorias', note: 'amortiguadores del eje q' },
  { sym: 'X″d', value: 0.2, group: 'subtransitorias', note: 'amortiguadores + campo, ambos defendiendo' },
]

const MODELS: { name: string; what: string; use: string; cost: string }[] = [
  {
    name: '1 · Clásico: E′ constante tras X′d',
    what: 'Una fuente congelada, una reactancia y la ecuación de oscilación. Sin decaimiento de flujo ni reguladores.',
    use: 'Primera oscilación (~1 s): tiempo crítico de despeje, criterio de áreas. Es el modelo de SwingLab y SyncLab.',
    cost: '2 estados por máquina — corre miles de casos por segundo.',
  },
  {
    name: '2 · E′q con decaimiento de flujo',
    what: 'E′q ya no es constante: decae con T′d0 y responde al regulador de tensión (AVR).',
    use: 'Estabilidad multi-oscilación (2–10 s): ¿el AVR rescata o empeora? Amortiguamiento de oscilaciones entre áreas.',
    cost: '3–4 estados + el modelo del AVR.',
  },
  {
    name: '3 · Subtransitorio de dos ejes',
    what: 'Agrega los circuitos amortiguadores: X″d, X″q, T″d, T″q. Reproduce los primeros ciclos.',
    use: 'Ajuste de protecciones, esfuerzos de interruptores, pares en el eje durante fallas.',
    cost: '5–6 estados por máquina.',
  },
  {
    name: '4 · Park completo (dq0)',
    what: 'Las ecuaciones diferenciales completas de la Sección 1, sin fasores: cada devanado con su dinámica.',
    use: 'Transitorios electromagnéticos (EMT): sobretensiones, resonancia subsíncrona, convertidores.',
    cost: 'Pasos de microsegundos — se paga con horas de cómputo.',
  },
]

/**
 * Capítulo 6, Sección 4 — La curva P-δ transitoria completa (saliencia
 * invertida), los efectos de los circuitos adicionales del rotor y la
 * escalera de modelos para análisis de transitorios.
 */
export default function C6Section4() {
  // Problema 15: números en vivo con la máquina de siempre
  const VT = 1.0
  const P0 = 0.9
  const Q0 = P0 * Math.tan(Math.acos(0.9))
  const XD = 1.1
  const XD1 = 0.3
  const XQ = 0.65
  const TD1 = 1.0
  const Ep = solveFromPQ(VT, P0, Q0, XD1).EafMag
  // Cresta transitoria por barrido numérico
  let peak = { deg: 0, P: -Infinity }
  for (let deg = 0; deg <= 180; deg++) {
    const t = pSalient(Ep, VT, XD1, XQ, toRad(deg)).total
    if (t > peak.P) peak = { deg, P: t }
  }
  const kRel = (VT * VT) / 2 * (1 / XQ - 1 / XD1)
  const Td0 = (TD1 * XD) / XD1

  return (
    <section id="c6-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
          Capítulo 6 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          La curva P-δ transitoria, los circuitos del rotor y la escalera de modelos
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Tres remates del capítulo: la característica transitoria completa (con una inversión de
          signo que sorprende), qué peldaño agrega cada circuito del rotor, y qué modelo usar para
          qué estudio.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · La característica transitoria completa: la saliencia se invierte"
        idea="La curva P-δ transitoria tiene los mismos dos términos que la de régimen — excitación más reluctancia — pero con X′d en el lugar de Xd. Y ahí ocurre la sorpresa: en régimen Xq < Xd y la joroba de reluctancia empuja la cresta ANTES de 90°; en el transitorio X′d < Xq, el término sen 2δ cambia de signo, y la cresta se corre MÁS ALLÁ de 90°."
        analogy="El mismo camino visto de ida y de vuelta: la pendiente que te frenaba ahora te empuja. La geometría del rotor no cambió — cambió CONTRA QUÉ se compara (el eje d defendido por el flujo atrapado ahora es el «fácil», y el eje q el «difícil»)."
      >
        <Formula
          latex="P = \frac{E'\,V_t}{X'_d}\,\text{sen}\,\delta \;+\; \frac{V_t^2}{2}\!\left(\frac{1}{X_q}-\frac{1}{X'_d}\right)\text{sen}\,2\delta"
          symbols={[
            { sym: "E'/X'_d", meaning: 'El término dominante: la fuente congelada tras la reactancia pequeña. Es el que hace la curva transitoria mucho más alta que la de régimen.' },
            { sym: '\\tfrac{1}{X_q}-\\tfrac{1}{X\'_d} < 0', meaning: 'La inversión: con X′d = 0.3 < Xq = 0.65 este paréntesis es NEGATIVO — la «joroba» de reluctancia ahora resta antes de 90° y suma después, empujando la cresta más allá de 90°.' },
            { sym: '\\delta_{cresta} > 90^\\circ', meaning: 'Consecuencia práctica: el margen angular transitorio es un poco más generoso de lo que la senoide pura sugiere. SyncLab usa exactamente esta fórmula.' },
          ]}
        />
      </ConceptBlock>

      <TransientPALab />

      <FeynmanCheck
        id="c6s4-check-saliencia"
        question="En régimen permanente la saliencia (Xq < Xd) adelanta la cresta a δ < 90°. ¿Por qué en el transitorio ocurre lo contrario?"
        options={[
          {
            label: 'Porque los polos salientes se redondean magnéticamente durante la falla.',
            feedback:
              'La geometría del hierro no cambia en milisegundos. Lo que cambia es la REFERENCIA del eje d: ya no es Xd (grande) sino X′d (pequeña, por el flujo atrapado del campo). El paréntesis (1/Xq − 1/X′d) compara contra esa nueva referencia.',
          },
          {
            label: 'Porque el flujo atrapado baja la reactancia del eje d hasta X′d < Xq: el paréntesis (1/Xq − 1/X′d) cambia de signo y el término sen 2δ ahora empuja la cresta más allá de 90°.',
            correct: true,
            feedback:
              'Exacto: la saliencia efectiva es la DIFERENCIA entre ejes, y el transitorio la invierte — el eje d, defendido por el campo, se vuelve el de menor reactancia. En el eje q no hay devanado de campo que defienda nada (X′q ≈ Xq en polos salientes), así que solo el eje d «baja el escalón». Verifícalo en el laboratorio: sube X′d hasta Xq y la joroba desaparece.',
          },
          {
            label: 'Es un error de convención de signos entre autores.',
            feedback:
              'Es física medible, no notación: los registros de fallas reales muestran la cresta transitoria pasada de 90°. La fórmula lo captura con el paréntesis invertido — compruébalo con el readout «(1/Xq − 1/X′d)» del laboratorio.',
          },
        ]}
      />

      <ConceptBlock
        title="4.2 · Circuitos adicionales del rotor: cada devanado, un peldaño"
        idea="Cada circuito cerrado que agregues al rotor añade un peldaño a la escalera de reactancias y un reloj a la dinámica. El devanado de campo crea el nivel transitorio del eje d (X′d, T′d). Los amortiguadores crean el subtransitorio en AMBOS ejes (X″d, X″q, T″d). Y en el eje q de un rotor de polos salientes no hay devanado de campo — por eso X′q ≈ Xq: ese peldaño no existe."
        analogy="Capas de abrigo: cada prenda extra (devanado) frena el escape del calor (flujo) con su propio ritmo. El eje d lleva dos abrigos (campo + amortiguador); el eje q de polos salientes lleva solo uno (amortiguador) — y contra el frío repentino, se nota."
      >
        <div className="my-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            La escalera de reactancias (valores típicos, pu)
          </p>
          <div className="space-y-1.5">
            {LADDER.map((r) => (
              <div key={r.sym} className="flex items-center gap-2">
                <span className="w-9 text-right font-mono text-xs font-bold text-zinc-200">{r.sym}</span>
                <div className="h-5 flex-1 rounded-sm bg-zinc-900">
                  <div
                    className={`flex h-full items-center rounded-sm px-2 ${
                      r.group === 'sincrónicas'
                        ? 'bg-amber-600/50'
                        : r.group === 'transitorias'
                          ? 'bg-sky-600/50'
                          : 'bg-red-600/50'
                    }`}
                    style={{ width: `${(r.value / 1.1) * 100}%` }}
                  >
                    <span className="font-mono text-[10px] font-bold text-zinc-100">{r.value.toFixed(2)}</span>
                  </div>
                </div>
                <span className="hidden w-72 text-[10px] leading-tight text-zinc-500 sm:block">{r.note}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-zinc-600">
            Jerarquía general: Xd ≥ Xq ≥ X′q ≥ X′d ≥ X″q ≈ X″d — cada defensa adicional del rotor
            baja un peldaño la reactancia aparente.
          </p>
        </div>
        <p className="mb-2">
          Cada peldaño trae además <em>dos</em> relojes, según la armadura esté abierta o en corto —
          y la relación entre ambos es una de las fórmulas más útiles del capítulo:
        </p>
        <Formula
          latex="T'_d = T'_{d0}\,\frac{X'_d}{X_d} \qquad\Rightarrow\qquad T'_{d0} = T'_d\,\frac{X_d}{X'_d}\ \gg\ T'_d"
          symbols={[
            { sym: "T'_{d0}", meaning: 'Constante de tiempo transitoria de CIRCUITO ABIERTO: cómo decae el flujo del campo con la armadura desconectada (3–10 s). Se mide quitando la excitación en vacío.' },
            { sym: "T'_d", meaning: 'La de CORTOCIRCUITO (0.5–2 s): con la armadura en corto, la reacción de armadura «ayuda» a desmagnetizar y el flujo muere más rápido.' },
            { sym: "X'_d/X_d", meaning: 'El factor de aceleración (~0.2–0.3): la razón de inductancias efectivas que el devanado de campo ve en cada caso. Armadura en corto = menos inductancia = decaimiento más veloz.' },
          ]}
        />
      </ConceptBlock>

      <FeynmanCheck
        id="c6s4-check-td0"
        question="¿Por qué el flujo del campo decae MÁS RÁPIDO con la armadura en cortocircuito (T′d) que con ella abierta (T′d0)?"
        options={[
          {
            label: 'Porque el cortocircuito calienta la máquina y baja la resistencia del campo.',
            feedback:
              'La resistencia del campo apenas cambia en esa escala de tiempo. La clave está en la INDUCTANCIA efectiva que el campo ve — y esa sí cambia drásticamente según qué haga la armadura.',
          },
          {
            label: 'Porque con la armadura en corto, sus corrientes inducidas se oponen al flujo del campo (Lenz): la inductancia efectiva del circuito de campo baja en el factor X′d/Xd, y τ = L/R cae con ella.',
            correct: true,
            feedback:
              'La armadura cortocircuitada actúa como un secundario cerrado que «roba» enlace de flujo al campo: su inductancia efectiva baja de proporcional-a-Xd a proporcional-a-X′d, y la constante τ = L/R se encoge en la misma razón. Con Xd/X′d ≈ 3.7, un T′d0 de varios segundos se convierte en el T′d de ~1 s que mide el ensayo de cortocircuito súbito.',
          },
          {
            label: 'No decae más rápido: T′d0 y T′d son la misma constante medida con instrumentos distintos.',
            feedback:
              'Son físicamente distintas y difieren en un factor 3–5. La razón exacta es X′d/Xd — la misma pareja de reactancias del resto del capítulo, apareciendo ahora en el dominio del tiempo.',
          },
        ]}
      />

      <ConceptBlock
        title="4.3 · La escalera de modelos: fidelidad contra costo"
        idea="No existe «el» modelo de la máquina sincrónica: existe una escalera. Cada peldaño agrega circuitos del rotor (y estados a las ecuaciones) para capturar fenómenos más rápidos. El arte del ingeniero no es usar siempre el modelo más completo — es usar el más BARATO que capture el fenómeno del estudio."
        analogy="Mapas: el plano del metro (modelo clásico) es «falso» — sin distancias reales — pero es EL correcto para viajar en metro. El mapa topográfico milimétrico (Park completo) es exacto e inútil para ese viaje. Un modelo no se juzga por su fidelidad absoluta sino por servir a su pregunta."
      >
        <div className="my-4 grid gap-2 sm:grid-cols-2">
          {MODELS.map((m) => (
            <div key={m.name} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="mb-1 text-xs font-bold text-sky-300">{m.name}</p>
              <p className="mb-1.5 text-[11px] leading-relaxed text-zinc-300">{m.what}</p>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                <span className="font-semibold text-emerald-400">Úsalo para: </span>{m.use}
              </p>
              <p className="mt-1 text-[10px] italic text-zinc-600">{m.cost}</p>
            </div>
          ))}
        </div>
      </ConceptBlock>

      <FeynmanCheck
        id="c6s4-check-modelos"
        question="Debes verificar si los relés de protección de una subestación operarán correctamente con las corrientes de los 3 primeros ciclos de una falla. ¿Qué modelo eliges?"
        options={[
          {
            label: 'El clásico (E′ tras X′d): es el estándar de los estudios de estabilidad.',
            feedback:
              'El clásico NO contiene los amortiguadores: no conoce X″d ni T″d, así que subestima la corriente de los primeros ciclos justo donde tus relés deciden. Es el modelo correcto para OTRA pregunta (la primera oscilación de δ).',
          },
          {
            label: 'El subtransitorio de dos ejes: contiene X″d, X″q y sus constantes — exactamente la física de los primeros ciclos, sin pagar el costo del Park completo.',
            correct: true,
            feedback:
              'La pregunta vive en el periodo subtransitorio ⇒ el modelo debe contener los circuitos amortiguadores. El Park completo también serviría, pero pagarías horas de cómputo por una precisión que los relés no distinguen. Modelo mínimo que captura el fenómeno: ese es el criterio, siempre.',
          },
          {
            label: 'El Park completo: para protecciones, solo lo más exacto.',
            feedback:
              '«Lo más exacto» no es gratis: pasos de microsegundos y horas de simulación por caso. Para corrientes de relés a 60 Hz, el subtransitorio da los mismos números en una fracción del costo. Reserva el EMT para sobretensiones, resonancia subsíncrona o electrónica de potencia.',
          },
        ]}
      />

      <SolvedProblem
        id="c6s4-problema-curva"
        numero="15"
        title="La curva transitoria completa de nuestra máquina"
        statement={
          <>
            Para el generador de siempre (X′d = {fmt(XD1, 1)}, Xq = {fmt(XQ, 2)}, Xd = {fmt(XD, 1)} pu,
            T′d = {fmt(TD1, 1)} s) operando en P = {fmt(P0, 1)} pu, fp 0.9 atraso: <strong>(a)</strong>{' '}
            escriba la característica transitoria P(δ) completa y localice su cresta;{' '}
            <strong>(b)</strong> halle T′d0; <strong>(c)</strong> justifique qué modelo usaría para el
            estudio de t_cr de la Sección 3.
          </>
        }
        steps={[
          {
            title: '(a) Armar la característica con E′ del punto de carga',
            why: 'E′ ya la calculamos en el Problema 12 (el flujo atrapado la congela). El coeficiente de reluctancia sale NEGATIVO — la firma de la saliencia invertida.',
            work: `P(\\delta) = \\frac{${fmt(Ep)} \\times 1}{${fmt(XD1, 1)}}\\,\\text{sen}\\,\\delta + \\frac{1}{2}\\left(\\frac{1}{${fmt(XQ, 2)}} - \\frac{1}{${fmt(XD1, 1)}}\\right)\\text{sen}\\,2\\delta = ${fmt(Ep / XD1, 2)}\\,\\text{sen}\\,\\delta ${fmt(kRel, 2)}\\,\\text{sen}\\,2\\delta`,
          },
          {
            title: '(a) Localizar la cresta: más allá de 90°',
            why: 'Con el término sen 2δ negativo, en δ = 90° la derivada aún es positiva (la reluctancia «devuelve» pasados los 90°): la cresta se corre a la derecha. Se localiza numéricamente (o igualando la derivada a cero).',
            work: `P_{max}^{tr} = ${fmt(peak.P, 2)}\\ \\text{pu} \\quad\\text{en}\\quad \\delta = ${fmt(peak.deg, 0)}^\\circ > 90^\\circ`,
            note: 'Compáralo con la senoide pura del modelo clásico (cresta 3.88 pu exactamente en 90°): la saliencia transitoria regala algo de altura y de margen angular. SyncLab usa esta curva completa.',
          },
          {
            title: '(b) El reloj de circuito abierto',
            why: 'T′d se midió en el ensayo de cortocircuito (Sección 2); la de circuito abierto se recupera con la razón de reactancias — la armadura abierta ya no ayuda a desmagnetizar.',
            work: `T'_{d0} = T'_d\\,\\frac{X_d}{X'_d} = ${fmt(TD1, 1)} \\times \\frac{${fmt(XD, 1)}}{${fmt(XD1, 1)}} = ${fmt(Td0, 2)}\\ \\text{s}`,
          },
          {
            title: '(c) Elegir modelo con criterio',
            why: 'El estudio de t_cr vive en la primera oscilación (~0.3–1 s): más lento que los amortiguadores (T″d ≈ 0.035 s, ya muertos) y más rápido que el decaimiento del campo (T′d0 ≈ 3.7 s, aún firme). Justo la ventana del modelo clásico.',
            work: `T''_d \\ll t_{cr} \\ll T'_{d0} \\;\\Rightarrow\\; \\text{modelo clásico: } E' = ${fmt(Ep)}\\ \\text{pu constante tras } X'_d`,
            note: 'Y ahora la elección del modelo dejó de ser un acto de fe: es una comparación de relojes. Esa es la madurez que este capítulo buscaba.',
          },
        ]}
        answer={`P_{max}^{tr} = ${fmt(peak.P, 2)}\\ \\text{pu @ } ${fmt(peak.deg, 0)}^\\circ \\qquad T'_{d0} = ${fmt(Td0, 2)}\\ \\text{s} \\qquad \\text{modelo clásico}\\ \\checkmark`}
        takeaway="Tres ideas cierran el capítulo: la saliencia se invierte en el transitorio (cresta > 90°), cada circuito del rotor añade un peldaño de reactancia y un reloj (T′d0 = T′d·Xd/X′d), y el modelo correcto se elige comparando los relojes del fenómeno con los de la máquina."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C6 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Curva transitoria: mismos dos términos, referencia nueva.{' '}
            <InlineMath latex="X'_d < X_q" /> invierte la reluctancia y la cresta cruza los 90°.
          </li>
          <li>
            Cada circuito del rotor = un peldaño (X″ &lt; X′ &lt; X) + dos relojes (T y T₀, ligados
            por la razón de reactancias). El eje q saliente no tiene campo: le falta un peldaño.
          </li>
          <li>
            Los modelos son una escalera de fidelidad-costo: clásico para la primera oscilación,
            flujo decayente para el AVR, subtransitorio para protecciones, Park para EMT. Se elige
            comparando relojes, no por devoción a la exactitud.
          </li>
        </ul>
      </div>
    </section>
  )
}
