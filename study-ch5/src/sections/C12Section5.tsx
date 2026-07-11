import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import SelectionFlowLab from '../widgets/SelectionFlowLab'
import { fmt } from '../lib/machine'

/** Capítulo 12, Sección 5 — El flujo de selección completo. */
export default function C12Section5() {
  // Problema 63: bomba
  const T = 250
  const n = 1480
  const w = (n * 2 * Math.PI) / 60
  const pCarga = (T * w) / 1000
  const fInst = 0.88
  const pReq = pCarga / fInst

  return (
    <section id="c12-seccion-5" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          Capítulo 12 · Sección 5
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Seleccionar una máquina: el embudo con chequeos
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Todo el capítulo (y medio curso) converge aquí: caracterizar la carga, convertirla en
          potencia, corregirla por la instalación, elegir del catálogo y VERIFICAR que arranca y
          que aguanta. La selección no es una fórmula: es un embudo donde cada etapa puede
          rechazar al candidato.
        </p>
      </header>

      <ConceptBlock
        title="5.1 · Caracterizar la carga: el paso que nadie puede saltarse"
        idea="Las cargas tienen personalidad: PAR CONSTANTE (bandas, elevadores, compresores de pistón — exigen el par completo desde el arranque), PAR CUADRÁTICO (bombas centrífugas y ventiladores — T ∝ n², casi nada al arranque, y P ∝ n³: el territorio de los variadores), POTENCIA CONSTANTE (bobinadoras, husillos — mucho par abajo, poco arriba: el territorio del debilitamiento de campo). El tipo decide TRES cosas: la potencia requerida a velocidad nominal, el par de arranque exigido, y si conviene un variador. Después vienen el régimen (S1/S3, Sección 3), el derrateo (Sección 4) y el catálogo — en ese orden."
        analogy="Elegir vehículo: no se empieza por el catálogo de motores sino por el VIAJE — ¿plano o montaña (tipo de par)?, ¿diario o esporádico (régimen)?, ¿a qué altura (derrateo)? El camión perfecto para el viaje equivocado es la compra equivocada."
      >
        <Formula
          latex="P = T\,\omega \quad\rightarrow\quad P_{placa} \ge \frac{P_{carga}}{f_{inst}} \quad\rightarrow\quad \text{catálogo} \quad\rightarrow\quad T_{arr}^{motor} \ge 1.3\,T_{arr}^{carga}"
          symbols={[
            { sym: 'T\\omega', meaning: 'Con ω en rad/s (la conversión de r/min que ya dominas). Para cargas cíclicas, T y P son los equivalentes RMS de la Sección 3.' },
            { sym: 'f_{inst}', meaning: 'El factor combinado de la Sección 4 (altitud × ambiente × calidad de red). Divide ANTES de mirar el catálogo.' },
            { sym: '1.3\\,T_{arr}', meaning: 'El margen de arranque: el motor debe superar el par resistente en TODA la curva n(t), no solo en régimen — con reserva para tensión baja (el par de inducción cae con V²: 90 % de tensión = 81 % de par).' },
          ]}
        />
      </ConceptBlock>

      <SelectionFlowLab />

      <FeynmanCheck
        id="c12s5-check-arranque"
        question="Seleccionaste por potencia (con derrateo y margen) un motor para una BANDA transportadora cargada. En el arranque, el motor se queda «pegado» sin acelerar. ¿Qué chequeo faltó?"
        options={[
          {
            label: 'El de PAR de arranque: la banda (par constante) exige ~100 % del par desde n = 0, y si además la tensión cae al arrancar (par ∝ V²), el par disponible puede quedar bajo el resistente — la selección por potencia no lo garantiza.',
            correct: true,
            feedback:
              'El embudo tiene dos salidas de rechazo independientes: térmica (potencia) y mecánica (par en toda la curva). Las bombas perdonan el segundo chequeo; las bandas y molinos, jamás.',
          },
          {
            label: 'Ninguno: el motor está dañado.',
            feedback:
              'Un motor sano con par insuficiente se queda pegado igual — a rotor casi bloqueado, consumiendo 6·In y calentándose. El diagnóstico correcto evita culpar al hierro por un error de selección.',
          },
          {
            label: 'Faltó más potencia de placa.',
            feedback:
              'Más placa suele traer más par, pero es el remedio caro y de rebote: lo que se verifica es el PAR de arranque contra la curva de la carga — a veces basta otro diseño (NEMA D, rotor de alta resistencia) con la MISMA potencia.',
          },
        ]}
      />

      <FeynmanCheck
        id="c12s5-check-sobredim"
        question="«Ante la duda, pide el doble de potencia»: ¿por qué el sobredimensionamiento sistemático es mala ingeniería (y no solo mal presupuesto)?"
        options={[
          {
            label: 'Un motor al 40 % de carga opera con rendimiento y factor de potencia degradados, arranca con pares brutales para su carga (estrés mecánico) y su corriente magnetizante domina — pagas hierro, reactivos y desgaste por una reserva que la selección correcta (derrateo + margen de un dígito alto) ya cubría.',
            correct: true,
            feedback:
              'El fp de un motor de inducción a media carga cae en picada (la magnetizante no baja con la carga — Cap. 7). El margen sano se calcula, no se duplica: derrateo explícito + ~10-15 % de reserva.',
          },
          {
            label: 'No es mala: la reserva nunca sobra.',
            feedback:
              'La reserva CALCULADA nunca sobra; la duplicada cuesta rendimiento, fp, factura de reactivos y golpes de par. La diferencia entre margen y miedo es un cálculo de dos líneas.',
          },
          {
            label: 'Solo es un problema de costo inicial.',
            feedback:
              'El costo inicial es lo de menos: el 95 % del costo de vida de un motor es su energía (lo viste en el entrenador) — y un motor al 40 % la usa mal cada hora de su vida.',
          },
        ]}
      />

      <SolvedProblem
        id="c12s5-problema-seleccion"
        numero="63"
        title="Selección integral: la bomba de la planta"
        statement={
          <>
            Una bomba centrífuga (par cuadrático) exige {T} N·m a {n} r/min, servicio continuo S1.
            La instalación impone un factor combinado de {fmt(fInst, 2)} (altitud + temperatura,
            Sección 4). Catálogo disponible: 30, 37, 45, 55 kW, con par de arranque 2.2·Tn. Ejecute
            el embudo completo: potencia de carga, potencia de placa requerida, selección y
            verificación de arranque.
          </>
        }
        steps={[
          {
            title: '1 · La potencia de la carga',
            why: 'T·ω con ω en rad/s — la conversión obligatoria.',
            work: `\\omega = \\frac{2\\pi(${n})}{60} = ${fmt(w, 1)}\\ \\text{rad/s} \\Rightarrow P = ${T} \\times ${fmt(w, 1)} = ${fmt(pCarga, 1)}\\ \\text{kW}`,
          },
          {
            title: '2 · Corregir por la instalación',
            why: 'La placa debe cubrir la carga DESPUÉS del derrateo: dividir, no multiplicar.',
            work: `P_{placa} \\ge \\frac{${fmt(pCarga, 1)}}{${fmt(fInst, 2)}} = ${fmt(pReq, 1)}\\ \\text{kW}`,
          },
          {
            title: '3 · El catálogo',
            why: 'Primer tamaño normalizado que cubre el requerimiento.',
            work: `${fmt(pReq, 1)}\\ \\text{kW} \\Rightarrow 45\\ \\text{kW} \\;(\\text{margen } ${fmt(((45 * fInst) / pCarga - 1) * 100, 0)}\\%\\ \\text{tras derrateo})`,
          },
          {
            title: '4 · Verificar el arranque',
            why: 'La centrífuga pide ~15 % de su par en n = 0; el motor de 45 kW ofrece 2.2·Tn.',
            work: `T_n^{motor} = \\frac{45000}{${fmt(w, 1)}} = ${fmt(45000 / w, 0)}\\ \\text{N·m} \\Rightarrow T_{arr} = ${fmt((2.2 * 45000) / w, 0)} \\gg 0.15(${T}) = ${fmt(0.15 * T, 0)}\\ \\text{N·m} \\;✓`,
            note: 'La bomba pasa el chequeo con un orden de magnitud de sobra — por eso las centrífugas son la carga «fácil». La misma verificación con una banda cargada (100 % del par) es la que rechaza candidatos.',
          },
        ]}
        answer={`P_{carga} = ${fmt(pCarga, 1)}\\ \\text{kW} \\quad P_{placa} \\ge ${fmt(pReq, 1)}\\ \\text{kW} \\Rightarrow 45\\ \\text{kW} \\quad T_{arr}\\ ✓`}
        takeaway="El embudo completo: carga (tipo + T·ω) → régimen → ÷ derrateo → catálogo → verificar arranque (y térmica si el ciclo lo exige). Cinco pasos, dos posibles rechazos, cero improvisación."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · C12 Sección 5
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Primero la carga (constante / cuadrática / potencia constante): decide potencia, par de arranque y si conviene variador. Después régimen, derrateo, catálogo — en ese orden.</li>
          <li>Dos chequeos independientes: térmico (P_eq ≤ utilizable) y mecánico (par disponible sobre el resistente en TODA la curva, con reserva por tensión baja: par ∝ V²).</li>
          <li>El margen se calcula (derrateo + ~10-15 %), no se duplica: el motor al 40 % de carga desperdicia rendimiento, fp y dinero cada hora de su vida.</li>
        </ul>
      </div>
    </section>
  )
}
