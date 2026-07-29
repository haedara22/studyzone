// ============================================================
//  نظام Push Notifications - النسخة الاحترافية
// ============================================================

// ===== التحقق من دعم Push API =====
export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// ===== الحصول على الاشتراك الحالي =====
export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    if (!isPushSupported()) return null;
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('❌ خطأ في الحصول على الاشتراك:', error);
    return null;
  }
};

// ===== طلب إذن Push =====
export const requestPushPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) {
    console.log('⚠️ Push API غير مدعومة');
    return false;
  }

  try {
    // 1. طلب إذن الإشعارات
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('❌ تم رفض إذن الإشعارات');
      return false;
    }

    // 2. تسجيل Service Worker
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker مسجل');
    }

    // 3. التحقق من وجود VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('❌ VAPID_PUBLIC_KEY غير معرف');
      return false;
    }

    // 4. الحصول على الاشتراك
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });

    console.log('✅ Push Subscription:', subscription);

    // 5. حفظ الاشتراك في قاعدة البيانات
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    });

    if (res.ok) {
      console.log('✅ تم حفظ الاشتراك');
      return true;
    } else {
      const error = await res.json();
      console.error('❌ فشل حفظ الاشتراك:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
    return false;
  }
};

// ===== إلغاء الاشتراك =====
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const subscription = await getPushSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // حذف من قاعدة البيانات
      await fetch('/api/push/unsubscribe', { method: 'POST' });
      
      console.log('✅ تم إلغاء الاشتراك');
      return true;
    }
    console.log('ℹ️ لا يوجد اشتراك نشط');
    return false;
  } catch (error) {
    console.error('❌ خطأ في إلغاء الاشتراك:', error);
    return false;
  }
};