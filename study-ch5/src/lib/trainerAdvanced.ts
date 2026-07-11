import { fmt, syncSpeedRpm } from './machine'
import { mcq, pick, rnd, type TrainerFamily } from './trainerCore'

// ---------------------------------------------------------------------------
// Banco avanzado del Entrenador: siembra los bloques que el temario base no
// cubre — componentes simétricas, monofásicos, armónicos, PMSM, paso a paso,
// autotransformador, bancos en paralelo, protecciones, saturación, selección
// industrial, normas de eficiencia y un caso abierto con supuestos declarados.
// ---------------------------------------------------------------------------

// ------------------------- NIVEL 2 -----------------------------------------

const monofasico: TrainerFamily = {
  id: 'n2-monofasico',
  title: 'Motor monofásico: doble campo giratorio',
  chapter: 7,
  level: 2,
  generate() {
    const poles = pick([2, 4] as const)
    const ns = syncSpeedRpm(60, poles)
    const s = rnd(3, 7, 1) / 100
    const nm = Math.round((1 - s) * ns)
    const sReal = (ns - nm) / ns
    const sB = 2 - sReal
    const fB = sB * 60
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 2,
      statement: `Un motor monofásico de inducción de ${poles} polos, 60 Hz, con capacitor de arranque de 88 µF, gira a ${nm} r/min. Según la teoría del doble campo giratorio, halle el deslizamiento respecto al campo INVERSO (s_b) y la frecuencia que ese campo induce en el rotor.`,
      data: [
        { label: 'Polos / frecuencia', value: `${poles} · 60 Hz`, tag: 'útil' },
        { label: 'Velocidad nₘ', value: `${nm} r/min`, tag: 'útil' },
        { label: 'Capacitor de arranque', value: '88 µF', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Cómo modela la teoría clásica al devanado monofásico?', [
        { label: 'Como DOS campos giratorios de media amplitud en sentidos opuestos: el rotor persigue a uno y arrastra al otro', correct: true, feedback: 'Un campo pulsante = suma de dos campos giratorios contrarrotantes — el truco de descomposición que hace tratable el motor monofásico.' },
        { label: 'Como un campo giratorio único más débil', feedback: 'Un devanado monofásico NO puede crear un campo giratorio solo: crea uno pulsante, que se descompone en dos giratorios.' },
        { label: 'Como una máquina de CC sin colector', feedback: 'Sigue siendo inducción de CA — la peculiaridad es el campo pulsante, no la conmutación.' },
      ]),
      datos: mcq('El capacitor de 88 µF…', [
        { label: 'Es irrelevante para lo pedido: sirve para ARRANCAR (crear el segundo campo con desfase), pero a régimen ya está desconectado', correct: true, feedback: 'El interruptor centrífugo lo saca cerca del 75 % de la velocidad: en operación normal el motor es genuinamente monofásico.' },
        { label: 'Determina el deslizamiento de régimen', feedback: 'El deslizamiento lo fija la carga; el capacitor solo resuelve el problema del arranque (par cero a rotor parado).' },
        { label: 'Fija la frecuencia del campo inverso', feedback: 'La frecuencia del campo inverso es cinemática pura: (2−s)·f, sin capacitores de por medio.' },
      ]),
      metodo: mcq('El deslizamiento respecto al campo inverso es…', [
        { label: 's_b = 2 − s: el campo inverso gira a −nₛ, así que el rotor se aleja de él casi al doble de la síncrona', correct: true, feedback: 's_b = (−nₛ−nₘ)/(−nₛ) = 2−s. El rotor casi «huye» del campo inverso a 2nₛ relativos.' },
        { label: 's_b = 1 − s', feedback: 'Eso sería respecto a un campo detenido. El inverso GIRA en contra: la velocidad relativa es nₛ+nₘ.' },
        { label: 's_b = s, por simetría', feedback: 'La simetría existe solo a rotor parado (s = s_b = 1) — girando, los dos campos viven realidades opuestas.' },
      ]),
      supuestos: [
        { label: 'Régimen permanente con el capacitor ya desconectado', correcto: true },
        { label: 'Descomposición del campo pulsante en dos giratorios de media amplitud', correcto: true },
        { label: 'El campo inverso produce par útil', correcto: false },
      ],
      respuestas: [
        { label: 's_b (campo inverso)', value: sB, unit: '—' },
        { label: 'f del rotor (inverso)', value: fB, unit: 'Hz' },
      ],
      validacion: mcq(`El campo inverso induce ${fmt(fB, 0)} Hz (≈2f). ¿Qué implica en la práctica?`, [
        { label: 'Corrientes de alta frecuencia en el rotor que solo producen pérdidas y par de frenado — por eso el monofásico vibra al doble de la frecuencia y rinde menos que el trifásico', correct: true, feedback: 'El par pulsante a 2f (120 Hz) es la firma acústica del motor monofásico — y su castigo de rendimiento.' },
        { label: 'El rotor se acelera hasta el doble de la síncrona', feedback: 'El campo inverso FRENA (par negativo pequeño); jamás acelera al rotor.' },
        { label: 'Nada: el campo inverso desaparece en marcha', feedback: 'Se atenúa pero no desaparece: sus pérdidas y su par de freno acompañan al motor siempre.' },
      ]),
      solucion: [
        `nₛ = ${ns} r/min → s = (${ns}−${nm})/${ns} = ${fmt(sReal, 3)}`,
        `s_b = 2 − s = ${fmt(sB, 3)}`,
        `f_rotor(inverso) = s_b·f = ${fmt(fB, 1)} Hz ≈ 2f — puro calentamiento y vibración a 120 Hz`,
      ],
    }
  },
}

const armonicos: TrainerFamily = {
  id: 'n2-armonicos',
  title: 'Armónicos: THD y corriente eficaz',
  chapter: 2,
  level: 2,
  generate() {
    const I1 = rnd(80, 160, 20)
    const p5 = rnd(18, 30, 2)
    const p7 = rnd(9, 14, 1)
    const p11 = rnd(4, 8, 1)
    const I5 = (I1 * p5) / 100
    const I7 = (I1 * p7) / 100
    const I11 = (I1 * p11) / 100
    const thd = (Math.hypot(I5, I7, I11) / I1) * 100
    const Irms = Math.sqrt(I1 * I1 + I5 * I5 + I7 * I7 + I11 * I11)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 2,
      statement: `Un variador de 6 pulsos toma de la red una corriente con fundamental I₁ = ${I1} A y armónicos I₅ = ${fmt(I5, 1)} A, I₇ = ${fmt(I7, 1)} A, I₁₁ = ${fmt(I11, 1)} A (los demás, despreciables). El fp de desplazamiento es 0.95. Halle la THD de corriente y la corriente eficaz total que ve el transformador.`,
      data: [
        { label: 'I₁ (fundamental)', value: `${I1} A`, tag: 'útil' },
        { label: 'I₅ · I₇ · I₁₁', value: `${fmt(I5, 1)} · ${fmt(I7, 1)} · ${fmt(I11, 1)} A`, tag: 'útil' },
        { label: 'fp de desplazamiento', value: '0.95', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Por qué un rectificador de 6 pulsos «ensucia» la corriente?', [
        { label: 'Es una carga NO LINEAL: toma corriente en pulsos, y todo lo periódico no senoidal se descompone en armónicos (aquí los característicos 6k±1: 5º, 7º, 11º…)', correct: true, feedback: 'La familia 6k±1 es la huella dactilar del puente de 6 pulsos.' },
        { label: 'Su factor de potencia es bajo', feedback: 'El fp puede ser alto y la corriente seguir distorsionada: distorsión y desfase son fenómenos distintos.' },
        { label: 'Genera corriente continua en la red', feedback: 'Un puente sano no inyecta CC apreciable — inyecta armónicos impares no múltiplos de 3.' },
      ]),
      datos: mcq('¿El fp de desplazamiento entra en la THD?', [
        { label: 'No: la THD compara MAGNITUDES de armónicos contra la fundamental; el desfase de la fundamental es otro capítulo (fp total = fp_desp · fp_distorsión)', correct: true, feedback: 'Separar distorsión de desfase es la clave conceptual de calidad de energía.' },
        { label: 'Sí: multiplica cada armónico', feedback: 'Los armónicos tienen sus propias fases, pero la THD es un cociente de valores eficaces — el fp no aparece.' },
        { label: 'Solo si supera 0.9', feedback: 'No hay umbral: simplemente no pertenece a la fórmula de THD.' },
      ]),
      metodo: mcq('Fórmulas:', [
        { label: 'THD = √(I₅²+I₇²+I₁₁²)/I₁ y I_rms = √(I₁²+ΣI_h²) — suma CUADRÁTICA, nunca aritmética', correct: true, feedback: 'Los armónicos son ortogonales: sus potencias se suman, no sus amplitudes.' },
        { label: 'THD = (I₅+I₇+I₁₁)/I₁', feedback: 'Suma aritmética sobreestima: las componentes de distinta frecuencia se combinan en cuadratura.' },
        { label: 'I_rms = I₁·fp', feedback: 'Eso mezclaría desfase con distorsión — y el fp ni siquiera pertenece a este cálculo.' },
      ]),
      supuestos: [
        { label: 'Armónicos superiores al 11º despreciables', correcto: true },
        { label: 'Componentes ortogonales: suma cuadrática de eficaces', correcto: true },
        { label: 'La THD depende del desfase de la fundamental', correcto: false },
      ],
      respuestas: [
        { label: 'THD de corriente', value: thd, unit: '%' },
        { label: 'I_rms total', value: Irms, unit: 'A' },
      ],
      validacion: mcq(`THD = ${fmt(thd, 0)} %. ¿Cuadra con el equipo?`, [
        { label: 'Sí: un 6 pulsos sin filtro ronda 25–40 % de THDi — y ese exceso de I_rms calienta el transformador (por eso existen los de «factor K»)', correct: true, feedback: 'Chequeo doble: el rango típico del equipo y la consecuencia térmica del I_rms extra.' },
        { label: 'No: ningún equipo real supera 5 % de THD', feedback: 'El 5 % es un LÍMITE deseable en tableros (IEEE-519), no lo que un rectificador crudo produce.' },
        { label: 'La THD debería dar exactamente 100 %', feedback: 'Eso sería una corriente con tanta distorsión como fundamental — un caso extremo, no un 6 pulsos.' },
      ]),
      solucion: [
        `THD = √(${fmt(I5, 1)}²+${fmt(I7, 1)}²+${fmt(I11, 1)}²)/${I1} = ${fmt(thd, 1)} %`,
        `I_rms = √(${I1}²+…) = ${fmt(Irms, 1)} A (${fmt(((Irms - I1) / I1) * 100, 1)} % más que la fundamental)`,
        'El fp de desplazamiento era de otro problema: fp_total = fp_desp·fp_dist.',
      ],
    }
  },
}

const saturada: TrainerFamily = {
  id: 'n2-saturada',
  title: 'OCC/SCC: SCR y Xs saturada',
  chapter: 5,
  level: 2,
  generate() {
    const afnl = rnd(300, 500, 25)
    const afsc = rnd(200, 400, 20)
    const scr = afnl / afsc
    const xsat = 1 / scr
    const afag = Math.round(afnl * 0.82)
    return {
      familyId: this.id,
      title: this.title,
      chapter: 5,
      level: 2,
      statement: `De los ensayos de un generador síncrono: AFNL = ${afnl} A (corriente de campo para tensión nominal en vacío, sobre la OCC saturada) y AFSC = ${afsc} A (corriente de campo para corriente nominal de armadura en cortocircuito). La línea de entrehierro daría tensión nominal con ${afag} A. Halle la relación de cortocircuito (SCR) y la reactancia síncrona SATURADA en por-unidad.`,
      data: [
        { label: 'AFNL (OCC saturada)', value: `${afnl} A`, tag: 'útil' },
        { label: 'AFSC (SCC)', value: `${afsc} A`, tag: 'útil' },
        { label: 'If en línea de entrehierro', value: `${afag} A`, tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué mide físicamente la SCR?', [
        { label: 'Cuánta corriente de cortocircuito produce la excitación que da tensión nominal: es el inverso de la Xs saturada en pu', correct: true, feedback: 'SCR alta = máquina «rígida» (Xs baja, más hierro y cobre); SCR baja = máquina económica pero sensible.' },
        { label: 'El rendimiento del generador en cortocircuito', feedback: 'En corto no hay potencia útil que medir — la SCR es una razón de excitaciones, no de potencias.' },
        { label: 'La saturación del rotor', feedback: 'Involucra la saturación del ESTATOR/núcleo vía la OCC, pero la SCR en sí es la razón AFNL/AFSC.' },
      ]),
      datos: mcq('¿Para qué serviría el dato de la línea de entrehierro (que aquí sobra)?', [
        { label: 'Para la Xs NO saturada — comparar máquina ideal-lineal vs real. Para la SATURADA se usa AFNL de la OCC real', correct: true, feedback: 'Cada reactancia tiene su recta: entrehierro → no saturada; OCC real → saturada (la de operación).' },
        { label: 'Es imprescindible para la SCR', feedback: 'SCR = AFNL/AFSC — solo esas dos. La línea de entrehierro pertenece a la variante no saturada.' },
        { label: 'Para calcular las pérdidas del núcleo', feedback: 'Las pérdidas exigen potencias medidas, no puntos de la característica.' },
      ]),
      metodo: mcq('Relaciones:', [
        { label: 'SCR = AFNL/AFSC y Xs_sat(pu) = 1/SCR — directa de la definición y de la SCC lineal', correct: true, feedback: 'La SCC es recta (máquina sin saturar en corto), así que las corrientes de campo son proporcionales a sus efectos.' },
        { label: 'SCR = AFSC/AFNL', feedback: 'Invertida: te daría Xs_sat directamente pero llamándola SCR — cuida la convención.' },
        { label: 'Xs_sat = AFNL·AFSC', feedback: 'Un producto de corrientes de campo no tiene unidades de reactancia ni sentido físico aquí.' },
      ]),
      supuestos: [
        { label: 'La característica de cortocircuito es lineal (sin saturación en corto)', correcto: true },
        { label: 'Xs_sat evaluada en el punto de tensión nominal', correcto: true },
        { label: 'La OCC y la línea de entrehierro coinciden a tensión nominal', correcto: false },
      ],
      respuestas: [
        { label: 'SCR', value: scr, unit: '—' },
        { label: 'Xs saturada', value: xsat, unit: 'pu' },
      ],
      validacion: mcq(`Xs_sat = ${fmt(xsat, 2)} pu. ¿Rango creíble?`, [
        { label: 'Sí: los turbogeneradores rondan 0.6–2.0 pu — y la saturada siempre es MENOR que la no saturada (el hierro saturado «ayuda» menos al flujo de reacción)', correct: true, feedback: 'Si te diera 0.05 pu o 10 pu, revisa el cociente: probablemente lo invertiste.' },
        { label: 'No: Xs siempre es menor que 0.2 pu', feedback: 'Eso es X″ (subtransitoria). La síncrona de régimen es un orden de magnitud mayor.' },
        { label: 'Debe ser exactamente 1.0 pu en toda máquina', feedback: 'Casualidad de diseño en algunas — no una ley.' },
      ]),
      solucion: [
        `SCR = AFNL/AFSC = ${afnl}/${afsc} = ${fmt(scr, 3)}`,
        `Xs_sat = 1/SCR = ${fmt(xsat, 3)} pu`,
        `El dato de la línea de entrehierro era para OTRA pregunta (la no saturada: Xs_unsat = AFSC/If_ag = ${fmt(afsc / afag, 2)} pu > Xs_sat, como debe ser).`,
      ],
    }
  },
}

const pmsm: TrainerFamily = {
  id: 'n2-pmsm',
  title: 'PMSM: constantes de par y de FEM',
  chapter: 8,
  level: 2,
  generate() {
    const ke = rnd(6, 14, 1) / 100
    const nrpm = rnd(2000, 4000, 500)
    const I = rnd(6, 20, 2)
    const w = (nrpm * 2 * Math.PI) / 60
    const E = ke * w
    const T = ke * I
    return {
      familyId: this.id,
      title: this.title,
      chapter: 8,
      level: 2,
      statement: `Un servomotor PMSM tiene constante de FEM kₑ = ${fmt(ke, 2)} V·s/rad (imanes de NdFeB, 8 polos). Gira a ${nrpm} r/min con corriente de cuadratura i_q = ${I} A (control FOC con i_d = 0). Halle la FEM interna E y el par T.`,
      data: [
        { label: 'kₑ', value: `${fmt(ke, 2)} V·s/rad`, tag: 'útil' },
        { label: 'Velocidad', value: `${nrpm} r/min`, tag: 'útil' },
        { label: 'i_q', value: `${I} A`, tag: 'útil' },
        { label: 'Material / polos', value: 'NdFeB · 8 polos', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué es un PMSM en términos de este curso?', [
        { label: 'Una máquina SÍNCRONA cuyo devanado de campo fue reemplazado por imanes: excitación fija, sin anillos, sin deslizamiento', correct: true, feedback: 'Todo el capítulo 5 aplica con Eaf = kₑ·ω fija por los imanes — y el capítulo 8 le pone el control encima.' },
        { label: 'Un motor de inducción con imanes de ayuda', feedback: 'No hay jaula ni deslizamiento: gira exactamente síncrono con el campo del inversor.' },
        { label: 'Una máquina de CC sin escobillas, con conmutación mecánica interna', feedback: 'La conmutación es ELECTRÓNICA (el inversor) — la física interna es de máquina síncrona de CA.' },
      ]),
      datos: mcq('¿Los 8 polos y el NdFeB entran al cálculo pedido?', [
        { label: 'No: ya están «cocinados» dentro de kₑ — los polos importarían para convertir velocidad eléctrica↔mecánica y el imán fija el nivel de flujo que kₑ resume', correct: true, feedback: 'Las constantes de catálogo condensan la construcción: úsalo a tu favor y no dupliques información.' },
        { label: 'Sí: hay que multiplicar por los pares de polos', feedback: 'Solo si kₑ viniera en base ELÉCTRICA (rad-el/s). En V·s/rad mecánico ya está todo incluido.' },
        { label: 'El material cambia la fórmula del par', feedback: 'Cambia el VALOR de kₑ (más flujo por volumen), nunca la estructura T = k·i_q.' },
      ]),
      metodo: mcq('Con FOC e i_d = 0:', [
        { label: 'E = kₑ·ω y T = k_t·i_q, con k_t = kₑ numéricamente en SI — el par es lineal con la corriente, como en una máquina de CC', correct: true, feedback: 'La igualdad k_t = kₑ (SI) es conservación de energía: E·i = T·ω. FOC convierte el PMSM en la «CC perfecta».' },
        { label: 'T = kₑ·i_q·sen δ', feedback: 'El sen δ es del análisis en régimen contra red fija; con FOC el control CLAVA la corriente en cuadratura: sen 90° = 1 siempre.' },
        { label: 'E = 4.44·f·N·Φ', feedback: 'Forma de transformador/devanado — válida por dentro, pero kₑ·ω es la versión condensada y directa.' },
      ]),
      supuestos: [
        { label: 'i_d = 0: toda la corriente produce par', correcto: true },
        { label: 'kₑ en unidades SI mecánicas (V·s/rad)', correcto: true },
        { label: 'Sin debilitamiento de campo en este punto', correcto: true },
        { label: 'El par depende de la velocidad', correcto: false },
      ],
      respuestas: [
        { label: 'E', value: E, unit: 'V' },
        { label: 'T', value: T, unit: 'N·m' },
      ],
      validacion: mcq('Chequeo de energía:', [
        { label: 'E·i_q = T·ω — la potencia electromagnética cuadra por construcción (k_t = kₑ)', correct: true, feedback: `${fmt(E, 1)}·${I} = ${fmt(T, 2)}·${fmt(w, 0)} = ${fmt((E * I) / 1000, 2)} kW ✓` },
        { label: 'E debe superar siempre la tensión del bus de CC', feedback: 'Al revés: si E se acerca al bus, el inversor se queda sin margen — ahí empieza el debilitamiento de campo.' },
        { label: 'T·i_q = E·ω', feedback: 'Cruzada — la identidad es E·i = T·ω (ambos lados son la potencia convertida).' },
      ]),
      solucion: [
        `ω = 2π·${nrpm}/60 = ${fmt(w, 1)} rad/s → E = ${fmt(ke, 2)}·${fmt(w, 1)} = ${fmt(E, 1)} V`,
        `T = k_t·i_q = ${fmt(ke, 2)}·${I} = ${fmt(T, 2)} N·m`,
        'Polos y material: cocidos dentro de kₑ. Verificación E·i = T·ω ✓',
      ],
    }
  },
}

const autotrafo: TrainerFamily = {
  id: 'n2-autotrafo',
  title: 'Autotransformador: capacidad multiplicada',
  chapter: 2,
  level: 2,
  generate() {
    const S2w = pick([25, 50, 75] as const)
    const Sauto = S2w * (2640 / 240)
    const Ih = (Sauto * 1000) / 2640
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 2,
      statement: `Un transformador monofásico de dos devanados de ${S2w} kVA, 2400/240 V (η = 98.2 %), se reconecta como AUTOTRANSFORMADOR elevador 2400/2640 V (el devanado de 240 V en serie, aditivo). Halle la nueva capacidad nominal S_auto y la corriente del lado de 2640 V.`,
      data: [
        { label: 'S como dos devanados', value: `${S2w} kVA`, tag: 'útil' },
        { label: 'Tensiones de devanado', value: '2400 / 240 V', tag: 'útil' },
        { label: 'Conexión', value: '2400 → 2640 V (aditiva)', tag: 'útil' },
        { label: 'Rendimiento previo', value: '98.2 %', tag: 'irrelevante' },
      ],
      identificar: mcq('¿De dónde sale la capacidad «extra» del autotransformador?', [
        { label: 'Gran parte de la potencia pasa CONDUCIDA por la conexión galvánica; solo la fracción del devanado serie se TRANSFORMA magnéticamente', correct: true, feedback: 'El hierro y el cobre solo procesan S₂w; el resto fluye por el cable — por eso la misma máquina «puede» con mucho más.' },
        { label: 'El núcleo se magnetiza el doble', feedback: 'El flujo no cambia: cada devanado sigue viendo su tensión de diseño.' },
        { label: 'Es un error: la capacidad no puede aumentar', feedback: 'Aumenta, y mucho — con la contrapartida de perder el aislamiento galvánico entre lados.' },
      ]),
      datos: mcq('¿El rendimiento de 98.2 % entra en el cálculo de S_auto?', [
        { label: 'No — y de hecho el autotransformador rinde AÚN mejor: las pérdidas son las mismas de siempre pero la potencia procesada es mucho mayor', correct: true, feedback: 'Mismas pérdidas ÷ más kVA = rendimiento espectacular (>99.8 % aquí). El dato era contexto.' },
        { label: 'Sí: multiplica la capacidad', feedback: 'La capacidad viene de tensiones y corrientes nominales de los devanados, no del rendimiento.' },
        { label: 'Solo si fuera menor al 95 %', feedback: 'No hay umbral: simplemente no pertenece al cálculo de capacidad.' },
      ]),
      metodo: mcq('La capacidad del autotransformador:', [
        { label: 'S_auto = S₂w·(V_alta_auto/V_serie) = S₂w·(2640/240): la corriente nominal del devanado serie ahora entra a 2640 V', correct: true, feedback: 'El devanado de 240 V lleva su misma corriente nominal, pero el sistema la ve a 2640 V: 11× la potencia.' },
        { label: 'S_auto = 2·S₂w por tener dos devanados en serie', feedback: 'No es un duplicado: es la razón de tensiones (2640/240 = 11) la que multiplica.' },
        { label: 'S_auto = S₂w — la placa no cambia', feedback: 'La placa de DEVANADOS no cambia; la capacidad de la CONEXIÓN sí, y mucho.' },
      ]),
      supuestos: [
        { label: 'Cada devanado opera a su tensión y corriente nominales de diseño', correcto: true },
        { label: 'Polaridad aditiva verificada antes de energizar', correcto: true },
        { label: 'El autotransformador conserva el aislamiento galvánico', correcto: false },
      ],
      respuestas: [
        { label: 'S_auto', value: Sauto, unit: 'kVA' },
        { label: 'I lado 2640 V', value: Ih, unit: 'A' },
      ],
      validacion: mcq(`S_auto = ${fmt(Sauto, 0)} kVA desde solo ${S2w} kVA de máquina. ¿Cuál es el precio oculto?`, [
        { label: 'Sin aislamiento galvánico y con impedancia serie pequeñísima: fallas más violentas y transferencia directa de sobretensiones — por eso se usa solo entre niveles CERCANOS', correct: true, feedback: 'La regla práctica: autotransformador para razones ≲ 3:1; para 2400/240 real (10:1) sería mala idea.' },
        { label: 'Ninguno: es gratis', feedback: 'En ingeniería nada multiplica por 11 gratis — el costo es seguridad y aislamiento.' },
        { label: 'El rendimiento cae proporcionalmente', feedback: 'Al contrario, sube — el precio va por el lado del aislamiento y las fallas.' },
      ]),
      solucion: [
        `S_auto = ${S2w}·(2640/240) = ${fmt(Sauto, 0)} kVA`,
        `I(2640) = ${fmt(Sauto, 0)} kVA/2.64 kV = ${fmt(Ih, 1)} A`,
        `Transformada: solo ${S2w} kVA; conducida: ${fmt(Sauto - S2w, 0)} kVA por la conexión galvánica.`,
      ],
    }
  },
}

// ------------------------- NIVEL 3 -----------------------------------------

const desbalance: TrainerFamily = {
  id: 'n3-desbalance',
  title: 'Componentes simétricas: falla desbalanceada',
  chapter: 6,
  level: 3,
  generate() {
    const tipo = pick(['SLG', 'LL'] as const)
    const X1 = rnd(15, 30, 1) / 100
    const X2 = X1
    const X0 = rnd(5, 10, 1) / 100
    const S = rnd(40, 80, 10)
    const Ibase = (S * 1e6) / (Math.sqrt(3) * 13.8e3) / 1000
    const IfPu = tipo === 'SLG' ? 3 / (X1 + X2 + X0) : Math.sqrt(3) / (X1 + X2)
    const If3f = 1 / X1
    const IfkA = IfPu * Ibase
    const ratio = IfPu / If3f
    const esSLG = tipo === 'SLG'
    return {
      familyId: this.id,
      title: this.title,
      chapter: 6,
      level: 3,
      statement: `Generador de ${S} MVA, 13.8 kV, sólidamente aterrizado, en vacío a tensión nominal. Reactancias de secuencia: X₁ = X₂ = ${fmt(X1, 2)} pu, X₀ = ${fmt(X0, 2)} pu. Ocurre una falla ${esSLG ? 'MONOFÁSICA a tierra (SLG)' : 'BIFÁSICA sin tierra (L-L)'} franca en bornes. Halle la corriente de falla en kA y su razón respecto a la falla trifásica.`,
      data: [
        { label: 'S · V', value: `${S} MVA · 13.8 kV`, tag: 'útil' },
        { label: 'X₁ = X₂', value: `${fmt(X1, 2)} pu`, tag: 'útil' },
        { label: 'X₀', value: `${fmt(X0, 2)} pu`, tag: esSLG ? 'útil' : 'irrelevante' },
        { label: 'Aterrizamiento', value: 'sólido (Zn = 0)', tag: esSLG ? 'útil' : 'irrelevante' },
        { label: 'fp nominal', value: '0.85', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Por qué esta falla exige componentes simétricas?', [
        { label: 'Es DESBALANCEADA: las tres fases dejan de ser idénticas y el análisis por fase colapsa — se descompone en tres sistemas balanceados (positiva, negativa, cero) que sí se resuelven por fase', correct: true, feedback: 'Fortescue: todo desbalance = suma de tres balances. El precio: tres redes de secuencia en vez de una.' },
        { label: 'Porque la corriente es muy grande', feedback: 'La trifásica también es enorme y se resuelve sin simétricas — el criterio es el DESBALANCE, no la magnitud.' },
        { label: 'Porque el generador está en vacío', feedback: 'El estado previo fija E″; la herramienta la exige la asimetría de la falla.' },
      ]),
      datos: mcq(esSLG ? '¿Qué papel juega X₀ aquí?' : '¿Por qué X₀ y el aterrizamiento NO importan en la L-L?', [
        esSLG
          ? { label: 'Central: la SLG involucra tierra, así que la red de secuencia CERO entra en serie — y como X₀ < X₁, ¡la falla a tierra puede superar a la trifásica!', correct: true, feedback: 'El resultado antiintuitivo clave: cerca de generadores sólidamente aterrizados, la peor falla suele ser la monofásica.' }
          : { label: 'La L-L no toca tierra: no circula corriente de secuencia cero y la red cero queda desconectada — X₀ y el aterrizamiento son datos señuelo', correct: true, feedback: 'Cada tipo de falla «activa» sus redes: L-L solo positiva y negativa en paralelo.' },
        { label: 'X₀ es siempre despreciable por ser pequeña', feedback: 'Pequeña ≠ despreciable: en la SLG está en SERIE y su pequeñez AGRANDA la corriente.' },
        { label: 'X₀ solo importa en fallas trifásicas', feedback: 'Exactamente al revés: la trifásica balanceada jamás ve la red de secuencia cero.' },
      ]),
      metodo: mcq('Conexión de redes y fórmula:', [
        esSLG
          ? { label: 'SLG: las TRES redes en SERIE → I₁ = E/(X₁+X₂+X₀) y la corriente de fase fallada I_f = 3·I₁', correct: true, feedback: 'La serie de las tres redes es la firma de la falla a tierra; el 3 viene de Ia = I₁+I₂+I₀ = 3I₁.' }
          : { label: 'L-L: redes positiva y negativa en PARALELO por la falla → I_f = √3·E/(X₁+X₂)', correct: true, feedback: 'Sin tierra no hay secuencia cero; el √3 aparece al volver de secuencias a fases.' },
        { label: 'Multiplicar la falla trifásica por 1.25 (regla práctica)', feedback: 'No existe tal regla universal: la razón depende de X₀ (SLG) o da 0.866 (L-L) — hay que plantear las redes.' },
        { label: 'Sumar las tres reactancias siempre, sea cual sea la falla', feedback: 'La conexión de redes DEPENDE del tipo de falla: serie (SLG), paralelo (L-L), solo positiva (3φ).' },
      ]),
      supuestos: [
        { label: 'Falla franca (Z_falla = 0) desde vacío: E = 1.0 pu', correcto: true },
        { label: 'X₂ ≈ X₁ (rotor cilíndrico, primer instante)', correcto: true },
        { label: esSLG ? 'Neutro sólidamente aterrizado: 3Zn = 0 en la red cero' : 'La red de secuencia cero queda abierta (sin camino a tierra)', correcto: true },
        { label: 'La falla desbalanceada siempre es menor que la trifásica', correcto: false },
      ],
      respuestas: [
        { label: 'I_falla', value: IfkA, unit: 'kA' },
        { label: 'I_falla / I_3φ', value: ratio, unit: '—' },
      ],
      validacion: mcq(`La razón dio ${fmt(ratio, 2)}. ¿Tiene sentido?`, [
        esSLG
          ? { label: `Sí: con X₀ (${fmt(X0, 2)}) < X₁ (${fmt(X1, 2)}), la SLG SUPERA a la trifásica — por eso se aterriza con impedancia cuando hay que limitarla`, correct: true, feedback: '3/(X₁+X₂+X₀) > 1/X₁ siempre que X₀ < X₁. La reactancia de neutro existe para domar este número.' }
          : { label: 'Sí: la L-L da exactamente √3/2 ≈ 0.87 de la trifásica cuando X₂ = X₁ — un resultado fijo que sirve de chequeo universal', correct: true, feedback: '√3/(2X₁) ÷ (1/X₁) = √3/2. Si tu razón L-L no da ~0.87, revisa el planteo.' },
        { label: 'No: toda falla desbalanceada debe ser el doble de la trifásica', feedback: 'No hay tal regla — la relación sale de las redes de secuencia, y en L-L es MENOR que 1.' },
        { label: 'La razón siempre es 1: todas las fallas francas son iguales', feedback: 'Las redes conectadas difieren por tipo de falla: las corrientes también.' },
      ]),
      solucion: esSLG
        ? [
            `I₁ = 1/(X₁+X₂+X₀) = 1/${fmt(X1 + X2 + X0, 2)} = ${fmt(IfPu / 3, 2)} pu → I_f = 3I₁ = ${fmt(IfPu, 2)} pu`,
            `I_base = ${S}/(√3·13.8) = ${fmt(Ibase, 2)} kA → I_f = ${fmt(IfkA, 1)} kA`,
            `I_3φ = 1/X₁ = ${fmt(If3f, 2)} pu → razón = ${fmt(ratio, 2)} ${ratio > 1 ? '> 1: la SLG es la peor — X₀ chica «acorta» el camino' : ''}`,
          ]
        : [
            `I_f = √3/(X₁+X₂) = √3/${fmt(X1 + X2, 2)} = ${fmt(IfPu, 2)} pu (redes + y − en paralelo; la cero ni aparece)`,
            `I_base = ${fmt(Ibase, 2)} kA → I_f = ${fmt(IfkA, 1)} kA`,
            `Razón vs 3φ = √3/2 = ${fmt(ratio, 3)} — X₀ y el aterrizamiento eran señuelos en esta variante.`,
          ],
    }
  },
}

const bancosParalelo: TrainerFamily = {
  id: 'n3-bancos',
  title: 'Bancos 3φ en paralelo: grupo y reparto',
  chapter: 2,
  level: 3,
  generate() {
    const SA = 20
    const SB = 30
    const zA = rnd(45, 60, 5) / 10
    const zB = rnd(65, 80, 5) / 10
    const St = rnd(35, 44, 1)
    const zAp = zA * (SB / SA)
    const shareA = (St * zB) / (zAp + zB)
    const shareB = St - shareA
    return {
      familyId: this.id,
      title: this.title,
      chapter: 2,
      level: 3,
      statement: `Dos bancos trifásicos 13.8/138 kV van a operar en paralelo: banco A de ${SA} MVA con Z = ${fmt(zA, 1)} % (grupo Dyn1) y banco B de ${SB} MVA con Z = ${fmt(zB, 1)} % (grupo Dyn1). El conjunto alimenta ${St} MVA. Verifique la compatibilidad y halle cuánta carga toma cada banco. Pérdidas de vacío: 18 y 24 kW.`,
      data: [
        { label: 'Banco A', value: `${SA} MVA · ${fmt(zA, 1)} % · Dyn1`, tag: 'útil' },
        { label: 'Banco B', value: `${SB} MVA · ${fmt(zB, 1)} % · Dyn1`, tag: 'útil' },
        { label: 'Carga total', value: `${St} MVA`, tag: 'útil' },
        { label: 'Pérdidas de vacío', value: '18 / 24 kW', tag: 'irrelevante' },
      ],
      identificar: mcq('Antes de repartir nada: ¿qué DEBE coincidir para paralelar bancos?', [
        { label: 'Relación de tensiones, polaridad y GRUPO VECTORIAL (mismo desfase, aquí Dyn1-Dyn1 ✓) — si no, circula corriente entre bancos aun sin carga', correct: true, feedback: 'Un Dyn1 con un Dyn11 difieren 60°: la «tensión de error» entre secundarios circularía limitada solo por las Z internas — inaceptable.' },
        { label: 'Solo la potencia nominal', feedback: 'Bancos de distinto tamaño paralelan bien: lo mortal es el desfase de grupo o la relación distinta.' },
        { label: 'Las pérdidas de vacío', feedback: 'Afectan la factura eléctrica, no la compatibilidad.' },
      ]),
      datos: mcq('Las impedancias vienen en % sobre bases DISTINTAS (20 y 30 MVA). ¿Qué haces?', [
        { label: 'Convertir a una base común antes de comparar: Z_A(30 MVA) = Z_A·(30/20) — comparar porcentajes de bases distintas es comparar peras con manzanas', correct: true, feedback: `Z_A pasa de ${fmt(zA, 1)} % a ${fmt(zAp, 2)} % en base 30. AHORA sí se pueden combinar.` },
        { label: 'Usarlas directamente: el % ya es adimensional', feedback: 'Adimensional SÍ, pero relativo a SU base: 5 % de 20 MVA no es la misma impedancia física que 5 % de 30 MVA.' },
        { label: 'Promediarlas', feedback: 'El promedio de dos números en bases distintas no significa nada — primero unificar base.' },
      ]),
      metodo: mcq('El reparto de carga entre bancos en paralelo:', [
        { label: 'Inverso a las impedancias EN BASE COMÚN: S_A = S_t·Z_B′/(Z_A′+Z_B′) — el de menor Z «se lleva» la corriente', correct: true, feedback: 'Divisor de corriente clásico: mismos voltajes en bornes, la Z decide.' },
        { label: 'Proporcional a las potencias nominales', feedback: 'Solo ocurre si las Z en pu propio son IGUALES (diseño coordinado). Aquí difieren: hay que calcular.' },
        { label: 'Mitad y mitad', feedback: 'Ni los tamaños ni las Z son iguales — el reparto igualitario no tiene base física aquí.' },
      ]),
      supuestos: [
        { label: 'Mismos grupos vectoriales y relaciones: sin corriente circulante', correcto: true },
        { label: 'Impedancias convertidas a base común antes del divisor', correcto: true },
        { label: 'Ángulos de las Z similares (reparto por módulos)', correcto: true },
        { label: 'El banco más grande siempre toma más carga', correcto: false },
      ],
      respuestas: [
        { label: 'S del banco A', value: shareA, unit: 'MVA' },
        { label: 'S del banco B', value: shareB, unit: 'MVA' },
      ],
      validacion: mcq(`Banco A: ${fmt(shareA, 1)} MVA de sus ${SA} nominales (${fmt((shareA / SA) * 100, 0)} %). ¿Diagnóstico?`, [
        {
          label: shareA > SA ? 'SOBRECARGADO: aunque al conjunto le sobra capacidad (50 MVA instalados), el reparto por impedancias castiga al banco de menor Z — habría que limitarse o re-impedanciar' : 'Dentro de su nominal — pero nota que el reparto NO es proporcional al tamaño: el divisor de impedancias manda',
          correct: true,
          feedback: 'La lección de paralelo de bancos: capacidad instalada ≠ capacidad utilizable; la fija el peor cociente S_tomada/S_nominal.',
        },
        { label: 'Mientras S_A+S_B = S_t, todo está bien', feedback: 'El balance siempre se cumple — lo que hay que vigilar es CADA banco contra SU placa.' },
        { label: 'El banco B está en peligro por ser más grande', feedback: `B toma ${fmt(shareB, 1)} de sus ${SB} MVA (${fmt((shareB / SB) * 100, 0)} %) — el tamaño no es el riesgo; el cociente sí.` },
      ]),
      solucion: [
        `Grupos Dyn1 = Dyn1 ✓ (con Dyn11 habría 60° y corriente circulante: prohibido)`,
        `Z_A(base 30) = ${fmt(zA, 1)}·(30/20) = ${fmt(zAp, 2)} %`,
        `S_A = ${St}·${fmt(zB, 1)}/(${fmt(zAp, 2)}+${fmt(zB, 1)}) = ${fmt(shareA, 1)} MVA · S_B = ${fmt(shareB, 1)} MVA`,
        `Utilización: A al ${fmt((shareA / SA) * 100, 0)} %, B al ${fmt((shareB / SB) * 100, 0)} % — el reparto lo dictó la Z, no el tamaño.`,
      ],
    }
  },
}

const proteccionMotor: TrainerFamily = {
  id: 'n3-proteccion',
  title: 'Protección de motor: TC, arranque y 51',
  chapter: 7,
  level: 3,
  generate() {
    const hp = pick([60, 75, 100] as const)
    const eta = 0.93
    const fp = 0.87
    const In = (hp * 746) / (eta * Math.sqrt(3) * 460 * fp)
    const ctRatio = In < 90 ? 100 / 5 : In < 140 ? 150 / 5 : 200 / 5
    const ctLabel = In < 90 ? '100/5' : In < 140 ? '150/5' : '200/5'
    const pickupSec = (1.15 * In) / ctRatio
    const arrSec = (6 * In) / ctRatio
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 3,
      statement: `Motor de inducción: ${hp} hp, 460 V, η = 93 %, fp = 0.87, arranque directo de 6·I_n durante 8 s, rotor bloqueado admisible 15 s. Se protege con TC ${ctLabel} y relé de sobrecorriente 51 ajustado al 115 % de la corriente nominal. Halle la corriente de ajuste (pickup) vista por el relé (secundario del TC) y la corriente de arranque en el secundario.`,
      data: [
        { label: 'Placa', value: `${hp} hp · 460 V · η 93 % · fp 0.87`, tag: 'útil' },
        { label: 'TC', value: ctLabel, tag: 'útil' },
        { label: 'Pickup', value: '115 % de I_n', tag: 'útil' },
        { label: 'Arranque / rotor bloqueado', value: '6·I_n por 8 s · 15 s admisible', tag: 'útil' },
        { label: 'Marco / montaje', value: 'NEMA 365T · horizontal', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Cuál es el dilema central de proteger un motor?', [
        { label: 'El relé debe IGNORAR el arranque (6·I_n durante segundos, legítimo) pero DISPARAR ante rotor bloqueado o sobrecarga sostenida — coordinar curvas en la ventana entre 8 y 15 s', correct: true, feedback: 'La curva del 51 debe pasar POR ENCIMA del punto de arranque (6In, 8s) y POR DEBAJO del límite térmico (6In, 15s).' },
        { label: 'Evitar que el motor consuma reactivos', feedback: 'Los reactivos son operación normal del motor — la protección persigue el daño térmico y las fallas.' },
        { label: 'Disparar ante cualquier corriente mayor que la nominal', feedback: 'Eso haría imposible ARRANCAR: toda puesta en marcha supera In por segundos.' },
      ]),
      datos: mcq('¿Para qué sirve el TC en esta cadena?', [
        { label: 'Escala la corriente a niveles de relé (5 A nominales) con una razón fija: todos los ajustes «viajan» divididos por esa razón', correct: true, feedback: 'El TC es el traductor: primario real ↔ secundario de medida. Elegirlo con I_n en ~50–80 % de su primario deja margen.' },
        { label: 'Limita la corriente de falla del motor', feedback: 'Un TC MIDE, no limita — la limitación es del circuito y sus impedancias.' },
        { label: 'Aísla galvánicamente el motor de la red', feedback: 'Aísla el CIRCUITO DE MEDIDA, no la potencia.' },
      ]),
      metodo: mcq('Cadena de cálculo:', [
        { label: 'I_n = P/(η·√3·V·fp) → pickup_primario = 1.15·I_n → pickup_secundario = pickup/(razón del TC); ídem para 6·I_n', correct: true, feedback: 'Placa → primario → secundario: tres eslabones, cada uno con su conversión explícita.' },
        { label: 'Ajustar el relé directamente a 6·I_n', feedback: 'Ajustar el PICKUP al arranque dejaría al motor sin protección de sobrecarga (1.2–5·In pasarían libres).' },
        { label: 'pickup = 115 % de la corriente del TC (5 A)', feedback: 'El 115 % es sobre la corriente NOMINAL DEL MOTOR, no sobre el secundario nominal del TC.' },
      ]),
      supuestos: [
        { label: 'TC ideal en su rango (sin saturación a 6·I_n)', correcto: true },
        { label: 'El 115 % da margen de servicio sin tolerar sobrecarga dañina', correcto: true },
        { label: 'La curva del 51 se elegirá entre el arranque (8 s) y el límite térmico (15 s)', correcto: true },
        { label: 'El pickup debe superar la corriente de arranque', correcto: false },
      ],
      respuestas: [
        { label: 'Pickup en secundario', value: pickupSec, unit: 'A' },
        { label: 'I arranque en secundario', value: arrSec, unit: 'A' },
      ],
      validacion: mcq('Coordinación temporal: ¿dónde debe pasar la curva del relé en (6·I_n)?', [
        { label: 'Entre 8 y 15 s: por encima del arranque real (no dispara al arrancar) y por debajo del daño de rotor bloqueado (sí dispara si no arranca)', correct: true, feedback: 'La ventana 8–15 s ES el problema de coordinación: estrecha pero suficiente con curvas inversas estándar.' },
        { label: 'Por debajo de 8 s, para máxima seguridad', feedback: 'Dispararía en CADA arranque legítimo: el motor jamás entraría en servicio.' },
        { label: 'Por encima de 15 s, para máxima disponibilidad', feedback: 'El rotor bloqueado se dañaría ANTES de que el relé actúe: protección de papel.' },
      ]),
      solucion: [
        `I_n = ${hp}·746/(0.93·√3·460·0.87) = ${fmt(In, 1)} A`,
        `pickup = 1.15·${fmt(In, 1)} = ${fmt(1.15 * In, 1)} A primarios → /${ctLabel.replace('/5', '')}·5 → ${fmt(pickupSec, 2)} A en el relé`,
        `I_arr = 6·I_n → ${fmt(arrSec, 1)} A secundarios · curva del 51 entre 8 y 15 s en ese punto`,
      ],
    }
  },
}

const seleccionMotor: TrainerFamily = {
  id: 'n3-seleccion',
  title: 'Selección de motor por datos industriales',
  chapter: 7,
  level: 3,
  generate() {
    const T = rnd(150, 260, 10)
    const n = 1470
    const w = (n * 2 * Math.PI) / 60
    const P = (T * w) / 1000
    const derate = 0.92
    const Preq = P / derate
    const catalogo = [22, 30, 37, 45, 55]
    const elegido = catalogo.find((c) => c >= Preq) ?? 55
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 3,
      statement: `Una banda transportadora exige ${T} N·m constantes a 1470 r/min, servicio continuo S1, altitud 2200 m y ambiente 45 °C (factor de corrección combinado del catálogo: 0.92). El catálogo IEC ofrece 22, 30, 37, 45 y 55 kW. Halle la potencia mecánica de la carga y la potencia MÍNIMA de catálogo que puede seleccionarse.`,
      data: [
        { label: 'Par de la carga', value: `${T} N·m @ 1470 r/min`, tag: 'útil' },
        { label: 'Derrateo (altitud+temperatura)', value: '0.92', tag: 'útil' },
        { label: 'Catálogo', value: '22 / 30 / 37 / 45 / 55 kW', tag: 'útil' },
        { label: 'Tipo de servicio', value: 'S1 continuo', tag: 'útil' },
        { label: 'Grado de protección', value: 'IP55', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué convierte esto en un problema de SELECCIÓN y no de análisis?', [
        { label: 'La incógnita es una DECISIÓN sobre opciones discretas de catálogo con margen y derrateo — no un número exacto de una máquina dada', correct: true, feedback: 'El flujo industrial: carga → potencia → correcciones → siguiente tamaño ESTÁNDAR hacia arriba.' },
        { label: 'Que aparezcan N·m en vez de kW', feedback: 'La conversión T·ω es rutinaria — lo distintivo es decidir contra un catálogo con restricciones.' },
        { label: 'Que la banda sea de par constante', feedback: 'El tipo de carga importa (dimensiona por par o por potencia), pero la esencia es la decisión de catálogo.' },
      ]),
      datos: mcq('¿Por qué NO puedes usar la potencia de placa del catálogo tal cual?', [
        { label: 'A 2200 m y 45 °C el motor enfría peor: su capacidad real es placa×0.92 — la comparación correcta es P_carga vs P_placa·0.92 (o equivalente, P_carga/0.92 vs placa)', correct: true, feedback: 'El derrateo es la interfaz entre el laboratorio (placa a 1000 m/40 °C) y tu planta real.' },
        { label: 'Porque los catálogos exageran', feedback: 'Las placas IEC son verificables — el ajuste no es desconfianza, es física del enfriamiento.' },
        { label: 'El 0.92 solo aplica a motores viejos', feedback: 'Aplica a cualquier máquina enfriada por aire fuera de condiciones de referencia.' },
      ]),
      metodo: mcq('Ruta de selección:', [
        { label: 'P = T·ω (ω en rad/s) → P_requerida_de_placa = P/0.92 → elegir el primer tamaño de catálogo ≥ ese valor', correct: true, feedback: 'Y verificar después par de arranque y térmica — pero el tamaño sale de esta cadena.' },
        { label: 'P = T·n/9550 y elegir el tamaño inmediato INFERIOR «para ahorrar»', feedback: 'La fórmula es válida (kW con n en r/min), pero elegir por debajo condena al motor a sobrecarga permanente.' },
        { label: 'Elegir siempre el motor más grande disponible', feedback: 'Sobredimensionar castiga rendimiento y fp a carga parcial (y el bolsillo): el criterio es el MÍNIMO que cumple.' },
      ]),
      supuestos: [
        { label: 'Carga de par constante: la potencia escala lineal con la velocidad', correcto: true },
        { label: 'El factor 0.92 ya combina altitud y temperatura', correcto: true },
        { label: 'Sin sobrecargas cíclicas (S1 genuino)', correcto: true },
        { label: 'El derrateo aumenta la potencia disponible', correcto: false },
      ],
      respuestas: [
        { label: 'P de la carga', value: P, unit: 'kW' },
        { label: 'P mínima de catálogo', value: elegido, unit: 'kW', tolPct: 0.5 },
      ],
      validacion: mcq(`Elegiste ${elegido} kW para una carga de ${fmt(P, 1)} kW. ¿El margen resultante es sano?`, [
        { label: `Sí: capacidad real = ${elegido}·0.92 = ${fmt(elegido * derate, 1)} kW ≥ ${fmt(P, 1)} kW de carga, con ${fmt(((elegido * derate) / P - 1) * 100, 0)} % de reserva — suficiente sin caer en sobredimensionamiento`, correct: true, feedback: 'El chequeo final SIEMPRE es capacidad corregida ≥ demanda, con reserva de un dígito porcentual alto.' },
        { label: 'Faltó duplicar la potencia por seguridad', feedback: 'El factor 2 «por si acaso» es el peor hábito de selección: motores al 50 % rinden mal y su fp castiga la factura.' },
        { label: 'El margen no importa si el arranque es directo', feedback: 'El arranque se verifica APARTE (par y térmica) — el margen de régimen sigue siendo obligatorio.' },
      ]),
      solucion: [
        `ω = 2π·1470/60 = ${fmt(w, 1)} rad/s → P = ${T}·${fmt(w, 1)} = ${fmt(P, 1)} kW`,
        `P_placa requerida = ${fmt(P, 1)}/0.92 = ${fmt(Preq, 1)} kW`,
        `Catálogo: primer tamaño ≥ ${fmt(Preq, 1)} → ${elegido} kW (verifica: ${elegido}·0.92 = ${fmt(elegido * derate, 1)} ≥ ${fmt(P, 1)} ✓)`,
      ],
    }
  },
}

const normasEficiencia: TrainerFamily = {
  id: 'n3-normas',
  title: 'Normas de eficiencia: IE3 vs IE1 y payback',
  chapter: 7,
  level: 3,
  generate() {
    const P = pick([11, 15, 22, 30] as const)
    const eta1 = rnd(870, 892, 2) / 1000
    const eta3 = eta1 + rnd(28, 40, 2) / 1000
    const h = rnd(3000, 6000, 500)
    const c = 0.12
    const ahorro = P * h * c * (1 / eta1 - 1 / eta3)
    const sobreprecio = rnd(60, 110, 10) * P
    const payback = sobreprecio / ahorro
    return {
      familyId: this.id,
      title: this.title,
      chapter: 7,
      level: 3,
      statement: `Se reemplaza un motor de ${P} kW clase IE1 (η = ${fmt(eta1 * 100, 1)} %) por uno IE3 (η = ${fmt(eta3 * 100, 1)} %). Opera ${h} h/año a plena carga, con energía a 0.12 USD/kWh. El IE3 cuesta ${sobreprecio} USD más y su placa indica factor de servicio 1.15. Halle el ahorro anual de energía en USD y el payback simple del sobreprecio.`,
      data: [
        { label: 'Potencia (eje)', value: `${P} kW`, tag: 'útil' },
        { label: 'η IE1 → IE3', value: `${fmt(eta1 * 100, 1)} % → ${fmt(eta3 * 100, 1)} %`, tag: 'útil' },
        { label: 'Horas y tarifa', value: `${h} h/año · 0.12 USD/kWh`, tag: 'útil' },
        { label: 'Sobreprecio', value: `${sobreprecio} USD`, tag: 'útil' },
        { label: 'Factor de servicio', value: '1.15', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué comparan las clases IE (IEC 60034-30)?', [
        { label: 'RENDIMIENTO normalizado en condiciones de referencia: IE1 estándar → IE4 súper premium; misma potencia de eje, menos watts de entrada', correct: true, feedback: 'La clase IE es una promesa de pérdidas verificable con la norma de ensayo (60034-2-1).' },
        { label: 'La robustez mecánica del motor', feedback: 'Eso va por grados IP, aislamiento y servicio — la clase IE habla exclusivamente de eficiencia.' },
        { label: 'La velocidad nominal', feedback: 'La velocidad la fijan polos y frecuencia — la clase IE no la toca.' },
      ]),
      datos: mcq('El factor de servicio 1.15 de la placa…', [
        { label: 'Es irrelevante para el ahorro: indica que el motor TOLERA 15 % de sobrecarga sostenida (con vida reducida), no que rinda más', correct: true, feedback: 'SF es margen de emergencia NEMA, no un multiplicador de eficiencia — señuelo de placa clásico.' },
        { label: 'Multiplica el ahorro por 1.15', feedback: 'El ahorro sale solo de la diferencia de 1/η — el SF no entra.' },
        { label: 'Obliga a calcular a 115 % de carga', feedback: 'Se calcula al punto de OPERACIÓN real (aquí plena carga nominal).' },
      ]),
      metodo: mcq('La energía se ahorra en la ENTRADA. Fórmula:', [
        { label: 'Ahorro = P_eje·h·costo·(1/η_IE1 − 1/η_IE3) — misma potencia de eje, distinta potencia consumida', correct: true, feedback: 'El eje pide lo mismo: lo que cambia es cuánto entra por los bornes. Por eso van los INVERSOS de η.' },
        { label: 'Ahorro = P·h·costo·(η_IE3 − η_IE1)', feedback: 'Restar rendimientos directamente subestima: la energía es P/η, así que la resta correcta es de inversos.' },
        { label: 'Ahorro = sobreprecio·1.15', feedback: 'Eso no es física ni economía — mezcla el costo con el factor de servicio.' },
      ]),
      supuestos: [
        { label: 'Carga constante a potencia nominal durante las horas declaradas', correcto: true },
        { label: 'Tarifa plana (sin horarios ni demanda)', correcto: true },
        { label: 'Payback simple: sin tasa de descuento', correcto: true },
        { label: 'El motor IE3 entrega más potencia de eje', correcto: false },
      ],
      respuestas: [
        { label: 'Ahorro anual', value: ahorro, unit: 'USD' },
        { label: 'Payback', value: payback, unit: 'años' },
      ],
      validacion: mcq(`Payback = ${fmt(payback, 1)} años. ¿Cómo se lee industrialmente?`, [
        { label: `${payback < 3 ? 'Excelente: menos de 3 años se aprueba casi sin discusión' : 'Razonable: 3–6 años es típico de eficiencia'} — y el motor vivirá 15–20 años ahorrando después del payback`, correct: true, feedback: 'El 95 % del costo de vida de un motor es su energía: casi cualquier salto de clase IE con horas altas se paga solo.' },
        { label: 'Malo: cualquier payback mayor a 6 meses se rechaza', feedback: 'Con esa vara no se haría ninguna inversión de eficiencia — los umbrales industriales van de 2 a 5 años.' },
        { label: 'El payback no aplica a motores', feedback: 'Aplica a cualquier CAPEX con ahorro recurrente — los motores son el caso de libro.' },
      ]),
      solucion: [
        `Ahorro = ${P}·${h}·0.12·(1/${fmt(eta1, 3)} − 1/${fmt(eta3, 3)}) = ${fmt(ahorro, 0)} USD/año`,
        `Payback = ${sobreprecio}/${fmt(ahorro, 0)} = ${fmt(payback, 1)} años`,
        'El factor de servicio 1.15 era señuelo: tolerancia a sobrecarga, no eficiencia.',
      ],
    }
  },
}

const casoAbierto: TrainerFamily = {
  id: 'n3-abierto',
  title: 'Caso abierto: bomba con variador o válvula',
  chapter: 8,
  level: 3,
  generate() {
    const P100 = rnd(22, 45, 1)
    const q = 0.7
    const Pvdf = P100 * q * q * q
    const Pval = P100 * 0.85
    const h = rnd(3000, 5000, 500)
    const ahorro = (Pval - Pvdf) * h * 0.12
    return {
      familyId: this.id,
      title: this.title,
      chapter: 8,
      level: 3,
      statement: `Una bomba centrífuga consume ${P100} kW a caudal pleno. El proceso opera ${h} h/año al 70 % del caudal. Hoy se regula con VÁLVULA de estrangulamiento (a 70 % de caudal la potencia solo baja a ~85 % por la curva bomba-sistema). Se propone un VARIADOR de frecuencia. Con las leyes de afinidad (P ∝ Q³, sistema dominado por fricción), halle la potencia con variador al 70 % de caudal y el ahorro anual (0.12 USD/kWh).`,
      data: [
        { label: 'P a caudal pleno', value: `${P100} kW`, tag: 'útil' },
        { label: 'Punto de operación', value: `70 % de caudal · ${h} h/año`, tag: 'útil' },
        { label: 'P con válvula al 70 %', value: `≈ 0.85·P (dato de la curva)`, tag: 'útil' },
        { label: 'Tarifa', value: '0.12 USD/kWh', tag: 'útil' },
        { label: 'Diámetro del impulsor', value: '260 mm', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Por qué la VÁLVULA ahorra tan poco?', [
        { label: 'Estrangular no reduce el trabajo de la bomba: le AÑADE pérdida de carga para forzar menos caudal — la bomba sigue girando a plena velocidad contra más presión', correct: true, feedback: 'La válvula «frena con el freno de mano puesto»: convierte el exceso de energía en turbulencia y calor.' },
        { label: 'Porque las válvulas modernas son ineficientes', feedback: 'No es la válvula el problema: es el MÉTODO — regular disipando en vez de regular generando menos.' },
        { label: 'La válvula sí ahorra igual que el variador', feedback: '0.85·P contra ~0.34·P: la diferencia es el corazón económico del caso.' },
      ]),
      datos: mcq('¿Qué régimen de operación hace atractivo al variador AQUÍ?', [
        { label: 'MUCHAS horas a caudal PARCIAL: el cubo de las afinidades solo paga cuando se opera lejos del 100 % — a caudal pleno el variador solo añade sus propias pérdidas', correct: true, feedback: 'La pregunta de oro antes de proponer un VDF: ¿cuántas horas y a qué caudal? Sin perfil de carga no hay caso.' },
        { label: 'La marca de la bomba', feedback: 'Las afinidades son física de turbomáquinas, válidas para cualquier centrífuga.' },
        { label: 'El nivel de tensión del motor', feedback: 'Cambia el costo del variador, no la física del ahorro.' },
      ]),
      metodo: mcq('Cálculo del ahorro:', [
        { label: 'P_vdf = P₁₀₀·(0.7)³, P_válvula = 0.85·P₁₀₀ (dato) → ahorro = ΔP·horas·tarifa', correct: true, feedback: 'El cubo hace la magia: 70 % de caudal ≈ 34 % de potencia si el sistema es friccional.' },
        { label: 'P_vdf = 0.7·P₁₀₀ (lineal con el caudal)', feedback: 'Lineal sería una carga de PAR CONSTANTE (banda, extrusora). Las centrífugas van al CUBO — confundirlo triplica el error.' },
        { label: 'El ahorro es el 30 % de la factura, por definición', feedback: 'Nada es «por definición» aquí: depende de la curva del sistema y del perfil de horas.' },
      ]),
      supuestos: [
        { label: 'Sistema dominado por fricción (sin gran altura estática): afinidades aplicables', correcto: true },
        { label: 'Pérdidas del propio variador despreciadas en primera aproximación', correcto: true },
        { label: 'Perfil de operación estable en los años del análisis', correcto: true },
        { label: 'Las leyes de afinidad aplican igual con mucha altura estática', correcto: false },
      ],
      respuestas: [
        { label: 'P con variador (70 %)', value: Pvdf, unit: 'kW' },
        { label: 'Ahorro anual', value: ahorro, unit: 'USD' },
      ],
      validacion: mcq('Este caso tiene MÁS de una solución defendible. ¿Cuál argumentación es INDEFENDIBLE?', [
        { label: '«El variador siempre conviene, en cualquier bomba y perfil de operación»', correct: true, feedback: 'Los absolutos son indefendibles: con altura estática dominante, pocas horas a carga parcial o motor pequeño, el VDF puede no pagarse. Defendibles: VDF aquí (horas altas + fricción), o incluso recorte de impulsor si el 70 % fuera permanente.' },
        { label: '«Con este perfil (muchas horas al 70 %, sistema friccional), el variador se paga rápido»', feedback: 'Esta es defendible y probablemente la mejor aquí — pero nota que DEPENDE del perfil declarado, no es universal.' },
        { label: '«Si el caudal del 70 % fuera permanente, recortar el impulsor lograría casi lo mismo sin electrónica»', feedback: 'También defendible: solución mecánica, sin pérdidas de variador ni armónicos — su debilidad es la pérdida de flexibilidad.' },
      ]),
      solucion: [
        `P_vdf = ${P100}·0.7³ = ${fmt(Pvdf, 1)} kW (vs ${fmt(Pval, 1)} kW con válvula)`,
        `Ahorro = (${fmt(Pval, 1)} − ${fmt(Pvdf, 1)})·${h}·0.12 = ${fmt(ahorro, 0)} USD/año`,
        'Caso abierto: VDF, impulsor recortado o válvula tienen defensa según perfil — lo indefendible es el «siempre».',
      ],
    }
  },
}

const pasoAPaso: TrainerFamily = {
  id: 'n3-paso',
  title: 'Motor a pasos / reluctancia conmutada',
  chapter: 8,
  level: 3,
  generate() {
    const m = pick([3, 4] as const)
    const Nr = m === 4 ? 50 : pick([20, 40] as const)
    const paso = 360 / (m * Nr)
    const stepsRev = m * Nr
    const nrpm = rnd(120, 600, 60)
    const fpulsos = (stepsRev * nrpm) / 60
    return {
      familyId: this.id,
      title: this.title,
      chapter: 8,
      level: 3,
      statement: `Un motor a pasos de reluctancia variable tiene ${m} fases y ${Nr} dientes en el rotor. Su driver de lazo abierto lo hace girar a ${nrpm} r/min. Halle el ángulo de paso, y la frecuencia de pulsos que debe entregar el driver. El par de retención (holding) es 0.8 N·m.`,
      data: [
        { label: 'Fases m', value: String(m), tag: 'útil' },
        { label: 'Dientes del rotor Nr', value: String(Nr), tag: 'útil' },
        { label: 'Velocidad pedida', value: `${nrpm} r/min`, tag: 'útil' },
        { label: 'Par de retención', value: '0.8 N·m', tag: 'irrelevante' },
      ],
      identificar: mcq('¿Qué produce el par en esta máquina?', [
        { label: 'PURA RELUCTANCIA: los dientes del rotor buscan alinearse con la fase excitada (mínima reluctancia) — sin imanes ni devanado rotórico, el par viene de dL/dθ', correct: true, feedback: 'El par de alineación del capítulo 3 (T = ½i²·dL/dθ) hecho producto industrial.' },
        { label: 'La interacción de imanes del rotor con el campo', feedback: 'Eso es el paso a pasos HÍBRIDO/PM — el de reluctancia variable no lleva imanes.' },
        { label: 'Corrientes inducidas en el rotor (como inducción)', feedback: 'El rotor es hierro dentado pasivo: no hay jaula ni corrientes inducidas de trabajo.' },
      ]),
      datos: mcq('¿El par de retención entra en las preguntas de posicionamiento/velocidad?', [
        { label: 'No aquí: el holding torque dimensiona la CARGA que puede sostener parado; el paso y la frecuencia son pura geometría y conteo', correct: true, feedback: 'Dos hojas del mismo catálogo: geometría (paso) para resolución, curvas de par-frecuencia para capacidad.' },
        { label: 'Sí: limita el ángulo de paso', feedback: 'El ángulo lo fijan fases y dientes — el par no mueve la geometría.' },
        { label: 'Determina la frecuencia máxima', feedback: 'La frecuencia máxima la limita la curva par-velocidad (no dada aquí), no el holding.' },
      ]),
      metodo: mcq('Fórmulas del paso:', [
        { label: 'Ángulo = 360°/(m·Nr); pasos/vuelta = m·Nr; f_pulsos = pasos/vuelta · n/60', correct: true, feedback: 'Cada pulso avanza un diente-fase: la velocidad es literalmente contar pulsos.' },
        { label: 'Ángulo = 360°/Nr, ignorando las fases', feedback: 'Cada FASE ofrece Nr posiciones distintas desplazadas: el paso se subdivide por m.' },
        { label: 'f_pulsos = n·60/paso', feedback: 'Mezcla de unidades — pasa por pasos/vuelta y verás las unidades cerrar.' },
      ]),
      supuestos: [
        { label: 'Lazo abierto sin pérdida de pasos (dentro de la curva par-frecuencia)', correcto: true },
        { label: 'Excitación de paso completo (sin micropasos)', correcto: true },
        { label: 'El motor necesita encoder para saber su posición', correcto: false },
      ],
      respuestas: [
        { label: 'Ángulo de paso', value: paso, unit: '°' },
        { label: 'f de pulsos', value: fpulsos, unit: 'pasos/s' },
      ],
      validacion: mcq(`Con ${fmt(paso, 2)}° por paso (${stepsRev} pasos/vuelta), ¿cuál es la gracia industrial?`, [
        { label: 'POSICIONAMIENTO SIN SENSOR: la posición es el conteo de pulsos — resolución fina y repetible en lazo abierto, mientras no se pierdan pasos', correct: true, feedback: 'La economía del paso a paso: precisión de encoder sin pagar el encoder — su talón de Aquiles es la pérdida de pasos por sobrecarga.' },
        { label: 'Que gira más rápido que cualquier servo', feedback: 'Al contrario: a alta velocidad su par se desploma — brilla en baja velocidad y posicionamiento.' },
        { label: 'Que no consume energía detenido', feedback: 'Sosteniendo carga parado CONSUME (por eso existe el holding torque y la reducción de corriente en reposo).' },
      ]),
      solucion: [
        `Paso = 360/(${m}·${Nr}) = ${fmt(paso, 2)}° → ${stepsRev} pasos/vuelta`,
        `f = ${stepsRev}·${nrpm}/60 = ${fmt(fpulsos, 0)} pasos/s`,
        'El holding torque era señuelo: pertenece al dimensionamiento de carga estática.',
      ],
    }
  },
}

export const ADVANCED_FAMILIES: TrainerFamily[] = [
  monofasico,
  armonicos,
  saturada,
  pmsm,
  autotrafo,
  desbalance,
  bancosParalelo,
  proteccionMotor,
  seleccionMotor,
  normasEficiencia,
  casoAbierto,
  pasoAPaso,
]
