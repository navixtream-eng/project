import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import MachineConstantLab from '../widgets/MachineConstantLab'
import { dcEmf, dcKa, dcTorque, fmt } from '../lib/machine'

/** Capítulo 9, Sección 2 — Las ecuaciones de acoplamiento electromecánico. */
export default function C9Section2() {
  const P = 4
  const Z = 500
  const a = 2
  const Ka = dcKa(P, Z, a)
  const phi = 0.02
  const rpm = 1200
  const omega = (rpm * 2 * Math.PI) / 60
  const Ia = 40
  const Ea = dcEmf(Ka, phi, omega)
  const T = dcTorque(Ka, phi, Ia)

  return (
    <section id="c9-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Capítulo 9 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Las ecuaciones de acoplamiento: una constante, dos conversiones
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Toda la máquina de CC se resume en dos ecuaciones gemelas — FEM y par — que comparten
          exactamente el mismo factor Ka·Φ. Ahí vive la conversión de energía.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · La constante de la armadura Ka"
        idea="Ka es un número puramente GEOMÉTRICO: cuenta cuántos conductores (Z) hay, en cuántos caminos paralelos (a) se reparten, y cuántos polos (P) barren. No depende de la velocidad ni de la corriente: es una propiedad de cómo está bobinada la máquina, fija de fábrica."
        analogy="Ka es como la cilindrada de un motor: una cifra de construcción que no cambia con las revoluciones ni con el acelerador. Define cuánto «agarre» electromagnético tiene la máquina por cada weber de flujo."
      >
        <Formula
          latex="K_a = \frac{P\,Z}{2\pi\,a}"
          symbols={[
            { sym: 'P', meaning: 'Número de polos: cuántos pares N-S barren la armadura. Más polos, más «empujones» por vuelta.' },
            { sym: 'Z', meaning: 'Número total de conductores de la armadura. Más conductores, más FEM y más par por weber.' },
            { sym: 'a', meaning: 'Número de caminos (trayectorias) paralelos del devanado. Reparte los conductores: más caminos → cada uno lleva menos corriente y aporta menos FEM.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · La FEM y el par: gemelas de Ka·Φ"
        idea="La FEM inducida es Ea = Ka·Φ·ω (tensión proporcional a la velocidad), y el par desarrollado es T = Ka·Φ·Ia (par proporcional a la corriente). Fíjate: el MISMO factor Ka·Φ multiplica en un caso a la velocidad para dar tensión, y en el otro a la corriente para dar par. Es la firma de que ambas son la misma conversión vista desde los dos lados."
        analogy="Una palanca con brazo fijo (Ka·Φ): de un lado convierte velocidad en voltaje; del otro, corriente en fuerza. El brazo es el mismo; solo cambias qué empujas."
      >
        <Formula
          latex="E_a = K_a\,\Phi\,\omega_m \qquad\qquad T_{mech} = K_a\,\Phi\,I_a"
          symbols={[
            { sym: 'E_a = K_a\\Phi\\omega_m', meaning: 'FEM inducida: crece con el flujo Φ y con la velocidad ωm. Es la tensión que la máquina «quiere» tener; el motor la ve como una contra-FEM que se opone a Vt.' },
            { sym: 'T_{mech} = K_a\\Phi I_a', meaning: 'Par electromagnético: crece con el flujo Φ y con la corriente de armadura Ia. Es la fuerza que la máquina desarrolla en el eje.' },
            { sym: 'K_a\\Phi', meaning: 'El factor compartido: mismo número en ambas ecuaciones. Controlar el flujo (excitación) es la perilla común que mueve TANTO la tensión como el par.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="2.3 · La potencia se conserva: Ea·Ia = T·ω"
        idea="Multiplica las dos ecuaciones cruzadas: la potencia eléctrica convertida en el entrehierro, Ea·Ia, es idéntica a la potencia mecánica desarrollada, T·ωm. El factor Ka·Φ se cancela — la máquina no crea ni destruye energía, solo la transforma de eléctrica a mecánica (o al revés)."
        analogy="Una caja de cambios ideal: la potencia que entra por un eje sale igual por el otro; solo se reparte distinto entre fuerza y velocidad. Ka·Φ es la relación de la caja."
      >
        <Formula
          latex="P_{conv} = E_a I_a = (K_a\Phi\,\omega_m) I_a = \omega_m (K_a\Phi\,I_a) = T\,\omega_m"
          symbols={[
            { sym: 'E_a I_a', meaning: 'Potencia eléctrica desarrollada: la que cruza del circuito eléctrico al mecánico en el entrehierro. NO es la potencia de entrada (falta restar las pérdidas de cobre).' },
            { sym: 'T\\omega_m', meaning: 'Potencia mecánica desarrollada: la misma cantidad, expresada como par por velocidad. La igualdad es exacta porque Ka·Φ se cancela.' },
          ]}
        />
      </ConceptBlock>

      <MachineConstantLab />

      <FeynmanCheck
        id="c9s2-check-ka"
        question="La constante Ka = P·Z/(2π·a) de una máquina, ¿de qué depende?"
        options={[
          {
            label: 'Solo de la geometría del bobinado (polos, conductores, caminos paralelos): es fija de fábrica, no cambia con velocidad ni carga.',
            correct: true,
            feedback:
              'Exacto. Ka cuenta P (polos), Z (conductores) y a (caminos paralelos): todo construcción. Es un número constante de la máquina. Lo que SÍ varía en operación es el flujo Φ (por la excitación) y, con él, el producto Ka·Φ — pero Ka a secas es inmutable.',
          },
          {
            label: 'De la velocidad de giro y la corriente de armadura.',
            feedback:
              'Esos son variables de OPERACIÓN (ω, Ia) que aparecen en Ea y T, pero no en Ka. Ka es puramente geométrico: P·Z/(2π·a). Confundirlo con las variables de operación es un error común.',
          },
          {
            label: 'Del flujo del campo Φ.',
            feedback:
              'El flujo Φ es un factor SEPARADO que multiplica a Ka en las ecuaciones (Ea = Ka·Φ·ω). Ka no incluye Φ: es solo la geometría del devanado. Por eso el control por campo actúa sobre Φ, no sobre Ka.',
          },
        ]}
      />

      <FeynmanCheck
        id="c9s2-check-dualidad"
        question="¿Por qué se dice que Ea = Ka·Φ·ω y T = Ka·Φ·Ia son «la misma ecuación vista desde dos lados»?"
        options={[
          {
            label: 'Porque comparten el factor Ka·Φ, y al multiplicarlas cruzadas se obtiene Ea·Ia = T·ω: la potencia eléctrica desarrollada es idéntica a la mecánica.',
            correct: true,
            feedback:
              'Correcto. El mismo Ka·Φ convierte velocidad en tensión (lado eléctrico) y corriente en par (lado mecánico). Su producto cruzado da la conservación de potencia Ea·Ia = T·ωm, con Ka·Φ cancelándose. Son las dos caras de una única conversión electromecánica — controlas el flujo y mueves ambas a la vez.',
          },
          {
            label: 'Porque la FEM y el par siempre tienen el mismo valor numérico.',
            feedback:
              'No tienen el mismo valor (una está en volts, la otra en N·m). Lo que comparten es el FACTOR Ka·Φ y la conservación de potencia Ea·Ia = T·ω — no el valor numérico de FEM y par.',
          },
          {
            label: 'Porque ambas dependen de la resistencia de armadura.',
            feedback:
              'Ni Ea ni T contienen Ra: son la FEM inducida y el par desarrollado en el entrehierro, anteriores a la caída resistiva. Lo que las hermana es Ka·Φ y la igualdad de potencias, no la resistencia.',
          },
        ]}
      />

      <SolvedProblem
        id="c9s2-problema-ka"
        numero="38"
        title="FEM, par y potencia de una máquina de CC"
        statement={
          <>
            Una máquina de CC de <strong>{P} polos</strong> con <strong>Z = {Z} conductores</strong> en{' '}
            <strong>a = {a} caminos</strong> paralelos tiene un flujo por polo de <strong>{phi} Wb</strong>.
            Gira a <strong>{rpm} r/min</strong> con una corriente de armadura de <strong>{Ia} A</strong>.
            Halle <strong>(a)</strong> la constante Ka, <strong>(b)</strong> la FEM inducida,{' '}
            <strong>(c)</strong> el par, y <strong>(d)</strong> verifique la conservación de potencia.
          </>
        }
        steps={[
          {
            title: '(a) La constante de la armadura',
            why: 'Puramente geométrica: polos por conductores, entre 2π por caminos.',
            work: `K_a = \\frac{P\\,Z}{2\\pi\\,a} = \\frac{${P}\\times ${Z}}{2\\pi\\times ${a}} = ${fmt(Ka, 1)}`,
          },
          {
            title: '(b) La FEM inducida',
            why: 'Ea = Ka·Φ·ω, con ω en rad/s (convierte las r/min).',
            work: `\\omega = \\frac{2\\pi\\times ${rpm}}{60} = ${fmt(omega, 1)}\\ \\text{rad/s} \\;\\Rightarrow\\; E_a = ${fmt(Ka, 1)}\\times ${phi}\\times ${fmt(omega, 1)} = ${fmt(Ea, 0)}\\ \\text{V}`,
          },
          {
            title: '(c) El par desarrollado',
            why: 'El mismo Ka·Φ, ahora por la corriente de armadura.',
            work: `T = K_a\\Phi I_a = ${fmt(Ka, 1)}\\times ${phi}\\times ${Ia} = ${fmt(T, 1)}\\ \\text{N·m}`,
          },
          {
            title: '(d) Conservación de potencia',
            why: 'La potencia eléctrica desarrollada debe igualar la mecánica.',
            work: `E_a I_a = ${fmt(Ea, 0)}\\times ${Ia} = ${fmt((Ea * Ia) / 1000, 2)}\\ \\text{kW} \\;=\\; T\\omega = ${fmt(T, 1)}\\times ${fmt(omega, 1)} = ${fmt((T * omega) / 1000, 2)}\\ \\text{kW} \\checkmark`,
          },
        ]}
        answer={`K_a = ${fmt(Ka, 1)} \\quad E_a = ${fmt(Ea, 0)}\\ \\text{V} \\quad T = ${fmt(T, 1)}\\ \\text{N·m} \\quad E_a I_a = T\\omega = ${fmt((Ea * Ia) / 1000, 2)}\\ \\text{kW}`}
        takeaway="Ka es geometría pura; Ka·Φ es el factor que gobierna a la vez la FEM (por la velocidad) y el par (por la corriente). Su producto cruzado da la conservación exacta Ea·Ia = T·ω."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C9 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li><InlineMath latex="K_a = PZ/2\pi a" /> es geometría pura: fija de fábrica, sin velocidad ni corriente.</li>
          <li><InlineMath latex="E_a = K_a\Phi\omega" /> y <InlineMath latex="T = K_a\Phi I_a" /> comparten Ka·Φ: una conversión, dos caras.</li>
          <li>Su producto cruzado da <InlineMath latex="E_a I_a = T\omega" />: la potencia se conserva, Ka·Φ se cancela.</li>
        </ul>
      </div>
    </section>
  )
}
