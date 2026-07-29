import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decoded.userId;

    const sql = neon(process.env.DATABASE_URL!);

    // استعلام يعتمد فقط على الأعمدة الموجودة بالفعل في قاعدة بياناتك
    const subjects = await sql`
      SELECT 
        s.id,
        s.name,
        COALESCE((SELECT COUNT(*)::int FROM user_lessons WHERE subject_id = s.id AND user_id = ${userId}), 0) as total_lessons,
        COALESCE((SELECT COUNT(*)::int FROM user_lessons WHERE subject_id = s.id AND user_id = ${userId} AND status = 'completed'), 0) as completed_lessons
      FROM user_subjects s
      WHERE s.user_id = ${userId}
      ORDER BY s.order_index ASC
    `;

    // تحويل البيانات وإضافة قيم افتراضية حقيقية للخطة لكي لا يتوقف السيرفر
    const formattedSubjects = subjects.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      totalLessons: Number(sub.total_lessons) || 0,
      completedLessons: Number(sub.completed_lessons) || 0,
      targetDays: 7, // مهلة أسبوع افتراضية لكل مادة
      estimatedMinutesPerLesson: 45, // 45 دقيقة لكل درس
      difficulty: "MEDIUM" as const, // درجة صعوبة متوسطة
    }));

    return NextResponse.json({
      subjects: formattedSubjects,
      dailyAvailableHours: 4,
      preferredStartTime: "16:00",
    });

  } catch (error: unknown) {
    console.error("Error fetching study plans:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في جلب بيانات الخطة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}