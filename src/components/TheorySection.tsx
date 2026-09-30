import React, { useState, useMemo } from 'react';
import { DEVICES, THERMAL_FORMULAS } from '../data/theoryData';
import { DeviceId } from '../types';
import { 
  Layers, 
  Flame, 
  Activity, 
  HelpCircle, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react';

export const TheorySection: React.FC = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>('scr');
  const [igLevel, setIgLevel] = useState<number>(1); // 0 = IG=0, 1 = IG1, 2 = IG2, 3 = IG3
  const [activeModelTab, setActiveModelTab] = useState<'layers' | 'transistor' | 'trigger'>('layers');
  
  // Thermal model states
  const [currentIrms, setCurrentIrms] = useState<number>(10); // Amperes
  const [ambientTemp, setAmbientTemp] = useState<number>(35); // °C
  const [heatsinkRth, setHeatsinkRth] = useState<number>(2.5); // °C/W

  const device = useMemo(() => {
    return DEVICES.find((d) => d.id === selectedDeviceId) || DEVICES[0];
  }, [selectedDeviceId]);

  // Real-time thermal calculations
  const thermalCalc = useMemo(() => {
    const { vt0, rd, typicalRthJC, typicalRthCS, maxTj } = device.thermalSpecs;
    // Approximating Iavg for phase control ~ 0.45 * Irms to 0.7 * Irms
    const iAvg = currentIrms * 0.636;
    const pLoss = (vt0 * iAvg) + (rd * Math.pow(currentIrms, 2));
    const rthTotal = typicalRthJC + typicalRthCS + heatsinkRth;
    const tj = ambientTemp + (pLoss * rthTotal);
    const maxSafeRth = (maxTj - ambientTemp) / (pLoss > 0.1 ? pLoss : 0.1) - (typicalRthJC + typicalRthCS);
    const maxSafeCurrent = Math.sqrt(Math.max(0, (maxTj - ambientTemp) / (rthTotal * (rd > 0 ? rd : 0.05))));

    return {
      pLoss: Math.max(0, pLoss),
      rthTotal,
      tj,
      maxTj,
      isOverheating: tj > maxTj,
      maxSafeRth: Math.max(0, maxSafeRth),
      maxSafeCurrent: Math.min(60, maxSafeCurrent)
    };
  }, [device, currentIrms, ambientTemp, heatsinkRth]);

  // Points for dynamic I-V Curve
  const ivPoints = useMemo(() => {
    // Generate I-V path based on device and igLevel
    const width = 540;
    const height = 340;
    const cx = width / 2;
    const cy = height / 2;

    return { width, height, cx, cy };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Device Selection Bar */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>DISPOSITIVOS SEMICONDUCTORES (UNIDAD II):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full sm:w-auto">
            {DEVICES.map((d) => {
              const isSelected = d.id === selectedDeviceId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  <span className="text-sm tracking-wide">{d.name}</span>
                  <span className="text-[10px] font-normal opacity-75 truncate max-w-[80px]">
                    {d.id.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Device Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {device.subtopic}
                </span>
                <span className="text-xs font-mono text-slate-400">Símbolo: {device.symbol}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{device.fullName}</h2>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl">{device.summary}</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Tj Máxima</div>
                <div className="text-base font-bold text-amber-400">{device.thermalSpecs.maxTj}°C</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Rth(j-c)</div>
                <div className="text-base font-bold text-indigo-400">{device.thermalSpecs.typicalRthJC} °C/W</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid: Interactive I-V Curve and Physical Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Interactive I-V Curve (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Curva Característica Dinámica I-V
                  </h3>
                </div>

                {/* IG variation slider for SCR & TRIAC */}
                {(device.id === 'scr' || device.id === 'triac') && (
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-slate-300 font-mono">Corriente Gate (IG):</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setIgLevel(lvl)}
                          className={`px-2 py-0.5 text-xs font-mono rounded ${
                            igLevel === lvl
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lvl === 0 ? '0' : `IG${lvl}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic SVG Curve */}
              <div className="relative bg-slate-950 border border-slate-800/80 rounded-lg p-2 overflow-hidden">
                <svg
                  viewBox="0 0 540 340"
                  className="w-full h-auto max-h-[340px] select-none font-mono text-[11px]"
                >
                  <defs>
                    {/* Grid Pattern */}
                    <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                    </pattern>
                    <linearGradient id="curveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>

                  {/* Grid background */}
                  <rect width="540" height="340" fill="url(#grid-pattern)" />

                  {/* Axes */}
                  <line x1="20" y1="170" x2="520" y2="170" stroke="#475569" strokeWidth="1.5" />
                  <line x1="270" y1="20" x2="270" y2="320" stroke="#475569" strokeWidth="1.5" />

                  {/* Axis arrows & Labels */}
                  <polygon points="522,170 514,166 514,174" fill="#94a3b8" />
                  <polygon points="270,18 266,26 274,26" fill="#94a3b8" />
                  <text x="475" y="162" fill="#94a3b8" fontWeight="bold">+V (Tensión)</text>
                  <text x="35" y="162" fill="#94a3b8">-V (Inverso)</text>
                  <text x="278" y="32" fill="#94a3b8" fontWeight="bold">+I (Corriente)</text>
                  <text x="278" y="315" fill="#94a3b8">-I (Inversa)</text>
                  <text x="255" y="185" fill="#64748b">0,0</text>

                  {/* Region Labels */}
                  <rect x="330" y="180" width="130" height="22" rx="4" fill="#0f172a" stroke="#334155" />
                  <text x="335" y="195" fill="#38bdf8" fontSize="10">Zona de Bloqueo Directo</text>

                  {/* Device Specific Dynamic Curve Rendering */}
                  {device.id === 'scr' && (
                    <g>
                      {/* Reverse blocking */}
                      <path
                        d="M 60,300 C 70,175 140,172 270,170"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                      />
                      {/* VRRM breakdown marker */}
                      <circle cx="70" cy="240" r="4" fill="#ef4444" />
                      <text x="30" y="235" fill="#fca5a5" fontSize="10">VRRM (Avalancha)</text>

                      {/* Forward blocking & trigger curves based on igLevel */}
                      {/* When IG is higher, VBO decreases */}
                      {igLevel === 0 && (
                        <g>
                          <path
                            d="M 270,170 L 460,170 Q 480,170 480,150 L 480,140 Q 480,120 310,110 L 310,40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />
                          <circle cx="480" cy="150" r="4" fill="#38bdf8" />
                          <text x="425" y="145" fill="#38bdf8" fontSize="10">VBO (IG = 0)</text>
                        </g>
                      )}

                      {igLevel === 1 && (
                        <g>
                          <path
                            d="M 270,170 L 410,170 Q 425,170 425,150 Q 425,120 308,110 L 308,40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />
                          <circle cx="425" cy="150" r="4" fill="#818cf8" />
                          <text x="375" y="145" fill="#818cf8" fontSize="10">Disparo IG1</text>
                        </g>
                      )}

                      {igLevel === 2 && (
                        <g>
                          <path
                            d="M 270,170 L 350,170 Q 365,170 365,145 Q 365,115 306,105 L 306,40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                          />
                          <circle cx="365" cy="145" r="4" fill="#a855f7" />
                          <text x="325" y="140" fill="#a855f7" fontSize="10">Disparo IG2</text>
                        </g>
                      )}

                      {igLevel === 3 && (
                        <g>
                          <path
                            d="M 270,170 L 304,170 Q 306,160 306,100 L 306,40"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                          />
                          <text x="312" y="135" fill="#34d399" fontSize="10">Conducción Diodo (IG3)</text>
                        </g>
                      )}

                      {/* Holding Current IH & Latching Current IL indicators */}
                      <line x1="290" y1="120" x2="330" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
                      <text x="335" y="123" fill="#f59e0b" fontSize="10">IL (Enclavamiento)</text>

                      <line x1="290" y1="140" x2="330" y2="140" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,2" />
                      <text x="335" y="143" fill="#eab308" fontSize="10">IH (Mantenimiento)</text>

                      {/* On-state voltage VT */}
                      <text x="290" y="35" fill="#10b981" fontWeight="bold">VT ≈ 1.2V - 1.6V</text>
                    </g>
                  )}

                  {device.id === 'triac' && (
                    <g>
                      {/* Quadrant I */}
                      <path
                        d={igLevel === 0 ? "M 270,170 L 460,170 Q 480,165 480,145 Q 480,120 310,110 L 310,40" : "M 270,170 L 360,170 Q 375,155 375,130 Q 375,115 310,105 L 310,40"}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      {/* Quadrant III (Symmetrical conduction) */}
                      <path
                        d={igLevel === 0 ? "M 270,170 L 80,170 Q 60,175 60,195 Q 60,220 230,230 L 230,300" : "M 270,170 L 180,170 Q 165,185 165,210 Q 165,225 230,235 L 230,300"}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      <text x="380" y="70" fill="#38bdf8" fontSize="11">Cuadrante I [MT2+, G+]</text>
                      <text x="60" y="270" fill="#38bdf8" fontSize="11">Cuadrante III [MT2-, G-]</text>
                      <circle cx="310" cy="115" r="3" fill="#f59e0b" />
                      <circle cx="230" cy="225" r="3" fill="#f59e0b" />
                      <text x="318" y="118" fill="#f59e0b" fontSize="10">+IH</text>
                      <text x="195" y="228" fill="#f59e0b" fontSize="10">-IH</text>
                    </g>
                  )}

                  {device.id === 'diac' && (
                    <g>
                      {/* Symmetrical breakover at ±32V */}
                      {/* Positive Quad I */}
                      <path
                        d="M 270,170 L 430,170 Q 440,170 440,150 Q 440,130 380,110 L 400,45"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      {/* Negative Quad III */}
                      <path
                        d="M 270,170 L 110,170 Q 100,170 100,190 Q 100,210 160,230 L 140,295"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                      {/* Key Markers */}
                      <circle cx="440" cy="150" r="4" fill="#ef4444" />
                      <text x="415" y="140" fill="#ef4444" fontWeight="bold">+VBO (+32V)</text>
                      <circle cx="100" cy="190" r="4" fill="#ef4444" />
                      <text x="35" y="205" fill="#ef4444" fontWeight="bold">-VBO (-32V)</text>
                      {/* Negative resistance line */}
                      <text x="330" y="90" fill="#f59e0b" fontSize="10">ΔV dinámica (5V-10V)</text>
                    </g>
                  )}

                  {device.id === 'ujt' && (
                    <g>
                      {/* UJT Curve (VE vs IE) */}
                      {/* Cutoff zone */}
                      <path
                        d="M 270,170 L 290,170 L 320,60"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                      {/* Peak point to valley point (Negative resistance) */}
                      <path
                        d="M 320,60 C 340,120 370,220 400,230"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      {/* Saturation */}
                      <path
                        d="M 400,230 L 480,190"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                      {/* Points */}
                      <circle cx="320" cy="60" r="5" fill="#ef4444" />
                      <text x="310" y="45" fill="#f87171" fontWeight="bold">Punto Pico (VP, IP)</text>

                      <circle cx="400" cy="230" r="5" fill="#38bdf8" />
                      <text x="410" y="240" fill="#38bdf8" fontWeight="bold">Punto Valle (VV, IV)</text>

                      {/* Negative resistance highlight */}
                      <rect x="330" y="130" width="130" height="20" rx="4" fill="#1e1b4b" stroke="#6366f1" />
                      <text x="335" y="144" fill="#a5b4fc" fontSize="10">Resistencia Negativa (dV/dI &lt; 0)</text>
                    </g>
                  )}

                  {device.id === 'ssr' && (
                    <g>
                      {/* SSR Zero-crossing window and conduction */}
                      <rect x="255" y="150" width="30" height="40" fill="#10b981" opacity="0.15" stroke="#10b981" strokeDasharray="2,2" />
                      <text x="230" y="140" fill="#34d399" fontSize="10">Ventana Zero-Cross (±15V)</text>

                      {/* Output Triac/SCR curve */}
                      <path
                        d="M 270,170 L 450,170 L 450,130 L 310,120 L 310,40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                      />
                      <path
                        d="M 270,170 L 90,170 L 90,210 L 230,220 L 230,300"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                      />
                      <text x="320" y="60" fill="#818cf8" fontSize="11">Conducción con Control ON</text>
                      <text x="70" y="155" fill="#94a3b8" fontSize="10">Bloqueo con Control OFF</text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Explanatory notes below curve */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Zona de Bloqueo:</span>
                  <p className="text-slate-400 text-[11px]">{device.ivCurveDescription.forwardBlocking}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-1">Zona de Conducción:</span>
                  <p className="text-slate-400 text-[11px]">{device.ivCurveDescription.conduction}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-amber-400 block mb-1">Puntos Críticos:</span>
                  <ul className="text-slate-400 text-[11px] space-y-0.5">
                    {device.ivCurveDescription.keyPoints.slice(0, 2).map((kp, idx) => (
                      <li key={idx}>• <strong className="text-slate-200">{kp.label}:</strong> {kp.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Structure, Transistor Analogy & Triggering (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              {/* Internal Tab Selector */}
              <div className="flex rounded-lg bg-slate-900 p-1 mb-4 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveModelTab('layers')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                    activeModelTab === 'layers'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Capas PNPN
                </button>
                <button
                  onClick={() => setActiveModelTab('transistor')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                    activeModelTab === 'transistor'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Modelo 2 Transistores
                </button>
                <button
                  onClick={() => setActiveModelTab('trigger')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                    activeModelTab === 'trigger'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Disparo y Parámetros
                </button>
              </div>

              {/* Tab Content: Physical Layers */}
              {activeModelTab === 'layers' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300">
                    <p className="mb-2">{device.structure.description}</p>
                  </div>

                  {/* Visual Diagram of Layers */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Ánodo / MT1</span>
                      <span className="text-emerald-400 font-bold">Uniones J1, J2, J3</span>
                      <span>Cátodo / MT2</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center font-bold text-xs py-2">
                      <div className="bg-rose-900/40 border border-rose-500/40 text-rose-300 py-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm">P1</span>
                        <span className="text-[10px] font-normal text-slate-300">Huecos (+)</span>
                      </div>
                      <div className="bg-sky-900/40 border border-sky-500/40 text-sky-300 py-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm">N1</span>
                        <span className="text-[10px] font-normal text-slate-300">e⁻ Libres</span>
                      </div>
                      <div className="bg-rose-900/40 border border-rose-500/40 text-rose-300 py-4 rounded-lg flex flex-col items-center justify-center relative">
                        <span className="text-sm">P2</span>
                        <span className="text-[10px] font-normal text-slate-300">Base Gate</span>
                        <div className="absolute -bottom-2.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                          GATE (G)
                        </div>
                      </div>
                      <div className="bg-sky-900/40 border border-sky-500/40 text-sky-300 py-4 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-sm">N2</span>
                        <span className="text-[10px] font-normal text-slate-300">Cátodo (K)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 pt-1 font-mono">
                      <span>J1 (Directa)</span>
                      <span className="text-amber-400 font-semibold">J2 (Bloqueo Inverso)</span>
                      <span>J3 (Directa)</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      En estado de bloqueo directo, la unión central <strong>J2</strong> soporta prácticamente toda la tensión de línea hasta que se inyecta corriente en la compuerta.
                    </span>
                  </div>
                </div>
              )}

              {/* Tab Content: Two Transistor Analogy */}
              {activeModelTab === 'transistor' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300">
                    <p className="mb-2">
                      El SCR se modela matemáticamente como un par PNP (Q1) y NPN (Q2) en retroalimentación positiva regenerativa.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between text-indigo-300 font-bold border-b border-slate-800 pb-1">
                      <span>Ecuación de Corriente de Ánodo:</span>
                      <span className="text-[11px] text-slate-400">α = Ganancia</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded text-center text-emerald-400 font-bold text-sm">
                      IA = (α2 · IG + ICBO1 + ICBO2) / [1 - (α1 + α2)]
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Cuando la corriente de compuerta <strong>IG</strong> eleva las corrientes de emisor, las ganancias de corriente en base común crecen rápidamente hasta que:
                    </p>
                    <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-center text-amber-300 font-bold text-xs">
                      Condición de Conmutación: (α1 + α2) → 1
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      El denominador se anula y la corriente de ánodo tiende a infinito, limitada únicamente por la impedancia de la carga externa.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab Content: Triggering & Turn-off */}
              {activeModelTab === 'trigger' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Parámetros Críticos de Hoja de Datos:
                    </span>
                    <div className="space-y-1.5">
                      {device.triggering.criticalParams.map((param, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex justify-between items-center font-mono">
                            <span className="font-bold text-slate-200">{param.name} ({param.symbol})</span>
                            <span className="text-emerald-400 font-semibold">{param.typical}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{param.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Practical Applications Box */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Aplicaciones Industriales Típicas:
              </span>
              <ul className="space-y-1 text-slate-300">
                {device.applications.map((app, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-sm leading-none">•</span>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: THERMAL DISSIPATION AND HEATSINK EFFICIENCY MODEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Modelo de Disipación Térmica y Eficiencia del Disipador
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tj = Ta + PD · ΣRth
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Curva de calentamiento de la juntura (Tj) en función de la corriente de carga y la resistencia térmica del disipador de aluminio.
              </p>
            </div>
          </div>

          {/* Overheating status badge */}
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-bold text-xs ${
            thermalCalc.isOverheating
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
              : thermalCalc.tj > 100
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <div>
              <div>Estado Térmico: {thermalCalc.isOverheating ? 'SOBRECALENTAMIENTO CRÍTICO (>125°C)' : thermalCalc.tj > 100 ? 'PRECAUCIÓN (Zona Límite)' : 'SEGURO Y ESTABLE'}</div>
              <div className="text-[10px] font-normal opacity-80">Tj calculada: {thermalCalc.tj.toFixed(1)} °C / Límite: 125 °C</div>
            </div>
          </div>
        </div>

        {/* Sliders and Dynamic Thermal Response */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders (4 cols) */}
          <div className="lg:col-span-4 space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Parámetros Térmicos de Operación
            </h4>

            {/* Slider 1: IRMS */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Corriente Eficaz (I_RMS):</span>
                <span className="font-mono font-bold text-indigo-400">{currentIrms} A</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={currentIrms}
                onChange={(e) => setCurrentIrms(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 A</span>
                <span>Carga Nominal</span>
                <span>35 A</span>
              </div>
            </div>

            {/* Slider 2: Heatsink Rth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Rth Disipador-Ambiente (Rth,s-a):</span>
                <span className="font-mono font-bold text-amber-400">{heatsinkRth} °C/W</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={heatsinkRth}
                onChange={(e) => setHeatsinkRth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5 °C/W (Grande/Forzado)</span>
                <span>8.0 °C/W (Pequeño)</span>
              </div>
            </div>

            {/* Slider 3: Ta */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Temperatura Ambiente Tablero (Ta):</span>
                <span className="font-mono font-bold text-rose-400">{ambientTemp} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                step="1"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>15 °C (Climatizado)</span>
                <span>65 °C (Industrial caliente)</span>
              </div>
            </div>

            {/* Thermal specs of device */}
            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Rth(j-c) Juntura-Carcasa:</span>
                <span className="text-indigo-300">{device.thermalSpecs.typicalRthJC} °C/W</span>
              </div>
              <div className="flex justify-between">
                <span>Rth(c-s) Grasa Silicona:</span>
                <span className="text-indigo-300">{device.thermalSpecs.typicalRthCS} °C/W</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-amber-300">
                <span>Rth Total (ΣRth):</span>
                <span>{thermalCalc.rthTotal.toFixed(2)} °C/W</span>
              </div>
              <div className="flex justify-between">
                <span>Potencia Disipada (PD):</span>
                <span className="text-emerald-400 font-bold">{thermalCalc.pLoss.toFixed(2)} W</span>
              </div>
            </div>
          </div>

          {/* SVG Thermal Graph: Tj vs Load Current (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Gráfica Dinámica: Temperatura de Juntura (Tj) vs. Corriente (I_RMS)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Punto Actual: <strong className="text-amber-400">{currentIrms}A ➔ {thermalCalc.tj.toFixed(1)}°C</strong>
              </span>
            </div>

            {/* SVG Chart */}
            <div className="relative bg-slate-950 border border-slate-800/80 rounded-lg p-2 overflow-hidden">
              <svg viewBox="0 0 540 240" className="w-full h-auto max-h-[240px] select-none font-mono text-[10px]">
                {/* Horizontal Danger Limit Line at Tj = 125°C */}
                {/* Height: 240, scale: 0°C at y=210, 150°C at y=30 => 1°C = 1.2px */}
                {/* y = 210 - (T * 1.2) */}
                {/* 125°C => 210 - (125 * 1.2) = 210 - 150 = 60 */}
                <rect x="50" y="30" width="460" height="30" fill="#ef4444" opacity="0.12" />
                <line x1="50" y1="60" x2="510" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,3" />
                <text x="360" y="54" fill="#f87171" fontWeight="bold">LÍMITE MÁXIMO SILICIO (125°C)</text>

                {/* Axes */}
                <line x1="50" y1="210" x2="510" y2="210" stroke="#475569" strokeWidth="1.5" />
                <line x1="50" y1="30" x2="50" y2="210" stroke="#475569" strokeWidth="1.5" />

                {/* Y Axis ticks */}
                {[25, 50, 75, 100, 125, 150].map((t) => {
                  const y = 210 - (t * 1.2);
                  return (
                    <g key={t}>
                      <line x1="45" y1={y} x2="50" y2={y} stroke="#64748b" />
                      <text x="18" y={y + 3} fill="#94a3b8">{t}°C</text>
                    </g>
                  );
                })}

                {/* X Axis ticks: 0A to 35A. scale: 50 + (I * 13) */}
                {[0, 5, 10, 15, 20, 25, 30, 35].map((curr) => {
                  const x = 50 + (curr * 13);
                  return (
                    <g key={curr}>
                      <line x1={x} y1="210" x2={x} y2="215" stroke="#64748b" />
                      <text x={x - 6} y="228" fill="#94a3b8">{curr}A</text>
                    </g>
                  );
                })}

                {/* Dynamic Curve of Tj vs Current */}
                {/* Generate path from I=0 to I=35 */}
                {(() => {
                  const points: string[] = [];
                  for (let i = 0; i <= 35; i += 1) {
                    const iAvg_i = i * 0.636;
                    const p_i = (device.thermalSpecs.vt0 * iAvg_i) + (device.thermalSpecs.rd * i * i);
                    const tj_i = ambientTemp + (p_i * thermalCalc.rthTotal);
                    const x = 50 + (i * 13);
                    const y = Math.max(20, Math.min(210, 210 - (tj_i * 1.2)));
                    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`);
                  }
                  return (
                    <path
                      d={points.join(' ')}
                      fill="none"
                      stroke={thermalCalc.isOverheating ? '#f43f5e' : '#38bdf8'}
                      strokeWidth="3"
                    />
                  );
                })()}

                {/* Operating Point Marker */}
                {(() => {
                  const curX = 50 + (currentIrms * 13);
                  const curY = Math.max(20, Math.min(210, 210 - (thermalCalc.tj * 1.2)));
                  return (
                    <g>
                      <line x1={curX} y1="30" x2={curX} y2="210" stroke="#a855f7" strokeWidth="1" strokeDasharray="3,3" />
                      <circle cx={curX} cy={curY} r="6" fill={thermalCalc.isOverheating ? '#ef4444' : '#10b981'} stroke="#ffffff" strokeWidth="2" />
                      <text x={curX + 8} y={curY - 8} fill="#ffffff" fontWeight="bold" fontSize="11">
                        {thermalCalc.tj.toFixed(1)}°C
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block">Disipación de Potencia:</span>
                  <div className="text-slate-200 font-mono font-medium">
                    PD = (VT0 · Iavg) + (rd · IRMS²) = ({device.thermalSpecs.vt0}V · {(currentIrms * 0.636).toFixed(1)}A) + ({device.thermalSpecs.rd}Ω · {currentIrms}²) = <strong className="text-emerald-400">{thermalCalc.pLoss.toFixed(2)} W</strong>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[11px] block">Rth Máxima Permisible para el Disipador:</span>
                  <div className="text-slate-200 font-mono font-medium">
                    Rth(s-a) ≤ [(125°C - {ambientTemp}°C) / {thermalCalc.pLoss.toFixed(1)}W] - {device.thermalSpecs.typicalRthJC + device.thermalSpecs.typicalRthCS} = <strong className={thermalCalc.maxSafeRth < heatsinkRth ? 'text-rose-400' : 'text-emerald-400'}>{thermalCalc.maxSafeRth.toFixed(2)} °C/W</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
