package com.insighttrack.ecommerce

import android.app.Application
import com.insighttrack.analytics.InsightTrackSDK
import com.insighttrack.analytics.LifecycleCallbacks

class EcommerceApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Analytics SDK
        InsightTrackSDK.Builder.with(this)
            .setApiKey("ecommerce-demo-key-2024")
            .useLocalDevelopment(5001)
            .build()

        // Generate a user ID for this session
        val userId = "ecommerce_user_" + (10000..99999).random()
        InsightTrackSDK.getInstance().setUserId(userId)
        println("👤 E-commerce user set: $userId")

        // Register lifecycle callbacks for automatic session management
        registerActivityLifecycleCallbacks(LifecycleCallbacks())
        println("🔄 Session management enabled")

        // Track app start
        InsightTrackSDK.getInstance().trackEvent("app_launched", "E-commerce demo app started")

        setupCrashReporting()

        println("🚀 E-commerce Analytics SDK fully initialized!")
    }

    override fun onTerminate() {
        super.onTerminate()

        // Clean up analytics when app terminates
        try {
            InsightTrackSDK.getInstance().cleanup()
            println("🧹 E-commerce analytics cleaned up")
        } catch (e: Exception) {
            println("⚠️ Error during cleanup: ${e.message}")
        }
    }

    // Crash reporting setup
    private fun setupCrashReporting() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            InsightTrackSDK.getInstance().logCrash(throwable)

            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}