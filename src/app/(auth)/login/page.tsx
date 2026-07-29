"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { registerPush } from "@/lib/push/registerPush";
// تعريف نوع الرد من الـ API
interface LoginResponse {
  success?: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    grade: string;
    stream: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ");
      }

     // ✅ نجاح تسجيل الدخول
console.log("✅ Login successful:", data);

if (data.user?.id) {
  try {
    await registerPush(data.user.id);
  } catch (err) {
    console.error("Push registration failed:", err);
  }
}

// ✅ إعادة التوجيه
router.push("/dashboard");
router.refresh();
      
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center">
      <Container>
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
            <p className="mt-2 text-secondary">
              مرحباً بعودتك! سجل دخولك لمواصلة رحلتك
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري..." : "تسجيل الدخول"}
              </Button>

              <p className="text-center text-sm text-secondary">
                ليس لديك حساب؟{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  أنشئ حساباً
                </Link>
              </p>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}