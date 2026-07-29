// ============================================================
// Utils - Shared Worker Utilities (Optimized for Production)
// ============================================================

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

/**
 * JSON Response Helper
 */
export function json(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      "Content-Type": "application/json",
    },
  });
}

/**
 * CORS Preflight Handler
 */
export function handleCors(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

/**
 * Extract Safe Error Message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

/**
 * Structured Logger with Timestamps
 */
export function logInfo(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ℹ️ ${message}`, data !== undefined ? data : "");
}

export function logError(message: string, error?: unknown) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${message}`, error !== undefined ? error : "");
}

/**
 * Safe async execution wrapper
 */
export async function safeExecute<T>(
  callback: () => Promise<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: string; rawError?: unknown }
> {
  try {
    const data = await callback();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      rawError: error,
    };
  }
}