import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DistributedMmfLab from '../widgets/DistributedMmfLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 4, Sección 2 — FMM de devanados distribuidos y las ondas
 * rotatorias: cómo se fabrica una sinusoide espacial con cobre y ranuras.
 */
export default function C4Section2() {
  // Problema 17: factor de distribución con q = 3, γ = 20°
  const Q = 3
  const GAMMA = 20
  const gRad = (GAMMA * Math.PI) / 180
  const kdVal = Math.sin((Q * gRad) / 2) / (Q * Math.sin(gRad / 2))

  return (
    <section id="c4-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
          Capítulo 4 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          FMM de devanados distribuidos: fabricar una sinusoide con ranuras
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El libro entero da por hecho que los campos en el entrehierro son sinusoidales en el
          espacio. Esta sección muestra el truco de manufactura que lo hace (casi) verdad.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · La escalera que quiere ser seno"
        idea="Una bobina concentrada en dos ranuras produce una FMM CUADRADA en el entrehierro — llena de armónicos que solo fabrican pérdidas, ruido y pares parásitos. La cura: repartir las vueltas en varias ranuras vecinas. Cada bobina aporta un escalón desplazado, la suma es una escalera, y la escalera abraza a la sinusoide. Fourier hace el resto: nos quedamos con la componente fundamental y tratamos el residuo como imperfección."
        analogy="Pixelar una curva: con un solo píxel gordo (bobina concentrada) el dibujo es un bloque; con varios píxeles escalonados, la curva aparece. Las ranuras son los píxeles del campo magnético — y como toda pantalla, más resolución cuesta más ranuras."
      >
        <p className="mb-2">
          El precio de distribuir es un pequeño descuento en la fundamental: los aportes de bobinas
          desplazadas ya no suman en fase perfecta. Ese descuento es el{' '}
          <strong>factor de distribución</strong>:
        </p>
        <Formula
          latex="k_d = \frac{\text{sen}(q\,\gamma/2)}{q\,\text{sen}(\gamma/2)} \qquad\qquad F_{a1} = \frac{4}{\pi}\,\frac{k_w N_{ph}}{P}\,i_a \;\cos\theta_{ae}"
          symbols={[
            { sym: 'q', meaning: 'Bobinas (ranuras) por polo y por fase. q = 1 es la bobina concentrada (onda cuadrada); q típico: 2–6.' },
            { sym: '\\gamma', meaning: 'Ángulo eléctrico entre ranuras adyacentes. Los aportes de las q bobinas se suman como fasores espaciales abiertos en abanico de γ.' },
            { sym: 'k_d', meaning: 'El «descuento del abanico»: cociente entre la suma fasorial real y la suma aritmética ideal. Vale 1 con q = 1 y baja suavemente (0.966 con q = 2, 0.958 en el límite).' },
            { sym: 'k_w', meaning: 'Factor de devanado total ≈ kd × kp (kp = factor de paso, si la bobina se acorta a propósito para matar un armónico específico). Reaparecerá multiplicando el voltaje generado.' },
            { sym: '\\tfrac{4}{\\pi}', meaning: 'La fundamental de una onda cuadrada es 4/π veces su altura — el clásico de Fourier.' },
          ]}
        />
      </ConceptBlock>

      <DistributedMmfLab />

      <FeynmanCheck
        id="c4s2-check-distribuido"
        question="Distribuir el devanado REDUCE la fundamental (kd < 1). ¿Por qué los diseñadores lo hacen de todos modos?"
        options={[
          {
            label: 'Porque no caben todas las vueltas en una sola ranura.',
            feedback:
              'Es una razón práctica real (ranuras enormes debilitan los dientes del hierro), pero no la principal. Aunque cupieran, se distribuiría igual — por lo que le pasa a la FORMA de la onda.',
          },
          {
            label: 'Porque el descuento en la fundamental es pequeño (~4%) y a cambio los ARMÓNICOS espaciales se desploman: menos pérdidas, menos ruido, menos pares parásitos y un voltaje generado casi perfecto.',
            correct: true,
            feedback:
              'El trato del siglo: pagas kd ≈ 0.96 y la distorsión de la fase cae de ~48% (onda cuadrada) a la mitad — míralo en el readout del laboratorio — y las tres fases juntas cancelan además los armónicos triples en el campo giratorio. Los armónicos espaciales no producen par útil a velocidad síncrona: solo calientan, vibran y ensucian la onda de voltaje. Por eso toda máquina seria distribuye (y a menudo también acorta paso, kp, para asesinar al 5° y 7° selectivamente).',
          },
          {
            label: 'Para que la máquina se refrigere mejor.',
            feedback:
              'Repartir cobre ayuda algo a la térmica, pero el motivo dominante es de FORMA DE ONDA: la escalera se parece al seno y la cuadrada no. Compara la distorsión con q = 1 y q = 6 en el laboratorio.',
          },
        ]}
      />

      <ConceptBlock
        title="2.2 · Y la escalera se pone a girar"
        idea="Con la sinusoide espacial fabricada, el paso final ya lo conoces: tres devanados así, corridos 120° en el espacio y alimentados con corrientes corridas 120° en el tiempo, producen la onda de FMM GIRATORIA de amplitud constante (3/2)·Fmax que recorre el entrehierro a velocidad síncrona."
        analogy="Es exactamente la «ola del estadio» que construiste en el primer laboratorio de este documento — solo que ahora sabes de qué están hechos los espectadores: bobinas distribuidas cuya FMM individual pulsa como sinusoide espacial."
      >
        <p>
          No lo repetimos aquí porque ya lo tienes dominado: el laboratorio del campo giratorio (con
          inversión de secuencia, modo monofásico y polos variables) vive en{' '}
          <strong>Capítulo 5 · Sección 1</strong>, y la consolidación matemática del 3/2 en{' '}
          <strong>Capítulo 5 · Sección 2.2</strong>. Si vienes leyendo en orden de libro (4 → 5 → 6),
          esa es tu siguiente parada natural.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="c4s2-check-electricos"
        question="Una máquina de 8 polos: la onda de FMM completa una vuelta ELÉCTRICA (360° eléctricos). ¿Cuánto avanzó físicamente alrededor del entrehierro?"
        options={[
          {
            label: '360° mecánicos: una vuelta es una vuelta.',
            feedback:
              'Solo en la máquina de 2 polos coinciden las monedas. Con 8 polos, el patrón N-S-N-S… se repite 4 veces alrededor del entrehierro: recorrer UN patrón (360° eléctricos) es recorrer solo la cuarta parte del círculo físico.',
          },
          {
            label: '90° mecánicos: con P/2 = 4 pares de polos, θe = 4·θm, y 360° eléctricos son 360/4 = 90° físicos.',
            correct: true,
            feedback:
              'Los grados eléctricos miden avance RESPECTO AL PATRÓN de polos, no respecto al taller. Por eso la máquina multipolar gira lenta con la misma frecuencia: el campo recorre patrones a 60 Hz, pero cada patrón es solo 1/(P/2) del círculo. Es el mismo 120f/p de siempre, visto desde adentro.',
          },
          {
            label: '720° mecánicos: los polos multiplican el recorrido.',
            feedback:
              'Al revés: los polos DIVIDEN el recorrido físico. La conversión es θm = θe/(P/2) — con 8 polos, los 360° eléctricos se encogen a 90° mecánicos.',
          },
        ]}
      />

      <SolvedProblem
        id="c4s2-problema-kd"
        numero="17"
        title="El descuento del abanico"
        statement={
          <>
            El estator de un generador tiene <strong>q = {Q}</strong> ranuras por polo y fase, con
            ranuras separadas <strong>γ = {GAMMA}°</strong> eléctricos. Halle el factor de
            distribución kd y el porcentaje de fundamental que se «pierde» por distribuir.
          </>
        }
        steps={[
          {
            title: 'Ver los aportes como fasores espaciales',
            why: 'Cada bobina aporta una FMM sinusoidal desplazada γ de su vecina. Sumar sinusoides desplazadas = sumar fasores en abanico: la resultante es la cuerda del arco, no la suma de los lados.',
            work: `k_d = \\frac{\\text{sen}(q\\gamma/2)}{q\\,\\text{sen}(\\gamma/2)} = \\frac{\\text{sen}(${Q}\\times${GAMMA}^\\circ/2)}{${Q}\\,\\text{sen}(${GAMMA}^\\circ/2)} = \\frac{\\text{sen}\\,30^\\circ}{${Q}\\,\\text{sen}\\,10^\\circ}`,
          },
          {
            title: 'Evaluar y leer el precio',
            why: 'El numerador es la cuerda (suma fasorial real); el denominador, el abanico estirado en línea recta (suma ideal). Su cociente es el descuento.',
            work: `k_d = \\frac{0.5}{${Q} \\times ${fmt(Math.sin(gRad / 2), 4)}} = ${fmt(kdVal, 4)} \\;\\Rightarrow\\; \\text{pérdida} = ${fmt((1 - kdVal) * 100, 1)}\\%`,
            note: `Verifícalo en el laboratorio con q = 3 (su γ interna es 20°): el readout marca kd = ${fmt(kdVal, 3)}. Un 4% de descuento a cambio de matar la distorsión — el mejor trato del diseño de devanados.`,
          },
        ]}
        answer={`k_d = ${fmt(kdVal, 4)} \\qquad (\\text{se cede } ${fmt((1 - kdVal) * 100, 1)}\\%\\ \\text{de fundamental})`}
        takeaway="kd es geometría pura: la cuerda contra el arco. Memoriza el orden de magnitud (0.95–0.97) y sabrás de un vistazo si un kw de placa de datos es razonable."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C4 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Bobina concentrada = FMM cuadrada = armónicos inútiles. Distribuir en q ranuras pixela la
            sinusoide; Fourier se queda con la fundamental <InlineMath latex="\propto k_d" />.
          </li>
          <li>
            <InlineMath latex="k_d = \text{sen}(q\gamma/2)/(q\,\text{sen}(\gamma/2))" /> — la cuerda
            contra el abanico: ~4% de descuento por ~5× menos distorsión.
          </li>
          <li>
            Tres de estas sinusoides a 120°/120° = la onda giratoria de la «ola del estadio» (C5·S1).
            Y la moneda angular de todo el libro: <InlineMath latex="\theta_e = (P/2)\,\theta_m" />.
          </li>
        </ul>
      </div>
    </section>
  )
}
