import React from 'react';
import { Award, BookOpen, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs">
      {/* Primary Attribution Highlight */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Creado por el Profesor Jesus Ixta - Instituto Tecnológico Superior de Comalcalco
              </p>
              <p className="text-[11px] text-slate-400">
                Tecnológico Nacional de México • División de Ingeniería Mecatrónica
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Comalcalco, Tabasco, México
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> jesus.ixta@comalcalco.tecnm.mx
            </span>
          </div>
        </div>
      </div>

      {/* Course metadata */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 font-medium text-slate-300">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Asignatura: Circuitos Electrónicos de Potencia </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Unidad II: Tiristores (SCR, TRIAC, DIAC, UJT, Relevadores de Estado Sólido SSR, Control de Fase, Disipación Térmica y Motores).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Material Didáctico y de Laboratorio Virtual Oficial</span>
        </div>
      </div>
    </footer>
  );
};
