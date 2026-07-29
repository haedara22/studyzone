import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL!);

// 1. تعريف واجهة البيانات المتوقعة مع دعم المسميين للحقل
interface NotificationSettingsBody {
  notifications_enabled?: boolean;
  reminder_minutes?: number;
  daily_reminder_time?: string | null;
  morning_reminder_time?: string | null; // إضافة المسمى القادم من الفرونت إند
  review_reminder_enabled?: boolean;
  sound_enabled?: boolean;
}

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string };

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await sql`
    SELECT *
    FROM user_notification_settings
    WHERE user_id = ${userId}
  `;

  if (result.length === 0) {
    const created = await sql`
      INSERT INTO user_notification_settings (user_id)
      VALUES (${userId})
      RETURNING *
    `;

    return NextResponse.json(created[0]);
  }

  return NextResponse.json(result[0]);
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await req.json()) as NotificationSettingsBody;

  // 🎯 التقاط الوقت سواء جاء باسم morning_reminder_time أو daily_reminder_time
  const reminderTime = body.morning_reminder_time || body.daily_reminder_time || null;

  // 🛠️ استخدام ON CONFLICT للـ UPSERT لضمان عدم الفشل إذا لم يكن للمستخدم صف مسبقاً
  await sql`
    INSERT INTO user_notification_settings (
      user_id,
      notifications_enabled,
      reminder_minutes,
      daily_reminder_time,
      review_reminder_enabled,
      sound_enabled,
      updated_at
    )
    VALUES (
      ${userId},
      COALESCE(${body.notifications_enabled ?? null}, true),
      COALESCE(${body.reminder_minutes ?? null}, 5),
      ${reminderTime ? `${reminderTime}:00` : "08:00:00"}::time,
      COALESCE(${body.review_reminder_enabled ?? null}, true),
      COALESCE(${body.sound_enabled ?? null}, true),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      notifications_enabled = COALESCE(${body.notifications_enabled ?? null}, user_notification_settings.notifications_enabled, true),
      reminder_minutes = COALESCE(${body.reminder_minutes ?? null}, user_notification_settings.reminder_minutes, 5),
      daily_reminder_time = COALESCE(${reminderTime ? `${reminderTime}:00` : null}::time, user_notification_settings.daily_reminder_time, '08:00:00'::time),
      review_reminder_enabled = COALESCE(${body.review_reminder_enabled ?? null}, user_notification_settings.review_reminder_enabled, true),
      sound_enabled = COALESCE(${body.sound_enabled ?? null}, user_notification_settings.sound_enabled, true),
      updated_at = NOW();
  `;

  return NextResponse.json({
    success: true,
  });
}