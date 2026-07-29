import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // التحقق من التوكن
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // جلب بيانات المستخدم
    const [user] = await sql`
      SELECT id, email, name, grade, stream, avatar_url
      FROM users
      WHERE id = ${decoded.userId}
        AND deleted_at IS NULL
        AND status = 'active'
    `;

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        grade: user.grade,
        stream: user.stream,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}