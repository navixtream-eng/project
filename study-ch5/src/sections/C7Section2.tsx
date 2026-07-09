import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import RotorFrequencyLab from '../widgets/RotorFrequencyLab'
import { fmt, rotorFrequency } from '../lib/machine'

/** Capítulo 7, Sección 2 — Frecuencia, FEM y reactancia del rotor: todo escala con s. */
export default function C7Section2() {
  const f = 60
  const sStart = 1
  const sRun = 0.03
  const frStart = rotorFrequency(sStart, f)
  const frRun = rotorFrequency(sRun, f)

  return (
    <section id="c7-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Las variables del rotor: frecuencia, FEM y reactancia que escalan con s
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El rotor no ve los 60 Hz de la red: ve la frecuencia de deslizamiento. Y con ella escalan
          también su FEM inducida y su reactancia — el detalle que hace que la «carga» del circuito
          cambie con la velocidad.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · fᵣ = s·fₑ: el rotor solo ve el deslizamiento"
        idea="La frecuencia de las corrientes del rotor es proporcional al deslizamiento. A rotor parado (s = 1) el campo pasa a la velocidad síncrona completa y el rotor ve la frecuencia de línea entera. Al acelerar, el campo lo adelanta cada vez más despacio, y la frecuencia del rotor cae hasta unos pocos hercios."
        analogy="Vas en coche por la autopista. Si estás parado, los postes pasan a toda velocidad (alta frecuencia). Si aceleras hasta casi la velocidad del tráfico, los coches de al lado pasan lentísimo (baja frecuencia). El rotor es tu coche; el campo, el tráfico."
      >
        <Formula
          latex="f_r = s\,f_e"
          symbols={[
            { sym: 'f_r', meaning: 'Frecuencia de las corrientes y voltajes inducidos en el rotor [Hz]. A plena carga (~3%) vale ~2 Hz; en arranque, 60 Hz.' },
            { sym: 's', meaning: 'Deslizamiento. Es el único factor que convierte la frecuencia de línea en la del rotor.' },
            { sym: 'f_e', meaning: 'Frecuencia eléctrica de la línea [Hz]: la del estator, siempre constante.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · La FEM y la reactancia del rotor también escalan con s"
        idea="La FEM inducida en el rotor es proporcional a la velocidad relativa, así que E₂ₛ = s·E₂ (donde E₂ es la FEM a rotor parado). Y como la reactancia depende de la frecuencia, X₂ₛ = s·X₂. Ambas caen juntas al acelerar: el rotor pasa de ser muy inductivo (arranque) a casi puramente resistivo (marcha)."
        analogy="Dos hermanos que crecen a la vez: la FEM (lo que empuja) y la reactancia (lo que estorba). Como crecen proporcionales a s, su cociente — el ángulo del factor de potencia del rotor — mejora suavemente a medida que el motor acelera."
      >
        <Formula
          latex="E_{2s} = s\,E_2 \qquad X_{2s} = s\,X_2 \qquad I_2 = \frac{sE_2}{\sqrt{R_2^2 + (sX_2)^2}}"
          symbols={[
            { sym: 'E_{2s} = s\\,E_2', meaning: 'FEM del rotor con deslizamiento. Máxima en el arranque (s=1), casi nula cerca de nₛ. E₂ es su valor a rotor bloqueado.' },
            { sym: 'X_{2s} = s\\,X_2', meaning: 'Reactancia de dispersión del rotor a la frecuencia de deslizamiento. Alta en arranque, baja en marcha — clave de la forma de la curva de par.' },
            { sym: 'I_2', meaning: 'Corriente del rotor: dividiendo arriba y abajo por s se llega a I₂ = E₂/√((R₂/s)² + X₂²) — el origen del famoso R₂/s del circuito equivalente.' },
          ]}
        />
        <p>
          Ese último paso algebraico es el puente hacia la Sección 3: al dividir por <InlineMath latex="s" />{' '}
          la reactancia vuelve a ser la constante <InlineMath latex="X_2" /> y toda la dependencia con
          la velocidad se concentra en un solo término, <InlineMath latex="R_2/s" />.
        </p>
      </ConceptBlock>

      <RotorFrequencyLab />

      <FeynmanCheck
        id="c7s2-check-frecuencia"
        question="En el arranque (s = 1) la reactancia del rotor X₂ₛ es máxima y en marcha es mínima. ¿Qué consecuencia tiene esto para el factor de potencia del ROTOR?"
        options={[
          {
            label: 'En arranque el rotor es muy inductivo (fp bajo); en marcha es casi resistivo (fp alto).',
            correct: true,
            feedback:
              'Exacto. En arranque X₂ₛ = X₂ domina sobre R₂ → corriente muy atrasada → mal fp del rotor → mucha corriente pero poca componente productiva de par. Al acelerar, X₂ₛ = sX₂ se desploma y R₂ manda: la corriente del rotor se pone casi en fase con su FEM y produce par con eficacia. Esta transición ES la forma de la curva par-velocidad.',
          },
          {
            label: 'El factor de potencia del rotor no cambia porque E y X escalan igual con s.',
            feedback:
              'E₂ₛ y X₂ₛ sí escalan igual (ambas ×s), pero R₂ NO escala: es constante. El ángulo del rotor lo fija el cociente X₂ₛ/R₂ = sX₂/R₂, que SÍ cambia con s. Por eso el fp del rotor mejora al acelerar.',
          },
          {
            label: 'En arranque el rotor es casi resistivo y en marcha muy inductivo.',
            feedback:
              'Al revés. En arranque s = 1 → X₂ₛ = X₂ (máxima) → muy inductivo. En marcha s pequeño → X₂ₛ = sX₂ (mínima) → casi resistivo. La reactancia MUERE con el deslizamiento.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s2-problema-frecuencia"
        numero="27"
        title="Frecuencia del rotor en arranque y en marcha"
        statement={
          <>
            Un motor de inducción de 60 Hz opera con un deslizamiento de <strong>3%</strong> a plena
            carga. Halle la frecuencia de las corrientes del rotor <strong>(a)</strong> en el instante
            del arranque y <strong>(b)</strong> a plena carga. <strong>(c)</strong> ¿Qué fracción de su
            reactancia de rotor-parado presenta el rotor a plena carga?
          </>
        }
        steps={[
          {
            title: '(a) Arranque: s = 1',
            why: 'Con el rotor detenido, el campo lo cruza a la velocidad síncrona completa: el rotor ve la frecuencia de línea entera.',
            work: `f_r = s\\,f_e = ${fmt(sStart, 0)} \\times ${f} = ${fmt(frStart, 0)}\\ \\text{Hz}`,
          },
          {
            title: '(b) Plena carga: s = 0.03',
            why: 'Ahora el rotor casi alcanza al campo; la velocidad relativa es pequeña y la frecuencia cae en proporción.',
            work: `f_r = ${fmt(sRun, 2)} \\times ${f} = ${fmt(frRun, 2)}\\ \\text{Hz}`,
          },
          {
            title: '(c) Reactancia relativa: X₂ₛ/X₂ = s',
            why: 'La reactancia escala con la frecuencia, y la frecuencia con s; así que la reactancia de dispersión del rotor en marcha es solo la fracción s de su valor a rotor parado.',
            work: `\\frac{X_{2s}}{X_2} = s = ${fmt(sRun, 2)}\\;(${fmt(sRun * 100, 0)}\\%)`,
            note: 'A plena carga el rotor es casi puramente resistivo: su reactancia se ha reducido al 3% de la de arranque. Por eso la corriente del rotor produce par con gran eficacia en marcha.',
          },
        ]}
        answer={`f_{r,arr} = ${fmt(frStart, 0)}\\ \\text{Hz} \\qquad f_{r,carga} = ${fmt(frRun, 2)}\\ \\text{Hz} \\qquad X_{2s}/X_2 = ${fmt(sRun, 2)}`}
        takeaway="Todo lo del rotor lleva un factor s: la frecuencia, la FEM y la reactancia. Al dividir la corriente del rotor por s, esa dependencia se recoge en un solo término R₂/s — la puerta de entrada al circuito equivalente."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>La frecuencia del rotor es <InlineMath latex="f_r = s\,f_e" />: 60 Hz en arranque, ~2 Hz en marcha.</li>
          <li>Su FEM y su reactancia también escalan con s (<InlineMath latex="E_{2s}=sE_2" />, <InlineMath latex="X_{2s}=sX_2" />); solo R₂ es constante.</li>
          <li>Dividir la corriente del rotor por s concentra toda la dependencia con la velocidad en <InlineMath latex="R_2/s" /> — el eje del circuito equivalente.</li>
        </ul>
      </div>
    </section>
  )
}
