// ============================================================
// HTTP Routes Handler (Telegram Only)
// ============================================================

import { checkTasksAndSend, sendMorningReminders } from "./scheduler";
import { json } from "./utils";
import type { Env } from "./types";

export async function handleRoutes(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response | null> {
  const url = new URL(request.url);

  // ==========================================================
  // CORS Preflight Handling
  // ==========================================================
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // ==========================================================
  // Test Route - مشغل اختبار لتذكيرات التليجرام يدوياً
  // ==========================================================
  if (url.pathname === "/test" && request.method === "GET") {
    ctx.waitUntil(
      Promise.all([
        checkTasksAndSend(env),
        sendMorningReminders(env),
      ])
    );

    return json({
      success: true,
      message: "Telegram notification check & morning reminders triggered successfully",
    });
  }

  // ==========================================================
  // Health Check - فحص حالة الخادم
  // ==========================================================
  if (url.pathname === "/" && request.method === "GET") {
    return json({
      service: "study-bac-telegram-worker",
      status: "running",
      timestamp: new Date().toISOString(),
    });
  }

  return null;
}