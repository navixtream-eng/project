import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ThermalRCLab from '../widgets/ThermalRCLab'
import { fmt } from '../lib/machine'

/** Capítulo 12, Sección 1 — El circuito térmico R-C. */
export default function C12Section1() {
  // Problema 59
  const P = 4200 // W de pérdidas
  const Rth = 0.012 // K/W
  const tau = 45 // min
  const thetaSS = P * Rth
  const t30 = thetaSS * (1 - Math.exp(-30 / tau))

  return (
    <section id="c12-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          La máquina como condensador térmico
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Once capítulos de electromagnetismo y la vida de la máquina la decide… el calor. La
          buena noticia: la térmica se modela con el circuito más simple que conoces — una
          resistencia y un condensador. Las pérdidas «inyectan corriente», la temperatura «es la
          tensión», y τ = R·C dicta todos los tiempos.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · La analogía R-C (y por qué funciona)"
        idea="Las pérdidas P (cobre + hierro + mecánicas, Cap. 5.6) generan calor; la máquina lo almacena en su masa (capacitancia térmica C_th, J/K) y lo evacúa al ambiente a través de una resistencia térmica R_th (K/W) — carcasa, aletas, ventilador. El balance da EXACTAMENTE la ecuación del RC: la elevación θ sube exponencialmente hacia θ_ss = P·R_th con constante τ = R_th·C_th. Dos consecuencias de oro: (1) la temperatura FINAL solo depende de P·R_th — el tamaño no salva del equilibrio, solo lo retrasa; (2) la sobrecarga corta es legal: mientras θ no cruce el límite de clase, el cobre no sabe cuánto marcaba el amperímetro."
        analogy="Una tina con el desagüe medio abierto: el grifo son las pérdidas, el nivel es la temperatura, el desagüe es R_th. Abre más el grifo (sobrecarga) y el nivel sube hacia un equilibrio más alto — pero TARDA en llegar. Si cierras a tiempo, nunca se desborda: eso es una sobrecarga admisible."
      >
        <Formula
          latex="C_{th}\frac{d\theta}{dt} = P - \frac{\theta}{R_{th}} \;\Rightarrow\; \theta(t) = P R_{th}\left(1 - e^{-t/\tau}\right), \quad \tau = R_{th} C_{th}"
          symbols={[
            { sym: '\\theta_{ss} = P R_{th}', meaning: 'La elevación de equilibrio. Con pérdidas ∝ carga², una sobrecarga del 20 % sube θ_ss un 44 % — la relación cuadrática es la que muerde.' },
            { sym: '\\tau = R_{th} C_{th}', meaning: 'De 15 min (motores chicos) a horas (grandes). Es el «perdón» de la máquina: cuánto tiempo tolera lo que en régimen la mataría — y la base de las curvas de los relés térmicos (49).' },
            { sym: 'R_{th}', meaning: 'Cae con la ventilación: parado y autoventilado, R_th sube (τ de enfriamiento 2–3× mayor). Ventilación forzada independiente = R_th constante a toda velocidad (clave con variadores a baja velocidad).' },
          ]}
        />
      </ConceptBlock>

      <ThermalRCLab />

      <FeynmanCheck
        id="c12s1-check-equilibrio"
        question="Dos motores idénticos salvo el tamaño del ventilador trabajan con las MISMAS pérdidas. El grande térmicamente (más masa) ¿termina más frío?"
        options={[
          {
            label: 'No necesariamente: la temperatura FINAL es P·R_th — la masa (C_th) solo cambia τ, o sea CUÁNTO TARDA. Termina más frío el de mejor ventilación (menor R_th), tenga la masa que tenga.',
            correct: true,
            feedback:
              'Separar R de C es la clave del capítulo: la masa compra TIEMPO (tolerancia a picos), la ventilación compra TEMPERATURA (régimen). Un relé térmico bien ajustado imita τ; un derrateo corrige R_th.',
          },
          {
            label: 'Sí: más masa siempre es más frío.',
            feedback:
              'La masa retrasa el calentamiento pero no cambia el equilibrio: en régimen S1, θ_ss = P·R_th no contiene a C_th.',
          },
          {
            label: 'Terminan igual porque las pérdidas son iguales.',
            feedback:
              'Con R_th distinta (ventilador distinto), mismo P da distinta θ_ss = P·R_th — las pérdidas son la mitad de la historia.',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s1-check-sobrecarga"
        question="Un motor con τ = 40 min lleva 5 minutos al 130 % de carga. El operador quiere apagarlo «antes de que se queme». ¿Qué dice el modelo R-C?"
        options={[
          {
            label: 'Que hay tiempo de sobra: en 5 min (τ/8) la temperatura apenas recorrió ~12 % del camino a su nuevo equilibrio — la sobrecarga corta frente a τ es térmicamente barata. El peligro es SOSTENERLA.',
            correct: true,
            feedback:
              'Exacto — y es el fundamento del factor de servicio, de las curvas de sobrecarga admisible y del relé 49: no protegen contra la corriente, protegen contra la INTEGRAL térmica de la corriente.',
          },
          {
            label: 'Que ya se dañó: cualquier operación sobre el 100 % degrada el aislamiento.',
            feedback:
              'El aislamiento se degrada con la TEMPERATURA, no con el porcentaje de carga — y la temperatura tarda τ en moverse. Sin cruce del límite de clase, no hay daño.',
          },
          {
            label: 'El modelo no aplica a sobrecargas.',
            feedback:
              'Aplica perfectamente mientras las pérdidas sean calculables (∝ I²): es su uso principal en protecciones.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s1-problema-rc"
        numero="59"
        title="El calentamiento de un motor, con números"
        statement={
          <>
            Un motor disipa P = {fmt(P / 1000, 1)} kW de pérdidas a plena carga, con R_th ={' '}
            {fmt(Rth, 3)} K/W y τ = {tau} min. Ambiente a 40 °C, clase F (punto caliente admisible
            155 °C, gradiente interno ≈ 10 K). Halle <strong>(a)</strong> la elevación de
            equilibrio y la temperatura del punto caliente en régimen, <strong>(b)</strong> la
            elevación a los 30 minutos de arrancar frío, y <strong>(c)</strong> si el diseño tiene
            margen de clase.
          </>
        }
        steps={[
          {
            title: '(a) El equilibrio: θ_ss = P·R_th',
            why: 'El régimen no depende de la masa: solo de cuánta pérdida hay y qué tan bien se evacúa.',
            work: `\\theta_{ss} = ${fmt(P, 0)} \\times ${fmt(Rth, 3)} = ${fmt(thetaSS, 1)}\\ \\text{K} \\Rightarrow T_{hot} = 40 + ${fmt(thetaSS, 1)} + 10 = ${fmt(50 + thetaSS, 1)}\\ °C`,
          },
          {
            title: '(b) La exponencial a los 30 min',
            why: 'Arranque frío: θ(t) = θ_ss(1 − e^(−t/τ)) — a t = 30 min = 0.67τ ha recorrido el 49 %.',
            work: `\\theta(30) = ${fmt(thetaSS, 1)}\\left(1 - e^{-30/${tau}}\\right) = ${fmt(t30, 1)}\\ \\text{K}`,
            note: 'A la media hora el motor va por la mitad del calentamiento: medir temperaturas «en frío» engaña — el régimen térmico tarda 3–5τ (aquí 2–4 horas).',
          },
          {
            title: '(c) El margen de clase',
            why: 'Clase F admite 155 °C en el punto caliente; comparar contra el régimen calculado.',
            work: `155 - ${fmt(50 + thetaSS, 1)} = ${fmt(155 - 50 - thetaSS, 1)}\\ °C\\ \\text{de margen}`,
            note: 'Ese margen ES la vida (Sección 2): cada 10 °C de holgura duplica las horas del aislamiento. Un diseño F operando con 25 K de margen es la práctica «F/B» estándar.',
          },
        ]}
        answer={`\\theta_{ss} = ${fmt(thetaSS, 1)}\\ \\text{K} \\quad T_{hot} = ${fmt(50 + thetaSS, 1)}\\ °C \\quad \\theta(30') = ${fmt(t30, 1)}\\ \\text{K} \\quad \\text{margen} = ${fmt(155 - 50 - thetaSS, 1)}\\ °C`}
        takeaway="Tres números gobiernan la térmica: P·R_th (a dónde va), τ (cuánto tarda) y el límite de clase (dónde está el techo). Todo el dimensionamiento es administrarlos."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Máquina = RC térmico: θ_ss = P·R_th (la ventilación fija el régimen), τ = R_th·C_th (la masa fija los tiempos). Pérdidas ∝ carga²: el 120 % de carga es el 144 % de calor.</li>
          <li>La sobrecarga corta frente a τ es legal; la sostenida cruza el límite de clase. El relé térmico 49 y el factor de servicio viven de esta distinción.</li>
          <li>Parado y autoventilado se enfría 2–3× más lento — los arranques frecuentes y los variadores a baja velocidad castigan por ahí.</li>
        </ul>
      </div>
    </section>
  )
}
