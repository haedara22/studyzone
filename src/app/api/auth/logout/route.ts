import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    
    if (token) {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`DELETE FROM sessions WHERE token = ${token}`;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الخروج" },
      { status: 500 }
    );
  }
}