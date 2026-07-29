import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// تعريف نوع البيانات القادمة من الـ Request
interface LoginRequest {
  email: string;
  password: string;
}

// تعريف نوع المستخدم من قاعدة البيانات
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  grade: string;
  stream: string;
  status: string;
  deleted_at: string | null;
}

export async function POST(req: NextRequest) {
  try {
    // جلب البيانات مع تحديد النوع
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    // التحقق من وجود البريد وكلمة المرور
    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    // البحث عن المستخدم
    const users = await sql`
      SELECT * FROM users WHERE email = ${email} AND deleted_at IS NULL
    `;
    
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // التحقق من حالة الحساب
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: "الحساب غير نشط. يرجى التواصل مع الدعم" },
        { status: 403 }
      );
    }

    // إنشاء JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // حذف الجلسات القديمة
    await sql`
      DELETE FROM sessions WHERE user_id = ${user.id}
    `;

    // حفظ الجلسة الجديدة
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, NOW() + INTERVAL '7 days')
    `;

    // تحديث آخر تسجيل دخول
    await sql`
      UPDATE users SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    // إعداد الاستجابة
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        stream: user.stream,
      },
    });

    // تعيين الكوكي
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 أيام
      path: "/",
    });

    console.log("✅ Login successful for:", email);
    return response;

  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}