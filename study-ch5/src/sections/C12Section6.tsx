import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import TwoNodeLab from '../widgets/TwoNodeLab'
import HeatRunLab from '../widgets/HeatRunLab'
import { fmt } from '../lib/machine'
import { DOS_NODOS_NOM, dosNodosSS, estimaEnsayo, perdidasDetalladas, rcaDe } from '../lib/termica'

/** Capítulo 12, Sección 6 — El modelo fino: dos nodos, pérdidas separadas y el ensayo. */
export default function C12Section6() {
  // Problema 64: estimación por tres puntos
  const e64 = estimaEnsayo(18.5, 30.1, 37.4, 30)!

  // Problema 65: variador a baja velocidad
  const p65 = perdidasDetalladas(1, 0.3)
  const rcaAuto = rcaDe('autoventilado', 0.3)
  const ssAuto = dosNodosSS({ ...DOS_NODOS_NOM, rca: rcaAuto }, p65.total)
  const ssForz = dosNodosSS(DOS_NODOS_NOM, p65.total)

  return (
    <section id="c12-seccion-6" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 6
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El modelo fino: dos nodos, pérdidas separadas y el ensayo
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El RC de un nodo enseña la estructura; el trabajo fino exige tres mejoras: separar las
          pérdidas (cada una responde a una variable distinta), separar los nodos (el devanado no
          es la carcasa) y MEDIR los parámetros en vez de suponerlos — el ensayo de calentamiento.
        </p>
      </header>

      <ConceptBlock
        title="6.1 · Cada pérdida con su variable (y la refrigeración con la suya)"
        idea="P_total = P_cu + P_fe + P_mec + P_adicionales, y cada término baila con música distinta: el cobre con el PAR al cuadrado (corriente), el hierro con la FRECUENCIA (a flujo constante bajo V/f: ≈ f^1.3 entre histéresis y Foucault), las mecánicas con la VELOCIDAD (ventilador ∝ n^2.5–3), las adicionales con la carga. Y la evacuación tiene su propia variable: en un motor AUTOVENTILADO el ventilador va en el eje — a media velocidad evacúa una fracción; con ventilación FORZADA (IC416) es independiente; un TENV no depende de la velocidad pero parte de una R_th mayor. El caso crítico emerge solo: par constante a baja velocidad con variador = cobre íntegro + ventilación desfallecida."
        analogy="Un ciclista en montaña: las piernas (cobre) trabajan según la pendiente (par), la fricción del aire (mecánicas) según la velocidad, y su sudor solo lo evapora el viento DE AVANZAR (autoventilado). Subiendo despacio con máxima fuerza es cuando se cocina — no cuando corre. El soplador independiente es el ventilador de mano del acompañante."
      >
        <Formula
          latex="P = \underbrace{f_{cu}\,c^2}_{\text{par}} + \underbrace{f_{fe}\,f_{pu}^{1.3}}_{\text{frecuencia}} + \underbrace{f_{mec}\,n_{pu}^{2.5}}_{\text{velocidad}} + \underbrace{f_{add}\,c^2}_{\text{carga}} \qquad R_{ca} = R_{ca}(refrigeración,\ n)"
          symbols={[
            { sym: 'f_{cu}, f_{fe}, f_{mec}, f_{add}', meaning: 'Reparto nominal típico 50/25/15/10 (declarado — el real sale del ensayo de pérdidas segregadas de IEC 60034-2-1). Los exponentes también son típicos: 1.3 para hierro, 2.5–3 para ventilador.' },
            { sym: 'R_{ca}(n)', meaning: 'Autoventilado: la evacuación cae con la velocidad (aquí ≈ 1/(0.25+0.75·n) declarado). Es la razón del derrateo por velocidad de los catálogos «inverter duty» — o del soplador independiente.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="6.2 · Dos nodos: el devanado no es la carcasa"
        idea="El cobre pesa poco y genera mucho: su temperatura responde en MINUTOS (τ_w ≈ 5–10 min). La carcasa y el hierro pesan mucho: responden en la HORA (τ_c ≈ 40–90 min). El modelo de dos nodos (devanado → carcasa → ambiente) captura lo que el de uno no puede: una sobrecarga breve dispara el cobre mientras la carcasa ni se entera — tocar la carcasa y declarar «está frío» es el clásico error de campo. Los relés térmicos modernos (49 numérico) usan exactamente dos constantes por esto; y en régimen, el modelo devuelve el GRADIENTE devanado-carcasa que el ensayo de la Sección 2 sumaba a ojo."
        analogy="Sartén con mango de metal: el aceite (devanado) chisporrotea a los segundos de subir el fuego; el mango (carcasa) tarda minutos en quemarte. Tocar el mango para saber si el aceite salta es exactamente el error que el modelo de dos nodos evita."
      >
        <p>
          Las ecuaciones son dos RC acoplados —{' '}
          <em>C_w·dθ_w/dt = P − (θ_w−θ_c)/R_wc</em> y{' '}
          <em>C_c·dθ_c/dt = (θ_w−θ_c)/R_wc − θ_c/R_ca</em> — y en régimen: θ_c = P·R_ca,
          θ_w = θ_c + P·R_wc. Todo lo aprendido con un nodo sobrevive; lo nuevo es la ESCALA DE
          TIEMPOS doble.
        </p>
      </ConceptBlock>

      <TwoNodeLab />

      <ConceptBlock
        title="6.3 · Medir en vez de suponer: el ensayo de calentamiento"
        idea="Los parámetros térmicos no se adivinan: se ENSAYAN. Se carga la máquina, se muestrea su elevación (por variación de resistencia del devanado — el método de la norma — o con sensores embebidos) y se extrapola: con tres puntos equidistantes θ₁, θ₂, θ₃ de una exponencial, θ_ss = (θ₂² − θ₁θ₃)/(2θ₂ − θ₁ − θ₃) y τ sale del logaritmo. De ahí, R_th = θ_ss/P y C_th = τ/R_th: el modelo queda POBLADO con datos reales. La letra chica que el laboratorio te hace vivir: con un ensayo corto frente a τ, la extrapolación amplifica el ruido de medición — regla práctica: ensayo ≥ 1.5–2τ, o el criterio de gradiente de la norma (variación < 2 K/h)."
        analogy="Adivinar la altura final de un árbol: con fotos de tres años consecutivos de su juventud puedes extrapolar la asíntota — pero si las tres fotos son de sus tres primeros meses, cualquier error de medición te da un roble o un bonsái. La extrapolación es legítima; la impaciencia, no."
      >
        <Formula
          latex="\theta_{ss} = \frac{\theta_2^2 - \theta_1\theta_3}{2\theta_2 - \theta_1 - \theta_3} \qquad \tau = \frac{\Delta t}{\ln\frac{\theta_{ss}-\theta_1}{\theta_{ss}-\theta_2}} \qquad R_{th} = \frac{\theta_{ss}}{P},\;\; C_{th} = \frac{\tau}{R_{th}}"
          symbols={[
            { sym: '\\theta_1, \\theta_2, \\theta_3', meaning: 'Tres muestras EQUIDISTANTES en el tiempo (Δt igual). La fórmula explota que una exponencial pura queda determinada por tres puntos — el ruido real exige más muestras y ajuste, pero la estructura es esta.' },
            { sym: '2\\theta_2 - \\theta_1 - \\theta_3', meaning: 'El denominador frágil: mide la CURVATURA capturada. Ensayo corto → curva casi recta → denominador pequeño → el ruido explota. De ahí la regla del 1.5–2τ.' },
            { sym: '\\Delta R \\to \\theta', meaning: 'El método de resistencia (IEC 60034-1): la temperatura MEDIA del cobre sale de R₂/R₁ = (235+T₂)/(235+T₁) — sin abrir la máquina. El punto caliente se estima sumando el gradiente (o midiendo con sensores).' },
          ]}
        />
      </ConceptBlock>

      <HeatRunLab />

      <FeynmanCheck
        id="c12s6-check-variador"
        question="Un motor autoventilado mueve una banda (par constante) con variador. Al bajar a 30 % de velocidad, sus pérdidas totales BAJAN (~66 %) y sin embargo se sobrecalienta. ¿Por qué?"
        options={[
          {
            label: 'Porque su evacuación cayó más rápido que sus pérdidas: el ventilador va en el eje (R_ca ≈ 2.4× peor a 0.3·n), y el cobre — que depende del PAR, no de la velocidad — sigue íntegro. θ = P·R_th sube aunque P baje.',
            correct: true,
            feedback:
              'El caso clásico de aplicación de variadores: par constante + autoventilado + baja velocidad = soplador independiente o derrateo del catálogo «inverter duty». Las bombas (par cuadrático) se salvan porque su cobre TAMBIÉN cae con la velocidad.',
          },
          {
            label: 'Por los armónicos del variador, exclusivamente.',
            feedback:
              'Los armónicos añaden algo de pérdida, pero el mecanismo dominante aquí es la VENTILACIÓN: el mismo motor con soplador independiente opera sano en el mismo punto.',
          },
          {
            label: 'Es imposible: menos pérdidas siempre es menos temperatura.',
            feedback:
              'θ = P·R_th: si R_th sube 2.4× mientras P baja a 0.66, el producto CRECE (1.6×). La temperatura es un cociente de dos historias, no una sola.',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s6-check-ensayo"
        question="En un ensayo de calentamiento de 45 minutos sobre una máquina de τ ≈ 90 min, la extrapolación de tres puntos da θ_ss con ±20 % de error entre repeticiones. ¿Cuál es la causa raíz?"
        options={[
          {
            label: 'El ensayo capturó media τ: la curva es casi una recta y el denominador 2θ₂−θ₁−θ₃ (la curvatura) queda del orden del ruido del termómetro — la extrapolación amplifica ese ruido. Alargar el ensayo (o usar el criterio de gradiente) es la corrección.',
            correct: true,
            feedback:
              'La fórmula es exacta para la exponencial perfecta; su fragilidad está en el denominador con datos reales. Regla de sala de pruebas: 1.5–2τ mínimo, muchas muestras y ajuste por regresión — el laboratorio te lo hace sentir.',
          },
          {
            label: 'El método de los tres puntos está mal deducido.',
            feedback:
              'La deducción es exacta (tres puntos determinan una exponencial): el problema es NUMÉRICO — sensibilidad al ruido cuando la curvatura capturada es pequeña.',
          },
          {
            label: 'La máquina no sigue un modelo exponencial.',
            feedback:
              'Con dos nodos hay dos exponenciales, cierto — pero a esa escala el error dominante es la curvatura no capturada: la misma máquina ensayada 3 h estima limpio.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s6-problema-ensayo"
        numero="64"
        title="Del ensayo a los parámetros del modelo"
        statement={
          <>
            Un ensayo de calentamiento (método de resistencia) arroja elevaciones de{' '}
            <strong>18.5 K</strong> a los 30 min, <strong>30.1 K</strong> a los 60 min y{' '}
            <strong>37.4 K</strong> a los 90 min, con pérdidas medidas de 3.0 kW. Halle θ_ss, τ, y
            los parámetros R_th y C_th del modelo RC.
          </>
        }
        steps={[
          {
            title: 'La asíntota por tres puntos',
            why: 'Tres muestras equidistantes de una exponencial determinan su valor final sin esperar a que llegue.',
            work: `\\theta_{ss} = \\frac{30.1^2 - 18.5(37.4)}{2(30.1) - 18.5 - 37.4} = \\frac{${fmt(30.1 ** 2 - 18.5 * 37.4, 1)}}{${fmt(2 * 30.1 - 18.5 - 37.4, 1)}} = ${fmt(e64.thetaSS, 1)}\\ \\text{K}`,
          },
          {
            title: 'La constante de tiempo',
            why: 'El cociente de las «distancias a la asíntota» decae exactamente e^(−Δt/τ).',
            work: `\\tau = \\frac{30}{\\ln\\left(\\frac{${fmt(e64.thetaSS, 1)} - 18.5}{${fmt(e64.thetaSS, 1)} - 30.1}\\right)} = ${fmt(e64.tau, 0)}\\ \\text{min}`,
          },
          {
            title: 'Poblar el modelo RC',
            why: 'Con P medida, la pareja (θ_ss, τ) se convierte en los parámetros físicos.',
            work: `R_{th} = \\frac{${fmt(e64.thetaSS, 1)}}{3000} = ${fmt(e64.thetaSS / 3000, 4)}\\ \\text{K/W} \\qquad C_{th} = \\frac{${fmt(e64.tau, 0)} \\times 60}{${fmt(e64.thetaSS / 3000, 4)}} = ${fmt((e64.tau * 60) / (e64.thetaSS / 3000) / 1e6, 2)}\\ \\text{MJ/K}`,
            note: 'Verificación de cordura: el ensayo duró 90 min ≈ 1.4τ — al borde de la regla. En sala real se seguiría hasta el criterio de gradiente (<2 K/h) y se ajustaría con TODAS las muestras, no solo tres.',
          },
        ]}
        answer={`\\theta_{ss} = ${fmt(e64.thetaSS, 1)}\\ \\text{K} \\quad \\tau = ${fmt(e64.tau, 0)}\\ \\text{min} \\quad R_{th} = ${fmt(e64.thetaSS / 3000, 4)}\\ \\text{K/W}`}
        takeaway="El modelo RC no se supone: se mide. Tres puntos extrapolan la asíntota, el logaritmo da τ, y P convierte todo en R_th y C_th — el puente entre la sala de pruebas y la sección 1."
      />

      <SolvedProblem
        id="c12s6-problema-vfd"
        numero="65"
        title="Par constante a baja velocidad: el caso crítico del variador"
        statement={
          <>
            Un motor autoventilado (reparto de pérdidas 50/25/15/10, modelo de dos nodos con
            R_wc = 0.35 y R_ca nominal = 0.65 en unidades normalizadas) opera con variador V/f a{' '}
            <strong>par 100 %</strong> y <strong>30 % de velocidad</strong>. Halle las pérdidas por
            componente, la elevación del devanado, y compare con la solución de ventilación
            forzada.
          </>
        }
        steps={[
          {
            title: 'Las pérdidas, componente a componente',
            why: 'Cobre y adicionales siguen al par (íntegros); hierro a la frecuencia; mecánicas a la velocidad.',
            work: `P_{cu} = 0.50 \\quad P_{fe} = 0.25(0.3)^{1.3} = ${fmt(p65.fe, 3)} \\quad P_{mec} = 0.15(0.3)^{2.5} = ${fmt(p65.mec, 3)} \\quad P_{add} = 0.10 \\;\\Rightarrow\\; P = ${fmt(p65.total, 2)}`,
          },
          {
            title: 'La evacuación degradada',
            why: 'El ventilador gira al 30 %: la resistencia térmica a ambiente crece.',
            work: `R_{ca}(0.3) = \\frac{0.65}{0.25 + 0.75(0.3)} = ${fmt(rcaAuto, 2)} \\;(${fmt(rcaAuto / 0.65, 1)}\\times\\ \\text{la nominal})`,
          },
          {
            title: 'El devanado en régimen',
            why: 'θ_w = P·(R_ca + R_wc): menos pérdidas × peor evacuación.',
            work: `\\theta_w = ${fmt(p65.total, 2)}(${fmt(rcaAuto, 2)} + 0.35) = ${fmt(ssAuto.w, 2)} \\;(${fmt(ssAuto.w * 100, 0)}\\%\\ \\text{del límite}) \\;⚠`,
            note: 'Con el 66 % de las pérdidas, el devanado supera el límite: la temperatura es P×R, y R creció más de lo que P bajó.',
          },
          {
            title: 'La solución: soplador independiente',
            why: 'Ventilación forzada: R_ca vuelve a su valor nominal, independiente de la velocidad.',
            work: `\\theta_w^{forz} = ${fmt(p65.total, 2)}(0.65 + 0.35) = ${fmt(ssForz.w, 2)} \\;(${fmt(ssForz.w * 100, 0)}\\%) \\;✓`,
            note: 'La alternativa sin soplador es derratear el par a baja velocidad según la curva del catálogo «inverter duty» — la misma física, resuelta con menos hierro activo.',
          },
        ]}
        answer={`P = ${fmt(p65.total, 2)}\\ \\text{pu} \\quad \\theta_w^{auto} = ${fmt(ssAuto.w * 100, 0)}\\%\\ ⚠ \\quad \\theta_w^{forzado} = ${fmt(ssForz.w * 100, 0)}\\%\\ ✓`}
        takeaway="El variador desacopla velocidad de red — pero no desacopla el ventilador del eje. Par constante a baja velocidad exige soplador, derrateo o TENV sobredimensionado: elegirlo es térmica, no electrónica."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 6
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Cada pérdida con su variable: cobre↔par², hierro↔frecuencia^1.3, mecánicas↔velocidad^2.5, adicionales↔carga². Y la evacuación con la suya: autoventilado ↓ con n, forzado constante, TENV mayor pero plano.</li>
          <li>Dos nodos, dos relojes: devanado en minutos, carcasa en la hora. La sobrecarga golpea al cobre antes de que la carcasa se entere — los relés 49 modernos usan dos constantes.</li>
          <li>Los parámetros se MIDEN: tres puntos equidistantes extrapolan θ_ss y τ (frágil si el ensayo &lt; 1.5–2τ), y R_th = θ_ss/P puebla el modelo con datos reales.</li>
        </ul>
      </div>
    </section>
  )
}
