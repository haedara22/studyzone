import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup"];
const protectedRoutes = ["/dashboard", "/subjects", "/planner"];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // التحقق من وجود التوكن فقط (بدون التحقق من صحته في Edge)
  const isValid = !!token;

  // إذا كان المستخدم مسجل ويحاول الدخول لصفحات عامة
  if (isValid && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // إذا لم يكن مسجل ويحاول الدخول لصفحات محمية
  if (!isValid && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};