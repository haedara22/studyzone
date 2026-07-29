export async function registerPush(userId: string) {
  if (typeof window === "undefined") return;

  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker غير مدعوم");
    return;
  }

  if (!("PushManager" in window)) {
    console.log("Push غير مدعوم");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("تم رفض الإشعارات");
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  await navigator.serviceWorker.ready;

const res = await fetch(
  "https://study-bac-push.study-bac-2026.workers.dev/vapid-public-key"
);
  if (!res.ok) {
    throw new Error("تعذر جلب مفتاح VAPID");
  }

const data = (await res.json()) as {
  publicKey: string;
};

const publicKey = data.publicKey;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey:
      urlBase64ToUint8Array(publicKey) as BufferSource
  });

await fetch(
  "https://study-bac-push.study-bac-2026.workers.dev/subscribe",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: userId,
      subscription
    })
  }
);

  console.log("✅ Push Registered");
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = atob(base64);

  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}