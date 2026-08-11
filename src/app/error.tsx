"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // يمكن إرسال الخطأ لخدمة logging
    console.error("Error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Animated Error Icon */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-20 animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              عذراً، حدث خطأ ما!
            </h1>
            <p className="text-lg text-muted-foreground">
              واجهنا مشكلة غير متوقعة. لا تقلق، فريقنا على علم بالموضوع.
            </p>
          </div>

          {/* Error Details (في وضع التطوير فقط) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-right">
              <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={reset}
              className="w-full sm:w-auto min-w-[200px]"
            >
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              إعادة المحاولة
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full sm:w-auto min-w-[200px]"
            >
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              العودة للرئيسية
            </Button>
          </div>

          {/* Helpful Tips */}
          <div className="pt-8 space-y-4">
            <p className="text-sm text-muted-foreground font-semibold">
              💡 نصائح مفيدة:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-right">
              <div className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                  <span className="font-medium text-sm">تحقق من الاتصال</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  تأكد من اتصالك بالإنترنت
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="font-medium text-sm">تحديث الصفحة</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  جرب تحديث الصفحة (F5)
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="font-medium text-sm">امسح الـ Cache</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  امسح بيانات التطبيق المؤقتة
                </p>
              </div>

              <div className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-sm">انتظر قليلاً</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  قد يكون الخادم مشغولاً
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
