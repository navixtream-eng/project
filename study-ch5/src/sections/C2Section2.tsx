import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import SolvedProblem from '../components/SolvedProblem'
import CircuitBuilderLab from '../widgets/CircuitBuilderLab'
import TransformerTestsLab from '../widgets/TransformerTestsLab'
import { fmt } from '../lib/machine'

/**
 * Capítulo 2, Sección 2 — El transformador real: el circuito equivalente
 * construido imperfección por imperfección, y los dos ensayos que lo miden.
 */
export default function C2Section2() {
  // Problema 22: datos de ensayo generados por el transformador del laboratorio
  const VN = 2400
  const SN = 50000
  const IN = SN / VN
  const RC = 57600
  const XM = 12000
  const REQ = 4.0
  const XEQ = 9.0
  const Poc = (VN * VN) / RC
  const Ioc = VN * Math.hypot(1 / RC, 1 / XM)
  const Zeq = Math.hypot(REQ, XEQ)
  const Vsc = IN * Zeq
  const Psc = IN * IN * REQ
  const Ic = VN / RC
  const Im = Math.sqrt(Ioc * Ioc - Ic * Ic)

  return (
    <section id="c2-seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
          Capítulo 2 · Sección 2
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          El transformador real: circuito equivalente y sus dos ensayos
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Al ideal se le suman, una por una, las imperfecciones del Capítulo 1 — y luego dos
          experimentos de una tarde separan y miden cada una.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · Construir el circuito por capas"
        idea="Cada imperfección física se convierte en UN elemento de circuito: el cobre de los devanados en R₁ y R₂ (serie); el flujo que se fuga sin enlazar la otra bobina en X₁ y X₂ (serie); y el núcleo del Capítulo 1 — que ni magnetiza gratis ni deja de calentarse — en la rama paralela Rc ∥ Xm. Luego, con el a² de la reflexión, todo el secundario se «refiere» al primario y las series se funden: Req = R₁ + a²R₂, Xeq = X₁ + a²X₂."
        analogy="Restaurar una foto retocada hasta el original: el ideal era la foto perfecta; cada capa que agregas (grano, desenfoque, viñeteo) es un defecto real con causa conocida. El circuito equivalente es la foto honesta — y cada retoque tiene nombre, unidad y forma de medirse."
      >
        <CircuitBuilderLab />
      </ConceptBlock>

      <ConceptBlock
        title="2.2 · Los dos ensayos: aislar cada rama con física, no con pinzas"
        idea="¿Cómo medir Rc y Xm sin que Req y Xeq estorben (y viceversa)? Eligiendo condiciones donde el otro sea invisible. CIRCUITO ABIERTO: tensión nominal, corriente diminuta (~1%) ⇒ la caída en la serie es despreciable ⇒ los instrumentos ven solo la excitación (y el wattmetro, solo el hierro). CORTOCIRCUITO: corriente nominal con tensión diminuta (~8%) ⇒ la excitación casi no toma ⇒ los instrumentos ven solo la serie (y el wattmetro, solo el cobre)."
        analogy="Pesar el envase y el contenido por separado sin abrir el frasco: primero el frasco vacío (OC: sin carga, solo el costo fijo del hierro), luego el frasco lleno pero anulando el envase (SC: la báscula tarada). Dos pesadas, cuatro parámetros."
      >
        <TransformerTestsLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c2s2-check-oc"
        question="En el ensayo de circuito abierto, ¿por qué el wattmetro mide (casi exactamente) SOLO las pérdidas del hierro?"
        options={[
          {
            label: 'Porque el hierro es lo único que existe con el secundario abierto.',
            feedback:
              'La serie (Req) sigue ahí y la corriente de excitación la atraviesa. La clave es CUANTITATIVA: ¿cuánto vale I²R cuando I es el 1% de la nominal?',
          },
          {
            label: 'Porque las pérdidas de cobre van con I², y la corriente de excitación es ~1% de la nominal: su I²R es una diezmilésima de la nominal — invisible. Queda solo V²/Rc: el hierro a flujo nominal.',
            correct: true,
            feedback:
              'El cuadrado hace la magia: (0.01)² = 0.0001. Y como el ensayo aplica TENSIÓN nominal, el flujo (y por tanto histéresis + Foucault) es exactamente el de operación — el wattmetro lee las pérdidas del hierro reales. Compruébalo en el laboratorio: mueve Req en modo OC y el wattmetro ni parpadea.',
          },
          {
            label: 'Porque el wattmetro se conecta directamente sobre el núcleo.',
            feedback:
              'El wattmetro mide en TERMINALES (V×I×cosθ) — no sabe qué hay adentro. Que su lectura coincida con el hierro es consecuencia de la física del punto de operación, no del cableado.',
          },
        ]}
      />

      <FeynmanCheck
        id="c2s2-check-sc"
        question="En el ensayo de cortocircuito se aplica solo ~8% de la tensión nominal. ¿Por qué eso vuelve invisible a la rama de excitación?"
        options={[
          {
            label: 'Porque en corto la rama de excitación queda desconectada del circuito.',
            feedback:
              'Sigue conectada en paralelo — nadie la desconecta. Lo que cambia es cuánta corriente TOMA: la excitación es esclava de la tensión (y del flujo) aplicados…',
          },
          {
            label: 'Porque la corriente de excitación es proporcional a la tensión: al 8% de Vnominal toma ~8% de su ya diminuto 1% — despreciable frente a la corriente nominal que circula por la serie. Además, con tan poco flujo, el hierro casi no pierde.',
            correct: true,
            feedback:
              'Doble descuento: la excitación era ~1% a tensión plena, y aquí la tensión es ~8% de eso. Mientras tanto, la serie lleva la corriente NOMINAL completa: el amperímetro, el voltímetro y el wattmetro (I²Req, el cobre pleno) retratan a Req y Xeq sin contaminación. Verifícalo: mueve Rc/Xm en modo SC y los instrumentos quedan sordos.',
          },
          {
            label: 'Porque el flujo cambia de camino y evita el núcleo.',
            feedback:
              'El flujo no elige caminos por conveniencia del ensayo — simplemente es ~12 veces menor (proporcional a la tensión). Poca tensión ⇒ poco flujo ⇒ poca corriente magnetizante y pérdidas de hierro ínfimas.',
          },
        ]}
      />

      <SolvedProblem
        id="c2s2-problema-ensayos"
        numero="22"
        title="Del laboratorio al circuito equivalente completo"
        statement={
          <>
            Al transformador de {SN / 1000} kVA, {VN} V del laboratorio se le practican ambos ensayos
            (instrumentos del lado primario). <strong>OC:</strong> {VN} V, {fmt(Ioc, 3)} A,{' '}
            {fmt(Poc, 0)} W. <strong>SC:</strong> {fmt(Vsc, 1)} V, {fmt(IN, 2)} A, {fmt(Psc, 0)} W.
            Determine los cuatro parámetros del circuito equivalente.
          </>
        }
        steps={[
          {
            title: 'Ensayo OC → rama de excitación',
            why: 'Toda la potencia es hierro (V²/Rc) y la corriente se reparte entre Ic (en fase, la que paga el hierro) e Im (en cuadratura, la que magnetiza). Pitágoras separa lo que el amperímetro mezcló.',
            work: `R_c = \\frac{V^2}{P_{oc}} = \\frac{${VN}^2}{${fmt(Poc, 0)}} = ${fmt(RC / 1000, 1)}\\ \\text{k}\\Omega \\qquad I_c = ${fmt(Ic, 4)}\\ \\text{A} \\quad I_m = \\sqrt{I_{oc}^2 - I_c^2} = ${fmt(Im, 3)}\\ \\text{A} \\quad X_m = \\frac{V}{I_m} = ${fmt(XM / 1000, 1)}\\ \\text{k}\\Omega`,
          },
          {
            title: 'Ensayo SC → impedancia serie',
            why: 'Toda la potencia es cobre (I²Req) y el cociente V/I entrega la magnitud Zeq; Pitágoras de nuevo para la reactancia.',
            work: `R_{eq} = \\frac{P_{sc}}{I^2} = \\frac{${fmt(Psc, 0)}}{${fmt(IN, 2)}^2} = ${fmt(REQ, 1)}\\ \\Omega \\qquad Z_{eq} = \\frac{V_{sc}}{I} = ${fmt(Zeq, 2)}\\ \\Omega \\quad X_{eq} = \\sqrt{Z_{eq}^2 - R_{eq}^2} = ${fmt(XEQ, 1)}\\ \\Omega`,
          },
          {
            title: 'Leer el retrato completo',
            why: 'Cuatro números y el transformador queda caracterizado para SIEMPRE: pérdidas fijas (hierro), pérdidas variables (cobre), caída bajo carga (Xeq domina) y corriente de vacío.',
            work: `\\frac{Z_{eq}}{Z_{base}} = \\frac{${fmt(Zeq, 2)}}{${fmt((VN * VN) / SN, 1)}} = ${fmt((Zeq / ((VN * VN) / SN)) * 100, 1)}\\%\\ \\text{(la «impedancia de placa»)}`,
            note: 'Ese porcentaje (~8.5%) es el que aparece grabado en la placa de todo transformador real — y es literalmente la tensión del ensayo SC en pu. La Sección 3 lo usará para la regulación.',
          },
        ]}
        answer={`R_c = ${fmt(RC / 1000, 1)}\\ \\text{k}\\Omega \\quad X_m = ${fmt(XM / 1000, 1)}\\ \\text{k}\\Omega \\quad R_{eq} = ${fmt(REQ, 1)}\\ \\Omega \\quad X_{eq} = ${fmt(XEQ, 1)}\\ \\Omega`}
        takeaway="El mismo guion que el ensayo OCC/SCC de la máquina síncrona (C5·S5): elegir condiciones donde la física apague lo que no quieres medir. Un voltímetro, un amperímetro, un wattmetro y una tarde — retrato completo."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C2 Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Cada elemento es una imperfección con nombre: R (cobre), X (dispersión), Rc∥Xm (el
            Capítulo 1 empacado). Referir con a² funde las series en Req y Xeq.
          </li>
          <li>
            OC a tensión nominal: corriente ~1% ⇒ I²R invisible ⇒ se mide la excitación y el hierro.
            SC a corriente nominal: tensión ~8% ⇒ excitación invisible ⇒ se mide la serie y el cobre.
          </li>
          <li>
            El «Z%» de la placa es la tensión del ensayo SC en pu — el número que gobierna regulación
            y corrientes de falla.
          </li>
        </ul>
      </div>
    </section>
  )
}
