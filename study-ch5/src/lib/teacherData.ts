/**
 * Datos para el modo docente: objetivos de aprendizaje y notas de clase por
 * sección (indexados por el prefijo de hitos de ProgressContext), más una
 * batería de plantillas de problemas parametrizables que usan el mismo motor
 * de física del documento (garantía de coherencia).
 */
import {
  DEFAULT_DC,
  DEFAULT_DCDYN,
  DEFAULT_FOC,
  DEFAULT_INDUCTION,
  MU0,
  dcEmf,
  dcKa,
  dcOperatingByIa,
  dcPowerFlow,
  dcSecondOrder,
  dcStartCurrent,
  dcTimeConstants,
  dcTorque,
  focFlux,
  focTorque,
  fmt,
  inductionAtFreq,
  inductionMaxTorque,
  inductionSolve,
  inductionStartTorque,
  inductionThevenin,
  syncSpeedRpm,
  vfVoltage,
} from './machine'

export interface TeachingNote {
  /** Objetivos de aprendizaje (qué debe poder HACER el estudiante) */
  objetivos: string[]
  /** El error/idea equivocada más común que conviene anticipar */
  errorComun: string
  /** Qué demostrar en vivo (laboratorio y maniobra concreta) */
  demo: string
  /** Pregunta de discusión para abrir debate en clase */
  discusion: string
  /** Minutos estimados de clase (exposición + laboratorio + discusión) */
  minutos: number
}

/** Notas de clase por sección, indexadas por el prefijo de hitos. */
export const TEACHING_NOTES: Record<string, TeachingNote> = {
  'c1s1-': {
    objetivos: ['Plantear el circuito magnético análogo (F = φ·R) y calcular flujo y B', 'Justificar por qué el entrehierro domina la reluctancia'],
    errorComun: 'Creer que mejorar el hierro (subir μr) sube mucho el flujo cuando hay entrehierro. El aire manda: μr apenas importa con gap abierto.',
    demo: 'Laboratorio del circuito magnético: con gap = 0 sube μr (casi no cambia B); abre 1 mm de gap y observa la barra de reparto de FMM saltar a >80% aire.',
    discusion: '¿Por qué las máquinas se diseñan para minimizar el entrehierro pero nunca pueden eliminarlo?',
    minutos: 50,
  },
  'c1s2-': {
    objetivos: ['Interpretar el ciclo de histéresis y separar pérdidas por histéresis y Foucault', 'Explicar la corriente de excitación picuda y su 3er armónico'],
    errorComun: 'Suponer que las pérdidas de Foucault bajan linealmente con el espesor de lámina; en realidad van con el CUADRADO (1/n²).',
    demo: 'Laboratorio de materiales: cambia el número de láminas y observa la caída cuadrática de las pérdidas de Foucault.',
    discusion: '¿Por qué los núcleos se laminan pero los imanes permanentes no lo necesitan?',
    minutos: 55,
  },
  'c2s1-': {
    objetivos: ['Aplicar V₁/V₂ = a y la reflexión de impedancia Z′ = a²Z', 'Comprobar la invariancia de potencia'],
    errorComun: 'Pensar que el transformador «amplifica» potencia. Solo intercambia V por I: S₁ = S₂ siempre.',
    demo: 'Laboratorio del transformador ideal (3D): duplica N₂ y observa V₂ subir, I₂ bajar y S₁ = S₂ sin inmutarse.',
    discusion: '¿Por qué la transmisión de energía se hace en alta tensión si el transformador no crea potencia?',
    minutos: 45,
  },
  'c2s2-': {
    objetivos: ['Construir el circuito equivalente por capas', 'Interpretar los ensayos de vacío (hierro) y cortocircuito (cobre)'],
    errorComun: 'Confundir qué mide cada ensayo: vacío mide el NÚCLEO (Rc∥Xm), cortocircuito mide el COBRE (R, X serie).',
    demo: 'Laboratorio del circuito equivalente mejorado: activa capa por capa (ideal → cobre → dispersión → núcleo) y observa qué elemento agrega cada imperfección.',
    discusion: '¿Por qué el ensayo de cortocircuito se hace con tensión reducida y el de vacío a tensión nominal?',
    minutos: 55,
  },
  'c2s3-': {
    objetivos: ['Calcular la regulación de tensión y el rendimiento del transformador', 'Manejar el sistema por unidad y los desfases ±30° de conexiones trifásicas'],
    errorComun: 'Creer que el factor de potencia no afecta la regulación. Un fp en adelanto puede dar regulación NEGATIVA (la tensión sube con la carga).',
    demo: 'Laboratorio de regulación: barre el fp de atraso a adelanto y observa la curva de VR cruzar por cero y volverse negativa.',
    discusion: '¿Por qué el sistema por unidad hace desaparecer el factor a²?',
    minutos: 55,
  },
  'c3s1-': {
    objetivos: ['Aplicar el balance energético del campo de acoplamiento', 'Deducir la fuerza como f = ∂W′/∂x (coenergía)'],
    errorComun: 'Confundir energía con coenergía. En sistemas no lineales NO son iguales; la fuerza sale de la COENERGÍA a corriente constante.',
    demo: 'Laboratorio del actuador (3D): cierra el gap y observa la fuerza crecer como 1/g² — la flecha roja se alarga.',
    discusion: '¿Por qué los relés «pegan» de golpe al final del recorrido?',
    minutos: 55,
  },
  'c3s2-': {
    objetivos: ['Calcular el par de alineación de sistemas de doble excitación (T = i_s·i_r·dL/dθ)', 'Explicar el punto de operación de un imán permanente'],
    errorComun: 'Pensar que lo que produce par es la inductancia mutua; en realidad es su VARIACIÓN con el ángulo (dL/dθ).',
    demo: 'Laboratorio de par por inductancia mutua: suelta el rotor y míralo oscilar hacia θ=0; el par es máximo en cuadratura.',
    discusion: '¿Por qué un imán permanente «se excita solo» y qué fija su punto de operación?',
    minutos: 50,
  },
  'c4s1-': {
    objetivos: ['Identificar estator, rotor y entrehierro y sus devanados', 'Relacionar grados eléctricos, mecánicos y frecuencia'],
    errorComun: 'Creer que síncrona e inducción tienen estatores distintos. El estator es idéntico; toda la diferencia vive en el rotor.',
    demo: 'Laboratorio de anatomía (3D): recorre las 5 partes y cambia de síncrona a inducción — el estator no cambia.',
    discusion: '¿Por qué el devanado de potencia va en el estator y el de campo en el rotor?',
    minutos: 45,
  },
  'c4s2-': {
    objetivos: ['Explicar la FMM de un devanado distribuido como serie de Fourier', 'Calcular el factor de distribución kd'],
    errorComun: 'Suponer que distribuir el devanado no cuesta nada; kd < 1 «descuenta» algo de fundamental a cambio de limpiar armónicos.',
    demo: 'Laboratorio de FMM distribuida: sube el número de ranuras por polo y fase y observa la escalera acercarse a una senoide.',
    discusion: '¿Por qué conviene sacrificar algo de fundamental (kd<1) para reducir armónicos?',
    minutos: 50,
  },
  'c4s3-': {
    objetivos: ['Aplicar E = 4.44·f·N·kw·Φ', 'Explicar el par como T ∝ sen δ (campos que se alinean)'],
    errorComun: 'Confundir tensión de fase y de línea, y sus √3 y desfase de 30°.',
    demo: 'Laboratorio de voltaje y par: varía δ y observa el par seguir sen δ hasta el límite en 90°.',
    discusion: '¿Por qué la máquina desarrolla par máximo justo cuando los campos están a 90°?',
    minutos: 50,
  },
  's1-': {
    objetivos: ['Calcular la velocidad síncrona nₛ = 120f/p', 'Explicar el campo giratorio trifásico'],
    errorComun: 'Creer que el campo giratorio necesita partes móviles. Es puro efecto de superposición de tres fases.',
    demo: 'Laboratorio de campo giratorio: observa el polo N-S dar vueltas sin que nada gire mecánicamente.',
    discusion: '¿Cómo cambian la velocidad los motores si nₛ solo depende de f y p?',
    minutos: 40,
  },
  's2-': {
    objetivos: ['Construir el diagrama fasorial Eaf = Vt + jXs·Ia', 'Interpretar la curva V de excitación'],
    errorComun: 'Olvidar que sobreexcitar entrega reactivos (fp atraso) y subexcitar los absorbe.',
    demo: 'Laboratorio de fasores: arrastra la punta de Ia y observa Eaf y δ responder.',
    discusion: '¿Por qué la misma máquina puede entregar o absorber reactivos según su excitación?',
    minutos: 55,
  },
  's3-': {
    objetivos: ['Aplicar P = Eaf·Vt·sen δ/Xs contra barra infinita', 'Identificar el límite de estabilidad y el par sincronizante'],
    errorComun: 'Creer que subir la turbina (Pm) siempre aumenta la salida. Más allá de la cresta (δ=90°) se pierde el sincronismo.',
    demo: 'Laboratorio potencia-ángulo: sube Pm despacio hasta que el punto de equilibrio desaparece en la cresta.',
    discusion: '¿Qué margen de reserva debe mantenerse y por qué?',
    minutos: 55,
  },
  's4-': {
    objetivos: ['Leer la carta de capacidad P-Q', 'Distinguir operación como motor (δ<0) y generador'],
    errorComun: 'Pensar que los límites de la carta son arbitrarios; cada uno es un límite físico (campo, armadura, estabilidad).',
    demo: 'Laboratorio de capacidad: mueve el punto de operación y observa qué límite se alcanza primero.',
    discusion: '¿Por qué un compensador síncrono opera en el eje Q (sin potencia activa)?',
    minutos: 50,
  },
  's5-': {
    objetivos: ['Obtener Xs saturada y no saturada de los ensayos OCC/SCC', 'Calcular la relación de cortocircuito (SCR)'],
    errorComun: 'Usar la Xs no saturada donde corresponde la saturada; la máquina real opera en el codo de saturación.',
    demo: 'Laboratorio OCC/SCC: superpón las dos curvas y lee Xs en el codo.',
    discusion: '¿Por qué la recta de cortocircuito no se satura pero la de vacío sí?',
    minutos: 55,
  },
  's6-': {
    objetivos: ['Desglosar pérdidas fijas y variables', 'Hallar el punto de rendimiento máximo'],
    errorComun: 'Buscar el máximo rendimiento donde «pérdidas fijas = variables» sin matices; el campo cuasi-constante desplaza el punto.',
    demo: 'Laboratorio de rendimiento: barre la carga y localiza el pico de η.',
    discusion: '¿Por qué el rendimiento máximo no coincide con la potencia máxima?',
    minutos: 45,
  },
  's7-': {
    objetivos: ['Ejecutar el procedimiento de sincronización (lámparas, sincroscopio, relé 25) y cuantificar el cierre fuera de fase', 'Repartir P con estatismo y Q con excitación distinguiendo barra infinita vs red aislada', 'Operar dentro de la carta de capacidad (OEL, UEL, 32, 78) y completar la misión de la Sala de control'],
    errorComun: 'Creer que la excitación mueve los watts: subir If solo redistribuye kVAR y voltaje; los MW los fijan las máquinas impulsoras.',
    demo: 'Sala de control: la misión completa en vivo (sincronizar G₂, cargar en tijera, igualar fp, retirar G₁); provocar el relé 32 descargando de más y el 78 bajando excitación con P alta.',
    discusion: '¿Por qué el estatismo REPARTE pero no RESTAURA la frecuencia, y por qué el AGC no debe actuar en segundos?',
    minutos: 90,
  },
  'c6s1-': {
    objetivos: ['Aplicar el teorema de conservación del flujo λ(0⁺)=λ(0⁻)', 'Introducir la transformación d-q-0 y el modelo E′ tras X′d'],
    errorComun: 'Creer que la corriente puede saltar en el instante de la falla; lo que se conserva es el ENLACE DE FLUJO.',
    demo: 'Comparar el flujo antes/después: la E′ interna se conserva y de ahí sale la reactancia efectiva.',
    discusion: '¿Por qué el flujo atrapado hace que la máquina «parezca» tener una reactancia menor al inicio?',
    minutos: 60,
  },
  'c6s2-': {
    objetivos: ['Calcular los niveles I″, I′, Iss del cortocircuito súbito', 'Analizar el offset DC y una falla a nivel de SISTEMA (superposición de fuentes)'],
    errorComun: 'Pensar que α=0 da máxima asimetría; en realidad da onda simétrica (falla en el pico de tensión).',
    demo: 'Laboratorio de cortocircuito y diagrama unifilar (Ej. 10-1): mueve la falla de la barra emisora a la receptora y observa dispararse el aporte de la red.',
    discusion: '¿Por qué un interruptor concreto corta menos corriente que la falla total?',
    minutos: 65,
  },
  'c6s3-': {
    objetivos: ['Integrar la ecuación de oscilación y hallar el tiempo crítico de despeje', 'Aplicar el criterio de áreas iguales (A1 = A2)'],
    errorComun: 'Suponer que basta con que exista un punto de equilibrio post-falla; hace falta que las áreas de aceleración y frenado se equilibren.',
    demo: 'Laboratorio de oscilación / áreas iguales: aumenta el tiempo de despeje hasta perder la estabilidad.',
    discusion: '¿Qué determina el «presupuesto» de tiempo de las protecciones?',
    minutos: 65,
  },
  'c6s4-': {
    objetivos: ['Trazar la curva P-δ transitoria con saliencia invertida', 'Relacionar T′d0 = T′d·Xd/X′d y la escalera de modelos'],
    errorComun: 'Aplicar el modelo permanente en el transitorio; la cresta transitoria puede estar más allá de 90°.',
    demo: 'Laboratorio de curva transitoria: compara la curva permanente con la transitoria.',
    discusion: '¿Cuándo basta el modelo E′ tras X′d y cuándo hace falta el completo?',
    minutos: 55,
  },
  'c7s1-': {
    objetivos: ['Calcular deslizamiento, velocidad síncrona y frecuencia del rotor', 'Explicar la inducción como transformador con movimiento'],
    errorComun: 'Creer que el rotor podría alcanzar nₛ; sin deslizamiento no hay corte de flujo, no hay par.',
    demo: 'Laboratorio de campo giratorio y deslizamiento: baja s hacia 0 y observa apagarse la corriente inducida.',
    discusion: '¿Por qué el motor de inducción es «asíncrono» por necesidad física?',
    minutos: 50,
  },
  'c7s2-': {
    objetivos: ['Aplicar fᵣ = s·fₑ y el escalado de E₂ₛ y X₂ₛ con s', 'Explicar cómo cambia la impedancia del rotor con la velocidad'],
    errorComun: 'Olvidar que solo R₂ es constante; frecuencia, FEM y reactancia del rotor escalan todas con s.',
    demo: 'Laboratorio de frecuencia del rotor: barre s y observa las dos ondas (estator fijo, rotor estirándose).',
    discusion: '¿Por qué el factor de potencia del rotor mejora al acelerar?',
    minutos: 45,
  },
  'c7s3-': {
    objetivos: ['Construir el circuito equivalente del motor de inducción', 'Interpretar la partición R₂/s = R₂ + R₂(1−s)/s'],
    errorComun: 'Creer que R₂(1−s)/s es una resistencia real que se calienta; es FICTICIA, representa la potencia mecánica.',
    demo: 'Laboratorio de circuito equivalente: activa la partición y observa la resistencia mecánica dispararse a bajo s.',
    discusion: '¿Por qué el motor casi en vacío se parece a un transformador con secundario abierto?',
    minutos: 55,
  },
  'c7s4-': {
    objetivos: ['Aplicar el reparto 1:s:(1−s) de la potencia de entrehierro', 'Calcular par (Pgap/ωs), pérdidas y rendimiento con Thévenin'],
    errorComun: 'Calcular el par con la velocidad real del rotor; el par se lee desde ωs (fija) y funciona incluso a rotor parado.',
    demo: 'Laboratorio de flujo de potencia: barre s y observa el reparto fijo 1:s:(1−s).',
    discusion: '¿Por qué la eficiencia del rotor tiene un techo duro de 1−s?',
    minutos: 60,
  },
  'c7s5-': {
    objetivos: ['Trazar la curva par-velocidad e identificar arranque y ruptura', 'Demostrar que Tmax ⊥ R₂ pero s_maxT ∝ R₂'],
    errorComun: 'Creer que subir R₂ aumenta el par máximo; solo desplaza s_maxT (la altura de Tmax no cambia).',
    demo: 'Laboratorio par-velocidad: sube R₂ y observa la cresta correrse hacia el arranque sin cambiar de altura.',
    discusion: '¿Por qué el par va con V² y qué implica para el arranque con tensión baja?',
    minutos: 60,
  },
  'c7s6-': {
    objetivos: ['Comparar jaula, doble jaula/barra profunda y rotor devanado', 'Explicar cómo el efecto pelicular y la R externa resuelven el dilema de R₂'],
    errorComun: 'Suponer que la doble jaula tiene partes móviles; su R₂ variable la produce el efecto pelicular (frecuencia del rotor).',
    demo: 'Laboratorio de tipos de rotor: compara las curvas y mueve la R externa del rotor devanado.',
    discusion: '¿Por qué el rotor devanado logra mucho par Y poca corriente en el arranque?',
    minutos: 55,
  },
  'c8s1-': {
    objetivos: ['Escribir las ecuaciones v = Ri + dλ/dt del modelo dinámico', 'Justificar por qué las inductancias variables lo hacen no lineal'],
    errorComun: 'Usar el circuito equivalente (fasorial) para transitorios; solo vale en régimen permanente a frecuencia fija.',
    demo: 'Laboratorio de inductancias móviles: gira el rotor y observa las mutuas M·cos θ cambiar a cada instante.',
    discusion: '¿Cuándo importa el modelo dinámico frente al circuito equivalente?',
    minutos: 55,
  },
  'c8s2-': {
    objetivos: ['Aplicar la transformación de Park abc→d-q', 'Explicar por qué el marco síncrono convierte la CA en CD'],
    errorComun: 'Creer que el marco síncrono «filtra» los armónicos; es un cambio de coordenadas exacto y reversible.',
    demo: 'Laboratorio de marcos de referencia: pasa a marco síncrono y observa id, iq volverse líneas rectas (CD).',
    discusion: '¿Por qué un controlador PI funciona con error cero sobre señales de CD y no sobre senoides?',
    minutos: 60,
  },
  'c8s3-': {
    objetivos: ['Aplicar el control V/f y justificar el flujo constante', 'Distinguir región de par constante y de debilitamiento de campo'],
    errorComun: 'Bajar la frecuencia sin bajar la tensión; el flujo se dispara y el núcleo se satura.',
    demo: 'Laboratorio V/f: baja f manteniendo V/f (curva se desliza sin perder altura) y luego supera la nominal (Tmax cae como 1/f²).',
    discusion: '¿Por qué por encima de la frecuencia nominal el motor entrega potencia casi constante?',
    minutos: 55,
  },
  'c8s4-': {
    objetivos: ['Explicar el desacoplamiento del FOC (id→flujo, iq→par)', 'Relacionarlo con el control de una máquina de CD'],
    errorComun: 'Mandar el par cambiando id o la frecuencia; en FOC el par se controla con iq (rápido y lineal) a flujo fijo.',
    demo: 'Laboratorio FOC: dobla iq y observa el par doblarse con el flujo intacto; pon iq negativo (frenado regenerativo).',
    discusion: '¿Por qué el FOC vuelve al motor de inducción apto para servos y robótica?',
    minutos: 60,
  },
  'c8s5-': {
    objetivos: ['Describir el inversor trifásico de IGBTs y la PWM senoidal', 'Calcular el fundamental V₁ = m·Vdc/2'],
    errorComun: 'Pensar que el inversor genera una senoide «real»; entrega pulsos cuyo PROMEDIO sigue a la referencia.',
    demo: 'Laboratorio PWM: sube el índice de modulación y la frecuencia de portadora y observa el fundamental seguir a la referencia.',
    discusion: '¿Qué se gana y se pierde subiendo la frecuencia de conmutación?',
    minutos: 50,
  },
  'c9s1-': {
    objetivos: ['Describir la geometría (campo, interpolos, armadura) y el colector', 'Explicar la conmutación como rectificación mecánica de la CA interna'],
    errorComun: 'Creer que la máquina de CC genera CC por dentro; por dentro es alterna y el colector la rectifica.',
    demo: 'Laboratorio del colector: con 1 delga la salida es un seno rectificado (rizo 100 %); sube las delgas y observa el rizo desplomarse.',
    discusion: '¿Por qué se dice que la máquina de CC «rectifica» en vez de «generar» CC?',
    minutos: 50,
  },
  'c9s2-': {
    objetivos: ['Calcular Ka = P·Z/(2π·a)', 'Aplicar Ea = Ka·Φ·ω y T = Ka·Φ·Ia y la conservación Ea·Ia = T·ω'],
    errorComun: 'Confundir Ka (geometría fija) con las variables de operación (ω, Ia) o con el flujo Φ.',
    demo: 'Laboratorio de la constante: mueve Φ y observa crecer Ea y T a la vez; verifica Ea·Ia = T·ω.',
    discusion: '¿Por qué el mismo factor Ka·Φ aparece en la ecuación de tensión y en la de par?',
    minutos: 50,
  },
  'c9s3-': {
    objetivos: ['Aplicar la malla Vt = Ea ± Ia·Ra y despejar la velocidad', 'Comparar shunt (velocidad plana), serie (T ∝ Ia², embalamiento) y compuesta'],
    errorComun: 'No advertir que el motor serie se embala en vacío (Φ ∝ Ia → 0 ⇒ ω → ∞).',
    demo: 'Laboratorio de conexiones: compara las curvas par-velocidad; descarga el motor serie y observa el embalamiento.',
    discusion: '¿Por qué un motor serie nunca debe arrancar sin carga acoplada?',
    minutos: 60,
  },
  'c9s4-': {
    objetivos: ['Explicar la distorsión del flujo por la FMM de armadura', 'Justificar interpolos y devanados de compensación'],
    errorComun: 'Suponer que la reacción de armadura no cambia el flujo neto; por saturación de la punta apilada, lo DEBILITA.',
    demo: 'Laboratorio de reacción de armadura: sube Ia y observa ladearse el flujo y correrse el neutro; activa la compensación.',
    discusion: '¿Por qué interpolos y compensación se conectan en serie con la armadura?',
    minutos: 55,
  },
  'c9s5-': {
    objetivos: ['Trazar el árbol de potencia Pin → Pdev = Ea·Ia → Peje', 'Clasificar pérdidas y localizar el rendimiento máximo'],
    errorComun: 'Confundir la potencia desarrollada Ea·Ia con la potencia útil del eje (faltan las rotacionales).',
    demo: 'Laboratorio de flujo de potencia: barre la carga y localiza el pico de rendimiento; alterna motor/generador.',
    discusion: '¿Por qué el rendimiento tiene forma de campana con la carga?',
    minutos: 50,
  },
  'c10s1-': {
    objetivos: ['Escribir las dos ODE (eléctrica con La, mecánica con J)', 'Explicar el pico de corriente de arranque por ausencia de contra-FEM'],
    errorComun: 'Ignorar La (válido en régimen) al analizar transitorios; y creer que el pico de arranque lo causa La en vez de la ausencia de FEM.',
    demo: 'Laboratorio de arranque (dos ODE): aplica el escalón y observa la corriente picar (rápido) y la velocidad arrastrarse (lento).',
    discusion: '¿Por qué el circuito equivalente del Cap. 9 no basta para el arranque?',
    minutos: 55,
  },
  'c10s2-': {
    objetivos: ['Calcular τe = La/Ra y τm = J·Ra/(KaΦ)²', 'Justificar el control en cascada por la separación τm ≫ τe'],
    errorComun: 'Suponer que la velocidad responde tan rápido como la corriente; τm suele ser mucho mayor que τe.',
    demo: 'Laboratorio de constantes de tiempo: sube La (mueve τe) y J (mueve τm) y observa los dos ritmos por separado.',
    discusion: '¿Qué propiedad de la máquina permite anidar un lazo rápido dentro de uno lento?',
    minutos: 50,
  },
  'c10s3-': {
    objetivos: ['Obtener la función de transferencia Ω(s)/Va(s) de 2.º orden', 'Interpretar ωn, ζ y los regímenes de amortiguamiento'],
    errorComun: 'No ver por qué el sistema es de 2.º orden (dos almacenes de energía: La e J) y puede oscilar.',
    demo: 'Laboratorio de 2.º orden: baja Ra hacia ζ<1 y observa la velocidad sobrepasar y los polos volverse complejos.',
    discusion: '¿Por qué ζ = 1 (crítico) es el objetivo de diseño de muchos controladores?',
    minutos: 55,
  },
  'c10s4-': {
    objetivos: ['Calcular la corriente de arranque directo Iarr = Vt/Ra y dimensionar la resistencia de arranque', 'Explicar el transitorio de cortocircuito de un generador'],
    errorComun: 'Creer que el pico de corriente lo limita La; lo limita Ra, y su tamaño se debe a la ausencia de contra-FEM.',
    demo: 'Laboratorio de arranque: sube la resistencia de arranque y observa el pico de corriente desplomarse.',
    discusion: '¿Por qué las fuerzas mecánicas de un cortocircuito son máximas en los primeros milisegundos?',
    minutos: 55,
  },
  'c10s5-': {
    objetivos: ['Describir el control en cascada (lazo de corriente dentro de velocidad)', 'Explicar el papel del término integral y de la limitación de corriente'],
    errorComun: 'Pensar que un solo lazo de velocidad basta; la cascada existe para limitar corriente/par y aprovechar τe ≪ τm.',
    demo: 'Laboratorio de drive: durante la rampa la corriente se pega a Imax; ante una perturbación de carga, el integrador recupera la velocidad.',
    discusion: '¿Por qué el término integral garantiza velocidad exacta pese a la carga?',
    minutos: 55,
  },
  'c11s1-': {
    objetivos: ['Aplicar la transformación de Fortescue (operador a) en ambos sentidos', 'Interpretar V₁/V₂/V₀ y el factor de desequilibrio'],
    errorComun: 'Creer que un sistema balanceado «tiene un poco de cada secuencia»: 1+a+a² = 0 aniquila la negativa y la cero.',
    demo: 'Laboratorio de Fortescue: bajar |Vb| al 70 % y ver aparecer negativa Y cero a la vez.',
    discusion: '¿Por qué un 5 % de V₂ produce ~25 % de corriente negativa en un motor (Z₂ ≈ Z de arranque)?',
    minutos: 55,
  },
  'c11s2-': {
    objetivos: ['Construir las tres redes de un generador (fuente solo en positiva)', 'Dimensionar el aterrizamiento (3Zn) y comparar sólido/reactor/aislado'],
    errorComun: 'Olvidar el factor 3 del neutro: por él regresan las TRES corrientes de secuencia cero (caída 3·Zn·I₀).',
    demo: 'Laboratorio de redes: subir el reactor hasta que la SLG iguale a la trifásica — diseñar en vivo.',
    discusion: 'Neutro aislado: ¿por qué la primera falla «gratis» es una trampa (√3 en fases sanas, falla latente)?',
    minutos: 60,
  },
  'c11s3-': {
    objetivos: ['Aplicar las reglas Yg/Δ/Y en la red de secuencia cero', 'Construir la red cero de un sistema con transformadores'],
    errorComun: 'Sumar el X₀ de TODO el sistema: la delta desconecta lo que está detrás de ella — primero topología, después impedancias.',
    demo: 'Laboratorio del trafo: recorrer los cinco casos clásicos y justificar cada circuito abierto/derivación.',
    discusion: '¿Por qué al Yg–Yg se le añade un terciario en delta?',
    minutos: 55,
  },
  'c11s4-': {
    objetivos: ['Resolver SLG, L-L y LLG conectando redes (serie/paralelo/divisor) con Zf y Zn', 'Reconocer fallas serie (fase abierta) y su I₂'],
    errorComun: 'Memorizar fórmulas sueltas en vez de la CONEXIÓN de redes; y olvidar el ×3 de Zf/Zn en los caminos de tierra.',
    demo: 'Conmutador de fallas: mismos parámetros, cuatro tipos — la conexión es la fórmula. Autochequeo: la fase sana da cero.',
    discusion: '¿Por qué la pérdida de fase de un motor es una emergencia térmica sin ser un cortocircuito?',
    minutos: 70,
  },
  'c11s5-': {
    objetivos: ['Explicar el residual 3I₀ y la sensibilidad del 51N', 'Ejecutar el flujo integral de ajuste y coordinación fase/tierra'],
    errorComun: 'Verificar la protección solo con la falla franca: la prueba decisiva es la falla MÍNIMA (resistiva, lejana).',
    demo: 'Laboratorio 51/51N: la SLG resistiva que el relé de fase no ve y el residual caza en medio segundo; la L-L con residual cero.',
    discusion: '¿Por qué elegir la SEÑAL correcta (residual) vale más que un relé más sensible?',
    minutos: 65,
  },
  'c11s6-': {
    objetivos: ['Construir Ybus/Zbus y leer Z_kk (Thévenin) y Z_ik (huecos de tensión)', 'Fallar a mitad de línea con bus ficticio y sumar el aporte de motores'],
    errorComun: 'Creer que cada falla exige reducir la red a mano: la Zbus se invierte UNA vez y contiene todos los Thévenin.',
    demo: 'Laboratorio Zbus: recorrer los buses viendo Z_kk cambiar; deslizar la falla por la línea y encontrar el mínimo fuera del centro; apagar el aporte del motor.',
    discusion: '¿Por qué la corriente mínima de falla dimensiona la SENSIBILIDAD del relé y la máxima el interruptor?',
    minutos: 75,
  },
  'c11s7-': {
    objetivos: ['Aplicar el ±30° del grupo vectorial a cada secuencia (signos opuestos)', 'Analizar fallas evolutivas y el aporte de motores; plantear la cross-country'],
    errorComun: 'Desfasar ambas secuencias con el mismo signo — la negativa gira al revés y el patrón del otro lado del banco sale mal.',
    demo: 'DyShiftLab: la SLG que se vuelve patrón bifásico con residual cero; EvolvingFaultLab: leer el 3I₀ como narrador de la evolución.',
    discusion: '¿Por qué el registro de 3I₀ que sube y luego muere delata una falla evolutiva completa?',
    minutos: 70,
  },
}

// ---------------------------------------------------------------------------
// Plantillas de problemas parametrizables (usan el motor de física real)
// ---------------------------------------------------------------------------

export interface GeneratedProblem {
  params: Record<string, number>
  statement: string
  answer: string
}

export interface ProblemTemplate {
  id: string
  chapter: number
  title: string
  generate: () => GeneratedProblem
}

const rnd = (min: number, max: number, step = 1): number => {
  const n = Math.floor((max - min) / step) + 1
  return Math.round((min + Math.floor(Math.random() * n) * step) * 1e6) / 1e6
}
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  {
    id: 'c1-circuito',
    chapter: 1,
    title: 'Circuito magnético con entrehierro',
    generate() {
      const N = rnd(200, 1000, 50)
      const I = rnd(1, 5, 0.5)
      const gMm = rnd(0.5, 3, 0.5)
      const muR = rnd(2000, 6000, 500)
      const A = 4e-4
      const L = 0.4
      const g = gMm / 1000
      const F = N * I
      const Rc = L / (muR * MU0 * A)
      const Rg = g / (MU0 * A)
      const phi = F / (Rc + Rg)
      const B = phi / A
      const share = (Rg / (Rc + Rg)) * 100
      return {
        params: { N, I, gMm, muR },
        statement: `Un núcleo de acero (μr = ${muR}, longitud media 0.40 m, sección 4 cm²) con un entrehierro de ${gMm} mm lleva una bobina de ${N} vueltas por la que circula ${I} A. Halle (a) la FMM, (b) el flujo, (c) la densidad de flujo B, y (d) el porcentaje de FMM que consume el entrehierro.`,
        answer: `F = N·I = ${fmt(F, 0)} A·v. R_hierro = ${fmt(Rc / 1000, 1)} kA·v/Wb, R_gap = ${fmt(Rg / 1000, 1)} kA·v/Wb. φ = F/(R_h+R_g) = ${fmt(phi * 1000, 3)} mWb. B = φ/A = ${fmt(B, 3)} T. Entrehierro consume ${fmt(share, 1)} % de la FMM.`,
      }
    },
  },
  {
    id: 'c2-ideal',
    chapter: 2,
    title: 'Transformador ideal y reflexión de impedancia',
    generate() {
      const N1 = rnd(400, 2000, 100)
      const N2 = rnd(50, 400, 50)
      const V1 = rnd(1200, 4800, 120)
      const ZL = rnd(1, 12, 0.5)
      const a = N1 / N2
      const V2 = V1 / a
      const I2 = V2 / ZL
      const I1 = I2 / a
      const S = V2 * I2
      const Zref = a * a * ZL
      return {
        params: { N1, N2, V1, ZL },
        statement: `Un transformador ideal tiene N₁ = ${N1}, N₂ = ${N2}. Se alimenta con V₁ = ${V1} V y alimenta una carga Z = ${ZL} Ω. Halle (a) la relación a, (b) V₂, (c) I₂ e I₁, (d) la impedancia vista desde el primario, y verifique S₁ = S₂.`,
        answer: `a = N₁/N₂ = ${fmt(a, 2)}. V₂ = V₁/a = ${fmt(V2, 0)} V. I₂ = V₂/Z = ${fmt(I2, 1)} A, I₁ = I₂/a = ${fmt(I1, 2)} A. Z′ = a²·Z = ${fmt(Zref, 0)} Ω. S₁ = V₁·I₁ = ${fmt((V1 * I1) / 1000, 2)} kVA = S₂ = V₂·I₂ = ${fmt(S / 1000, 2)} kVA ✓`,
      }
    },
  },
  {
    id: 'c5-potangulo',
    chapter: 5,
    title: 'Potencia-ángulo de máquina síncrona',
    generate() {
      const Eaf = rnd(1.2, 2.0, 0.1)
      const Xs = rnd(0.8, 1.4, 0.1)
      const Vt = 1.0
      const Pmax = (Eaf * Vt) / Xs
      const Pm = Math.round(rnd(0.4, 0.85, 0.05) * Pmax * 100) / 100
      const delta = (Math.asin(Math.min(1, (Pm * Xs) / (Eaf * Vt))) * 180) / Math.PI
      const margen = ((Pmax - Pm) / Pmax) * 100
      return {
        params: { Eaf, Xs, Pm },
        statement: `Un generador síncrono cilíndrico (Eaf = ${fmt(Eaf, 1)} pu, Xs = ${fmt(Xs, 1)} pu) opera contra una barra infinita (Vt = 1.0 pu) entregando P = ${fmt(Pm, 2)} pu. Halle (a) la potencia máxima transmisible, (b) el ángulo de potencia δ, y (c) el margen de reserva de estabilidad.`,
        answer: `Pmax = Eaf·Vt/Xs = ${fmt(Pmax, 2)} pu. δ = arcsen(P·Xs/(Eaf·Vt)) = ${fmt(delta, 1)}°. Margen = (Pmax−P)/Pmax = ${fmt(margen, 0)} %.`,
      }
    },
  },
  {
    id: 'c5-paralelo',
    chapter: 5,
    title: 'Generadores en paralelo: estatismo y frecuencia',
    generate() {
      const k = rnd(0.8, 1.5, 0.1)
      const f1 = rnd(60.8, 62.0, 0.1)
      const f2 = rnd(60.5, f1, 0.1)
      const pL = rnd(1.5, 4, 0.25)
      const f = (f1 / k + f2 / k - pL) / (1 / k + 1 / k)
      const p1 = (f1 - f) / k
      const p2 = (f2 - f) / k
      return {
        params: { k, f1, f2, pL },
        statement: `Dos generadores sincrónicos en paralelo alimentan una carga de ${fmt(pL, 2)} MW. Ambos gobernadores tienen estatismo k = ${fmt(k, 1)} Hz/MW; en vacío el generador 1 quedaría a ${fmt(f1, 1)} Hz y el 2 a ${fmt(f2, 1)} Hz. Halle (a) la frecuencia del sistema, (b) la potencia de cada generador, y (c) cuánto debe subirse el setpoint de AMBOS gobernadores para devolver la frecuencia a 60 Hz sin alterar el reparto.`,
        answer: `f = (f₁+f₂−k·P_L)/2 = ${fmt(f, 2)} Hz. P₁ = (${fmt(f1, 1)}−f)/k = ${fmt(p1, 2)} MW, P₂ = ${fmt(p2, 2)} MW. Para volver a 60 Hz: subir ambos setpoints ${fmt(60 - f, 2)} Hz (el reparto depende solo de la DIFERENCIA de setpoints).`,
      }
    },
  },
  {
    id: 'c6-niveles',
    chapter: 6,
    title: 'Niveles de corriente de cortocircuito súbito',
    generate() {
      const Xd2 = rnd(0.15, 0.25, 0.01)
      const Xd1 = rnd(0.28, 0.4, 0.02)
      const Xd = rnd(0.9, 1.3, 0.1)
      const E = 1.0
      const Isub = E / Xd2
      const Itr = E / Xd1
      const Iss = E / Xd
      const peak = Math.SQRT2 * Isub * 1.8
      return {
        params: { Xd2, Xd1, Xd },
        statement: `Una máquina síncrona (E = 1.0 pu en vacío) con X″d = ${fmt(Xd2, 2)}, X′d = ${fmt(Xd1, 2)}, Xd = ${fmt(Xd, 1)} pu sufre un cortocircuito trifásico en bornes. Halle (a) las corrientes subtransitoria, transitoria y permanente, y (b) estime el peor pico asimétrico (factor 1.8).`,
        answer: `I″ = E/X″d = ${fmt(Isub, 2)} pu, I′ = E/X′d = ${fmt(Itr, 2)} pu, Iss = E/Xd = ${fmt(Iss, 2)} pu. Pico asimétrico ≈ 1.8·√2·I″ = ${fmt(peak, 2)} pu.`,
      }
    },
  },
  {
    id: 'c7-slip',
    chapter: 7,
    title: 'Deslizamiento y frecuencia del rotor',
    generate() {
      const poles = pick([2, 4, 6, 8])
      const f = pick([50, 60])
      const ns = syncSpeedRpm(f, poles)
      const s = rnd(0.02, 0.06, 0.005)
      const nm = Math.round((1 - s) * ns)
      const sReal = (ns - nm) / ns
      const fr = sReal * f
      return {
        params: { poles, f, nm },
        statement: `Un motor de inducción de ${poles} polos conectado a ${f} Hz gira a ${nm} r/min a plena carga. Halle (a) la velocidad síncrona, (b) el deslizamiento y (c) la frecuencia de las corrientes del rotor.`,
        answer: `nₛ = 120·f/p = ${fmt(ns, 0)} r/min. s = (nₛ−nₘ)/nₛ = ${fmt(sReal, 4)} (${fmt(sReal * 100, 2)} %). fᵣ = s·f = ${fmt(fr, 2)} Hz.`,
      }
    },
  },
  {
    id: 'c7-parvel',
    chapter: 7,
    title: 'Par de arranque, ruptura y efecto de R₂',
    generate() {
      const R2 = rnd(0.1, 0.35, 0.05)
      const p = { ...DEFAULT_INDUCTION, R2 }
      const th = inductionThevenin(p)
      const { Tmax, sMax } = inductionMaxTorque(p)
      const Tstart = inductionStartTorque(p)
      return {
        params: { R2 },
        statement: `Un motor de inducción de 460 V, 4 polos, 60 Hz (R₁ = 0.2, X₁ = 0.5, R₂ = ${fmt(R2, 2)}, X₂ = 0.5, Xm = 15 Ω) opera desde la red. Halle (a) el par de arranque, (b) el par de ruptura y el deslizamiento al que ocurre. (c) ¿Qué le pasaría a cada uno si se duplicara R₂?`,
        answer: `Vth = ${fmt(th.Vth, 0)} V, Rth = ${fmt(th.Rth, 3)}, Xth = ${fmt(th.Xth, 3)} Ω. T_arranque = ${fmt(Tstart, 0)} N·m. Tmax = ${fmt(Tmax, 0)} N·m @ s = ${fmt(sMax, 3)}. Al doblar R₂: s_maxT se duplica (${fmt(sMax * 2, 3)}), Tmax NO cambia.`,
      }
    },
  },
  {
    id: 'c7-rendimiento',
    chapter: 7,
    title: 'Reparto de potencia y rendimiento (inducción)',
    generate() {
      const sPct = rnd(2, 5, 0.5)
      const s = sPct / 100
      const r = inductionSolve(DEFAULT_INDUCTION, s)
      return {
        params: { sPct },
        statement: `El motor de 460 V, 4 polos, 60 Hz (parámetros estándar del laboratorio) opera con deslizamiento s = ${fmt(s, 3)}. Halle (a) la potencia de entrehierro, (b) el par interno, (c) la pérdida en el cobre del rotor y la potencia mecánica, y (d) el rendimiento.`,
        answer: `Pgap = ${fmt(r.Pgap / 1000, 1)} kW. Tind = Pgap/ωs = ${fmt(r.Tind, 0)} N·m. P_cobre_rotor = s·Pgap = ${fmt(r.Prcl / 1000, 2)} kW; P_mec = (1−s)·Pgap = ${fmt(r.Pmech / 1000, 1)} kW. η = ${fmt(r.eff * 100, 1)} %.`,
      }
    },
  },
  {
    id: 'c8-vf',
    chapter: 8,
    title: 'Ajuste de tensión en control V/f',
    generate() {
      const f = pick([20, 30, 40, 45])
      const fBase = 60
      const Vrated = DEFAULT_INDUCTION.V
      const boost = 15
      const V = vfVoltage(f, fBase, Vrated, boost)
      const Tmax60 = inductionMaxTorque(inductionAtFreq(DEFAULT_INDUCTION, 60, Vrated)).Tmax
      const Tmax90 = inductionMaxTorque(inductionAtFreq(DEFAULT_INDUCTION, 90, Vrated)).Tmax
      return {
        params: { f },
        statement: `Un variador V/f (tensión nominal ${fmt(Vrated, 0)} V por fase a 60 Hz, boost ${boost} V) debe operar el motor a ${f} Hz. Halle (a) la tensión que aplica el inversor, (b) argumente por qué el par máximo se mantiene a ${f} Hz, y (c) estime el par máximo a 90 Hz frente al de 60 Hz.`,
        answer: `V(${f}) = boost + (Vrated−boost)·(f/60) = ${fmt(V, 0)} V. A ${f} Hz (< nominal) V/f se mantiene → flujo constante → Tmax ≈ constante. A 90 Hz (debilitamiento): Tmax ≈ Tmax(60)·(60/90)² → ${fmt(Tmax60, 0)} → ${fmt(Tmax90, 0)} N·m.`,
      }
    },
  },
  {
    id: 'c8-foc',
    chapter: 8,
    title: 'Desacoplamiento flujo/par en FOC',
    generate() {
      const id = rnd(3, 7, 1)
      const iq1 = rnd(8, 14, 1)
      const iq2 = iq1 * 2
      const flux = focFlux(DEFAULT_FOC.Lm, id)
      const T1 = focTorque(DEFAULT_FOC, id, iq1)
      const T2 = focTorque(DEFAULT_FOC, id, iq2)
      return {
        params: { id, iq1 },
        statement: `Un accionamiento FOC (2 pares de polos, Lm = 0.040 H, Lr = 0.042 H) fija id = ${id} A. Halle (a) el flujo del rotor, (b) el par con iq = ${iq1} A y con iq = ${iq2} A, y (c) explique por qué el flujo no cambia al variar iq.`,
        answer: `λr = Lm·id = ${fmt(flux, 3)} Wb. T(iq=${iq1}) = ${fmt(T1, 2)} N·m; T(iq=${iq2}) = ${fmt(T2, 2)} N·m (doble iq → doble par). λr = Lm·id no contiene iq ⇒ ∂λr/∂iq = 0: el flujo es independiente del par.`,
      }
    },
  },
  {
    id: 'c9-ka',
    chapter: 9,
    title: 'FEM, par y potencia de una máquina de CC',
    generate() {
      const P = pick([2, 4, 6])
      const Z = rnd(200, 800, 20)
      const a = pick([2, 4])
      const phi = rnd(0.01, 0.03, 0.002)
      const rpm = rnd(800, 1800, 50)
      const Ia = rnd(20, 80, 5)
      const Ka = dcKa(P, Z, a)
      const omega = (rpm * 2 * Math.PI) / 60
      const Ea = dcEmf(Ka, phi, omega)
      const T = dcTorque(Ka, phi, Ia)
      return {
        params: { P, Z, a, phi, rpm, Ia },
        statement: `Una máquina de CC de ${P} polos con Z = ${Z} conductores en a = ${a} caminos paralelos tiene Φ = ${phi} Wb/polo, gira a ${rpm} r/min y lleva Ia = ${Ia} A. Halle (a) Ka, (b) la FEM Ea, (c) el par T y (d) verifique Ea·Ia = T·ω.`,
        answer: `Ka = P·Z/(2π·a) = ${fmt(Ka, 1)}. ω = ${fmt(omega, 1)} rad/s. Ea = Ka·Φ·ω = ${fmt(Ea, 0)} V. T = Ka·Φ·Ia = ${fmt(T, 1)} N·m. Ea·Ia = ${fmt((Ea * Ia) / 1000, 2)} kW = T·ω = ${fmt((T * omega) / 1000, 2)} kW ✓`,
      }
    },
  },
  {
    id: 'c9-motor',
    chapter: 9,
    title: 'Motor de CC shunt: velocidad y rendimiento',
    generate() {
      const Vt = pick([120, 240])
      const Ra = rnd(0.2, 0.6, 0.05)
      const Ia = rnd(20, 60, 5)
      const p = { ...DEFAULT_DC, Vt, Ra }
      const op = dcOperatingByIa('shunt', p, Ia)
      const r = dcPowerFlow('shunt', p, Ia, false)
      return {
        params: { Vt, Ra, Ia },
        statement: `Un motor de CC shunt (Vt = ${Vt} V, Ra = ${fmt(Ra, 2)} Ω, Ka·Φ = ${p.KE} V·s/rad, If = ${p.If} A, pérdidas rotacionales ${p.Prot} W) trabaja con Ia = ${Ia} A. Halle (a) la FEM Ea y la velocidad, (b) la potencia desarrollada, (c) la potencia de salida y el rendimiento.`,
        answer: `Ea = Vt − Ia·Ra = ${fmt(op.Ea, 0)} V; n = Ea/(Ka·Φ)·60/2π = ${fmt(op.rpm, 0)} r/min. Pdev = Ea·Ia = ${fmt(r.Pdev / 1000, 2)} kW. Pin = ${fmt(r.Pin / 1000, 2)} kW; Pout = ${fmt(r.Pout / 1000, 2)} kW; η = ${fmt(r.eff * 100, 1)} %.`,
      }
    },
  },
  {
    id: 'c10-taus',
    chapter: 10,
    title: 'Constantes de tiempo y corriente de arranque (CC)',
    generate() {
      const Vt = pick([120, 240])
      const Ra = rnd(0.2, 0.8, 0.05)
      const La = rnd(0.003, 0.02, 0.001)
      const J = rnd(0.05, 0.3, 0.01)
      const p = { ...DEFAULT_DCDYN, Vt, Ra, La, J }
      const { taue, taum } = dcTimeConstants(p)
      const Iarr = dcStartCurrent(Vt, Ra)
      return {
        params: { Vt, Ra, La, J },
        statement: `Un motor de CC (Vt = ${Vt} V, Ra = ${fmt(Ra, 2)} Ω, La = ${fmt(La * 1000, 0)} mH, Ka·Φ = ${p.kPhi} V·s/rad, J = ${fmt(J, 2)} kg·m²). Halle (a) τe, (b) τm, (c) su relación y (d) la corriente de arranque directo.`,
        answer: `τe = La/Ra = ${fmt(taue * 1000, 1)} ms. τm = J·Ra/(KaΦ)² = ${fmt(taum * 1000, 1)} ms. τm/τe = ${fmt(taum / taue, 1)} (≫1 ⇒ control en cascada). Iarr = Vt/Ra = ${fmt(Iarr, 0)} A.`,
      }
    },
  },
  {
    id: 'c10-2orden',
    chapter: 10,
    title: 'Sistema de 2.º orden: ωn, ζ y régimen (CC)',
    generate() {
      const Ra = rnd(0.1, 0.8, 0.05)
      const La = rnd(0.004, 0.025, 0.001)
      const p = { ...DEFAULT_DCDYN, Ra, La }
      const so = dcSecondOrder(p)
      return {
        params: { Ra, La },
        statement: `Para un motor de CC (Ra = ${fmt(Ra, 2)} Ω, La = ${fmt(La * 1000, 0)} mH, Ka·Φ = ${p.kPhi} V·s/rad, J = ${p.J} kg·m², B = ${p.B}), halle (a) la frecuencia natural ωn, (b) el amortiguamiento ζ y (c) el régimen de la respuesta al escalón.`,
        answer: `ωn = √[(Ra·B+(KaΦ)²)/(La·J)] = ${fmt(so.wn, 1)} rad/s. ζ = (Ra·J+La·B)/(2√(La·J·(Ra·B+(KaΦ)²))) = ${fmt(so.zeta, 2)}. Régimen: ${so.regime}.`,
      }
    },
  },
]
