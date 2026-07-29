'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/ai-analyzer';
import { CheckCircle2, XCircle, Award, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizGeneratorProps {
  questions: QuizQuestion[];
  isLoading: boolean;
  onReGenerate?: () => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ questions, isLoading, onReGenerate }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | boolean>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-semibold text-xs">جاري صياغة أسئلة تقييمية ذكية وتحديد الإجابات النموذجية...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <p className="text-xs font-medium">لا توجد أسئلة سابقة. اضغط على خيار تحليل النص لإنشاء اختبار تفاعلي جديد.</p>
      </div>
    );
  }

  const handleSelectOption = (questionId: string, option: string | boolean) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* الهيدر والعنوان */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-violet-700 font-extrabold text-sm">
          <Award className="w-5 h-5 text-violet-600" />
          <h3>اختبار تقييم الفهم المتدرج ({questions.length} أسئلة)</h3>
        </div>
        {onReGenerate && (
          <button
            onClick={onReGenerate}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/80 font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> إعادة توليد الأسئلة
          </button>
        )}
      </div>

      {/* قائمة الأسئلة */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const isAnswered = showResults[q.id];
          const userAnswer = selectedAnswers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <motion.div
              key={q.id || qIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIdx * 0.05 }}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              {/* نص السؤال والدرجة */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  <span className="text-violet-600 font-extrabold ml-2">{qIdx + 1}.</span>
                  {q.question}
                </p>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-violet-100/80 text-violet-700 border border-violet-200/60 shrink-0">
                  {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'متقدم'}
                </span>
              </div>

              {/* خيارات الإجابة */}
              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswer === opt;
                    
                    // التنسيق الافتراضي قبل الإجابة
                    let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-violet-400 hover:bg-violet-50/30";

                    // التنسيقات عند إظهار النتيجة
                    if (isAnswered) {
                      if (opt === q.correctAnswer) {
                        btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-medium";
                      } else {
                        btnStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, opt)}
                        disabled={isAnswered}
                        className={`w-full text-right p-3 rounded-xl border text-xs leading-relaxed transition-all duration-200 flex items-center justify-between shadow-xs ${btnStyle}`}
                      >
                        <span className="font-semibold">{opt}</span>
                        {isAnswered && opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* الشرح والتوضيح */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1.5 shadow-xs">
                  <span className="font-extrabold text-violet-700 block">الشرح والتوضيح:</span>
                  <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};