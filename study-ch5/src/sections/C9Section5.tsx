import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import DcPowerLab from '../widgets/DcPowerLab'
import { DEFAULT_DC, dcPowerFlow, fmt } from '../lib/machine'

/** Capítulo 9, Sección 5 — Flujo de potencia, pérdidas y eficiencia. */
export default function C9Section5() {
  const p = DEFAULT_DC
  const Ia = 40
  const r = dcPowerFlow('shunt', p, Ia, false)

  return (
    <section id="c9-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
          Capítulo 9 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Flujo de potencia, pérdidas y rendimiento
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Del enchufe al eje, la potencia paga peajes: cobre, hierro, fricción y las escurridizas
          pérdidas indeterminadas. El corazón de la conversión es Ea·Ia.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · El árbol de potencia: de eléctrica a mecánica"
        idea="Como MOTOR: entra la potencia eléctrica Pin = Vt·(Ia + If). Se resta el cobre de armadura (Ia²Ra) y del campo, y lo que queda es la potencia DESARROLLADA en el entrehierro, Pdev = Ea·Ia. De ahí se restan las pérdidas rotacionales (núcleo + fricción y ventilación) y las indeterminadas, y sale la potencia útil en el eje. Como GENERADOR, el mismo árbol se recorre al revés: entra potencia mecánica, sale eléctrica."
        analogy="Un sueldo (Pin) del que descuentan impuestos de cobre, comisión del hierro y gastos fijos de fricción; lo que llega al bolsillo (eje) es Pout. El «bruto antes de descuentos rotacionales» es Ea·Ia."
      >
        <Formula
          latex="P_{in} = V_t(I_a+I_f) \;\to\; P_{dev}=E_a I_a \;\to\; P_{eje}=P_{dev}-P_{rot}-P_{stray}"
          symbols={[
            { sym: 'P_{dev}=E_a I_a', meaning: 'Potencia desarrollada (electromecánica) en el entrehierro: la que realmente cruza de eléctrica a mecánica. Igual a T·ωm.' },
            { sym: 'P_{rot}', meaning: 'Pérdidas rotacionales: núcleo (histéresis + Foucault en el hierro de la armadura) más fricción de rodamientos y escobillas y ventilación. Casi constantes con la carga.' },
            { sym: 'P_{stray}', meaning: 'Pérdidas indeterminadas (stray load): las difíciles de calcular (flujos de dispersión, distorsión por reacción de armadura). Se estiman como ~1 % de la potencia.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.2 · La clasificación de pérdidas"
        idea="Cuatro familias. COBRE (I²R): en la armadura y el campo, crecen con el CUADRADO de la corriente — dominan a plena carga. NÚCLEO: histéresis y corrientes parásitas en el hierro, dependen del flujo y la velocidad, casi constantes. MECÁNICAS: fricción (rodamientos, escobillas) y ventilación, dependen de la velocidad. INDETERMINADAS (stray): el cajón de sastre de lo que no se modela fácil."
        analogy="Las pérdidas de un coche: el consumo por aceleración (cobre, ∝ esfuerzo²), el ralentí del motor (núcleo, casi fijo), el rozamiento del aire y las ruedas (mecánicas, ∝ velocidad) y las mil fugas pequeñas (stray)."
      >
        <Formula
          latex="P_{p\'erdidas} = \underbrace{I_a^2 R_a + V_t I_f}_{\text{cobre}} + \underbrace{P_{n\'ucleo}}_{\text{hierro}} + \underbrace{P_{fricci\'on}}_{\text{mec\'anicas}} + \underbrace{P_{stray}}_{\text{indeterm.}}"
          symbols={[
            { sym: 'I_a^2 R_a', meaning: 'Pérdida de cobre de armadura: cuadrática con la corriente. Es la que más crece al cargar y la que define el calentamiento del motor.' },
            { sym: 'P_{n\\\'ucleo}', meaning: 'Pérdidas en el hierro: histéresis (∝ f) + Foucault (∝ f²), del Cap. 1. Casi constantes porque flujo y velocidad varían poco.' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="5.3 · El rendimiento y su pico"
        idea="El rendimiento es η = Pout/Pin. Como hay pérdidas FIJAS (núcleo, fricción) y pérdidas VARIABLES (cobre, ∝ Ia²), el rendimiento es bajo en vacío (las fijas se comen todo lo poco que se produce) y también cae a plena carga (el cobre cuadrático dispara las pérdidas). El máximo está en el punto intermedio donde las pérdidas variables igualan a las fijas — el mismo principio que en el transformador y la máquina de inducción."
        analogy="El punto dulce de un coche: gasta mucho por km parado en atasco (fijas dominan) y mucho a toda velocidad (arrastre cuadrático); consume menos por km a velocidad de crucero intermedia."
      >
        <p>
          En el laboratorio, este motor a Ia = {Ia} A tiene Pdev = {fmt(r.Pdev / 1000, 1)} kW, Pout ={' '}
          {fmt(r.Pout / 1000, 1)} kW y η = {fmt(r.eff * 100, 1)} %. Barre la carga y localiza el pico.
        </p>
      </ConceptBlock>

      <DcPowerLab />

      <FeynmanCheck
        id="c9s5-check-flujo"
        question="En un motor de CC, ¿qué representa la potencia desarrollada Pdev = Ea·Ia dentro del árbol de potencia?"
        options={[
          {
            label: 'La potencia que CRUZA de eléctrica a mecánica en el entrehierro: es la de entrada MENOS el cobre, y de ella todavía hay que restar núcleo, fricción y stray para llegar al eje.',
            correct: true,
            feedback:
              'Exacto. Ea·Ia (= T·ωm) es la potencia electromecánica desarrollada: ya se le quitaron las pérdidas de cobre a la entrada, pero aún NO las rotacionales. Es el «puente» entre los dos mundos. Pout (eje) = Pdev − Prot − Pstray. Confundir Pdev con Pout es un error clásico: entre ambas están todas las pérdidas rotacionales.',
          },
          {
            label: 'La potencia útil que sale por el eje.',
            feedback:
              'Casi, pero no: Pdev es la potencia desarrollada en el entrehierro, ANTES de restar las pérdidas rotacionales (núcleo + fricción + ventilación) y las indeterminadas. La potencia del eje es Pout = Pdev − Prot − Pstray, menor que Pdev.',
          },
          {
            label: 'La potencia total de entrada del motor.',
            feedback:
              'La entrada es Pin = Vt·(Ia+If). Pdev = Ea·Ia es MENOR: ya se descontaron las pérdidas de cobre (la caída Ia·Ra hace que Ea < Vt). Pdev está en medio del árbol, no en la entrada.',
          },
        ]}
      />

      <FeynmanCheck
        id="c9s5-check-perdidas"
        question="¿Por qué el rendimiento de un motor de CC es bajo tanto en vacío como a plena carga, con un máximo en medio?"
        options={[
          {
            label: 'Porque hay pérdidas FIJAS (núcleo, fricción) que dominan en vacío, y pérdidas VARIABLES (cobre ∝ Ia²) que se disparan a plena carga; el máximo está donde variables = fijas.',
            correct: true,
            feedback:
              'Correcto. En vacío se produce poca potencia útil pero las pérdidas fijas (núcleo + fricción) siguen ahí, así que η es bajo. A plena carga, las pérdidas de cobre crecen con Ia² y vuelven a comerse el rendimiento. El óptimo está en el punto intermedio donde las pérdidas variables igualan a las fijas — el mismo teorema del rendimiento máximo del transformador y del motor de inducción.',
          },
          {
            label: 'Porque la tensión de entrada cambia con la carga.',
            feedback:
              'La tensión de terminales se mantiene esencialmente constante (es la red). Lo que hace la curva de rendimiento con forma de campana es la combinación de pérdidas fijas (dominan en vacío) y variables cuadráticas (dominan a plena carga), no un cambio de tensión.',
          },
          {
            label: 'Porque a plena carga el flujo se satura.',
            feedback:
              'La saturación existe pero no es la causa principal de la caída de rendimiento a plena carga: esa la provocan las pérdidas de cobre I²R, cuadráticas con la corriente. El máximo de η aparece donde esas pérdidas variables igualan a las fijas.',
          },
        ]}
      />

      <SolvedProblem
        id="c9s5-problema-eficiencia"
        numero="41"
        title="Balance de potencia y rendimiento de un motor de CC"
        statement={
          <>
            Un motor de CC shunt (Vt = {p.Vt} V, Ra = {p.Ra} Ω, If = {p.If} A, pérdidas rotacionales{' '}
            {p.Prot} W) trabaja con Ia = {Ia} A. Halle <strong>(a)</strong> la potencia de entrada,{' '}
            <strong>(b)</strong> las pérdidas de cobre y la potencia desarrollada, <strong>(c)</strong>{' '}
            la potencia en el eje y <strong>(d)</strong> el rendimiento.
          </>
        }
        steps={[
          {
            title: '(a) Potencia de entrada',
            why: 'La red alimenta la armadura y el campo shunt.',
            work: `P_{in} = V_t(I_a+I_f) = ${p.Vt}\\times(${Ia}+${p.If}) = ${fmt(r.Pin / 1000, 2)}\\ \\text{kW}`,
          },
          {
            title: '(b) Cobre y potencia desarrollada',
            why: 'La caída Ia·Ra reduce la FEM; Pdev = Ea·Ia es lo que cruza al lado mecánico.',
            work: `E_a = V_t - I_a R_a = ${p.Vt}-${Ia}\\times${p.Ra} = ${fmt(r.Ea, 0)}\\ \\text{V}, \\quad P_{dev} = E_a I_a = ${fmt(r.Pdev / 1000, 2)}\\ \\text{kW}`,
            note: `Cobre de armadura I²R = ${fmt(r.PcuArm, 0)} W; cobre de campo Vt·If = ${fmt(r.Pfield, 0)} W.`,
          },
          {
            title: '(c) Potencia en el eje',
            why: 'A la desarrollada se le restan las rotacionales (núcleo+fricción) y las indeterminadas.',
            work: `P_{eje} = P_{dev} - P_{rot} - P_{stray} = ${fmt(r.Pdev / 1000, 2)} - ${fmt(p.Prot / 1000, 2)} - ${fmt(r.Pstray / 1000, 3)} = ${fmt(r.Pout / 1000, 2)}\\ \\text{kW}`,
          },
          {
            title: '(d) Rendimiento',
            why: 'La razón de la potencia útil a la de entrada.',
            work: `\\eta = \\frac{P_{eje}}{P_{in}} = \\frac{${fmt(r.Pout / 1000, 2)}}{${fmt(r.Pin / 1000, 2)}} = ${fmt(r.eff * 100, 1)}\\%`,
            note: 'Barriendo la carga se ve la campana: bajo en vacío (fijas) y a plena carga (cobre), máximo en medio.',
          },
        ]}
        answer={`P_{in} = ${fmt(r.Pin / 1000, 2)}\\ \\text{kW} \\quad P_{dev} = ${fmt(r.Pdev / 1000, 2)}\\ \\text{kW} \\quad P_{eje} = ${fmt(r.Pout / 1000, 2)}\\ \\text{kW} \\quad \\eta = ${fmt(r.eff * 100, 1)}\\%`}
        takeaway="Del enchufe al eje: Pin − cobre = Pdev = Ea·Ia; Pdev − rotacionales − stray = Pout. El rendimiento tiene forma de campana (fijas en vacío, cobre cuadrático a plena carga) con el máximo donde variables = fijas."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C9 Sección 5 · Cierre del capítulo
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Árbol de potencia: <InlineMath latex="P_{in} \to P_{dev}=E_aI_a \to P_{eje}" />, restando cobre, luego núcleo+fricción+stray.</li>
          <li>Cuatro pérdidas: cobre (I²R, cuadrática), núcleo (histéresis+Foucault), mecánicas (fricción+ventilación), indeterminadas.</li>
          <li>El rendimiento es una campana: máximo donde las pérdidas variables (cobre) igualan a las fijas — como en el transformador y la inducción.</li>
        </ul>
      </div>
    </section>
  )
}
