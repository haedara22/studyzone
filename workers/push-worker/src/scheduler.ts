// ============================================================
// Scheduler - Task & Morning Reminders (Telegram Only)
// ============================================================

import { neon } from "@neondatabase/serverless";
import { sendTelegramNotification } from "./telegram";
import type { Env } from "./types";

// ============================================================
// 1. فحص المهام وإرسال التذكير قبل الموعد عبر Telegram
// ============================================================

export async function checkTasksAndSend(env: Env) {
  console.log("📚 [Scheduler] Checking planner tasks for Telegram...");

  const sql = neon(env.DATABASE_URL);

  // استعلام جلب المهام المستحقة للتذكير
  const tasks = await sql`
    SELECT
      t.id,
      t.user_id,
      t.title,
      t.start_time::text AS start_time,
      u.telegram_chat_id,
      COALESCE(s.reminder_minutes, 5) AS reminder_mins
    FROM planner_tasks t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN user_notification_settings s ON s.user_id = t.user_id
    WHERE
      t.status = 'pending'
      AND (t.reminder_sent IS NULL OR t.reminder_sent = false)
      AND (s.notifications_enabled IS NULL OR s.notifications_enabled = true)
      AND u.telegram_chat_id IS NOT NULL
      AND t.date::date = (NOW() AT TIME ZONE 'Asia/Damascus')::date
      AND (
        EXTRACT(EPOCH FROM (t.start_time::time - (NOW() AT TIME ZONE 'Asia/Damascus')::time)) / 60
      ) BETWEEN 0 AND COALESCE(s.reminder_minutes, 5)
  `;

  console.log(`📋 [Scheduler] Found ${tasks.length} tasks needing Telegram reminder.`);

  for (const task of tasks) {
    try {
      const title = "⏰ تذكير بمهمة قادمة";
      const body = `📌 *المهمة:* ${task.title}\n⏱️ *الموعد:* ${task.start_time}`;

      // 1. إنشاء سجل الإشعار الداخلي
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
          created_at
        )
        VALUES (
          ${task.user_id},
          ${task.id},
          ${title},
          ${body},
          'task_reminder',
          '/planner',
          'telegram_reminder',
          false,
          false,
          NOW()
        )
        RETURNING id;
      `;

      const notificationId = notification[0]?.id;

      // 2. إرسال الرسالة عبر بوت التليجرام
      const telegramSuccess = await sendTelegramNotification(
        env.TELEGRAM_BOT_TOKEN,
        task.telegram_chat_id,
        title,
        body
      );

      // 3. تحديث حالة الإشعار
      if (notificationId && telegramSuccess) {
        await sql`
          UPDATE notifications
          SET sent = true, sent_at = NOW(), delivered_at = NOW()
          WHERE id = ${notificationId};
        `;
      }

      // 4. تحديث المهمة لمنع تكرار التنبيه
      await sql`
        UPDATE planner_tasks
        SET
          reminder_sent = true,
          reminder_sent_at = NOW(),
          notification_id = ${notificationId ? notificationId : null}::uuid,
          updated_at = NOW()
        WHERE id = ${task.id}::uuid;
      `;

      console.log(`✅ [Scheduler] Telegram reminder sent for task ID: ${task.id}`);
    } catch (error) {
      console.error(`❌ [Scheduler] Task reminder error for task ID ${task.id}:`, error);
    }
  }
}

// ============================================================
// 2. التذكير الصباحي عبر Telegram
// ============================================================

export async function sendMorningReminders(env: Env) {
  console.log("🌅 [Scheduler] Checking morning reminders for Telegram...");

  const sql = neon(env.DATABASE_URL);

  // 1. جلب الوقت الحالي بدقة في دمشق
  const [{ damascus_now, damascus_time }] = await sql`
    SELECT 
      (NOW() AT TIME ZONE 'Asia/Damascus')::text AS damascus_now,
      to_char((NOW() AT TIME ZONE 'Asia/Damascus'), 'HH24:MI') AS damascus_time;
  `;

  console.log(`⏱️ [Scheduler] Current Damascus Time: ${damascus_time} (Full: ${damascus_now})`);

  // 2. استعلام المطابقة المرن (يشمل الدقيقة الحالية والدقيقة السابقة لتفادي تأخير الـ Cron)
  const users = await sql`
    SELECT 
      s.user_id,
      u.telegram_chat_id,
      s.daily_reminder_time::text AS morning_time
    FROM user_notification_settings s
    JOIN users u ON s.user_id = u.id
    WHERE
      (s.notifications_enabled IS NULL OR s.notifications_enabled = true)
      AND u.telegram_chat_id IS NOT NULL
      AND to_char(COALESCE(s.daily_reminder_time, '08:00:00')::time, 'HH24:MI') IN (
        to_char((NOW() AT TIME ZONE 'Asia/Damascus'), 'HH24:MI'),
        to_char((NOW() AT TIME ZONE 'Asia/Damascus') - INTERVAL '1 minute', 'HH24:MI')
      )
      AND (
        s.daily_reminder_sent_date IS NULL
        OR s.daily_reminder_sent_date < (NOW() AT TIME ZONE 'Asia/Damascus')::date
      )
  `;

  console.log(`🌅 [Scheduler] Found ${users.length} users due for Telegram morning reminder.`);

  for (const user of users) {
    try {
      // قفل فوري لمنع تكرار الإرسال في نفس اليوم (تم استخدام ::date لتطابق نوع DATE في الداتابيز)
      const lockResult = await sql`
        UPDATE user_notification_settings
        SET
          daily_reminder_sent_date = (NOW() AT TIME ZONE 'Asia/Damascus')::date,
          updated_at = NOW()
        WHERE
          user_id = ${user.user_id}
          AND (
            daily_reminder_sent_date IS NULL
            OR daily_reminder_sent_date < (NOW() AT TIME ZONE 'Asia/Damascus')::date
          )
        RETURNING user_id;
      `;

      if (lockResult.length === 0) {
        continue;
      }

      // جلب عدد مهام اليوم المتبقية
      const [tasksToday] = await sql`
        SELECT COUNT(*)::int AS count
        FROM planner_tasks
        WHERE 
          user_id = ${user.user_id}
          AND date::date = (NOW() AT TIME ZONE 'Asia/Damascus')::date
          AND status = 'pending';
      `;

      const taskCount = tasksToday?.count || 0;
      const bodyText = taskCount > 0
        ? `صباح الخير! ☀️ لديك اليوم *${taskCount} مهام* دراسية مجدولة.\n\nتأكد من مراجعة المخطط وشد حيلك! 🚀`
        : "صباح الخير! ☀️ لا يوجد لديك مهام مجدولة لليوم. استغل الوقت في المراجعة أو تنظيم جدولك القادم 🚀";

      const title = "🌅 التذكير الصباحي للمذاكرة";

      // 1. إنشاء السجل الداخلي
      const notification = await sql`
        INSERT INTO notifications (
          user_id,
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
          ${user.user_id},
          ${title},
          ${bodyText},
          'morning_reminder',
          '/planner',
          'telegram_reminder',
          false,
          false,
          NOW()
        )
        RETURNING id;
      `;

      const notificationId = notification[0]?.id;

      // 2. إرسال الرسالة للتليجرام
      const telegramSuccess = await sendTelegramNotification(
        env.TELEGRAM_BOT_TOKEN,
        user.telegram_chat_id,
        title,
        bodyText
      );

      // 3. تحديث حالة السجل
      if (notificationId && telegramSuccess) {
        await sql`
          UPDATE notifications
          SET sent = true, sent_at = NOW(), delivered_at = NOW()
          WHERE id = ${notificationId};
        `;
      }

      console.log(`✅ [Scheduler] Telegram morning reminder sent to user: ${user.user_id}`);
    } catch (error) {
      console.error(`❌ [Scheduler] Morning reminder error for user ${user.user_id}:`, error);
    }
  }
}