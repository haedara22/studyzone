import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

// تعريف أنواع البيانات
interface TaskInput {
  title: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  duration?: number;
}

interface TaskUpdateInput {
  task_id: string;
  completed: boolean;
}

// GET - جلب مهام اليوم
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const tasks = await sql`
      SELECT 
        t.id,
        t.title,
        COALESCE(s.name, 'بدون مادة') as subject_name,
        t.start_time,
        t.end_time,
        CASE WHEN t.status = 'completed' THEN true ELSE false END as completed,
        0 as order_index
      FROM planner_tasks t
      LEFT JOIN user_subjects s ON t.subject_id = s.id
      WHERE t.user_id = ${userId} AND t.date = CURRENT_DATE::text
      ORDER BY t.start_time ASC
    `;

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error("Error fetching tasks:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في جلب المهام";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - إضافة مهمة جديدة (بدون إشعار فوري)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body: TaskInput = await req.json();
    const { title, subject_id, start_time, end_time } = body;

    console.log("📝 [Dashboard] إضافة مهمة:", { userId, title, subject_id, start_time, end_time });

    // التحقق من البيانات
    if (!title || !subject_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // ✅ التحقق من صحة الوقت
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json(
        { error: "صيغة الوقت غير صحيحة. استخدم HH:mm" },
        { status: 400 }
      );
    }

    // التحقق من أن المادة مملوكة للمستخدم
    const [subjectCheck] = await sql`
      SELECT id FROM user_subjects WHERE id = ${subject_id} AND user_id = ${userId}
    `;

    if (!subjectCheck) {
      return NextResponse.json(
        { error: "المادة غير موجودة أو لا تنتمي لك" },
        { status: 400 }
      );
    }

    // حساب المدة
    const [h1, m1] = start_time.split(':').map(Number);
    const [h2, m2] = end_time.split(':').map(Number);
    const durationCalc = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (durationCalc <= 0) {
      return NextResponse.json(
        { error: "وقت النهاية يجب أن يكون بعد وقت البداية" },
        { status: 400 }
      );
    }

    // ✅ إضافة المهمة إلى planner_tasks لحساب التذكير لاحقاً من الكرون
    const [task] = await sql`
      INSERT INTO planner_tasks (
        user_id, subject_id, title, description, date, start_time, end_time, duration, priority, status, reminder_sent
      )
      VALUES (
        ${userId}, ${subject_id}, ${title}, '', 
        CURRENT_DATE::text, 
        ${start_time}, 
        ${end_time}, 
        ${durationCalc}, 
        'medium', 
        'pending',
        false
      )
      RETURNING id
    `;

    console.log("✅ [Dashboard] تم إضافة المهمة بنجاح:", task.id);

    return NextResponse.json({
      success: true,
      task_id: task.id,
      message: "تم إضافة المهمة بنجاح ✅"
    });

  } catch (error: unknown) {
    console.error("Error adding task:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في إضافة المهمة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - تحديث حالة المهمة
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body: TaskUpdateInput = await req.json();
    const { task_id, completed } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: "معرف المهمة مطلوب" },
        { status: 400 }
      );
    }

    const newStatus = completed ? 'completed' : 'pending';

    // جلب عنوان المهمة قبل التحديث (للإشعار)
    const [taskInfo] = await sql`
      SELECT title FROM planner_tasks WHERE id = ${task_id} AND user_id = ${userId}
    `;

    // تحديث planner_tasks
    await sql`
      UPDATE planner_tasks
      SET status = ${newStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${task_id} AND user_id = ${userId}
    `;

    // إنشاء إشعار تشجيعي عند إكمال المهمة
    if (completed && taskInfo) {
      try {
        await sql`
          INSERT INTO notifications (user_id, title, body, type, url, created_at)
          VALUES (
            ${userId},
            '🎉 أحسنت! أكملت مهمة',
            ${'📝 ' + taskInfo.title},
            'success',
            '/dashboard',
            CURRENT_TIMESTAMP
          )
        `;
      } catch (notifError) {
        console.error('⚠️ [Dashboard] فشل إنشاء إشعار الإكمال:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      message: completed ? "تم إكمال المهمة ✅" : "تم إلغاء إكمال المهمة"
    });

  } catch (error: unknown) {
    console.error("Error updating task:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في تحديث المهمة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - حذف مهمة
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const task_id = searchParams.get("id");

    if (!task_id) {
      return NextResponse.json(
        { error: "معرف المهمة مطلوب" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM planner_tasks
      WHERE id = ${task_id} AND user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: "تم حذف المهمة بنجاح 🗑️"
    });

  } catch (error: unknown) {
    console.error("Error deleting task:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في حذف المهمة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}