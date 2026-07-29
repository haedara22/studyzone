// ============================================================
// Service Worker - Study BAC Push & Notification Handler
// ============================================================

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ============================================================
// 1. استقبال إشعار الـ Push
// ============================================================
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};

  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "Study BAC",
      body: event.data.text(),
    };
  }

  const soundEnabled = payload.sound_enabled !== false;
  const targetUrl = payload.data?.url || payload.url || "/planner";

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/badge.png",

    // الصوت والاهتزاز
    silent: !soundEnabled,
    vibrate: soundEnabled ? [200, 100, 200] : [],

    // تفاعل وتكثيف الإشعارات
    requireInteraction: true,
    renotify: true,
    tag: payload.tag || `study-bac-task-${Date.now()}`,

    // بيانات إضافية
    data: {
      url: targetUrl,
      timestamp: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || "Study BAC",
      options
    )
  );
});

// ============================================================
// 2. معالجة الضغط على الإشعار (Notification Click)
// ============================================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/planner";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // البحث عن Tab مفتوح ينتمي إلى نفس النطاق
        for (const client of clientList) {
          const clientPath = new URL(client.url).pathname;

          if ("focus" in client) {
            // إذا كان المستخدم واقفا بالفعل في نفس الصفحة، نركّز على الـ Tab فقط
            if (clientPath === targetUrl) {
              return client.focus();
            }
            // إذا كان في صفحة أخرى داخل التطبيق، نوجهه للرابط المطلوب ونركز عليه
            if ("navigate" in client) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }
        }

        // إذا لم يكن هناك أي Tab مفتوح، نفتح نافذة جديدة بالرابط المطلوب
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});