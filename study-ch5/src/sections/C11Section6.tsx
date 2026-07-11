import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ZbusFaultLab from '../widgets/ZbusFaultLab'
import { fmt } from '../lib/machine'

/** Capítulo 11, Sección 6 — Zbus: el sistema multimáquina y la falla en cualquier punto. */
export default function C11Section6() {
  // Problema 55: dos fuentes a un bus común
  const za = 0.3 // 0.2 + 0.1
  const zb = 0.4 // 0.25 + 0.15
  const zth = (za * zb) / (za + zb)
  const if55 = 1 / zth

  // Problema 56: falla deslizante
  const XA = 0.2
  const XB = 0.25
  const XL = 0.2
  const t40 = 0.4
  const zA40 = XA + XL * t40
  const zB40 = XB + XL * (1 - t40)
  const z40 = (zA40 * zB40) / (zA40 + zB40)
  const suma = XA + XB + XL
  const tMin = (suma / 2 - XA) / XL
  const zMax = (suma / 2) ** 2 / suma
  const ifMin = 1 / zMax

  return (
    <section id="c11-seccion-6" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-lime-400">
          Capítulo 11 · Sección 6
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Zbus: fallar en cualquier punto de un sistema real
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Hasta aquí, un generador y una falla en sus bornes. Los sistemas reales tienen varios
          generadores, transformadores, motores y kilómetros de línea — y la falla cae donde
          quiere. La matriz Zbus responde a todo eso de una vez: es el Thévenin de TODOS los buses,
          calculado una sola vez.
        </p>
      </header>

      <ConceptBlock
        title="6.1 · La matriz que contiene todos los Thévenin"
        idea="Construye la matriz de admitancias Ybus (rutina mecánica: cada rama suma en su diagonal y resta en su cruce; cada fuente aporta su admitancia a tierra) e inviértela: Zbus = Ybus⁻¹. El elemento DIAGONAL Z_kk es la impedancia de Thévenin vista desde el bus k — la corriente de falla trifásica es simplemente E/Z_kk. Y las columnas regalan lo demás: durante la falla en k, la tensión del bus i es V_i = E(1 − Z_ik/Z_kk) — el «hueco de tensión» que sienten los vecinos. Con varios generadores no hay nada nuevo que pensar: la inversión matricial YA combinó todas las fuentes en paralelo por ti."
        analogy="Zbus es el mapa de profundidades de un lago: medir la profundidad punto por punto (un Thévenin por bus, a mano) es remar y sondear mil veces; la batimetría completa (una inversión) se hace una vez y responde cualquier pregunta después. Los programas de cortocircuito profesionales SON esta matriz."
      >
        <Formula
          latex="Z_{bus} = Y_{bus}^{-1} \qquad I_f^{(k)} = \frac{E}{Z_{kk}} \qquad V_i = E\left(1 - \frac{Z_{ik}}{Z_{kk}}\right)"
          symbols={[
            { sym: 'Z_{kk}', meaning: 'Diagonal: el Thévenin de cada bus. Toda la topología (fuentes en paralelo, mallas, transformadores) queda «cocinada» dentro por la inversión.' },
            { sym: 'Z_{ik}', meaning: 'Fuera de la diagonal: cuánto «siente» el bus i lo que pasa en el k. Gobierna los huecos de tensión — la falla deprime el vecindario en proporción a Z_ik/Z_kk.' },
            { sym: 'I_f^{(k)}', meaning: 'Falla trifásica franca. Para fallas desbalanceadas: una Zbus POR SECUENCIA, y las tres diagonales Z1_kk, Z2_kk, Z0_kk se conectan como en la Sección 4. Mismo método, tres matrices.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="6.2 · Fallas a mitad de línea y el aporte de los motores"
        idea="¿Falla al 40 % de una línea? Se inserta un BUS FICTICIO en ese punto (la línea se parte en t·X y (1−t)·X) y se reconstruye la Zbus con un nodo más — exactamente lo que hace el software cuando le pides «falla al 40 %». Sorpresa útil: como la suma de impedancias hacia ambos extremos es constante, la corriente de falla es MÍNIMA donde los dos Thévenin se igualan — y esa falla mínima es la que dimensiona la SENSIBILIDAD de los relés. Los MOTORES, por su parte, no son cargas pasivas durante la falla: su campo atrapado los convierte en generadores por unos ciclos (E″ tras X″) — su aporte se suma al de la red y el interruptor debe soportar TAMBIÉN esa corriente en el primer medio ciclo."
        analogy="Los motores en una falla son como el agua de las tuberías cuando revienta la principal: aunque la bomba (red) se corte, todo lo almacenado en las ramas se devuelve al boquete durante un momento. Dimensionar el interruptor solo con la bomba es quedarse corto."
      >
        <p>
          Regla práctica del aporte de motores (IEEE): motores de inducción contribuyen ≈ su
          corriente de rotor bloqueado (1/X″ ≈ 4–6 × In) durante 1–4 ciclos; los síncronos, más y
          por más tiempo. En el <em>momentary duty</em> del interruptor cuentan todos; en el{' '}
          <em>interrupting</em> (3–5 ciclos), los de inducción ya casi se apagaron.
        </p>
      </ConceptBlock>

      <ZbusFaultLab />

      <FeynmanCheck
        id="c11s6-check-zkk"
        question="Tu programa de cortocircuito reporta la Zbus del sistema. Te piden la falla trifásica en el bus 7. ¿Necesitas volver a correr algo?"
        options={[
          {
            label: 'No: I_f = E/Z₇₇ — la diagonal ya contiene el Thévenin de ese bus (y de todos). La matriz se calcula una vez y se falla donde se quiera.',
            correct: true,
            feedback:
              'Esa es la gracia económica de Zbus frente a reducir el circuito a mano bus por bus: una inversión, N Thévenin. Y la columna 7 te regala además todos los huecos de tensión.',
          },
          {
            label: 'Sí: cada bus requiere reconstruir la red y reducirla hacia ese punto.',
            feedback:
              'Eso es el método manual (serie/paralelo/Y-Δ) — válido para redes chicas, impracticable para 500 buses. Zbus existe para no hacerlo.',
          },
          {
            label: 'Sí, porque la Zbus cambia según dónde ocurra la falla.',
            feedback:
              'La Zbus es propiedad de la RED, no de la falla: la falla solo elige qué elemento (Z_kk) leer.',
          },
        ]}
      />

      <FeynmanCheck
        id="c11s6-check-perfil"
        question="Durante una falla en la barra k, un cliente conectado a un bus lejano ve su tensión caer al 0.85 pu (hueco de tensión). ¿Qué elemento de la Zbus lo explica?"
        options={[
          {
            label: 'El cociente Z_ik/Z_kk: mide el «acoplamiento eléctrico» entre su bus y la falla — V_i = E(1 − Z_ik/Z_kk). Cercanía eléctrica, no geográfica.',
            correct: true,
            feedback:
              'Los huecos (sags) que apagan variadores y contactores en plantas «lejanas» son columnas de la Zbus en acción. Estudiarlos ES estudiar Z_ik.',
          },
          {
            label: 'Solo Z_kk: la severidad de la falla lo es todo.',
            feedback:
              'Z_kk fija la corriente EN la falla; cuánto le llega el golpe a cada vecino lo dice el término cruzado Z_ik.',
          },
          {
            label: 'Ninguno: los huecos de tensión son un fenómeno de calidad de energía sin relación con cortocircuitos.',
            feedback:
              'Al revés: la causa número uno de huecos SON los cortocircuitos remotos — calidad de energía y análisis de fallas comparten esta matriz.',
          },
        ]}
      />

      <SolvedProblem
        id="c11s6-problema-zbus"
        numero="55"
        title="Dos generadores, una falla: el paralelo automático"
        statement={
          <>
            G1 (X″ = 0.20 pu) se conecta por una línea de j0.10 pu a la barra B; G2 (X″ = 0.25 pu)
            llega a la misma barra por una línea de j0.15 pu. Falla trifásica franca en B. Halle la
            corriente de falla y el aporte de cada generador.
          </>
        }
        steps={[
          {
            title: 'Las dos ramas hacia la falla',
            why: 'Cada fuente ve su propio camino serie hasta el punto de falla.',
            work: `Z_A = 0.20+0.10 = ${fmt(za, 2)} \\qquad Z_B = 0.25+0.15 = ${fmt(zb, 2)}\\ \\text{pu}`,
          },
          {
            title: 'El Thévenin del punto (lo que Zbus haría solo)',
            why: 'Ambas fuentes tienen la misma E: sus ramas quedan en paralelo — esto es exactamente el Z_kk que la inversión matricial entrega.',
            work: `Z_{th} = \\frac{${fmt(za, 2)} \\times ${fmt(zb, 2)}}{${fmt(za + zb, 2)}} = ${fmt(zth, 4)} \\Rightarrow I_f = \\frac{1}{${fmt(zth, 4)}} = ${fmt(if55, 2)}\\ \\text{pu}`,
          },
          {
            title: 'Los aportes: cada quien según su camino',
            why: 'Con la barra fallada a V = 0, cada generador entrega E/Z de su rama — y deben sumar la falla total (chequeo).',
            work: `I_{G1} = \\frac{1}{${fmt(za, 2)}} = ${fmt(1 / za, 2)} \\qquad I_{G2} = \\frac{1}{${fmt(zb, 2)}} = ${fmt(1 / zb, 2)} \\qquad \\Sigma = ${fmt(1 / za + 1 / zb, 2)}\\ ✓`,
            note: 'El aporte importa tanto como el total: cada interruptor de llegada ve SU aporte, y los relés direccionales deciden con él.',
          },
        ]}
        answer={`I_f = ${fmt(if55, 2)}\\ \\text{pu} \\qquad I_{G1} = ${fmt(1 / za, 2)},\\; I_{G2} = ${fmt(1 / zb, 2)}\\ \\text{pu}`}
        takeaway="Un sistema multimáquina no exige ideas nuevas: exige contabilidad. Zbus ES esa contabilidad automatizada — el paralelo de este problema es su elemento diagonal."
      />

      <SolvedProblem
        id="c11s6-problema-linea"
        numero="56"
        title="Falla deslizante: el punto de corriente mínima"
        statement={
          <>
            Una línea de j{fmt(XL, 2)} pu une la fuente A (X_A = {fmt(XA, 2)} pu) con la fuente B
            (X_B = {fmt(XB, 2)} pu). Halle <strong>(a)</strong> la falla trifásica al 40 % de la
            línea (desde A), y <strong>(b)</strong> el punto de la línea con corriente de falla
            MÍNIMA y su valor — el punto que dimensiona la sensibilidad de los relés.
          </>
        }
        steps={[
          {
            title: '(a) Bus ficticio al 40 %',
            why: 'La línea se parte en t·X y (1−t)·X: la falla ve dos Thévenin en paralelo.',
            work: `Z_A(0.4) = ${fmt(XA, 2)}+0.4(${fmt(XL, 2)}) = ${fmt(zA40, 2)} \\quad Z_B(0.4) = ${fmt(zB40, 2)} \\Rightarrow Z_{th} = ${fmt(z40, 4)} \\Rightarrow I_f = ${fmt(1 / z40, 2)}\\ \\text{pu}`,
          },
          {
            title: '(b) Buscar el mínimo: la suma es constante',
            why: 'EN ESTA TOPOLOGÍA (dos fuentes, una sola línea, falla 3φ franca, solo reactancias) la suma Z_A(t) + Z_B(t) = X_A + X_B + X_L es constante — y un producto con suma constante se maximiza cuando los factores se igualan. El razonamiento vale para el caso; el número NO es una constante universal.',
            work: `Z_A(t^*) = Z_B(t^*) = \\frac{${fmt(suma, 2)}}{2} \\Rightarrow t^* = ${fmt(tMin, 3)} \\;(${fmt(tMin * 100, 0)}\\%\\ \\text{desde A, en ESTE sistema})`,
          },
          {
            title: '(b) La corriente mínima',
            why: 'El peor punto para DETECTAR (no para soportar): la protección debe arrancar incluso ahí.',
            work: `Z_{max} = \\frac{(${fmt(suma / 2, 3)})^2}{${fmt(suma, 2)}} = ${fmt(zMax, 4)} \\Rightarrow I_{f,min} = ${fmt(ifMin, 2)}\\ \\text{pu}`,
            note: 'Precaución: el t* depende de las impedancias de las fuentes, de la topología (mallas o derivaciones lo mueven), del tipo de falla y de si hay resistencia. En un sistema real se BARRE la línea con el software y se busca el mínimo numéricamente — la lección portable es que existe un mínimo, que no suele estar en el centro, y que ESA es la falla que verifica la sensibilidad.',
          },
        ]}
        answer={`\\text{(a)}\\ I_f(40\\%) = ${fmt(1 / z40, 2)}\\ \\text{pu} \\qquad \\text{(b)}\\ t^* = ${fmt(tMin * 100, 0)}\\%\\ (\\text{de este ejemplo}),\\; I_{f,min} = ${fmt(ifMin, 2)}\\ \\text{pu}`}
        takeaway="Las fallas se calculan en el peor punto PARA CADA PREGUNTA: la máxima dimensiona interruptores; la mínima, la sensibilidad de los relés. El punto exacto del mínimo se BUSCA en cada sistema — aquí aprendiste por qué existe y por qué se corre del centro."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C11 Sección 6
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Zbus = Ybus⁻¹: una inversión, todos los Thévenin (diagonal) y todos los huecos de tensión (columnas). Multimáquina = misma teoría + contabilidad matricial.</li>
          <li>Falla a mitad de línea = bus ficticio. Existe un punto de corriente mínima (en la topología simple, donde los Thévenin se igualan; en general, se barre y se busca) — y esa es la falla que debe VER tu relé.</li>
          <li>Los motores devuelven corriente (E″ tras X″) durante los primeros ciclos: cuentan en el momentary duty del interruptor. Desbalanceadas: tres Zbus (una por secuencia) conectadas como en la Sección 4.</li>
        </ul>
      </div>
    </section>
  )
}
