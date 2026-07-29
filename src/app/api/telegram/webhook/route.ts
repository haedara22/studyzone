import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // التأكد من أن الرسالة تحتوي على نص ومُرسل
    if ((body as any).message && (body as any).message.text) {
      const chatId = (body as any).message.chat.id.toString();
      const text = (body as any).message.text.trim();

      // إذا كانت الرسالة تبدأ بـ /start وتضم توكن الربط
      if (text.startsWith("/start link_")) {
        const linkToken = text.replace("/start ", "").trim();
        const sql = neon(process.env.DATABASE_URL!);

        // البحث عن المستخدم الصاحب لهذا التوكن وتحديث telegram_chat_id
        const users = await sql`
          UPDATE users
          SET telegram_chat_id = ${chatId},
              telegram_link_token = NULL
          WHERE telegram_link_token = ${linkToken}
          RETURNING id, name;
        `;

        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (users.length > 0) {
          const userName = users[0].name || "طالبنا العزيز";
          // إرسال رسالة ترحيبية وتأكيد النجاح على تليجرام
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎉 أهلاً بك يا ${userName}!\n\nتم ربط حسابك بالمنصة بنجاح. ستصلك جميع تنبيهات المهام والمذاكرة هنا فوراً! 🚀`,
            }),
          });
        } else {
          // التوكن غير صالح أو منتهي
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "❌ رمز الربط غير صالح أو تم استخدامه من قبل. يرجى إعادة المحاولة من صفحة الإعدادات في الموقع.",
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: true }); // نرجع 200 دائماً للتليجرام حتى لا يكرر الطلب
  }
}