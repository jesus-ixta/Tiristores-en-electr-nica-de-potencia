import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TheorySection } from './components/TheorySection';
import { SimulatorSection } from './components/SimulatorSection';
import { SocraticTutorSection } from './components/SocraticTutorSection';
import { QuizSection } from './components/QuizSection';
import { BookOpen, Cpu, MessageSquareText, Award, ChevronRight, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('teoria');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header with Navigation and Mandatory Attribution */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Quick Breadcrumb and Context Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">TecNM • ITSC</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300">Circuitos Electrónicos de Potencia</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-indigo-400 font-bold uppercase tracking-wider">
              {activeTab === 'teoria' && 'Unidad II: Teoría, Capas PNPN y Curvas I-V'}
              {activeTab === 'simulador' && 'Laboratorio Virtual: Control de Motores y Osciloscopio'}
              {activeTab === 'tutor' && 'Tutor Socrático: Guía Inductiva y Análisis'}
              {activeTab === 'evaluacion' && 'Acreditación Oficial: Examen de 10 Reactivos'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Prof. Ixta • Entorno Interactivo Listo</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'teoria' && <TheorySection />}
        {activeTab === 'simulador' && <SimulatorSection />}
        {activeTab === 'tutor' && <SocraticTutorSection />}
        {activeTab === 'evaluacion' && <QuizSection />}
      </main>

      {/* Mandatory Footer with Attribution Legend */}
      <Footer />
    </div>
  );
}
