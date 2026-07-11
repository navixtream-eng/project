import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DutyCycleLab from '../widgets/DutyCycleLab'
import { fmt } from '../lib/machine'
import { potenciaEquivalente } from '../lib/termica'

/** Capítulo 12, Sección 3 — Tipos de servicio y potencia equivalente. */
export default function C12Section3() {
  // Problema 61
  const segs = [
    { p: 1.2, t: 10 },
    { p: 0.5, t: 20 },
    { p: 0, t: 10, parada: true },
  ]
  const peq = potenciaEquivalente(segs, 0.4)

  return (
    <section id="c12-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Tipos de servicio: la placa promete un RÉGIMEN, no una potencia
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          «Motor de 30 kW» es una frase incompleta: ¿30 kW durante cuánto tiempo y con qué pausas?
          Los tipos de servicio IEC (S1–S10) completan la frase — y la potencia equivalente RMS te
          deja convertir un ciclo complicado en un solo número comparable con la placa.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · S1, S2, S3… y el método de la potencia equivalente"
        idea="S1 = servicio continuo (el escalón hasta el equilibrio). S2 = tiempo limitado (S2-30 min: puede dar la potencia 30 minutos partiendo de frío — y luego DEBE enfriar). S3 = intermitente periódico (ciclos de carga y pausa con un factor de marcha). Para cargas cíclicas, las pérdidas de cobre van con P²: el calentamiento medio lo produce la RAÍZ CUADRÁTICA MEDIA del perfil de potencia. Regla de validez doble: el ciclo debe ser CORTO frente a τ (si no, la temperatura sigue cada tramo y hay que verificar el pico), y las pausas ponderan menos si el motor se detiene (ventilación reducida: factor ~0.4 en el denominador)."
        analogy="Un corredor por intervalos: sprint, trote, pausa. Su desgaste diario no lo mide el sprint (pico) ni el promedio simple — lo mide el equivalente fisiológico del esfuerzo cuadrático. Y si los intervalos son MUY largos, ya no es «un régimen»: es una secuencia de esfuerzos que se evalúan uno a uno."
      >
        <Formula
          latex="P_{eq} = \sqrt{\frac{\sum P_i^2\, t_i}{\sum t_{marcha} + k\sum t_{parada}}} \qquad (k \approx 0.3\text{–}0.5\ \text{autoventilado})"
          symbols={[
            { sym: 'P_i^2 t_i', meaning: 'Las pérdidas dominantes son Joule (∝ P²): por eso el promedio correcto es cuadrático. Un pico corto pesa mucho más que su duración.' },
            { sym: 'k', meaning: 'La pausa enfría MENOS de lo que dura (sin ventilador): contarla completa sería optimista. El factor exacto viene del fabricante; 0.4 es el típico docente.' },
            { sym: 'P_{eq} \\le P_{placa}', meaning: 'El criterio de selección para ciclos… CONDICIONADO a que el pico térmico no cruce el límite (verificar con la simulación R-C si el ciclo no es corto frente a τ).' },
          ]}
        />
      </ConceptBlock>

      <DutyCycleLab />

      <FeynmanCheck
        id="c12s3-check-rms"
        question="Una prensa exige 150 % durante 2 min y 40 % durante 8 min, cíclicamente (τ del motor: 50 min). ¿Se necesita un motor del 150 %?"
        options={[
          {
            label: 'No: P_eq = √((1.5²·2 + 0.4²·8)/10) ≈ 76 % — el ciclo es corto frente a τ y la temperatura responde al promedio cuadrático, no al pico. Un motor estándar bien elegido lo lleva (verificando el par pico mecánico).',
            correct: true,
            feedback:
              'El RMS ahorra uno o dos tamaños de catálogo en cargas pulsantes. Ojo con la letra chica: el PAR pico debe estar disponible (límite de T_max del motor) aunque la térmica promedie.',
          },
          {
            label: 'Sí: el motor debe cubrir siempre su peor demanda.',
            feedback:
              'Mecánicamente sí (el par pico debe existir); térmicamente no — con τ = 50 min, 2 minutos al 150 % apenas mueven la temperatura. Dimensionar al pico regala hierro.',
          },
          {
            label: 'Se necesita la media aritmética: 62 %.',
            feedback:
              'La media simple subestima: las pérdidas van con P², y el tramo al 150 % pesa 1.5² = 2.25, no 1.5. El promedio correcto es el cuadrático (76 %).',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s3-check-s2"
        question="Un motor S2-30 min de 55 kW terminó su media hora a plena carga. El proceso pide «solo 15 minutos más». ¿Qué dice su placa?"
        options={[
          {
            label: 'Que NO: la promesa S2 es exactamente esa media hora partiendo de FRÍO — al terminarla, la temperatura está en el límite y el motor debe enfriar (horas, con τ de parada) antes de repetir.',
            correct: true,
            feedback:
              'S2 es la promesa más frágil del catálogo: potencia alta comprada con la inercia térmica, no con ventilación. El «poquito más» pedido en caliente es exactamente lo que el contrato excluye.',
          },
          {
            label: 'Que sí, porque 15 < 30.',
            feedback:
              'Los 30 min cuentan desde FRÍO. En caliente, el presupuesto térmico ya se gastó — los 15 extra cruzarían el límite de clase.',
          },
          {
            label: 'Que depende de la carga mecánica.',
            feedback:
              'La carga es la misma (plena): lo que cambió es el estado TÉRMICO inicial — y S2 lo fija en frío por definición.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s3-problema-ciclo"
        numero="61"
        title="Del ciclo real al tamaño del motor"
        statement={
          <>
            Una trituradora opera cíclicamente: 120 % durante 10 min, 50 % durante 20 min, y
            10 min detenida (autoventilada, k = 0.4). El motor candidato tiene τ = 45 min. Halle la
            potencia equivalente del ciclo y decida si un motor del 100 % es admisible.
          </>
        }
        steps={[
          {
            title: 'El numerador: pérdidas ponderadas en P²',
            why: 'Cada tramo aporta P²·t — el pico del 120 % pesa 1.44 por minuto, el 50 % apenas 0.25.',
            work: `\\sum P_i^2 t_i = 1.2^2(10) + 0.5^2(20) + 0 = ${fmt(1.44 * 10 + 0.25 * 20, 1)}`,
          },
          {
            title: 'El denominador: la pausa vale menos',
            why: 'Detenido no hay ventilador: los 10 min de pausa evacúan como ~4 (k = 0.4).',
            work: `\\sum t = 10 + 20 + 0.4(10) = 34\\ \\text{min efectivos}`,
          },
          {
            title: 'La potencia equivalente',
            why: 'La raíz del promedio cuadrático efectivo.',
            work: `P_{eq} = \\sqrt{\\frac{${fmt(1.44 * 10 + 0.25 * 20, 1)}}{34}} = ${fmt(peq, 3)} \\approx ${fmt(peq * 100, 0)}\\%`,
          },
          {
            title: 'La doble verificación',
            why: 'RMS ≤ 100 % ✓. Y como el ciclo (40 min) NO es corto frente a τ (45 min), el pico térmico se verifica con la simulación R-C: el laboratorio muestra que la sierra pica cerca del 105 % durante el tramo alto.',
            work: `P_{eq} = ${fmt(peq * 100, 0)}\\% < 100\\% \\;✓ \\qquad \\theta_{pico}: \\text{verificar en el laboratorio (ciclo} \\sim \\tau\\text{)}`,
            note: 'Veredicto honesto: admisible con reservas — el RMS aprueba, pero el ciclo largo exige mirar la sierra térmica. Si el pico cruza, la solución barata es reordenar el ciclo (pausa tras el tramo alto), no comprar un motor mayor.',
          },
        ]}
        answer={`P_{eq} = ${fmt(peq * 100, 0)}\\% \\;\\Rightarrow\\; \\text{motor del } 100\\%\\ \\text{admisible, verificando el pico térmico del ciclo largo}`}
        takeaway="El RMS convierte ciclos en un número; τ decide si ese número basta. Dimensiona por P_eq, verifica por θ_pico — y recuerda que el PAR pico es un requisito aparte (mecánico, no térmico)."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>S1 continuo, S2 tiempo limitado desde frío, S3 intermitente periódico: la placa promete un régimen. El mismo hierro da más potencia cuanto más corta la promesa.</li>
          <li>P_eq = RMS del perfil (pérdidas ∝ P²), con las pausas devaluadas (k ≈ 0.4 autoventilado). Válido si el ciclo es corto frente a τ; si no, verificar la sierra térmica.</li>
          <li>El par pico es un chequeo mecánico independiente: la térmica promedia, el par no.</li>
        </ul>
      </div>
    </section>
  )
}
