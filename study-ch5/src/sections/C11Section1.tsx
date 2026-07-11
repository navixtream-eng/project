import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import FortescueLab from '../widgets/FortescueLab'
import { abs, arg, cis, fmt, toDeg, toRad } from '../lib/machine'
import { abcTo012 } from '../lib/secuencias'

/** Capítulo 11, Sección 1 — Fortescue: la descomposición en secuencias. */
export default function C11Section1() {
  // Problema 50: descomposición numérica
  const t = { a: cis(1, 0), b: cis(0.9, toRad(-115)), c: cis(1.05, toRad(118)) }
  const s = abcTo012(t)

  return (
    <section id="c11-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Fortescue: todo desbalance son tres balances
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Hasta ahora todo fue trifásico balanceado: una sola fase representaba a las tres. Cuando
          el sistema se desequilibra (una falla a tierra, una carga coja), ese truco muere — y
          Fortescue lo resucita: CUALQUIER conjunto desbalanceado es la suma exacta de tres
          conjuntos balanceados. El desbalance no se analiza: se descompone.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · El operador a y las tres secuencias"
        idea="Define a = 1∠120° (girar un fasor un tercio de vuelta). Con él, tres fasores cualesquiera V̂a, V̂b, V̂c se descomponen en: secuencia POSITIVA (tres fasores iguales girados a-b-c, el sistema «sano» que produce par útil), secuencia NEGATIVA (girados a-c-b: un sistema balanceado que gira AL REVÉS) y secuencia CERO (tres fasores idénticos y en fase, que solo pueden circular si existe un cuarto conductor: neutro o tierra). La transformación es exacta e invertible — no es una aproximación."
        analogy="Como descomponer cualquier color en RGB: el color más extraño es exactamente tanto rojo, tanto verde y tanto azul. Aquí el «desbalance más extraño» es exactamente tanta positiva, tanta negativa y tanta cero — y cada componente se comporta de forma simple por separado."
      >
        <Formula
          latex="\hat V_0 = \tfrac{1}{3}(\hat V_a + \hat V_b + \hat V_c) \quad \hat V_1 = \tfrac{1}{3}(\hat V_a + a\hat V_b + a^2\hat V_c) \quad \hat V_2 = \tfrac{1}{3}(\hat V_a + a^2\hat V_b + a\hat V_c)"
          symbols={[
            { sym: 'a = 1\\angle 120^\\circ', meaning: 'El operador de rotación: a³ = 1 y 1 + a + a² = 0 — esta última identidad es la que hace que un sistema balanceado tenga V₀ = V₂ = 0.' },
            { sym: '\\hat V_1', meaning: 'Secuencia positiva: lo único que existe en un sistema sano. Los generadores solo FABRICAN esta.' },
            { sym: '\\hat V_2', meaning: 'Secuencia negativa: gira contra el rotor. En una máquina la ve como un campo a deslizamiento 2−s ≈ 2: corrientes de doble frecuencia en el rotor, puro calentamiento y par de freno.' },
            { sym: '\\hat V_0', meaning: 'Secuencia cero: las tres en fase. Su suma NO es nula, así que necesita un camino de retorno (neutro/tierra) — sin él, no puede circular. Es la protagonista de las fallas a tierra.' },
          ]}
        />
      </ConceptBlock>

      <FortescueLab />

      <FeynmanCheck
        id="c11s1-check-balance"
        question="Predice antes de mover los deslizadores: un sistema PERFECTAMENTE balanceado (tres fasores iguales a 120°), ¿qué componentes de secuencia tiene?"
        options={[
          {
            label: 'Solo positiva: V₁ = V y V₂ = V₀ = 0 — balanceado ES sinónimo de «pura secuencia positiva».',
            correct: true,
            feedback:
              'Exacto: en V₀ la suma 1+a²+a⁴... da 1+a+a² = 0, y en V₂ igual. Por eso TODO lo que estudiaste antes de este capítulo era, sin decirlo, el análisis de la red de secuencia positiva.',
          },
          {
            label: 'Un tercio de cada secuencia, por simetría.',
            feedback:
              'La simetría juega al revés: las identidades 1+a+a² = 0 ANIQUILAN a la negativa y a la cero cuando el sistema es balanceado. La descomposición no reparte por igual: detecta.',
          },
          {
            label: 'Depende de la magnitud de los voltajes.',
            feedback:
              'La magnitud escala las componentes pero no crea nuevas: balanceado da (V, 0, 0) sea V grande o chico.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s1-check-negativa"
        question="Un motor trifásico opera con V₂/V₁ = 5 % por una fase floja. ¿Por qué la norma limita esto a ~2 % si el desbalance de voltaje parece pequeño?"
        options={[
          {
            label: 'Porque la impedancia de secuencia negativa del motor es MUY baja (como la de rotor bloqueado): un 5 % de V₂ produce ~25–30 % de corriente negativa, que gira contra el rotor calentándolo a frecuencia doble.',
            correct: true,
            feedback:
              'La clave: Z₂ del motor ≈ Z de arranque (el campo negativo ve deslizamiento 2−s ≈ 2). El amplificador de corriente es 1/Z₂ ≈ 5–6: un desbalance «pequeño» de voltaje es uno GRANDE de corriente y de calor.',
          },
          {
            label: 'Porque el par disminuye un 5 % y la producción se resiente.',
            feedback:
              'El par de freno de la negativa es pequeño; el asesino real es TÉRMICO: la corriente negativa amplificada calienta el rotor sin producir nada.',
          },
          {
            label: 'Es un margen comercial sin base física.',
            feedback:
              'Tiene base dura: la relación Z₁/Z₂ del motor convierte cada punto porcentual de V₂ en varios de corriente. Los derrateos por desbalance de NEMA salen de ahí.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s1-problema-descomposicion"
        numero="50"
        title="Descomposición de un sistema desbalanceado"
        statement={
          <>
            Un registrador capturó: V̂a = 1.0∠0°, V̂b = 0.90∠−115°, V̂c = 1.05∠118° pu. Halle las
            tres componentes de secuencia y el factor de desequilibrio V₂/V₁.
          </>
        }
        steps={[
          {
            title: 'Plantear la transformación con el operador a',
            why: 'Tres ecuaciones lineales: cada secuencia es un «promedio girado» de los tres fasores.',
            work: `\\hat V_0 = \\tfrac{1}{3}(\\hat V_a + \\hat V_b + \\hat V_c) \\qquad \\hat V_1 = \\tfrac{1}{3}(\\hat V_a + a\\hat V_b + a^2\\hat V_c)`,
          },
          {
            title: 'Secuencia positiva (girar b con a, c con a²)',
            why: 'El giro «endereza» los fasores de un sistema a-b-c: si estuvieran balanceados, los tres coincidirían y el promedio sería el fasor completo.',
            work: `\\hat V_1 = ${fmt(abs(s.s1), 3)}\\angle ${fmt(toDeg(arg(s.s1)), 1)}^\\circ\\ \\text{pu}`,
          },
          {
            title: 'Negativa y cero',
            why: 'La negativa endereza el orden a-c-b; la cero es el promedio directo (lo que las tres tienen «en común»).',
            work: `\\hat V_2 = ${fmt(abs(s.s2), 3)}\\angle ${fmt(toDeg(arg(s.s2)), 1)}^\\circ \\qquad \\hat V_0 = ${fmt(abs(s.s0), 3)}\\angle ${fmt(toDeg(arg(s.s0)), 1)}^\\circ`,
          },
          {
            title: 'Factor de desequilibrio',
            why: 'El índice de calidad estándar: cuánta «contaminación» negativa hay respecto al sistema útil.',
            work: `\\frac{V_2}{V_1} = \\frac{${fmt(abs(s.s2), 3)}}{${fmt(abs(s.s1), 3)}} = ${fmt((abs(s.s2) / abs(s.s1)) * 100, 1)}\\%`,
            note: 'Supera el ~2 % admisible para motores: esta red exige corrección (o derrateo del motor conectado). Verificación: reconstruye V̂a = V₀+V₁+V₂ y debe dar 1.0∠0° exacto.',
          },
        ]}
        answer={`\\hat V_1 = ${fmt(abs(s.s1), 3)}\\ \\text{pu} \\quad \\hat V_2 = ${fmt(abs(s.s2), 3)}\\ \\text{pu} \\quad \\hat V_0 = ${fmt(abs(s.s0), 3)}\\ \\text{pu} \\quad V_2/V_1 = ${fmt((abs(s.s2) / abs(s.s1)) * 100, 1)}\\%`}
        takeaway="La descomposición es mecánica: tres promedios girados. El criterio profesional está en LEERLA: V₁ es el sistema, V₂ es calentamiento de máquinas, V₀ es corriente buscando el neutro."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Cualquier tripleta de fasores = positiva + negativa + cero, con el operador <InlineMath latex="a = 1\angle 120^\circ" /> como herramienta única. Exacto e invertible.</li>
          <li>Balanceado = pura positiva. La negativa gira al revés (calienta rotores a 2f); la cero va en fase (necesita neutro o tierra para existir).</li>
          <li>El desequilibrio se mide con V₂/V₁ — y las máquinas lo amplifican en corriente porque su Z₂ es pequeña (≈ la de arranque).</li>
        </ul>
      </div>
    </section>
  )
}
