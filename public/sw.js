// ============================================================
// Service Worker - Study BAC Push & Offline Support
// ============================================================

const CACHE_NAME = "study-bac-v1";
const OFFLINE_URL = "/offline.html";

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.svg",
];

// ============================================================
// Install Event - تثبيت وتخزين الملفات الأساسية
// ============================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Failed to cache some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// ============================================================
// Activate Event - تنظيف الـ caches القديمة
// ============================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// ============================================================
// Fetch Event - استراتيجية Network First مع Fallback
// ============================================================
self.addEventListener("fetch", (event) => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // تجاهل طلبات API للـ write operations
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") && 
    (event.request.method === "POST" || 
     event.request.method === "PUT" || 
     event.request.method === "DELETE")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // حفظ النسخة في الـ cache إذا كانت ناجحة
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // عند فشل الشبكة، جرب الـ cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // إذا كان طلب navigation (صفحة)، أرجع صفحة offline
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }

          // في حالة الفشل التام، أرجع استجابة فارغة
          return new Response("Offline - Content not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
      })
  );
});

// ============================================================
// استقبال إشعار الـ Push
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
    self.registration.showNotification(payload.title || "Study BAC", options)
  );
});

// ============================================================
// معالجة الضغط على الإشعار (Notification Click)
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