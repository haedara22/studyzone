'use client';

import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { ImageUploader } from '@/components/ocr/ImageUploader';
import { TextInputArea } from '@/components/ocr/TextInputArea';
import { OCRResultTabs, ActiveTab } from '@/components/ocr/OCRResultTabs';
import { TextExplainerView } from '@/components/ocr/TextExplainerView';
import { QuizGenerator } from '@/components/ocr/QuizGenerator';
import { FlashcardDeck } from '@/components/ocr/FlashcardDeck';

import { TextExplanation, QuizQuestion, Flashcard } from '@/lib/ai-analyzer';

import { FileText, Image as ImageIcon, Copy, Check, Cpu } from 'lucide-react';

export default function OCRToolsPage() {
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  const [activeTab, setActiveTab] = useState<ActiveTab>('extracted');

  const [extractedText, setExtractedText] = useState('');
  const [explanation, setExplanation] = useState<TextExplanation | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1️⃣ معالجة واستخراج النص من الصورة في متصفح المستخدم (Client-Side) ثم إرسالها لـ Groq للتحسين
  const handleImageSelected = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      // قراءة النص من الصورة مباشرة في متصفح العميل لتجنب مشاكل Server Workers
      const worker = await createWorker('ara+eng');
      const ocrResult = await worker.recognize(base64Image);
      await worker.terminate();

      const rawText = ocrResult.data.text;

      if (!rawText.trim()) {
        throw new Error('لم يتم العثور على نص واضح في الصورة، يرجى رفع صورة أكثر وضوحاً.');
      }

      // إرسال النص الخام لـ Groq للتحسين، التدقيق، وتوليد الشروحات والأسئلة
      const res = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refine-ocr', text: rawText }),
      });

      const data = await res.json();
      if ((data as any).error) throw new Error((data as any).error);

      const refinedText = (data as any).text || rawText;
      setExtractedText(refinedText);

      // تحليل النص تلقائياً عبر Groq بعد الاستخراج
      handleAnalyzeText(refinedText);
    } catch (e: any) {
      console.error('OCR Error:', e);
      alert(e.message || 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2️⃣ معالجة تحليل النص وتوليد الشرح والأسئلة والبطاقات عبر Groq AI
  const handleAnalyzeText = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', text: textToAnalyze }),
      });

      const data = await res.json();
      if ((data as any).error) throw new Error((data as any).error);

      setExplanation((data as any).explanation || null);
      setQuizQuestions((data as any).quiz || []);
      setFlashcards((data as any).flashcards || []);
      setActiveTab('explanation');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      alert(error.message || 'حدث خطأ أثناء تحليل النص.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 dir-rtl font-sans selection:bg-indigo-100 selection:text-indigo-900">
  <div className="max-w-7xl mx-auto space-y-8">
    
    {/* العنونة والتحديث الرئيسي */}
    <div className="text-center space-y-3">
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-sm">
        <Cpu className="w-3.5 h-3.5 text-indigo-600" /> مركز استخراج وتحليل النصوص الأكاديمية (Groq Powered)
      </span>
      <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
        المساعد الذكي لاستخراج النصوص والاختبارات
      </h1>
      <p className="text-xs md:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
        قم بتحويل صور الكتب والملاحظات إلى نصوص دقيقة، واستخرج منها الشروحات الشاملة والأسئلة التفاعلية وبطاقات الحفظ بنقرة واحدة.
      </p>
    </div>

    {/* جسم الصفحة المقسم */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* الجانب الأيمن: أدوات الإدخال */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
        
        {/* أزرار اختيار وضع الإدخال */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setInputMode('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              inputMode === 'image' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> رفع صورة / وثيقة
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              inputMode === 'text' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> إدخال نص مباشر
          </button>
        </div>

        {/* منطقة الإدخال المحددة */}
        <div className="pt-1">
          {inputMode === 'image' ? (
            <ImageUploader onImageSelected={handleImageSelected} isLoading={isProcessing} />
          ) : (
            <TextInputArea onTextSubmit={handleAnalyzeText} isLoading={isAnalyzing} />
          )}
        </div>
      </div>

      {/* الجانب الأيسر: لوحة النتائج والتبويبات */}
      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm min-h-[520px]">
        
        {/* شريط التبويبات */}
        <OCRResultTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          quizCount={quizQuestions.length}
          cardsCount={flashcards.length}
        />

        {/* محتوى التبويب النشط */}
        <div className="pt-2">
          {activeTab === 'extracted' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">النص المستخرج والمدقق بالذكاء الاصطناعي:</span>
                {extractedText && (
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 font-semibold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم النسخ' : 'نسخ النص'}
                  </button>
                )}
              </div>
              
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="سيظهر النص المستخرج والمصحح هنا تلقائياً، ويمكنك تعديله يدوياً..."
                rows={12}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-slate-800 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans resize-none transition"
              />

              {extractedText && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleAnalyzeText(extractedText)}
                    disabled={isAnalyzing}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? 'جاري التحليل عبر Groq...' : 'إعادة تحليل هذا النص واستخراج الأسئلة'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'explanation' && (
            <TextExplainerView data={explanation} isLoading={isAnalyzing} />
          )}

          {activeTab === 'quiz' && (
            <QuizGenerator
              questions={quizQuestions}
              isLoading={isAnalyzing}
              onReGenerate={() => handleAnalyzeText(extractedText)}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardDeck cards={flashcards} isLoading={isAnalyzing} />
          )}
        </div>
      </div>

    </div>
  </div>
</div>
  );
}