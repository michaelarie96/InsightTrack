package com.insighttrack.ecommerce

import android.app.Application
import com.insighttrack.analytics.InsightTrackSDK

class EcommerceApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize Analytics SDK
        InsightTrackSDK.Builder.with(this)
            .setApiKey("ecommerce-demo-key-2024")
            .useLocalDevelopment(5001)  // Change this to your backend port if different
            .build()

        // Track app start
        InsightTrackSDK.getInstance().trackEvent("app_launched", "E-commerce demo app started")

        println("🚀 E-commerce Analytics SDK initialized!")
    }
}