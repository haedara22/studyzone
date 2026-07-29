import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

// ✅ تعريف أنواع البيانات
interface CreateNotificationBody {
  userId: string;
  title: string;
  body: string;
  type?: "info" | "warning" | "success" | "error";
  url?: string;
}

interface UpdateNotificationBody {
  notificationId?: string;
  markAll?: boolean;
}

// ============================================================
//  GET - جلب الإشعارات
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ${unreadOnly ? sql`AND is_read = false` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const [unreadCount] = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: parseInt(unreadCount?.count || "0", 10),
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإشعارات" },
      { status: 500 }
    );
  }
}

// ============================================================
//  POST - إنشاء إشعار جديد (يستخدم من الـ Worker)
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateNotificationBody;
    
    const { userId, title, body: message, type = "info", url } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "البيانات ناقصة: userId, title, body مطلوبة" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const [notification] = await sql`
      INSERT INTO notifications (user_id, title, body, type, url, created_at)
      VALUES (${userId}, ${title}, ${message}, ${type}, ${url || '/'}, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الإشعار" },
      { status: 500 }
    );
  }
}

// ============================================================
//  PUT - تحديث حالة الإشعار (تعليم كمقروء)
// ============================================================
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const body = await req.json() as UpdateNotificationBody;
    const { notificationId, markAll } = body;

    // ✅ التحقق من وجود بيانات
    if (!notificationId && !markAll) {
      return NextResponse.json(
        { error: "معرف الإشعار أو markAll مطلوب" },
        { status: 400 }
      );
    }

    if (markAll === true) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE user_id = ${userId}
      `;
    } else if (notificationId) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الإشعارات",
    });
  } catch (error) {
    console.error("❌ Error updating notifications:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث الإشعارات" },
      { status: 500 }
    );
  }
}

// ============================================================
//  DELETE - حذف إشعار
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "معرف الإشعار مطلوب" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM notifications
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: "تم حذف الإشعار",
    });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف الإشعار" },
      { status: 500 }
    );
  }
}