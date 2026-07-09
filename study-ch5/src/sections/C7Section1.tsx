import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import SlipFieldLab from '../widgets/SlipFieldLab'
import { fmt, rotorFrequency, syncSpeedRpm } from '../lib/machine'

/** Capítulo 7, Sección 1 — El motor de inducción polifásico: campo giratorio, inducción y deslizamiento. */
export default function C7Section1() {
  const f = 60
  const poles = 4
  const ns = syncSpeedRpm(f, poles)
  const nm = 1746
  const s = (ns - nm) / ns
  const fr = rotorFrequency(s, f)

  return (
    <section id="c7-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El motor de inducción: un transformador cuyo secundario se mueve
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El estator fabrica un campo que gira solo; el rotor lo persigue sin nunca alcanzarlo. Ese
          retraso — el deslizamiento — es el corazón de la máquina más usada del mundo.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · El campo que gira sin que nada gire"
        idea="Tres corrientes desfasadas 120° en tres devanados a 120° en el espacio producen un campo magnético de amplitud constante que GIRA en el entrehierro a la velocidad síncrona nₛ = 120f/p. No hay ninguna pieza moviéndose para crearlo: es puro truco de superposición trifásica (el mismo del Cap. 4)."
        analogy="Las luces de una marquesina: cada bombilla solo se enciende y apaga en su sitio, pero el patrón de luz CORRE por el letrero. Aquí las «bombillas» son los picos de campo de cada fase, y su suma es un polo N-S que da vueltas a nₛ."
      >
        <Formula
          latex="n_s = \frac{120\,f}{p}"
          symbols={[
            { sym: 'n_s', meaning: 'Velocidad síncrona [r/min]: la velocidad a la que gira el campo del estator. Es una propiedad de la RED y la construcción, no de la carga.' },
            { sym: 'f', meaning: 'Frecuencia de la línea [Hz]. En una red de 60 Hz, un motor de 4 polos tiene nₛ = 1800 r/min.' },
            { sym: 'p', meaning: 'Número de polos. Más polos → campo más lento. Es la única perilla mecánica de la velocidad (sin electrónica).' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · Inducción: el transformador con movimiento"
        idea="El campo giratorio corta los conductores del rotor y les induce una FEM (ley de Faraday). Como las barras del rotor están en cortocircuito, esa FEM produce corrientes; esas corrientes, dentro del mismo campo, sienten una fuerza (ley de Lorentz) que arrastra el rotor en el sentido del campo. Es un transformador: primario = estator, secundario = rotor — pero el secundario puede moverse."
        analogy="Un imán que pasas por encima de una moneda de aluminio: la moneda no es magnética, pero el imán en movimiento le induce corrientes que la hacen seguirlo. El rotor de jaula es esa moneda, y el campo giratorio es el imán que nunca deja de pasar."
      >
        <p>
          Clave de por qué NO puede alcanzar al campo: si el rotor girara a nₛ, no habría movimiento
          relativo, el campo no cortaría sus conductores, no habría FEM, no habría corriente y no
          habría par. El motor <strong>necesita</strong> quedarse atrás para funcionar. Por eso también
          se llama <em>asíncrono</em>.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="1.3 · El deslizamiento s: la medida del retraso"
        idea="El deslizamiento es la fracción en que el rotor se queda atrás respecto al campo. Vale 1 con el rotor parado (arranque) y tiende a 0 (pero nunca llega) cerca de la velocidad síncrona. Un motor típico opera con s entre 1% y 5%."
        analogy="Dos corredores en una pista circular: el campo (nₛ) y el rotor (nₘ). El deslizamiento es qué tan atrás va el segundo, medido como fracción de vuelta por cada vuelta del primero. Si corren igual de rápido, s = 0 y el juego se acaba."
      >
        <Formula
          latex="s = \frac{n_s - n_m}{n_s} \qquad n_m = (1-s)\,n_s"
          symbols={[
            { sym: 's', meaning: 'Deslizamiento (adimensional o %). s = 1: rotor parado. s = 0: velocidad síncrona (inalcanzable en motor). s < 0: la máquina se vuelve GENERADOR (arrastrada por encima de nₛ).' },
            { sym: 'n_s - n_m', meaning: 'Velocidad de deslizamiento [r/min]: la velocidad RELATIVA entre el campo y el rotor. Es la que realmente corta los conductores del rotor.' },
            { sym: 'n_m', meaning: 'Velocidad mecánica real del eje [r/min]. Lo que mides con un tacómetro.' },
          ]}
        />
      </ConceptBlock>

      <SlipFieldLab />

      <FeynmanCheck
        id="c7s1-check-campo"
        question="¿Por qué el rotor de un motor de inducción NUNCA puede girar exactamente a la velocidad síncrona nₛ?"
        options={[
          {
            label: 'Por la fricción de los rodamientos, que siempre resta un poco de velocidad.',
            feedback:
              'La fricción existe, pero no es la razón fundamental — aunque el motor fuera perfecto y sin carga, TAMPOCO llegaría a nₛ. El motivo es electromagnético, no mecánico.',
          },
          {
            label: 'Porque a nₛ no habría movimiento relativo campo-rotor: sin corte de flujo no hay FEM, sin FEM no hay corriente y sin corriente no hay par para sostener ni la más mínima pérdida.',
            correct: true,
            feedback:
              'Exacto. El par nace del deslizamiento. Si s llegara a 0, el rotor dejaría de inducir corriente y no habría fuerza que venciera ni la fricción — así que se frena hasta que reaparece un pequeño s. El rotor se estabiliza SIEMPRE un poco por debajo de nₛ, justo lo necesario para producir el par que pide la carga.',
          },
          {
            label: 'Porque la frecuencia de la red lo impide eléctricamente.',
            feedback:
              'La red fija nₛ (la velocidad del campo), no un tope directo al rotor. Lo que impide alcanzar nₛ es que en ese punto el mecanismo de inducción se apaga: es una limitación FÍSICA del principio, no una barrera de la red.',
          },
        ]}
      />

      <FeynmanCheck
        id="c7s1-check-deslizamiento"
        question="Un motor de 4 polos y 60 Hz gira a 1746 r/min. Antes de calcular: ¿su deslizamiento está más cerca de 0.03 o de 0.3?"
        options={[
          {
            label: 'Cerca de 0.3 (30%): 1746 está bastante lejos de 1800.',
            feedback:
              'Parece «lejos» en r/min, pero en fracción es poco: (1800−1746)/1800 = 54/1800 = 0.03. La intuición de r/min engaña — el deslizamiento se mide como FRACCIÓN de nₛ.',
          },
          {
            label: 'Cerca de 0.03 (3%): 1746 está a solo 54 r/min de las 1800 síncronas.',
            correct: true,
            feedback:
              'Correcto: s = (1800−1746)/1800 = 0.03. Un motor sano en carga nominal opera con s de 1–5%. Ese pequeño número esconde toda la acción: a s = 0.03 la frecuencia del rotor es apenas 1.8 Hz y el rendimiento del rotor es del 97%.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s1-problema-slip"
        numero="26"
        title="Deslizamiento, velocidad síncrona y frecuencia del rotor"
        statement={
          <>
            Un motor de inducción trifásico de <strong>{poles} polos</strong> conectado a una red de{' '}
            <strong>{f} Hz</strong> gira a plena carga a <strong>{nm} r/min</strong>. Halle:{' '}
            <strong>(a)</strong> la velocidad síncrona, <strong>(b)</strong> el deslizamiento, y{' '}
            <strong>(c)</strong> la frecuencia de las corrientes del rotor.
          </>
        }
        steps={[
          {
            title: '(a) Velocidad síncrona: solo depende de f y p',
            why: 'Es la velocidad del campo giratorio, fijada por la red y la construcción — no por la carga ni por el rotor.',
            work: `n_s = \\frac{120 \\times ${f}}{${poles}} = ${fmt(ns, 0)}\\ \\text{r/min}`,
          },
          {
            title: '(b) Deslizamiento: el retraso relativo',
            why: 'La distancia entre campo y rotor, medida como fracción de la velocidad síncrona.',
            work: `s = \\frac{${fmt(ns, 0)} - ${nm}}{${fmt(ns, 0)}} = \\frac{${fmt(ns - nm, 0)}}{${fmt(ns, 0)}} = ${fmt(s, 3)}\\;(${fmt(s * 100, 1)}\\%)`,
          },
          {
            title: '(c) Frecuencia del rotor: fᵣ = s·fₑ',
            why: 'El rotor solo «ve» la velocidad de deslizamiento, así que sus corrientes alternan a una frecuencia proporcional a s.',
            work: `f_r = s\\,f_e = ${fmt(s, 3)} \\times ${f} = ${fmt(fr, 2)}\\ \\text{Hz}`,
            note: 'A plena carga el rotor trabaja casi en corriente continua lenta (~2 Hz). En el arranque (s = 1) subiría a los 60 Hz completos.',
          },
        ]}
        answer={`n_s = ${fmt(ns, 0)}\\ \\text{r/min} \\qquad s = ${fmt(s, 3)} \\qquad f_r = ${fmt(fr, 2)}\\ \\text{Hz}`}
        takeaway="Todo el capítulo cuelga de tres números encadenados: nₛ (la red), s (el retraso que produce el par) y fᵣ = s·fₑ (lo que ve el rotor). Domínalos y el resto es circuito."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El estator trifásico crea un campo que GIRA a <InlineMath latex="n_s = 120f/p" /> sin partes móviles — el truco de superposición del Cap. 4.</li>
          <li>El rotor es el secundario de un transformador con movimiento: el campo le induce corrientes que lo arrastran. Necesita quedarse atrás para funcionar (asíncrono).</li>
          <li>El deslizamiento <InlineMath latex="s=(n_s-n_m)/n_s" /> mide ese retraso: 1 en el arranque, 1–5% en marcha, nunca 0.</li>
        </ul>
      </div>
    </section>
  )
}
