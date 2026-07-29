import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

// ✅ تعريف نوع البيانات القادمة في الطلب
interface UpdateTaskBody {
  status?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  priority?: string;
}

// ✅ GET - جلب تفاصيل مهمة
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;
    const taskId = id;

    const [task] = await sql`
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
      WHERE t.id = ${taskId} AND t.user_id = ${userId}
    `;

    if (!task) {
      return NextResponse.json(
        { error: "المهمة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description || '',
        date: task.date,
        startTime: task.start_time,
        endTime: task.end_time,
        duration: task.duration || 0,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        subjectName: task.subject_name,
        subjectIcon: task.subject_icon,
        subjectColor: task.subject_color,
      }
    });

  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب تفاصيل المهمة" },
      { status: 500 }
    );
  }
}

// ✅ PUT - تحديث مهمة
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;
    const taskId = id;

    // ✅ ✅ ✅ التصحيح: تحديد نوع body
    const body = await req.json() as UpdateTaskBody;
    const { status, title, description, startTime, endTime, priority } = body;

    // ✅ التحقق من وجود بيانات للتحديث
    if (!status && !title && !description && !startTime && !endTime && !priority) {
      return NextResponse.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 }
      );
    }

    // ✅ التحقق من وجود المهمة
    const [existingTask] = await sql`
      SELECT id FROM planner_tasks 
      WHERE id = ${taskId} AND user_id = ${userId}
    `;

    if (!existingTask) {
      return NextResponse.json(
        { error: "المهمة غير موجودة" },
        { status: 404 }
      );
    }

    // ✅ ✅ ✅ استخدام COALESCE مع Template Literals
    const result = await sql`
      UPDATE planner_tasks
      SET 
        status = COALESCE(${status || null}, status),
        title = COALESCE(${title || null}, title),
        description = COALESCE(${description || null}, description),
        start_time = COALESCE(${startTime || null}, start_time),
        end_time = COALESCE(${endTime || null}, end_time),
        priority = COALESCE(${priority || null}, priority),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId} AND user_id = ${userId}
      RETURNING *
    `;

    const task = result?.[0] || null;

    if (!task) {
      return NextResponse.json(
        { error: "فشل تحديث المهمة" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث المهمة ✅",
      task
    });

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث المهمة" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - حذف مهمة
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;
    const taskId = id;

    const result = await sql`
      DELETE FROM planner_tasks
      WHERE id = ${taskId} AND user_id = ${userId}
      RETURNING id
    `;

    const deleted = Array.isArray(result) && result.length > 0;

    if (!deleted) {
      return NextResponse.json(
        { error: "المهمة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المهمة بنجاح 🗑️"
    });

  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف المهمة" },
      { status: 500 }
    );
  }
}