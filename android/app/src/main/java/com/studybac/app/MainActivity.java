package com.studybac.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registers Capacitor plugins
        registerPlugin(com.capacitorjs.plugins.app.AppPlugin.class);
        registerPlugin(com.capacitorjs.plugins.splashscreen.SplashScreenPlugin.class);
        registerPlugin(com.capacitorjs.plugins.statusbar.StatusBarPlugin.class);
        registerPlugin(com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin.class);
    }
}
