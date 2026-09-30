import React from 'react';
import { TabType } from '../types';
import { BookOpen, Cpu, MessageSquareText, Award, Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'teoria' as TabType, label: 'Teoría y Curvas I-V', icon: BookOpen, desc: 'SCR, TRIAC, DIAC, UJT, SSR' },
    { id: 'simulador' as TabType, label: 'Simulador de Circuitos', icon: Cpu, desc: 'Control de Motores y Diagnóstico' },
    { id: 'tutor' as TabType, label: 'Tutor Socrático', icon: MessageSquareText, desc: 'Guía Conceptual Interactiva' },
    { id: 'evaluacion' as TabType, label: 'Evaluación y Certificado', icon: Award, desc: 'Examen Oficial y Constancia' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Banner with TecNM / ITSC branding and Teacher attribution */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 text-slate-300">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase">
              TecNM • ITSC
            </span>
            <span>Instituto Tecnológico Superior de Comalcalco</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Circuitos Electrónicos de Potencia </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[11px] shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Creado por el Profesor Jesus Ixta - Instituto Tecnológico Superior de Comalcalco</span>
          </div>
        </div>
      </div>

      {/* Main Title & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Unidad II: Tiristores
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    FED-2302
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Plataforma de Simulación, Curvas de Trabajo I-V, Disipación Térmica y Control de Motores
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block leading-none">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
