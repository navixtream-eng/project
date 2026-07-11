import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import InsulationLifeLab from '../widgets/InsulationLifeLab'
import { fmt } from '../lib/machine'
import { vidaAislamiento } from '../lib/termica'

/** Capítulo 12, Sección 2 — Aislamiento, clases térmicas y vida útil. */
export default function C12Section2() {
  // Problema 60
  const vNom = vidaAislamiento(155, 'F')
  const vSobre = vidaAislamiento(165, 'F')
  const vFB = vidaAislamiento(130, 'F')

  return (
    <section id="c12-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El aislamiento: donde el calor se convierte en años
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El cobre y el hierro sobreviven a cualquier temperatura razonable; lo que muere es el
          barniz. La química del envejecimiento (Arrhenius) da una regla brutal y simple: cada
          10 °C de más, la mitad de la vida. Las «clases térmicas» son el contrato entre esa
          química y tu máquina.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · Clases térmicas y la regla de los 10 °C"
        idea="El aislamiento es materia orgánica polimerizada: la temperatura acelera exponencialmente sus reacciones de degradación (ley de Arrhenius; la versión de ingeniería es la regla de Montsinger). Las clases (A 105, B 130, F 155, H 180 °C) fijan la temperatura del PUNTO CALIENTE a la que el material dura la vida de diseño (~20 000 h de referencia). La temperatura real del punto caliente = ambiente + elevación media + gradiente al punto caliente — y cada 10 °C que la bajes DUPLICA la vida. Por eso la industria diseña con clase F y opera con elevación de clase B: esos 25 °C de colchón convierten 2.3 años de contrato en más de una década de servicio."
        analogy="La comida y el refrigerador: la misma leche dura horas al sol, días en la nevera. Nadie pregunta si la leche «aguanta» 35 °C — aguanta, pero su RELOJ corre más rápido. El aislamiento es leche con reloj exponencial: la clase te dice a qué temperatura su reloj marca la vida nominal."
      >
        <Formula
          latex="L(\theta) \approx L_0 \cdot 2^{(\theta_{clase} - \theta_{hot})/10}"
          symbols={[
            { sym: 'L_0', meaning: 'Vida a la temperatura de clase (≈ 20 000 h de referencia clásica — el número exacto varía por material y norma; la ESTRUCTURA exponencial no).' },
            { sym: '\\theta_{hot}', meaning: 'El punto MÁS caliente del devanado (no el promedio): ranura profunda, cabeza de bobina mal ventilada. Los sensores PT100 se ponen ahí por esto.' },
            { sym: '2^{\\Delta/10}', meaning: 'La regla del 10: −10 °C = ×2 vida; +20 °C = ÷4. Es la conversión universal entre «calor» y «años» — y el argumento económico de todo derrateo.' },
          ]}
        />
      </ConceptBlock>

      <InsulationLifeLab />

      <FeynmanCheck
        id="c12s2-check-clase"
        question="Un motor clase F opera siempre 20 °C por debajo de su límite. Se propone «aprovecharlo» subiendo la carga hasta operar exactamente a 155 °C. ¿Qué se está intercambiando?"
        options={[
          {
            label: 'Un factor 4 de vida: 2^(20/10) = 4. Los 20 °C de margen eran ~4 vidas de diseño; consumirlos convierte un motor de ~9 años en uno de ~2.3.',
            correct: true,
            feedback:
              'La potencia extra es visible en producción; los años perdidos, invisibles hasta el rebobinado. El análisis correcto es económico: ¿vale la potencia extra lo que cuesta acortar la vida 4×? A veces sí — pero se decide con este número, no a ciegas.',
          },
          {
            label: 'Nada: dentro de la clase no hay degradación.',
            feedback:
              'La clase no es un interruptor: la degradación es continua y exponencial. 155 °C es donde la vida vale L₀, no donde el desgaste «empieza».',
          },
          {
            label: 'Solo rendimiento: el motor caliente pierde eficiencia.',
            feedback:
              'La resistencia sube algo con la temperatura, sí — pero el costo dominante es la VIDA del aislamiento, no los puntos de eficiencia.',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s2-check-hotspot"
        question="¿Por qué las normas hablan del punto CALIENTE y no de la temperatura media del devanado (que es la que mide la resistencia por variación de R)?"
        options={[
          {
            label: 'Porque la cadena es tan fuerte como su eslabón más caliente: el envejecimiento exponencial hace que unos pocos grados locales dominen la vida — la falla empieza donde θ es máxima, no donde promedia.',
            correct: true,
            feedback:
              'Con envejecimiento exponencial, el promedio engaña: un devanado a 140 °C de media con un rincón a 165 falla por el rincón. Por eso el gradiente medio→caliente (~5–15 K) se suma explícitamente en los cálculos.',
          },
          {
            label: 'Por tradición: media y punto caliente son casi iguales.',
            feedback:
              'Difieren 5–15 K según el diseño — y por la regla del 10, esos grados son un factor 1.4–2.8 de vida: no es despreciable ni tradicional.',
          },
          {
            label: 'Porque el punto caliente es más fácil de medir.',
            feedback:
              'Al revés: la media (por ΔR) es la fácil; el punto caliente exige sensores embebidos. Se usa porque MANDA, no porque sea cómodo.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s2-problema-vida"
        numero="60"
        title="La vida en tres escenarios"
        statement={
          <>
            Un motor clase F (155 °C, L₀ = 20 000 h) puede operar en tres condiciones de punto
            caliente: <strong>(a)</strong> 155 °C (al límite), <strong>(b)</strong> 165 °C
            (ventilación sucia: +10 °C), <strong>(c)</strong> 130 °C (práctica F/B). Halle la vida
            esperada en cada caso y las horas de vida que cuesta CADA HORA de operación en (b).
          </>
        }
        steps={[
          {
            title: '(a) Al límite de clase',
            why: 'Por definición de L₀: la vida de diseño.',
            work: `L(155) = ${fmt(vNom / 1000, 0)}\\,000\\ \\text{h} \\approx ${fmt(vNom / 8760, 1)}\\ \\text{años}`,
          },
          {
            title: '(b) +10 °C por ventilación sucia',
            why: 'La regla de Montsinger: +10 °C = mitad de vida.',
            work: `L(165) = 20\\,000 \\cdot 2^{-1} = ${fmt(vSobre / 1000, 0)}\\,000\\ \\text{h} \\approx ${fmt(vSobre / 8760, 1)}\\ \\text{años}`,
            note: 'Cada hora a 165 °C consume el doble de «reloj»: una hora de operación cuesta 2 h de vida nominal. Limpiar el ventilador es el mantenimiento con mejor tasa de retorno que existe.',
          },
          {
            title: '(c) La práctica F/B',
            why: '25 °C de margen: 2^2.5.',
            work: `L(130) = 20\\,000 \\cdot 2^{2.5} = ${fmt(vFB / 1000, 0)}\\,000\\ \\text{h} \\approx ${fmt(vFB / 8760, 0)}\\ \\text{años}`,
            note: 'De 2.3 años a más de una década con el MISMO material: el margen térmico es el producto más barato del catálogo.',
          },
        ]}
        answer={`L(155) = ${fmt(vNom / 8760, 1)}\\ \\text{años} \\quad L(165) = ${fmt(vSobre / 8760, 1)}\\ \\text{años} \\quad L(130) = ${fmt(vFB / 8760, 0)}\\ \\text{años}`}
        takeaway="La temperatura no daña: COBRA. Y cobra exponencial. Toda decisión térmica (derrateo, ventilación, sobrecarga) se traduce a años con 2^(Δ/10) — hazlo siempre."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Clases A/B/F/H = temperaturas de punto caliente a las que el aislamiento dura su vida de diseño. La realidad manda sobre el punto MÁS caliente, no el promedio.</li>
          <li>Regla del 10: ±10 °C = ÷2 / ×2 la vida. El margen térmico es vida comprada — la práctica «diseño F, operación B» multiplica por ~6.</li>
          <li>Todo lo que suba θ (sobrecarga, derrateo ignorado, ventilador sucio, desbalance del Cap. 11) se convierte en años con la misma fórmula.</li>
        </ul>
      </div>
    </section>
  )
}
