'use client';

import React, { useState } from 'react';
import { Sparkles, Trash2, Copy, Check } from 'lucide-react';

interface TextInputAreaProps {
  onTextSubmit: (text: string) => void;
  isLoading: boolean;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ onTextSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أدخل أو ألصق نص الدرس/الملخص هنا للبدء في التحليل الشامل وتوليد الأسئلة مباشرة..."
          rows={7}
          className="w-full bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm leading-relaxed resize-none transition-all duration-200"
        />
        
        {text && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs transition"
              title="نسخ النص"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setText('')}
              className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shadow-xs transition"
              title="مسح النص"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex gap-4 font-semibold">
          <span>الكلمات: <strong className="text-indigo-600 font-extrabold">{wordCount}</strong></span>
          <span>الحروف: <strong className="text-slate-700 font-extrabold">{charCount}</strong></span>
        </div>

        <button
          onClick={() => text.trim() && onTextSubmit(text)}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isLoading ? 'جاري التحليل...' : 'تحليل النص المباشر'}
        </button>
      </div>
    </div>
  );
};