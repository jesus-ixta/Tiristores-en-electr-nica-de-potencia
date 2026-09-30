import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { 
  MessageSquareText, 
  Send, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  User, 
  Bot,
  RotateCcw
} from 'lucide-react';

export const SocraticTutorSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: '¡Saludos cordiales! Soy tu Tutor Socrático para la Unidad II: Tiristores de Circuitos Electrónicos de Potencia (FED-2302) del TecNM / Instituto Tecnológico Superior de Comalcalco.\n\nMi propósito pedagógico no es darte la respuesta servida en bandeja, sino guiarte paso a paso a través de la reflexión analítica, las leyes físicas y las ecuaciones de potencia para que tú mismo deduzcas la solución técnica.\n\n¿Qué fenómeno o circuito te gustaría analizar hoy?',
      timestamp: 'Ahora',
      socraticHint: 'Puedes formular una pregunta abierta sobre el SCR, TRIAC, DIAC, UJT, disipadores térmicos o control de motores.'
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Pre-programmed Socratic guided prompts
  const quickPrompts = [
    {
      label: '¿Por qué mi SCR se apaga al retirar el pulso de Gate?',
      query: '¿Por qué cuando pruebo un SCR en el simulador o laboratorio, se apaga inmediatamente después de retirar el pulso de compuerta?'
    },
    {
      label: '¿Cómo calculo el disipador térmico para que no se queme?',
      query: '¿Cómo calculo exactamente la resistencia térmica del disipador (Rth,s-a) para evitar que la juntura del tiristor sobrepase los 125°C?'
    },
    {
      label: '¿Por qué se usa un DIAC con el TRIAC?',
      query: '¿Cuál es la razón técnica por la que siempre colocamos un DIAC en serie con la compuerta del TRIAC en los controles de fase?'
    },
    {
      label: '¿Diferencia entre IL e IH?',
      query: '¿Cuál es la diferencia práctica entre la corriente de enclavamiento (Latching IL) y la de mantenimiento (Holding IH)?'
    },
    {
      label: '¿SSR Zero-Crossing vs Random en motores?',
      query: '¿Por qué no se debe usar un SSR con conmutación en cruce por cero (Zero-Crossing) en motores fuertemente inductivos?'
    }
  ];

  // Socratic Response Engine for Power Electronics Unit II
  const generateSocraticResponse = (query: string): { response: string; hint: string } => {
    const q = query.toLowerCase();

    if (q.includes('se apaga') || q.includes('retirar') || q.includes('gate') || q.includes('enclavamiento') || q.includes('il')) {
      return {
        response: `Excelente observación experimental. Analicemos juntos qué ocurre en el silicio:\n\n1. Cuando aplicas el pulso de compuerta ($I_G$), inyectas portadores y activas la retroalimentación regenerativa $(\\alpha_1 + \\alpha_2 \\to 1)$.\n2. Para que esa retroalimentación se autosostenga sin necesidad de seguir suministrando $I_G$, ¿qué nivel mínimo de corriente principal de ánodo debe circular por el circuito externo?\n\n💡 **Pregunta para reflexionar:** En la hoja de datos del SCR, compara el parámetro **$I_L$ (Latching Current)** con la corriente que actualmente demanda tu carga. Si la carga es muy pequeña (alta resistencia) o puramente inductiva (la corriente tarda en crecer según $L/R$), ¿habrá alcanzado la corriente el valor $I_L$ antes de que el pulso de compuerta desaparezca?`,
        hint: 'Verifica la relación: I_ánodo(t_pulso) ≥ I_L. Si la carga es inductiva, el pulso de compuerta debe durar más tiempo o incluir una resistencia en paralelo de carga mínima.'
      };
    }

    if (q.includes('disipador') || q.includes('temperatura') || q.includes('125') || q.includes('rth') || q.includes('calor')) {
      return {
        response: `Abordemos el diseño térmico con rigor de ingeniería:\n\nRecuerda el circuito equivalente térmico análogo a la Ley de Ohm, donde la diferencia de temperatura $(\\Delta T = T_j - T_a)$ equivale al voltaje, la potencia disipada ($P_D$) a la corriente, y las resistencias térmicas en serie ($R_{th}$) a las resistencias eléctricas.\n\nEcuación rectora:\n$$T_j = T_a + P_D \\cdot (R_{th,j-c} + R_{th,c-s} + R_{th,s-a})$$\n\n💡 **Desafío guiado:**\n1. Si conoces la corriente eficaz $I_{RMS}$ y el voltaje de conducción $V_T \\approx 1.2\\text{V}$, ¿cuánta potencia promedio $P_D$ se convierte en calor en el silicio?\n2. Despeja $R_{th,s-a}$ fijando como límite estricto $T_j \\le 125^\\circ\\text{C}$ con tu temperatura ambiente $T_a$. ¿Qué ocurre físicamente si compras un disipador con un $R_{th}$ mayor al valor despejado?`,
        hint: 'Fórmula de despeje: Rth(s-a) ≤ [(Tj,max - Ta) / PD] - (Rth,j-c + Rth,c-s). Recuerda que un disipador más grande tiene MENOR valor de Rth.'
      };
    }

    if (q.includes('diac') || q.includes('db3') || q.includes('simetr') || q.includes('disparar directo')) {
      return {
        response: `Una interrogante clásica de laboratorio. Supón por un momento que eliminamos el DIAC y conectamos el capacitor de la red RC directamente a la compuerta del TRIAC a través de una resistencia:\n\n1. ¿Cómo es la pendiente de crecimiento del voltaje en un capacitor que se carga lentamente mediante una resistencia alta?\n2. Si la corriente de compuerta entra de forma lenta y titubeante, ¿el TRIAC encenderá de manera limpia e instantánea en todas sus áreas de unión, o habrá puntos calientes locales (*current crowding*) que puedan degradar la juntura?\n3. Además, ¿qué pasará entre el semiciclo positivo y el negativo si no hay un umbral de ruptura simétrico ($V_{BO} = \\pm 32\\text{V}$)?\n\n💡 **Pista socrática:** El DIAC no conduce hasta alcanzar $\\pm 32\\text{V}$, y en ese instante entra en *resistencia negativa*, liberando una descarga capacitiva abrupta con altísimo $di/dt$. ¿Por qué crees que la compuerta agradece un pulso de 'golpe' en lugar de una rampa lenta?`,
        hint: 'El DIAC garantiza encendido simétrico en ambos semiciclos (evitando componente de CD en el motor) y provee un pulso de disparo con tiempo de subida de nanosegundos.'
      };
    }

    if (q.includes('diferencia') && (q.includes('ih') || q.includes('il') || q.includes('mantenimiento'))) {
      return {
        response: `Muy bien. Ambas son corrientes de umbral del ánodo, pero operan en momentos temporales y dinámicos completamente opuestos del ciclo de vida del tiristor:\n\nImagina que estás encendiendo un automóvil empujándolo:\n• ¿Necesitas más fuerza para vencer la inercia inicial y hacer que el motor arranque, o para mantenerlo rodando una vez que ya está en marcha?\n\n💡 **Trasládalo al tiristor:**\n1. Una de ellas ($I_L$) actúa durante el proceso de **encendido/cebado**, justo cuando estás retirando la señal de compuerta.\n2. La otra ($I_H$) actúa durante el proceso de **apagado/bloqueo**, cuando la corriente principal desciende gradualmente hacia cero.\n\n¿Cuál de las dos crees que debe ser numéricamente mayor según la física de portadores del semiconductor?`,
        hint: 'Siempre IL > IH (típicamente IL es de 2 a 3 veces mayor que IH). IL se relaciona con el enclavamiento inicial; IH con el mantenimiento de la conducción.'
      };
    }

    if (q.includes('ssr') || q.includes('cruce por cero') || q.includes('zero') || q.includes('inductiv')) {
      return {
        response: `¡Excelente inquietud sobre relevadores de estado sólido!\n\nAnalicemos la ley de Faraday aplicada al circuito magnético de los devanados del motor:\n$$v(t) = L \\cdot \\frac{di}{dt} \\implies \\phi(t) = \\frac{1}{N} \\int v(t) \\, dt$$\n\n1. Si conectas la tensión en el **cruce por cero** ($v(t) = V_m \\sin(\\omega t)$ cuando $\\omega t = 0$), ¿cuánto vale la integral del seno durante todo el primer semiciclo positivo?\n2. Esa integral produce un flujo magnético que asciende al doble del flujo de régimen continuo ($2\\Phi_{max}$).\n\n💡 **Reflexión técnica:** ¿Qué le sucede al núcleo de hierro del motor si le exiges el doble de su flujo de saturación magnética? ¿Por qué la corriente de inserción (*inrush*) se dispara hasta 15 o 20 veces la nominal, haciendo saltar las protecciones?`,
        hint: 'Para motores fuertemente inductivos se recomienda un SSR de disparo instantáneo (Random Turn-On), que conmute cerca del pico de tensión donde la corriente inductiva naturalmente inicia en cero.'
      };
    }

    // Default Socratic answer generator
    return {
      response: `Es una excelente pregunta de ingeniería sobre la Unidad II. Descompongamos el fenómeno en sus variables fundamentales:\n\n1. **Identifica los terminales y polarizaciones:** ¿Qué estado guardan las uniones internas J1, J2 y J3 bajo las condiciones que describes?\n2. **Revisa la ecuación de malla:** ¿Qué variable de control (tensión de compuerta $V_G$, constante de tiempo $RC$, o tasa $dv/dt$) tiene el dominio del disparo en este instante?\n3. **Verifica la carga del motor:** ¿La impedancia es puramente resistiva o presenta una componente inductiva ($L \\cdot di/dt$) que altere el desfase angular?\n\n¿Hacia cuál de estos tres factores crees que apunta la causa principal en tu caso de estudio?`,
      hint: 'Revisa las pestañas de "Teoría y Curvas I-V" y experimenta con los sliders en el "Simulador de Circuitos" para contrastar tu hipótesis.'
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: text,
      timestamp: 'Ahora'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const { response, hint } = generateSocraticResponse(text);
      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response,
        timestamp: 'Ahora',
        socraticHint: hint
      };
      setMessages((prev) => [...prev, tutorMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'tutor',
        text: '¡Conversación reiniciada! ¿Qué nuevo reto conceptual o de cálculo de la Unidad II deseas explorar?',
        timestamp: 'Ahora',
        socraticHint: 'Prueba consultar sobre cuadrantes del TRIAC, oscilador UJT, snubbers o fórmulas de disipación.'
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pedagogía Socrática Activa
              </span>
              <span className="text-xs text-slate-400">Prof. Ixta - ITSC</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Tutor Socrático Inteligente: Unidad II Tiristores
            </h2>
            <p className="text-xs text-slate-300">
              Guía dialogada basada en preguntas inductivas, deducción de fórmulas y análisis de fallas en circuitos.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar Diálogo</span>
        </button>
      </div>

      {/* Recommended Quick Question Chips */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Consultas Frecuentes de Examen y Laboratorio:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 min-h-[420px] max-h-[580px] overflow-y-auto">
        {messages.map((m) => {
          const isTutor = m.sender === 'tutor';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
            >
              {isTutor && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isTutor
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] opacity-75 font-mono mb-1">
                  <span className="font-bold">{isTutor ? 'Prof. Ixta (Tutor Socrático)' : 'Estudiante'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-line text-xs sm:text-sm font-sans">
                  {m.text}
                </div>

                {/* Socratic Hint Callout */}
                {m.socraticHint && (
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[11px] uppercase tracking-wide text-amber-300">
                        Pista Conceptual para Indagar:
                      </span>
                      <span>{m.socraticHint}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isTutor && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic animate-pulse">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>El Profesor Ixta está estructurando una pregunta reflexiva...</span>
          </div>
        )}
      </div>

      {/* Input Message Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Plantea tu duda técnica o describe el comportamiento de tu circuito..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Consultar</span>
        </button>
      </form>
    </div>
  );
};
