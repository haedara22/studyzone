"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// تعريف نوع المستخدم
interface User {
  id: string;
  email: string;
  name: string;
  grade: string;
  stream: string;
}

// تعريف نوع الرد من API
interface MeResponse {
  user: User | null;
}

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // التحقق من حالة المستخدم
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data: MeResponse = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/#features", label: "المميزات" },
    { href: "/#how-it-works", label: "كيف يعمل" },
  ];

  const protectedLinks = [
    { href: "/dashboard", label: "لوحة التحكم" },
    { href: "/subjects", label: "المواد" },
    { href: "/planner", label: "المخطط" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">ب</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Study Bac
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden items-center gap-6 md:flex">
            {user ? (
              <>
                {protectedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href
                        ? "text-primary"
                        : "text-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <span className="hidden text-sm font-medium lg:block">
                        {user.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="hidden md:flex"
                    >
                      تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <div className="hidden items-center gap-3 md:flex">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        تسجيل الدخول
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="bg-primary hover:bg-primary-dark">
                        إنشاء حساب
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="flex flex-col gap-1 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={cn(
                  "h-0.5 w-6 bg-foreground transition-all",
                  isMenuOpen && "translate-y-1.5 rotate-45"
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-6 bg-foreground transition-all",
                  isMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-6 bg-foreground transition-all",
                  isMenuOpen && "-translate-y-1.5 -rotate-45"
                )}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <div className="flex flex-col space-y-2 px-4">
              {user ? (
                <>
                  {protectedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-100",
                        pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-secondary"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="my-2 border-t border-gray-100" />
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="rounded-lg px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 text-right"
                  >
                    🚪 تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-100",
                        pathname === link.href
                          ? "text-primary bg-primary/5"
                          : "text-secondary"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="my-2 border-t border-gray-100" />
                  
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-3 text-base font-medium text-primary transition-colors hover:bg-gray-50 active:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🔑 تسجيل الدخول
                  </Link>
                  
                  <Link
                    href="/signup"
                    className="rounded-lg bg-primary px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-primary-dark active:bg-primary-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ✨ إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};