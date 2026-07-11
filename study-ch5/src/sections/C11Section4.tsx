import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import FaultTypeLab from '../widgets/FaultTypeLab'
import { abs, cx, fmt } from '../lib/machine'
import { solveFault } from '../lib/secuencias'

/** Capítulo 11, Sección 4 — El catálogo de fallas: conexiones de redes, Zf y fallas serie. */
export default function C11Section4() {
  // Problema 53: LLG franca
  const sol = solveFault({
    kind: 'llg',
    E: 1,
    Z1: cx(0, 0.2),
    Z2: cx(0, 0.2),
    Z0: cx(0, 0.08),
    Zf: cx(0, 0),
    Zn: cx(0, 0),
  })

  return (
    <section id="c11-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El catálogo de fallas: cada tipo conecta las redes a su manera
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Aquí las tres redes cobran vida: la falla es un CONECTOR que las une en el punto
          averiado. Serie para la monofásica, paralelo para la bifásica, divisor para la bifásica
          a tierra — y las impedancias de falla y de neutro entran como resistencias en ese
          conector. Una sola idea, todo el catálogo.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · Las condiciones de frontera se vuelven conexiones"
        idea="Cada tipo de falla impone condiciones en el punto: la SLG dice Ib = Ic = 0 y Va = Zf·Ia; traducidas a secuencias resultan I₁ = I₂ = I₀ — ¡eso es un circuito SERIE de las tres redes (con 3Zf de por medio)! La L-L dice Ia = 0, Ib = −Ic: resulta I₁ = −I₂, I₀ = 0 — redes positiva y negativa en PARALELO (la cero ni se entera: no hay tierra). La LLG conecta las tres en paralelo desde la positiva: I₁ se DIVIDE entre negativa y cero como divisor de corriente. Las matemáticas de frontera se convierten en topología de circuitos — y de ahí en adelante es análisis de circuitos de primer año."
        analogy="Las tres redes son tres tanques de agua (solo el primero tiene bomba). La falla es la tubería que los conecta: en fila (serie), en anillo de dos (paralelo) o en Y de tres (divisor). No hay que memorizar fórmulas de fallas: hay que recordar CÓMO se conecta la tubería."
      >
        <Formula
          latex="\text{SLG: } I_1 = I_2 = I_0 = \frac{E}{Z_1+Z_2+Z_0+3Z_f+3Z_n} \qquad \text{L-L: } I_1 = -I_2 = \frac{E}{Z_1+Z_2+Z_f} \qquad \text{LLG: } I_1 = \frac{E}{Z_1 + Z_2 \parallel (Z_0+3Z_f+3Z_n)}"
          symbols={[
            { sym: '3Z_f,\\; 3Z_n', meaning: 'Las impedancias de falla y de neutro entran TRIPLICADAS en los caminos de secuencia cero — el mismo factor 3 del neutro. Una falla con arco (Zf ≠ 0) es una falla en serie con resistencia: menos corriente, más difícil de detectar.' },
            { sym: 'Z_2 \\parallel Z_0', meaning: 'En la LLG, la corriente positiva elige entre volver por la red negativa o por la cero: divisor de corriente clásico. Con Z₀ chica, casi toda se va a tierra.' },
            { sym: 'I_f = 3I_0', meaning: 'En toda falla que toca tierra, la corriente que efectivamente entra al suelo es 3I₀ — la misma que ve el relé residual (Sección 5).' },
          ]}
        />
      </ConceptBlock>

      <FaultTypeLab />

      <ConceptBlock
        title="4.2 · Fallas serie y fallas simultáneas (el siguiente nivel)"
        idea="No todas las averías son cortocircuitos: un conductor ABIERTO (fusible de una fase, puente caído) es una falla SERIE — el desbalance está en la corriente que no puede pasar, no en un contacto. Su análisis usa las mismas redes pero conectadas entre DOS puntos (antes y después de la apertura), y el resultado sorprende: un abierto en una fase inyecta secuencia negativa y cero aguas abajo — un motor «pierde una fase» y se cocina con V₂ aunque nada haya hecho corto. Las fallas SIMULTÁNEAS (un abierto + una SLG, dos fallas en puntos distintos) se tratan conectando las redes en dos puntos a la vez — mismo método, contabilidad más fina. Este documento las deja planteadas: el método que ya dominas es exactamente el que escala."
        analogy="El corto es un puente que NO debía existir; el abierto es un puente que DEBÍA existir y falta. Ambos desequilibran el tránsito — y el mapa (las redes) es el mismo: solo cambia dónde conectas el desvío."
      >
        <p>
          El caso práctico imprescindible: la <strong>pérdida de fase</strong> en un motor (falla
          serie más común de la industria). El motor sigue girando con par pulsante, la corriente
          de las fases sanas sube ~√3 veces y la protección térmica convencional puede tardar —
          por eso existen relés específicos de secuencia negativa (46).
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="c11s4-check-conexion"
        question="Sin calcular: una falla bifásica SIN tierra (L-L) en un sistema con la red cero muy «corta» (X₀ pequeñísima). ¿Cambia la corriente de falla si X₀ se duplica?"
        options={[
          {
            label: 'No cambia nada: la L-L conecta solo las redes positiva y negativa — sin camino a tierra, I₀ = 0 y la red cero es espectadora, valga lo que valga.',
            correct: true,
            feedback:
              'La topología manda: cada tipo de falla «activa» sus redes. Reconocer QUÉ redes participan antes de calcular es el 80 % del problema (y del examen).',
          },
          {
            label: 'La corriente baja a la mitad.',
            feedback:
              'Solo si X₀ participara — y en la L-L no participa: no hay conexión a tierra que le dé camino a I₀.',
          },
          {
            label: 'Depende del aterrizamiento del neutro.',
            feedback:
              'El neutro vive en la red cero: de nuevo, espectadora en una falla sin tierra. Zn podría ser infinita y la L-L ni se enteraría.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s4-check-serie"
        question="Un motor trifásico pierde un fusible (fase abierta) pero sigue girando con carga. ¿Por qué es una emergencia térmica aunque «no hay cortocircuito»?"
        options={[
          {
            label: 'La apertura inyecta secuencia negativa: el motor ve un campo inverso (deslizamiento ≈ 2) con Z₂ pequeña — corrientes grandes en las fases sanas (~√3×) y calentamiento de rotor a doble frecuencia, con la protección de sobrecorriente común casi ciega.',
            correct: true,
            feedback:
              'La falla serie es el desbalance disfrazado de normalidad: la corriente no es «de falla» para un 50/51, pero el rotor se cocina. El relé 46 (secuencia negativa) existe exactamente para esto.',
          },
          {
            label: 'Porque el motor se detiene inmediatamente.',
            feedback:
              'Con carga parcial sigue girando (par monofásico pulsante) — y eso es lo peligroso: la avería no se anuncia.',
          },
          {
            label: 'No es emergencia: dos fases bastan.',
            feedback:
              'Bastan para girar, no para sobrevivir: la I₂ resultante calienta el rotor a un ritmo que el diseño no contempla en continuo.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s4-problema-llg"
        numero="53"
        title="Falla bifásica a tierra: el divisor completo"
        statement={
          <>
            En bornes de un generador con X₁ = X₂ = 0.20 pu y X₀ = 0.08 pu (sólidamente
            aterrizado) ocurre una falla LLG franca (fases b y c a tierra). Halle I₁, I₂, I₀, las
            corrientes de fase y el residual 3I₀.
          </>
        }
        steps={[
          {
            title: 'Conectar: negativa ∥ cero, tras la positiva',
            why: 'La LLG une las tres redes en el punto de falla: la positiva empuja y su corriente se reparte entre las otras dos.',
            work: `Z_2 \\parallel Z_0 = \\frac{0.20 \\times 0.08}{0.28} = ${fmt((0.2 * 0.08) / 0.28, 4)} \\;\\Rightarrow\\; I_1 = \\frac{1}{0.20 + ${fmt((0.2 * 0.08) / 0.28, 4)}} = ${fmt(abs(sol.seqI.s1), 2)}\\ \\text{pu}`,
          },
          {
            title: 'El divisor de corriente',
            why: 'I₁ regresa repartida: más por el camino de menor impedancia (la red cero, aquí la más corta).',
            work: `I_2 = -I_1\\frac{X_0}{X_2+X_0} = ${fmt(abs(sol.seqI.s2), 2)}\\angle 180^\\circ \\qquad I_0 = -I_1\\frac{X_2}{X_2+X_0} = ${fmt(abs(sol.seqI.s0), 2)}\\angle 180^\\circ`,
          },
          {
            title: 'De vuelta a las fases',
            why: 'Síntesis inversa: Ia debe dar CERO (la fase a está sana) — el mejor autochequeo del problema.',
            work: `I_a = I_0+I_1+I_2 = ${fmt(abs(sol.phaseI.a), 2)} \\approx 0\\;✓ \\qquad |I_b| = |I_c| = ${fmt(abs(sol.phaseI.b), 2)}\\ \\text{pu}`,
          },
          {
            title: 'El residual (lo que entra a tierra)',
            why: 'La suma de las tres corrientes de fase es lo que retorna por el suelo: 3I₀ — exactamente lo que medirá el relé de tierra de la Sección 5.',
            work: `3I_0 = ${fmt(sol.iResidual, 2)}\\ \\text{pu}`,
            note: 'Nota el reparto: con X₀ = 0.08 ≪ X₂ = 0.20, casi tres cuartos de la corriente de retorno eligió la tierra. La red cero corta ES un imán de corriente de falla.',
          },
        ]}
        answer={`I_1 = ${fmt(abs(sol.seqI.s1), 2)}\\ \\text{pu} \\quad |I_b| = |I_c| = ${fmt(abs(sol.phaseI.b), 2)}\\ \\text{pu} \\quad 3I_0 = ${fmt(sol.iResidual, 2)}\\ \\text{pu}`}
        takeaway="El catálogo completo cabe en una imagen: serie (SLG), paralelo (L-L), divisor (LLG). Y el autochequeo de oro: las fases SANAS deben dar corriente cero al reconstruir."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>La falla es un conector de redes: SLG = serie (con 3Zf+3Zn), L-L = paralelo sin cero, LLG = divisor. Las condiciones de frontera se vuelven topología.</li>
          <li>Zf (arco) y Zn entran ×3 en los caminos de tierra: las fallas reales son «débiles» — la protección debe ver la mínima, no la franca.</li>
          <li>Fallas serie (fase abierta) y simultáneas: mismas redes, conexiones entre dos puntos. La pérdida de fase de un motor es I₂ disfrazada de operación normal — relé 46.</li>
        </ul>
      </div>
    </section>
  )
}
