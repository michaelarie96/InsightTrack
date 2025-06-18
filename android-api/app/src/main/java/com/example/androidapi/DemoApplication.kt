package com.example.androidapi

import android.app.Application
import com.insighttrack.analytics.InsightTrackSDK
import com.insighttrack.analytics.LifecycleCallbacks

class DemoApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Analytics SDK - Standard Android pattern
        InsightTrackSDK.Builder.with(this)
            .setApiKey("demo-api-key-12345")
            .useLocalDevelopment(5001)
            .build()

        // Track app start
        InsightTrackSDK.getInstance().trackAppLifecycle("app_start")

        // Register lifecycle callbacks for automatic tracking
        registerActivityLifecycleCallbacks(LifecycleCallbacks())

        // Setup crash reporting
        setupCrashReporting()

        println("🚀 Analytics SDK initialized and ready!")
    }

    override fun onTerminate() {
        super.onTerminate()

        // Clean up network monitoring when app terminates
        try {
            InsightTrackSDK.getInstance().cleanup()
            println("🧹 Analytics SDK cleaned up successfully")
        } catch (e: Exception) {
            println("⚠️ Error during cleanup: ${e.message}")
        }
    }

    private fun setupCrashReporting() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            // Log crash to analytics
            InsightTrackSDK.getInstance().logCrash(throwable)

            // Pass to original handler
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}