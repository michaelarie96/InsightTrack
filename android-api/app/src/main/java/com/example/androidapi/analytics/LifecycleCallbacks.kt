package com.example.androidapi.analytics

import android.app.Activity
import android.app.Application
import android.os.Bundle

/**
 * Activity lifecycle callbacks to automatically track screen views and session management
 */
class LifecycleCallbacks : Application.ActivityLifecycleCallbacks {
    private var activeActivities = 0

    override fun onActivityCreated(activity: Activity, bundle: Bundle?) {
        // Not tracking this event
    }

    override fun onActivityStarted(activity: Activity) {
        if (activeActivities == 0) {
            // App coming to foreground
            SDK.getInstance().startSession()
            SDK.getInstance().trackAppLifecycle("foreground")
        }
        activeActivities++
    }

    override fun onActivityResumed(activity: Activity) {
        // Track screen view with the activity name
        SDK.getInstance().trackScreenView(activity.javaClass.simpleName)
        SDK.getInstance().trackAppLifecycle("onResume")
    }

    override fun onActivityPaused(activity: Activity) {
        SDK.getInstance().trackAppLifecycle("onPause")
    }

    override fun onActivityStopped(activity: Activity) {
        activeActivities--
        if (activeActivities == 0) {
            // App going to background
            SDK.getInstance().trackAppLifecycle("background")
            SDK.getInstance().endSession()
        }
    }

    override fun onActivitySaveInstanceState(activity: Activity, bundle: Bundle) {
        // Not tracking this event
    }

    override fun onActivityDestroyed(activity: Activity) {
        // Not tracking this event
    }
}