import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userId?: string };
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "Stu66bot";

    // ✅ التعديل هنا: إرسال userId مباشرة في التليجرام
    const telegramUrl = `https://t.me/${botUsername}?start=${userId}`;

    return NextResponse.json({ telegramUrl });
  } catch (error) {
    console.error("Error generating Telegram link:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}