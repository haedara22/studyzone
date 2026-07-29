"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/layout/container";
import { motion } from "framer-motion";

interface Settings {
  notifications_enabled: boolean;
  reminder_minutes: number;
  morning_reminder_time: string;
  review_reminder_enabled: boolean;
  sound_enabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications_enabled: true,
    reminder_minutes: 5,
    morning_reminder_time: "08:00",
    review_reminder_enabled: true,
    sound_enabled: true,
  });

  const [telegramConnected, setTelegramConnected] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ فحص حالة التليجرام وجلب ID المستخدم
  const checkTelegramStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const userData = await res.json();
        const id = (userData as any).id || (userData as any).user?.id || (userData as any).user_id;
        setUserId(id);

        if ((userData as any).telegram_chat_id || (userData as any).user?.telegram_chat_id) {
          setTelegramConnected(true);
        } else {
          setTelegramConnected(false);
        }
      }
    } catch (err) {
      console.error("Error checking user status:", err);
    }
  }, []);

  // ✅ إعادة فحص حالة الربط عند العودة للشاشة
  useEffect(() => {
    const handleFocus = () => {
      checkTelegramStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkTelegramStatus]);

  // ✅ جلب الإعدادات عند التحميل
  useEffect(() => {
    const fetchInitialData = async () => {
      await checkTelegramStatus();
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            notifications_enabled: (data as any).notifications_enabled ?? true,
            reminder_minutes: (data as any).reminder_minutes ?? 5,
            morning_reminder_time: (data as any).morning_reminder_time ?? (data as any).daily_reminder_time ?? "08:00",
            review_reminder_enabled: (data as any).review_reminder_enabled ?? true,
            sound_enabled: (data as any).sound_enabled ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [checkTelegramStatus]);

  const handleConnectTelegram = async () => {
    if (!userId) {
      alert("❌ يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
      const res = await fetch("/api/telegram/generate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = (await res.json()) as { telegramUrl?: string; error?: string };

      if (data.telegramUrl) {
        window.open(data.telegramUrl, "_blank");
      } else {
        alert(`❌ ${data.error || "حدث خطأ أثناء إنشاء رابط الربط"}`);
      }
    } catch (error) {
      console.error("Telegram Connection Error:", error);
      alert("❌ تعذر الاتصال بالسيرفر");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("✅ تم حفظ الإعدادات بنجاح");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ حدث خطأ في حفظ الإعدادات");
      }
    } catch {
      setMessage("❌ حدث خطأ في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-secondary">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold">⚙️ الإعدادات</h1>
          <p className="mt-2 text-secondary">خصص تجربتك وتنبيهاتك</p>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              
              {/* ✅ قسم ربط التليجرام التفاعلي */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-medium">✈️ تنبيهات تليجرام</h3>
                  <p className="text-sm text-secondary">
                    {telegramConnected 
                      ? "✅ حسابك مرتبط بالتليجرام وتصلك التنبيهات" 
                      : "استلام التنبيهات فوراً عبر بوت التليجرام"}
                  </p>
                </div>

                {telegramConnected ? (
                  <span className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                    ✅ تم الربط بنجاح
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    className="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 transition-colors"
                  >
                    🔗 ربط تليجرام
                  </button>
                )}
              </div>

              {/* 🌅 قسم التذكير الصباحي (الجديد) */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">🌅 التذكير الصباحي اليومي</h3>
                    <p className="text-sm text-secondary">
                      إرسال ملخص بمهامك ودروسك اليومية كل صباح
                    </p>
                  </div>
                  <input
                    type="time"
                    value={settings.morning_reminder_time || "08:00"}
                    onChange={(e) =>
                      setSettings({ ...settings, morning_reminder_time: e.target.value })
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* ⏰ قسم تذكير قبل المهمة */}
              <div>
                <h3 className="font-medium">⏰ تذكير قبل المهمة</h3>
                <p className="text-sm text-secondary">عدد الدقائق قبل بدء المهمة</p>
                <select
                  value={settings.reminder_minutes ?? 5}
                  onChange={(e) =>
                    setSettings({ ...settings, reminder_minutes: parseInt(e.target.value) })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="5">5 دقائق قبل الموعد</option>
                  <option value="10">10 دقائق قبل الموعد</option>
                  <option value="15">15 دقيقة قبل الموعد</option>
                  <option value="30">30 دقيقة قبل الموعد</option>
                </select>
              </div>

              {message && (
                <div className={`rounded-lg p-3 text-center ${
                  message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {saving ? "جاري الحفظ..." : "💾 حفظ الإعدادات"}
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}