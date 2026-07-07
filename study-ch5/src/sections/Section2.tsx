import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import PhasorLab from '../widgets/PhasorLab'
import ExcitationLab from '../widgets/ExcitationLab'
import { fmt, fmtDeg, solveFromPf, toDeg } from '../lib/machine'

/** Colores de fasor (paleta categórica validada, ver PhasorLab). */
const C = { Vt: '#3987e5', Ia: '#c98500', jXsIa: '#9085e9', Eaf: '#e66767' }

/** Circuito equivalente por fase: fuente Eaf + reactancia sincrónica Xs. */
function EquivalentCircuit() {
  return (
    <figure className="my-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <svg viewBox="0 0 640 200" className="mx-auto w-full max-w-xl">
        {/* Fuente Eaf */}
        <circle cx="80" cy="100" r="30" fill="none" stroke={C.Eaf} strokeWidth="2.5" />
        <text x="80" y="106" textAnchor="middle" fill={C.Eaf} fontSize="16" fontWeight="700">~</text>
        <text x="80" y="160" textAnchor="middle" fill={C.Eaf} fontSize="14" fontWeight="700">Êaf</text>
        <text x="80" y="176" textAnchor="middle" fill="#71717a" fontSize="10">FEM interna (∝ If)</text>

        {/* Conductor superior con bobina Xs */}
        <line x1="80" y1="70" x2="80" y2="40" stroke="#a1a1aa" strokeWidth="2" />
        <line x1="80" y1="40" x2="220" y2="40" stroke="#a1a1aa" strokeWidth="2" />
        <path
          d="M 220 40 a 12 12 0 0 1 24 0 a 12 12 0 0 1 24 0 a 12 12 0 0 1 24 0 a 12 12 0 0 1 24 0"
          fill="none"
          stroke={C.jXsIa}
          strokeWidth="2.5"
        />
        <text x="268" y="22" textAnchor="middle" fill={C.jXsIa} fontSize="14" fontWeight="700">jXs</text>
        <line x1="316" y1="40" x2="500" y2="40" stroke="#a1a1aa" strokeWidth="2" />

        {/* Flecha de corriente Ia */}
        <line x1="380" y1="40" x2="440" y2="40" stroke={C.Ia} strokeWidth="3" />
        <path d="M 440 40 L 428 33 L 428 47 Z" fill={C.Ia} />
        <text x="410" y="26" textAnchor="middle" fill={C.Ia} fontSize="14" fontWeight="700">Îa</text>

        {/* Bornes y Vt */}
        <circle cx="500" cy="40" r="4" fill="#a1a1aa" />
        <circle cx="500" cy="160" r="4" fill="#a1a1aa" />
        <line x1="80" y1="130" x2="80" y2="160" stroke="#a1a1aa" strokeWidth="2" />
        <line x1="80" y1="160" x2="500" y2="160" stroke="#a1a1aa" strokeWidth="2" />
        <line x1="520" y1="70" x2="520" y2="130" stroke={C.Vt} strokeWidth="2.5" />
        <path d="M 520 70 L 513 82 L 527 82 Z" fill={C.Vt} />
        <text x="545" y="95" fill={C.Vt} fontSize="14" fontWeight="700">V̂t</text>
        <text x="545" y="112" fill="#71717a" fontSize="10">bornes → red</text>
      </svg>
      <figcaption className="mt-2 text-center text-[11px] text-zinc-500">
        Circuito equivalente por fase (convención generador): la máquina entera, reducida a una fuente y
        una reactancia. Xs = X<sub>φ</sub> (reacción de armadura) + X<sub>al</sub> (dispersión).
      </figcaption>
    </figure>
  )
}

/**
 * Sección 2 — FEM interna, circuito equivalente y diagrama fasorial
 * (FKU §5.2–§5.3): el modelo con el que se calcula TODO lo demás.
 */
export default function Section2() {
  // Problemas 2 y 3: resueltos por la librería — los números del texto salen de aquí.
  const VT = 1.0
  const IA = 0.9
  const PF = 0.9
  const XS = 1.0
  const p2 = solveFromPf(VT, IA, PF, true, XS)
  const p3 = solveFromPf(VT, IA, PF, false, XS)
  const phiDeg = toDeg(p2.phi)

  return (
    <section id="seccion-2" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">Sección 2</p>
        <h2 className="text-2xl font-black text-zinc-50">
          FEM interna, circuito equivalente y diagrama fasorial
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Toda la máquina — cobre, hierro, campo giratorio — se comprime en dos elementos: una fuente
          y una reactancia. Ese modelo mínimo responde casi cualquier pregunta de régimen permanente.
        </p>
      </header>

      <ConceptBlock
        title="2.1 · Eaf: la tensión que la máquina fabrica por dentro"
        idea="El rotor, excitado con corriente continua If, es un imán que gira. Su campo barre los conductores del estator e induce en ellos una tensión alterna: la FEM interna Eaf. Su magnitud la controlas tú con If; su frecuencia la fija la velocidad de giro."
        analogy="Piensa en una bomba de agua conectada a la red de tuberías de la ciudad. Eaf es la presión interna que la bomba genera; Vt es la presión de la red en la conexión. Que el agua salga (genere) o entre (motorice), y con cuánta fuerza, depende de la DIFERENCIA entre ambas presiones — y esa diferencia cae en la «tubería interna» jXs."
      >
        <p className="mb-2">
          La ley de Kirchhoff del circuito por fase, en convención de generador (la corriente{' '}
          <em>sale</em> por el borne positivo):
        </p>
        <Formula
          latex="\hat{E}_{af} = \hat{V}_t + jX_s\,\hat{I}_a"
          tag="(5.23)"
          symbols={[
            { sym: '\\hat{E}_{af}', meaning: 'FEM interna generada por el flujo del rotor. Proporcional a la corriente de campo If (zona lineal). Es el «músculo» ajustable de la máquina.' },
            { sym: '\\hat{V}_t', meaning: 'Tensión en bornes, impuesta por la red. Nuestro fasor de referencia (ángulo 0).' },
            { sym: 'X_s', meaning: 'Reactancia sincrónica: reacción de armadura Xφ + dispersión Xal. Resume TODO el efecto magnético del estator en un solo número (1–2 pu típico).' },
            { sym: '\\hat{I}_a', meaning: 'Corriente de armadura que la máquina entrega a la red. Su ángulo φ respecto a Vt define el factor de potencia.' },
            { sym: 'j', meaning: 'La caída en Xs está 90° ADELANTADA a la corriente: por eso el diagrama fasorial tiene su geometría característica de triángulo.' },
          ]}
        />
        <p className="mb-2">
          De esta ecuación nacen los dos ángulos protagonistas del capítulo, y conviene no
          confundirlos jamás:
        </p>
        <ul className="mb-2 list-disc space-y-1 pl-5">
          <li>
            <strong style={{ color: C.Ia }}>φ</strong> — entre <InlineMath latex="\hat{I}_a" /> y{' '}
            <InlineMath latex="\hat{V}_t" />: el <em>factor de potencia</em>, lo que ve la red.
          </li>
          <li>
            <strong style={{ color: C.Eaf }}>δ</strong> — entre <InlineMath latex="\hat{E}_{af}" /> y{' '}
            <InlineMath latex="\hat{V}_t" />: el <em>ángulo de potencia</em>, cuánto se adelanta
            físicamente el rotor respecto a la red. Gobierna la potencia activa.
          </li>
        </ul>
        <EquivalentCircuit />
      </ConceptBlock>

      <PhasorLab />

      <FeynmanCheck
        id="s2-check-caida"
        question="En el diagrama fasorial, el vector violeta jXs·Ia conecta la punta de Vt con la punta de Eaf. ¿Qué dirección tiene ese vector respecto a la corriente Ia?"
        options={[
          {
            label: 'La misma dirección que Ia.',
            feedback: 'Esa sería una caída RESISTIVA (R·Ia). En Xs la caída es inductiva: el factor j la gira 90° en adelanto respecto a Ia. Compruébalo arrastrando Ia en el laboratorio.',
          },
          {
            label: 'Perpendicular a Ia, adelantada 90°.',
            correct: true,
            feedback: 'El operador j es una rotación de +90°. Por eso, con corriente en atraso, jXs·Ia apunta «hacia arriba y adelante» y ALARGA a Eaf; con corriente en adelanto, la recorta. Toda la geometría del capítulo sale de este ángulo recto.',
          },
          {
            label: 'Opuesta a Ia.',
            feedback: 'Opuesta sería −Ia (rotación de 180°). Multiplicar por j rota +90°, no 180°.',
          },
        ]}
      />

      <FeynmanCheck
        id="s2-check-excitacion"
        question="La máquina entrega P constante a la red. Si el operador SUBE la corriente de campo If (y con ella |Eaf|), ¿qué pasa con la corriente de armadura y el factor de potencia?"
        options={[
          {
            label: 'P aumenta: más excitación = más potencia.',
            feedback: 'La potencia activa la decide la TURBINA (el par mecánico), no la excitación. Si Pm no cambió, P no cambia: la máquina ajusta δ para que Eaf·Vt·senδ/Xs siga valiendo lo mismo.',
          },
          {
            label: 'La máquina se sobreexcita: entrega más Q y la corriente tiende al atraso.',
            correct: true,
            feedback: 'Con P clavada, subir Eaf empuja Q hacia arriba: la máquina entrega reactivos (la red la ve como un condensador) y la corriente se atrasa. Esto es la mitad derecha de la curva V — y así es como el despacho controla la tensión de la red.',
          },
          {
            label: 'Nada: Eaf no influye si P es constante.',
            feedback: 'Influye, pero no sobre P sino sobre Q. Recorre el laboratorio de excitación: |Ia|, φ y Q cambian dramáticamente con Eaf a P constante.',
          },
          {
            label: 'La velocidad del rotor aumenta.',
            feedback: 'Imposible en sincronismo: la velocidad está clavada en nₛ = 120f/p mientras la máquina no pierda el paso. La excitación mueve REACTIVOS, no r/min.',
          },
        ]}
      />

      <ConceptBlock
        title="2.2 · Excitación a potencia constante: la curva V"
        idea="A potencia activa fija, la corriente de campo es la perilla de la potencia reactiva. Poca excitación: la máquina absorbe Q (subexcitada, corriente en adelanto). Mucha: entrega Q (sobreexcitada, corriente en atraso). En el punto justo, fp = 1 y la corriente de armadura es mínima — el fondo de la «V»."
        analogy="Es la caja de cambios reactiva de la red: el mismo camión (P) puede circular sobrado de revoluciones o escaso de ellas. El operador de la central mueve If durante todo el día exactamente igual que tú mueves este slider — para sostener la tensión de la red."
      >
        <ExcitationLab />
      </ConceptBlock>

      <FeynmanCheck
        id="s2-check-vcurva"
        question="En la curva V, ¿por qué |Ia| tiene un MÍNIMO justo cuando fp = 1?"
        options={[
          {
            label: 'Porque con fp = 1 la corriente solo transporta potencia activa: Ia = P/Vt, sin componente reactiva que la engorde.',
            correct: true,
            feedback: 'Ia² ∝ P² + Q². Con P fija, el mínimo de |Ia| ocurre en Q = 0, es decir fp = 1. A ambos lados de la V, la corriente extra es puro reactivo: calienta el cobre sin producir un solo watt.',
          },
          {
            label: 'Porque en fp = 1 la máquina gira más despacio y pide menos corriente.',
            feedback: 'La velocidad es constante (¡sincrónica!). El mínimo es un asunto de composición de la corriente: con Q = 0 no hay componente reactiva y solo queda la activa P/Vt.',
          },
          {
            label: 'Es una casualidad del ejemplo numérico.',
            feedback: 'Es estructural: |S| = √(P²+Q²) y |Ia| = |S|/Vt. Con P fija, minimizar |Ia| equivale a anular Q — o sea fp = 1, siempre.',
          },
        ]}
      />

      <SolvedProblem
        id="s2-problema-generador"
        numero="2"
        title="FEM interna de un generador sobreexcitado"
        statement={
          <>
            Un generador sincrónico de rotor cilíndrico, con{' '}
            <strong>Xs = {fmt(XS, 1)} pu</strong>, entrega <strong>Ia = {fmt(IA, 1)} pu</strong> con
            factor de potencia <strong>{fmt(PF, 1)} en atraso</strong>, con tensión de bornes{' '}
            <strong>Vt = {fmt(VT, 1)} pu</strong> (referencia). Halle el fasor de corriente, la FEM
            interna Eaf y el ángulo de potencia δ.
          </>
        }
        steps={[
          {
            title: 'Colocar los fasores: Vt de referencia y φ desde el fp',
            why: 'Siempre se ancla Vt en 0° (es lo que la red impone). «fp 0.9 en atraso» significa que la corriente va DETRÁS de la tensión un ángulo φ = arccos(0.9). El signo del ángulo de Ia es negativo por ir en atraso.',
            work: `\\varphi = \\arccos(${fmt(PF, 1)}) = ${fmtDeg(p2.phi)} \\qquad \\hat{I}_a = ${fmt(IA, 1)}\\,\\angle{-${fmt(phiDeg, 1)}^\\circ}\\ \\text{pu}`,
          },
          {
            title: 'Pasar Ia a forma rectangular',
            why: 'Vamos a SUMAR fasores (Vt + jXs·Ia) y las sumas se hacen en rectangular. La componente real es la que produce potencia activa; la imaginaria (negativa = atraso) es la que transporta los reactivos.',
            work: `\\hat{I}_a = ${fmt(IA, 1)}\\cos(${fmt(phiDeg, 1)}^\\circ) - j\\,${fmt(IA, 1)}\\,\\text{sen}(${fmt(phiDeg, 1)}^\\circ) = ${fmt(p2.Ia.re)} - j\\,${fmt(-p2.Ia.im)}\\ \\text{pu}`,
          },
          {
            title: 'Calcular la caída jXs·Ia',
            why: 'Multiplicar por j rota el fasor +90°: (a − jb)·j = b + ja. Este giro de 90° es el corazón geométrico del diagrama — la caída inductiva nunca va en la dirección de la corriente.',
            work: `jX_s\\hat{I}_a = j(${fmt(XS, 1)})(${fmt(p2.Ia.re)} - j\\,${fmt(-p2.Ia.im)}) = ${fmt(-p2.Ia.im * XS)} + j\\,${fmt(p2.Ia.re * XS)}\\ \\text{pu}`,
          },
          {
            title: 'Sumar para obtener Eaf y extraer magnitud y ángulo',
            why: 'La ley de Kirchhoff del circuito equivalente: Eaf = Vt + jXs·Ia. La parte real suma la tensión de la red; el ángulo resultante ES el ángulo de potencia δ — cuánto se adelanta el rotor a la red.',
            work: `\\hat{E}_{af} = ${fmt(VT, 1)} + ${fmt(-p2.Ia.im * XS)} + j\\,${fmt(p2.Ia.re * XS)} = ${fmt(p2.Eaf.re)} + j\\,${fmt(p2.Eaf.im)} = ${fmt(p2.EafMag)}\\,\\angle{${fmtDeg(p2.delta)}}\\ \\text{pu}`,
            note: 'Verificación rápida de cordura: sobreexcitado ⇒ |Eaf| > |Vt|. Aquí 1.61 > 1.0 ✓. Reproduce este mismo punto en el laboratorio fasorial con el preset «fp 0.8 atraso» ajustando |Ia|.',
          },
        ]}
        answer={`\\hat{I}_a = ${fmt(IA, 1)}\\angle{-${fmt(phiDeg, 1)}^\\circ}\\ \\text{pu} \\qquad \\hat{E}_{af} = ${fmt(p2.EafMag)}\\,\\angle{${fmtDeg(p2.delta)}}\\ \\text{pu} \\qquad \\delta = ${fmtDeg(p2.delta)}`}
        takeaway="El método es SIEMPRE el mismo ritual de cuatro pasos: anclar Vt, escribir Ia con su φ, girar 90° la caída, sumar. Domínalo y habrás resuelto la mitad de los problemas del capítulo."
      />

      <SolvedProblem
        id="s2-problema-adelanto"
        numero="3"
        title="El mismo generador, ahora subexcitado"
        statement={
          <>
            El mismo generador del Problema 2 entrega la misma corriente{' '}
            <strong>Ia = {fmt(IA, 1)} pu</strong> y la misma P, pero ahora con fp ={' '}
            <strong>{fmt(PF, 1)} en adelanto</strong>. Recalcule Eaf y δ, y compare.
          </>
        }
        steps={[
          {
            title: 'Solo cambia un signo — pero cambia todo',
            why: 'Corriente en ADELANTO: φ pasa a ser positivo en el ángulo de Ia. La componente activa (real) es idéntica — misma P — pero la reactiva se invierte: la máquina ahora ABSORBE Q de la red.',
            work: `\\hat{I}_a = ${fmt(IA, 1)}\\,\\angle{+${fmt(phiDeg, 1)}^\\circ} = ${fmt(p3.Ia.re)} + j\\,${fmt(p3.Ia.im)}\\ \\text{pu}`,
          },
          {
            title: 'La caída jXs·Ia ahora RESTA a la parte real',
            why: 'Al girar +90° una corriente adelantada, la caída cae hacia el semiplano real negativo: en vez de estirar a Eaf por delante de Vt, la recorta. Geometría pura — míralo en el laboratorio arrastrando Ia hacia arriba.',
            work: `jX_s\\hat{I}_a = ${fmt(-p3.Ia.im * XS)} + j\\,${fmt(p3.Ia.re * XS)}\\ \\text{pu}`,
          },
          {
            title: 'Sumar y comparar con el caso sobreexcitado',
            why: 'Misma receta: Eaf = Vt + jXs·Ia. El contraste numérico entre los dos problemas es la lección completa de la sección en dos renglones.',
            work: `\\hat{E}_{af} = ${fmt(p3.Eaf.re)} + j\\,${fmt(p3.Eaf.im)} = ${fmt(p3.EafMag)}\\,\\angle{${fmtDeg(p3.delta)}}\\ \\text{pu}`,
            note: `Comparación: sobreexcitado |Eaf| = ${fmt(p2.EafMag)} pu con δ = ${fmt(toDeg(p2.delta), 1)}°; subexcitado |Eaf| = ${fmt(p3.EafMag)} pu con δ = ${fmt(toDeg(p3.delta), 1)}°. Misma P, pero el subexcitado trabaja con un ángulo mucho mayor.`,
          },
        ]}
        answer={`\\hat{E}_{af} = ${fmt(p3.EafMag)}\\,\\angle{${fmtDeg(p3.delta)}}\\ \\text{pu} \\qquad (\\text{vs. } ${fmt(p2.EafMag)}\\,\\angle{${fmtDeg(p2.delta)}}\\ \\text{sobreexcitado})`}
        takeaway="Subexcitado, el generador entrega la misma P con δ = 53° en vez de 30°: mucho más cerca del límite de 90°. Por eso la subexcitación profunda es territorio delicado — menos margen de estabilidad — y los generadores pasan su vida útil mayormente sobreexcitados, sosteniendo la tensión de la red."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 2
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            La máquina completa cabe en <InlineMath latex="\hat{E}_{af} = \hat{V}_t + jX_s\hat{I}_a" />:
            una presión interna (Eaf, tuya vía If), una presión de red (Vt) y una tubería (Xs).
          </li>
          <li>
            Dos ángulos, dos trabajos: <strong style={{ color: C.Ia }}>φ</strong> reparte P/Q (lo que ve
            la red); <strong style={{ color: C.Eaf }}>δ</strong> es el adelanto físico del rotor (lo que
            transmite la potencia).
          </li>
          <li>
            A P constante, If es la perilla de Q: curva en V con el mínimo exactamente en fp = 1.
            Sobreexcitado entrega Q y trabaja holgado; subexcitado absorbe Q y camina cerca del
            precipicio de δ = 90°.
          </li>
        </ul>
      </div>
    </section>
  )
}
