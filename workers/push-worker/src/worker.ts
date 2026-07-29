import { neon } from "@neondatabase/serverless";
import { sendMorningReminders } from "./scheduler";

export interface Env {
  DATABASE_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  CRON_SECRET?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// ============================================================
// دالة إرسال الرسالة إلى تليجرام المباشرة
// ============================================================
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const messageText = `⏰ *${title}*\n\n${body}\n\nبالتوفيق في مذاكرتك! 💪`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: "Markdown",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("❌ Failed to send Telegram message:", error);
    return false;
  }
}

// ============================================================
// فحص المهام وإرسال التذكيرات عبر Telegram
// ============================================================
async function checkTasksAndSend(env: Env) {
  const sql = neon(env.DATABASE_URL);

  console.log("🔍 [Cron] Checking planner tasks with Asia/Damascus timezone...");

  const tasks = await sql`
    SELECT
      t.id,
      t.user_id,
      t.title,
      t.start_time::text AS start_time,
      t.priority,
      u.telegram_chat_id,
      COALESCE(s_set.reminder_minutes, 5) AS reminder_minutes,
      COALESCE(s.name, 'بدون مادة') AS subject_name
    FROM planner_tasks t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN user_subjects s ON t.subject_id = s.id
    LEFT JOIN user_notification_settings s_set ON t.user_id = s_set.user_id
    WHERE 
      t.status = 'pending'
      AND (t.reminder_sent IS NULL OR t.reminder_sent = false)
      AND (s_set.notifications_enabled IS NULL OR s_set.notifications_enabled = true)
      AND u.telegram_chat_id IS NOT NULL
      -- ⚠️ تم تحويل t.date إلى ::date لمنع خطأ NeonDbError
      AND t.date::date = (NOW() AT TIME ZONE 'Asia/Damascus')::date
      AND (
        EXTRACT(EPOCH FROM (t.start_time::time - (NOW() AT TIME ZONE 'Asia/Damascus')::time)) / 60
      ) BETWEEN 0 AND COALESCE(s_set.reminder_minutes, 5)
  `;

  console.log(`📋 Found ${tasks.length} tasks due for Telegram reminder`);

  for (const task of tasks) {
    try {
      const title = `تذكير بمهمة: ${task.title}`;
      const body = `📚 *المادة:* ${task.subject_name}\n⏱️ *موعد البدء:* ${task.start_time}`;

      // 1) إنشاء السجل الداخلي في قاعدة البيانات (Notifications Log)
      const notification = await sql`
        INSERT INTO notifications (
          user_id,
          task_id,
          title,
          body,
          type,
          url,
          source,
          is_read,
          sent,
          created_at,
          metadata
        )
        VALUES (
          ${task.user_id},
          ${task.id},
          ${title},
          ${body},
          'warning',
          '/planner',
          'telegram_reminder',
          false,
          false,
          NOW(),
          ${JSON.stringify({
            priority: task.priority,
            subject: task.subject_name,
          })}
        )
        RETURNING id
      `;

      const notificationId = notification[0]?.id;

      // 2) إرسال الإشعار عبر Telegram API مباشرة
      const telegramSent = await sendTelegramNotification(
        env.TELEGRAM_BOT_TOKEN,
        task.telegram_chat_id,
        title,
        body
      );

      // 3) تحديث حالة الإشعار
      if (telegramSent && notificationId) {
        await sql`
          UPDATE notifications
          SET sent = true, sent_at = NOW(), delivered_at = NOW()
          WHERE id = ${notificationId}
        `;
      }

      // 4) تعليم المهمة بأن التذكير أُرسل بنجاح
      await sql`
        UPDATE planner_tasks
        SET
          reminder_sent = true,
          reminder_sent_at = NOW(),
          notification_id = ${notificationId || null},
          updated_at = NOW()
        WHERE id = ${task.id}
      `;

      console.log("✅ Telegram Reminder processed for task:", task.title);
    } catch (error) {
      console.error("❌ Task error:", error);
    }
  }

  console.log("✅ Task checking finished successfully.");
}

// ============================================================
// Cloudflare Worker Entry Point
// ============================================================
export default {
  // 1. استقبال الـ Webhook لربط حساب الطالب تلقائياً
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // معالجة طلبات Webhook القادمة من تليجرام عند ضغط الطالب على /start
    if (request.method === "POST" && url.pathname === "/") {
      try {
        const update = (await request.json()) as any;

        if (update?.message?.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text.trim();

          if (text.startsWith("/start")) {
            const parts = text.split(" ");
            const userId = parts[1]; // الـ UUID الخاص بالطالب من رابط Deep Link

            if (userId) {
              const sql = neon(env.DATABASE_URL);

              // ربط رقم الـ chat_id بحساب الطالب
              await sql`
                UPDATE users
                SET telegram_chat_id = ${chatId.toString()}
                WHERE id = ${userId}::uuid
              `;

              await sendTelegramNotification(
                env.TELEGRAM_BOT_TOKEN,
                chatId.toString(),
                "تم ربط الحساب بنجاح! 🎉",
                "أهلاً بك! تم ربط حسابك في المنصة بنجاح، وستصلك تذكيرات دروسك ومهامك هنا قبل 5 دقائق من موعدها. 🚀"
              );
            } else {
              await sendTelegramNotification(
                env.TELEGRAM_BOT_TOKEN,
                chatId.toString(),
                "تنويه",
                "يرجى الضغط على زر 'ربط التليجرام' من داخل حسابك في المنصة لتفعيل الإشعارات."
              );
            }
          }
        }
      } catch (err) {
        console.error("❌ Webhook error:", err);
      }

      return json({ ok: true });
    }

    // اختبار النظام المباشر
    if (url.pathname === "/test" && request.method === "GET") {
      ctx.waitUntil(checkTasksAndSend(env));
      return json({ success: true, message: "Telegram notification check triggered manually" });
    }

    // Health Check
    return json({ service: "study-bac-telegram-worker", status: "running" });
  },

  // 2. المجدول الدوري (Cron Trigger كل دقيقة)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log("⏰ Cron Trigger started");
    ctx.waitUntil(
      Promise.all([
        checkTasksAndSend(env),
        sendMorningReminders(env),
      ])
    );
  },
};