import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";
interface ScheduleSlot {
  id?: string;
  title: string;
  type?: "LESSON" | "BREAK";
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  subjectId?: string;
  subject_id?: string;
}

interface SaveScheduleRequestBody {
  slots: ScheduleSlot[];
  date: string;
}
// GET: جلب خطة اليوم والمواعيد المجدولة
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = String(decoded.userId);
    const sql = neon(process.env.DATABASE_URL!);

    // جلب المهام والأنشطة الخاصة باليوم الحالي بتوقيت الشام
    const rows = await sql`
      SELECT 
        id, 
        title, 
        subject_id,
        duration,
        start_time::text AS "startTime",
        end_time::text AS "endTime"
      FROM planner_tasks
      WHERE user_id = ${userId}::uuid
        AND date::date = (NOW() AT TIME ZONE 'Asia/Damascus')::date
      ORDER BY start_time ASC
    `;

    if (rows.length === 0) {
      return NextResponse.json({ hasActivePlan: false, slots: [] });
    }

    const slots = rows.map((row: any) => {
      const timeMatch = row.startTime.match(/(\d{2}:\d{2})/);
      const startTime = timeMatch ? timeMatch[1] : "16:00";

      const endTimeMatch = row.endTime ? row.endTime.match(/(\d{2}:\d{2})/) : null;
      
      const isBreak = row.title.startsWith("☕");
      const durationMinutes = row.duration || (isBreak ? 10 : 45);

      let endTime = endTimeMatch ? endTimeMatch[1] : "";
      if (!endTime) {
        const [h, m] = startTime.split(":").map(Number);
        const startMins = h * 60 + m;
        const endMins = startMins + durationMinutes;
        const endH = String(Math.floor(endMins / 60) % 24).padStart(2, "0");
        const endM = String(endMins % 60).padStart(2, "0");
        endTime = `${endH}:${endM}`;
      }

      return {
        id: row.id,
        title: row.title,
        subjectId: row.subject_id,
        type: isBreak ? "BREAK" : "LESSON",
        startTime,
        endTime,
        durationMinutes,
      };
    });

    const startTime = slots[0]?.startTime || "16:00";

    return NextResponse.json({ 
      hasActivePlan: true, 
      slots,
      preferredStartTime: startTime,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "خطأ في جلب الخطة" }, { status: 500 });
  }
}

// POST: حفظ الخطة وتحويلها إلى planner_tasks ليتلتقطها الـ Push Worker أوتوماتيكياً
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = String(decoded.userId);
    const { slots, date }: SaveScheduleRequestBody = await req.json();

    const sql = neon(process.env.DATABASE_URL!);

    // جلب أول مادة خاصة بالمستخدم لاستخدامها كـ Fallback للأنشطة العامة أو الاستراحات
    const defaultSubjects = await sql`
      SELECT id FROM user_subjects WHERE user_id = ${userId}::uuid LIMIT 1
    `;
    const fallbackSubjectId = defaultSubjects[0]?.id || null;

    // 1. تنظيف خطة اليوم السابقة لمنع التكرار
    await sql`
      DELETE FROM planner_tasks 
      WHERE user_id = ${userId}::uuid 
        AND date::date = ${date}::date
    `;

    // 2. إدخال كتل الخطة مع duration و end_time
    for (const slot of slots) {
      const isBreak = slot.type === "BREAK";
      const taskTitle = isBreak ? `☕ استراحة: ${slot.title}` : `📚 ${slot.title}`;
      const targetSubjectId = slot.subjectId || slot.subject_id || fallbackSubjectId;
      const durationMinutes = slot.durationMinutes || (isBreak ? 10 : 45);

      // حساب وقت النهاية
      let calculatedEndTime = slot.endTime;
      if (!calculatedEndTime) {
        const [h, m] = slot.startTime.split(":").map(Number);
        const totalEndMins = h * 60 + m + durationMinutes;
        const endH = String(Math.floor(totalEndMins / 60) % 24).padStart(2, "0");
        const endM = String(totalEndMins % 60).padStart(2, "0");
        calculatedEndTime = `${endH}:${endM}`;
      }

      await sql`
        INSERT INTO planner_tasks (
          user_id,
          subject_id,
          title,
          start_time,
          end_time,
          duration,
          date,
          status,
          reminder_sent,
          created_at,
          updated_at
        )
        VALUES (
          ${userId}::uuid,
          ${targetSubjectId}::uuid,
          ${taskTitle},
          ${slot.startTime}::time,
          ${calculatedEndTime}::time,
          ${durationMinutes}::integer,
          ${date}::date,
          'pending',
          false,
          NOW(),
          NOW()
        )
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم حفظ الخطة وجدولتها بنجاح لتوصلك الإشعارات على تلجرام" 
    });
  } catch (error) {
    console.error("Error saving schedule to planner_tasks:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ وجدولة الخطة" }, { status: 500 });
  }
}

// DELETE: مسح خطة اليوم
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = String(decoded.userId);
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM planner_tasks 
      WHERE user_id = ${userId}::uuid 
        AND date::date = (NOW() AT TIME ZONE 'Asia/Damascus')::date
    `;

    return NextResponse.json({ success: true, message: "تم مسح الخطة بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "فشل في مسح الخطة" }, { status: 500 });
  }
}