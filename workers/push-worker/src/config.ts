// ============================================================
// Worker Configuration Constants (Production Ready)
// ============================================================

export const CONFIG = {
  /** النافذة الزمنية بالفترة المقبولة للتذكير المسبق (بالدقائق) */
  notificationWindowMinutes: 5,

  /** الرابط الافتراضي للتوجه إليه عند الضغط على إشعار المهام */
  notificationUrl: "/planner",

  /** الرابط الافتراضي للتوجه إليه عند الضغط على الإشعار الصباحي */
  morningNotificationUrl: "/dashboard",

  /** الأيقونات الافتراضية للإشعارات */
  icon: "/favicon.ico",
  badge: "/favicon.ico",

  /** المنطقة الزمنية الافتراضية للنظام */
  timeZone: "Asia/Damascus",
} as const;

export type WorkerConfig = typeof CONFIG;