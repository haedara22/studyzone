import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

// تحويل File إلى Base64
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const sql = neon(process.env.DATABASE_URL!);
    const userId = decoded.userId;

    // جلب بيانات الصورة من الطلب
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const subject = formData.get('subject') as string || '';
    const topic = formData.get('topic') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: "يرجى اختيار صورة" },
        { status: 400 }
      );
    }

    // التحقق من حجم الصورة (حد أقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت" },
        { status: 400 }
      );
    }

    // التحقق من نوع الصورة
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الصورة غير مدعوم. يرجى استخدام JPEG, PNG, أو WEBP" },
        { status: 400 }
      );
    }

    // تحويل الصورة إلى Base64
    const base64Image = await fileToBase64(file);

    // تخزين الصورة في قاعدة البيانات
    const [result] = await sql`
      INSERT INTO user_images (user_id, image_data, file_name, file_size, file_type, subject, topic)
      VALUES (${userId}, ${base64Image}, ${file.name}, ${file.size}, ${file.type}, ${subject}, ${topic})
      RETURNING id, file_name, file_size, file_type, subject, topic, created_at
    `;

    return NextResponse.json({
      success: true,
      image: {
        id: result.id,
        file_name: result.file_name,
        file_size: result.file_size,
        file_type: result.file_type,
        subject: result.subject,
        topic: result.topic,
        created_at: result.created_at,
      },
      message: "تم رفع الصورة بنجاح"
    });

  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ في رفع الصورة";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}