import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import InductionPowerLab from '../widgets/InductionPowerLab'
import { DEFAULT_INDUCTION, fmt, inductionSolve, inductionThevenin, syncSpeedRad } from '../lib/machine'

/** Capítulo 7, Sección 4 — Análisis del rendimiento: Pgap, Tind, pérdidas, eficiencia, Thévenin. */
export default function C7Section4() {
  const p = DEFAULT_INDUCTION
  const s = 0.03
  const r = inductionSolve(p, s)
  const th = inductionThevenin(p)
  const ws = syncSpeedRad(p.f, p.poles)

  return (
    <section id="c7-seccion-4" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 4
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Del circuito al rendimiento: potencia de entrehierro, par y eficiencia
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Con el circuito resuelto, la potencia se lee como una cascada de peajes. Y en el corazón hay
          una ley de reparto tan simple como potente: 1 : s : (1−s).
        </p>
      </header>

      <ConceptBlock
        title="4.1 · La potencia de entrehierro y el reparto 1 : s : (1−s)"
        idea="La potencia que cruza magnéticamente el entrehierro, Pgap, es lo que se disipa en toda la rama del rotor: 3·I₂²·(R₂/s). De ahí se reparte en una proporción FIJA por el deslizamiento: la fracción s se pierde en el cobre del rotor y la fracción (1−s) se convierte en potencia mecánica. Ni un vatio se escapa de esa regla."
        analogy="Un peaje que cobra un porcentaje: de cada euro que cruza el puente (Pgap), el peajero se queda con la fracción s (pérdida en el rotor) y deja pasar (1−s) al otro lado (mecánica). El porcentaje lo fija el deslizamiento, no la cantidad."
      >
        <Formula
          latex="P_{gap} = 3I_2^2\frac{R_2}{s} \qquad P_{rotor} = s\,P_{gap} \qquad P_{mec} = (1-s)P_{gap}"
          symbols={[
            { sym: 'P_{gap}', meaning: 'Potencia de entrehierro: toda la potencia que pasa del estator al rotor por el campo. Se calcula como la potencia en la resistencia total R₂/s.' },
            { sym: 'P_{rotor} = sP_{gap}', meaning: 'Pérdida en el cobre del rotor: la fracción s de Pgap se quema como calor Joule (3·I₂²·R₂). Alta a alto deslizamiento — el arranque cocina el rotor.' },
            { sym: 'P_{mec} = (1-s)P_{gap}', meaning: 'Potencia mecánica desarrollada: la fracción (1−s) de Pgap. El rendimiento máximo del rotor es 1−s: por eso ningún motor de inducción es eficiente lejos de nₛ.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="4.2 · El par se lee de Pgap, no de Pmec"
        idea="El par electromagnético interno es la potencia de entrehierro dividida por la velocidad SÍNCRONA (no la del rotor): Tind = Pgap/ωs. Es un resultado precioso: el par existe incluso con el rotor parado (Pmec = 0) porque Pgap no es cero. Y hace el cálculo del par independiente de la velocidad real."
        analogy="Medir la fuerza de un remolcador por la tensión de la cuerda, no por lo rápido que avanza el barco. Aunque el barco esté anclado (rotor parado, Pmec = 0), la cuerda tira con fuerza (hay par). Pgap es la tensión de la cuerda; ωs, la referencia fija para leerla."
      >
        <Formula
          latex="T_{ind} = \frac{P_{gap}}{\omega_s} = \frac{P_{mec}}{\omega_m} \qquad \omega_m = (1-s)\,\omega_s"
          symbols={[
            { sym: 'T_{ind}', meaning: 'Par electromagnético interno [N·m]. Igual leído desde el entrehierro (Pgap/ωs) o desde el eje (Pmec/ωm) — dan lo mismo porque Pmec = (1−s)Pgap y ωm = (1−s)ωs.' },
            { sym: '\\omega_s', meaning: 'Velocidad angular síncrona [rad/s] = 2πf/(p/2). Es la referencia FIJA que hace cómodo el cálculo del par.' },
          ]}
        />
        <p>
          Para calcular el par sin resolver toda la red, se usa el <strong>equivalente de Thévenin</strong>{' '}
          visto desde la rama del rotor: se reduce la fuente V detrás de R₁+jX₁ con Xm en paralelo a
          una fuente Vth detrás de Rth+jXth. Entonces{' '}
          <InlineMath latex="T_{ind} = \frac{3}{\omega_s}\frac{V_{th}^2 (R_2/s)}{(R_{th}+R_2/s)^2 + (X_{th}+X_2)^2}" />.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="4.3 · El árbol de pérdidas y la eficiencia"
        idea="Pin entra por el estator y va pagando peajes: cobre del estator (I₁²R₁), hierro (Rc), cobre del rotor (s·Pgap) y fricción+ventilación. Lo que queda es Pout en el eje. El rendimiento es Pout/Pin — y su techo lo pone el deslizamiento vía el (1−s) del rotor."
        analogy="Un sueldo que se va en descuentos sucesivos: impuestos del estator, seguro del hierro, comisión del rotor (proporcional a s) y gastos fijos de fricción. Lo que llega a tu bolsillo es Pout. Cuanto mayor el deslizamiento, mayor la comisión del rotor."
      >
        <Formula
          latex="\eta = \frac{P_{out}}{P_{in}} = \frac{P_{mec} - P_{fw}}{P_{in}} \qquad P_{in} = 3\,\text{Re}\{V\,I_1^*\}"
          symbols={[
            { sym: '\\eta', meaning: 'Rendimiento. En un motor bien diseñado a plena carga ronda 88–95%. Cae rápido si el deslizamiento sube (más pérdida en el rotor) o si el motor trabaja muy descargado (domina la magnetización).' },
            { sym: 'P_{fw}', meaning: 'Pérdidas por fricción y ventilación: mecánicas, casi constantes con la carga. Se restan de la potencia mecánica desarrollada para dar la de salida.' },
          ]}
        />
      </ConceptBlock>

      <InductionPowerLab />

      <FeynmanCheck
        id="c7s4-check-flujo"
        question="Un motor recibe Pgap = 50 kW de potencia de entrehierro con un deslizamiento de 4%. ¿Cuánta potencia se pierde en el cobre del rotor?"
        options={[
          {
            label: '2 kW: es la fracción s·Pgap = 0.04 × 50.',
            correct: true,
            feedback:
              'Exacto. La ley 1 : s : (1−s) dice que la pérdida en el cobre del rotor es siempre s·Pgap = 0.04 × 50 = 2 kW, y la potencia mecánica es (1−s)·Pgap = 48 kW. No necesitas la corriente ni la resistencia: el deslizamiento reparte Pgap directamente.',
          },
          {
            label: '48 kW: casi toda la potencia se pierde en el rotor.',
            feedback:
              'Al revés: 48 kW es la potencia MECÁNICA útil (1−s)·Pgap. La pérdida en el cobre del rotor es la fracción PEQUEÑA s·Pgap = 2 kW. A bajo deslizamiento el rotor es eficiente.',
          },
          {
            label: 'No se puede saber sin la resistencia R₂ del rotor.',
            feedback:
              'Ese es el poder del reparto 1 : s : (1−s): la pérdida en el rotor es s·Pgap SIEMPRE, sin importar R₂. R₂ afecta la corriente y dónde ocurre el par máximo, pero el REPARTO de Pgap solo depende de s.',
          },
        ]}
      />

      <FeynmanCheck
        id="c7s4-check-par"
        question="¿Por qué el par se calcula como Pgap/ωs (velocidad síncrona) y no como Pmec/ωm (velocidad real del rotor)?"
        options={[
          {
            label: 'Son dos pares distintos: Pgap/ωs es el par de entrada y Pmec/ωm el de salida.',
            feedback:
              'Dan EXACTAMENTE el mismo número. Como Pmec = (1−s)Pgap y ωm = (1−s)ωs, el factor (1−s) se cancela: Pmec/ωm = Pgap/ωs. No son pares distintos, son dos formas de leer el MISMO par.',
          },
          {
            label: 'Porque ambas expresiones dan el mismo par (el (1−s) se cancela), pero Pgap/ωs es más cómoda: usa una velocidad FIJA y funciona incluso con el rotor parado.',
            correct: true,
            feedback:
              'Correcto. Pmec/ωm falla en el arranque (ωm = 0, Pmec = 0, cociente 0/0 indeterminado), pero Pgap/ωs da el par de arranque sin problema porque ωs es constante y Pgap ≠ 0. Es la misma cantidad, calculada desde la referencia que no se mueve.',
          },
          {
            label: 'Porque a la velocidad síncrona el par es máximo.',
            feedback:
              'A la velocidad síncrona el par es CERO (s = 0, sin inducción). ωs no es donde el par es máximo; es simplemente la referencia fija cómoda para calcularlo en cualquier velocidad.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s4-problema-rendimiento"
        numero="29"
        title="Par, reparto de potencia y rendimiento a plena carga"
        statement={
          <>
            Para el motor de la Sección 3 (460 V línea, 4 polos, 60 Hz, R₁ = {fmt(p.R1, 2)}, X₁ ={' '}
            {fmt(p.X1, 2)}, R₂ = {fmt(p.R2, 2)}, X₂ = {fmt(p.X2, 2)}, Xm = {fmt(p.Xm, 0)} Ω; P_fw ={' '}
            {fmt(p.Pfw, 0)} W, P_núcleo = {fmt(p.Pcore, 0)} W) a s = {fmt(s, 2)}, halle{' '}
            <strong>(a)</strong> el equivalente de Thévenin, <strong>(b)</strong> Pgap y el par interno,
            <strong>(c)</strong> el reparto de potencia y <strong>(d)</strong> el rendimiento.
          </>
        }
        steps={[
          {
            title: '(a) Reducir la fuente a Thévenin',
            why: 'Para no arrastrar la rama de magnetización en cada cuenta, se colapsa el estator + Xm a una fuente equivalente detrás de una impedancia.',
            work: `V_{th} = ${fmt(th.Vth, 1)}\\ \\text{V} \\qquad R_{th} = ${fmt(th.Rth, 3)}\\ \\Omega \\qquad X_{th} = ${fmt(th.Xth, 3)}\\ \\Omega`,
          },
          {
            title: '(b) Potencia de entrehierro y par',
            why: 'Con la rama del rotor R₂/s + jX₂ conectada a la fuente Thévenin, Pgap es la potencia en R₂/s y el par es Pgap/ωs.',
            work: `P_{gap} = ${fmt(r.Pgap / 1000, 1)}\\ \\text{kW} \\qquad T_{ind} = \\frac{P_{gap}}{\\omega_s} = \\frac{${fmt(r.Pgap, 0)}}{${fmt(ws, 1)}} = ${fmt(r.Tind, 0)}\\ \\text{N·m}`,
          },
          {
            title: '(c) El reparto 1 : s : (1−s)',
            why: 'De Pgap, la fracción s va al cobre del rotor y (1−s) a mecánica; luego se resta la fricción.',
            work: `P_{rotor} = s\\,P_{gap} = ${fmt(r.Prcl / 1000, 2)}\\ \\text{kW} \\qquad P_{mec} = (1-s)P_{gap} = ${fmt(r.Pmech / 1000, 1)}\\ \\text{kW}`,
          },
          {
            title: '(d) Salida y rendimiento',
            why: 'Pout = Pmec − P_fw; η = Pout/Pin, con Pin incluyendo cobre de estator, hierro y todo lo demás.',
            work: `P_{out} = ${fmt(r.Pmech / 1000, 1)} - ${fmt(p.Pfw / 1000, 2)} = ${fmt(r.Pout / 1000, 1)}\\ \\text{kW} \\qquad \\eta = \\frac{${fmt(r.Pout / 1000, 1)}}{${fmt(r.Pin / 1000, 1)}} = ${fmt(r.eff * 100, 1)}\\%`,
            note: 'Rendimiento típico de plena carga: la mayor pérdida evitable es el cobre del rotor (∝ s), por eso conviene operar con deslizamiento bajo.',
          },
        ]}
        answer={`V_{th} = ${fmt(th.Vth, 1)}\\ \\text{V} \\quad P_{gap} = ${fmt(r.Pgap / 1000, 1)}\\ \\text{kW} \\quad T_{ind} = ${fmt(r.Tind, 0)}\\ \\text{N·m} \\quad \\eta = ${fmt(r.eff * 100, 1)}\\%`}
        takeaway="Con Thévenin el par sale de una sola fórmula; con la ley 1 : s : (1−s) el reparto de potencia se lee sin esfuerzo. El par se calcula desde ωs (fija), y la eficiencia del rotor tiene el techo duro 1−s."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 4
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>De la potencia de entrehierro sale todo: reparto fijo <InlineMath latex="1 : s : (1-s)" /> en Pgap, cobre del rotor y mecánica.</li>
          <li>El par se lee desde la velocidad síncrona: <InlineMath latex="T_{ind}=P_{gap}/\omega_s" /> — vale incluso con el rotor parado.</li>
          <li>Thévenin colapsa el estator para una fórmula de par directa; la eficiencia del rotor no puede pasar de <InlineMath latex="1-s" />.</li>
        </ul>
      </div>
    </section>
  )
}
