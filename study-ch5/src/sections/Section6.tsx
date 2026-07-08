import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import EfficiencyLab from '../widgets/EfficiencyLab'
import { computeLosses, findMaxEfficiency, fmt, type LossParams } from '../lib/machine'

/**
 * Sección 6 — Pérdidas y rendimiento (FKU §5.9 y Apéndice D): a dónde se va
 * la energía que no llega, y por qué la curva η(P) tiene la forma que tiene.
 */
export default function Section6() {
  // Problemas 10 y 11: misma máquina del laboratorio (sus valores por defecto)
  const VT = 1.0
  const XS = 0.9 // Xs saturada de la Sección 5
  const PARAMS: LossParams = { Ra: 0.025, Pfw: 0.02 * 0.45, Pcore: 0.02 * 0.55, kField: 0.002 }
  const SBASE_MVA = 50

  const p10 = computeLosses(1.0, 0.9, true, VT, XS, PARAMS)
  const best = findMaxEfficiency(0.9, true, VT, XS, PARAMS)
  const atBest = computeLosses(best.P, 0.9, true, VT, XS, PARAMS)

  return (
    <section id="seccion-6" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 6</p>
        <h2 className="text-2xl font-black text-zinc-50">Pérdidas y rendimiento</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Entre el eje de la turbina y los bornes hay peajes. Son pocos, tienen nombre y apellido, y
          cada uno escala distinto con la carga — de esa diferencia nace toda la forma de la curva de
          rendimiento.
        </p>
      </header>

      <ConceptBlock
        title="6.1 · El inventario de pérdidas: costos fijos y variables"
        idea="Cuatro peajes se cobran entre el eje y los bornes: fricción y ventilación (girar cuesta, gire o no cargada), hierro (magnetizar y desmagnetizar el núcleo 60 veces por segundo), campo (la If que fabrica Eaf calienta el rotor) y cobre de armadura (Ia²·Ra). Los dos primeros son FIJOS a velocidad y tensión nominales; los otros dos crecen con el punto de operación — el cobre, con el CUADRADO de la corriente."
        analogy="Una empresa: el alquiler y la luz se pagan aunque no vendas nada (fricción + hierro); la materia prima crece con lo que produces, y las horas extra crecen aún más rápido (cobre ∝ Ia²). El rendimiento de la empresa — y de la máquina — depende de cuánto diluyes los costos fijos."
      >
        <p className="mb-2">
          El rendimiento es la fracción de la potencia mecánica de entrada que sobrevive todos los
          peajes:
        </p>
        <Formula
          latex="\eta = \frac{P_{salida}}{P_{salida} + \underbrace{P_{fv} + P_{nucleo}}_{fijas} + \underbrace{k_f E_{af}^2 + I_a^2 R_a}_{variables}}"
          symbols={[
            { sym: 'P_{fv}', meaning: 'Fricción de cojinetes y ventilación. A velocidad síncrona constante, es un número fijo: se paga completo aunque la máquina esté en vacío.' },
            { sym: 'P_{nucleo}', meaning: 'Histéresis y corrientes de Foucault en el hierro del estator. Depende del flujo (≈ de Vt), no de la carga: a tensión nominal, también fija.' },
            { sym: 'k_f E_{af}^2', meaning: 'Pérdida del devanado de campo: If²·Rf. Como If ∝ Eaf en la zona lineal, crece con el cuadrado de la excitación — más cara cuanto más sobreexcitado operes.' },
            { sym: 'I_a^2 R_a', meaning: 'El cobre de armadura: la pérdida DOMINANTE a plena carga. Nota que depende de |Ia|, no de P: la corriente reactiva también la paga.' },
          ]}
        />
        <p>
          La estructura fija-vs-variable es la clave de lectura de todo lo que sigue: a carga baja
          pagas el alquiler completo para producir poco; a carga alta, las horas extra del cobre se
          comen el margen. En medio hay un punto dulce.
        </p>
      </ConceptBlock>

      <EfficiencyLab />

      <FeynmanCheck
        id="s6-check-fijas"
        question="Predice antes de mover el slider: ¿por qué el rendimiento se DESPLOMA a cargas muy bajas, si ahí la corriente (y el cobre) son mínimos?"
        options={[
          {
            label: 'Porque a baja carga el generador gira más lento y pierde eficiencia aerodinámica.',
            feedback:
              'La velocidad es SIEMPRE nₛ — sincrónica hasta el final. Precisamente por eso la fricción y ventilación son fijas: se pagan íntegras a cualquier carga. La razón del desplome está en el denominador de η, no en la velocidad.',
          },
          {
            label: 'Porque las pérdidas fijas (fricción + hierro) se pagan completas produzcas lo que produzcas: con P pequeña, el alquiler se come casi toda la producción.',
            correct: true,
            feedback:
              'η = P/(P + pérdidas). Cuando P → 0, las fijas no la acompañan: quedan como un costo de piso y el cociente se hunde (η → 0 en vacío). Es la razón por la que operar generadores a fracciones pequeñas de su capacidad es un mal negocio energético — y por la que el despacho intenta cargar las máquinas cerca de su zona dulce.',
          },
          {
            label: 'Porque a baja carga la excitación requerida se dispara.',
            feedback:
              'Al revés: con poca carga la Eaf requerida es MENOR (menos caída jXs·Ia que compensar), así que la pérdida de campo baja. El culpable del desplome es el costo fijo, no el campo.',
          },
        ]}
      />

      <ConceptBlock
        title="6.2 · El punto dulce: donde las cuadráticas igualan al resto"
        idea="La curva η(P) sube mientras diluyes los costos fijos y baja cuando el cobre (∝ Ia²) acelera más de lo que la producción crece. El máximo está exactamente donde las pérdidas CUADRÁTICAS (el cobre) igualan a todas las demás (fijas + campo, este último casi constante) — el mismo teorema del transformador, y de cualquier «negocio» con esa estructura de costos."
        analogy="El precio por kilómetro de un auto: con poco uso, el seguro y la depreciación (fijos) dominan y cada km sale carísimo; con muchísimo uso, el desgaste acelerado domina. El costo mínimo por km está donde ambas facturas se emparejan."
      >
        <Formula
          latex="\left.\frac{d\eta}{dP}\right|_{max} = 0 \;\Longleftrightarrow\; \underbrace{I_a^2 R_a}_{cuadráticas} \;=\; \underbrace{P_{fv} + P_{nucleo} + k_f E_{af}^2}_{resto\ (\approx cte.)}"
          symbols={[
            { sym: '\\eta_{max}', meaning: 'El máximo NO está en plena carga: los fabricantes suelen ubicarlo entre 60% y 90% de la nominal, donde la máquina pasará su vida.' },
            { sym: 'I_a^2 R_a', meaning: 'La única pérdida estrictamente cuadrática con la carga. La condición del máximo es estructural: cuadráticas contra casi-constantes, sin importar los valores.' },
            { sym: 'k_f E_{af}^2 \\approx cte.', meaning: 'La pérdida de campo crece con la carga, pero débilmente (Eaf pasa de ~1.0 a ~1.7 pu entre vacío y plena carga): para el teorema cuenta del lado «casi fijo».' },
          ]}
        />
        <p>
          Verifícalo en el laboratorio: coloca el cursor sobre la línea punteada de η máx y mira los
          dos readouts de la derecha («cuadráticas» y «resto») emparejarse en verde. Luego rompe el
          equilibrio subiendo Ra o las fijas y observa hacia dónde se muda el máximo.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="s6-check-etamax"
        question="Subes las pérdidas FIJAS (una máquina con peor ventilación). ¿Hacia dónde se desplaza el punto de rendimiento máximo?"
        options={[
          {
            label: 'Hacia cargas MENORES: con más costo fijo conviene producir menos.',
            feedback:
              'La intuición económica va al revés: un alquiler más caro no se diluye produciendo menos, sino MÁS. La condición ηmax es variables = fijas: si las fijas suben, necesitas más Ia² (más carga) para alcanzarlas.',
          },
          {
            label: 'Hacia cargas MAYORES: hace falta más corriente para que el cobre (cuadrático) alcance al «resto» más alto.',
            correct: true,
            feedback:
              'Exacto — de la condición Ia²Ra ≈ resto sale Ia,ηmax = √(resto/Ra): un resto más alto empuja el máximo a la derecha; Ra más alta (¡cobre más caro!) lo trae a la izquierda. Compruébalo con los dos sliders del laboratorio.',
          },
          {
            label: 'No se mueve: el máximo depende solo de Ra.',
            feedback:
              'Depende del COCIENTE entre el resto (fijas + campo) y Ra. Mueve el slider de fijas en el laboratorio y mira la línea punteada de η máx desplazarse en vivo.',
          },
        ]}
      />

      <FeynmanCheck
        id="s6-check-fp"
        question="Dos generadores entregan la MISMA P = 0.8 pu, uno con fp = 1.0 y otro con fp = 0.7 en atraso. ¿Cuál tiene mejor rendimiento y por qué?"
        options={[
          {
            label: 'El de fp = 0.7: la corriente en atraso es «más suave» con el cobre.',
            feedback:
              'Al cobre no le importa el ángulo de la corriente, solo su magnitud — y con fp = 0.7 la magnitud es un 43% mayor (Ia = P/(Vt·fp)). Más amperios para los mismos watts = más Ia²Ra.',
          },
          {
            label: 'El de fp = 1.0: con la misma P, menor fp exige MÁS corriente (Ia = P/Vt·fp), y el cobre cobra por Ia² — la corriente reactiva calienta sin producir.',
            correct: true,
            feedback:
              'Ia²Ra crece un factor (1/0.7)² ≈ 2 al pasar de fp 1.0 a 0.7. Además el fp bajo en atraso exige más Eaf (más pérdida de campo). Es la misma moraleja de la curva V y de la carta de operación: los reactivos no son gratis — alguien paga su calentamiento. Pruébalo con el selector de fp del laboratorio.',
          },
          {
            label: 'Igual: la potencia reactiva no consume energía por definición.',
            feedback:
              'La Q neta no consume energía ACTIVA, cierto — pero la corriente que la transporta es tan real como cualquiera y disipa Ia²Ra en el cobre. Q no cuesta watts en la carga, pero sí en el camino.',
          },
        ]}
      />

      <SolvedProblem
        id="s6-problema-rendimiento"
        numero="10"
        title="Rendimiento a plena carga"
        statement={
          <>
            El generador de {SBASE_MVA} MVA de las secciones anteriores (Xs = {fmt(XS, 1)} pu saturada)
            entrega <strong>P = 1.0 pu con fp = 0.9 en atraso</strong> y Vt = 1.0 pu. Sus pérdidas:
            Ra = {fmt(PARAMS.Ra, 3)} pu, fricción+ventilación {fmt(PARAMS.Pfw, 4)} pu, núcleo{' '}
            {fmt(PARAMS.Pcore, 4)} pu, campo kf·Eaf² con kf = {fmt(PARAMS.kField, 3)}. Halle el
            desglose de pérdidas y el rendimiento.
          </>
        }
        steps={[
          {
            title: 'La corriente del punto — y su castigo cuadrático',
            why: 'Todo empieza por |Ia|: el fp menor que 1 obliga a más corriente que P/Vt, y el cobre cobra por el cuadrado.',
            work: `I_a = \\frac{P}{V_t\\,fp} = \\frac{1.0}{0.9} = ${fmt(p10.IaMag)}\\ \\text{pu} \\qquad P_{cu} = I_a^2 R_a = ${fmt(p10.IaMag)}^2 \\times ${fmt(PARAMS.Ra, 3)} = ${fmt(p10.copper, 4)}\\ \\text{pu}`,
          },
          {
            title: 'La pérdida de campo del punto de operación',
            why: 'La excitación no es un número libre: la fija el punto (P, Q) vía el diagrama fasorial de la Sección 2. Con Eaf calculada, la pérdida del rotor es kf·Eaf².',
            work: `|E_{af}| = ${fmt(p10.EafMag)}\\ \\text{pu} \\quad\\Rightarrow\\quad P_{campo} = ${fmt(PARAMS.kField, 3)} \\times ${fmt(p10.EafMag)}^2 = ${fmt(p10.field, 4)}\\ \\text{pu}`,
          },
          {
            title: 'Sumar peajes y calcular η',
            why: 'Las fijas entran tal cual (velocidad y tensión nominales). El rendimiento compara lo entregado contra lo entregado más TODOS los peajes.',
            work: `\\Sigma p = ${fmt(PARAMS.Pfw, 4)} + ${fmt(PARAMS.Pcore, 4)} + ${fmt(p10.field, 4)} + ${fmt(p10.copper, 4)} = ${fmt(p10.total, 4)}\\ \\text{pu} \\qquad \\eta = \\frac{1.0}{1 + ${fmt(p10.total, 4)}} = ${fmt(p10.eta * 100, 2)}\\%`,
            note: `En unidades reales: ${fmt(p10.total * SBASE_MVA, 2)} MW de pérdidas en una máquina de ${SBASE_MVA} MVA — calor que el sistema de refrigeración debe evacuar continuamente.`,
          },
        ]}
        answer={`P_{cu} = ${fmt(p10.copper, 4)},\\ P_{campo} = ${fmt(p10.field, 4)},\\ P_{fijas} = ${fmt(PARAMS.Pfw + PARAMS.Pcore, 3)}\\ \\text{pu} \\qquad \\eta = ${fmt(p10.eta * 100, 2)}\\%`}
        takeaway="El desglose importa tanto como el total: el cobre domina a plena carga, y es el único peaje que castiga el fp. Reproduce el punto en el laboratorio (P = 1.0, fp = 0.90): son sus valores por defecto."
      />

      <SolvedProblem
        id="s6-problema-etamax"
        numero="11"
        title="¿Dónde rinde más esta máquina?"
        statement={
          <>
            Para el mismo generador del Problema 10 (fp = 0.9 en atraso constante), halle la carga de
            rendimiento máximo y verifique la condición «variables = fijas» en ese punto.
          </>
        }
        steps={[
          {
            title: 'Plantear la condición del máximo',
            why: 'η(P) = P/(P + pérdidas(P)). Derivando e igualando a cero, el máximo cae donde la pérdida CUADRÁTICA (el cobre) iguala a todas las demás (fijas + campo cuasi-constante). Es un resultado de estructura, no de valores.',
            work: `\\frac{d\\eta}{dP} = 0 \\;\\Longleftrightarrow\\; I_a^2 R_a \\;=\\; P_{fv} + P_{nucleo} + k_f E_{af}^2`,
          },
          {
            title: 'Resolver numéricamente (el campo varía débilmente con la carga)',
            why: 'Como Eaf crece suavemente con P, la ecuación no es un despeje limpio: se barre η(P) y se localiza la cresta — exactamente lo que hace la línea punteada del laboratorio.',
            work: `P_{\\eta max} = ${fmt(best.P, 2)}\\ \\text{pu} \\qquad \\eta_{max} = ${fmt(best.eta * 100, 2)}\\%`,
          },
          {
            title: 'Verificar la condición en la cresta',
            why: 'La mejor comprobación de un óptimo es evaluar su condición de primer orden en el punto hallado: el cobre y el resto deben quedar (casi) empatados.',
            work: `I_a^2R_a = ${fmt(atBest.copper, 4)}\\ \\text{pu} \\;\\approx\\; \\text{resto} = ${fmt(atBest.mech + atBest.core + atBest.field, 4)}\\ \\text{pu}\\ \\checkmark`,
            note: `El empate no es exacto: la brecha es justamente el término P·(dP_campo/dP) que el teorema simplificado desprecia al tratar el campo como constante. Lo importante: el máximo (${fmt(best.P, 2)} pu) está por DEBAJO de plena carga — la máquina rinde más donde va a pasar la mayor parte de su vida.`,
          },
        ]}
        answer={`P_{\\eta max} = ${fmt(best.P, 2)}\\ \\text{pu} \\qquad \\eta_{max} = ${fmt(best.eta * 100, 2)}\\% \\quad (I_a^2R_a \\approx \\text{resto}\\ \\checkmark)`}
        takeaway="El máximo de rendimiento es un teorema de estructura de costos: cuadráticas contra casi-constantes. Aparece igual en el transformador, en la máquina de inducción y aquí — apréndelo una vez, úsalo en todas."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 6
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Cuatro peajes: fricción+ventilación y hierro (fijos a nₛ y Vt nominales); campo (∝ Eaf²) y
            cobre (∝ Ia²) variables. El cobre cobra por |Ia|, no por P: los reactivos calientan sin
            producir.
          </li>
          <li>
            η se desploma a baja carga (el alquiler se paga completo) y decae a sobrecarga (las horas
            extra cuadráticas). El máximo:{' '}
            <InlineMath latex="I_a^2R_a = \text{resto}" /> (cuadráticas = casi-constantes) — mismo
            teorema que el transformador.
          </li>
          <li>
            Palancas del diseñador: Ra ↓ o fijas ↓ suben toda la curva; el COCIENTE resto/Ra decide
            dónde cae el punto dulce. Palanca del operador: fp alto y carga cerca de la zona dulce.
          </li>
        </ul>
      </div>
    </section>
  )
}
