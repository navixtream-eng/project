import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ReferenceFrameLab from '../widgets/ReferenceFrameLab'
import { abcToDq, fmt, threePhase } from '../lib/machine'

/** Capítulo 8, Sección 2 — Teoría de marcos de referencia (d-q). */
export default function C8Section2() {
  // Ejemplo numérico: terna balanceada de 100 A pico, vista en el marco síncrono en t arbitrario
  const w = 2 * Math.PI * 60
  const t = 0.004
  const [a, b, c] = threePhase(100, w, t)
  const stat = abcToDq(a, b, c, 0) // marco estacionario
  const sync = abcToDq(a, b, c, w * t) // marco síncrono (θ = ωt)

  return (
    <section id="c8-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Capítulo 8 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Marcos de referencia d-q: el cambio de coordenadas que congela la máquina
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Proyectar las tres fases sobre dos ejes que giran a la velocidad adecuada elimina las
          inductancias variables — y, en el marco síncrono, convierte la corriente alterna en continua.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · De tres fases a dos ejes: la transformación d-q"
        idea="Un sistema trifásico balanceado se puede representar por un único vector giratorio en un plano. La transformación de Park proyecta ese vector sobre dos ejes ortogonales, d (directo) y q (cuadratura). Tres números que suman cero (a, b, c) se vuelven dos independientes (d, q) — más el homopolar, cero en sistemas balanceados."
        analogy="Describir la posición de las agujas de un reloj: puedes dar la longitud de tres sombras proyectadas en tres direcciones (abc, redundantes y móviles) o simplemente las coordenadas x-y de la punta (d-q, dos números limpios). La segunda forma es la misma información sin la redundancia ni el mareo."
      >
        <Formula
          latex="\begin{aligned} i_d &= \tfrac{2}{3}\big[i_a\cos\theta + i_b\cos(\theta{-}120^\circ) + i_c\cos(\theta{+}120^\circ)\big] \\ i_q &= -\tfrac{2}{3}\big[i_a\sin\theta + i_b\sin(\theta{-}120^\circ) + i_c\sin(\theta{+}120^\circ)\big] \end{aligned}"
          symbols={[
            { sym: 'i_d', meaning: 'Componente de eje directo: la proyección del vector de corriente sobre el eje d del marco elegido.' },
            { sym: 'i_q', meaning: 'Componente de eje en cuadratura (90° adelante del d). Junto con id, reconstruye completamente el vector.' },
            { sym: '\\theta', meaning: 'Ángulo del marco de referencia. La MAGIA está en elegir a qué velocidad gira θ: quieto, con el rotor, o con el campo.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · Tres marcos, tres puntos de vista"
        idea="Los ejes d-q pueden girar a la velocidad que queramos, y cada elección tiene un uso. Estacionario (θ fijo): útil para ver los transitorios en las terminales físicas. Del rotor (θ gira con el eje): las variables oscilan a la frecuencia de deslizamiento; es el marco natural del rotor. Síncrono (θ gira con el campo, a ωₑ): el vector queda quieto respecto a los ejes y todas las alternas se vuelven CONSTANTES."
        analogy="Filmar un tiovivo desde tres sitios: desde el suelo (estacionario) los caballos pasan volando; caminando a su lado un poco más lento (rotor) los ves desfilar despacio; subido en la misma plataforma (síncrono) los caballos parecen QUIETOS. Elegir la cámara síncrona convierte un problema dinámico en una foto fija."
      >
        <Formula
          latex="\omega_{marco} = \begin{cases} 0 & \text{estacionario} \\ \omega_r = (1-s)\,\omega_e & \text{del rotor} \\ \omega_e & \text{s\'incrono} \end{cases}"
          symbols={[
            { sym: '0', meaning: 'Marco estacionario (Clarke, αβ): ideal para simular fallas y observar corrientes reales de terminal. Las d-q siguen siendo alternas a ωₑ.' },
            { sym: '\\omega_r', meaning: 'Marco del rotor: gira con el eje mecánico. Las variables quedan a la frecuencia de deslizamiento s·ωₑ — el punto de vista físico del rotor.' },
            { sym: '\\omega_e', meaning: 'Marco síncrono: gira con el campo. En régimen todas las corrientes y tensiones se vuelven CD constantes — sobre eso es trivial poner controladores PI. Es el marco del control moderno.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.3 · Por qué el marco síncrono lo cambia todo"
        idea="Cuando los ejes giran exactamente con el campo, un observador sobre ellos ve el vector de corriente inmóvil: id e iq son valores constantes en régimen permanente, no senoides. Un controlador que trabaja sobre señales de CD (como un regulador PI) puede llevar id e iq a su valor deseado con error cero en estado estable — algo imposible directamente sobre las alternas abc."
        analogy="Es la diferencia entre apuntar a un pato que vuela (abc, alterna) y a un pato de feria clavado (dq síncrono, CD). Sobre el blanco quieto, hasta la puntería más sencilla acierta. El control vectorial de la Sección 4 dispara sobre el pato quieto."
      >
        <p>
          En el laboratorio: la misma corriente de {fmt(100, 0)} A pico da, en el marco estacionario,
          componentes que oscilan (<InlineMath latex={`i_d = ${fmt(stat.d, 0)}`} />,{' '}
          <InlineMath latex={`i_q = ${fmt(stat.q, 0)}`} /> A en ese instante), mientras que en el marco
          síncrono quedan fijas — su módulo <InlineMath latex={`\\sqrt{i_d^2+i_q^2} = ${fmt(Math.hypot(sync.d, sync.q), 0)}`} />{' '}
          A es constante en el tiempo. Cambia el marco en el widget y míralo aplanarse.
        </p>
      </ConceptBlock>

      <ReferenceFrameLab />

      <FeynmanCheck
        id="c8s2-check-marco"
        question="¿Qué problema del modelo dinámico (Sección 1) resuelve proyectar las variables sobre ejes d-q que giran con el rotor?"
        options={[
          {
            label: 'Elimina la resistencia del rotor de las ecuaciones.',
            feedback:
              'La transformación d-q no borra la resistencia (ni debería: es física real). Lo que elimina es la dependencia de las INDUCTANCIAS con la posición θ, que era el origen de la no linealidad.',
          },
          {
            label: 'Congela las inductancias mutuas: vistas desde ejes que giran con el rotor, dejan de depender de θ y se vuelven constantes — el sistema pasa a tener coeficientes constantes.',
            correct: true,
            feedback:
              'Exacto. El monstruo de la Sección 1 eran las mutuas M·cos(θ) que cambiaban con el giro. Al montar los ejes de referencia sobre el propio rotor (o el campo), el ángulo relativo entre devanados deja de cambiar y las inductancias se vuelven CONSTANTES. Las ecuaciones diferenciales pasan de coeficientes variables a coeficientes fijos: por fin resolubles y aptas para diseñar control.',
          },
          {
            label: 'Reduce las seis ecuaciones a una sola.',
            feedback:
              'No las reduce a una — quedan las componentes d y q de estator y rotor (más el homopolar, normalmente cero). El gran avance no es el NÚMERO de ecuaciones sino que sus coeficientes se vuelven CONSTANTES al desaparecer la dependencia con θ.',
          },
        ]}
      />

      <FeynmanCheck
        id="c8s2-check-sincrono"
        question="En el marco SÍNCRONO, ¿por qué las corrientes de régimen permanente aparecen como valores CONSTANTES (CD) en lugar de senoides?"
        options={[
          {
            label: 'Porque los ejes d-q giran a la misma velocidad que el vector de corriente, de modo que el vector queda inmóvil RESPECTO a ellos: sus proyecciones no cambian con el tiempo.',
            correct: true,
            feedback:
              'Correcto. El vector espacial de corriente gira a ωₑ. Si los ejes también giran a ωₑ, el ángulo entre el vector y el eje d es constante → id e iq son constantes. Es un cambio a un sistema de referencia que rota con la señal, exactamente como al subirte al tiovivo los caballos se ven quietos. Esa constancia es lo que permite usar reguladores PI con error cero.',
          },
          {
            label: 'Porque el marco síncrono filtra los armónicos y deja solo la componente de continua.',
            feedback:
              'No es un filtrado: es un cambio de coordenadas exacto y reversible. La senoide no «desaparece», se ve como constante porque el observador gira con ella. Si volvieras al marco abc, la senoide reaparece intacta.',
          },
          {
            label: 'Porque a la velocidad síncrona el deslizamiento es cero y no hay corriente.',
            feedback:
              'El marco síncrono es una elección de EJES matemáticos, no la velocidad del rotor. El rotor sigue con su deslizamiento y sus corrientes reales; lo que se vuelve constante es cómo se ven esas corrientes desde ejes que giran con el campo.',
          },
        ]}
      />

      <SolvedProblem
        id="c8s2-problema-park"
        numero="33"
        title="Proyectar una terna balanceada a ejes d-q"
        statement={
          <>
            Una terna balanceada de corrientes de <strong>100 A</strong> pico y 60 Hz se proyecta a ejes
            d-q. Halle <strong>(a)</strong> el módulo del vector espacial, <strong>(b)</strong> por qué
            en el marco estacionario id, iq oscilan mientras en el síncrono son constantes, y{' '}
            <strong>(c)</strong> qué ventaja da esto al control.
          </>
        }
        steps={[
          {
            title: '(a) El módulo del vector espacial',
            why: 'Con la convención amplitud-invariante (2/3), el vector d-q tiene el mismo módulo que la amplitud de fase — independiente del instante y del marco.',
            work: `|\\mathbf{i}_{dq}| = \\sqrt{i_d^2 + i_q^2} = ${fmt(Math.hypot(sync.d, sync.q), 0)}\\ \\text{A} = \\hat{I}_{fase}`,
          },
          {
            title: '(b) Estacionario oscila, síncrono no',
            why: 'En el marco estacionario (θ = 0) las proyecciones del vector giratorio cambian con el tiempo; en el síncrono (θ = ωt) los ejes persiguen al vector y las proyecciones se congelan.',
            work: `\\text{estacionario: } i_d = ${fmt(stat.d, 0)},\\ i_q = ${fmt(stat.q, 0)}\\ \\text{A (varían)} \\qquad \\text{s\\'incrono: constantes}`,
            note: 'En el marco síncrono id e iq no dependen del instante elegido: son los mismos en cualquier t de régimen permanente.',
          },
          {
            title: '(c) La ventaja para el control',
            why: 'Los controladores PI clásicos anulan el error en estado estable solo frente a referencias CONSTANTES. Sobre señales de CD (marco síncrono) funcionan perfecto; sobre senoides (abc) dejarían error de amplitud y fase.',
            work: `\\text{ref. constante} + \\text{PI} \\Rightarrow \\text{error de r\\'egimen} = 0`,
            note: 'Por eso todo el control vectorial se hace en el marco síncrono: convierte el problema de seguir una senoide en el de mantener dos números — trivial para un PI.',
          },
        ]}
        answer={`|\\mathbf{i}_{dq}| = ${fmt(Math.hypot(sync.d, sync.q), 0)}\\ \\text{A} \\quad\\Rightarrow\\quad \\text{marco s\\'incrono} = \\text{CD} \\Rightarrow \\text{control con PI y error cero}`}
        takeaway="La transformación d-q proyecta tres fases móviles en dos ejes. Eligiendo el marco síncrono, las alternas se vuelven CD constantes: las inductancias se congelan y los controladores PI se vuelven exactos. Es el cimiento matemático del control moderno."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C8 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Park proyecta abc (tres, móviles) en d-q (dos, limpios); el marco puede girar a cualquier velocidad.</li>
          <li>Elegir el marco síncrono (ωₑ) <strong>congela</strong> las inductancias y vuelve las alternas <strong>CD constantes</strong>.</li>
          <li>Sobre señales de CD un regulador PI logra error cero — imposible sobre las senoides abc. Ese es el trampolín al FOC.</li>
        </ul>
      </div>
    </section>
  )
}
