import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('تنبيه: GROQ_API_KEY غير معرف في ملف .env.local');
}

export const groq = new OpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://api.groq.com/openai/v1',
});