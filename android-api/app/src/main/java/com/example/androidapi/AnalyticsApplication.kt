package com.example.androidapi

import android.app.Application
import com.example.androidapi.analytics.AnalyticsAPI
import com.example.androidapi.analytics.AnalyticsLifecycleCallbacks

class AnalyticsApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        AnalyticsAPI.initialize("your-api-key-here")

        // Track app start
        AnalyticsAPI.getInstance().trackAppLifecycle("app_start")

        // Register for activity lifecycle events to automate tracking
        registerActivityLifecycleCallbacks(AnalyticsLifecycleCallbacks())

        // Setup crash reporting
        setupCrashReporting()
    }

    private fun setupCrashReporting() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            // Log the crash before the app terminates
            AnalyticsAPI.getInstance().logCrash(throwable)

            // Pass to the original handler
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}