package com.insighttrack.analytics

import android.content.Context
import com.insighttrack.analytics.models.EventRequest
import com.insighttrack.analytics.models.EventResponse
import com.insighttrack.analytics.network.EventCallback
import com.insighttrack.analytics.network.NetworkManager
import java.util.*

class InsightTrackSDK private constructor(
    private val apiKey: String,
    private val baseUrl: String,
    private val packageName: String
) {

    // Network manager for HTTP communication
    private lateinit var networkManager: NetworkManager

    // Session and user tracking
    private var userId: String? = null
    private var sessionId: String? = null
    private var sessionStartTime: Long = 0
    private var lastScreenName: String? = null
    private var lastScreenTime: Long = 0

    /**
     * Initialize the SDK with network manager
     */
    private fun initialize(context: Context) {
        this.networkManager = NetworkManager(context, baseUrl)

        println("🚀 Analytics SDK initialized")
        println("🔑 API key: $apiKey")
        println("📦 Package: $packageName")
        println("🌐 Base URL: $baseUrl")

        // Test connection
        testConnection()
    }

    /**
     * Test if we can connect to the API
     */
    private fun testConnection() {
        if (::networkManager.isInitialized) {
            networkManager.healthCheck(object : EventCallback<Map<String, String>> {
                override fun onSuccess(data: Map<String, String>?) {
                    println("✅ Connected to Analytics API!")
                }

                override fun onError(error: String) {
                    println("⚠️ Cannot connect to API - events will be stored offline")
                }
            })
        }
    }

    /**
     * Core method to track any event
     */
    fun trackEvent(eventName: String, properties: Map<String, Any> = emptyMap()) {
        val eventRequest = EventRequest(
            package_name = packageName,
            event_type = eventName,
            user_id = userId,
            session_id = sessionId,
            timestamp = System.currentTimeMillis(),
            properties = properties,
            device_info = getDeviceInfo()
        )

        if (::networkManager.isInitialized) {
            networkManager.sendEvent(eventRequest, object : EventCallback<EventResponse> {
                override fun onSuccess(data: EventResponse?) {
                    println("📊 Event '$eventName' sent successfully")
                }

                override fun onError(error: String) {
                    println("📴 Event '$eventName' stored offline")
                }
            })
        }
    }

    // User Management
    fun setUserId(userId: String) {
        this.userId = userId
        trackEvent("user_identified", mapOf("user_id" to userId))
    }

    // Session Management
    fun startSession() {
        sessionId = UUID.randomUUID().toString()
        sessionStartTime = System.currentTimeMillis()
        trackEvent("session_start")
    }

    fun endSession() {
        val duration = System.currentTimeMillis() - sessionStartTime
        trackEvent("session_end", mapOf("duration_ms" to duration))
        sessionId = null
    }

    // Screen Tracking
    fun trackScreenView(screenName: String) {
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

    // User Actions
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
        trackEvent("settings_changed", mapOf("setting" to setting, "value" to value))
    }

    fun trackProfileUpdated() {
        trackEvent("profile_updated")
    }

    fun trackAppLifecycle(state: String) {
        trackEvent("app_lifecycle", mapOf("state" to state))
    }

    // E-commerce Events
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
        val params = mutableMapOf<String, Any>("order_id" to orderId, "total" to total)
        if (items.isNotEmpty()) {
            params["items"] = items
        }
        trackEvent("purchase", params)
    }

    fun trackSearch(query: String, resultsCount: Int) {
        trackEvent("search", mapOf("query" to query, "results_count" to resultsCount))
    }

    // Error Tracking
    fun logCrash(exception: Throwable) {
        trackEvent("app_crash", mapOf(
            "error_type" to exception.javaClass.simpleName,
            "error_message" to (exception.message ?: "Unknown error"),
            "stack_trace" to exception.stackTraceToString()
        ))
    }

    fun logError(errorType: String, message: String) {
        trackEvent("app_error", mapOf("error_type" to errorType, "error_message" to message))
    }

    // Device Information
    private fun getDeviceInfo(): Map<String, String> {
        return mapOf(
            "model" to android.os.Build.MODEL,
            "manufacturer" to android.os.Build.MANUFACTURER,
            "os_version" to android.os.Build.VERSION.RELEASE,
            "api_level" to android.os.Build.VERSION.SDK_INT.toString()
        )
    }

    /**
     * Clean up resources when app is closing
     */
    fun cleanup() {
        if (::networkManager.isInitialized) {
            networkManager.cleanup()
            println("🧹 SDK cleanup completed")
        }
    }

    /**
     * Manually retry sending offline events (for testing)
     */
    fun retryOfflineEvents() {
        if (::networkManager.isInitialized) {
            networkManager.retryPendingEvents()
        }
    }

    companion object {
        @Volatile
        private var INSTANCE: InsightTrackSDK? = null

        fun getInstance(): InsightTrackSDK {
            return INSTANCE ?: throw IllegalStateException(
                "SDK not initialized! Please call SDK.Builder.with(context).build() first"
            )
        }
    }

    /**
     * Builder class for SDK configuration
     */
    class Builder private constructor(private val context: Context) {

        private var apiKey: String? = null
        private var baseUrl: String = "http://10.0.2.2:5000/"  // Default for emulator

        companion object {
            /**
             * Start building the SDK
             */
            fun with(context: Context): Builder {
                return Builder(context)
            }
        }

        /**
         * Set the API key for authentication
         */
        fun setApiKey(apiKey: String): Builder {
            this.apiKey = apiKey
            return this
        }

        /**
         * Set custom base URL
         */
        fun setBaseUrl(baseUrl: String): Builder {
            this.baseUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
            return this
        }

        /**
         * Use local development server
         */
        fun useLocalDevelopment(port: Int = 5000): Builder {
            this.baseUrl = "http://10.0.2.2:$port/"
            return this
        }

        /**
         * Use production server
         */
        fun useProduction(domain: String): Builder {
            this.baseUrl = if (domain.startsWith("http")) domain else "https://$domain"
            this.baseUrl = if (this.baseUrl.endsWith("/")) this.baseUrl else "${this.baseUrl}/"
            return this
        }

        /**
         * Build and initialize the SDK
         */
        fun build(): InsightTrackSDK {
            val key = apiKey ?: throw IllegalArgumentException("API key is required! Use setApiKey()")

            val appContext = context.applicationContext

            val sdk = InsightTrackSDK(key, baseUrl, appContext.packageName)

            sdk.initialize(appContext)

            INSTANCE = sdk

            return sdk
        }
    }
}