import ConceptBlock from '../components/ConceptBlock'
import FeynmanCheck from '../components/FeynmanCheck'
import Formula, { InlineMath } from '../components/Formula'
import SolvedProblem from '../components/SolvedProblem'
import ParallelSyncLab from '../widgets/ParallelSyncLab'
import DroopShareLab from '../widgets/DroopShareLab'
import ReactiveShareLab from '../widgets/ReactiveShareLab'
import SalaControlLab from '../widgets/SalaControlLab'
import { droopSolve, fmt, reactiveShare, toDeg } from '../lib/machine'

const RUTA = ['Preparar', 'Sincronizar', 'Cerrar', 'Cargar MW', 'Repartir MVAr', 'Vigilar límites', 'Desconectar']

/** Capítulo 5, Sección 7 — Generadores sincrónicos interconectados (§5-8/5-9 FKU). */
export default function Section7() {
  // Problema 47: estatismo
  const k = 1 // Hz/MW
  const a = droopSolve({ fNl: 61.5, k }, { fNl: 61.0, k }, 2.5)
  const b = droopSolve({ fNl: 61.5, k }, { fNl: 61.0, k }, 3.5)

  // Problema 48: reactivos (por unidad)
  const rs = reactiveShare(1, 1.6, 1.2, 0.6, 0.8)

  return (
    <section id="c5-seccion-7" className="scroll-mt-20">
      <header className="mb-6 border-b border-zinc-800 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
          Capítulo 5 · Sección 7
        </p>
        <h2 className="text-2xl font-black text-zinc-50">
          Generadores en paralelo: el coro de la red
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Un sistema de potencia es un enorme coro de generadores sincrónicos cantando la misma
          nota. Aquí aprendes el ritual para que una máquina nueva ENTRE al coro sin desafinar
          (sincronización), y los dos únicos mandos con los que después se reparte el trabajo:
          el gobernador (los watts) y la excitación (los vars).
        </p>
        {/* Ruta de la maniobra: el mapa de toda la sección */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {RUTA.map((paso, i) => (
            <span key={paso} className="flex items-center gap-1">
              <span className="rounded-md border border-sky-800/60 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                {i + 1}. {paso}
              </span>
              {i < RUTA.length - 1 && <span className="text-[10px] text-zinc-600">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-zinc-500">
          Esta ruta es el índice de la sección: los laboratorios 1–3 entrenan cada tramo por
          separado y la «Sala de control» final te hace ejecutarla completa, como en una central.
        </p>
      </header>

      <ConceptBlock
        title="7.1 · Entrar al coro: sincronización y sincroscopio"
        idea="Antes de cerrar el interruptor S₂ que conecta un generador a la barra, los dos voltajes deben ser INDISTINGUIBLES: misma magnitud (excitación), misma frecuencia (velocidad), misma secuencia de fases y — el requisito fino — misma fase instantánea. Si f₂ ≠ f₁, la fase relativa entre ambos voltajes deriva a la frecuencia de batido Δf = f₂ − f₁: el voltaje a través de S₂ crece y decrece como una respiración. Se cierra S₂ en el instante en que esa diferencia pasa por cero; el instrumento que lo señala es el sincroscopio."
        analogy="Subirte a una calesita en marcha: corres junto a ella (igualas frecuencia), al lado de tu caballo (igualas fase) y saltas en el instante de velocidad relativa nula. Saltar con la calesita «180° fuera de fase» es saltar contra el caballo que viene de frente."
      >
        <Formula
          latex="\Delta \hat V_{S_2} = \hat V_1 - \hat V_2 \;\to\; 0 \quad\text{cuando}\quad |V_2| = |V_1|,\; f_2 \approx f_1,\; \varphi_2 = \varphi_1"
          symbols={[
            { sym: '\\Delta \\hat V_{S_2}', meaning: 'Voltaje instantáneo a través del interruptor abierto. Cerrar con ΔV ≠ 0 aplica ese voltaje sobre la reactancia (pequeñísima) de la máquina: corriente de choque brutal y sacudida de par en el eje.' },
            { sym: 'f_2 - f_1', meaning: 'Frecuencia de batido [Hz]: la velocidad a la que gira la aguja del sincroscopio. El operador la reduce a una fracción de ciclo por segundo antes de intentar el cierre.' },
            { sym: '\\varphi_2 - \\varphi_1', meaning: 'Desfase instantáneo. La aguja del sincroscopio ES este ángulo: «las 12» significa cero — el único momento seguro para cerrar.' },
          ]}
        />
        <p>
          Después del cierre la máquina queda <em>en sincronismo</em>: girará exactamente a la
          velocidad que dicte la red (Cap. 5.3, barra infinita). Desde ese momento ya no se
          controla «su velocidad» — se controla <strong>cuánta carga toma</strong>, con los
          ajustes de la máquina impulsora y de la excitación.
        </p>
      </ConceptBlock>

      <ParallelSyncLab />

      <FeynmanCheck
        id="s7-check-cero"
        question="Predice ANTES de probarlo en el laboratorio: ¿qué pasa si se cierra S₂ justo cuando el sincroscopio marca las 6 — es decir, con los voltajes 180° fuera de fase?"
        options={[
          {
            label: 'Nada grave: las magnitudes son iguales, así que no hay diferencia de voltaje.',
            feedback:
              'Las MAGNITUDES son iguales, pero los fasores apuntan en sentidos opuestos: |ΔV| = |V̂₁ − V̂₂| = 2V — ¡el doble del voltaje nominal! aplicado sobre la reactancia subtransitoria de la máquina. Es el peor instante posible, no el más inocente.',
          },
          {
            label: 'Circula una corriente de choque enorme (ΔV = 2V sobre una reactancia pequeña) y el eje recibe una sacudida de par violenta.',
            correct: true,
            feedback:
              'Exacto. Con ΔV = 2V y solo X″ de por medio, la corriente supera con holgura la de un cortocircuito en bornes. El par transitorio puede doblar ejes y arrancar cabezales de bobina — por eso los relés de verificación de sincronismo bloquean el cierre fuera de la ventana segura.',
          },
          {
            label: 'El generador simplemente se motoriza y gira al revés.',
            feedback:
              'No hay tiempo para eso: en los primeros milisegundos lo que manda es el transitorio de corriente (Cap. 6). El «girar al revés» es imposible — la máquina ya gira casi a velocidad síncrona; el problema es el CHOQUE, no el sentido.',
          },
        ]}
      />

      <ConceptBlock
        title="7.2 · Repartir los watts: gobernadores y estatismo (Fig. 5-29)"
        idea="A diferencia de los generadores de CD, dos sincrónicos en paralelo giran EXACTAMENTE a la misma velocidad de estado estable (si tienen igual número de polos). Entonces, ¿quién decide cuánta potencia entrega cada uno? Sus máquinas impulsoras. Cada gobernador impone una recta velocidad-potencia levemente caída (estatismo): f = f_vacío − k·P. La frecuencia común del sistema es la altura a la que las dos rectas, sumadas, consumen exactamente la carga P_L. Subir el setpoint de un gobernador sube su recta: esa máquina toma más MW (y la frecuencia del sistema sube un poco); para devolver f a 60 Hz se baja el setpoint de la otra."
        analogy="Dos caballos tirando de la misma carreta con la misma velocidad forzosamente igual: no puedes pedirle a uno que «corra más rápido» — solo puedes tensarle más su arnés (subir su gobernador) para que cargue una fracción mayor del mismo tiro."
      >
        <Formula
          latex="f = f_{\text{vacío}} - k\,P \qquad P_1 + P_2 = P_L"
          symbols={[
            { sym: 'f_{\\text{vacío}}', meaning: 'Frecuencia a carga cero [Hz]: el «setpoint» del gobernador — la única perilla del operador sobre los MW.' },
            { sym: 'k', meaning: 'Estatismo [Hz/MW]: cuánto cae la frecuencia por MW entregado. Sin esta caída deliberada el reparto sería indeterminado e inestable: máquinas idénticas con rectas planas no sabrían quién toma la carga.' },
            { sym: 'P_L', meaning: 'Carga total. Con ambas rectas fijas, un aumento de P_L baja la frecuencia de TODO el sistema — por eso la frecuencia es el barómetro del balance generación-demanda.' },
          ]}
        />
        <p>
          La maniobra clásica del libro (Fig. 5-29): para trasladar carga del generador 1 al 2{' '}
          <strong>sin cambiar la frecuencia</strong>, se sube el gobernador del 2 y se baja el del 1
          en pasos coordinados. La frecuencia del sistema y la división de la potencia activa se
          controlan mediante los gobernadores — <em>y solo</em> mediante ellos.
        </p>
      </ConceptBlock>

      <DroopShareLab />

      <ConceptBlock
        title="7.3 · Repartir los vars: la excitación (Fig. 5-30)"
        idea="Los cambios de excitación NO mueven los watts — mueven el voltaje de terminales y la distribución de potencia REACTIVA. Si se sube If₁, el voltaje de la barra sube; se devuelve a su valor bajando If₂. En el estado final nada cambió para la carga (mismo V̂t, misma ÎL, mismo fp), pero por dentro los fasores se reacomodaron: Êaf1 creció y se acostó, Êaf2 se encogió y se enderezó, de modo que Eaf·sen δ — la potencia activa — quedó idéntica en ambas. El generador más excitado se queda con los kVAR en atraso."
        analogy="Dos meseros llevan juntos la misma bandeja (la carga no cambia). Si uno estira más el brazo (más excitación), soporta más peso lateral (reactivos) y el otro se relaja — pero la bandeja avanza igual: los pasos (watts) no dependen de los brazos, dependen de las piernas (los gobernadores)."
      >
        <Formula
          latex="P_i = \frac{E_{af,i} V_t}{X_s}\,\sin\delta_i = \text{cte} \qquad Q_i = \frac{V_t\,(E_{af,i}\cos\delta_i - V_t)}{X_s}"
          symbols={[
            { sym: 'E_{af}\\sin\\delta', meaning: 'La componente VERTICAL del fasor de excitación. Los gobernadores no se tocaron, así que P no puede cambiar: la punta de Êaf solo puede viajar por una recta horizontal al variar If.' },
            { sym: 'E_{af}\\cos\\delta - V_t', meaning: 'La «altura» de la excitación sobre el voltaje de terminales: el excedente que empuja reactivos hacia la barra. Sobreexcitado → Q positiva (atraso); subexcitado → Q negativa (absorbe).' },
          ]}
        />
        <p>
          El resumen del capítulo (§5-9) es el manual del operador completo:{' '}
          <strong>gobernadores y reguladores de frecuencia</strong> mantienen f casi constante y
          reparten los MW; <strong>reguladores de voltaje sobre los campos</strong> (y
          transformadores con cambio de derivaciones) sostienen V̂t y reparten los kVAR. Dos lazos
          casi ortogonales: P↔f, Q↔V.
        </p>
      </ConceptBlock>

      <ReactiveShareLab />

      <FeynmanCheck
        id="s7-check-mandos"
        question="La frecuencia del sistema está en 60.00 Hz pero el generador 1 va sobrecargado de MW y el 2 casi en vacío. ¿Qué maniobra reparte mejor los watts SIN mover la frecuencia?"
        options={[
          {
            label: 'Subir la excitación If₂ para que el generador 2 «jale» más carga.',
            feedback:
              'La excitación mueve reactivos y voltaje, no watts: Eaf·sen δ quedaría igual. El generador 2 tomaría kVAR, se calentaría más… y seguiría casi en vacío de MW. Perilla equivocada.',
          },
          {
            label: 'Subir el gobernador del 2 y, a la vez, bajar el del 1 en la misma medida.',
            correct: true,
            feedback:
              'Correcto — la maniobra de la Fig. 5-29. Subir solo el gobernador 2 trasladaría carga PERO subiría la frecuencia; el descenso simultáneo del 1 la devuelve. La suma de setpoints fija f; su diferencia fija el reparto.',
          },
          {
            label: 'Abrir brevemente el interruptor del generador 1 para forzar al 2 a tomar la carga.',
            feedback:
              '¡Eso es un rechazo de carga, no una maniobra! El 2 se llevaría el golpe completo de P_L de un tirón, la frecuencia caería y el 1 tendría que volver a sincronizarse desde cero. Los gobernadores existen para esto.',
          },
        ]}
      />

      <FeynmanCheck
        id="s7-check-excitacion"
        question="Dos generadores idénticos comparten por igual una carga de fp 0.8 en atraso. Se sube If₁ y se baja If₂ hasta que el 2 queda a fp unitario. ¿Cuál entrega ahora más POTENCIA ACTIVA?"
        options={[
          {
            label: 'El generador 1: al estar más excitado, empuja más de todo.',
            feedback:
              'Empuja más REACTIVOS, no más watts. Nadie tocó los gobernadores: P₁ = P₂ exactamente como antes. Sube |Êaf1| pero baja δ₁, y Eaf·sen δ — los watts — no se mueve.',
          },
          {
            label: 'Siguen iguales: la excitación solo redistribuyó los kVAR; los MW los fijan las máquinas impulsoras, que no se tocaron.',
            correct: true,
            feedback:
              'Exacto. En el diagrama fasorial (Fig. 5-30) las puntas de ambos Êaf se deslizan por la misma recta horizontal Eaf·sen δ = cte. El generador 1 ahora carga TODOS los reactivos (más corriente, más calentamiento) y el 2 trabaja a fp unitario — con los mismos watts cada uno.',
          },
        ]}
      />

      <SolvedProblem
        id="s7-problema-droop"
        numero="47"
        title="Estatismo: frecuencia y reparto entre dos gobernadores"
        statement={
          <>
            Dos generadores sincrónicos alimentan en paralelo una carga de <strong>2.5 MW</strong>.
            Ambos gobernadores tienen estatismo <strong>k = 1 Hz/MW</strong>; el del generador 1
            está ajustado a <strong>61.5 Hz</strong> en vacío y el del 2 a <strong>61.0 Hz</strong>.
            Halle <strong>(a)</strong> la frecuencia del sistema y el reparto P₁, P₂;{' '}
            <strong>(b)</strong> el nuevo estado si la carga sube a <strong>3.5 MW</strong>;{' '}
            <strong>(c)</strong> qué deben hacer los operadores para devolver la frecuencia a 60 Hz
            sin cambiar el reparto del inciso (b).
          </>
        }
        steps={[
          {
            title: '(a) Plantear las dos rectas y la suma de cargas',
            why: 'Cada máquina obedece f = f_vacío − k·P y ambas DEBEN operar a la misma f. Dos ecuaciones de recta + el balance P₁+P₂ = P_L determinan todo.',
            work: `P_1 = \\frac{61.5 - f}{1}, \\quad P_2 = \\frac{61.0 - f}{1}, \\quad P_1 + P_2 = 2.5`,
          },
          {
            title: '(a) Resolver la frecuencia común',
            why: 'Sumando: (61.5 − f) + (61.0 − f) = 2.5 → 122.5 − 2f = 2.5.',
            work: `f = \\frac{61.5 + 61.0 - 2.5}{2} = ${fmt(a.f, 2)}\\ \\text{Hz} \\qquad P_1 = ${fmt(a.p1, 2)}\\ \\text{MW}, \\; P_2 = ${fmt(a.p2, 2)}\\ \\text{MW}`,
            note: 'El gobernador con setpoint más alto (el 1) toma más carga: 1.5 contra 1.0 MW. La diferencia de setpoints (0.5 Hz) fija la diferencia de cargas (0.5 MW con k = 1).',
          },
          {
            title: '(b) Sube la carga con los gobernadores quietos',
            why: 'Nadie decidió quién toma el MW extra: lo reparte el estatismo por igual (rectas de igual pendiente) y la frecuencia de TODO el sistema cae.',
            work: `f = \\frac{61.5 + 61.0 - 3.5}{2} = ${fmt(b.f, 2)}\\ \\text{Hz} \\qquad P_1 = ${fmt(b.p1, 2)}\\ \\text{MW}, \\; P_2 = ${fmt(b.p2, 2)}\\ \\text{MW}`,
            note: 'La caída de 0.5 Hz es la señal universal de «falta generación»: cada MW no cubierto baja la frecuencia de la red completa.',
          },
          {
            title: '(c) Restaurar 60 Hz sin alterar el reparto',
            why: 'Subir AMBOS setpoints la misma cantidad desplaza las dos rectas hacia arriba en bloque: f sube y la DIFERENCIA de cargas (que depende solo de la diferencia de setpoints) no cambia.',
            work: `f_{\\text{vacío},1} = 62.0\\ \\text{Hz}, \\; f_{\\text{vacío},2} = 61.5\\ \\text{Hz} \\;\\Rightarrow\\; f = \\frac{62.0 + 61.5 - 3.5}{2} = 60.0\\ \\text{Hz}`,
            note: 'Esto es exactamente lo que hace la regulación secundaria de frecuencia (AGC) en una red real: mover en bloque los setpoints para devolver f a la nominal.',
          },
        ]}
        answer={`\\text{(a)}\\; f = ${fmt(a.f, 2)}\\,\\text{Hz},\\; P_1 = ${fmt(a.p1, 1)},\\; P_2 = ${fmt(a.p2, 1)}\\,\\text{MW} \\quad \\text{(b)}\\; f = ${fmt(b.f, 2)}\\,\\text{Hz} \\quad \\text{(c)}\\; +0.5\\,\\text{Hz a ambos}`}
        takeaway="La frecuencia es UNA para toda la red: las rectas de estatismo deciden el reparto, la suma de setpoints decide la frecuencia, y la diferencia de setpoints decide quién carga más."
      />

      <SolvedProblem
        id="s7-problema-reactivos"
        numero="48"
        title="Excitación: llevar un generador a fp unitario"
        statement={
          <>
            Dos generadores idénticos (Xₛ = 0.8 pu) comparten por igual una carga de{' '}
            <strong>1.6 + j1.2 pu</strong> con V̂t = 1.0 pu. Se ajustan las excitaciones (sin tocar
            los gobernadores) hasta que el generador 2 opera a <strong>fp unitario</strong>. Halle
            las excitaciones Êaf y los ángulos δ de ambas máquinas en el estado final.
          </>
        }
        steps={[
          {
            title: 'Repartir: los watts quedan clavados, los vars migran',
            why: 'Gobernadores intactos → P₁ = P₂ = 0.8 pu para siempre. «G2 a fp unitario» significa Q₂ = 0, así que G1 se lleva TODOS los reactivos: Q₁ = 1.2 pu.',
            work: `P_1 = P_2 = 0.8, \\qquad Q_2 = 0 \\;\\Rightarrow\\; Q_1 = 1.2\\ \\text{pu}`,
          },
          {
            title: 'Generador 2: corriente en fase y Êaf2',
            why: 'Con Q₂ = 0 la corriente es puramente activa: Îa2 = P/Vt en fase con V̂t. Su excitación es Vt más la caída jXsÎa.',
            work: `\\hat I_{a2} = 0.8\\angle 0^\\circ \\quad \\hat E_{af2} = 1 + j(0.8)(0.8) = 1 + j0.64 = ${fmt(rs.g2.mag, 3)}\\angle ${fmt(toDeg(rs.g2.delta), 1)}^\\circ`,
          },
          {
            title: 'Generador 1: corriente reactiva completa y Êaf1',
            why: 'Îa1 = (P − jQ)/Vt lleva toda la componente en atraso. La caída jXsÎa convierte la parte reactiva en MÁS magnitud de Êaf y la parte activa en ángulo.',
            work: `\\hat I_{a1} = 0.8 - j1.2 \\quad \\hat E_{af1} = 1 + j0.8(0.8 - j1.2) = ${fmt(rs.g1.Eaf.re, 2)} + j${fmt(rs.g1.Eaf.im, 2)} = ${fmt(rs.g1.mag, 3)}\\angle ${fmt(toDeg(rs.g1.delta), 1)}^\\circ`,
          },
          {
            title: 'Verificar la invariante: Eaf·sen δ igual en ambas',
            why: 'La firma de que los watts no se movieron: la componente vertical de ambos fasores de excitación debe ser idéntica (= P·Xs/Vt = 0.64).',
            work: `E_{af1}\\sin\\delta_1 = ${fmt(rs.g1.mag * Math.sin(rs.g1.delta), 3)} = E_{af2}\\sin\\delta_2 = ${fmt(rs.g2.mag * Math.sin(rs.g2.delta), 3)} = \\frac{P X_s}{V_t}`,
            note: 'Nota el costo oculto: |Îa1| = √(0.8² + 1.2²) = 1.44 pu contra 0.8 pu del generador 2 — 80% más corriente por los MISMOS watts. Los reactivos mal repartidos se pagan en cobre caliente.',
          },
        ]}
        answer={`\\hat E_{af1} = ${fmt(rs.g1.mag, 2)}\\angle ${fmt(toDeg(rs.g1.delta), 1)}^\\circ \\qquad \\hat E_{af2} = ${fmt(rs.g2.mag, 2)}\\angle ${fmt(toDeg(rs.g2.delta), 1)}^\\circ \\qquad P_1 = P_2 = 0.8\\ \\text{pu}`}
        takeaway="Excitar más = inclinar el fasor hacia lo reactivo, nunca hacia lo activo. El diagrama fasorial de la Fig. 5-30 se resuelve entero con una sola invariante: Eaf·sen δ = P·Xs/Vt."
      />

      <ConceptBlock
        title="7.4 · Dos escenarios, los mismos mandos, efectos distintos"
        idea="Contra una BARRA INFINITA (la red gigante), f y Vt son inamovibles: tu gobernador solo cambia P y tu excitación solo cambia Q — la red absorbe todo lo demás. En una RED AISLADA (dos generadores solos con su carga), no hay nadie más: la frecuencia ES el balance Pm–PL y el voltaje ES el balance de excitación contra los reactivos de la carga. El mismo mando que en la red grande «solo movía tu P» ahora mueve la frecuencia de todos. Sobre esto se montan los niveles de control: la regulación PRIMARIA (el estatismo, actúa en segundos, reparte pero deja caer f), el control SECUNDARIO o AGC (minutos, desplaza las consignas en bloque para devolver los 60 Hz) y el AVR sobre cada campo (sostiene Vt y reparte los kVAR)."
        analogy="Pedalear en un pelotón enorme vs. en una bicicleta tándem de dos. En el pelotón (barra infinita) tu esfuerzo no cambia la velocidad del grupo: solo decide cuánto arrastras tú. En el tándem (isla), cada golpe de pedal se siente en el velocímetro: la velocidad es de ambos y la fabrican ambos."
      >
        <Formula
          latex="\underbrace{f = f_0 - kP}_{\text{primaria (s)}} \qquad \underbrace{f_0 \leftarrow f_0 + \Delta}_{\text{AGC (min): restaura 60 Hz}} \qquad \underbrace{E_{af} \leftarrow \text{AVR}}_{\text{tensión y kVAR}}"
          symbols={[
            { sym: 'f = f_0 - kP', meaning: 'Regulación primaria: automática e instantánea. REPARTE los cambios de carga entre las máquinas, pero deja la frecuencia desviada — el estatismo es un reparto, no un termostato.' },
            { sym: 'f_0 + \\Delta', meaning: 'Control secundario (AGC): mueve TODAS las consignas en bloque. Cambia la frecuencia sin alterar el reparto (la diferencia de setpoints no se toca).' },
            { sym: '\\text{AVR}', meaning: 'Regulador automático de voltaje: el lazo de excitación que sostiene Vt. Su «AGC reactivo» es el reparto de kVAR entre unidades (compensación de la Fig. 5-30, automatizada).' },
          ]}
        />
      </ConceptBlock>

      <ConceptBlock
        title="7.5 · ¿Cuándo deja de ser segura la maniobra? Los límites"
        idea="Repartir carga no es solo aritmética de rectas: cada punto de operación debe caber dentro de la CARTA DE CAPACIDAD (Cap. 5.4). Límite de armadura: S = √(P²+Q²) ≤ Smax (el cobre del estator se calienta con la corriente TOTAL, activa o reactiva). Límite de campo (OEL): sobreexcitar para acaparar kVAR calienta el rotor. Límite de subexcitación (UEL): absorber demasiados kVAR acerca la máquina a la pérdida de sincronismo — con Eaf pequeña, Eaf·Vt/Xs puede quedar por debajo de la P que exige el gobernador y la máquina se desliza del «resorte» magnético (relé 78). Y el límite de POTENCIA INVERSA (relé 32): si descargas de más un generador, la red lo arrastra como motor — su turbina no está hecha para eso."
        analogy="La carta de capacidad es el «sobre de vuelo» de un avión: puedes volar en cualquier punto interior, pero cada frontera es un modo distinto de romper la máquina — velocidad máxima (armadura), techo (campo), pérdida de sustentación (estabilidad). El buen operador no memoriza el borde: DESPACHA lejos de él."
      >
        <Formula
          latex="P^2 + Q^2 \le S_{max}^2 \qquad Q \ge Q_{UEL}(P) \qquad P > 0\;(\text{relé }32) \qquad \sin\delta = \frac{P X_s}{E_{af} V_t} < 1"
          symbols={[
            { sym: 'S_{max}', meaning: 'Corriente máxima de armadura × Vt. Es un CÍRCULO en el plano P–Q: puedes gastar tu corriente en watts o en vars, pero no en ambos a tope.' },
            { sym: 'Q_{UEL}(P)', meaning: 'Frontera de subexcitación: mientras más P entregas, menos kVAR puedes absorber. La fija el margen de estabilidad y el calentamiento en los extremos del estator.' },
            { sym: '\\sin\\delta < 1', meaning: 'La condición de existencia del sincronismo: si bajas Eaf (o sube P) hasta que P·Xs > Eaf·Vt, NO existe ángulo que transmita esa potencia — la máquina se desliza y el relé 78 la saca.' },
          ]}
        />
      </ConceptBlock>

      <SalaControlLab />

      <FeynmanCheck
        id="s7-check-isla"
        question="En la sala de control notas que la frecuencia está clavada en 60.00 Hz sin AGC, hagas lo que hagas con un gobernador. ¿Qué concluyes?"
        options={[
          {
            label: 'El sistema está en modo red aislada y perfectamente balanceado.',
            feedback:
              'En una isla el balance perfecto es un instante, no un estado: cualquier movimiento de TU gobernador cambiaría Pm y movería f. Si f no responde a tus mandos, no estás solo en la red.',
          },
          {
            label: 'Estás conectado a una barra infinita (o a una red tan grande que tu máquina no puede moverle la frecuencia): tu gobernador solo decide TU potencia.',
            correct: true,
            feedback:
              'Exacto. Es el diagnóstico operativo clave: f insensible a tus mandos = red domina. El mismo razonamiento aplica al voltaje con la excitación. En isla, en cambio, cada consigna tuya se siente en f y en Vt — mismo tablero, física distinta.',
          },
          {
            label: 'El AGC de tu planta está activado aunque el selector diga lo contrario.',
            feedback:
              'Un AGC corrige en decenas de segundos, no instantáneamente: verías a f desviarse y REGRESAR (y a las consignas moverse solas). Una f que jamás se inmuta señala que la fija alguien mucho más grande que tú.',
          },
        ]}
      />

      <FeynmanCheck
        id="s7-check-diagnostico"
        question="Diagnóstico de guardia: la red aislada opera con G₁ y G₂ en paralelo. Síntomas: tensión de barra BAJA (0.93 pu), frecuencia normal (60.0 Hz), y G₂ absorbiendo MVAr (Q₂ < 0) mientras G₁ está cerca de su límite de campo. ¿Cuál es la acción correcta?"
        options={[
          {
            label: 'Subir los gobernadores de ambas máquinas para levantar la barra.',
            feedback:
              'La frecuencia está BIEN — los gobernadores no tienen nada que corregir (y subirlos la sacaría de 60 Hz). El síntoma es de tensión/reactivos: es un problema del lazo de EXCITACIÓN, no del de potencia.',
          },
          {
            label: 'Subir la excitación de G₂: aporta los kVAR que hoy absorbe, alivia el campo de G₁ y levanta la tensión — un solo mando corrige los tres síntomas.',
            correct: true,
            feedback:
              'Exacto. Q₂ < 0 con V baja delata a G₂ subexcitado: no solo no ayuda — le ROBA reactivos a G₁, que por eso roza su OEL. Subir If₂ ataca la causa: G₂ pasa a aportar kVAR, G₁ se descarga de campo y Vt sube. Frecuencia: intacta, porque no tocaste ningún gobernador.',
          },
          {
            label: 'Abrir el interruptor de G₂: si absorbe reactivos, está estorbando.',
            feedback:
              'G₂ está entregando sus MW — sacarlo provocaría un golpe de carga sobre G₁ (f caería) y perderías su capacidad reactiva justo cuando falta tensión. Absorber kVAR no es falla: es un ajuste de excitación mal hecho, y se corrige con la perilla, no con el interruptor.',
          },
        ]}
      />

      <SolvedProblem
        id="s7-problema-integrador"
        numero="49"
        title="La maniobra completa: sincronizar, cargar, repartir y retirar"
        statement={
          <>
            En una red aislada, G₁ (k = 0.3 Hz/MW, gobernador en 61.8 Hz) alimenta solo una carga de{' '}
            <strong>6 MW, fp 0.83 atraso (4 MVAr)</strong> a 60.0 Hz y Vt = 1.0 pu. Se quiere
            incorporar G₂ (idéntico, Xₛ = 0.8 pu, base 10 MVA), pasarle la mitad de la carga (MW y
            MVAr) y finalmente <strong>retirar G₁ de servicio</strong>. Determine:{' '}
            <strong>(a)</strong> la consigna del gobernador de G₂ para sincronizar sin choque;{' '}
            <strong>(b)</strong> las consignas finales de ambos gobernadores para P₁ = P₂ = 3 MW a
            60.0 Hz; <strong>(c)</strong> la Eaf de cada máquina cuando comparten 2 MVAr cada una
            (use Q ≈ Vt(Eaf−Vt)/Xₛ); <strong>(d)</strong> la secuencia segura para retirar G₁ y qué
            relé actúa si se hace mal.
          </>
        }
        steps={[
          {
            title: '(a) Sincronizar: entrar existiendo sin empujar',
            why: 'Para que G₂ cierre sin tomar ni soltar carga, su recta debe pasar por el punto de operación actual: a P = 0, su frecuencia en vacío debe ser LA frecuencia de barra.',
            work: `f_{0,2} = f_{barra} = 60.0\\ \\text{Hz} \\qquad (P_2 = \\tfrac{60.0-60.0}{0.3} = 0\\ \\text{MW al cierre})`,
            note: 'Y su excitación debe dar |V₂| = Vt = 1.0 pu. Cerrar con f₀ más alta habría inyectado potencia de golpe; más baja, la habría absorbido (¡motorización al primer segundo!).',
          },
          {
            title: '(b) Cargar MW: mover los DOS gobernadores en tijera',
            why: 'P₂ = 3 MW exige f₀,₂ = 60 + 0.3·3 = 60.9. Pero si solo subes G₂, la frecuencia del sistema sube; G₁ debe bajar de 61.8 a 60.9 para que a 60.0 Hz entregue exactamente 3 MW.',
            work: `f_{0,1} = 60 + 0.3(3) = 60.9\\ \\text{Hz} \\qquad f_{0,2} = 60 + 0.3(3) = 60.9\\ \\text{Hz}`,
            note: 'Verificación con el estatismo: f = (60.9+60.9−0.3·6)/2 = 60.0 Hz ✓. Consignas iguales → reparto igual: la simetría del despacho está en los setpoints, no en las máquinas.',
          },
          {
            title: '(c) Repartir MVAr: las excitaciones',
            why: 'Con Q ≈ Vt(Eaf−Vt)/Xₛ (en pu), cada máquina necesita Q = 0.2 pu (2 MVAr en base 10 MVA).',
            work: `E_{af} = V_t + \\frac{Q_{pu} X_s}{V_t} = 1 + (0.2)(0.8) = 1.16\\ \\text{pu} \\;\\;(\\text{ambas})`,
            note: 'Si una quedara en 1.0 y la otra en 1.32, los MW seguirían 3–3 pero una cargaría los 4 MVAr sola: misma potencia activa, más corriente y más calentamiento — el reparto reactivo también se diseña.',
          },
          {
            title: '(d) Retirar G₁: descargar ANTES de abrir',
            why: 'Se baja f₀,₁ gradualmente: G₁ suelta MW que G₂ recoge (su recta no se movió, así que f cae un poco — el AGC o un retoque a f₀,₂ la sostiene). Con P₁ ≈ 0 y Q₁ ≈ 0 (bajando también If₁), abrir 52-G1 es un no-evento.',
            work: `f_{0,1} \\to 60.0 \\Rightarrow P_1 \\to 0 \\qquad f_{0,2} \\to 60 + 0.3(6) = 61.8\\ \\text{Hz} \\Rightarrow P_2 = 6\\ \\text{MW},\\; f = 60.0`,
            note: 'Si en vez de descargar se baja f₀,₁ por DEBAJO de la frecuencia de barra, P₁ se hace negativa: la red arrastra a G₁ como motor y el relé 32 (potencia inversa) lo dispara — la turbina de vapor no tolera girar «empujada» (sobrecalentamiento de álabes).',
          },
        ]}
        answer={`\\text{(a)}\\ f_{0,2} = 60.0\\ \\text{Hz},\\ |V_2| = V_t \\quad \\text{(b)}\\ f_{0,1} = f_{0,2} = 60.9\\ \\text{Hz} \\quad \\text{(c)}\\ E_{af} = 1.16\\ \\text{pu} \\quad \\text{(d)}\\ P_1 \\to 0,\\ \\text{luego abrir}`}
        takeaway="Toda la sección en una maniobra: sincronizar es igualar (f, V, fase), cargar es mover setpoints en tijera, repartir vars es igualar excitaciones, y retirar es el sincronizar al revés — descargar hasta que abrir no sea un evento. Ejecútala en la Sala de control."
      />

      <div className="my-8 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Síntesis Feynman · Sección 7
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Sincronizar = igualar |V|, f, secuencia y FASE, y cerrar S₂ cuando el voltaje a través del interruptor pasa por cero (sincroscopio en las 12). Cerrar fuera de fase es un cortocircuito con castigo mecánico.</li>
          <li>Los watts se reparten con los GOBERNADORES: cada máquina impulsora impone su recta <InlineMath latex="f = f_{\text{vacío}} - kP" /> y la frecuencia común es donde las rectas suman la carga (Fig. 5-29). Suma de setpoints → f; diferencia → reparto.</li>
          <li>Los vars se reparten con la EXCITACIÓN: subir If₁ y bajar If₂ mueve kVAR del 2 al 1 sin tocar un solo watt — las puntas de los Êaf viajan por la recta <InlineMath latex="E_{af}\sin\delta = \text{cte}" /> (Fig. 5-30).</li>
          <li>Manual del operador (§5-9): P↔f con gobernadores y AGC; Q↔V con reguladores de voltaje sobre los campos. Dos lazos casi independientes — por eso una red con miles de máquinas es gobernable.</li>
          <li>Mismos mandos, dos escenarios: contra barra infinita solo mueves TU P y TU Q; en red aislada fabricas la f y la V de todos. Jerarquía: primaria (estatismo, s) → secundaria (AGC, min) → AVR (tensión/kVAR).</li>
          <li>Toda maniobra vive dentro de la carta de capacidad: armadura (S ≤ Smax), campo (OEL), subexcitación (UEL/estabilidad, sen δ &lt; 1) y potencia inversa (relé 32). Repartir bien también es no acercarse a los bordes.</li>
        </ul>
      </div>
    </section>
  )
}
