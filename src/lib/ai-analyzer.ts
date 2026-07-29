import { groq } from './groq';
import { Mistral } from '@mistralai/mistralai';

// تهيئة عميل Mistral باستخدام مفتاح البيئة
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

export interface TextExplanation {
  summary: string[];
  keyTerms: { term: string; definition: string }[];
  mainIdeas: string[];
  simplifiedExplanation: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

/**
 * دالة مساعدة تنفيذية: تجري الطلب عبر Groq أولاً، وفي حال الفشل تتحول آلياً إلى Mistral
 */
async function executeWithFallback<T>(
  prompt: string,
  temperature: number = 0.3
): Promise<T> {
  // 1. المحاولة الأولى: Groq (Llama 3.3 70B)
  try {
    console.log('⚡ [AI Engine] جاري معالجة الطلب عبر Groq...');
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Groq returned an empty response');

    return JSON.parse(content) as T;
  } catch (groqError: any) {
    console.warn('⚠️ [Groq Fallback Triggered]:', groqError?.message || groqError);
    console.log('🔄 [AI Engine] جاري التحويل الفوري إلى Mistral AI...');

    // 2. المحاولة الثانية (Fallback): Mistral AI (Mistral Small)
    try {
      const mistralResponse = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        responseFormat: { type: 'json_object' },
        temperature,
      });

      const rawContent = mistralResponse.choices?.[0]?.message?.content;
      if (!rawContent || typeof rawContent !== 'string') {
        throw new Error('Mistral returned an empty or invalid payload');
      }

      return JSON.parse(rawContent) as T;
    } catch (mistralError: any) {
      console.error('❌ [AI Engine Error] فشل كلا المزودين (Groq & Mistral):', mistralError?.message || mistralError);
      throw mistralError; // يتم التقاط الخطأ في الدالة الرئيسية للتعامل معه
    }
  }
}

/* ==========================================================================
   1. شرح النص الأكاديمي
   ========================================================================== */
export async function explainAcademicText(text: string): Promise<TextExplanation> {
  const prompt = `أنت أستاذ خبير في المناهج التعليمية والبكالوريا. قم بتحليل النص التالي وإعداده للطالب:

النص:
"""
${text}
"""

المطلوب إرجاع كائن JSON حصراً بالتنسيق التالي وبدون أي نصوص خارجية:
{
  "summary": ["نقطة ملخصة 1", "نقطة 2"],
  "keyTerms": [{"term": "المصطلح", "definition": "الشرح المبسط"}],
  "mainIdeas": ["الفكرة الرئيسية 1", "الفكرة الرئيسية 2"],
  "simplifiedExplanation": "شرح عام ومبسط ومباشر للنص بأسلوب سلس وممتع"
}`;

  try {
    return await executeWithFallback<TextExplanation>(prompt, 0.3);
  } catch (e) {
    return {
      summary: ['تعذر إعداد الملخص التلقائي حالياً.'],
      keyTerms: [],
      mainIdeas: [],
      simplifiedExplanation: 'حدث خطأ أثناء تحليل النص مع المزودين (Groq & Mistral). يرجى إعادة المحاولة.',
    };
  }
}

/* ==========================================================================
   2. توليد الأسئلة والاختبارات
   ========================================================================== */
export async function generateQuizFromText(text: string, count: number = 5): Promise<QuizQuestion[]> {
  const prompt = `قم بتوليد ${count} أسئلة اختبار تفاعلية بناءً على النص التالي.

قواعد صارمة جداً لتوليد الأسئلة:
1. يجب أن تكون جميع الأسئلة حصراً من نوع اختيار من متعدد (Multiple Choice Questions - MCQ).
2. يجب أن يحتوي كل سؤال على 4 خيارات في مصفوفة "options".
3. يجب أن يكون "correctAnswer" مطبقاً تماماً لأحد الخيارات الأربعة المتاحة في "options".
4. حظّر تماماً الأسئلة المقالية أو أسئلة إكمال الفراغ بدون خيارات.

النص:
"""
${text}
"""

أرجع الناتج في كائن JSON حصراً بالتنسيق التالي:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "نص السؤال هنا؟",
      "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      "correctAnswer": "الخيار الثاني",
      "explanation": "شرح سبب اختيار هذه الإجابة وتوضيحها من النص",
      "difficulty": "easy",
      "bloomLevel": "remember"
    }
  ]
}`;

  try {
    const result = await executeWithFallback<{ questions?: QuizQuestion[] } | QuizQuestion[]>(prompt, 0.3);
    
    let rawQuestions: QuizQuestion[] = [];
    if (Array.isArray(result)) {
      rawQuestions = result;
    } else if (result && result.questions) {
      rawQuestions = result.questions;
    }

    // 💡 فلترة أمان إضافية (Sanitization): التأكد من أن كل سؤال يحتوي على خيارات حقيقية
    return rawQuestions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      type: 'mcq',
      question: q.question,
      options: Array.isArray(q.options) && q.options.length >= 2 
        ? q.options 
        : ["نعم", "لا", "غير مذكور بالنص", "جميع ما سبق"],
      correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
      explanation: q.explanation || 'إجابة مبنية على النص الأدبي أعلاه.',
      difficulty: q.difficulty || 'medium',
      bloomLevel: q.bloomLevel || 'understand'
    }));

  } catch (e) {
    console.error('Quiz Generation Error:', e);
    return [];
  }
}
/* ==========================================================================
   3. إنشاء بطاقات الذاكرة (Flashcards)
   ========================================================================== */
export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  const prompt = `استخرج أهم التعاريف والمصطلحات من النص واجعلها بطاقات ذاكرة (Flashcards):

النص:
"""
${text}
"""

أرجع الناتج في كائن JSON يحتوي على مصفوفة باسم "flashcards":
{
  "flashcards": [
    {
      "id": "fc1",
      "front": "المصطلح أو السؤال البارز",
      "back": "التعريف أو الإجابة الدقيقة",
      "category": "تصنيف المادة"
    }
  ]
}`;

  try {
    const result = await executeWithFallback<{ flashcards?: Flashcard[] } | Flashcard[]>(prompt, 0.3);
    if (Array.isArray(result)) return result;
    return result.flashcards || [];
  } catch (e) {
    return [];
  }
}