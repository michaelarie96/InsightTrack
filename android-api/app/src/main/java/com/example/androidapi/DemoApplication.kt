package com.example.androidapi

import android.app.Application
import com.example.androidapi.analytics.SDK
import com.example.androidapi.analytics.LifecycleCallbacks

class DemoApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Analytics SDK - Standard Android pattern
        SDK.Builder.with(this)
            .setApiKey("demo-api-key-12345")
            .useLocalDevelopment(5000)
            .build()

        // Track app start
        SDK.getInstance().trackAppLifecycle("app_start")

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
            SDK.getInstance().cleanup()
            println("🧹 Analytics SDK cleaned up successfully")
        } catch (e: Exception) {
            println("⚠️ Error during cleanup: ${e.message}")
        }
    }

    private fun setupCrashReporting() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            // Log crash to analytics
            SDK.getInstance().logCrash(throwable)

            // Pass to original handler
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}