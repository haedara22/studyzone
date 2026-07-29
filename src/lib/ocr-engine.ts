import { Groq } from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';

// تهيئة العميلين
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export interface TextExplanation {
  simplifiedExplanation: string;
  summary: string[];
  mainIdeas: string[];
  keyTerms: { term: string; definition: string }[];
}

const SYSTEM_PROMPT = `
أنت معلم وباحث خبير في المناهج التعليمية.
قم بتحليل النص المقدم واستخراج المخرجات بتنسيق JSON فقط بالشكل التالي:
{
  "simplifiedExplanation": "شرح تبسيطي وافٍ ومباشر للنص",
  "summary": ["نقطة 1", "نقطة 2"],
  "mainIdeas": ["فكرة 1", "فكرة 2"],
  "keyTerms": [{"term": "المصطلح", "definition": "التوضيح"}]
}
`;

/**
 * دالة التحليل الذكية مع نظام Fallback آلي
 */
export async function analyzeTextWithFallback(text: string): Promise<TextExplanation> {
  const userPrompt = `النص المطلوب تحليله:\n${text}`;

  // 1. المحاولة الأولى باستخدام Groq (Llama 3.3 70b)
  try {
    console.log('⚡ محاولة التحليل عبر Groq (Llama-3.3-70b)...');
    
    const groqResponse = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = groqResponse.choices[0]?.message?.content;
    if (!content) throw new Error('Groq returned empty response');

    return JSON.parse(content) as TextExplanation;

  } catch (groqError: any) {
    console.warn('⚠️ فشل الطلب عبر Groq (تجاوز حدود أو خطأ في السيرفر):', groqError?.message || groqError);
    console.log('🔄 التحويل الآلي الفوري إلى Mistral AI...');

    // 2. المحاولة الثانية (Fallback) باستخدام Mistral AI
    try {
      const mistralResponse = await mistral.chat.complete({
        model: 'mistral-small-latest', // أو mistral-large-latest
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        responseFormat: { type: 'json_object' },
        temperature: 0.3,
      });

      const mistralContent = mistralResponse.choices?.[0]?.message?.content;
      if (!mistralContent || typeof mistralContent !== 'string') {
        throw new Error('Mistral returned empty or invalid response');
      }

      return JSON.parse(mistralContent) as TextExplanation;

    } catch (mistralError: any) {
      console.error('❌ فشل كلا الموردين (Groq & Mistral):', mistralError?.message || mistralError);
      throw new Error('تعذر تحليل النص حالياً. يرجى المحاولة بعد لحظات.');
    }
  }
}