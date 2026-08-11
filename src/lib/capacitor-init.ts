// Capacitor initialization and utilities
// This file handles Capacitor-specific functionality

import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if app is running in Capacitor (native mobile)
 */
export const isNative = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if app is running on Android
 */
export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Check if app is running on iOS
 */
export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Initialize Capacitor plugins and native features
 */
export const initCapacitor = async () => {
  if (!isNative()) {
    console.log('📱 Running in web mode');
    return;
  }

  console.log('📱 Initializing Capacitor...');

  try {
    // Configure status bar
    if (isAndroid()) {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#2563EB' });
    }

    // Hide splash screen after app is ready
    await SplashScreen.hide();

    // Handle app state changes
    CapApp.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
    });

    // Handle back button (Android)
    if (isAndroid()) {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    console.log('✅ Capacitor initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Capacitor:', error);
  }
};

/**
 * Get app info
 */
export const getAppInfo = async () => {
  if (!isNative()) return null;
  
  try {
    const info = await CapApp.getInfo();
    return info;
  } catch (error) {
    console.error('Error getting app info:', error);
    return null;
  }
};
