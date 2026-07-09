import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import RotorTypeLab from '../widgets/RotorTypeLab'
import { DEFAULT_INDUCTION, fmt, inductionStartTorque, inductionThevenin } from '../lib/machine'

/** Capítulo 7, Sección 6 — Jaula de ardilla vs rotor devanado; barras profundas y doble jaula. */
export default function C7Section6() {
  const p = DEFAULT_INDUCTION
  const th = inductionThevenin(p)
  const root = Math.sqrt(th.Rth * th.Rth + Math.pow(th.Xth + p.X2, 2))
  // R₂ que pone el par máximo en el arranque: s_maxT = 1 ⇒ R₂ = root
  const R2forStart = root
  const TstartStd = inductionStartTorque(p)
  const TstartHigh = inductionStartTorque({ ...p, R2: R2forStart })

  return (
    <section id="c7-seccion-6" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
          Capítulo 7 · Sección 6
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Jaula, doble jaula y rotor devanado: resolviendo el dilema de R₂
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Mucha R₂ arranca fuerte pero corre mal; poca R₂ es al revés. Tres diseños ingeniosos escapan
          del dilema — dos con geometría, uno con resistencias externas conmutables.
        </p>
      </header>

      <ConceptBlock
        title="6.1 · El dilema de la resistencia del rotor"
        idea="La Sección 5 dejó un conflicto: para arrancar con fuerza quieres R₂ alta (par máximo cerca de s=1), pero para correr eficiente quieres R₂ baja (poca pérdida s·Pgap y deslizamiento pequeño). Una jaula fija con una sola resistencia no puede ser buena en las dos cosas a la vez. Toda la ingeniería del rotor es un intento de tener R₂ alta al arrancar y baja al correr."
        analogy="Zapatos para una carrera con arranque en arena y meta en pista: quieres suela con mucho agarre para arrancar (R₂ alta) pero lisa para correr rápido (R₂ baja). Un solo zapato fijo te obliga a elegir. Los diseños de rotor son zapatos que cambian de suela solos."
      >
        <p>
          Con la R₂ estándar ({fmt(p.R2, 2)} Ω) el motor arranca con {fmt(TstartStd, 0)} N·m; si
          subiéramos R₂ hasta {fmt(R2forStart, 2)} Ω (para poner el par máximo en el arranque),
          arrancaría con {fmt(TstartHigh, 0)} N·m — pero pagaría un rendimiento pésimo en marcha. El
          reto es tener las dos cosas.
        </p>
      </ConceptBlock>

      <ConceptBlock
        title="6.2 · Jaula de ardilla: barras profundas y doble jaula"
        idea="La jaula de ardilla son barras en cortocircuito por dos anillos: robusta, barata, sin escobillas. El truco para vencer el dilema es el EFECTO PELICULAR. A alto deslizamiento (arranque), la frecuencia del rotor es alta y la corriente se apiña en la parte superior de barras profundas (o en la jaula exterior de una doble jaula) → poca sección → R₂ efectiva ALTA. En marcha, fᵣ es baja, la corriente usa toda la barra → R₂ efectiva BAJA. La resistencia se ajusta sola con la velocidad."
        analogy="Una autopista con carriles que se abren según el tráfico: en hora punta (arranque, alta frecuencia) solo está abierto el carril exterior (mucha resistencia); en horas valle (marcha) se abren todos (poca resistencia). La geometría de la barra hace de semáforo automático regido por la frecuencia del rotor."
      >
        <Formula
          latex="R_{2,ef}(s):\quad \text{alta en } s=1\ (f_r\ \text{alta}) \;\longrightarrow\; \text{baja en } s\to 0\ (f_r\ \text{baja})"
          symbols={[
            { sym: 'f_r = s f_e', meaning: 'La frecuencia del rotor gobierna el efecto pelicular: alta en arranque (empuja la corriente a la superficie → R alta), baja en marcha (corriente uniforme → R baja).' },
            { sym: 'R_{2,ef}(s)', meaning: 'Resistencia efectiva del rotor, que la barra profunda / doble jaula hacen VARIAR con el deslizamiento — la solución pasiva al dilema, sin partes móviles ni control externo.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="6.3 · Rotor devanado: resistencia externa a voluntad"
        idea="En vez de confiar en la geometría, el rotor devanado saca los tres devanados del rotor por anillos rozantes y escobillas hacia un reóstato externo. Arrancas con mucha resistencia (par máximo en el arranque, corriente de línea limitada) y la vas retirando por pasos conforme el motor acelera, hasta cortocircuitar los anillos en marcha. Tú recorres a mano la envolvente óptima de la familia de curvas."
        analogy="Una caja de cambios manual para el motor: metes primera (R alta) para arrancar la cuesta, y vas subiendo de marcha (quitando R) a medida que ganas velocidad, hasta directa (R = 0) en llano. Cada resistencia es una curva par-velocidad distinta, y tú saltas entre ellas."
      >
        <p>
          El precio: anillos rozantes y escobillas que se desgastan y necesitan mantenimiento — por eso
          la jaula (sobre todo la doble jaula) domina el mercado, y el rotor devanado se reserva para
          arranques muy pesados o donde se quiere regular la velocidad. La <strong>envolvente</strong>{' '}
          de todas las curvas de arranque coincide con el par máximo: retirando R en el momento justo,
          el motor puede mantenerse cerca de <InlineMath latex="T_{max}" /> durante toda la aceleración.
        </p>
      </ConceptBlock>

      <RotorTypeLab />

      <FeynmanCheck
        id="c7s6-check-doble"
        question="Una barra de rotor profunda logra R₂ alta en el arranque y baja en marcha SIN piezas móviles. ¿Qué fenómeno físico lo consigue?"
        options={[
          {
            label: 'El efecto pelicular gobernado por la frecuencia del rotor: en arranque fᵣ es alta y la corriente se concentra en la parte alta de la barra (poca sección, R alta); en marcha fᵣ es baja y usa toda la barra (R baja).',
            correct: true,
            feedback:
              'Exacto. fᵣ = s·fₑ: en arranque (s=1) son 60 Hz y el efecto pelicular es fuerte → la corriente huye a la superficie de la barra → sección efectiva pequeña → R₂ alta → buen par de arranque. En marcha (s≈0.03) son ~2 Hz, casi CD, la corriente llena la barra → R₂ baja → buen rendimiento. La misma barra da las dos resistencias según la velocidad — magia de la frecuencia.',
          },
          {
            label: 'La dilatación térmica: la barra se calienta al arrancar y cambia su resistencia.',
            feedback:
              'La temperatura afecta la resistencia, pero es lenta y no es el mecanismo de la barra profunda. El cambio de R₂ con la velocidad es INSTANTÁNEO y reversible: lo produce el efecto pelicular, que responde a la frecuencia del rotor, no al calor.',
          },
          {
            label: 'Un interruptor centrífugo que conecta más barras al acelerar.',
            feedback:
              'No hay partes móviles ni interruptores en una jaula: esa es su gran ventaja. El cambio de resistencia es puramente electromagnético (efecto pelicular), gobernado por fᵣ = s·fₑ.',
          },
        ]}
      />

      <FeynmanCheck
        id="c7s6-check-devanado"
        question="¿Por qué el rotor devanado con resistencia externa permite arrancar con MUCHO par y POCA corriente de línea a la vez — algo que parece contradictorio?"
        options={[
          {
            label: 'Porque la resistencia externa mueve el par máximo al arranque (más par) y a la vez añade impedancia que limita la corriente del rotor (menos corriente).',
            correct: true,
            feedback:
              'Correcto, y es la doble ventaja clave. Subir R₂ hace dos cosas buenas al mismo tiempo en el arranque: (1) corre s_maxT hacia s=1, poniendo el par máximo justo al arrancar; (2) aumenta la impedancia de la rama del rotor, reduciendo la corriente. Una jaula de baja R arranca con lo peor de ambos mundos: poco par y corriente enorme. El rotor devanado los invierte a los dos.',
          },
          {
            label: 'Porque la resistencia externa aumenta la tensión aplicada al rotor.',
            feedback:
              'La resistencia externa no sube ninguna tensión — se conecta en serie con el devanado del rotor y disipa parte de su potencia. El beneficio es geométrico (reubica el par máximo) y de limitación de corriente, no de aumento de tensión.',
          },
          {
            label: 'Porque reduce la resistencia del estator.',
            feedback:
              'La resistencia externa está en el circuito del ROTOR (por los anillos rozantes), no toca el estator. Su efecto es sobre la curva par-velocidad y la corriente del rotor.',
          },
        ]}
      />

      <SolvedProblem
        id="c7s6-problema-rotores"
        numero="31"
        title="Elegir R₂ para arrancar con el par máximo"
        statement={
          <>
            Para el motor de 460 V, 4 polos, 60 Hz (Rth = {fmt(th.Rth, 3)}, Xth = {fmt(th.Xth, 3)}, X₂ ={' '}
            {fmt(p.X2, 2)} Ω), ¿qué resistencia de rotor coloca el <strong>par máximo justo en el
            arranque</strong> (s = 1)? Compare el par de arranque resultante con el de la jaula estándar
            (R₂ = {fmt(p.R2, 2)} Ω).
          </>
        }
        steps={[
          {
            title: 'La condición: s_maxT = 1',
            why: 'Queremos que la cima de la curva caiga exactamente en el arranque. Como s_maxT = R₂/√(Rth²+(Xth+X₂)²), basta igualarlo a 1.',
            work: `s_{maxT} = \\frac{R_2}{\\sqrt{R_{th}^2+(X_{th}+X_2)^2}} = 1 \\;\\Rightarrow\\; R_2 = \\sqrt{R_{th}^2+(X_{th}+X_2)^2}`,
          },
          {
            title: 'El valor de R₂ requerido',
            why: 'Sustituyendo los parámetros de Thévenin y la reactancia del rotor.',
            work: `R_2 = \\sqrt{${fmt(th.Rth, 3)}^2 + (${fmt(th.Xth, 3)}+${fmt(p.X2, 2)})^2} = ${fmt(R2forStart, 3)}\\ \\Omega`,
            note: `Unas ${fmt(R2forStart / p.R2, 1)} veces la R₂ de la jaula estándar — se lograría con resistencia externa (rotor devanado) o con barras de alta resistencia.`,
          },
          {
            title: 'El par de arranque conseguido',
            why: 'Con esa R₂, el arranque cae sobre el par máximo. Se compara con el arranque de la jaula estándar.',
            work: `T_{arr}(R_2 = ${fmt(R2forStart, 2)}) = ${fmt(TstartHigh, 0)}\\ \\text{N·m} \\quad\\text{vs}\\quad T_{arr}(R_2 = ${fmt(p.R2, 2)}) = ${fmt(TstartStd, 0)}\\ \\text{N·m}`,
            note: 'El par de arranque casi se multiplica — y como bonus la corriente de línea baja. Pero en marcha esa R₂ enorme daría un deslizamiento y unas pérdidas inaceptables: por eso se RETIRA al acelerar (rotor devanado) o se consigue solo transitoriamente (efecto pelicular de la doble jaula).',
          },
        ]}
        answer={`R_2 = \\sqrt{R_{th}^2+(X_{th}+X_2)^2} = ${fmt(R2forStart, 3)}\\ \\Omega \\;\\Rightarrow\\; T_{arr} = ${fmt(TstartHigh, 0)}\\ \\text{N·m}\\ (\\text{vs } ${fmt(TstartStd, 0)}\\ \\text{estándar})`}
        takeaway="El par máximo en el arranque se consigue con R₂ = √(Rth²+(Xth+X₂)²). Como esa R₂ arruina la marcha, la ingeniería la hace transitoria: geometría (doble jaula, efecto pelicular) o resistencia externa conmutable (rotor devanado)."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C7 Sección 6 · Cierre del capítulo
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El dilema de R₂: alta arranca bien pero corre mal; baja, al revés. Toda la ingeniería del rotor lo resuelve.</li>
          <li>Doble jaula / barra profunda: el efecto pelicular (regido por <InlineMath latex="f_r=sf_e" />) sube R₂ en el arranque y la baja en marcha, sin partes móviles.</li>
          <li>Rotor devanado: R₂ externa conmutable — mucho par y poca corriente al arrancar, retirándola al acelerar; a cambio, anillos y escobillas.</li>
        </ul>
      </div>
    </section>
  )
}
