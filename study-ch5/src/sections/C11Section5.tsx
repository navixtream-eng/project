import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import GroundRelayLab from '../widgets/GroundRelayLab'
import { abs, cx, fmt } from '../lib/machine'
import { solveFault } from '../lib/secuencias'

/** Capítulo 11, Sección 5 — Protección de tierra: el residual 3I₀ y la coordinación. */
export default function C11Section5() {
  // Problema 54: SLG resistiva que el relé de fase no ve
  const sol = solveFault({
    kind: 'slg',
    E: 1,
    Z1: cx(0, 0.2),
    Z2: cx(0, 0.2),
    Z0: cx(0, 0.08),
    Zf: cx(0.5, 0),
    Zn: cx(0, 0),
  })
  const iF = abs(sol.phaseI.a)
  const res = sol.iResidual
  const pickupN = 0.2
  const tms = 0.1
  const M = res / pickupN
  const t51n = (tms * 0.14) / (Math.pow(M, 0.02) - 1)

  return (
    <section id="c11-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Protección de tierra: medir lo que solo la falla produce
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Todo el capítulo desemboca aquí: si la carga sana no produce secuencia cero, entonces
          3I₀ es una señal EXCLUSIVA de falla a tierra — y un relé que la mida puede ser
          exquisitamente sensible sin disparar jamás en operación normal. Así nace el 51N, y con
          él la coordinación integral fase + tierra.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · El residual: 3I₀ gratis en los TCs"
        idea="Suma las corrientes de los tres TCs de fase (conexión residual) o abraza los tres conductores con un TC toroidal: lo que mides es Ia+Ib+Ic = 3I₀. En carga balanceada: cero exacto. En falla a tierra: toda la corriente de retorno. Esta asimetría es oro para la protección — el relé de FASE debe ajustarse POR ENCIMA de la carga (pickup 1.1–3 pu, ciego a fallas débiles), pero el de TIERRA puede ajustarse a una fracción de la nominal (0.1–0.5 pu) porque no compite contra nada."
        analogy="En una fiesta ruidosa (la carga), oír un vaso romperse (la falla) exige que suene MÁS fuerte que la fiesta. El residual es un micrófono colocado donde la fiesta es silencio absoluto: hasta el tintineo más leve (la falla resistiva) se oye nítido."
      >
        <Formula
          latex="I_{res} = \hat I_a + \hat I_b + \hat I_c = 3\hat I_0 \qquad t_{51} = \frac{0.14\,TMS}{(I/I_{pk})^{0.02}-1}"
          symbols={[
            { sym: '3\\hat I_0', meaning: 'La corriente que efectivamente retorna por tierra. Cero en carga sana Y en fallas sin tierra (L-L): el 51N es ciego a ellas POR DISEÑO — cada relé vigila su fenómeno.' },
            { sym: 'I_{pk}', meaning: 'Pickup: el umbral de arranque. Fase: sobre la carga máxima con margen. Tierra: sobre el desbalance natural residual (pequeño) — de ahí su sensibilidad.' },
            { sym: 'TMS', meaning: 'Time multiplier: sube o baja la curva completa. Es la perilla de COORDINACIÓN: el relé más cercano a la falla dispara antes; el de respaldo, ~0.3 s después.' },
          ]}
        />
      </ConceptBlock>

      <GroundRelayLab />

      <ConceptBlock
        title="5.2 · La coordinación integral (el flujo del ingeniero de protecciones)"
        idea="Un ajuste real sigue una secuencia: (1) corriente de carga máxima → pickup de fase encima con margen; (2) curva de fase por ENCIMA del arranque de motores y por DEBAJO del daño térmico de los equipos; (3) pickup de tierra abajo (0.1–0.4 pu), verificado contra el desbalance natural; (4) verificar SENSIBILIDAD: ¿ve el relé la falla MÍNIMA (la resistiva, la del extremo del alimentador)? — no solo la franca en bornes; (5) coordinar en cascada: entre relé aguas abajo y su respaldo, margen de 0.3–0.4 s a la corriente de falla común. La selección de TCs, los tipos de curva y los esquemas direccionales/diferenciales amplían este flujo — aquí queda fundado su núcleo."
        analogy="Como los anillos de seguridad de un museo: el vigilante de sala (relé local) reacciona primero; el de piso (respaldo) cuenta hasta tres antes de intervenir; la alarma general, después. Si todos reaccionaran a la vez, cada incidente apagaría el museo entero — coordinar es dar a cada anillo su turno."
      >
        <p>
          Y el enlace con todo el capítulo: el relé de tierra <em>mide la red de secuencia cero</em>.
          Por eso los transformadores Δ–Yg parten el sistema en «zonas de tierra» independientes
          (Sección 3), el reactor de neutro fija cuánta señal tendrá el relé (Sección 2), y la
          falla resistiva — la más común — exige la sensibilidad que solo el residual permite
          (Sección 4).
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="c11s5-check-residual"
        question="¿Por qué el relé de tierra 51N puede ajustarse a 0.1 pu sin disparos falsos, mientras el de fase no puede bajar de ~1.1 pu?"
        options={[
          {
            label: 'Porque la señal del 51N (3I₀) es CERO en operación balanceada: no compite contra la carga. El de fase mide la corriente total, que en operación normal ya es ~1 pu.',
            correct: true,
            feedback:
              'La sensibilidad no la da el relé: la da la SEÑAL elegida. Medir lo que solo la falla produce es el principio de toda protección fina (el diferencial lleva la misma idea al extremo).',
          },
          {
            label: 'Porque los relés de tierra son de mejor calidad.',
            feedback:
              'Mismo hardware, distinta señal: conecta ese relé a una fase y sufrirá los mismos límites que el 51.',
          },
          {
            label: 'Porque las fallas a tierra son siempre pequeñas.',
            feedback:
              'Pueden ser enormes (SLG > 3φ cerca de generadores) — el punto es que la señal residual de la operación SANA es pequeña, no la falla.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s5-check-sensibilidad"
        question="Tu 51N está ajustado y coordina perfecto con la falla franca en bornes. ¿Qué verificación FALTA antes de dar por buena la protección?"
        options={[
          {
            label: 'La falla MÍNIMA: una SLG resistiva (arco, contacto con árbol) al final de la zona — si el residual de ESA no supera el pickup, tienes una protección que solo detecta las fallas fáciles.',
            correct: true,
            feedback:
              'Regla profesional: se coordina con la falla máxima (¿dispara ordenadamente?) y se verifica con la MÍNIMA (¿dispara siquiera?). La segunda mata más proyectos de ajuste que la primera.',
          },
          {
            label: 'Ninguna: la falla franca es el peor caso.',
            feedback:
              'Es el peor caso TÉRMICO, pero el mejor caso de DETECCIÓN. El enemigo del relé es la falla débil y lejana, no la violenta y cercana.',
          },
          {
            label: 'Probar con una falla trifásica.',
            feedback:
              'La 3φ no produce residual: es asunto del relé de fase. Cada protección se verifica contra las fallas de SU fenómeno.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s5-problema-51n"
        numero="54"
        title="La falla que solo el relé de tierra ve"
        statement={
          <>
            Sistema: X₁ = X₂ = 0.20 pu, X₀ = 0.08 pu. Ocurre una SLG con resistencia de falla
            R_f = 0.50 pu (contacto de alta impedancia). El relé de fase tiene pickup 2.0 pu; el
            51N tiene pickup 0.20 pu y TMS = 0.10 (curva IEC inversa estándar). Determine si cada
            relé detecta la falla y el tiempo de disparo del que la vea.
          </>
        }
        steps={[
          {
            title: 'Corriente de la falla resistiva',
            why: 'SLG con Zf: las tres redes en serie más 3Rf — la resistencia domina y «desinfla» la corriente.',
            work: `\\hat Z = 3(0.5) + j(0.48) \\Rightarrow |Z| = ${fmt(Math.hypot(1.5, 0.48), 3)} \\Rightarrow I_f = 3I_1 = ${fmt(iF, 2)}\\ \\text{pu}`,
          },
          {
            title: 'El relé de fase: ciego',
            why: 'Su pickup vive por encima de la carga; esta falla parece apenas una carga alta.',
            work: `I_f = ${fmt(iF, 2)} < 2.0\\ \\text{pu} \\;\\Rightarrow\\; \\text{el 51 de fase NO arranca}`,
          },
          {
            title: 'El 51N: la caza por el residual',
            why: 'La carga no aporta residual: TODO el 3I₀ es señal de falla, y supera con holgura su pickup sensible.',
            work: `3I_0 = ${fmt(res, 2)}\\ \\text{pu} > 0.20 \\;\\Rightarrow\\; M = ${fmt(M, 1)}`,
          },
          {
            title: 'Tiempo de disparo (curva IEC SI)',
            why: 'Curva inversa: mientras más corriente, más rápido — con el TMS como escala.',
            work: `t = \\frac{0.14 \\times 0.10}{${fmt(M, 1)}^{0.02} - 1} = ${fmt(t51n, 2)}\\ \\text{s}`,
            note: 'Menos de un segundo para una falla que el relé de fase NUNCA habría visto. Esta pareja (51 arriba, 51N sensible abajo) es el ajuste mínimo decente de cualquier alimentador.',
          },
        ]}
        answer={`\\text{51 fase: no arranca} \\qquad \\text{51N: } 3I_0 = ${fmt(res, 2)}\\ \\text{pu} \\to t = ${fmt(t51n, 2)}\\ \\text{s}`}
        takeaway="Coordinar no es solo escalonar tiempos: es elegir señales. El residual convierte la falla «invisible» en la más fácil de ver — todo el capítulo 11 trabajando para un disparo de medio segundo."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 5
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El residual Ia+Ib+Ic = 3I₀ es señal exclusiva de falla a tierra: sensibilidad de 0.1 pu sin competir con la carga. Ciego a la L-L por diseño.</li>
          <li>Flujo integral: carga → pickup fase → curva sobre el arranque → tierra aparte y sensible → verificar la falla MÍNIMA → coordinar en cascada (~0.3 s).</li>
          <li>Las redes de secuencia son el idioma de la protección: la delta parte zonas de tierra, el 3Zn fija la señal, y la falla resistiva define la sensibilidad requerida.</li>
        </ul>
      </div>
    </section>
  )
}
