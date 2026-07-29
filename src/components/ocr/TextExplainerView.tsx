'use client';

import React from 'react';
import { TextExplanation } from '@/lib/ai-analyzer';
import { Lightbulb, Key, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TextExplainerViewProps {
  data: TextExplanation | null;
  isLoading: boolean;
}

export const TextExplainerView: React.FC<TextExplainerViewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-semibold text-xs">جاري التفكيك والتحليل الشامل للنص واستخراج المفاهيم...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <p className="text-xs font-medium">لا يوجد تحليل متاح حتى الآن. قم بإدخال نص أو استخراجه من صورة للبدء.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* الشرح التبسيطي الرئيسي */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border border-indigo-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 font-extrabold mb-3 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3>الشرح التبسيطي الشامل</h3>
        </div>
        <p className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
          {data.simplifiedExplanation}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* النقاط الرئيسية والملخص */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 font-extrabold text-xs border-b border-slate-200/80 pb-2.5">
            <CheckCircle className="w-4 h-4 text-sky-600" />
            <h3>ملخص الدرس في نقاط</h3>
          </div>
          <ul className="space-y-2.5 pt-1">
            {data.summary.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-slate-700 text-xs leading-relaxed font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* الأفكار الرئيسية */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs border-b border-slate-200/80 pb-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h3>الأفكار والمحاور الأساسية</h3>
          </div>
          <ul className="space-y-2.5 pt-1">
            {data.mainIdeas.map((idea, index) => (
              <li key={index} className="flex items-start gap-2.5 text-slate-700 text-xs leading-relaxed font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* قاموس المفاهيم والمصطلحات */}
      {data.keyTerms && data.keyTerms.length > 0 && (
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xs border-b border-slate-200/80 pb-2.5">
            <Key className="w-4 h-4 text-emerald-600" />
            <h3>قاموس المصطلحات البارزة</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.keyTerms.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1 shadow-2xs hover:border-emerald-300 transition-colors">
                <span className="text-xs font-bold text-emerald-700 block">{item.term}</span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};