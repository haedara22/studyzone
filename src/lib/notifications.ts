// ============================================================
//  نظام الإشعارات المتكامل
//  يدعم الإشعارات الداخلية (In-App) + الخلفية (Push)
// ============================================================

const WORKER_URL = process.env.NEXT_PUBLIC_PUSH_WORKER_URL || 'https://study-bac-push.workers.dev';

// ============================================================
//  الأنواع
// ============================================================

interface VapidResponse {
  publicKey: string;
}

interface SubscribeResponse {
  success: boolean;
  error?: string;
}

// ============================================================
//  دوال Push Notifications (للخلفية)
// ============================================================

export const getVapidPublicKey = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${WORKER_URL}/vapid-public-key`);
    if (!response.ok) throw new Error('فشل جلب المفتاح');
    const data = await response.json() as VapidResponse;
    return data.publicKey;
  } catch (error) {
    console.error('❌ خطأ في جلب VAPID Public Key:', error);
    return null;
  }
};

export const saveSubscription = async (
  userId: string,
  subscription: PushSubscription
): Promise<boolean> => {
  try {
    const response = await fetch(`${WORKER_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, subscription }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as SubscribeResponse;
      console.error('❌ فشل حفظ الاشتراك:', errorData.error || response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ فشل حفظ الاشتراك:', error);
    return false;
  }
};

export const registerServiceWorker = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Worker غير مدعوم');
      return false;
    }

    console.log('📋 [SW] محاولة تسجيل Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✅ [SW] Service Worker registered successfully');
    console.log('✅ [SW] Scope:', registration.scope);
    
    if (registration.active) {
      console.log('✅ [SW] State:', registration.active.state);
    } else {
      await new Promise<void>((resolve) => {
        if (registration.installing) {
          registration.installing.addEventListener('statechange', () => {
            if (registration.active) {
              console.log('✅ [SW] Activated!');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }
    return true;
  } catch (error) {
    console.error('❌ [SW] فشل تسجيل Service Worker:', error);
    return false;
  }
};

export const setupPushSubscription = async (userId: string): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      console.log('⚠️ Notification API غير مدعومة');
      return false;
    }

    if (Notification.permission === 'denied') {
      console.log('⚠️ الإشعارات مرفوضة');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('⚠️ تم رفض الإشعارات');
        return false;
      }
    }

    const swRegistered = await registerServiceWorker();
    if (!swRegistered) {
      console.log('⚠️ فشل تسجيل Service Worker');
      return false;
    }

    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.log('⚠️ فشل جلب VAPID Public Key');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });

    console.log('✅ Push Subscription created:', subscription.endpoint);

    const saved = await saveSubscription(userId, subscription);
    if (!saved) {
      console.log('⚠️ فشل حفظ الاشتراك');
      return false;
    }

    console.log('✅ تم إعداد Push Subscription بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في إعداد Push Subscription:', error);
    return false;
  }
};

// ============================================================
//  دوال الإشعارات الداخلية (In-App)
// ============================================================

export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('token='));
    if (!tokenCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || payload.id || null;
  } catch (error) {
    console.error('❌ خطأ في جلب userId:', error);
    return null;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  url: string = '/'
): Promise<boolean> => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, type, url }),
    });

    if (!response.ok) {
      console.error('❌ فشل حفظ الإشعار:', await response.text());
      return false;
    }

    console.log(`✅ إشعار محفوظ: ${title}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في حفظ الإشعار:', error);
    return false;
  }
};

// ============================================================
//  دوال الإشعارات المختلفة (تستخدم كلاً من In-App و Push)
// ============================================================

export const notifyDailyReminder = async (tasksCount: number): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const today = new Date().toDateString();
  const key = 'daily_reminder_sent';
  const lastSent = localStorage.getItem(key);

  if (lastSent === today) {
    console.log('⏳ [DailyReminder] تم إرساله اليوم، تخطي');
    return;
  }

  const body = tasksCount === 0
    ? 'يوم جديد فرصة جديدة! حدد أهدافك اليوم 🎯'
    : `📋 لديك ${tasksCount} مهام اليوم\n🎯 حظاً موفقاً!`;

  // ✅ إشعار داخلي (للجرس)
  await createNotification(
    userId,
    '🌅 صباح الخير!',
    body,
    'info',
    '/planner'
  );

  // ✅ إشعار Push (للخلفية) - يتم عبر Worker
  // Worker سيتعامل مع Push تلقائياً

  localStorage.setItem(key, today);
  console.log(`✅ [DailyReminder] تم حفظ الإشعار (${tasksCount} مهام)`);
};

export const notifyTaskReminder = async (
  taskTitle: string,
  subjectName: string,
  minutes: number,
  taskId?: string
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const key = `task_reminder_${taskId || Date.now()}`;
  const lastSent = localStorage.getItem(key);

  if (lastSent) {
    console.log(`⏳ [TaskReminder] تم إرساله لـ "${taskTitle}"، تخطي`);
    return;
  }

  const timeText = minutes === 5 ? 'خمس دقائق' :
    minutes === 10 ? 'عشر دقائق' :
    `${minutes} دقيقة`;

  // ✅ إشعار داخلي (للجرس)
  await createNotification(
    userId,
    `⏰ تنبيه: ${taskTitle}`,
    `📖 ${subjectName}\n⏱️ ستبدأ خلال ${timeText}`,
    'warning',
    '/planner'
  );

  // ✅ إشعار Push (للخلفية) - يتم عبر Worker

  localStorage.setItem(key, Date.now().toString());
  console.log(`✅ [TaskReminder] تم حفظ الإشعار لـ "${taskTitle}" (${minutes} دقائق)`);
};

export const notifyTaskStart = async (
  taskTitle: string,
  subjectName: string,
  taskId?: string
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const key = `task_start_${taskId || Date.now()}`;
  const lastSent = localStorage.getItem(key);

  if (lastSent) {
    console.log(`⏳ [TaskStart] تم إرساله لـ "${taskTitle}"، تخطي`);
    return;
  }

  await createNotification(
    userId,
    `🚀 ابدأ الآن: ${taskTitle}`,
    `📖 ${subjectName}\n⏰ حان وقت البدء!`,
    'success',
    '/planner'
  );

  localStorage.setItem(key, Date.now().toString());
  console.log(`✅ [TaskStart] تم حفظ الإشعار لـ "${taskTitle}"`);
};

export const notifyTaskCompleted = async (taskTitle: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  await createNotification(
    userId,
    `🎉 أحسنت! أكملت "${taskTitle}"`,
    '🌟 استمر بهذا الأداء الرائع!',
    'success',
    '/dashboard'
  );
  console.log(`✅ [TaskCompleted] تم حفظ الإشعار لـ "${taskTitle}"`);
};