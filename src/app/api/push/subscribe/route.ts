// src/app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

// ✅ تعريف نوع البيانات القادمة
interface PushSubscriptionInput {
  subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const sql = neon(process.env.DATABASE_URL!);
    
    // ✅ تحديد نوع البيانات
    const body: PushSubscriptionInput = await req.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json({ error: "الاشتراك مطلوب" }, { status: 400 });
    }

    await sql`
      INSERT INTO push_subscriptions (user_id, subscription)
      VALUES (${decoded.userId}, ${JSON.stringify(subscription)})
      ON CONFLICT (user_id) 
      DO UPDATE SET subscription = EXCLUDED.subscription, updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}