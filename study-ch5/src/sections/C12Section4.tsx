import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DeratingLab from '../widgets/DeratingLab'
import { fmt } from '../lib/machine'
import { derateAltitud, derateAmbiente, derateDesbalance } from '../lib/termica'

/** Capítulo 12, Sección 4 — Derrateo: de la placa a la instalación. */
export default function C12Section4() {
  // Problema 62
  const f1 = derateAltitud(2500)
  const f2 = derateAmbiente(50)
  const f3 = derateDesbalance(2)
  const fT = f1 * f2 * f3
  const pUtil = 45 * fT

  return (
    <section id="c12-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Derrateo: la placa se firmó en el laboratorio, no en tu planta
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Los kW de placa valen a 40 °C, bajo 1000 m, con red limpia y balanceada. Tu planta está
          a 2500 m, a 50 °C, con un variador vecino y una fase floja. Cada desviación multiplica
          un factor menor que uno — y el producto es la potencia que de verdad puedes usar.
        </p>
      </header>

      <ConceptBlock
        title="4.1 · Los cuatro ladrones de placa"
        idea="ALTITUD: aire menos denso enfría menos (típico −1 %/100 m sobre 1000). TEMPERATURA: cada °C de ambiente sobre 40 es un °C menos de elevación admisible (≈ −1 %/°C de potencia). DESBALANCE: la secuencia negativa (Cap. 11) inyecta corrientes de doble frecuencia en el rotor — la curva NEMA es CUADRÁTICA (≈ 1 − V₂²/100): 5 % de desbalance deja el 75 % de la placa. ARMÓNICOS: la tensión distorsionada (variadores vecinos) añade pérdidas de hierro y cobre sin producir par (derrateo por HVF). Los cuatro son mecanismos térmicos: todos terminan en el mismo lugar — el punto caliente de la Sección 2."
        analogy="Un atleta de nivel del mar compitiendo en altura, con calor, con fiebre y desvelado: cada condición le roba un porcentaje del rendimiento, y los porcentajes SE MULTIPLICAN. Nadie le pediría su marca de laboratorio — al motor tampoco."
      >
        <Formula
          latex="P_{util} = P_{placa} \times f_{alt} \times f_{amb} \times f_{desb} \times f_{arm}"
          symbols={[
            { sym: 'f_{alt}, f_{amb}', meaning: 'Los térmicos «de ambiente»: menos aire o aire más caliente = menos evacuación. Reglas típicas de catálogo; el fabricante puede publicar tablas mejores (p. ej. motores tropicalizados).' },
            { sym: 'f_{desb} \\approx 1 - V_2^2/100', meaning: 'Cuadrático (curva NEMA MG1 aprox.): el doble de desbalance cuesta el cuádruple. Es el puente directo con las componentes simétricas del Cap. 11.' },
            { sym: 'f_{arm}', meaning: 'Del HVF de NEMA (aquí aproximado con la THD): armónicos de tensión = pérdidas parásitas. Con variador propio (no red sucia) aplica otro régimen: el derrateo del fabricante para uso con VFD.' },
          ]}
        />
      </ConceptBlock>

      <DeratingLab />

      <FeynmanCheck
        id="c12s4-check-cuadratico"
        question="Tu red tiene 2 % de desbalance (factor ≈ 0.96) y alguien propone tolerar 4 % «porque solo es el doble». ¿Qué responde la curva NEMA?"
        options={[
          {
            label: 'Que el castigo es cuadrático: 4 % ⇒ factor ≈ 0.84 — el doble de desbalance cuesta CUATRO veces más potencia (del −4 % al −16 %). La física detrás: la corriente de secuencia negativa crece lineal, pero sus pérdidas van al cuadrado.',
            correct: true,
            feedback:
              'Y recuerda el amplificador del Cap. 11: Z₂ ≈ Z de arranque, así que cada punto de V₂ son ~5 puntos de I₂ — el cuadrado de ESO es lo que calienta. Los límites de desbalance de las normas no son manías.',
          },
          {
            label: 'Que es lineal: 4 % cuesta el doble que 2 %.',
            feedback:
              'Las PÉRDIDAS de la secuencia negativa van con I₂² — la curva de derrateo hereda el cuadrado. 0.96 → 0.84, no 0.92.',
          },
          {
            label: 'Que bajo el 5 % no hay efecto.',
            feedback:
              'El 5 % es donde NEMA ya exige −25 % de potencia — no donde el efecto empieza. Desde el 1 % la curva desciende.',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s4-check-mecanismo"
        question="Los cuatro derrateos (altitud, temperatura, desbalance, armónicos) parecen fenómenos distintos. ¿Qué los unifica y por qué se MULTIPLICAN?"
        options={[
          {
            label: 'Todos terminan en el mismo balance térmico: unos reducen la evacuación (altitud, ambiente), otros añaden pérdidas (desbalance, armónicos). Como cada uno consume una fracción del MARGEN térmico restante, sus factores se componen multiplicativamente.',
            correct: true,
            feedback:
              'El circuito R-C de la Sección 1 es el juez único: P·R_th debe caber bajo el límite de clase. Cada condición adversa mueve P o R_th — y el producto de factores es la contabilidad de ese único presupuesto.',
          },
          {
            label: 'Nada: son reglas independientes que se suman.',
            feedback:
              'Sumar sería asumir que cada uno muerde de una placa intacta — pero el segundo factor actúa sobre lo que dejó el primero: composición multiplicativa.',
          },
          {
            label: 'Todos son fenómenos eléctricos de la red.',
            feedback:
              'Altitud y temperatura no tocan la red: degradan el ENFRIAMIENTO. La unificación es térmica, no eléctrica.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s4-problema-derrateo"
        numero="62"
        title="La placa en la sierra: derrateo combinado"
        statement={
          <>
            Un motor de 45 kW se instala a 2500 m de altitud, con ambiente de 50 °C y una red con
            2 % de desbalance (sin armónicos apreciables). La carga real es de 30 kW.{' '}
            <strong>(a)</strong> Halle los tres factores y la potencia utilizable;{' '}
            <strong>(b)</strong> decida si el motor sirve; <strong>(c)</strong> calcule qué placa
            se necesitaría si la carga fuera de 38 kW.
          </>
        }
        steps={[
          {
            title: '(a) Los factores, uno a uno',
            why: 'Altitud: −1 %/100 m sobre 1000 → 15 % menos. Ambiente: −1 %/°C sobre 40 → 10 % menos. Desbalance: cuadrático.',
            work: `f_{alt} = ${fmt(f1, 2)} \\quad f_{amb} = ${fmt(f2, 2)} \\quad f_{desb} = 1 - \\frac{2^2}{100} = ${fmt(f3, 2)}`,
          },
          {
            title: '(a) La potencia utilizable',
            why: 'El producto de los tres sobre la placa.',
            work: `P_{util} = 45 \\times ${fmt(f1, 2)} \\times ${fmt(f2, 2)} \\times ${fmt(f3, 2)} = 45 \\times ${fmt(fT, 3)} = ${fmt(pUtil, 1)}\\ \\text{kW}`,
          },
          {
            title: '(b) El veredicto para 30 kW',
            why: 'Comparar la carga contra lo utilizable, no contra la placa.',
            work: `${fmt(pUtil, 1)} \\ge 30 \\;✓\\; (\\text{margen } ${fmt((pUtil / 30 - 1) * 100, 0)}\\%)`,
          },
          {
            title: '(c) Si la carga fuera 38 kW',
            why: 'Invertir la cascada: la placa necesaria es la carga dividida por el factor total.',
            work: `P_{placa} \\ge \\frac{38}{${fmt(fT, 3)}} = ${fmt(38 / fT, 1)}\\ \\text{kW} \\Rightarrow \\text{siguiente catálogo: } 55\\ \\text{kW}`,
            note: 'El «45 kW» habría parecido suficiente mirando solo la placa (45 > 38): el derrateo es la diferencia entre un motor que dura y uno que se rebobina cada dos veranos.',
          },
        ]}
        answer={`P_{util} = ${fmt(pUtil, 1)}\\ \\text{kW} \\quad \\text{(b) sirve para 30 kW} \\quad \\text{(c) para 38 kW: } ${fmt(38 / fT, 1)} \\Rightarrow 55\\ \\text{kW}`}
        takeaway="Compara cargas contra la potencia UTILIZABLE (placa × factores) y elige placa dividiendo por el factor total. Las reglas exactas las publica el fabricante — la estructura multiplicativa es siempre la misma."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>La placa vale en condiciones de referencia (40 °C, ≤1000 m, red limpia y balanceada). Cada desviación multiplica un factor &lt; 1 — y el juez de todos es el mismo balance térmico R-C.</li>
          <li>El desbalance castiga al CUADRADO (NEMA): 2 % ⇒ −4 %, 5 % ⇒ −25 %. Conexión directa con la secuencia negativa del Cap. 11.</li>
          <li>Selección honesta: carga ≤ placa × f_total, o placa ≥ carga ÷ f_total. Los números finos son del fabricante; la estructura, universal.</li>
        </ul>
      </div>
    </section>
  )
}
