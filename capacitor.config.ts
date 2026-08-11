import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studybac.app',
  appName: 'Study Bac',
  webDir: '.open-next/assets',
  
  // ✅ Production server URL - Android app will load from Cloudflare Workers
  server: {
    url: 'https://student.giath-motors.workers.dev',
    cleartext: false,
    androidScheme: 'https'
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
  },

  android: {
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
