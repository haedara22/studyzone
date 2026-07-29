import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, grade, stream } = await req.json() as {
      email: string;
      password: string;
      name: string;
      grade: string;
      stream: string;
    };

    // تحقق من وجود البريد
    const sql = neon(process.env.DATABASE_URL!);
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name, grade, stream)
      VALUES (${email}, ${hashedPassword}, ${name}, ${grade}, ${stream})
      RETURNING id, email, name, grade, stream, created_at
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        stream: user.stream,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}