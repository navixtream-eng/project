import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DcDynamicLab from '../widgets/DcDynamicLab'
import { DEFAULT_DCDYN, dcStartCurrent, dcTimeConstants, fmt } from '../lib/machine'

/** Capítulo 10, Sección 1 — Modelado matemático en el dominio del tiempo. */
export default function C10Section1() {
  const p = DEFAULT_DCDYN
  const { taue, taum } = dcTimeConstants(p)
  const Iarr = dcStartCurrent(p.Vt, p.Ra)

  return (
    <section id="c10-seccion-1" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
          Capítulo 10 · Sección 1
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Modelado dinámico: las dos ecuaciones diferenciales acopladas
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Fuera del estado estacionario, la máquina de CC es un sistema dinámico: una ecuación eléctrica
          (con inductancia) y una mecánica (con inercia), acopladas por el par y la FEM.
        </p>
      </header>

      <ConceptBlock
        title="1.1 · La ecuación eléctrica: la inductancia entra en juego"
        idea="En régimen permanente se ignora la inductancia de armadura La porque di/dt = 0. Pero en un transitorio la corriente CAMBIA, y La almacena energía en su campo magnético: la tensión aplicada debe vencer la resistencia (Ra·ia), la caída inductiva (La·di/dt) Y la contra-FEM (ea = Ka·Φ·ω). La inductancia hace que la corriente no pueda saltar: sube con una constante de tiempo."
        analogy="Empujar un carrito con un resorte de por medio (La): no responde instantáneamente a tu empujón, sino que la fuerza se acumula gradualmente. En régimen el resorte está quieto; en un tirón brusco, importa."
      >
        <Formula
          latex="v_a(t) = R_a\,i_a(t) + L_a\frac{di_a(t)}{dt} + e_a(t), \qquad e_a = K_a\Phi\,\omega_m"
          symbols={[
            { sym: 'L_a\\frac{di_a}{dt}', meaning: 'El término dinámico: la tensión que consume la inductancia al cambiar la corriente. En régimen permanente vale cero; en un transitorio, es lo que impide que la corriente salte.' },
            { sym: 'e_a = K_a\\Phi\\omega_m', meaning: 'La contra-FEM: crece con la velocidad y se opone a Vt. A rotor parado vale CERO — por eso el arranque tiene corriente enorme.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="1.2 · La ecuación mecánica: la inercia y la fricción"
        idea="El par electromagnético desarrollado (Ka·Φ·ia) menos el par de la carga acelera la masa giratoria: el resto se reparte entre acelerar la inercia J (J·dω/dt) y vencer la fricción viscosa (B·ω). Es la segunda ley de Newton en versión rotacional. La inercia hace que la velocidad tampoco pueda saltar."
        analogy="Un volante pesado (J): por más par que le apliques, tarda en cambiar de velocidad. La fricción (B) es el rozamiento del aire que además se lleva una parte proporcional a la velocidad."
      >
        <Formula
          latex="t_{mech}(t) - t_{carga}(t) = J\frac{d\omega_m(t)}{dt} + B\,\omega_m(t), \qquad t_{mech} = K_a\Phi\,i_a"
          symbols={[
            { sym: 'J\\frac{d\\omega_m}{dt}', meaning: 'El par que se invierte en ACELERAR la inercia. Cuanto mayor J, más lento cambia la velocidad — la inercia es la «memoria» mecánica del rotor.' },
            { sym: 'B\\,\\omega_m', meaning: 'El par de fricción viscosa: proporcional a la velocidad. Es una pérdida y también una forma de amortiguamiento natural.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="1.3 · El acoplamiento: por qué el arranque pica en corriente"
        idea="Las dos ecuaciones están ENLAZADAS: la corriente crea el par (que acelera), y la velocidad crea la FEM (que frena la corriente). Al arrancar (ω = 0), no hay FEM, así que la corriente sube gobernada solo por Ra y La → pico enorme. Conforme el motor acelera, la FEM crece y «cierra el grifo» de la corriente, que baja a su valor de régimen."
        analogy="Una llave de agua sin contrapresión al principio (chorro máximo) que se va cerrando sola a medida que llena el tanque (la FEM sube). El pico inicial es porque el tanque está vacío."
      >
        <p>
          Con los parámetros del laboratorio, la corriente de arranque a rotor bloqueado sería{' '}
          <InlineMath latex={`I_{arr} = V_t/R_a = ${fmt(Iarr, 0)}`} /> A, y las escalas de tiempo son
          τe ≈ {fmt(taue * 1000, 1)} ms (eléctrica) y τm ≈ {fmt(taum * 1000, 1)} ms (mecánica). Juega con
          el laboratorio y observa el pico de corriente y el arrastre de la velocidad.
        </p>
      </ConceptBlock>

      <DcDynamicLab />

      <FeynmanCheck
        id="c10s1-check-inductancia"
        question="¿Por qué el término La·di/dt no aparece en el circuito equivalente de estado estacionario del Cap. 9, pero sí importa aquí?"
        options={[
          {
            label: 'Porque en régimen permanente la corriente es constante (di/dt = 0), así que La·di/dt se anula; en un transitorio la corriente cambia y ese término gobierna qué tan rápido puede hacerlo.',
            correct: true,
            feedback:
              'Exacto. El circuito equivalente del Cap. 9 asume régimen: di/dt = 0 y la inductancia es invisible (una inductancia con corriente constante no cae tensión). Pero en arranques, escalones o fallas, la corriente CAMBIA, y La·di/dt se vuelve central: es lo que le da a la corriente su constante de tiempo τe = La/Ra e impide que salte instantáneamente.',
          },
          {
            label: 'Porque la inductancia solo existe durante los transitorios.',
            feedback:
              'La inductancia física está siempre presente. Lo que cambia es si IMPORTA: con corriente constante (régimen) no cae tensión en ella (La·di/dt = 0), pero con corriente variable (transitorio) sí. La inductancia no aparece ni desaparece; su EFECTO depende de di/dt.',
          },
          {
            label: 'Porque en régimen la resistencia domina y en transitorio no hay resistencia.',
            feedback:
              'La resistencia Ra está presente en ambos casos. La diferencia es el término La·di/dt: nulo en régimen (di/dt=0), decisivo en transitorio. No es que desaparezca Ra, es que aparece el término dinámico.',
          },
        ]}
      />

      <FeynmanCheck
        id="c10s1-check-acoplamiento"
        question="Al arrancar un motor de CC en directo, la corriente de armadura pica muy alto y luego baja. ¿Qué la hace bajar?"
        options={[
          {
            label: 'La contra-FEM (Ea = Ka·Φ·ω): al arrancar ω = 0 y no hay FEM, así que la corriente solo la limita Ra; al ganar velocidad, la FEM crece y resta a Vt, reduciendo la corriente.',
            correct: true,
            feedback:
              'Correcto. Es el acoplamiento entre las dos ecuaciones. En t = 0, ω = 0 → Ea = 0 → ia = (Vt − 0)/Ra, enorme. Ese pico de corriente da un gran par que acelera el rotor; al subir ω, sube Ea = Ka·Φ·ω, que se opone a Vt y hace caer la corriente (ia = (Vt − Ea)/Ra) hasta el valor de régimen que pide la carga. La velocidad se «autorregula» cerrando el grifo de corriente.',
          },
          {
            label: 'La resistencia de armadura aumenta con la temperatura al calentarse.',
            feedback:
              'El calentamiento sube Ra algo, pero es lento y menor. La caída rápida de la corriente en el arranque (milisegundos) la produce la contra-FEM que crece con la velocidad, no el calentamiento.',
          },
          {
            label: 'La inductancia La consume toda la corriente.',
            feedback:
              'La inductancia frena la SUBIDA inicial de la corriente (le da su τe), pero no la hace bajar en régimen: una vez establecida, La·di/dt → 0. Lo que reduce la corriente al valor de trabajo es la contra-FEM creciente.',
          },
        ]}
      />

      <SolvedProblem
        id="c10s1-problema-modelo"
        numero="42"
        title="Las ODE y la corriente de arranque"
        statement={
          <>
            Un motor de CC (Vt = {p.Vt} V, Ra = {p.Ra} Ω, La = {fmt(p.La * 1000, 0)} mH, Ka·Φ ={' '}
            {p.kPhi} V·s/rad, J = {p.J} kg·m², B = {p.B}) arranca en directo. Halle <strong>(a)</strong>{' '}
            la corriente de arranque a rotor bloqueado, <strong>(b)</strong> por qué no es infinita pese
            a La, y <strong>(c)</strong> plantee las dos ecuaciones diferenciales.
          </>
        }
        steps={[
          {
            title: '(a) Corriente de arranque (ω = 0)',
            why: 'A rotor parado no hay contra-FEM: la corriente solo la limita la resistencia de armadura.',
            work: `I_{arr} = \\frac{V_t - E_a}{R_a} = \\frac{${p.Vt} - 0}{${p.Ra}} = ${fmt(Iarr, 0)}\\ \\text{A}`,
            note: 'Muchas veces la corriente nominal — de ahí la necesidad de arrancadores (Sección 4).',
          },
          {
            title: '(b) Por qué La no la hace infinita',
            why: 'La inductancia impide que la corriente salte: sube gradualmente con τe = La/Ra, tendiendo a Vt/Ra (no infinito). El límite lo pone Ra, no La.',
            work: `\\tau_e = \\frac{L_a}{R_a} = \\frac{${fmt(p.La, 3)}}{${p.Ra}} = ${fmt((p.La / p.Ra) * 1000, 1)}\\ \\text{ms}`,
          },
          {
            title: '(c) El sistema de ecuaciones',
            why: 'Dos estados (ia, ω) acoplados por el par (Ka·Φ·ia) y la FEM (Ka·Φ·ω).',
            work: `L_a\\dot{i_a} = V_t - R_a i_a - K_a\\Phi\\,\\omega, \\qquad J\\dot{\\omega} = K_a\\Phi\\,i_a - t_{carga} - B\\omega`,
            note: 'Este sistema de 2.º orden es la base de todo el capítulo: constantes de tiempo, función de transferencia, transitorios y control.',
          },
        ]}
        answer={`I_{arr} = V_t/R_a = ${fmt(Iarr, 0)}\\ \\text{A}, \\quad \\tau_e = ${fmt((p.La / p.Ra) * 1000, 1)}\\ \\text{ms}; \\quad L_a\\dot{i_a}=V_t-R_a i_a-K_a\\Phi\\omega,\\ J\\dot\\omega=K_a\\Phi i_a - t_L - B\\omega`}
        takeaway="Fuera del régimen, la máquina de CC son dos ODE acopladas: eléctrica (con La) y mecánica (con J), enlazadas por el par y la FEM. El arranque pica en corriente porque a ω = 0 no hay contra-FEM."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C10 Sección 1
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Eléctrica: <InlineMath latex="v_a = R_a i_a + L_a\dot{i_a} + K_a\Phi\omega" /> — La importa cuando la corriente cambia.</li>
          <li>Mecánica: <InlineMath latex="K_a\Phi i_a - t_L = J\dot\omega + B\omega" /> — J hace que la velocidad no salte.</li>
          <li>Acopladas: el arranque pica en corriente (ω = 0 ⇒ sin FEM), y la FEM creciente la va cerrando.</li>
        </ul>
      </div>
    </section>
  )
}
