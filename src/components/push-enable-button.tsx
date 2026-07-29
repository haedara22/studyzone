"use client";

import { useState, useEffect } from "react";
import { requestPushPermission, isPushSupported, getPushSubscription } from "@/lib/push";

export const PushEnableButton = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isPushSupported());
    const checkSubscription = async () => {
      const subscription = await getPushSubscription();
      setIsEnabled(!!subscription);
    };
    checkSubscription();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const result = await requestPushPermission();
    setIsEnabled(result);
    setLoading(false);
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500">
        ⚠️ Push API غير مدعومة في هذا المتصفح
      </div>
    );
  }

  if (isEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-green-700">
        <span>✅</span>
        <span>الإشعارات الخلفية مفعلة</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={loading}
      className="rounded-xl bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
    >
      {loading ? 'جاري...' : '🔔 تفعيل الإشعارات الخلفية'}
    </button>
  );
};