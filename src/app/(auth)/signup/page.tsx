"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

// تعريف نوع البيانات
interface SignupData {
  name: string;
  email: string;
  password: string;
  grade: string;
  stream: string;
}

// تعريف نوع الرد من الـ API
interface SignupResponse {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    grade: string;
    stream: string;
    created_at: string;
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    grade: "",
    stream: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: SignupResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center py-12">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
            <p className="mt-2 text-secondary">
              ابدأ رحلتك نحو البكالوريا بخطة ذكية
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  المستوى الدراسي
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                >
                  <option value="">اختر المستوى</option>
                  <option value="الثانية ثانوي">الثانية ثانوي</option>
                  <option value="الأولى ثانوي">الأولى ثانوي</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  الشعبة
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.stream}
                  onChange={(e) =>
                    setFormData({ ...formData, stream: e.target.value })
                  }
                >
                  <option value="">اختر الشعبة</option>
                  <option value="علمي">علمي</option>
                  <option value="أدبي">أدبي</option>
                  <option value="رياضي">رياضي</option>
                  <option value="تسيير">تسيير</option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري..." : "إنشاء الحساب"}
              </Button>

              <p className="text-center text-sm text-secondary">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-primary hover:underline">
                  سجل دخولك
                </Link>
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}