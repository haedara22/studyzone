import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  order_index: number;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
}

interface SubjectInput {
  name: string;
  icon?: string;
  color?: string;
}

// GET - جلب جميع مواد المستخدم
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const subjects = await sql`
      SELECT 
        s.id,
        s.name,
        s.icon,
        s.color,
        s.order_index,
        COALESCE(p.progress_percentage, 0) as progress,
        COALESCE((SELECT COUNT(*) FROM user_lessons WHERE subject_id = s.id), 0) as total_lessons,
        COALESCE((SELECT COUNT(*) FROM user_lessons WHERE subject_id = s.id AND status = 'completed'), 0) as completed_lessons
      FROM user_subjects s
      LEFT JOIN user_progress p ON s.id = p.subject_id AND p.user_id = ${userId}
      WHERE s.user_id = ${userId}
      ORDER BY s.order_index ASC
    `;

    return NextResponse.json({ subjects });

  } catch (error: unknown) {
    console.error("Error fetching subjects:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في جلب المواد";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - إضافة مادة جديدة
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    // تحديد نوع البيانات القادمة
    const body: SubjectInput = await req.json();
    const { name, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "اسم المادة مطلوب" },
        { status: 400 }
      );
    }

    const [subject] = await sql`
      INSERT INTO user_subjects (user_id, name, icon, color, order_index)
      VALUES (
        ${userId}, 
        ${name}, 
        ${icon || '📚'}, 
        ${color || 'bg-blue-500'},
        (SELECT COALESCE(MAX(order_index), 0) + 1 FROM user_subjects WHERE user_id = ${userId})
      )
      RETURNING id, name, icon, color, order_index
    `;

    // إنشاء تقدم للمادة الجديدة
    await sql`
      INSERT INTO user_progress (user_id, subject_id, progress_percentage)
      VALUES (${userId}, ${subject.id}, 0)
    `;

    return NextResponse.json({
      success: true,
      subject,
      message: "تم إضافة المادة بنجاح"
    });

  } catch (error: unknown) {
    console.error("Error adding subject:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في إضافة المادة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}