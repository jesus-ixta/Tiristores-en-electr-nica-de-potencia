export type TabType = 'teoria' | 'simulador' | 'tutor' | 'evaluacion';

export type DeviceId = 'scr' | 'triac' | 'diac' | 'ujt' | 'ssr';

export interface DeviceInfo {
  id: DeviceId;
  name: string;
  subtopic: string;
  fullName: string;
  symbol: string;
  summary: string;
  structure: {
    layers: string[];
    terminals: string[];
    description: string;
  };
  triggering: {
    methods: string[];
    details: string;
    criticalParams: { name: string; symbol: string; typical: string; desc: string }[];
  };
  turnOff: {
    methods: string[];
    details: string;
  };
  applications: string[];
  ivCurveDescription: {
    forwardBlocking: string;
    conduction: string;
    reverseBlocking: string;
    keyPoints: { label: string; x: number; y: number; text: string }[];
  };
  thermalSpecs: {
    typicalRthJC: number; // °C/W
    typicalRthCS: number; // °C/W
    maxTj: number; // °C
    vt0: number; // V
    rd: number; // Ohm
  };
}

export type CircuitId = 'triac_diac_ac' | 'scr_rectifier_dc' | 'ssr_polyphase' | 'ujt_trigger';

export interface CircuitPreset {
  id: CircuitId;
  title: string;
  subtopic: string;
  description: string;
  schematicType: string;
  defaultValues: {
    r1: number; // kOhm
    c1: number; // uF
    rGate: number; // Ohm
    rLoad: number; // Ohm
    vInRms: number; // V
    freq: number; // Hz
    heatsinkRth: number; // °C/W
    motorTorque: number; // N.m
  };
}

export interface SimulationResults {
  alphaDeg: number; // Firing angle (degrees)
  vRmsLoad: number; // V
  vAvgLoad: number; // V
  iRmsLoad: number; // A
  powerLoad: number; // W
  motorRpm: number; // RPM
  motorEfficiency: number; // %
  gateCurrentPeak: number; // mA
  powerLossDevice: number; // W
  junctionTemp: number; // °C
  thermalState: 'safe' | 'warning' | 'danger';
  circuitStatus: 'stable' | 'warning' | 'error';
  diagnostics: {
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    solution?: string;
  }[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  context?: string;
  formula?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctId: string;
  explanation: string;
  topicRef: string;
}

export interface ChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
  socraticHint?: string;
}
