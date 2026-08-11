import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studybac.app',
  appName: 'Study Bac',
  webDir: '.open-next/assets',
  
  // ✅ Production server URL - Android app will load from Cloudflare Workers
  server: {
    url: 'https://student.giath-motors.workers.dev',
    cleartext: false,
    androidScheme: 'https',
    // ✅ Allow navigation to local content when offline
    allowNavigation: ['*'],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2563EB",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    // ✅ تفعيل CapacitorHttp للتعامل مع الطلبات بشكل أفضل
    CapacitorHttp: {
      enabled: true,
    },
  },

  android: {
    // ✅ تفعيل WebView مع دعم أفضل للـ offline
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    allowMixedContent: false,
    captureInput: true,
    
    // ✅ تحسينات للأداء
    useLegacyBridge: false,
    
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    }
  }
};

export default config;
