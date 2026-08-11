"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "48px 32px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto 24px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#1a202c",
                marginBottom: "16px",
              }}
            >
              ⚠️ حدث خطأ غير متوقع
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#718096",
                lineHeight: "1.6",
                marginBottom: "32px",
              }}
            >
              عذراً، واجه التطبيق مشكلة خطيرة. نحن نعمل على حل المشكلة.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={reset}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                🔄 إعادة المحاولة
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  background: "white",
                  color: "#667eea",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "2px solid #667eea",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                🏠 العودة للرئيسية
              </button>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: "8px",
                  textAlign: "right",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#c00",
                    wordBreak: "break-all",
                  }}
                >
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
