// ============================================================
//  API التذكيرات - النسخة المحسنة
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface ReminderPostRequest {
  task_id: string;
}

// ===== GET - جلب التذكيرات =====
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    console.log("🔍 [Reminders] جلب التذكيرات للمستخدم:", userId);

    // ✅ جلب المهام القادمة
    const tasks = await sql`
      SELECT 
        t.id,
        t.title,
        COALESCE(s.name, 'بدون مادة') as subject_name,
        t.start_time,
        t.date,
        t.status
      FROM planner_tasks t
      LEFT JOIN user_subjects s ON t.subject_id = s.id
      WHERE t.user_id = ${userId} 
        AND t.status = 'pending'
        AND t.date = CURRENT_DATE::text
      ORDER BY t.start_time ASC
      LIMIT 10
    `;

    console.log(`📋 [Reminders] ${tasks.length} مهام معلقة`);

    // ✅ حساب الوقت المتبقي في JavaScript
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const tasksWithReminders = tasks.map((task: any) => {
      try {
        if (!task.start_time) {
          return { ...task, minutes_until_start: 999, needs_reminder: false };
        }

        const [hours, minutes] = task.start_time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          return { ...task, minutes_until_start: 999, needs_reminder: false };
        }

        const taskMinutes = hours * 60 + minutes;
        const minutesUntilStart = taskMinutes - currentMinutes;
        
        return {
          ...task,
          minutes_until_start: minutesUntilStart,
          needs_reminder: minutesUntilStart <= 5 && minutesUntilStart > 0,
        };
      } catch (error) {
        return { ...task, minutes_until_start: 999, needs_reminder: false };
      }
    });

    const upcomingTasks = tasksWithReminders.filter(
      (task: any) => task.minutes_until_start > 0
    );

    console.log(`📋 [Reminders] ${upcomingTasks.length} مهام قادمة`);

    return NextResponse.json({
      tasks: upcomingTasks,
      reviews: [],
    });

  } catch (error: unknown) {
    console.error("❌ [Reminders] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}

// ===== POST - تسجيل التذكير =====
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body: ReminderPostRequest = await req.json();
    const { task_id } = body;

    if (!task_id) {
      return NextResponse.json({ error: "معرف المهمة مطلوب" }, { status: 400 });
    }

    // ✅ تحديث وقت التذكير
    await sql`
      UPDATE planner_tasks
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ${task_id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("❌ [Reminders] POST Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}