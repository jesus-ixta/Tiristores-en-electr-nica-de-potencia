import React, { useState, useMemo, useEffect } from 'react';
import { CircuitId, SimulationResults } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  Activity, 
  Zap, 
  Flame, 
  Gauge, 
  ShieldAlert, 
  Info,
  Waves
} from 'lucide-react';

export const SimulatorSection: React.FC = () => {
  // Circuit preset selector
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitId>('triac_diac_ac');

  // Interactive controls
  const [r1, setR1] = useState<number>(47); // kOhm (potentiometer / timing resistor)
  const [c1, setC1] = useState<number>(0.1); // uF (timing capacitor)
  const [rGate, setRGate] = useState<number>(220); // Ohm (gate limiting resistor)
  const [rLoad, setRLoad] = useState<number>(15); // Ohm (motor armature/winding impedance)
  const [vInRms, setVInRms] = useState<number>(127); // VRMS (60 Hz standard TecNM)
  const [heatsinkRth, setHeatsinkRth] = useState<number>(3.0); // °C/W
  const [motorTorque, setMotorTorque] = useState<number>(1.5); // N.m (mechanical mechanical load)

  // Oscilloscope controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showVin, setShowVin] = useState<boolean>(true);
  const [showVload, setShowVload] = useState<boolean>(true);
  const [showIload, setShowIload] = useState<boolean>(true);
  const [showVgate, setShowVgate] = useState<boolean>(true);
  const [timeDiv, setTimeDiv] = useState<number>(2); // ms per division
  const [simTime, setSimTime] = useState<number>(0);

  // Animation frame loop for oscilloscope phase sweep
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        setSimTime((prev) => (prev + 0.5) % 100);
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Update preset defaults on circuit change
  const handleCircuitChange = (id: CircuitId) => {
    setSelectedCircuit(id);
    if (id === 'triac_diac_ac') {
      setR1(68);
      setC1(0.1);
      setRGate(150);
      setRLoad(18);
      setVInRms(127);
    } else if (id === 'scr_rectifier_dc') {
      setR1(47);
      setC1(0.22);
      setRGate(220);
      setRLoad(12);
      setVInRms(127);
    } else if (id === 'ssr_polyphase') {
      setR1(10);
      setC1(0.01);
      setRGate(470);
      setRLoad(8);
      setVInRms(220);
    } else if (id === 'ujt_trigger') {
      setR1(50);
      setC1(0.47);
      setRGate(100);
      setRLoad(20);
      setVInRms(127);
    }
  };

  // Physical & Mathematical Simulation Engine
  const sim = useMemo<SimulationResults>(() => {
    const freq = 60; // Hz
    const periodMs = 1000 / freq; // ~16.67 ms
    const vPeak = vInRms * Math.SQRT2;

    // Firing angle alpha calculation based on RC delay network:
    // tau = R1 * C1. At 60 Hz, half period = 8.33 ms = 180 degrees
    // alpha radians approx: arctan(omega * R * C) or based on charging to DIAC threshold V_BO (32V)
    const tau = (r1 * 1000) * (c1 * 1e-6); // in seconds
    const omega = 2 * Math.PI * freq;
    
    // Normalized alpha in degrees (clamped between 15° and 165°)
    let alphaDeg = 30;
    if (selectedCircuit === 'ssr_polyphase') {
      // Zero-crossing SSR has near 0 delay or fixed synchronized conduction
      alphaDeg = 5;
    } else if (selectedCircuit === 'ujt_trigger') {
      // UJT relaxation period: T = R * C * ln(1 / (1 - eta)), with eta ~ 0.65 => ln(1/0.35) = 1.05
      const periodUjt = tau * 1.05; // seconds
      const halfPeriod = 1 / (2 * freq);
      const phaseFraction = Math.min(0.95, periodUjt / halfPeriod);
      alphaDeg = Math.max(15, Math.min(170, phaseFraction * 180));
    } else {
      // TRIAC with DIAC or SCR: Time to charge C1 to DIAC breakdown (32V)
      // Vc(t) approx Vpeak * (1 / sqrt(1 + (w*R*C)^2)) * sin(wt - phi)
      const rcPhaseDeg = (Math.atan(omega * tau) * 180) / Math.PI;
      const vRatio = 32 / Math.max(40, vPeak);
      const chargeAngleDeg = Math.asin(Math.min(0.95, vRatio)) * (180 / Math.PI);
      alphaDeg = Math.max(18, Math.min(168, chargeAngleDeg + (rcPhaseDeg * 1.6)));
    }

    const alphaRad = (alphaDeg * Math.PI) / 180;

    // Load Voltages:
    let vRmsLoad = 0;
    let vAvgLoad = 0;

    if (selectedCircuit === 'triac_diac_ac') {
      // Full AC phase control:
      // Vrms = Vrms_in * sqrt( (1 / pi) * (pi - alpha + sin(2*alpha)/2) )
      const integralTerm = Math.max(0, (Math.PI - alphaRad + (Math.sin(2 * alphaRad) / 2)) / Math.PI);
      vRmsLoad = vInRms * Math.sqrt(integralTerm);
      vAvgLoad = 0; // Symmetrical AC has zero DC component
    } else if (selectedCircuit === 'scr_rectifier_dc') {
      // Single-phase half-wave controlled rectifier with inductive DC motor load & freewheeling diode:
      // Vavg = (Vpeak / (2 * pi)) * (1 + cos(alpha))
      vAvgLoad = (vPeak / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
      vRmsLoad = (vPeak / 2) * Math.sqrt(Math.max(0, (Math.PI - alphaRad + (Math.sin(2 * alphaRad) / 2)) / Math.PI));
    } else if (selectedCircuit === 'ssr_polyphase') {
      // Polyphase AC line connected via zero-crossing SSR
      vRmsLoad = vInRms * 0.98;
      vAvgLoad = 0;
    } else {
      // UJT triggered SCR
      vAvgLoad = (vPeak / (2 * Math.PI)) * (1 + Math.cos(alphaRad));
      vRmsLoad = vInRms * Math.sqrt(Math.max(0, (Math.PI - alphaRad) / (2 * Math.PI)));
    }

    // Effective load impedance taking motor inductance into account:
    const motorInductiveReactance = 4.5; // Ohm (armature inductance at 60Hz)
    const zLoad = Math.sqrt(Math.pow(rLoad, 2) + Math.pow(motorInductiveReactance, 2));
    const iRmsLoad = vRmsLoad / zLoad;
    const powerLoad = Math.pow(iRmsLoad, 2) * rLoad;

    // Motor RPM calculation:
    // Ideal no-load RPM ~ 1800 RPM. Speed proportional to applied voltage and counteracted by mechanical torque:
    const baseSpeed = (vRmsLoad / vInRms) * 1750;
    const torqueDrop = motorTorque * 120;
    const motorRpm = Math.max(0, Math.round(baseSpeed - torqueDrop));
    const motorEfficiency = iRmsLoad > 0.1 ? Math.min(92, Math.max(45, 88 - (motorTorque * 8))) : 0;

    // Gate peak current:
    // Ig_peak = (Vpeak * sin(alpha) - Vgt) / Rgate
    const vAtFiring = vPeak * Math.sin(Math.max(0.1, alphaRad));
    const gateCurrentPeak = Math.max(0, ((vAtFiring - 1.2) / Math.max(1, rGate)) * 1000); // mA

    // Device Power Dissipation and Junction Temperature
    const vt0 = selectedCircuit === 'ssr_polyphase' ? 1.3 : 1.1; // V
    const rd = 0.018; // Ohm
    const iAvgThyristor = iRmsLoad * 0.636;
    const powerLossDevice = (vt0 * iAvgThyristor) + (rd * Math.pow(iRmsLoad, 2));
    const rthJunctionToAmbient = 1.4 + 0.5 + heatsinkRth; // Rjc + Rcs + Rsa
    const ambientTemp = 35; // °C
    const junctionTemp = ambientTemp + (powerLossDevice * rthJunctionToAmbient);

    // Diagnostics & Failure Detection Engine:
    const diagnostics: SimulationResults['diagnostics'] = [];
    let circuitStatus: SimulationResults['circuitStatus'] = 'stable';
    let thermalState: SimulationResults['thermalState'] = 'safe';

    // 1. Gate current check
    if (rGate < 47) {
      circuitStatus = 'error';
      diagnostics.push({
        type: 'error',
        title: '¡Peligro de Destrucción de Compuerta (Gate)!',
        message: `La resistencia de compuerta RG (${rGate} Ω) es peligrosamente baja. La corriente pico de disparo alcanza ${(gateCurrentPeak / 1000).toFixed(2)} A, superando el límite absoluto I_GM (típicamente 1.5 A).`,
        solution: 'Aumente la resistencia de compuerta a un valor seguro entre 100 Ω y 330 Ω para proteger la unión PN.'
      });
    } else if (gateCurrentPeak < 15 && selectedCircuit !== 'ssr_polyphase') {
      circuitStatus = 'warning';
      diagnostics.push({
        type: 'warning',
        title: 'Corriente de Disparo Débil (IGT Insuficiente)',
        message: `El pulso de compuerta es de sólo ${gateCurrentPeak.toFixed(1)} mA, inferior a la corriente mínima de disparo IGT (≈25-50 mA). El dispositivo podría no cebarse de forma confiable.`,
        solution: 'Reduzca el valor de RG o asegure que la red de disparo entregue al menos 30 mA.'
      });
    }

    // 2. Latching current check
    const latchingCurrentA = 0.08; // 80 mA typical IL
    if (iRmsLoad < latchingCurrentA && alphaDeg > 20) {
      circuitStatus = 'warning';
      diagnostics.push({
        type: 'warning',
        title: 'Falla de Enclavamiento (Latching Failure)',
        message: `La corriente instantánea de carga (${(iRmsLoad * 1000).toFixed(0)} mA) es menor que la corriente de enclavamiento IL (${(latchingCurrentA * 1000)} mA). El tiristor se apagará tan pronto como finalice el pulso de disparo.`,
        solution: 'Aumente la carga del motor o conecte una carga resistiva en paralelo de polarización mínima.'
      });
    }

    // 3. Thermal Check
    if (junctionTemp > 125) {
      thermalState = 'danger';
      circuitStatus = 'error';
      diagnostics.push({
        type: 'error',
        title: '¡Sobrecalentamiento Crítico de Silicio (Tj > 125°C)!',
        message: `La temperatura calculada en la juntura es de ${junctionTemp.toFixed(1)} °C, sobrepasando el límite absoluto de 125 °C. El dispositivo sufrirá embalamiento térmico y destrucción permanente.`,
        solution: `Instale un disipador con menor resistencia térmica (Rth ≤ ${((125 - 35) / powerLossDevice - 1.9).toFixed(2)} °C/W) o use ventilación forzada.`
      });
    } else if (junctionTemp > 95) {
      thermalState = 'warning';
      diagnostics.push({
        type: 'warning',
        title: 'Temperatura de Operación Elevada',
        message: `La juntura está operando a ${junctionTemp.toFixed(1)} °C. Aunque está dentro del margen de 125 °C, el ciclo de vida útil del tiristor se reduce notablemente.`,
        solution: 'Mejore la disipación térmica o reduzca la corriente eficaz demandada por el motor.'
      });
    }

    // 4. dv/dt inductive stress notice for AC motor control
    if (selectedCircuit === 'triac_diac_ac' && rLoad < 10) {
      diagnostics.push({
        type: 'warning',
        title: 'Riesgo de Reencendido Falso por dv/dt de Conmutación',
        message: 'Con carga fuertemente inductiva de baja resistencia, la tensión de línea experimenta una tasa dv/dt de conmutación muy rápida al apagarse el TRIAC en el cruce por cero.',
        solution: 'Incorpore una red amortiguadora (Snubber) con R_s = 39 Ω y C_s = 0.047 µF en paralelo con el TRIAC.'
      });
    }

    // Default stable diagnostic
    if (diagnostics.length === 0) {
      diagnostics.push({
        type: 'success',
        title: 'Circuito en Estado Operativo y Estable',
        message: `Todos los parámetros eléctricos y térmicos se encuentran dentro del área de operación segura (SOA). Ángulo de disparo α = ${alphaDeg.toFixed(1)}°, Tj = ${junctionTemp.toFixed(1)} °C.`
      });
    }

    return {
      alphaDeg,
      vRmsLoad,
      vAvgLoad,
      iRmsLoad,
      powerLoad,
      motorRpm,
      motorEfficiency,
      gateCurrentPeak,
      powerLossDevice,
      junctionTemp,
      thermalState,
      circuitStatus,
      diagnostics
    };
  }, [selectedCircuit, r1, c1, rGate, rLoad, vInRms, heatsinkRth, motorTorque]);

  // Circuit presets info
  const circuitOptions = [
    {
      id: 'triac_diac_ac' as CircuitId,
      name: '1. Motor CA con TRIAC y DIAC',
      sub: 'Control de Fase Monofásico (Subtema 2.3)',
      device: 'TRIAC BTA16 + DIAC DB3'
    },
    {
      id: 'scr_rectifier_dc' as CircuitId,
      name: '2. Motor CD con SCR Controlado',
      sub: 'Rectificador Media Onda / Libre Rueda (Subtema 2.5)',
      device: 'SCR 2N6508 (16A 600V)'
    },
    {
      id: 'ssr_polyphase' as CircuitId,
      name: '3. Arrancador SSR Motor Polifásico',
      sub: 'Conmutador de Potencia Zero-Crossing (Subtema 2.4)',
      device: 'SSR Fototriac 40A'
    },
    {
      id: 'ujt_trigger' as CircuitId,
      name: '4. Disparo con UJT Sincronizado',
      sub: 'Oscilador de Relajación para Compuerta (Subtema 2.1.4)',
      device: 'UJT 2N2646'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Circuit Selector Tabs */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Selección de Circuito Base de Potencia
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Frecuencia: 60 Hz • Red Monofásica/Polifásica
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {circuitOptions.map((c) => {
            const isSelected = c.id === selectedCircuit;
            return (
              <button
                key={c.id}
                onClick={() => handleCircuitChange(c.id)}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold block mb-1 ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {c.sub}
                  </span>
                  <h3 className="text-xs font-bold text-white leading-snug">{c.name}</h3>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Dispositivo:</span>
                  <span className="text-emerald-400 font-semibold">{c.device}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTELLIGENT DIAGNOSTIC AND FAULT BANNER */}
      <div className={`p-4 rounded-2xl border transition-all shadow-lg ${
        sim.circuitStatus === 'error'
          ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
          : sim.circuitStatus === 'warning'
          ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
          : 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              sim.circuitStatus === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : sim.circuitStatus === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {sim.circuitStatus === 'error' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : sim.circuitStatus === 'warning' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30">
                  {sim.circuitStatus === 'error' ? 'ERROR DE CIRCUITO / SOBRECARGA' : sim.circuitStatus === 'warning' ? 'ALERTA DE PARÁMETROS' : 'ESTADO OPERATIVO / ESTABLE'}
                </span>
                <span className="text-xs font-mono opacity-80">
                  Ángulo α: <strong>{sim.alphaDeg.toFixed(1)}°</strong> | Tj: <strong>{sim.junctionTemp.toFixed(1)}°C</strong>
                </span>
              </div>

              {sim.diagnostics.map((diag, i) => (
                <div key={i} className="mt-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {diag.title}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">{diag.message}</p>
                  {diag.solution && (
                    <div className="mt-1 text-xs font-medium text-amber-300 flex items-center gap-1">
                      <span className="font-bold">Acción Correctiva Sugerida:</span> {diag.solution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex sm:flex-col gap-2 shrink-0 bg-black/40 p-3 rounded-xl border border-white/10 text-xs font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">V_RMS Carga:</span>
              <span className="font-bold text-emerald-300">{sim.vRmsLoad.toFixed(1)} V</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">I_RMS Carga:</span>
              <span className="font-bold text-indigo-300">{sim.iRmsLoad.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Velocidad Motor:</span>
              <span className="font-bold text-amber-300">{sim.motorRpm} RPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Controls (Left 4 cols) & Oscilloscope + Schematic (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Controles de Circuito en Tiempo Real
                </h3>
              </div>
              <button
                onClick={() => handleCircuitChange(selectedCircuit)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                title="Restablecer Valores por Defecto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slider 1: R1 Potentiometer */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Potenciómetro / Resistencia R1:</span>
                <span className="font-mono font-bold text-indigo-400">{r1} kΩ</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="1"
                value={r1}
                onChange={(e) => setR1(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5 kΩ (Ángulo α bajo)</span>
                <span>250 kΩ (Ángulo α alto)</span>
              </div>
            </div>

            {/* Slider 2: C1 Capacitor */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Capacitor de Retardo C1:</span>
                <span className="font-mono font-bold text-sky-400">{c1} µF</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="1.0"
                step="0.01"
                value={c1}
                onChange={(e) => setC1(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.01 µF</span>
                <span>Constante τ = R·C</span>
                <span>1.0 µF</span>
              </div>
            </div>

            {/* Slider 3: Gate Resistor Rgate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Resistencia Limitadora Gate (RG):</span>
                <span className={`font-mono font-bold ${rGate < 47 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  {rGate} Ω {rGate < 47 && '⚠'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={rGate}
                onChange={(e) => setRGate(Number(e.target.value))}
                className={`w-full cursor-pointer ${rGate < 47 ? 'accent-rose-500' : 'accent-amber-500'}`}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span className="text-rose-400 font-bold">&lt; 47Ω (Peligro)</span>
                <span>220 Ω (Normal)</span>
                <span>1000 Ω</span>
              </div>
            </div>

            {/* Slider 4: Motor Resistance / Impedance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Resistencia de Devanado Motor (R_carga):</span>
                <span className="font-mono font-bold text-emerald-400">{rLoad} Ω</span>
              </div>
              <input
                type="range"
                min="4"
                max="50"
                step="1"
                value={rLoad}
                onChange={(e) => setRLoad(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>4 Ω (Alta Corriente)</span>
                <span>50 Ω (Carga Ligera)</span>
              </div>
            </div>

            {/* Slider 5: Mechanical Torque */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Torque Mecánico de Carga:</span>
                <span className="font-mono font-bold text-purple-400">{motorTorque.toFixed(1)} N·m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={motorTorque}
                onChange={(e) => setMotorTorque(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.2 N·m (Vacío)</span>
                <span>Freno Mecánico</span>
                <span>5.0 N·m (Carga Pesada)</span>
              </div>
            </div>

            {/* Slider 6: Heatsink Rth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Resistencia Disipador (Rth,s-a):</span>
                <span className={`font-mono font-bold ${heatsinkRth > 5 ? 'text-amber-400' : 'text-teal-400'}`}>
                  {heatsinkRth.toFixed(1)} °C/W
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="9.0"
                step="0.5"
                value={heatsinkRth}
                onChange={(e) => setHeatsinkRth(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5 °C/W (Disipador Extruido)</span>
                <span>9.0 °C/W (Sin disipador)</span>
              </div>
            </div>
          </div>

          {/* Motor Status Card with Rotating Animation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Spinning Motor Rotor Widget */}
              <div className="relative w-14 h-14 rounded-full bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden">
                <div
                  className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center transition-all"
                  style={{
                    transform: `rotate(${simTime * (sim.motorRpm / 60)}deg)`,
                    transition: isPlaying ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white shadow-md shadow-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Estado del Motor</span>
                <div className="text-lg font-black text-white flex items-center gap-1.5">
                  <span>{sim.motorRpm}</span>
                  <span className="text-xs font-normal text-emerald-400">RPM</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Potencia: {(sim.powerLoad / 1000).toFixed(2)} kW | Efic: {sim.motorEfficiency}%
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block">Juntura Tj</span>
              <span className={`text-base font-bold ${
                sim.junctionTemp > 125 ? 'text-rose-400 animate-pulse' : sim.junctionTemp > 95 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {sim.junctionTemp.toFixed(1)}°C
              </span>
              <span className="text-[10px] text-slate-500 block">Máx: 125°C</span>
            </div>
          </div>
        </div>

        {/* Right Column: Virtual Oscilloscope & Dynamic Circuit Schematic (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Virtual Oscilloscope */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            {/* Oscilloscope Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  Osciloscopio Virtual de Potencia
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    60 Hz • {timeDiv} ms/div
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Play / Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    isPlaying
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-amber-600 text-white shadow-sm'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSAR' : 'REANUDAR'}</span>
                </button>

                {/* Channel toggles */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setShowVin(!showVin)}
                    className={`px-2 py-0.5 rounded transition ${
                      showVin ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-500'
                    }`}
                  >
                    CH1 (Vin)
                  </button>
                  <button
                    onClick={() => setShowVload(!showVload)}
                    className={`px-2 py-0.5 rounded transition ${
                      showVload ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500'
                    }`}
                  >
                    CH2 (Vload)
                  </button>
                  <button
                    onClick={() => setShowIload(!showIload)}
                    className={`px-2 py-0.5 rounded transition ${
                      showIload ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500'
                    }`}
                  >
                    CH3 (Iload)
                  </button>
                  <button
                    onClick={() => setShowVgate(!showVgate)}
                    className={`px-2 py-0.5 rounded transition ${
                      showVgate ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-500'
                    }`}
                  >
                    CH4 (Vgate)
                  </button>
                </div>
              </div>
            </div>

            {/* Oscilloscope Screen (SVG) */}
            <div className="bg-[#030d0d] rounded-xl border-2 border-emerald-950/60 p-2 relative shadow-inner overflow-hidden">
              <svg
                viewBox="0 0 700 320"
                className="w-full h-auto max-h-[320px] select-none font-mono text-[10px]"
              >
                <defs>
                  {/* CRT Phosphor Grid Pattern */}
                  <pattern id="crt-grid" width="70" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 70 0 L 0 0 0 40" fill="none" stroke="#064e3b" strokeWidth="0.7" strokeDasharray="1,4" />
                  </pattern>
                </defs>

                {/* Grid */}
                <rect width="700" height="320" fill="#021414" />
                <rect width="700" height="320" fill="url(#crt-grid)" />

                {/* Center Graticules */}
                <line x1="0" y1="160" x2="700" y2="160" stroke="#059669" strokeWidth="1.2" opacity="0.6" />
                <line x1="350" y1="0" x2="350" y2="320" stroke="#059669" strokeWidth="1.2" opacity="0.6" />

                {/* Subdivisions on center axes */}
                {[...Array(20)].map((_, i) => (
                  <line key={`x-${i}`} x1={i * 35} y1="157" x2={i * 35} y2="163" stroke="#059669" strokeWidth="1" opacity="0.8" />
                ))}
                {[...Array(16)].map((_, i) => (
                  <line key={`y-${i}`} x1="347" y1={i * 20} x2="353" y2={i * 20} stroke="#059669" strokeWidth="1" opacity="0.8" />
                ))}

                {/* Mathematical Waveform Generator */}
                {(() => {
                  const pointsCount = 400;
                  const vinPoints: string[] = [];
                  const vloadPoints: string[] = [];
                  const iloadPoints: string[] = [];
                  const vgatePoints: string[] = [];

                  const totalCycles = 2.5; // display 2.5 cycles
                  const periodPx = 700 / totalCycles;
                  const alphaRatio = sim.alphaDeg / 360;

                  for (let i = 0; i <= pointsCount; i++) {
                    const x = (i / pointsCount) * 700;
                    // Phase angle in radians for this x
                    const cyclePos = (x / periodPx);
                    const phaseDeg = (cyclePos * 360) % 360;
                    const phaseRad = (phaseDeg * Math.PI) / 180;

                    // Vin(t) sine wave:
                    const vinVal = Math.sin(phaseRad);
                    const yVin = 160 - (vinVal * 110);
                    vinPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${yVin.toFixed(1)}`);

                    // Gate Pulse at firing angle
                    const isFiringPos = (phaseDeg >= sim.alphaDeg && phaseDeg <= sim.alphaDeg + 8) || 
                      (selectedCircuit === 'triac_diac_ac' && phaseDeg >= (180 + sim.alphaDeg) && phaseDeg <= (180 + sim.alphaDeg + 8));
                    const yGate = isFiringPos ? 60 : 158;
                    vgatePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${yGate.toFixed(1)}`);

                    // Vload & Iload behavior according to circuit:
                    let vloadVal = 0;
                    if (selectedCircuit === 'triac_diac_ac') {
                      // Positive cycle conduction from alpha to 180, negative cycle from 180+alpha to 360
                      if ((phaseDeg >= sim.alphaDeg && phaseDeg < 180) || (phaseDeg >= (180 + sim.alphaDeg) && phaseDeg < 360)) {
                        vloadVal = vinVal;
                      } else {
                        vloadVal = 0;
                      }
                    } else if (selectedCircuit === 'scr_rectifier_dc' || selectedCircuit === 'ujt_trigger') {
                      // Controlled half wave: conducts only from alpha to 180 (with freewheeling tail)
                      if (phaseDeg >= sim.alphaDeg && phaseDeg < 185) {
                        vloadVal = Math.max(0, vinVal);
                      } else {
                        vloadVal = 0;
                      }
                    } else if (selectedCircuit === 'ssr_polyphase') {
                      // Zero-cross conduction: full sine wave with negligible phase cut
                      vloadVal = vinVal * 0.98;
                    }

                    const yVload = 160 - (vloadVal * 110);
                    vloadPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${yVload.toFixed(1)}`);

                    // Iload with slight inductive lag & smoothing:
                    const iRatio = vloadVal > 0 ? (vloadVal * 0.8) : (vloadVal < 0 ? (vloadVal * 0.8) : 0);
                    const yIload = 160 - (iRatio * 75);
                    iloadPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${yIload.toFixed(1)}`);
                  }

                  return (
                    <g>
                      {/* CH1: Vin (Cyan) */}
                      {showVin && (
                        <path
                          d={vinPoints.join(' ')}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          opacity="0.6"
                          strokeDasharray="4,2"
                        />
                      )}

                      {/* CH4: Gate Trigger Pulses (Purple) */}
                      {showVgate && (
                        <path
                          d={vgatePoints.join(' ')}
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2"
                        />
                      )}

                      {/* CH2: Vload (Bright Emerald) */}
                      {showVload && (
                        <path
                          d={vloadPoints.join(' ')}
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="2.5"
                        />
                      )}

                      {/* CH3: Iload (Amber) */}
                      {showIload && (
                        <path
                          d={iloadPoints.join(' ')}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })()}

                {/* Firing Angle Indicator Vertical Line */}
                {(() => {
                  const periodPx = 700 / 2.5;
                  const alphaX = (sim.alphaDeg / 360) * periodPx;
                  return (
                    <g>
                      <line x1={alphaX} y1="20" x2={alphaX} y2="300" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                      <rect x={alphaX + 4} y="25" width="80" height="20" rx="3" fill="#0f172a" stroke="#f43f5e" />
                      <text x={alphaX + 8} y="39" fill="#fca5a5" fontSize="10" fontWeight="bold">
                        α = {sim.alphaDeg.toFixed(1)}°
                      </text>
                    </g>
                  );
                })()}

                {/* CRT Screen Legend */}
                <g transform="translate(15, 25)">
                  <rect x="0" y="0" width="220" height="50" rx="4" fill="#021414" opacity="0.85" stroke="#059669" />
                  <text x="10" y="16" fill="#38bdf8">CH1: Vin ({vInRms} VRMS 60Hz)</text>
                  <text x="10" y="30" fill="#34d399" fontWeight="bold">CH2: Vload ({sim.vRmsLoad.toFixed(1)} VRMS)</text>
                  <text x="10" y="44" fill="#fbbf24">CH3: Iload ({sim.iRmsLoad.toFixed(2)} ARMS)</text>
                </g>
              </svg>
            </div>

            {/* Interactive Scope Summary Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Ángulo de Disparo α:</span>
                <span className="text-sm font-bold text-rose-400">{sim.alphaDeg.toFixed(1)}°</span>
                <span className="text-[10px] text-slate-500 block">Retardo: {((sim.alphaDeg / 360) * 16.67).toFixed(2)} ms</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tensión Eficaz Carga:</span>
                <span className="text-sm font-bold text-emerald-400">{sim.vRmsLoad.toFixed(1)} V</span>
                <span className="text-[10px] text-slate-500 block">Vavg: {sim.vAvgLoad.toFixed(1)} V</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Corriente Eficaz Carga:</span>
                <span className="text-sm font-bold text-indigo-400">{sim.iRmsLoad.toFixed(2)} A</span>
                <span className="text-[10px] text-slate-500 block">Potencia: {sim.powerLoad.toFixed(0)} W</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pico Corriente Gate:</span>
                <span className={`text-sm font-bold ${sim.gateCurrentPeak > 1500 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {sim.gateCurrentPeak.toFixed(0)} mA
                </span>
                <span className="text-[10px] text-slate-500 block">Límite IGM: 1500 mA</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC CIRCUIT SCHEMATIC (SVG) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Diagrama Esquemático del Circuito Activo
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                Lazo Cerrado • Control de Fase
              </span>
            </div>

            {/* SVG Schematic */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <svg viewBox="0 0 650 200" className="w-full h-auto select-none font-mono text-[11px]">
                {/* AC Source */}
                <circle cx="60" cy="100" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 48 100 Q 54 90 60 100 T 72 100" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <text x="35" y="140" fill="#94a3b8" fontSize="10">Vin {vInRms}V</text>

                {/* Upper rail */}
                <line x1="60" y1="78" x2="60" y2="40" stroke="#64748b" strokeWidth="2" />
                <line x1="60" y1="40" x2="220" y2="40" stroke="#64748b" strokeWidth="2" />

                {/* Timing Potentiometer R1 */}
                <rect x="220" y="32" width="60" height="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                <text x="235" y="44" fill="#c7d2fe" fontSize="10">{r1}kΩ</text>
                <text x="240" y="24" fill="#a5b4fc" fontWeight="bold">R1</text>

                {/* Node after R1 */}
                <line x1="280" y1="40" x2="330" y2="40" stroke="#64748b" strokeWidth="2" />
                <circle cx="330" cy="40" r="3.5" fill="#38bdf8" />

                {/* Branch down to C1 */}
                <line x1="330" y1="40" x2="330" y2="90" stroke="#64748b" strokeWidth="2" />
                {/* Capacitor C1 plates */}
                <line x1="315" y1="90" x2="345" y2="90" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="315" y1="96" x2="345" y2="96" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="350" y="96" fill="#38bdf8" fontSize="10">C1 {c1}µF</text>
                <line x1="330" y1="96" x2="330" y2="160" stroke="#64748b" strokeWidth="2" />

                {/* Branch to Trigger Element (DIAC / UJT) */}
                <line x1="330" y1="65" x2="380" y2="65" stroke="#64748b" strokeWidth="2" />
                {/* Trigger Box */}
                <rect x="380" y="55" width="55" height="20" rx="3" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
                <text x="390" y="69" fill="#86efac" fontSize="10" fontWeight="bold">
                  {selectedCircuit === 'triac_diac_ac' ? 'DIAC DB3' : selectedCircuit === 'ujt_trigger' ? 'UJT 2N2646' : 'OPTO-GATE'}
                </text>

                {/* Gate resistor RG */}
                <line x1="435" y1="65" x2="455" y2="65" stroke="#64748b" strokeWidth="2" />
                <rect x="455" y="58" width="40" height="14" fill="#312e81" stroke="#a855f7" strokeWidth="1.2" />
                <text x="460" y="69" fill="#e9d5ff" fontSize="9">RG {rGate}Ω</text>
                <line x1="495" y1="65" x2="520" y2="65" stroke="#64748b" strokeWidth="2" />

                {/* Main Power Device (TRIAC/SCR/SSR) */}
                <rect x="520" y="45" width="45" height="55" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="527" y="75" fill="#fcd34d" fontWeight="bold" fontSize="11">
                  {selectedCircuit === 'triac_diac_ac' ? 'TRIAC' : selectedCircuit === 'scr_rectifier_dc' ? 'SCR' : 'SSR'}
                </text>
                <line x1="520" y1="65" x2="510" y2="65" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="502" y="60" fill="#f59e0b" fontSize="9">G</text>

                {/* Connections to Motor Load */}
                <line x1="60" y1="40" x2="60" y2="20" stroke="#64748b" strokeWidth="2" />
                <line x1="60" y1="20" x2="542" y2="20" stroke="#64748b" strokeWidth="2" />
                <line x1="542" y1="20" x2="542" y2="45" stroke="#64748b" strokeWidth="2" />

                {/* From device to Motor */}
                <line x1="542" y1="100" x2="542" y2="130" stroke="#64748b" strokeWidth="2" />
                {/* Motor Symbol */}
                <circle cx="542" cy="145" r="16" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                <text x="536" y="150" fill="#34d399" fontWeight="bold" fontSize="12">M</text>
                <text x="565" y="148" fill="#94a3b8" fontSize="10">Motor {sim.motorRpm} RPM</text>

                {/* Return to neutral/source */}
                <line x1="542" y1="161" x2="542" y2="180" stroke="#64748b" strokeWidth="2" />
                <line x1="542" y1="180" x2="60" y2="180" stroke="#64748b" strokeWidth="2" />
                <line x1="60" y1="180" x2="60" y2="122" stroke="#64748b" strokeWidth="2" />
                <line x1="330" y1="160" x2="330" y2="180" stroke="#64748b" strokeWidth="2" />

                {/* Live Current Flow Animated Dots */}
                {isPlaying && sim.iRmsLoad > 0.1 && (
                  <circle
                    cx={60 + ((simTime * 4.8) % 480)}
                    cy="20"
                    r="3"
                    fill="#38bdf8"
                    className="filter drop-shadow"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
