import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import RegulationLab from '../widgets/RegulationLab'
import { fmt } from '../lib/machine'

/** Autotransformador: un devanado compartido, dibujado con sus dos tomas. */
function AutoTransformerFig() {
  return (
    <figure className="lab-panel my-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <svg viewBox="0 0 480 200" className="mx-auto w-full max-w-md select-none">
        {/* Devanado único vertical */}
        {Array.from({ length: 10 }, (_, k) => (
          <path key={k} d={`M 200 ${30 + k * 14} a 9 9 0 0 1 0 14`} fill="none"
            stroke={k < 3 ? '#3987e5' : '#c98500'} strokeWidth={3} />
        ))}
        {/* Tomas */}
        <line x1={200} y1={30} x2={120} y2={30} stroke="#52525b" strokeWidth={2} />
        <line x1={200} y1={72} x2={280} y2={72} stroke="#52525b" strokeWidth={2} />
        <line x1={200} y1={170} x2={120} y2={170} stroke="#52525b" strokeWidth={2} />
        <line x1={280} y1={170} x2={200} y2={170} stroke="#52525b" strokeWidth={2} />
        <text x={60} y={104} fill="#3987e5" fontSize={12} fontWeight={700}>V alta</text>
        <text x={60} y={120} fill="#71717a" fontSize={10}>(todo el devanado)</text>
        <line x1={120} y1={30} x2={120} y2={170} stroke="#3987e5" strokeWidth={2} strokeDasharray="4 3" />
        <text x={292} y={116} fill="#c98500" fontSize={12} fontWeight={700}>V baja</text>
        <text x={292} y={132} fill="#71717a" fontSize={10}>(solo la porción común)</text>
        <line x1={280} y1={72} x2={280} y2={170} stroke="#c98500" strokeWidth={2} strokeDasharray="4 3" />
        <text x={150} y={54} fill="#3987e5" fontSize={10}>serie</text>
        <text x={216} y={130} fill="#c98500" fontSize={10}>común</text>
      </svg>
      <figcaption className="mt-2 text-center text-[11px] text-zinc-500">
        Autotransformador: primario y secundario COMPARTEN el tramo común. Parte de la potencia pasa
        conducida (por cable, gratis) y solo el resto pasa transformada (por flujo).
      </figcaption>
    </figure>
  )
}

/** Conexiones trifásicas Y y Δ con el desfase de 30°. */
function ThreePhaseFig() {
  return (
    <figure className="lab-panel my-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <svg viewBox="0 0 480 190" className="mx-auto w-full max-w-md select-none">
        {/* Estrella */}
        <g>
          {[90, 210, 330].map((deg) => {
            const a = (deg * Math.PI) / 180
            return (
              <line key={deg} x1={110} y1={100} x2={110 + 55 * Math.cos(a)} y2={100 - 55 * Math.sin(a)}
                stroke="#3987e5" strokeWidth={3} strokeLinecap="round" />
            )
          })}
          <circle cx={110} cy={100} r={4} fill="#3987e5" />
          <text x={88} y={180} fill="#3987e5" fontSize={12} fontWeight={700}>Estrella (Y)</text>
          <text x={62} y={30} fill="#71717a" fontSize={10}>neutro disponible · V línea = √3·V fase</text>
        </g>
        {/* Delta */}
        <g>
          {[[370, 55], [320, 145], [420, 145]].map(([x, y], i, arr) => {
            const nxt = arr[(i + 1) % 3]
            return (
              <line key={i} x1={x} y1={y} x2={nxt[0]} y2={nxt[1]}
                stroke="#c98500" strokeWidth={3} strokeLinecap="round" />
            )
          })}
          <text x={340} y={180} fill="#c98500" fontSize={12} fontWeight={700}>Delta (Δ)</text>
          <text x={300} y={30} fill="#71717a" fontSize={10}>sin neutro · I línea = √3·I fase</text>
        </g>
        {/* Desfase */}
        <text x={175} y={105} fill="#9085e9" fontSize={11} fontWeight={700}>Y–Δ ⇒ ±30°</text>
        <path d="M 195 118 A 30 30 0 0 1 245 118" fill="none" stroke="#9085e9" strokeWidth={1.5} strokeDasharray="4 3" />
      </svg>
      <figcaption className="mt-2 text-center text-[11px] text-zinc-500">
        Bancos trifásicos: cada combinación (Y-Y, Δ-Δ, Y-Δ, Δ-Y) hereda las ventajas de sus lados —
        y las conexiones mixtas introducen el desfase de 30° entre primario y secundario.
      </figcaption>
    </figure>
  )
}

/**
 * Capítulo 2, Sección 3 — Regulación, eficiencia, el sistema por unidad,
 * autotransformadores y bancos trifásicos.
 */
export default function C2Section3() {
  // Problema 23: plena carga, fp 0.8 atraso, con el transformador de la S2
  const REQ = 4.0 / 115.2
  const XEQ = 9.0 / 115.2
  const PFE = 0.002
  const PF = 0.8
  const sin = 0.6
  const re = 1 + PF * REQ + sin * XEQ
  const im = PF * XEQ - sin * REQ
  const V1 = Math.hypot(re, im)
  const VR = (V1 - 1) * 100
  const PCU = REQ // L = 1
  const eta = (PF / (PF + PFE + PCU)) * 100

  return (
    <section id="c2-seccion-3" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
          Capítulo 2 · Sección 3
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Regulación, eficiencia, por unidad — y las variantes que mueven la red
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Los índices con los que un ingeniero juzga un transformador, la normalización que borra las
          relaciones de vueltas, y las dos variantes que dominan la práctica: auto y trifásicos.
        </p>
      </header>

      <ConceptBlock
        title="3.1 · Regulación de voltaje: cuánto cede el secundario bajo carga"
        idea="VR% compara la tensión del secundario en vacío contra plena carga (a V₁ constante). La caída ocurre en Req + jXeq, y su tamaño depende dramáticamente del ÁNGULO de la corriente: la carga inductiva atraviesa Xeq «de frente» y desploma la tensión; la capacitiva puede incluso LEVANTARLA por encima del vacío (VR negativa)."
        analogy="Una manguera con la llave abierta fija (V₁): cuánto cae la presión en la punta depende no solo de CUÁNTA agua pides, sino de CÓMO la pides. La carga capacitiva es como pedir «en contrafase»: la presión en la punta sube — el efecto Ferranti doméstico."
      >
        <Formula
          latex="VR\% = \frac{|V_{2,vacío}| - |V_{2,carga}|}{|V_{2,carga}|} \times 100 \qquad \hat{V}_1' = \hat{V}_2 + \hat{I}(R_{eq} + jX_{eq})"
          symbols={[
            { sym: 'VR\\%', meaning: 'La promesa de estabilidad de tensión: 2–8% típico. Importa porque tus focos, motores y electrónica viven en el secundario.' },
            { sym: '\\hat{I}(R_{eq}+jX_{eq})', meaning: 'La caída fasorial: con corriente en atraso, la parte de Xeq se alinea con V₂ y RESTA de lleno; en adelanto, se opone — y puede sumar.' },
          ]}
        />
        <RegulationLab />
      </ConceptBlock>

      <FeynmanCheck
        id="c2s3-check-vr"
        question="Con carga capacitiva (fp en adelanto), la VR se vuelve NEGATIVA: el secundario con carga tiene MÁS tensión que en vacío. ¿Cómo es posible?"
        options={[
          {
            label: 'Es un error de medición típico de cargas capacitivas.',
            feedback:
              'Es real y medible (y en líneas largas en vacío tiene nombre: efecto Ferranti). La clave es FASORIAL: dibuja V₂, la corriente adelantada, y la caída jXeq·I — ¿hacia dónde apunta esa caída?',
          },
          {
            label: 'Porque la corriente adelantada hace que la caída jXeq·I apunte «hacia atrás»: V₁ resulta MENOR que V₂ en magnitud — el capacitor está aportando los reactivos que Xeq consume, sosteniendo la tensión desde adentro.',
            correct: true,
            feedback:
              'El fasor no miente: jXeq·I con I adelantada 90° cae ANTIPARALELO a V₂. Físicamente, la carga capacitiva magnetiza al transformador (le regala Q), igual que el generador sobreexcitado del Cap. 5 sostenía la tensión de la red. Míralo cruzar el cero en la curva del laboratorio — el fp es el director de orquesta de la regulación.',
          },
          {
            label: 'Porque con carga capacitiva la corriente es imaginaria y no produce caída.',
            feedback:
              'La corriente es tan real como cualquiera y produce caída en Req y Xeq. Lo que cambia es la GEOMETRÍA de esa caída respecto a V₂: con adelanto, deja de restar y empieza a sumar.',
          },
        ]}
      />

      <ConceptBlock
        title="3.2 · Por unidad: la normalización que borra al transformador"
        idea="Elige una base (S_base y V_base en cada zona, relacionadas por la relación de vueltas) y expresa todo como fracción de ella. Milagro contable: la MISMA impedancia física da el MISMO número en pu vista desde cualquier lado — el a² desaparece, los transformadores se vuelven simples impedancias serie, y una red con veinte niveles de tensión se analiza como si tuviera uno."
        analogy="Hablar en porcentajes en vez de monedas: 8% de impedancia es 8% en pesos, dólares o yenes. El «tipo de cambio» (a²) desaparece de las cuentas porque cada zona usa SU moneda base — exactamente por eso las placas dicen Z = 8.5% y no ohms."
      >
        <Formula
          latex="Z_{pu} = \frac{Z_{\Omega}}{Z_{base}} \qquad Z_{base} = \frac{V_{base}^2}{S_{base}} \qquad Z_{pu}^{(lado\,1)} = Z_{pu}^{(lado\,2)}\ \checkmark"
          symbols={[
            { sym: 'Z_{base} = V^2/S', meaning: 'Cada zona de tensión tiene su base. Como las V_base se eligen con la relación de vueltas, el a² de la reflexión se cancela EXACTO contra el cociente de bases.' },
            { sym: 'Z_{pu}', meaning: 'El mismo número desde ambos lados: 4 Ω en 2400 V y 0.04 Ω en 240 V son AMBOS 0.0347 pu. Verifícalo: 0.04/(240²/50k) = 0.0347 ✓.' },
            { sym: 'S_{base}', meaning: 'Común a todo el sistema (una sola). Todo el documento de los Caps. 5 y 6 ya estaba en pu — ahora sabes formalmente por qué era tan cómodo.' },
          ]}
        />
      </ConceptBlock>

      <FeynmanCheck
        id="c2s3-check-pu"
        question="¿Por qué exactamente desaparece el a² al pasar a por unidad?"
        options={[
          {
            label: 'Porque en pu se desprecian las impedancias pequeñas.',
            feedback:
              'No se desprecia nada: pu es un cambio de unidades exacto e invertible. El truco está en CÓMO se eligen las bases de tensión de cada zona…',
          },
          {
            label: 'Porque las V_base de cada zona se eligen en la relación a: la Z física se refleja con a², pero la Z_base = V²/S también cambia con a² — y el cociente Z/Z_base queda idéntico.',
            correct: true,
            feedback:
              'a² arriba, a² abajo: se cancelan por construcción. El transformador ideal queda reducido a un cable (relación 1:1 en pu) y solo sobrevive su imperfección: la Zeq serie de ~0.05–0.10 pu. Por eso los estudios de redes — y todo nuestro documento — viven en pu: veinte niveles de tensión, una sola aritmética.',
          },
          {
            label: 'Porque los transformadores reales tienen a ≈ 1.',
            feedback:
              'Los hay de 500kV:13.8kV (a ≈ 36). La desaparición no depende del valor de a — funciona para cualquiera, porque es una cancelación algebraica entre la reflexión y las bases.',
          },
        ]}
      />

      <ConceptBlock
        title="3.3 · El autotransformador: potencia que viaja en cable"
        idea="Une primario y secundario en UN devanado con una toma intermedia: la porción común transporta parte de la potencia por CONDUCCIÓN directa (cobre, casi gratis) y solo la diferencia de tensiones pasa por TRANSFORMACIÓN (flujo). Resultado: para la misma potencia transferida, menos cobre, menos hierro, menos pérdidas — a cambio de perder el aislamiento galvánico entre lados."
        analogy="Un puente peatonal entre dos pisos casi a la misma altura: si solo hay que subir 10%, no construyes un elevador completo — una rampa corta basta. El autotransformador brilla cuando las tensiones son parecidas (525/500 kV, arranques de motores); sería absurdo (y peligroso) para 13800:120 V."
      >
        <AutoTransformerFig />
        <Formula
          latex="\frac{S_{auto}}{S_{devanado}} = 1 + \frac{N_{común}}{N_{serie}}"
          symbols={[
            { sym: 'S_{auto}', meaning: 'La potencia que el conjunto puede manejar: crece sobre la del devanado físico porque la parte conducida no estresa al circuito magnético.' },
            { sym: '1 + N_c/N_s', meaning: 'La ganancia: enorme cuando las tensiones son cercanas (Nc ≫ Ns). Con 525/500 kV el mismo cobre maneja ~21× más potencia que como transformador convencional.' },
          ]}
        />
      </ConceptBlock>

      <FeynmanCheck
        id="c2s3-check-auto"
        question="¿De dónde sale la «potencia extra» del autotransformador — por qué el mismo devanado maneja más kVA que conectado como transformador convencional?"
        options={[
          {
            label: 'De un mejor acoplamiento magnético entre las bobinas.',
            feedback:
              'El acoplamiento ayuda al rendimiento, pero no explica el salto de capacidad. La clave es que parte de la potencia NI SIQUIERA pasa por el circuito magnético…',
          },
          {
            label: 'De la conexión eléctrica directa: la porción común CONDUCE potencia de un lado al otro sin transformarla — solo la fracción correspondiente a la diferencia de tensiones pasa por el flujo, y solo esa estresa cobre y hierro.',
            correct: true,
            feedback:
              'La potencia transformada es S·(1 − V₂/V₁): con tensiones cercanas es una fracción pequeña, y el hierro/cobre se dimensionan solo para ELLA. El precio: sin aislamiento galvánico, una falla del lado de alta aparece en el de baja — por eso jamás se usa donde el aislamiento es la razón de ser del transformador.',
          },
          {
            label: 'De operar a mayor frecuencia interna.',
            feedback:
              'La frecuencia es la de la red, inalterable. El secreto es topológico: compartir devanado permite que la mayor parte de la potencia viaje conducida — el flujo solo carga con la diferencia.',
          },
        ]}
      />

      <ConceptBlock
        title="3.4 · Bancos trifásicos: Y, Δ y el desfase de 30°"
        idea="Tres transformadores (o tres pares de devanados en un núcleo) se conectan en estrella (Y: hay neutro, cada devanado ve V_línea/√3) o delta (Δ: sin neutro, cada devanado ve V_línea pero I_línea/√3). Las combinaciones mixtas (Y-Δ, Δ-Y) desplazan el secundario ±30° respecto al primario — un detalle que decide si dos bancos pueden operar en paralelo, y que da hogar (el Δ) a los terceros armónicos del Capítulo 1."
        analogy="Enchufes de tres patas con dos estándares: puedes adaptar voltajes, pero si dos aparatos deben trabajar EN PARALELO, sus «patas» deben coincidir también en el giro (el grupo de conexión). Conectar en paralelo un Y-Δ con un Y-Y es unir fasores a 30° de distancia: chispas."
      >
        <ThreePhaseFig />
      </ConceptBlock>

      <SolvedProblem
        id="c2s3-problema-regulacion"
        numero="23"
        title="Regulación y eficiencia del transformador medido"
        statement={
          <>
            El transformador de la Sección 2 (Req = {fmt(REQ, 4)} pu, Xeq = {fmt(XEQ, 4)} pu, pérdidas
            de hierro {fmt(PFE, 3)} pu) alimenta plena carga con <strong>fp = 0.8 en atraso</strong>.
            Halle la regulación de voltaje y la eficiencia.
          </>
        }
        steps={[
          {
            title: 'La caída fasorial (V₂ como referencia)',
            why: 'Con V₂ = 1∠0° y la corriente de plena carga I = 1∠−36.87°, la tensión interna necesaria del primario es V₂ más la caída en la serie — suma de fasores, como siempre.',
            work: `\\hat{V}_1' = 1 + (0.8 - j0.6)(${fmt(REQ, 4)} + j\\,${fmt(XEQ, 4)}) = ${fmt(re, 4)} + j\\,${fmt(im, 4)}`,
          },
          {
            title: 'Magnitud y regulación',
            why: 'La VR compara magnitudes: cuánto más tensión hay que “traer de fábrica” para que, tras la caída, quede 1.0 pu en la carga. Ese exceso es lo que el secundario recuperará al soltar la carga.',
            work: `|\\hat{V}_1'| = ${fmt(V1, 4)}\\ \\text{pu} \\;\\Rightarrow\\; VR = (${fmt(V1, 4)} - 1)\\times 100 = ${fmt(VR, 2)}\\%`,
          },
          {
            title: 'Eficiencia con las dos facturas medidas',
            why: 'Hierro fijo (del ensayo OC) + cobre a plena carga (del ensayo SC, ∝ L²) — los mismos dos sumandos de siempre, ahora con números que TÚ mediste.',
            work: `\\eta = \\frac{P}{P + P_{fe} + P_{cu}} = \\frac{0.8}{0.8 + ${fmt(PFE, 3)} + ${fmt(PCU, 4)}} = ${fmt(eta, 2)}\\%`,
            note: 'Reproduce ambos números en el laboratorio (plena carga, fp 0.8 atraso). Y prueba el mismo punto con fp 0.8 EN ADELANTO: la VR cambia de signo — la eficiencia apenas se inmuta.',
          },
        ]}
        answer={`VR = ${fmt(VR, 2)}\\% \\qquad \\eta = ${fmt(eta, 2)}\\%`}
        takeaway="Dos ensayos de una tarde alimentan los dos índices que juzgan al transformador toda su vida. Y la VR enseña la lección fasorial: no importa solo cuánta corriente entregas, sino en qué ángulo."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C2 Sección 3
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            VR%: la caída fasorial en Req+jXeq — el fp dirige (inductiva desploma, capacitiva puede
            levantar: VR negativa). η: hierro fijo vs. cobre ∝ L², el teorema de siempre.
          </li>
          <li>
            Por unidad: bases de tensión en relación a ⇒ el a² se cancela ⇒ los transformadores se
            vuelven impedancias serie de ~0.05–0.10 pu. Veinte niveles de tensión, una aritmética.
          </li>
          <li>
            Autotransformador: potencia conducida + transformada — capacidad{' '}
            <InlineMath latex="\times(1+N_c/N_s)" /> a cambio del aislamiento. Trifásicos: Y da
            neutro, Δ da camino a los terceros armónicos, y las mixtas desfasan ±30°.
          </li>
        </ul>
      </div>
    </section>
  )
}
