import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DynamicModelLab from '../widgets/DynamicModelLab'

/** Capítulo 8, Sección 1 — Modelado dinámico en el dominio del tiempo. */
export default function C8Section1() {
  return (
    <section id="c8-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Capítulo 8 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Modelado dinámico: las ecuaciones que el circuito equivalente escondía
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          El circuito del Cap. 7 vale para régimen permanente a frecuencia fija. Para arranques,
          frenados y control necesitamos las ecuaciones diferenciales completas — y ahí aparece un
          monstruo: inductancias que cambian a cada instante.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · Volver a las ecuaciones de verdad: v = Ri + dλ/dt"
        idea="El circuito equivalente asume tensión y frecuencia constantes y trabaja con fasores. Pero un arranque o un cambio brusco de carga son TRANSITORIOS: hay que escribir la ley de Faraday completa para cada bobina, v = Ri + dλ/dt, donde λ es el enlace de flujo. Seis ecuaciones (tres de estator, tres de rotor) acopladas por el flujo mutuo."
        analogy="El circuito equivalente es una foto de larga exposición: promedia el movimiento y da un resultado limpio. Las ecuaciones diferenciales son el vídeo cuadro a cuadro: capturan cada sacudida del arranque y cada latigazo de par, pero cuestan mucho más de procesar."
      >
        <Formula
          latex="\mathbf{v}_{abc} = R\,\mathbf{i}_{abc} + \frac{d\boldsymbol{\lambda}_{abc}}{dt} \qquad \boldsymbol{\lambda} = \mathbf{L}(\theta)\,\mathbf{i}"
          symbols={[
            { sym: 'v = Ri + \\frac{d\\lambda}{dt}', meaning: 'La ley de Faraday sin atajos: la tensión vence la caída resistiva Ri y la FEM inducida por el cambio del enlace de flujo dλ/dt. En régimen fasorial dλ/dt se vuelve jωλ; en transitorio hay que derivar de verdad.' },
            { sym: '\\boldsymbol{\\lambda} = \\mathbf{L}(\\theta)\\,\\mathbf{i}', meaning: 'El enlace de flujo de cada bobina es la suma de las inductancias por las corrientes de TODAS las bobinas. La matriz L depende de la posición θ del rotor — ahí está el problema.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · El monstruo: inductancias que se mueven con el rotor"
        idea="La inductancia mutua entre una bobina del estator y una del rotor depende de cuán alineadas estén: es máxima cuando sus ejes coinciden y nula en cuadratura, es decir, M·cos(θ). Como θ = ∫ω dt cambia sin parar, esas mutuas son funciones del TIEMPO. Al derivar λ = L(θ)·i aparecen términos dL/dt·i además de L·di/dt: coeficientes variables → sistema no lineal y acoplado."
        analogy="Intentar sumar las contribuciones de nueve engranajes que cambian de tamaño mientras giras la manivela. En un transformador las bobinas están quietas y sus mutuas son constantes; en la máquina rotativa el rotor las reescribe a cada grado — resolver eso directamente es una pesadilla numérica."
      >
        <Formula
          latex="L_{sr}(\theta) = M\cos\theta \qquad \frac{d}{dt}\big(L(\theta)\,i\big) = L\frac{di}{dt} + \underbrace{\frac{dL}{d\theta}\,\omega\,i}_{\text{término de velocidad}}"
          symbols={[
            { sym: 'L_{sr}(\\theta) = M\\cos\\theta', meaning: 'Mutua estator-rotor: máxima (M) con los ejes alineados, cero a 90°, negativa a 180°. Con nueve pares de bobinas hay nueve de estas, desfasadas 120°.' },
            { sym: '\\frac{dL}{d\\theta}\\,\\omega\\,i', meaning: 'El «término de velocidad»: nace de que L cambia con θ y θ con el tiempo. Es lo que hace las ecuaciones no lineales — y también donde vive el par electromecánico.' },
          ]}
        />
        <p>
          La salida a este laberinto es un cambio de coordenadas: proyectar todo sobre unos ejes que
          giren con el rotor (o con el campo), de modo que las inductancias vistas desde ahí queden{' '}
          <strong>constantes</strong>. Ese es el tema de la Sección 2 — la teoría de marcos de referencia.
        </p>
      </ConceptBlock>

      <DynamicModelLab />

      <FeynmanCheck
        id="c8s1-check-derivada"
        question="¿Por qué el circuito equivalente por fase del Cap. 7 NO sirve para estudiar el arranque o un cambio brusco de par?"
        options={[
          {
            label: 'Porque el circuito equivalente supone régimen permanente sinusoidal (fasores a frecuencia fija); un transitorio viola justo esa suposición y exige resolver dλ/dt de verdad.',
            correct: true,
            feedback:
              'Exacto. El circuito fasorial reemplaza d/dt por jω, lo que solo vale si todo oscila a una única frecuencia constante. En un arranque la velocidad (y con ella la frecuencia del rotor, las corrientes y el par) cambia instante a instante: hay que volver a v = Ri + dλ/dt y resolver el sistema diferencial completo.',
          },
          {
            label: 'Porque el circuito equivalente ignora la resistencia del rotor.',
            feedback:
              'El circuito equivalente SÍ incluye la resistencia del rotor (R₂/s) — es central en él. Su limitación no es qué elementos modela, sino la SUPOSICIÓN de régimen permanente a frecuencia fija que hay detrás de usar fasores.',
          },
          {
            label: 'Porque en el arranque no hay campo giratorio.',
            feedback:
              'Sí hay campo giratorio desde el instante en que se energiza el estator (gira a nₛ aunque el rotor esté parado). El problema del circuito equivalente para transitorios es puramente el uso de fasores de frecuencia fija, no la ausencia de campo.',
          },
        ]}
      />

      <FeynmanCheck
        id="c8s1-check-inductancias"
        question="En el laboratorio, la mutua estator-rotor es M·cos(θ) y cambia al girar el rotor. ¿Por qué eso convierte las ecuaciones en NO lineales?"
        options={[
          {
            label: 'Porque cos(θ) es una función curva en lugar de una recta.',
            feedback:
              'La forma de coseno no es lo que causa la no linealidad por sí sola. El problema es más sutil: el enlace de flujo λ = L(θ)·i es un PRODUCTO de dos cosas que dependen del tiempo (la inductancia vía θ, y la corriente), y θ a su vez depende del estado del sistema.',
          },
          {
            label: 'Porque λ = L(θ)·i acopla la inductancia variable con la corriente, y θ depende de la propia dinámica: al derivar aparecen productos de variables de estado (ω·i) — el sello de un sistema no lineal.',
            correct: true,
            feedback:
              'Correcto. Al derivar λ = L(θ)·i sale L·di/dt + (dL/dθ)·ω·i. Ese último término multiplica dos variables de estado del sistema (la velocidad ω y la corriente i), y además θ evoluciona según el par, que a su vez depende de las corrientes. Coeficientes que dependen del tiempo Y productos de variables de estado = sistema no lineal y acoplado, sin solución analítica directa.',
          },
          {
            label: 'Porque la resistencia R también cambia con la temperatura.',
            feedback:
              'La R sí varía algo con la temperatura, pero eso es lento y secundario. La no linealidad esencial del modelo dinámico viene de las inductancias que dependen de la posición del rotor y de los productos velocidad×corriente que aparecen al derivar el enlace de flujo.',
          },
        ]}
      />

      <SolvedProblem
        id="c8s1-problema-modelo"
        numero="32"
        title="¿Cuándo importa el modelo dinámico?"
        statement={
          <>
            Un motor de inducción se energiza en vacío y alcanza su velocidad en ~0.3 s. La constante de
            tiempo del rotor es <InlineMath latex="\tau_r = L_r/R_r \approx 0.2" /> s. Argumente{' '}
            <strong>(a)</strong> por qué el circuito equivalente subestima la corriente de arranque, y{' '}
            <strong>(b)</strong> qué número de ecuaciones diferenciales acopladas describe la máquina en
            variables abc, y por qué conviene reducirlo.
          </>
        }
        steps={[
          {
            title: '(a) La corriente de arranque tiene un transitorio',
            why: 'El circuito equivalente da la corriente de RÉGIMEN a cada deslizamiento. Pero al conectar, los flujos no pueden saltar (λ continua): aparece una componente transitoria de CD que se suma a la de régimen, con constante τr ≈ 0.2 s.',
            work: `t_{arranque} \\approx 0.3\\ \\text{s} \\sim \\tau_r = 0.2\\ \\text{s} \\;\\Rightarrow\\; \\text{el transitorio NO es despreciable}`,
            note: 'Como el tiempo de arranque es del orden de la constante de tiempo del flujo, la corriente real tiene picos que el modelo de régimen no ve — importan para dimensionar protecciones y el inversor.',
          },
          {
            title: '(b) Seis ecuaciones acopladas',
            why: 'Tres devanados de estator + tres de rotor, cada uno con su v = Ri + dλ/dt. Los enlaces λ acoplan las seis a través de las inductancias mutuas.',
            work: `3\\ (\\text{estator}) + 3\\ (\\text{rotor}) = 6\\ \\text{EDO acopladas},\\quad \\text{con } 9\\ \\text{mutuas } M\\cos\\theta`,
            note: 'Seis ecuaciones no lineales con coeficientes variables en el tiempo. La transformación d-q las reduce a un sistema de coeficientes CONSTANTES — mucho más manejable y la puerta al control.',
          },
        ]}
        answer={`\\text{(a) } t_{arr}\\sim\\tau_r \\Rightarrow \\text{transitorio relevante} \\qquad \\text{(b) } 6\\ \\text{EDO acopladas con mutuas } M\\cos\\theta`}
        takeaway="Para todo lo que no sea régimen permanente (arranque, control, fallas), el circuito fasorial no basta: hay que escribir v = Ri + dλ/dt. El obstáculo son las inductancias que se mueven con θ — y la solución, cambiar de coordenadas."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C8 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>El circuito equivalente es régimen permanente; para transitorios hay que usar <InlineMath latex="v=Ri+d\lambda/dt" />.</li>
          <li>Las mutuas estator-rotor son <InlineMath latex="M\cos\theta" />: cambian con la posición → 6 EDO acopladas, no lineales.</li>
          <li>El «término de velocidad» <InlineMath latex="(dL/d\theta)\,\omega\,i" /> es el que complica todo — y donde vive el par. La cura: los marcos d-q.</li>
        </ul>
      </div>
    </section>
  )
}
