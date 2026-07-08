import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import VoltageLab from '../widgets/VoltageLab'
import TorqueAlignLab from '../widgets/TorqueAlignLab'
import LinearLab from '../widgets/LinearLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 4, Sección 3 — Voltaje generado, el par de alineación,
 * las no-idealidades y el motor desenrollado.
 */
export default function C4Section3() {
  // Problema 18: voltaje generado con la fórmula 4.44
  const F = 60
  const N = 40
  const KW = 0.925
  const PHI = 0.02
  const E = 4.44 * F * N * KW * PHI
  const EL = Math.sqrt(3) * E

  return (
    <section id="c4-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
          Capítulo 4 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Voltaje, par, imperfecciones — y el motor desenrollado
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Los frutos del capítulo: cuánto voltaje induce el campo giratorio, de dónde sale físicamente
          el par, qué estropea el cuento ideal, y qué pasa si cortas la máquina y la estiras.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · El voltaje generado: Faraday con descuentos"
        idea="El flujo por polo Φ barre las bobinas del estator a frecuencia f: el enlace de flujo de cada fase oscila y Faraday cobra su derivada. El resultado compacto: E = 4.44·f·N·kw·Φ voltios eficaces por fase. Cuatro factores lineales y un «4.44» que no es magia — es √2·π/2."
        analogy="Un molino de agua: el caudal (Φ), la velocidad de la corriente (f), el número de aspas (N) y qué tan bien orientadas están (kw). El voltaje es simplemente cuánta agua golpea las aspas por segundo — con Faraday de contador."
      >
        <Formula
          latex="E_{rms} = \frac{2\pi}{\sqrt{2}}\,f\,k_w N_{ph}\,\Phi_p \;=\; 4.44\,f\,k_w N_{ph}\,\Phi_p"
          symbols={[
            { sym: '\\Phi_p', meaning: 'Flujo por polo [Wb]: la integral de la densidad B del entrehierro sobre un paso polar. Es la mercancía que el rotor le presenta a cada bobina.' },
            { sym: 'f', meaning: 'Frecuencia eléctrica = (P/2)·n/60: cuántas veces por segundo cada bobina ve pasar un patrón N-S completo.' },
            { sym: 'k_w N_{ph}', meaning: 'Las vueltas «efectivas» de la fase: las reales multiplicadas por el descuento de distribución/paso de la Sección 2.' },
            { sym: '4.44', meaning: '= √2·π/2: el π/2 sale de derivar el seno (promedio de |cos|), el √2 de pasar de pico a eficaz. El mismo 4.44 del transformador — es la misma ley.' },
          ]}
        />
      </ConceptBlock>

      <VoltageLab />

      <ConceptBlock
        title="3.2 · El par: dos imanes que quieren alinearse"
        idea="Todo el par electromagnético de todas las máquinas es la misma historia: el campo del estator y el del rotor, como dos imanes, tienden a ALINEARSE. El par es proporcional al producto de ambas FMM y al seno del ángulo δ que las separa — máximo a 90°, nulo alineados. Generador: el eje sostiene a δ adelante. Motor: la carga lo cuelga detrás."
        analogy="Dos agujas imantadas superpuestas: suelta una y girará hacia la otra. Toda máquina eléctrica es este juguete, industrializado — con la sutileza de que uno de los «imanes» (el del estator) está girando, así que el otro debe perseguirlo para siempre."
      >
        <Formula
          latex="T = -\frac{\pi}{2}\left(\frac{P}{2}\right)^{2}\Phi_{sr}\,F_r\,\text{sen}\,\delta"
          symbols={[
            { sym: '\\Phi_{sr}', meaning: 'El flujo resultante en el entrehierro (la «cancha» magnética compartida por ambos campos).' },
            { sym: 'F_r', meaning: 'La FMM del rotor. El par es proporcional al PRODUCTO campo×campo: sin cualquiera de los dos, no hay juego.' },
            { sym: '\\text{sen}\\,\\delta', meaning: 'Solo la componente PERPENDICULAR de un campo respecto al otro produce par: alineados (δ=0) nada, en cuadratura (δ=90°) el máximo.' },
            { sym: '-', meaning: 'El signo dice «restaurador»: el par siempre empuja hacia la alineación. De aquí nace el resorte magnético de los Caps. 5 y 6.' },
            { sym: '(P/2)^2', meaning: 'Los polos entran al cuadrado: una vez por convertir par eléctrico en mecánico y otra por la geometría de la FMM.' },
          ]}
        />
      </ConceptBlock>

      <TorqueAlignLab />

      <FeynmanCheck
        id="c4s3-check-torque"
        question="¿Por qué el par es máximo cuando los dos campos están en CUADRATURA (δ = 90°) y no cuando están más separados (δ = 180°)?"
        options={[
          {
            label: 'Porque a 180° los campos se destruyen mutuamente y no queda flujo.',
            feedback:
              'El flujo resultante sí se debilita a 180°, pero el argumento decisivo es geométrico y vale aun con FMMs constantes: ¿qué componente de un campo «jala» tangencialmente al otro?',
          },
          {
            label: 'Porque el par lo produce la componente PERPENDICULAR de un campo respecto al otro (∝ sen δ): a 180° los campos son antiparalelos — colineales otra vez — y el jalón tangencial es cero.',
            correct: true,
            feedback:
              'Igual que empujar una puerta: empuja perpendicular a la hoja y gira; empuja hacia las bisagras (colineal) y nada — aunque empujes el doble. A 180° el equilibrio existe pero es INESTABLE (el δu de los capítulos siguientes). Y a 90° está la cresta: por eso TODAS las curvas P-δ del libro tienen su máximo ahí (salvo cuando la reluctancia mete su sen 2δ).',
          },
          {
            label: 'Es un resultado empírico sin explicación simple.',
            feedback:
              'Tiene la explicación más simple del libro: descompón un campo en componente paralela y perpendicular al otro. La paralela aprieta o afloja (fuerza radial, no par); solo la perpendicular gira. sen δ es eso.',
          },
        ]}
      />

      <ConceptBlock
        title="3.3 · Las letras pequeñas: saturación y dispersión"
        idea="Dos imperfecciones persiguen a toda máquina real. SATURACIÓN: el acero admite flujo casi gratis solo hasta ~1.6-1.8 T; después cada ampere extra de excitación rinde cada vez menos (la esponja empapada del Cap. 5, Sección 5). DISPERSIÓN: parte del flujo de cada devanado se cierra por caminos que NUNCA cruzan el entrehierro — ranuras, cabezas de bobina — y no produce par: solo suma reactancia en serie (la Xal de la Sección 2.2 del Cap. 5)."
        analogy="Un negocio con dos fugas: el proveedor que ya no puede surtir más aunque le pagues más (saturación), y la mercancía que se queda en el almacén sin llegar jamás a la tienda (dispersión). Ninguna arruina el negocio — pero ambas aparecen en TODOS los balances."
      >
        <p>
          Este es el motivo de que ambos temas ya te resulten familiares: la saturación fabricó las
          dos reactancias del ensayo OCC/SCC (C5·S5), y la dispersión es el sumando Xal dentro de la
          Xs consolidada (C5·S2.2). El Capítulo 4 las presenta; el resto del libro las factura.
        </p>
      </ConceptBlock>

      <FeynmanCheck
        id="c4s3-check-dispersion"
        question="El flujo de dispersión no cruza el entrehierro ni produce par. ¿Entonces por qué NO es inofensivo?"
        options={[
          {
            label: 'Porque calienta el hierro por histéresis hasta dañarlo.',
            feedback:
              'Contribuye algo a las pérdidas del hierro, pero su efecto principal no es térmico — es CIRCUITAL. Pregúntate qué le agrega al modelo de la máquina un flujo que enlaza al devanado pero no hace trabajo.',
          },
          {
            label: 'Porque enlaza al devanado sin producir nada: es inductancia pura en serie — la reactancia de dispersión que se come tensión bajo carga y limita las corrientes.',
            correct: true,
            feedback:
              'Flujo que enlaza = inductancia; inductancia sin conversión de energía = reactancia en serie (Xal). Sus dos caras: la MALA — caída de tensión y consumo de reactivos bajo carga; la BUENA — es lo único que limita la corriente en los primeros instantes de una falla (la X″d del Cap. 6 es, en gran parte, dispersión). La imperfección que también te salva.',
          },
          {
            label: 'Porque desmagnetiza el rotor lentamente.',
            feedback:
              'No desmagnetiza nada: simplemente viaja por caminos privados (ranura, cabeza de bobina) sin cruzar al otro lado. Su factura es la reactancia serie Xal — visible en toda Xs y protagonista de las reactancias subtransitorias.',
          },
        ]}
      />

      <ConceptBlock
        title="3.4 · El motor desenrollado: máquinas lineales"
        idea="Corta el estator por un costado, desenróllalo y pégalo al piso: el campo GIRATORIO se convierte en un campo VIAJERO que recorre el riel a v = 2·τ·f (dos pasos polares por ciclo). Una placa conductora encima hace de rotor plano: la arrastra la misma física de siempre, sin una sola pieza girando. Así empujan los trenes maglev y los actuadores lineales."
        analogy="La ola del estadio, versión pasillo: los espectadores ahora están sentados en una fila recta y la ola corre de un extremo al otro. Mismo truco de coordinación temporal — geometría distinta."
      >
        <LinearLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c4s3-check-lineal"
        question="En la máquina lineal, la velocidad de la onda es v = 2·τ·f. ¿De dónde sale el «2»?"
        options={[
          {
            label: 'Es el factor de seguridad estándar de los diseños lineales.',
            feedback:
              'Nada de seguridad: es geometría de ondas. Piensa qué distancia física ocupa UN ciclo eléctrico completo (un patrón N-S) sobre el riel.',
          },
          {
            label: 'Porque un ciclo eléctrico completo es un patrón N-S entero = DOS pasos polares (τ es la distancia de un solo polo): la onda avanza 2τ por cada 1/f segundos.',
            correct: true,
            feedback:
              'v = longitud de onda × frecuencia, y la longitud de onda espacial es 2τ (polo norte + polo sur). Es el gemelo exacto de nₛ = 120f/p: allá el campo recorre P/2 patrones por vuelta; aquí cada patrón mide 2τ metros. Con τ = 1 m a 60 Hz: 120 m/s = 432 km/h — velocidad maglev sin rotación alguna.',
          },
          {
            label: 'Del devanado bifásico que usan las máquinas lineales.',
            feedback:
              'Las lineales suelen ser trifásicas como sus primas rotativas. El 2 es espacial, no de fases: un ciclo completo del patrón magnético mide dos pasos polares (N + S).',
          },
        ]}
      />

      <SolvedProblem
        id="c4s3-problema-voltaje"
        numero="18"
        title="El voltaje de nuestra máquina elemental"
        statement={
          <>
            Un generador trifásico en Y tiene N = {N} vueltas en serie por fase, factor de devanado
            kw = {KW}, flujo por polo Φ = {(PHI * 1000).toFixed(0)} mWb, y gira de modo que genera{' '}
            {F} Hz. Halle el voltaje de fase y el de línea.
          </>
        }
        steps={[
          {
            title: 'Aplicar la fórmula de Faraday compactada',
            why: 'Los cuatro ingredientes son datos directos: la fórmula es multiplicación pura. La única disciplina es de unidades (Φ en webers, no miliwebers).',
            work: `E_{fase} = 4.44\\,f\\,k_w N\\,\\Phi = 4.44 \\times ${F} \\times ${KW} \\times ${N} \\times ${PHI} = ${fmt(E, 1)}\\ \\text{V}`,
          },
          {
            title: 'De fase a línea (conexión Y)',
            why: 'En estrella, el voltaje entre líneas es √3 veces el de fase (los fasores de fase están a 120° y la resta introduce el √3).',
            work: `E_{linea} = \\sqrt{3}\\,E_{fase} = 1.732 \\times ${fmt(E, 1)} = ${fmt(EL, 1)}\\ \\text{V}`,
            note: 'Reproduce el punto en el laboratorio del voltaje (son sus valores por defecto) y luego juega: ¿qué prefieres para duplicar E — duplicar vueltas o duplicar flujo? Recuerda la saturación antes de contestar.',
          },
        ]}
        answer={`E_{fase} = ${fmt(E, 1)}\\ \\text{V} \\qquad E_{linea} = ${fmt(EL, 1)}\\ \\text{V}`}
        takeaway="4.44·f·kw·N·Φ es de las cinco fórmulas más usadas de la ingeniería eléctrica — la misma del transformador, porque es la misma ley de Faraday. Domínala aquí y la reconocerás en todas partes."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C4 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Voltaje: <InlineMath latex="E = 4.44\,f\,k_w N\,\Phi" /> — Faraday con el descuento kw.
            El 4.44 = √2·π/2, el mismo del transformador.
          </li>
          <li>
            Par: dos campos que quieren alinearse, <InlineMath latex="T \propto \Phi_{sr} F_r \,\text{sen}\,\delta" /> —
            solo la componente perpendicular gira. De este sen δ nacen todas las curvas P-δ del libro.
          </li>
          <li>
            Letras pequeñas: la saturación pone techo al flujo; la dispersión no produce par pero
            factura reactancia serie (y salva a la máquina limitando las corrientes de falla).
          </li>
          <li>
            Desenrolla el motor y el campo giratorio se vuelve viajero: v = 2τf — el gemelo lineal de
            nₛ = 120f/p. Maglev sin piezas giratorias.
          </li>
        </ul>
      </div>
    </section>
  )
}
