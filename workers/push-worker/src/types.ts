// ============================================================
// Types - Push Worker Core Type Definitions (Production Ready)
// ============================================================

import { NeonQueryFunction } from "@neondatabase/serverless";

// في ملف src/types.ts
export interface Env {
  DATABASE_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  CRON_SECRET?: string;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  subscription: PushSubscriptionPayload | string;
  endpoint: string;
  p256dh: string;
  auth: string;
  browser?: string | null;
  device?: string | null;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
}

export interface PlannerTask {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time?: string | null;
  duration?: number;
  status: "pending" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  reminder_minutes?: number; // وقت التذكير بالدقائق قبل المهمة
  reminder_sent: boolean;
  reminder_sent_at?: string | null;
  notification_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSubject {
  id: string;
  user_id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  order_index?: number;
}

export interface UserNotificationSettings {
  user_id: string;
  push_enabled: boolean;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string; // e.g., "08:00:00"
  daily_reminder_sent_date?: string | null; // YYYY-MM-DD
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  updated_at?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string; // لدمج/تحديث الإشعارات المتشابهة
  renotify?: boolean;
  data?: Record<string, unknown>;
}