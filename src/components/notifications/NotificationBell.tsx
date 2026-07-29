"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "error";
  url?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/notification.mp3");
      audioRef.current.volume = 0.5;
    }
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (isPlaying || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch(() => console.log("⚠️ تعذر تشغيل الصوت"));
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 1500);
    } catch (error) {
      console.log("⚠️ تعذر تشغيل الصوت:", error);
    }
  }, [isPlaying]);

  const fetchNotifications = useCallback(
    async (isManualTrigger = false) => {
      // منع الطلبات المتداخلة إذا كان هناك طلب حالي يعمل
      if (isFetchingRef.current && !isManualTrigger) return;

      // إلغاء أي طلب سابق لم يكتمل بعد
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      isFetchingRef.current = true;

      // إظهار اللودر فقط عند الفتح أو الضغط اليدوي تجنباً للوميض أثناء التحديث الخلفي
      if (isManualTrigger || notifications.length === 0) {
        setIsLoading(true);
      }

      try {
        // جلب 10 إشعارات فقط في الـ Polling الخلفي لتخفيف الحمل، و50 عند فتح القائمة
        const fetchLimit = isOpen ? 50 : 10;
        const res = await fetch(`/api/notifications?limit=${fetchLimit}`, {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) throw new Error("فشل جلب الإشعارات");

        const data = (await res.json()) as NotificationsResponse;
        if (!isMounted.current) return;

        const newNotifications = data.notifications || [];
        const newUnreadCount = data.unreadCount || 0;

        // تشغيل الصوت وتأثير التنبيه عند وصول إشعار جديد فقط
        if (
          newUnreadCount > lastCountRef.current &&
          newUnreadCount > 0 &&
          document.visibilityState === "visible"
        ) {
          playNotificationSound();
          const bell = document.getElementById("notification-bell");
          if (bell) {
            bell.classList.add("animate-bell");
            setTimeout(() => bell.classList.remove("animate-bell"), 500);
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnreadCount);
        lastCountRef.current = newUnreadCount;
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") return; // إهمال الأخطاء الناتجة عن إيقاف الطلب
        console.error("Error fetching notifications:", err);
        if (isMounted.current) {
          setError("فشل جلب الإشعارات");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          isFetchingRef.current = false;
        }
      }
    },
    [isOpen, notifications.length, playNotificationSound]
  );

  // جلب البيانات عند تغيير حالة فتح/إغلاق القائمة
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen, fetchNotifications]);

  // إعداد الـ Polling الدوري بفترة زمنية آمنة (45 ثانية)
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      if (isMounted.current && document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 45000); // 45 ثانية لتجنب استنزاف قاعدة البيانات والـ Connection Timeouts

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted.current) {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative rounded-full p-2 transition-all duration-300",
          "hover:bg-gray-100 active:scale-95",
          isOpen && "bg-gray-100"
        )}
        aria-label="الإشعارات"
      >
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-lg"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl z-50",
              "right-0 w-[calc(100vw-2rem)] max-w-[380px]",
              "max-h-[calc(100vh-100px)]",
              "md:right-0 md:w-96"
            )}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 p-3 md:p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📬</span>
                <h3 className="font-bold text-gray-800 text-sm md:text-base">
                  الإشعارات
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                    {unreadCount} جديدة
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  تعليم الكل كمقروء
                </button>
              )}
            </div>

            <div className="max-h-[calc(100vh-180px)] overflow-y-auto overscroll-contain p-2 md:p-3">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>❌ {error}</p>
                  <button
                    onClick={() => fetchNotifications(true)}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-5xl">📭</p>
                  <p className="mt-3 text-gray-500 text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      className={cn(
                        "relative cursor-pointer rounded-xl p-3 transition-all hover:bg-gray-50",
                        "border-r-4",
                        !notification.is_read
                          ? "border-r-blue-500 bg-blue-50/30"
                          : "border-r-transparent"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.url) {
                          window.location.href = notification.url;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base",
                            getTypeColor(notification.type)
                          )}
                        >
                          {getTypeIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium text-gray-800 truncate",
                                !notification.is_read && "font-bold"
                              )}
                            >
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="mt-1.5 text-xs text-gray-400">
                            {new Date(notification.created_at).toLocaleString(
                              "ar",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {!notification.is_read && (
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="sticky bottom-0 border-t border-gray-100 bg-gray-50 p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/notifications";
                  }}
                  className="w-full rounded-lg py-2.5 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  عرض جميع الإشعارات
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes bell {
          0%,
          100% {
            transform: rotate(0);
          }
          25% {
            transform: rotate(-15deg);
          }
          75% {
            transform: rotate(15deg);
          }
        }
        .animate-bell {
          animation: bell 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};