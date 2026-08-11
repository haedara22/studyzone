"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Offline Indicator Component
 * يعرض banner في أعلى الشاشة عند انقطاع الإنترنت
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // تحديث الحالة الأولية
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // إخفاء البanner بعد 3 ثوانٍ من عودة الاتصال
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // الاستماع لتغييرات حالة الشبكة
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // إظهار البanner إذا كان offline أو تم إعادة الاتصال مؤخراً
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div
            className={`mx-auto max-w-7xl px-4 py-3 ${
              isOnline
                ? "bg-green-500"
                : "bg-gradient-to-r from-orange-500 to-red-500"
            }`}
          >
            <div className="flex items-center justify-center gap-3 text-white">
              {isOnline ? (
                <>
                  <svg
                    className="w-5 h-5 animate-bounce"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-sm md:text-base">
                    ✅ تم استعادة الاتصال بالإنترنت
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                    />
                  </svg>
                  <span className="font-medium text-sm md:text-base">
                    ⚠️ غير متصل بالإنترنت - يعمل التطبيق في الوضع المحلي
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
