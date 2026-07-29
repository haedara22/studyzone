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
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    console.log("🔍 Dashboard - المستخدم:", userId);

    // 1. جلب بيانات المستخدم
    const [user] = await sql`
      SELECT id, email, name, grade, stream 
      FROM users 
      WHERE id = ${userId}
    `;

    if (!user) {
      return NextResponse.json({ error: "مستخدم غير موجود" }, { status: 404 });
    }

    // 2. جلب مواد المستخدم
    const subjects = await sql`
      SELECT 
        s.id, 
        s.name, 
        s.icon, 
        s.color,
        0 as progress,
        0 as total_lessons,
        0 as completed_lessons
      FROM user_subjects s
      WHERE s.user_id = ${userId}
      ORDER BY s.order_index ASC
    `;

    // 3. جلب مهام اليوم من planner_tasks
    const todayTasks = await sql`
      SELECT 
        t.id,
        t.title,
        COALESCE(s.name, 'بدون مادة') as subject_name,
        t.start_time,
        t.end_time,
        CASE WHEN t.status = 'completed' THEN true ELSE false END as completed
      FROM planner_tasks t
      LEFT JOIN user_subjects s ON t.subject_id = s.id
      WHERE t.user_id = ${userId} 
        AND t.date = CURRENT_DATE::text
      ORDER BY t.start_time ASC
    `;

    console.log(`📋 مهام اليوم (${todayTasks.length})`);

    const tasksWithStatus = todayTasks.map((task: any) => ({
      ...task,
      status: task.completed ? 'completed' : 'pending'
    }));

    // 4. إحصائيات
    const totalSubjects = subjects.length;
    const totalLessons = 0;
    const completedLessons = 0;
    const completionRate = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    // 5. Streak
    let streakDays = 0;
    try {
      const [streak] = await sql`
        SELECT COALESCE(streak_days, 0) as days FROM user_stats WHERE user_id = ${userId}
      `;
      streakDays = streak?.days || 0;
    } catch (e) {}

    // 6. المراجعات المعلقة
    let pendingReviews = 0;
    try {
      const [reviews] = await sql`
        SELECT COUNT(*) as count 
        FROM planner_tasks 
        WHERE user_id = ${userId} 
          AND status != 'completed'
      `;
      pendingReviews = reviews?.count || 0;
    } catch (e) {}

    // 7. ساعات الدراسة اليوم
    let studyHoursToday = 0;
    try {
      const [hours] = await sql`
        SELECT COALESCE(SUM(duration), 0) as hours 
        FROM planner_tasks
        WHERE user_id = ${userId} 
          AND date = CURRENT_DATE::text
          AND status = 'completed'
      `;
      studyHoursToday = Math.round((hours?.hours || 0) / 60 * 10) / 10;
    } catch (e) {}

    const stats = {
      total_subjects: totalSubjects,
      completed_subjects: 0,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      study_hours_today: studyHoursToday,
      study_hours_goal: 6,
      completion_rate: completionRate,
      streak_days: streakDays,
      days_until_exam: 126,
      pending_reviews: pendingReviews
    };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade || 'غير محدد',
        stream: user.stream || 'غير محدد'
      },
      stats,
      subjects: subjects || [],
      todayTasks: tasksWithStatus || []
    });

  } catch (error: any) {
    console.error("❌ Dashboard API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب البيانات: " + (error.message || "خطأ غير معروف") },
      { status: 500 }
    );
  }
}