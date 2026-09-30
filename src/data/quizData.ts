import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'En un Rectificador Controlado de Silicio (SCR), ¿cuál es la diferencia fundamental y crítica entre la Corriente de Enclavamiento (Latching Current - IL) y la Corriente de Mantenimiento (Holding Current - IH)?',
    context: 'Subtema 2.1.1 - Parámetros de Disparo y Conducción del SCR',
    options: [
      { id: 'A', text: 'IL es la corriente mínima requerida para permanecer encendido tras retirar el pulso de compuerta; IH es la corriente mínima por debajo de la cual se apaga una vez cebado. Siempre IL > IH.' },
      { id: 'B', text: 'IH es mayor que IL, pues representa la corriente pico admisible durante el encendido por compuerta.' },
      { id: 'C', text: 'IL aplica únicamente cuando el SCR se alimenta con corriente continua (CD), mientras que IH opera solo en corriente alterna (CA).' },
      { id: 'D', text: 'Ambos términos son sinónimos técnicos y representan el mismo valor nominal en la hoja del fabricante.' }
    ],
    correctId: 'A',
    explanation: 'Correcto. La Corriente de Enclavamiento (IL) es la corriente de ánodo mínima que debe alcanzarse antes de retirar el pulso de excitación de compuerta para que el SCR mantenga su regeneración interna (α1+α2 >= 1). La Corriente de Mantenimiento (IH) es la corriente por debajo de la cual el dispositivo conmutará al estado de bloqueo. Típicamente, IL es de 2 a 3 veces mayor que IH (IL > IH).',
    topicRef: '2.1.1 Parámetros SCR (IL vs IH)'
  },
  {
    id: 2,
    question: 'Un TRIAC se encuentra conectado a una red monofásica de 127 VRMS a 60 Hz controlando la velocidad de un motor universal. ¿En qué cuadrantes de disparo se recomienda operar industrialmente para garantizar la máxima sensibilidad y evitar disparos erráticos?',
    context: 'Subtema 2.1.2 - Modos y Cuadrantes de Disparo del TRIAC',
    options: [
      { id: 'A', text: 'Exclusivamente en Cuadrante IV (MT2 negativo, Compuerta positiva).' },
      { id: 'B', text: 'En los Cuadrantes I [MT2(+), G(+)] y III [MT2(-), G(-)], evitando el Cuadrante IV debido a su baja sensibilidad y alto requerimiento de corriente IGT.' },
      { id: 'C', text: 'En Cuadrantes II y IV utilizando pulsos de compuerta exclusivamente continuos.' },
      { id: 'D', text: 'Cualquier cuadrante tiene idéntica sensibilidad puesto que el TRIAC es perfectamente simétrico en sus 5 capas.' }
    ],
    correctId: 'B',
    explanation: 'Excelente. Los fabricantes y la literatura técnica recomiendan operar en Cuadrantes I [MT2(+), G(+)] y III [MT2(-), G(-)], comúnmente logrados mediante un DIAC simétrico. El Cuadrante IV [MT2(-), G(+)] presenta la menor sensibilidad (requiere hasta 3 veces más corriente IGT) y una tasa dv/dt crítica de reencendido deficiente, por lo que debe evitarse.',
    topicRef: '2.1.2 Cuadrantes de Disparo del TRIAC'
  },
  {
    id: 3,
    question: 'En un circuito de control de fase con DIAC tipo DB3 (VBO = 32V) conectado a la compuerta de un TRIAC, ¿cuál es el papel principal del DIAC en la red de retardo RC?',
    context: 'Subtema 2.1.3 - Diodo para Corriente Alterna (DIAC)',
    options: [
      { id: 'A', text: 'Rectificar la onda de corriente alterna para convertirla en media onda pulsante.' },
      { id: 'B', text: 'Disparar bruscamente liberando un pulso de corriente de alta pendiente cuando el capacitor alcanza ±32V, asegurando un encendido simétrico y nítido del TRIAC en ambos semiciclos.' },
      { id: 'C', text: 'Limitar la corriente de carga del motor para evitar que consuma más de 10 Amperes.' },
      { id: 'D', text: 'Elevar la tensión de la red eléctrica mediante resonancia capacitiva.' }
    ],
    correctId: 'B',
    explanation: 'Correcto. El DIAC permanece en bloqueo hasta que el capacitor de la red RC se carga a su tensión de ruptura VBO (±32V). Al superarse, entra en resistencia negativa brusca produciendo una descarga rápida del capacitor a la compuerta del TRIAC (pulso de corriente con alto di/dt), garantizando disparo limpio, simetría en ambos semiciclos y previniendo calentamientos por disparo indeciso.',
    topicRef: '2.1.3 DIAC y Disparo Simétrico'
  },
  {
    id: 4,
    question: 'En un oscilador de relajación con Transistor Unipolar de Juntura (UJT 2N2646) alimentado con VBB = 20V, si la relación intrínseca de separación es η = 0.65 y la caída de la unión diódica es VD = 0.6V, ¿cuál es el voltaje de pico (VP) en el que se descargará el capacitor?',
    formula: 'V_P = \\eta \\cdot V_{BB} + V_D',
    context: 'Subtema 2.1.4 - UJT y Oscilador de Relajación',
    options: [
      { id: 'A', text: 'VP = 13.6 V' },
      { id: 'B', text: 'VP = 20.6 V' },
      { id: 'C', text: 'VP = 12.4 V' },
      { id: 'D', text: 'VP = 7.0 V' }
    ],
    correctId: 'A',
    explanation: 'Cálculo exacto: VP = η * VBB + VD = (0.65 * 20V) + 0.6V = 13.0V + 0.6V = 13.6V. Al alcanzar este potencial el emisor del UJT, entra en avalancha hacia la Base 1, transfiriendo un pulso agudo a la compuerta del tiristor.',
    topicRef: '2.1.4 UJT: Cálculo de Tensión de Pico VP'
  },
  {
    id: 5,
    question: 'Un tiristor conduce una corriente promedio Iavg = 8 A y una corriente eficaz IRMS = 12 A en un rectificador controlado. Si su caída umbral es VT0 = 1.0 V y su resistencia dinámica interna es rd = 0.02 Ω, ¿cuál es la disipación de potencia promedio (PD) en el dispositivo?',
    formula: 'P_D = V_{T0} \\cdot I_{avg} + r_d \\cdot I_{RMS}^2',
    context: 'Subtema 2.2 - Disipación de Potencia y Modelo Térmico',
    options: [
      { id: 'A', text: 'PD = 10.88 W' },
      { id: 'B', text: 'PD = 8.24 W' },
      { id: 'C', text: 'PD = 20.45 W' },
      { id: 'D', text: 'PD = 144.0 W' }
    ],
    correctId: 'A',
    explanation: 'Cálculo exacto: PD = (VT0 * Iavg) + (rd * IRMS^2) = (1.0 V * 8 A) + (0.02 Ω * 12^2 A^2) = 8.0 W + (0.02 * 144) = 8.0 W + 2.88 W = 10.88 W. Este calor debe evacuarse por el disipador.',
    topicRef: '2.2 Disipación Térmica en Tiristores'
  },
  {
    id: 6,
    question: 'Para el tiristor anterior (PD = 10.88 W), se especifica una temperatura máxima de unión Tj(max) = 125°C, temperatura ambiente máxima en tablero Ta = 40°C, resistencia térmica juntura-cápsula Rth(j-c) = 1.5 °C/W y de grasa de silicona Rth(c-s) = 0.5 °C/W. ¿Cuál es el valor MÁXIMO admisible de la resistencia térmica del disipador (Rth(s-a)) para no sobrepasar el límite del silicio?',
    formula: 'R_{th,s-a} \\le \\frac{T_{j,max} - T_a}{P_D} - (R_{th,j-c} + R_{th,c-s})',
    context: 'Subtema 2.2 - Dimensionamiento de Disipadores Térmicos',
    options: [
      { id: 'A', text: 'Rth(s-a) <= 5.81 °C/W' },
      { id: 'B', text: 'Rth(s-a) <= 9.81 °C/W' },
      { id: 'C', text: 'Rth(s-a) <= 2.00 °C/W' },
      { id: 'D', text: 'Rth(s-a) <= 12.5 °C/W' }
    ],
    correctId: 'A',
    explanation: 'Cálculo paso a paso: Resistencia térmica total admisible Rth(total) = (Tj,max - Ta) / PD = (125 - 40) / 10.88 = 85 / 10.88 ≈ 7.8125 °C/W. Descontando las resistencias internas: Rth(s-a) <= 7.8125 - (1.5 + 0.5) = 7.8125 - 2.0 = 5.81 °C/W. Cualquier disipador con Rth mayor a 5.81 °C/W provocará sobrecalentamiento destructivo.',
    topicRef: '2.2 Cálculo de Resistencia Térmica Rth'
  },
  {
    id: 7,
    question: 'En un circuito de control de velocidad para un motor de corriente continua alimentado con SCR, ¿cuál es el efecto de variar el ángulo de disparo α desde 0° hasta 120° en un rectificador de media onda?',
    context: 'Subtema 2.3 - Control de Fase y 2.5 Control de Motores',
    options: [
      { id: 'A', text: 'El voltaje medio (VCD) aplicado al inducido del motor disminuye progresivamente según VCD = (Vm / 2π) * (1 + cos α), reduciendo la velocidad de giro (RPM) del motor.' },
      { id: 'B', text: 'El motor gira en sentido inverso de manera instantánea.' },
      { id: 'C', text: 'La velocidad del motor se incrementa debido al incremento de la frecuencia armónica de la línea.' },
      { id: 'D', text: 'No afecta la velocidad, solo incrementa el consumo de corriente en la compuerta del SCR.' }
    ],
    correctId: 'A',
    explanation: 'Correcto. La tensión promedio continua entregada al motor de CD con carga inductiva y diodo de libre rueda responde a VCD = (Vm / 2π) * (1 + cos α). Al incrementar α (retardando el disparo), el área bajo la curva de tensión disminuye y por consiguiente decae la fuerza contraelectromotriz (FCEM) y la velocidad en RPM.',
    topicRef: '2.3 Control de Fase y Velocidad de Motor'
  },
  {
    id: 8,
    question: 'Al controlar un motor de inducción polifásico con Relevadores de Estado Sólido (SSR), ¿por qué es fundamental tener en cuenta la diferencia entre un SSR con "Cruce por Cero" (Zero-Crossing) y uno de "Disparo Instantáneo" (Random Turn-On)?',
    context: 'Subtema 2.4 - Relevadores de Estado Sólido (SSR) en Motores Polifásicos',
    options: [
      { id: 'A', text: 'Para motores polifásicos fuertemente inductivos se prefieren SSRs de disparo instantáneo (Random) o conmutación en pico de tensión para evitar saturación del núcleo ferromagnético y picos extremos de corriente magnetizante que activarían protecciones.' },
      { id: 'B', text: 'Los SSR de cruce por cero solo funcionan con corriente directa de 12V.' },
      { id: 'C', text: 'El cruce por cero desgasta los contactos mecánicos internos del relevador de estado sólido.' },
      { id: 'D', text: 'No existe ninguna diferencia eléctrica, solo un cambio cosmético en la carcasa plástica del fabricante.' }
    ],
    correctId: 'A',
    explanation: 'Correcto y de alta importancia industrial: Los SSR de cruce por cero (Zero-Crossing) son ideales para cargas resistivas puras. Sin embargo, al conectar un motor o transformador (carga inductiva pura L) en el cruce de tensión por 0V, el flujo magnético acumulado durante el primer semiciclo alcanza el doble del nominal (Bmax = 2*Bnom), saturando el hierro y provocando picos de corriente destructivos (inrush de hasta 15-20x Inom). Por ello en motores se prefieren SSR Random.',
    topicRef: '2.4 Conmutación SSR en Cargas Inductivas'
  },
  {
    id: 9,
    question: '¿Cuál es la función primordial de conectar una red amortiguadora (Snubber) en paralelo con un tiristor (SCR o TRIAC) al controlar cargas inductivas como motores?',
    context: 'Subtema 2.1 - Protección contra dv/dt y di/dt',
    options: [
      { id: 'A', text: 'Limitar la tasa de crecimiento de voltaje (dv/dt) durante el bloqueo inverso para impedir el encendido espurio (falso disparo capacitivo) y absorber picos de sobretensión inductiva (L*di/dt).' },
      { id: 'B', text: 'Aumentar la ganancia de compuerta para permitir disparar con corrientes inferiores a 1 µA.' },
      { id: 'C', text: 'Reemplazar el disipador de aluminio para enfriar el silicio a través del capacitor.' },
      { id: 'D', text: 'Generar oscilaciones de alta frecuencia para sintonizar el motor con la línea.' }
    ],
    correctId: 'A',
    explanation: 'Exacto. Cuando un tiristor se apaga con una carga inductiva, la rápida interrupción de corriente genera un voltaje inducido V = L*(di/dt) con una pendiente dv/dt muy empinada. La capacitancia intrínseca de la juntura J2 (Cj2) dejaría pasar una corriente i = C*(dv/dt) suficiente para cebar falsamente el tiristor sin señal de compuerta. El circuito RC Snubber amortigua esta rampa.',
    topicRef: '2.1 Protección Snubber contra dv/dt'
  },
  {
    id: 10,
    question: 'En un circuito de CD alimentado a 100 V con un SCR en conducción, el operador elimina la señal de compuerta desconectándola físicamente. ¿Qué ocurrirá con la corriente a través de la carga?',
    context: 'Subtema 2.1.1 - Métodos de Apagado (Conmutación Natural vs Forzada)',
    options: [
      { id: 'A', text: 'El SCR permanecerá en plena conducción ininterrumpida; la compuerta pierde el control tras el cebado en CD y se requiere un circuito de conmutación forzada o interrumpir la línea para apagarlo.' },
      { id: 'B', text: 'El SCR se apagará de manera instantánea (en menos de 1 microsegundo) al retirar la excitación de compuerta.' },
      { id: 'C', text: 'El SCR explotará debido a la falta de polarización en su compuerta.' },
      { id: 'D', text: 'El voltaje en la carga caerá exactamente a la mitad (50V).' }
    ],
    correctId: 'A',
    explanation: 'Correcto. Esta es la característica reina del tiristor: es un interruptor regenerativo de enclavamiento. En corriente alterna (CA) el apagado ocurre naturalmente en cada cruce por cero de la corriente (conmutación natural), pero en corriente continua (CD) nunca cruza por cero de forma espontánea; por lo tanto, retirar la compuerta no lo apaga. Requiere conmutación forzada.',
    topicRef: '2.1.1 Conmutación Forzada en Corriente Continua'
  }
];
