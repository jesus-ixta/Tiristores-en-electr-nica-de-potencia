import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Printer, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  ArrowRight,
  ArrowLeft,
  FileText,
  UserCheck
} from 'lucide-react';

export const QuizSection: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('itsc_student_name') || '';
  });
  const [studentControlNum, setStudentControlNum] = useState<string>(() => {
    return localStorage.getItem('itsc_student_control') || '';
  });
  const [studentCareer, setStudentCareer] = useState<string>(() => {
    return localStorage.getItem('itsc_student_career') || 'Ingeniería Mecatrónica';
  });
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Save to localStorage when changed
  const handleNameChange = (val: string) => {
    setStudentName(val);
    localStorage.setItem('itsc_student_name', val);
  };

  const handleControlNumChange = (val: string) => {
    setStudentControlNum(val);
    localStorage.setItem('itsc_student_control', val);
  };

  const handleCareerChange = (val: string) => {
    setStudentCareer(val);
    localStorage.setItem('itsc_student_career', val);
  };

  const handleSelectOption = (questionId: number, optionId: string) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctId) {
        correct++;
      }
    });
    return {
      correct,
      total: QUIZ_QUESTIONS.length,
      percentage: Math.round((correct / QUIZ_QUESTIONS.length) * 100),
      passed: (correct / QUIZ_QUESTIONS.length) >= 0.8
    };
  };

  const score = calculateScore();

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowCertificateModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Quiz Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10 Reactivos Oficiales • Mínimo 80% Aprobatorio
              </span>
              <span className="text-xs text-slate-400">ITSC • TecNM</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Evaluación Técnica y Certificación: Unidad II Tiristores
            </h2>
            <p className="text-xs text-slate-300">
              Comprueba tu dominio en parámetros IL/IH, curvas I-V, cálculo de disipadores térmicos Rth y control de motores.
            </p>
          </div>
        </div>

        {/* Current status or finish button */}
        <div className="flex items-center gap-2">
          {showResults ? (
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Examen</span>
            </button>
          ) : (
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 ring-1 ring-white/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Calificar y Ver Resultados ({Object.keys(selectedAnswers).length}/{QUIZ_QUESTIONS.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN DEDICADA: REGISTRO DEL ALUMNO PARA SU CONSTANCIA */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border-2 border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Registro del Alumno para Emisión de Constancia
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Oficial
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Escribe tu nombre tal como deseas que aparezca impreso en tu Constancia de Acreditación.
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2">
            {studentName.trim() ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nombre Registrado</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Ingresa tu Nombre</span>
              </span>
            )}
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Formato</span>
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Student Full Name (8 cols) */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>Nombre Completo del Alumno:</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. Juan Carlos Pérez Morales"
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition shadow-inner font-medium"
              />
              {studentName && (
                <button
                  onClick={() => handleNameChange('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Se imprimirá en el centro del diploma oficial de la asignatura.
            </p>
          </div>

          {/* Student Control Number / Matrícula (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-200">
              No. de Control / Matrícula (Opcional):
            </label>
            <input
              type="text"
              value={studentControlNum}
              onChange={(e) => handleControlNumChange(e.target.value)}
              placeholder="Ej. 21E60123"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Identificador institucional TecNM.
            </p>
          </div>

          {/* Career (3 cols) */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-200">
              Carrera / División:
            </label>
            <select
              value={studentCareer}
              onChange={(e) => handleCareerChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition font-medium"
            >
              <option value="Ingeniería Mecatrónica">Ingeniería Mecatrónica</option>
              <option value="Ingeniería Ferroviaria">Ingeniería Ferroviaria</option>
              <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
              <option value="Ingeniería Electromecánica">Ingeniería Electromecánica</option>
              <option value="Ingeniería Industrial">Ingeniería Industrial</option>
            </select>
            <p className="text-[11px] text-slate-400">
              División académica de adscripción.
            </p>
          </div>
        </div>

        {/* Live Diploma Preview Strip */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">La constancia se emitirá a nombre de:</span>
              <span className="font-bold text-slate-200 text-sm">
                {studentName.trim() ? studentName : <span className="italic text-slate-500">Aún no has registrado tu nombre</span>}
                {studentControlNum.trim() && <span className="font-mono text-xs text-indigo-400 font-normal ml-2">({studentControlNum})</span>}
              </span>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
            Profesor: <strong className="text-emerald-400">Profesor Jesus Ixta</strong>
          </div>
        </div>
      </div>

      {/* Results Summary Box when submitted */}
      {showResults && (
        <div className={`p-6 rounded-2xl border shadow-2xl transition-all ${
          score.passed
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 border-emerald-500/60'
            : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/60'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl ${
                score.passed
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30'
                  : 'bg-rose-500 text-white ring-4 ring-rose-400/30'
              }`}>
                {score.percentage}%
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider block opacity-75">
                  {score.passed ? '¡ACREDITACIÓN SATISFACTORIA!' : 'REPROBADO (SE REQUIERE REPASO)'}
                </span>
                <h3 className="text-xl font-black text-white">
                  Obtuviste {score.correct} de {score.total} respuestas correctas
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {score.passed
                    ? '¡Felicidades! Has demostrado comprensión técnica profunda de los semiconductores de cuatro capas, curvas de trabajo, disipación de calor y esquemas de disparo.'
                    : 'Revisa las justificaciones técnicas detalladas en cada reactivo inferior para identificar las áreas de oportunidad e inténtalo nuevamente.'}
                </p>
              </div>
            </div>

            {/* Certificate Trigger Button */}
            {score.passed && (
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/30 ring-2 ring-amber-300 transition shrink-0 animate-bounce"
              >
                <Award className="w-5 h-5 text-slate-950" />
                <span>Generar Constancia Oficial</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 10 Questions List */}
      <div className="space-y-6">
        {QUIZ_QUESTIONS.map((q, index) => {
          const userAnswer = selectedAnswers[q.id];
          const isCorrect = userAnswer === q.correctId;
          const isAnswered = !!userAnswer;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-2xl border transition-all ${
                showResults
                  ? isCorrect
                    ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900/90 border-rose-500/60 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{q.topicRef}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {q.question}
                  </h3>
                </div>

                {showResults && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" /> Correcta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                        <XCircle className="w-4 h-4" /> Incorrecta
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Formula Preview */}
              {q.formula && (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 mb-3 inline-block">
                  Fórmula de referencia: <strong className="text-white font-bold">{q.formula}</strong>
                </div>
              )}

              {/* Options */}
              <div className="space-y-2 mt-2">
                {q.options.map((opt) => {
                  const isThisSelected = userAnswer === opt.id;
                  const isThisCorrect = opt.id === q.correctId;

                  let optStyles = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                  if (showResults) {
                    if (isThisCorrect) {
                      optStyles = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/50';
                    } else if (isThisSelected && !isThisCorrect) {
                      optStyles = 'bg-rose-950/70 border-rose-500 text-rose-200 font-semibold line-through';
                    } else {
                      optStyles = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
                    }
                  } else if (isThisSelected) {
                    optStyles = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      disabled={showResults}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition ${optStyles}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isThisSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Technical Feedback when results are shown */}
              {showResults && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Justificación Técnica y Solución Oficial:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300 font-sans">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* OFFICIAL CERTIFICATE / DIPLOMA MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Vista Previa de la Constancia Oficial Imprimible
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Regresar a la Aplicación</span>
                </button>
              </div>
            </div>

            {/* Editable Student Name, Control Number, and Career inside modal */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre Completo del Alumno:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  No. de Control (Opcional):
                </label>
                <input
                  type="text"
                  value={studentControlNum}
                  onChange={(e) => handleControlNumChange(e.target.value)}
                  placeholder="Ej. 21E60123"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Carrera / División:
                </label>
                <select
                  value={studentCareer}
                  onChange={(e) => handleCareerChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Ingeniería Mecatrónica">Ingeniería Mecatrónica</option>
                  <option value="Ingeniería Ferroviaria">Ingeniería Ferroviaria</option>
                  <option value="Ingeniería Electrónica">Ingeniería Electrónica</option>
                  <option value="Ingeniería Electromecánica">Ingeniería Electromecánica</option>
                  <option value="Ingeniería Industrial">Ingeniería Industrial</option>
                </select>
              </div>
            </div>

            {/* PRINTABLE DIPLOMA CARD CONTAINER */}
            <div 
              id="printable-diploma" 
              className="bg-amber-50/95 text-slate-900 p-8 sm:p-12 rounded-2xl border-8 border-double border-amber-800/60 shadow-2xl relative font-serif select-none"
            >
              {/* Outer decorative border lines */}
              <div className="border-2 border-amber-900/40 p-6 rounded-lg text-center space-y-5 relative">
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Award className="w-96 h-96 text-amber-900" />
                </div>

                {/* Institution Heading */}
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-700">
                    TECNOLÓGICO NACIONAL DE MÉXICO
                  </h4>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-amber-950 uppercase">
                    Instituto Tecnológico Superior de Comalcalco
                  </h2>
                  <p className="text-xs font-sans text-slate-600">
                    División de Ingeniería Mecatrónica
                  </p>
                </div>

                <div className="w-24 h-0.5 bg-amber-800 mx-auto my-3" />

                <div className="space-y-1">
                  <span className="text-xs uppercase font-sans tracking-widest text-slate-600 block">
                    OTORGA LA PRESENTE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">
                    CONSTANCIA DE ACREDITACIÓN TÉCNICA
                  </h3>
                  <span className="text-xs italic text-slate-600">
                    Por haber acreditado con excelencia el examen teórico-práctico de:
                  </span>
                </div>

                {/* Course Details */}
                <div className="bg-amber-100/60 py-2.5 px-4 rounded-lg inline-block border border-amber-300/80">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">
                    Circuitos Electrónicos de Potencia
                  </h4>
                  <p className="text-xs font-sans font-semibold text-amber-900">
                    UNIDAD II: TIRISTORES (SCR, TRIAC, DIAC, UJT, SSR Y CONTROL DE MOTORES)
                  </p>
                </div>

                {/* Student Name */}
                <div className="py-2">
                  <span className="text-xs font-sans text-slate-600 uppercase block mb-1">A favor de:</span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-950 border-b-2 border-slate-900/30 inline-block px-8 pb-1">
                    {studentName.trim() ? studentName : 'Nombre del Alumno'}
                  </div>
                  {studentControlNum.trim() && (
                    <div className="text-xs font-mono text-slate-700 mt-1">
                      No. de Control: <span className="font-bold">{studentControlNum}</span>
                    </div>
                  )}
                  <div className="text-[11px] font-sans text-slate-600 mt-0.5">
                    Carrera: {studentCareer}
                  </div>
                </div>

                {/* Score and Date */}
                <div className="text-xs font-sans text-slate-700 space-y-0.5">
                  <p>
                    Con una calificación sobresaliente del: <strong className="text-amber-950 font-bold text-sm">{score.percentage}% ({score.correct}/10 Reactivos)</strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Expedido en Comalcalco, Tabasco, México a {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}.
                  </p>
                </div>

                {/* Professor Signature Section */}
                <div className="pt-8 flex justify-center items-center">
                  <div className="text-center w-64 border-t-2 border-slate-800 pt-2 font-sans">
                    <div className="font-serif italic font-bold text-indigo-950 text-base mb-0.5">
                      Profesor Jesus Ixta
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Profesor Jesus Ixta
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Catedrático de Electrónica de Potencia
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      Instituto Tecnológico Superior de Comalcalco
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar: Return to Application & Print */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 bg-slate-900/60 p-4 rounded-2xl">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                <span className="font-semibold text-slate-200 block">¿Terminaste de consultar o imprimir tu constancia?</span>
                <span>Puedes regresar a la aplicación para explorar los simuladores, curvas I-V y el tutor interactivo.</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Descargar PDF</span>
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition ring-1 ring-indigo-400/40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Regresar a la Aplicación</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
