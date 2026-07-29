// ============================================================
// Database Service Layer - Neon Postgres (Telegram Integrated)
// ============================================================

import { neon } from "@neondatabase/serverless";
import type { Env } from "./types";

// ============================================================
// إنشاء اتصال قاعدة البيانات
// ============================================================

export function getDatabase(env: Env) {
  return neon(env.DATABASE_URL);
}

// ============================================================
// أنواع البيانات (TypeScript Interfaces)
// ============================================================

export interface UpcomingTaskRow {
  id: string;
  user_id: string;
  title: string;
  priority: string;
  start_time: string;
  date: string;
  subject_name: string;
  reminder_minutes: number;
  telegram_chat_id: string;
}

export interface MorningReminderUserRow {
  user_id: string;
  morning_time: string;
  telegram_chat_id: string;
}

// ============================================================
// جلب معرف Telegram Chat ID للمستخدم
// ============================================================

export async function getUserTelegramChatId(
  env: Env,
  userId: string
): Promise<string | null> {
  const sql = getDatabase(env);

  const result = await sql`
    SELECT telegram_chat_id
    FROM users
    WHERE id = ${userId} AND telegram_chat_id IS NOT NULL
  `;

  const rows = result as Record<string, any>[];
  return rows[0]?.telegram_chat_id || null;
}

// ============================================================
// جلب المهام القريبة المستحقة للتذكير عبر Telegram
// ============================================================

export async function getUpcomingTasks(
  env: Env
): Promise<UpcomingTaskRow[]> {
  const sql = getDatabase(env);

  const result = await sql`
    SELECT
      t.id,
      t.user_id,
      t.title,
      t.priority,
      t.start_time,
      t.date,
      u.telegram_chat_id,
      COALESCE(sub.name, 'بدون مادة') AS subject_name,
      COALESCE(st.reminder_minutes, 5) AS reminder_minutes
    FROM planner_tasks t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN user_notification_settings st ON st.user_id = t.user_id
    LEFT JOIN user_subjects sub ON sub.id = t.subject_id
    WHERE
      t.status = 'pending'
      AND (t.reminder_sent IS NULL OR t.reminder_sent = false)
      AND (st.notifications_enabled IS NULL OR st.notifications_enabled = true)
      AND u.telegram_chat_id IS NOT NULL
      AND (
        (t.date || ' ' || t.start_time)::timestamp AT TIME ZONE 'Asia/Damascus'
        BETWEEN NOW() AND NOW() + (MAKE_INTERVAL(mins => COALESCE(st.reminder_minutes, 5)))
      )
  `;

  return result as unknown as UpcomingTaskRow[];
}

// ============================================================
// تحديث حالة المهمة بعد إرسال التذكير
// ============================================================

export async function markTaskReminderSent(
  env: Env,
  taskId: string,
  notificationId?: string | null
): Promise<void> {
  const sql = getDatabase(env);

  await sql`
    UPDATE planner_tasks
    SET
      reminder_sent = true,
      reminder_sent_at = NOW(),
      notification_id = ${notificationId ? notificationId : null}::uuid,
      updated_at = NOW()
    WHERE id = ${taskId}::uuid
  `;
}

// ============================================================
// جلب المستخدمين المربوطين بتليجرام للتذكير الصباحي
// ============================================================

export async function getMorningReminders(
  env: Env
): Promise<MorningReminderUserRow[]> {
  const sql = getDatabase(env);

  const result = await sql`
    SELECT
      s.user_id,
      u.telegram_chat_id,
      COALESCE(s.morning_reminder_time, '08:00:00')::text AS morning_time
    FROM user_notification_settings s
    JOIN users u ON s.user_id = u.id
    WHERE
      (s.notifications_enabled IS NULL OR s.notifications_enabled = true)
      AND (s.morning_reminder_enabled IS NULL OR s.morning_reminder_enabled = true)
      AND u.telegram_chat_id IS NOT NULL
      AND to_char(COALESCE(s.morning_reminder_time, '08:00:00')::time, 'HH24:MI') = 
          to_char((NOW() AT TIME ZONE 'Asia/Damascus'), 'HH24:MI')
      AND (
        s.daily_reminder_sent_date IS NULL
        OR s.daily_reminder_sent_date < (NOW() AT TIME ZONE 'Asia/Damascus')::date
      )
  `;

  return result as unknown as MorningReminderUserRow[];
}