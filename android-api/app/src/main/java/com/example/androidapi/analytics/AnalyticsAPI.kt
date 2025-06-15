package com.example.androidapi.analytics

import java.util.*

class AnalyticsAPI private constructor() {
    companion object {
        private var instance: AnalyticsAPI? = null

        fun getInstance(): AnalyticsAPI {
            if (instance == null) {
                instance = AnalyticsAPI()
            }
            return instance!!
        }

        fun initialize(apiKey: String) {
            getInstance().initialize(apiKey)
        }
    }

    private var userId: String? = null
    private var sessionId: String? = null
    private var sessionStartTime: Long = 0
    private var lastScreenName: String? = null
    private var lastScreenTime: Long = 0

    private fun initialize(apiKey: String) {
        println("SDK initialized with API key: $apiKey")
    }

    // Core tracking method
    fun trackEvent(eventName: String, parameters: Map<String, Any> = mapOf()) {
        val enhancedParams = parameters.toMutableMap().apply {
            sessionId?.let { put("session_id", it) }
            userId?.let { put("user_id", it) }
            put("timestamp", System.currentTimeMillis())
            put("device_type", getDeviceModel())
            put("os_version", getOSVersion())
            put("country", getCurrentCountry())
        }

        println("Event tracked: $eventName, params: $enhancedParams")
    }

    fun setUserId(userId: String) {
        this.userId = userId
        trackEvent("user_identified", mapOf("user_id" to userId))
    }

    // Session tracking
    fun startSession() {
        sessionId = UUID.randomUUID().toString()
        sessionStartTime = System.currentTimeMillis()
        println("Session started: $sessionId")
        trackEvent("session_start")
    }

    fun endSession() {
        val duration = System.currentTimeMillis() - sessionStartTime
        trackEvent("session_end", mapOf("duration_ms" to duration))
        println("Session ended. Duration: ${duration / 1000} seconds")
        sessionId = null
    }

    // Screen tracking
    fun trackScreenView(screenName: String) {
        // Calculate time spent on previous screen
        if (lastScreenName != null && lastScreenTime > 0) {
            val timeSpent = System.currentTimeMillis() - lastScreenTime
            trackEvent("screen_exit", mapOf(
                "screen_name" to lastScreenName!!,
                "time_spent_ms" to timeSpent
            ))
        }

        trackEvent("screen_view", mapOf("screen_name" to screenName))
        lastScreenName = screenName
        lastScreenTime = System.currentTimeMillis()
    }

    // User actions tracking
    fun trackLogin(method: String) {
        trackEvent("login", mapOf("method" to method))
    }

    fun trackLogout() {
        trackEvent("logout")
    }

    fun trackButtonClick(buttonId: String) {
        trackEvent("button_click", mapOf("button_id" to buttonId))
    }

    fun trackFeatureUsed(featureName: String) {
        trackEvent("feature_used", mapOf("feature_name" to featureName))
    }

    fun trackSettingsChanged(setting: String, value: Any) {
        trackEvent("settings_changed", mapOf(
            "setting" to setting,
            "value" to value
        ))
    }

    fun trackProfileUpdated() {
        trackEvent("profile_updated")
    }

    // App lifecycle tracking
    fun trackAppLifecycle(state: String) {
        trackEvent("app_lifecycle", mapOf("state" to state))
    }

    // E-commerce tracking
    fun trackProductView(productId: String, productName: String, price: Double, category: String) {
        trackEvent("product_view", mapOf(
            "product_id" to productId,
            "product_name" to productName,
            "price" to price,
            "category" to category
        ))
    }

    fun trackAddToCart(productId: String, productName: String, price: Double, quantity: Int) {
        trackEvent("add_to_cart", mapOf(
            "product_id" to productId,
            "product_name" to productName,
            "price" to price,
            "quantity" to quantity,
            "total" to (price * quantity)
        ))
    }

    fun trackCheckout() {
        trackEvent("checkout")
    }

    fun trackPurchase(orderId: String, total: Double, items: List<Map<String, Any?>> = listOf()) {
        val params = mutableMapOf<String, Any>(
            "order_id" to orderId,
            "total" to total
        )

        if (items.isNotEmpty()) {
            params["items"] = items
        }

        trackEvent("purchase", params)
    }

    fun trackSearch(query: String, resultsCount: Int) {
        trackEvent("search", mapOf(
            "query" to query,
            "results_count" to resultsCount
        ))
    }

    // Error tracking
    fun logCrash(exception: Throwable) {
        trackEvent("app_crash", mapOf(
            "error_type" to exception.javaClass.simpleName,
            "error_message" to (exception.message ?: "Unknown error"),
            "stack_trace" to exception.stackTraceToString()
        ))
        println("Crash logged: ${exception.message}")
        println("Stack trace: ${exception.stackTraceToString()}")
    }

    fun logError(errorType: String, message: String) {
        trackEvent("app_error", mapOf(
            "error_type" to errorType,
            "error_message" to message
        ))
    }

    // Helper methods
    private fun getDeviceModel(): String {
        return "Android Device"
    }

    private fun getOSVersion(): String {
        return "Android 13"
    }

    private fun getCurrentCountry(): String {
        val countries = listOf(
            "United States", "India", "Germany", "Japan", "Brazil",
            "United Kingdom", "Australia", "France", "Spain", "Canada"
        )
        return countries.random()
    }
}