import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DriveControlLab from '../widgets/DriveControlLab'

/** Capítulo 10, Sección 5 — Introducción al control dinámico de velocidad (drives). */
export default function C10Section5() {
  return (
    <section id="c10-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
          Capítulo 10 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El variador: control en cascada de corriente y velocidad
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Un lazo interno rápido protege la corriente; uno externo lento manda la velocidad. Con dos PI
          anidados, el motor sigue una rampa exacta y rechaza los cambios de carga.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · Por qué realimentar: el lazo cerrado"
        idea="En lazo abierto (fijar la tensión y esperar) la velocidad depende de la carga, la temperatura y la tensión de red: no es precisa. En LAZO CERRADO se MIDE la velocidad, se compara con la deseada y se corrige el error automáticamente. El controlador integral (I) garantiza error CERO en régimen: sigue empujando hasta que la velocidad real iguala la referencia, sin importar la carga."
        analogy="El control de crucero de un coche: no fijas una posición del acelerador (lazo abierto), sino una velocidad objetivo; el sistema ajusta el acelerador solo para mantenerla, suba o baje la cuesta. Eso es realimentación."
      >
        <Formula
          latex="u(t) = K_p\,e(t) + K_i\!\int e(t)\,dt \qquad e = \text{referencia} - \text{medida}"
          symbols={[
            { sym: 'K_p\\,e', meaning: 'Término proporcional: reacciona al error presente. Más Kp = respuesta más rápida, pero demasiado provoca sobrepaso y oscilación.' },
            { sym: 'K_i\\!\\int e\\,dt', meaning: 'Término integral: acumula el error pasado y lo anula en régimen. Es lo que garantiza velocidad EXACTA pese a la carga (error de estado estacionario cero).' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.2 · El lazo INTERNO de corriente: proteger y acotar el par"
        idea="El lazo más rápido controla la corriente de armadura. Su misión doble: (1) proteger los transistores del variador y las escobillas limitando la corriente a un máximo Imax; (2) como el par es Ka·Φ·ia, limitar la corriente es limitar el PAR — un arranque suave y controlado en vez de un tirón. Aprovecha que τe ≪ τm: actúa antes de que la velocidad cambie."
        analogy="El fusible inteligente del sistema: en vez de cortar, MODERA. Nunca deja pasar más corriente (ni más par) de la cuenta, sin importar lo que pida el lazo de velocidad."
      >
        <Formula
          latex="i_a^{ref} = \text{sat}\big(K_{pS}\,e_\omega + K_{iS}\!\int e_\omega\big) \in [-I_{max},\,+I_{max}]"
          symbols={[
            { sym: 'i_a^{ref}', meaning: 'La corriente que pide el lazo de velocidad, que el lazo interno hará seguir. Es la referencia del lazo de corriente — el enlace entre los dos lazos.' },
            { sym: '\\text{sat}(\\cdot)', meaning: 'La saturación a ±Imax: por más que el lazo de velocidad pida, la corriente (y el par) nunca superan el límite. Protege el hardware y suaviza el arranque.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.3 · El lazo EXTERNO de velocidad: seguir la rampa"
        idea="El lazo lento compara la velocidad medida con la referencia (a menudo una RAMPA de aceleración suave) y calcula qué corriente (par) hace falta. Trata el lazo de corriente cerrado como casi instantáneo — válido porque es mucho más rápido. Así el motor sigue el perfil de velocidad ordenado sin importar la carga, y ante una perturbación (un cambio brusco de carga) la recupera sola."
        analogy="El director de orquesta (velocidad) marca el tempo; los músicos (corriente) lo ejecutan al instante. El director no se preocupa de cada nota, confía en que el lazo rápido responde ya."
      >
        <p>
          En el laboratorio: durante la rampa, la corriente se pega al límite Imax (arranque controlado);
          al llegar a la referencia, se relaja; y cuando la carga sube de golpe, la velocidad cae un
          instante y el integrador la recupera exacta. Ese es todo el arte del variador.
        </p>
      </ConceptBlock>

      <DriveControlLab />

      <FeynmanCheck
        id="c10s5-check-integral"
        question="¿Por qué el término INTEGRAL del controlador PI es imprescindible para que la velocidad sea exacta pese a los cambios de carga?"
        options={[
          {
            label: 'Porque acumula el error a lo largo del tiempo y sigue corrigiendo mientras exista error, hasta anularlo por completo en régimen — logra error de estado estacionario CERO.',
            correct: true,
            feedback:
              'Exacto. Un control solo proporcional dejaría un error residual: necesita un error distinto de cero para generar la señal que sostiene la corriente contra la carga. El término integral resuelve esto: mientras quede cualquier error, sigue acumulando y aumentando su salida, así que solo se detiene cuando el error es EXACTAMENTE cero. Por eso, ante una carga nueva, el integral ajusta la corriente hasta que la velocidad vuelve justo a la referencia — sin error permanente.',
          },
          {
            label: 'Porque hace la respuesta más rápida que el proporcional.',
            feedback:
              'La rapidez la aporta sobre todo el término proporcional (y las ganancias en general). El papel único del integral es ANULAR el error de estado estacionario acumulándolo — no principalmente acelerar. De hecho, demasiada acción integral puede volver la respuesta más lenta u oscilatoria.',
          },
          {
            label: 'Porque limita la corriente máxima.',
            feedback:
              'La limitación de corriente la hace la saturación del lazo interno (Imax), no el término integral. El integral se encarga de eliminar el error de velocidad en régimen, garantizando exactitud pese a la carga.',
          },
        ]}
      />

      <FeynmanCheck
        id="c10s5-check-cascada"
        question="¿Por qué se usa un lazo de corriente ANIDADO dentro del lazo de velocidad, en vez de un solo lazo de velocidad que fije la tensión directamente?"
        options={[
          {
            label: 'Para poder LIMITAR la corriente (y por tanto el par) de forma directa y proteger el hardware, aprovechando que el lazo de corriente es mucho más rápido que el de velocidad.',
            correct: true,
            feedback:
              'Correcto. Al controlar la corriente como variable intermedia, se la puede saturar a ±Imax de forma limpia: el lazo de velocidad pide una corriente, y el interno nunca deja que supere el límite, protegiendo transistores y escobillas y acotando el par (arranque suave). Además, como τe ≪ τm, el lazo de corriente se cierra casi instantáneamente desde el punto de vista del de velocidad, así que ambos se diseñan por separado. Un solo lazo tensión→velocidad no permitiría limitar la corriente con esa precisión.',
          },
          {
            label: 'Porque con un solo lazo el motor no giraría.',
            feedback:
              'Un solo lazo de velocidad sí funcionaría en principio, pero no permitiría limitar la corriente/par con precisión ni protegería el hardware tan bien. La cascada existe por la limitación de corriente y por la separación de escalas de tiempo, no porque sea imposible sin ella.',
          },
          {
            label: 'Porque el lazo de velocidad no puede medir la velocidad.',
            feedback:
              'El lazo de velocidad sí mide la velocidad (con un tacómetro o encoder). La razón de la cascada es controlar y LIMITAR la corriente como variable interna, aprovechando su rapidez frente a la mecánica.',
          },
        ]}
      />

      <SolvedProblem
        id="c10s5-problema-drive"
        numero="46"
        title="Diseño conceptual del control en cascada"
        statement={
          <>
            Se quiere que un motor de CC siga una rampa de velocidad sin superar 2× su corriente nominal
            y sin error de velocidad en régimen. Explique <strong>(a)</strong> qué hace cada lazo,{' '}
            <strong>(b)</strong> por qué el orden (corriente dentro de velocidad) y no al revés, y{' '}
            <strong>(c)</strong> qué garantiza la exactitud final.
          </>
        }
        steps={[
          {
            title: '(a) Los dos lazos',
            why: 'Cada uno controla una variable a su escala de tiempo.',
            work: `\\text{externo (lento): } \\omega \\to i_a^{ref} \\quad\\text{interno (rápido): } i_a \\to v_a`,
            note: 'El de velocidad decide cuánta corriente/par hace falta; el de corriente la ejecuta y la limita.',
          },
          {
            title: '(b) Por qué corriente dentro de velocidad',
            why: 'Se anida el lazo RÁPIDO dentro del lento (τe ≪ τm), y se limita la variable que hay que proteger (corriente/par).',
            work: `\\tau_e \\ll \\tau_m \\;\\Rightarrow\\; \\text{el lazo de corriente se cierra «al instante» para el de velocidad}`,
            note: 'Limitar la corriente a ±2·Inom protege los transistores y acota el par: arranque suave, sin tirones.',
          },
          {
            title: '(c) La exactitud',
            why: 'El término integral del lazo de velocidad anula el error en régimen.',
            work: `K_i\\!\\int e_\\omega\\,dt \\;\\Rightarrow\\; e_\\omega \\to 0 \\text{ en r\\'egimen, pese a la carga}`,
            note: 'Ante un cambio de carga, la velocidad se desvía un instante y el integrador la devuelve exacta a la referencia.',
          },
        ]}
        answer={`\\text{externo: } \\omega\\to i_a^{ref}\\ (\\text{con límite } \\pm 2 I_{nom}); \\text{ interno: } i_a\\to v_a\\ (\\text{rápido}); \\text{ el integral } \\Rightarrow e_\\omega\\to 0`}
        takeaway="El variador de CC anida un lazo rápido de corriente (limita corriente y par, protege el hardware) dentro de un lazo lento de velocidad (sigue la referencia). La separación τe ≪ τm lo hace posible, y el término integral garantiza velocidad exacta pese a la carga."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C10 Sección 5 · Cierre del capítulo
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Lazo cerrado con PI: el término integral garantiza velocidad exacta (error de régimen cero) pese a la carga.</li>
          <li>Lazo interno de corriente: limita corriente y par (protege el variador, arranque suave); lazo externo de velocidad: sigue la rampa.</li>
          <li>La separación <InlineMath latex="\tau_e \ll \tau_m" /> (Sección 2) es lo que permite anidar los dos lazos — cierra el arco del capítulo, del modelo dinámico al control.</li>
        </ul>
      </div>
    </section>
  )
}
