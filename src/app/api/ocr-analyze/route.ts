import { NextResponse } from 'next/server';
import { analyzeTextWithFallback as processAcademicOCR } from '@/lib/ocr-engine';
import { 
  explainAcademicText, 
  generateQuizFromText, 
  generateFlashcardsFromText 
} from '@/lib/ai-analyzer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, text } = body as { action: string; text?: string };

    // التحقق من وجود النص المطلوب للمعالجة
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'النص المطلوب معالجته فارغ أو غير صالح' }, 
        { status: 400 }
      );
    }

    // 1. إجراء تحسين واستخراج OCR
    if (action === 'refine-ocr') {
      const result = await processAcademicOCR(text);
      return NextResponse.json(result);
    }

    // 2. التحليل الشامل (الشرح + الأسئلة + البطاقات) بالتوازي مع نظام Fallback آلي
    if (action === 'analyze') {
      const [explanation, quiz, flashcards] = await Promise.all([
        explainAcademicText(text),
        generateQuizFromText(text),
        generateFlashcardsFromText(text),
      ]);

      return NextResponse.json({
        success: true,
        explanation,
        quiz,
        flashcards,
      });
    }

    return NextResponse.json({ error: 'طلب أو إجراء (action) غير صالح' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Error in OCR API Route:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء معالجة الطلب' }, 
      { status: 500 }
    );
  }
}