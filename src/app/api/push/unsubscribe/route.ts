// src/app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM push_subscriptions WHERE user_id = ${decoded.userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}