import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ZeroSeqTrafoLab from '../widgets/ZeroSeqTrafoLab'
import { fmt } from '../lib/machine'

/** Capítulo 11, Sección 3 — El transformador dentro de las redes de secuencia. */
export default function C11Section3() {
  // Problema 52: falla SLG tras un trafo Δ–Yg
  const X1g = 0.2
  const XT = 0.1
  const X1 = X1g + XT
  const X0 = XT // ¡la delta desconecta el X0 del generador!
  const ifSlg = 3 / (2 * X1 + X0)

  return (
    <section id="c11-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El transformador: portero de la secuencia cero
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          En las redes positiva y negativa el transformador es solo su impedancia. En la red CERO
          es un interruptor topológico: según la conexión de sus devanados deja pasar la I₀, la
          atrapa en la delta o le cierra la puerta. Dominar esas reglas es dominar las fallas a
          tierra en sistemas reales.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · Las tres reglas (Yg, Δ, Y)"
        idea="Y ATERRIZADA (Yg): las corrientes de secuencia cero tienen camino por el neutro — la puerta a la línea está ABIERTA. DELTA (Δ): dentro de la delta las tres I₀ (idénticas y en fase) pueden circular persiguiéndose en el lazo cerrado, pero NO pueden salir a la línea (su suma saldría por tres conductores idénticos… que no suman cero): la delta es un sumidero interno — camino a referencia, línea aislada. Y AISLADA: sin neutro no hay retorno — pared. Combinando lado y lado salen los cinco circuitos clásicos."
        analogy="Un edificio con tres tipos de puerta: giratoria conectada a la calle (Yg), un patio interior donde puedes caminar en círculos pero sin salida (Δ), y un muro (Y). La corriente de secuencia cero es un visitante que SOLO puede entrar si hay giratoria — y si adentro encuentra patio, se queda dando vueltas ahí."
      >
        <Formula
          latex="\text{Yg–Yg: pasa} \qquad \text{Yg–}\Delta\text{: deriva a referencia, no cruza} \qquad \text{Y o } \Delta\text{–}\Delta\text{: abierta}"
          symbols={[
            { sym: '\\text{Yg–Yg}', meaning: 'Único caso en que una falla a tierra de un lado se alimenta con secuencia cero desde el otro: las dos redes quedan unidas por jX_T0.' },
            { sym: '\\text{Yg–}\\Delta', meaning: 'El caballo de batalla (generador-red, distribución): da retorno de tierra al lado Yg pero AÍSLA las fallas a tierra entre niveles de tensión. La delta trabaja de filtro.' },
            { sym: '3^{\\text{er}}\\ \\text{armónico}', meaning: 'Bono conceptual: los terceros armónicos son «secuencia cero de 180 Hz» — por eso la delta también los atrapa (Cap. 2, corriente de excitación).' },
          ]}
        />
      </ConceptBlock>

      <ZeroSeqTrafoLab />

      <FeynmanCheck
        id="c11s3-check-delta"
        question="En el banco elevador clásico generador(Δ)–red(Yg), ocurre una falla a tierra en la red de alta. ¿Contribuye la reactancia de secuencia cero DEL GENERADOR a esa falla?"
        options={[
          {
            label: 'No: la delta bloquea el paso de I₀ hacia el generador — la red cero vista desde la falla contiene SOLO al transformador (y lo que haya del lado Yg). El X₀ del generador queda desconectado.',
            correct: true,
            feedback:
              'Y es deliberado: el generador queda protegido de las fallas a tierra del sistema, y su propio aterrizamiento (con su reactor) solo gobierna las fallas de SU zona. La topología ES la protección.',
          },
          {
            label: 'Sí: todas las impedancias del sistema siempre contribuyen a todas las fallas.',
            feedback:
              'Cierto en las redes positiva y negativa — falso en la cero: su topología depende de las conexiones, y la delta corta el camino.',
          },
          {
            label: 'Solo si la falla es muy severa.',
            feedback:
              'La topología no depende de la severidad: la delta no deja pasar I₀ ni en la falla más violenta.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s3-check-ygyg"
        question="¿Por qué los transformadores Yg–Yg (sin delta en ningún lado) se consideran «transparentes» — y a veces problemáticos — para las fallas a tierra?"
        options={[
          {
            label: 'Porque son la única conexión que UNE las redes de secuencia cero de ambos lados: una falla a tierra en un nivel de tensión se alimenta también desde el otro, y los relés de tierra de ambos sistemas se ven entre sí.',
            correct: true,
            feedback:
              'Por eso muchos Yg–Yg llevan un TERCER devanado en delta (terciario): reintroduce la trampa de I₀ y estabiliza el neutro sin perder el aterrizamiento en ambos lados.',
          },
          {
            label: 'Porque tienen más pérdidas que los Δ–Y.',
            feedback:
              'Las pérdidas son comparables — el tema es topológico: el camino de secuencia cero queda pasante.',
          },
          {
            label: 'Porque no pueden operar en paralelo con otros bancos.',
            feedback:
              'Pueden (si coinciden grupos): el rasgo distintivo del Yg–Yg es la continuidad de la red cero, no el paralelo.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s3-problema-trafo"
        numero="52"
        title="Falla a tierra a través de un banco Δ–Yg"
        statement={
          <>
            Un generador (X₁ = X₂ = {fmt(X1g, 2)} pu, X₀ = 0.05 pu, neutro aterrizado) alimenta la
            red por un banco Δ(gen)–Yg(red) con X_T = {fmt(XT, 2)} pu (igual en las tres
            secuencias). Ocurre una falla SLG franca en los bornes de ALTA (lado Yg). Construya las
            redes vistas desde la falla y halle la corriente.
          </>
        }
        steps={[
          {
            title: 'Redes positiva y negativa: todo en serie',
            why: 'Para la positiva y la negativa el transformador es solo su impedancia: generador y banco se suman.',
            work: `X_1 = X_2 = X_{1g} + X_T = ${fmt(X1g, 2)} + ${fmt(XT, 2)} = ${fmt(X1, 2)}\\ \\text{pu}`,
          },
          {
            title: 'Red cero: la delta corta al generador',
            why: 'Desde la falla (lado Yg) la I₀ entra al banco y retorna por su neutro; hacia el generador la delta está cerrada. El X₀ = 0.05 del generador NO aparece.',
            work: `X_0 = X_T = ${fmt(X0, 2)}\\ \\text{pu} \\quad (\\text{el } 0.05\\ \\text{del generador queda fuera})`,
            note: 'Este es EL paso donde se gana o se pierde el problema: la red cero se construye mirando conexiones, no sumando todo lo que exista.',
          },
          {
            title: 'Conectar en serie (SLG) y resolver',
            why: 'Falla monofásica: las tres redes en serie, If = 3·I₁.',
            work: `I_f = \\frac{3}{X_1+X_2+X_0} = \\frac{3}{${fmt(2 * X1 + X0, 2)}} = ${fmt(ifSlg, 2)}\\ \\text{pu}`,
            note: `Comparación: la trifásica en el mismo punto daría 1/${fmt(X1, 2)} = ${fmt(1 / X1, 2)} pu — aquí la SLG ${ifSlg > 1 / X1 ? 'la supera' : 'queda por debajo'} porque X₀ del punto ${X0 < X1 ? 'es menor que X₁' : 'no es menor que X₁'}.`,
          },
        ]}
        answer={`X_0^{falla} = ${fmt(X0, 2)}\\ \\text{pu (solo el banco)} \\qquad I_f = ${fmt(ifSlg, 2)}\\ \\text{pu}`}
        takeaway="En la red cero, primero se dibuja la TOPOLOGÍA (qué conexiones dejan pasar) y después se suman impedancias. El Δ–Yg existe, en buena parte, para que las fallas a tierra de cada nivel se queden en su nivel."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Yg = puerta abierta a la línea; Δ = retorno interno (deriva a referencia) sin salida a línea; Y = pared. La red cero se DIBUJA con estas reglas antes de calcular nada.</li>
          <li>Δ–Yg: aísla las fallas a tierra entre niveles — el X₀ de lo que está detrás de la delta desaparece del problema.</li>
          <li>Yg–Yg une las redes cero de ambos lados (por eso se le añade terciario en delta). Y de regalo: la delta también atrapa terceros armónicos (secuencia cero de 3f).</li>
        </ul>
      </div>
    </section>
  )
}
