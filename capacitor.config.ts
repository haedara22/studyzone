import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studybac.app',
  appName: 'Study Bac',
  webDir: '.open-next/assets',
  
  // ✅ Production server URL - Android app will load the web app from here
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://student.pages.dev',
    cleartext: false, // HTTPS only
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
