package com.example.androidapi.analytics

import android.app.Activity
import android.app.Application
import android.os.Bundle

/**
 * Activity lifecycle callbacks to automatically track screen views and session management
 */
class AnalyticsLifecycleCallbacks : Application.ActivityLifecycleCallbacks {
    private var activeActivities = 0

    override fun onActivityCreated(activity: Activity, bundle: Bundle?) {
        // Not tracking this event
    }

    override fun onActivityStarted(activity: Activity) {
        if (activeActivities == 0) {
            // App coming to foreground
            AnalyticsAPI.getInstance().startSession()
            AnalyticsAPI.getInstance().trackAppLifecycle("foreground")
        }
        activeActivities++
    }

    override fun onActivityResumed(activity: Activity) {
        // Track screen view with the activity name
        AnalyticsAPI.getInstance().trackScreenView(activity.javaClass.simpleName)
        AnalyticsAPI.getInstance().trackAppLifecycle("onResume")
    }

    override fun onActivityPaused(activity: Activity) {
        AnalyticsAPI.getInstance().trackAppLifecycle("onPause")
    }

    override fun onActivityStopped(activity: Activity) {
        activeActivities--
        if (activeActivities == 0) {
            // App going to background
            AnalyticsAPI.getInstance().trackAppLifecycle("background")
            AnalyticsAPI.getInstance().endSession()
        }
    }

    override fun onActivitySaveInstanceState(activity: Activity, bundle: Bundle) {
        // Not tracking this event
    }

    override fun onActivityDestroyed(activity: Activity) {
        // Not tracking this event
    }
}