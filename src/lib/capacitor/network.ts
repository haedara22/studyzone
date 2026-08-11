import React from 'react';
import { Network } from '@capacitor/network';

/**
 * Network Status Manager
 * يدير حالة الاتصال بالإنترنت في التطبيق
 */

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}

class NetworkManager {
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private currentStatus: NetworkStatus = {
    connected: true,
    connectionType: 'unknown',
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // الحصول على الحالة الحالية
    const status = await Network.getStatus();
    this.currentStatus = {
      connected: status.connected,
      connectionType: status.connectionType,
    };

    // الاستماع للتغييرات
    Network.addListener('networkStatusChange', (status) => {
      this.currentStatus = {
        connected: status.connected,
        connectionType: status.connectionType,
      };
      this.notifyListeners();
    });
  }

  /**
   * الحصول على حالة الشبكة الحالية
   */
  public async getStatus(): Promise<NetworkStatus> {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  }

  /**
   * التحقق من الاتصال بالإنترنت
   */
  public isConnected(): boolean {
    return this.currentStatus.connected;
  }

  /**
   * التحقق من نوع الاتصال
   */
  public getConnectionType(): string {
    return this.currentStatus.connectionType;
  }

  /**
   * الاشتراك في تغييرات حالة الشبكة
   */
  public subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    
    // إرجاع دالة لإلغاء الاشتراك
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.currentStatus);
    });
  }
}

// إنشاء instance واحدة
export const networkManager = new NetworkManager();

/**
 * React Hook لاستخدام حالة الشبكة
 */
export function useNetwork() {
  if (typeof window === 'undefined') {
    return {
      connected: true,
      connectionType: 'unknown' as const,
    };
  }

  const [status, setStatus] = React.useState<NetworkStatus>({
    connected: true,
    connectionType: 'unknown',
  });

  React.useEffect(() => {
    // الحصول على الحالة الأولية
    networkManager.getStatus().then(setStatus);

    // الاشتراك في التغييرات
    const unsubscribe = networkManager.subscribe(setStatus);

    return unsubscribe;
  }, []);

  return status;
}
