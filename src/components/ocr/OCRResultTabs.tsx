'use client';

import React from 'react';
import { FileText, Sparkles, HelpCircle, Layers } from 'lucide-react';

export type ActiveTab = 'extracted' | 'explanation' | 'quiz' | 'flashcards';

interface OCRResultTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  quizCount?: number;
  cardsCount?: number;
}

export const OCRResultTabs: React.FC<OCRResultTabsProps> = ({
  activeTab,
  onTabChange,
  quizCount = 0,
  cardsCount = 0,
}) => {
  const tabs = [
/*{ 
      id: 'extracted', 
      label: 'النص المستخرج', 
      icon: FileText, 
      activeColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },*/
    { 
      id: 'explanation', 
      label: 'الشرح والتحليل', 
      icon: Sparkles, 
      activeColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { 
      id: 'quiz', 
      label: 'الأسئلة', 
      count: quizCount,
      icon: HelpCircle, 
      activeColor: 'text-violet-600',
      badgeBg: 'bg-violet-50 text-violet-700 border-violet-200'
    },
    { 
      id: 'flashcards', 
      label: 'البطاقات', 
      count: cardsCount,
      icon: Layers, 
      activeColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as ActiveTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? tab.activeColor : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            
            {/* عرض العداد فشارة أنيقة ومستقلة */}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${tab.badgeBg}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};