import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

// ✅ ضبط المنطقة الزمنية لسوريا
const TIMEZONE = 'Asia/Damascus';

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface TaskInput {
  subjectId: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TaskUpdateInput {
  taskId: string;
  status?: string;
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
}

// ============================================================
//  GET - جلب المهام والمواد
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    console.log("🔍 [Planner] جلب بيانات المستخدم:", userId);

    // ✅ جلب المواد
    const subjects = await sql`
      SELECT id, name, icon, color 
      FROM user_subjects 
      WHERE user_id = ${userId}
      ORDER BY order_index ASC
    `;

    console.log(`📚 [Planner] المواد (${subjects?.length || 0})`);

    // ✅ جلب المهام مع التاريخ والوقت
    const tasks = await sql`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.date,
        t.start_time,
        t.end_time,
        t.duration,
        t.status,
        t.priority,
        t.subject_id,
        COALESCE(s.name, 'بدون مادة') as subject_name,
        COALESCE(s.icon, '📚') as subject_icon,
        COALESCE(s.color, 'bg-gray-500') as subject_color
      FROM planner_tasks t
      LEFT JOIN user_subjects s ON t.subject_id = s.id
      WHERE t.user_id = ${userId}
      ORDER BY t.date ASC, t.start_time ASC
    `;

    console.log(`📋 [Planner] المهام (${tasks?.length || 0})`);

    return NextResponse.json({
      success: true,
      subjects: Array.isArray(subjects) ? subjects : [],
      tasks: Array.isArray(tasks) ? tasks : [],
    });

  } catch (error) {
    console.error("❌ [Planner] Error fetching:", error);
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { success: false, error: "حدث خطأ في جلب المهام: " + errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================
//  POST - إضافة مهمة جديدة
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body: TaskInput = await req.json();
    const { subjectId, title, description, date, startTime, endTime, priority = 'medium' } = body;

    console.log("📝 [Planner] إضافة مهمة:", { 
      userId, 
      subjectId, 
      title, 
      date, 
      startTime, 
      endTime,
      priority 
    });

    // ✅ التحقق من البيانات المطلوبة
    if (!subjectId || !title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // ✅ التحقق من صحة الوقت
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, error: "صيغة الوقت غير صحيحة. استخدم HH:mm" },
        { status: 400 }
      );
    }

    // ✅ التحقق من وجود المادة
    const subjectCheckResult = await sql`
      SELECT id FROM user_subjects WHERE id = ${subjectId} AND user_id = ${userId}
    `;

    const subjectCheck = Array.isArray(subjectCheckResult) && subjectCheckResult.length > 0 
      ? subjectCheckResult[0] 
      : null;

    if (!subjectCheck) {
      return NextResponse.json(
        { success: false, error: "المادة غير موجودة أو لا تنتمي لك" },
        { status: 400 }
      );
    }

    // ✅ حساب المدة
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const duration = (h2 * 60 + m2) - (h1 * 60 + m1);

    if (duration <= 0) {
      return NextResponse.json(
        { success: false, error: "وقت النهاية يجب أن يكون بعد وقت البداية" },
        { status: 400 }
      );
    }

    // ✅ إضافة المهمة
    const taskResult = await sql`
      INSERT INTO planner_tasks (
        user_id, subject_id, title, description, date, start_time, end_time, duration, priority, status
      )
      VALUES (
        ${userId}, ${subjectId}, ${title}, ${description || ''}, 
        ${date}, ${startTime}, ${endTime}, ${duration}, ${priority}, 'pending'
      )
      RETURNING id, user_id, subject_id, title, description, date, start_time, end_time, duration, status, priority
    `;

    const task = Array.isArray(taskResult) && taskResult.length > 0 ? taskResult[0] : null;

    if (!task) {
      return NextResponse.json(
        { success: false, error: "فشل إضافة المهمة" },
        { status: 500 }
      );
    }

    console.log("✅ [Planner] تم إضافة المهمة:", task.id);

    // ✅ جلب المهمة مع اسم المادة
    const taskWithSubjectResult = await sql`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.date,
        t.start_time,
        t.end_time,
        t.duration,
        t.status,
        t.priority,
        t.subject_id,
        COALESCE(s.name, 'بدون مادة') as subject_name,
        COALESCE(s.icon, '📚') as subject_icon,
        COALESCE(s.color, 'bg-gray-500') as subject_color
      FROM planner_tasks t
      LEFT JOIN user_subjects s ON t.subject_id = s.id
      WHERE t.id = ${task.id}
    `;

    const taskWithSubject = Array.isArray(taskWithSubjectResult) && taskWithSubjectResult.length > 0 
      ? taskWithSubjectResult[0] 
      : null;

    // ✅ ✅ ✅ إنشاء إشعار تلقائي عند إضافة مهمة جديدة
    try {
      const subjectName = taskWithSubject?.subject_name || 'بدون مادة';
      await sql`
        INSERT INTO notifications (user_id, title, body, type, url, created_at)
        VALUES (
          ${userId}, 
          ${'📝 مهمة جديدة: ' + title}, 
          ${`📖 ${subjectName}\n⏱️ ${startTime} - ${endTime}`},
          'success',
          '/planner',
          CURRENT_TIMESTAMP
        )
      `;
      console.log(`✅ [Planner] تم إنشاء إشعار للمهمة الجديدة: ${task.id}`);
    } catch (notifError) {
      console.error('⚠️ [Planner] فشل إنشاء الإشعار:', notifError);
      // لا نوقف العملية إذا فشل الإشعار
    }

    return NextResponse.json({
      success: true,
      task: taskWithSubject || task,
      message: "تم إضافة المهمة بنجاح ✅"
    });

  } catch (error) {
    console.error("❌ [Planner] Error adding task:", error);
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { success: false, error: "حدث خطأ في إضافة المهمة: " + errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================
//  PUT - تحديث مهمة
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body: TaskUpdateInput = await req.json();
    const { taskId, status, title, description, date, startTime, endTime, priority } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "معرف المهمة مطلوب" },
        { status: 400 }
      );
    }

    // ✅ ✅ ✅ التصحيح: التحقق من وجود المهمة أولاً
    const checkResult = await sql`
      SELECT id FROM planner_tasks 
      WHERE id = ${taskId} AND user_id = ${userId}
    `;

    const taskExists = Array.isArray(checkResult) && checkResult.length > 0;

    if (!taskExists) {
      return NextResponse.json(
        { success: false, error: "المهمة غير موجودة" },
        { status: 404 }
      );
    }

    // ✅ بناء الاستعلام باستخدام COALESCE (الأفضل لـ neon)
    const result = await sql`
      UPDATE planner_tasks
      SET 
        status = COALESCE(${status || null}, status),
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        date = COALESCE(${date || null}, date),
        start_time = COALESCE(${startTime || null}, start_time),
        end_time = COALESCE(${endTime || null}, end_time),
        priority = COALESCE(${priority || null}, priority),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId} AND user_id = ${userId}
      RETURNING id
    `;

    const updated = Array.isArray(result) && result.length > 0;

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "فشل تحديث المهمة" },
        { status: 500 }
      );
    }

    console.log(`✅ [Planner] تم تحديث المهمة ${taskId}`);

    return NextResponse.json({
      success: true,
      message: "تم تحديث المهمة بنجاح ✅"
    });

  } catch (error) {
    console.error("❌ [Planner] Error updating task:", error);
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { success: false, error: "حدث خطأ في تحديث المهمة: " + errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================
//  DELETE - حذف مهمة
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "معرف المهمة مطلوب" },
        { status: 400 }
      );
    }

    // ✅ ✅ ✅ التصحيح: التحقق من نجاح الحذف
    const result = await sql`
      DELETE FROM planner_tasks
      WHERE id = ${taskId} AND user_id = ${userId}
      RETURNING id
    `;

    const deleted = Array.isArray(result) && result.length > 0;

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "المهمة غير موجودة" },
        { status: 404 }
      );
    }

    console.log(`🗑️ [Planner] تم حذف المهمة ${taskId}`);

    return NextResponse.json({
      success: true,
      message: "تم حذف المهمة بنجاح 🗑️"
    });

  } catch (error) {
    console.error("❌ [Planner] Error deleting task:", error);
    const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { success: false, error: "حدث خطأ في حذف المهمة: " + errorMessage },
      { status: 500 }
    );
  }
}