// ============================================================
// Notifications Helper Service (Telegram Only)
// ============================================================

import { neon } from "@neondatabase/serverless";
import type { Env } from "./types";

export interface CreateNotificationParams {
  userId: string;
  taskId?: string;
  title: string;
  body: string;
  type: string;
  url?: string;
}

// ============================================================
// 1. إرسال الرسالة مباشرة إلى Telegram Bot API
// ============================================================
export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const text = `⏰ *${title}*\n\n${body}\n\nبالتوفيق في مذاكرتك! 💪`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("❌ [Telegram] Failed to send message:", error);
    return false;
  }
}

// ============================================================
// 2. إنشاء سجل إشعار جديد في قاعدة البيانات
// ============================================================
export async function createNotification(
  sql: ReturnType<typeof neon>,
  params: CreateNotificationParams
): Promise<string | null> {
  try {
    const result = await sql`
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
        created_at
      )
      VALUES (
        ${params.userId},
        ${params.taskId || null},
        ${params.title},
        ${params.body},
        ${params.type},
        ${params.url || "/planner"},
        'telegram_reminder',
        false,
        false,
        NOW()
      )
      RETURNING id;
    `;

    const rows = result as Record<string, any>[];
    return rows[0]?.id || null;
  } catch (error) {
    console.error("❌ [Notifications] Failed to create db notification record:", error);
    return null;
  }
}

// ============================================================
// 3. تحديث حالة الإشعار الداخلي كـ "مُرسل" وتحديد زمن التسليم
// ============================================================
export async function markNotificationSent(
  sql: ReturnType<typeof neon>,
  notificationId: string
): Promise<void> {
  try {
    await sql`
      UPDATE notifications
      SET 
        sent = true,
        sent_at = NOW(),
        delivered_at = NOW()
      WHERE id = ${notificationId}::uuid;
    `;
  } catch (error) {
    console.error(`❌ [Notifications] Failed to mark notification ${notificationId} as sent:`, error);
  }
}

// ============================================================
// 4. إرسال إشعار التليجرام وجلب telegram_chat_id تلقائياً
// ============================================================
export async function sendTelegramToUser(
  env: Env,
  userId: string,
  title: string,
  body: string
): Promise<boolean> {
  const sql = neon(env.DATABASE_URL);

  try {
    // جلب معرف التليجرام الخاص بالمستخدم
    const users = await sql`
      SELECT telegram_chat_id 
      FROM users 
      WHERE id = ${userId} AND telegram_chat_id IS NOT NULL
    `;

    const rows = users as Record<string, any>[];
    const chatId = rows[0]?.telegram_chat_id;

    if (!chatId) {
      console.log(`ℹ️ [Notifications] User ${userId} has no linked Telegram chat ID.`);
      return false;
    }

    return await sendTelegramNotification(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      title,
      body
    );
  } catch (error) {
    console.error(`❌ [Notifications] Failed to send Telegram to user ${userId}:`, error);
    return false;
  }
}