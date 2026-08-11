import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* 404 Number Animation */}
          <div className="relative">
            <h1 className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-bounce">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4 -mt-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              الصفحة غير موجودة
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link href="/">
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
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              <Link href="/dashboard">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                لوحة التحكم
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground font-semibold mb-4">
              📍 صفحات مفيدة:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/planner"
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📅
                </div>
                <p className="text-sm font-medium">المخطط</p>
              </Link>
              <Link
                href="/subjects"
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📚
                </div>
                <p className="text-sm font-medium">المواد</p>
              </Link>
              <Link
                href="/ocr-tools"
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <p className="text-sm font-medium">أدوات OCR</p>
              </Link>
              <Link
                href="/settings"
                className="p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <p className="text-sm font-medium">الإعدادات</p>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
