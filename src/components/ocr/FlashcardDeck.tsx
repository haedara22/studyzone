'use client';

import React, { useState } from 'react';
import { Flashcard } from '@/lib/ai-analyzer';
import { Layers, ChevronRight, ChevronLeft, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardDeckProps {
  cards: Flashcard[];
  isLoading: boolean;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-semibold text-xs">جاري تحويل النقاط والمصطلحات إلى بطاقات ذاكرة سريعة الحفظ...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <p className="text-xs font-medium">لا توجد بطاقات ذاكرة حالياً. قم بإنشائها عبر خيار التحليل تلقائياً.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* الهيدر والعداد */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
        <span className="flex items-center gap-1.5 font-extrabold text-emerald-700">
          <Layers className="w-4 h-4 text-emerald-600" /> بطاقات التثبيت السريع
        </span>
        <span>
          البطاقة <strong className="text-slate-900 font-extrabold">{currentIndex + 1}</strong> من <strong className="text-slate-700 font-extrabold">{cards.length}</strong>
        </span>
      </div>

      {/* البطاقة التفاعلية */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-64 cursor-pointer perspective-1000"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative w-full h-full rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between items-center text-center shadow-sm hover:shadow-md hover:border-emerald-300 transition-all transform-gpu"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* وجه البطاقة الأمامي */}
          <div className={`w-full flex flex-col items-center justify-center h-full space-y-3.5 ${isFlipped ? 'hidden' : 'flex'}`}>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
              {currentCard.category || 'سؤال / مصطلح'}
            </span>
            <p className="text-base font-bold text-slate-800 leading-relaxed max-w-md">
              {currentCard.front}
            </p>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-2">
              <RotateCw className="w-3.5 h-3.5 text-slate-400" /> انقر على البطاقة لإظهار الإجابة
            </span>
          </div>

          {/* وجه البطاقة الخلفي */}
          <div 
            className={`w-full flex flex-col items-center justify-center h-full space-y-3.5 ${isFlipped ? 'flex' : 'hidden'}`}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs">
              الإجابة / الشرح
            </span>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed max-w-md">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* أزرار التنقل والتحكم */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs hover:shadow-xs font-bold transition-all"
          title="البطاقة السابقة"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 text-xs font-bold shadow-2xs transition-all"
        >
          {isFlipped ? 'إخفاء الإجابة' : 'قلب البطاقة'}
        </button>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs hover:shadow-xs font-bold transition-all"
          title="البطاقة التالية"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};