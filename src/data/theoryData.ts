import { DeviceInfo } from '../types';

export const DEVICES: DeviceInfo[] = [
  {
    id: 'scr',
    name: 'SCR',
    subtopic: '2.1.1 Rectificador Controlado de Silicio',
    fullName: 'Silicon Controlled Rectifier (SCR)',
    symbol: 'Anodo (A) ──▷|── Catodo (K), Compuerta (G)',
    summary: 'Dispositivo semiconductor de 4 capas (PNPN) de tres terminales que actúa como un diodo conmutador biestable con encendido por pulso de compuerta.',
    structure: {
      layers: ['P1 (Ánodo)', 'N1 (Base N)', 'P2 (Base P - Gate)', 'N2 (Cátodo)'],
      terminals: ['Ánodo (A)', 'Cátodo (K)', 'Compuerta (G)'],
      description: 'Consta de cuatro capas semiconductoras alternadas P-N-P-N formando tres uniones J1, J2 y J3. Equivale al modelo de dos transistores bipolares acoplados en retroalimentación positiva (PNP y NPN).'
    },
    triggering: {
      methods: [
        'Disparo por corriente de compuerta (IG > IGT, método estándar y seguro)',
        'Disparo por sobretensión directa (Breakover VBO - generalmente destructivo)',
        'Disparo por gradiente de tensión (dv/dt excesivo capacitivo en J2)',
        'Disparo térmico (aumento descontrolado de portadores intrínsecos)',
        'Disparo óptico (LASCR - fototiristores)'
      ],
      details: 'Para que el SCR conmute al estado de conducción, la corriente de compuerta IG debe suministrar portadores suficientes para que el producto de las ganancias (α1 + α2) sea mayor o igual a 1. La corriente del ánodo debe superar la Corriente de Enclavamiento (IL) antes de retirar el pulso de compuerta.',
      criticalParams: [
        { name: 'Tensión de Ruptura en Directo', symbol: 'V_BO', typical: '400V - 1600V', desc: 'Voltaje en el cual ocurre avalancha sin pulso de compuerta.' },
        { name: 'Tensión Pico Inversa', symbol: 'V_RRM', typical: '600V - 1800V', desc: 'Máximo voltaje inverso de bloqueo repetitivo.' },
        { name: 'Corriente de Enclavamiento', symbol: 'I_L', typical: '30mA - 120mA', desc: 'Mínima corriente de ánodo requerida para mantener conducción tras retirar el pulso de compuerta.' },
        { name: 'Corriente de Mantenimiento', symbol: 'I_H', typical: '15mA - 50mA', desc: 'Mínima corriente de ánodo por debajo de la cual el SCR regresa al estado de bloqueo.' },
        { name: 'Corriente de Disparo de Compuerta', symbol: 'I_GT', typical: '10mA - 50mA', desc: 'Corriente mínima de compuerta para garantizar el cebado seguro a 25°C.' }
      ]
    },
    turnOff: {
      methods: [
        'Conmutación Natural (por línea): La corriente cruza por cero en un circuito de CA.',
        'Conmutación Forzada: Circuito LC o transistor auxiliar que invierte la polaridad ánodo-cátodo por un tiempo t_q > t_off.',
        'Reducción de corriente de ánodo por debajo de IH mediante alta impedancia o apertura del circuito.'
      ],
      details: 'El SCR no se apaga retirando la señal de compuerta; una vez cebado, la compuerta pierde todo control. Para su apagado se requiere reducir la corriente principal IA < IH durante el tiempo de apagado especificado (t_q).'
    },
    applications: [
      'Control de velocidad de motores de CD (puentes rectificadores semicontrolados y totalmente controlados).',
      'Cargadores de baterías industriales de alta potencia.',
      'Sistemas de calefacción eléctrica y hornos de inducción.',
      'Interruptores estáticos de alta tensión (HVDC y arrancadores suaves).',
      'Protección tipo palanca (Crowbar) contra sobretensiones.'
    ],
    ivCurveDescription: {
      forwardBlocking: 'Región de alta resistencia donde la unión J2 está polarizada en inverso (0 < VAK < VBO). Sólo circula una pequeña corriente de fuga IDRM.',
      conduction: 'Región de muy baja caída de tensión (VT ≈ 1.1V a 1.7V), donde los transistores equivalentes están en saturación profunda.',
      reverseBlocking: 'J1 y J3 en inverso. Se comporta como un diodo estándar bloqueando hasta VRRM.',
      keyPoints: [
        { label: 'V_BO', x: 280, y: 195, text: 'Tensión de ruptura en directo (IG = 0)' },
        { label: 'I_L', x: 300, y: 130, text: 'Corriente de enclavamiento (Latching current)' },
        { label: 'I_H', x: 295, y: 165, text: 'Corriente de mantenimiento (Holding current)' },
        { label: 'V_T ≈ 1.4V', x: 310, y: 70, text: 'Caída de tensión en conducción directa' },
        { label: 'V_RRM', x: 100, y: 220, text: 'Tensión pico inversa máxima' }
      ]
    },
    thermalSpecs: {
      typicalRthJC: 1.2,
      typicalRthCS: 0.5,
      maxTj: 125,
      vt0: 0.95,
      rd: 0.015
    }
  },
  {
    id: 'triac',
    name: 'TRIAC',
    subtopic: '2.1.2 Triodo para Corriente Alterna',
    fullName: 'Triode for Alternating Current (TRIAC)',
    symbol: 'MT1 ──▷|◁── MT2, Compuerta (G)',
    summary: 'Dispositivo bidireccional equivalente a dos SCR conectados en antiparalelo con una compuerta común, capaz de conmutar en ambos semiciclos de la CA.',
    structure: {
      layers: ['N1-P1-N2-P2-N3 (Estructura compleja de 5 capas)'],
      terminals: ['Terminal Principal 1 (MT1 / A1)', 'Terminal Principal 2 (MT2 / A2)', 'Compuerta (G)'],
      description: 'Estructura bidireccional asimétrica que permite la conducción en ambos sentidos aplicando un pulso de compuerta positivo o negativo con respecto a MT1.'
    },
    triggering: {
      methods: [
        'Cuadrante I [MT2(+), G(+)]: Disparo de alta sensibilidad (modo más eficiente).',
        'Cuadrante II [MT2(+), G(-)]: Sensibilidad media.',
        'Cuadrante III [MT2(-), G(-)]: Alta sensibilidad (recomendado para semiciclo negativo).',
        'Cuadrante IV [MT2(-), G(+)]: Menor sensibilidad y alto riesgo de disparo errático (debe evitarse).'
      ],
      details: 'El método industrial preferido es el control simétrico en Cuadrantes I y III utilizando un DIAC como disparador de pulso limpio, evitando el Cuadrante IV.',
      criticalParams: [
        { name: 'Tensión Máxima de Bloqueo', symbol: 'V_DRM', typical: '600V - 800V', desc: 'Tensión pico máxima en estado de no conducción en ambos sentidos.' },
        { name: 'Corriente Eficaz Nominal', symbol: 'I_T(RMS)', typical: '4A - 40A', desc: 'Corriente eficaz continua que puede conducir con disipador adecuado.' },
        { name: 'Tasa de Aumento de Tensión de Conmutación', symbol: '(dv/dt)_c', typical: '10 - 50 V/µs', desc: 'Crítico al apagar cargas inductivas de motor.' },
        { name: 'Corriente de Disparo de Compuerta', symbol: 'I_GT', typical: '25mA - 50mA', desc: 'Corriente de compuerta requerida para conmutar.' },
        { name: 'Corriente de Mantenimiento', symbol: 'I_H', typical: '20mA - 60mA', desc: 'Corriente por debajo de la cual se apaga en el cruce por cero.' }
      ]
    },
    turnOff: {
      methods: [
        'Cruce natural por cero de la corriente alterna (I_load < I_H).',
        'Para cargas inductivas (motores monofásicos), la tensión y la corriente están desfasadas, por lo que al apagarse el TRIAC experimenta un dv/dt abrupto que puede reencenderlo falsamente si no cuenta con red amortiguadora (Snubber).'
      ],
      details: 'El apagado ocurre de forma natural en cada semiciclo de la red de CA (50/60 Hz) al descender la corriente por debajo de IH.'
    },
    applications: [
      'Control de velocidad de motores universales y monofásicos de fase partida (taladros, licuadoras, ventiladores).',
      'Atenuadores de luz (dimmers) para iluminación resistiva e incandescente.',
      'Control de potencia en resistencias calefactoras industriales mediante modulación por ángulo de fase.',
      'Conmutación de contactores estáticos de CA en sistemas HVAC.'
    ],
    ivCurveDescription: {
      forwardBlocking: 'Bloqueo simétrico en el primer cuadrante (MT2 > MT1) y tercer cuadrante (MT2 < MT1).',
      conduction: 'Conducción bilateral con caída de tensión simétrica (VT ≈ ±1.2V a ±1.6V).',
      reverseBlocking: 'No posee bloqueo inverso tradicional; en el 3er cuadrante conmuta a conducción directa inversa.',
      keyPoints: [
        { label: '+V_BO (Q1)', x: 380, y: 195, text: 'Ruptura directa en primer cuadrante' },
        { label: '-V_BO (Q3)', x: 120, y: 305, text: 'Ruptura en tercer cuadrante' },
        { label: '+I_H', x: 290, y: 160, text: 'Corriente de mantenimiento en Q1' },
        { label: '-I_H', x: 210, y: 340, text: 'Corriente de mantenimiento en Q3' },
        { label: '±V_T ≈ 1.3V', x: 300, y: 80, text: 'Caída de conducción en ambos semiciclos' }
      ]
    },
    thermalSpecs: {
      typicalRthJC: 1.5,
      typicalRthCS: 0.6,
      maxTj: 125,
      vt0: 1.0,
      rd: 0.02
    }
  },
  {
    id: 'diac',
    name: 'DIAC',
    subtopic: '2.1.3 Diodo para Corriente Alterna',
    fullName: 'Diode for Alternating Current (DIAC)',
    symbol: 'MT1 ──▷|◁── MT2 (Sin compuerta)',
    summary: 'Dispositivo semiconductor bidireccional de 3 o 5 capas y dos terminales que actúa como un diodo de disparo simétrico por ruptura de avalancha.',
    structure: {
      layers: ['N1-P-N2 o P1-N1-P2-N2-P3 (Construcción simétrica NPN/PNP)'],
      terminals: ['Terminal 1 (MT1 / A1)', 'Terminal 2 (MT2 / A2)'],
      description: 'Estructura bidireccional completamente simétrica sin terminal de compuerta. Presenta resistencia diferencial negativa una vez alcanzado el voltaje de ruptura VBO.'
    },
    triggering: {
      methods: [
        'Disparo exclusivo por sobretensión simétrica (Breakover Voltage VBO ≈ ±30V a ±40V).'
      ],
      details: 'Cuando el voltaje a través de sus terminales excede la tensión de ruptura VBO (típicamente 32V en el estándar DB3), el DIAC entra en avalancha y la tensión entre sus terminales cae drásticamente (ΔV ≈ 5V - 10V), liberando un pulso de corriente de pico rápido (hasta 2A transitorio) ideal para disparar la compuerta del TRIAC.',
      criticalParams: [
        { name: 'Tensión de Ruptura', symbol: 'V_BO', typical: '28V - 36V (DB3)', desc: 'Tensión simétrica requerida para iniciar la conducción.' },
        { name: 'Tensión Dinámica de Caída', symbol: 'ΔV', typical: '5V - 10V', desc: 'Reducción de tensión al conmutar para entregar pulso a la compuerta.' },
        { name: 'Corriente de Pico Repetitiva', symbol: 'I_TRM', typical: '2A', desc: 'Corriente máxima de pulso suministrable a la compuerta del tiristor.' },
        { name: 'Simetría de Ruptura', symbol: '|V_BO1 - V_BO2|', typical: '< 3V', desc: 'Balance de tensión entre polaridades para evitar componente de CD.' }
      ]
    },
    turnOff: {
      methods: [
        'La corriente decae por debajo de la corriente de mantenimiento (IH ≈ 5mA - 10mA).',
        'El capacitor de sincronización de la red RC se descarga a través de la compuerta del TRIAC.'
      ],
      details: 'Una vez descargado el capacitor de fase a través de la compuerta del TRIAC, la corriente del DIAC cae a cero y el DIAC se bloquea de inmediato hasta el siguiente semiciclo.'
    },
    applications: [
      'Elemento de disparo simétrico para compuertas de TRIAC en controles de fase de motores y dimmers.',
      'Balastros electrónicos de lámparas fluorescentes y fuentes conmutadas (arranque).',
      'Circuitos de destello y generadores de impulsos de precisión.'
    ],
    ivCurveDescription: {
      forwardBlocking: 'Bloqueo simétrico tanto en polaridad positiva como negativa hasta alcanzar ±VBO (32V).',
      conduction: 'Región de resistencia dinámica negativa abrupta con caída de tensión a ±(VBO - ΔV).',
      reverseBlocking: 'Totalmente simétrico en ambos cuadrantes I y III.',
      keyPoints: [
        { label: '+V_BO (32V)', x: 360, y: 195, text: 'Disparo por avalancha positiva' },
        { label: '-V_BO (-32V)', x: 140, y: 305, text: 'Disparo por avalancha negativa' },
        { label: 'ΔV (Caída rápida)', x: 340, y: 145, text: 'Tensión de descarga capacitiva' },
        { label: '±I_BO', x: 280, y: 180, text: 'Corriente de inicio de conmutación' }
      ]
    },
    thermalSpecs: {
      typicalRthJC: 15.0,
      typicalRthCS: 5.0,
      maxTj: 125,
      vt0: 25.0,
      rd: 0.5
    }
  },
  {
    id: 'ujt',
    name: 'UJT',
    subtopic: '2.1.4 Transistor Unipolar de Juntura',
    fullName: 'Uni-Junction Transistor (UJT - ej. 2N2646)',
    symbol: 'B1 ──|── B2, Emisor inclinado (E)',
    summary: 'Dispositivo semiconductor de 3 terminales y una sola unión P-N con región de resistencia negativa, óptimo para osciladores de relajación y disparo sincronizado de tiristores.',
    structure: {
      layers: ['Barra de silicio tipo N de alta resistividad con una pequeña región tipo P formando el emisor.'],
      terminals: ['Base 1 (B1)', 'Base 2 (B2)', 'Emisor (E)'],
      description: 'Una barra de silicio dopado N con dos contactos óhmicos en sus extremos (B1 y B2) y una aleación de aluminio que crea una unión P-N intermedia asimétrica (Emisor).'
    },
    triggering: {
      methods: [
        'Disparo por tensión de emisor superior al voltaje de pico: V_E >= V_P = η*V_BB + V_D.'
      ],
      details: 'La relación intrínseca de separación η (eta, típicamente 0.55 a 0.82) determina la fracción de voltaje entre bases VBB que polariza la unión. Cuando el emisor supera VP, se inyectan huecos en la barra de silicio, provocando una caída drástica de resistencia entre E y B1 (resistencia negativa) y descargando el capacitor en B1.',
      criticalParams: [
        { name: 'Relación Intrínseca de Separación', symbol: 'η (eta)', typical: '0.55 - 0.82', desc: 'Rango de calibración interno: η = RB1 / (RB1 + RB2).' },
        { name: 'Voltaje de Pico', symbol: 'V_P', typical: '12V - 18V', desc: 'V_P = η * V_BB + V_D (con V_D ≈ 0.6V).' },
        { name: 'Resistencia Interbase', symbol: 'R_BB', typical: '4.7 kΩ - 9.1 kΩ', desc: 'Resistencia total entre B1 y B2 con emisor abierto.' },
        { name: 'Corriente de Pico', symbol: 'I_P', typical: '1 µA - 5 µA', desc: 'Máxima corriente de emisor requerida para iniciar el disparo.' },
        { name: 'Corriente de Valle', symbol: 'I_V', typical: '2 mA - 8 mA', desc: 'Mínima corriente de emisor que sustenta la resistencia negativa.' }
      ]
    },
    turnOff: {
      methods: [
        'La corriente de emisor cae por debajo de la corriente de valle IV.',
        'El capacitor de sincronización conectado a emisor se descarga completamente.'
      ],
      details: 'El UJT se apaga automáticamente cuando el condensador emisor se vacía a través de B1 y la corriente cae por debajo de IV, reiniciando un nuevo ciclo de carga RC.'
    },
    applications: [
      'Generador de pulsos de disparo y oscilador de relajación para SCR y TRIAC.',
      'Control de fase sincronizado con el cruce por cero mediante zener y puente de diodos.',
      'Temporizadores y generadores de señales en diente de sierra.',
      'Control de velocidad de motores de CD por modulación de disparo.'
    ],
    ivCurveDescription: {
      forwardBlocking: 'Región de corte: VE < VP. La corriente de emisor es solo una ínfima corriente inversa de fuga IE0.',
      conduction: 'Región de resistencia negativa (dV/dI < 0) donde el voltaje cae de VP a VV aumentando la corriente violentamente.',
      reverseBlocking: 'Región de saturación a la derecha del punto de valle (VE > VV).',
      keyPoints: [
        { label: 'Punto de Pico (VP, IP)', x: 180, y: 100, text: 'Inicio de la resistencia negativa' },
        { label: 'Punto de Valle (VV, IV)', x: 320, y: 280, text: 'Límite de la resistencia negativa' },
        { label: 'Zona Resistencia Negativa', x: 250, y: 190, text: 'dVE / dIE < 0 (Conmutación)' },
        { label: 'Saturación', x: 420, y: 220, text: 'Comportamiento cuasi-óhmico' }
      ]
    },
    thermalSpecs: {
      typicalRthJC: 25.0,
      typicalRthCS: 10.0,
      maxTj: 125,
      vt0: 0.7,
      rd: 15.0
    }
  },
  {
    id: 'ssr',
    name: 'SSR',
    subtopic: '2.4 Relevadores de Estado Sólido',
    fullName: 'Solid State Relay (SSR / Relevador de Estado Sólido)',
    symbol: 'Entrada CD [Optoacoplador] ──||── Salida CA [TRIAC/Back-to-Back SCRs]',
    summary: 'Dispositivo de conmutación totalmente electrónico sin piezas móviles que proporciona aislamiento galvánico de alta tensión (hasta 4000V) mediante optoacoplamiento.',
    structure: {
      layers: ['LED infrarrojo de entrada + Fotodetector con circuito detector de cruce por cero (Zero-Cross) + Tiristores de potencia de salida (SCRs en antiparalelo o TRIAC) + Red Snubber interna.'],
      terminals: ['Entrada Control (+/- 3-32 VCD)', 'Salida Carga (Terminal 1 y 2, 24-480 VCA)'],
      description: 'Módulo integrado encapsulado en resina epóxica con placa base metálica para montaje en disipador térmico. Aísla galvánicamente el circuito de control de microcontrolador o PLC de la red de potencia.'
    },
    triggering: {
      methods: [
        'Conmutación por Cruce por Cero (Zero-Crossing): Se activa únicamente cuando el voltaje de la red pasa por 0V, eliminando EMI y sobrecorrientes en cargas resistivas.',
        'Conmutación Instantánea (Random Turn-On): Se activa inmediatamente al recibir la señal de control, obligatorio para cargas de motor altamente inductivas.'
      ],
      details: 'El circuito detector de cruce por cero integrado inhibe el disparo de compuerta si el voltaje de la línea CA supera típicamente 15V - 20V en el momento de la señal de entrada, asegurando encendidos suaves y silenciosos.',
      criticalParams: [
        { name: 'Tensión de Aislamiento Entrada-Salida', symbol: 'V_ISO', typical: '2500V - 4000V RMS', desc: 'Aislamiento dieléctrico de seguridad galvánica.' },
        { name: 'Corriente de Carga Nominal', symbol: 'I_RMS', typical: '10A - 100A', desc: 'Capacidad de conmutación continua montado en disipador adecuado.' },
        { name: 'Caída de Tensión en Estado Activo', symbol: 'V_ON', typical: '1.2V - 1.6V', desc: 'Genera disipación de calor: P ≈ 1.2W a 1.6W por cada Ampere conducido.' },
        { name: 'Tensión de Control de Entrada', symbol: 'V_IN', typical: '3 - 32 VCD', desc: 'Rango compatible con TTL, CMOS, Arduino, ESP32 y PLC.' },
        { name: 'Tiempo de Desconexión', symbol: 't_off', typical: '1/2 ciclo (8.3ms a 60Hz)', desc: 'Apagado en el siguiente cruce por cero de la corriente.' }
      ]
    },
    turnOff: {
      methods: [
        'Cese de la corriente del LED de control y posterior cruce natural por cero de la corriente de carga (IA < IH).'
      ],
      details: 'Aunque la señal de control de 5V/24V se interrumpa de forma instantánea, el SSR no corta la corriente de salida hasta que la onda senoidal de la red llega a su cruce natural por cero.'
    },
    applications: [
      'Arranque, paro y conmutación de motores polifásicos y bombas industriales.',
      'Control de temperatura PID de alta precisión en autoclaves, extrusoras y hornos.',
      'Sustitución de contactores electromecánicos para eliminar chispas, rebotes y desgaste mecánico.',
      'Ambientes con riesgo de explosión (zonas químicas/petroleras) debido a la ausencia de arco eléctrico.'
    ],
    ivCurveDescription: {
      forwardBlocking: 'Bloqueo bidireccional de alta impedancia mientras el LED de entrada está apagado o la línea no está en cero.',
      conduction: 'Conducción bidireccional equivalente a dos SCR en antiparalelo con caída de 1.4V.',
      reverseBlocking: 'Idéntica a la directa gracias al arreglo antiparalelo.',
      keyPoints: [
        { label: 'V_DRM (600V-1200V)', x: 380, y: 195, text: 'Capacidad de bloqueo con LED apagado' },
        { label: 'V_ON ≈ 1.4V', x: 310, y: 80, text: 'Caída interna del tiristor de salida' },
        { label: 'Ventana Zero-Cross (±15V)', x: 260, y: 195, text: 'Habilitación de disparo cerca del origen' }
      ]
    },
    thermalSpecs: {
      typicalRthJC: 0.8,
      typicalRthCS: 0.3,
      maxTj: 125,
      vt0: 1.1,
      rd: 0.012
    }
  }
];

export const THERMAL_FORMULAS = [
  {
    title: 'Disipación de Potencia Promedio (Tiristor)',
    formula: 'P_{D} = V_{T0} \\cdot I_{avg} + r_{d} \\cdot I_{RMS}^2',
    approx: 'P_{D} \\approx 1.2\\text{V} \\cdot I_{RMS}',
    desc: 'La potencia generada en la juntura del semiconductor proviene de la tensión umbral (VT0) y la resistencia dinámica (rd) en estado de conducción.'
  },
  {
    title: 'Ecuación de Equilibrio Térmico (Temperatura de Juntura)',
    formula: 'T_j = T_a + P_D \\cdot (R_{th,j-c} + R_{th,c-s} + R_{th,s-a})',
    desc: 'Donde Ta es la temperatura ambiente (típicamente 25°C o 40°C en tablero), Rth,j-c es la resistencia juntura-cápsula, Rth,c-s de la grasa térmica, y Rth,s-a del disipador al ambiente.'
  },
  {
    title: 'Resistencia Térmica Máxima Requerida para el Disipador',
    formula: 'R_{th,s-a} \\le \\frac{T_{j,max} - T_a}{P_D} - (R_{th,j-c} + R_{th,c-s})',
    desc: 'Si el disipador seleccionado tiene un valor Rth superior a este límite, la temperatura de juntura superará 125°C, provocando destrucción irreversible por avalancha térmica.'
  }
];
