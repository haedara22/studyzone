import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: Request) {
  // حماية الـ Cron عبر Secret Header
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN!;

    // جلب كل الإشعارات المستحقة الآن ولم تُرسل بعد
    const pendingNotifications = await sql`
      SELECT 
        sn.id, 
        sn.title, 
        sn.notification_type, 
        u.telegram_chat_id 
      FROM scheduled_notifications sn
      JOIN users u ON u.id = sn.user_id
      WHERE sn.is_sent = FALSE 
        AND sn.scheduled_at <= NOW()
        AND u.telegram_chat_id IS NOT NULL
    `;

    for (const notification of pendingNotifications) {
      const icon = notification.notification_type === "LESSON" ? "📚" : "☕";
      const message = `${icon} **تنبيه وقت المذاكرة!**\n\nحان الآن موعد: **${notification.title}**\nبالتوفيق والتركيز! 💪`;

      // إرسال الإشعار عبر Telegram Bot API
      const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: notification.telegram_chat_id,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (telegramRes.ok) {
        // تحديث الحالة لمنع إعادة الإرسال
        await sql`
          UPDATE scheduled_notifications 
          SET is_sent = TRUE 
          WHERE id = ${notification.id}
        `;
      }
    }

    return NextResponse.json({ success: true, processed: pendingNotifications.length });
  } catch (error) {
    console.error("Cron Execution Error:", error);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}