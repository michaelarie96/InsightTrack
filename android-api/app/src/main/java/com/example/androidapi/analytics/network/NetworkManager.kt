package com.example.androidapi.analytics.network

import android.content.Context
import com.example.androidapi.analytics.models.EventRequest
import com.example.androidapi.analytics.models.EventResponse
import com.example.androidapi.analytics.storage.OfflineEventStorage
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Handles all the HTTP communication with the Flask API
 */
class NetworkManager(private val context: Context, private val baseUrl: String) :
    NetworkConnectivityMonitor.NetworkCallbackListener {

    private val apiService: ApiService
    private val offlineStorage = OfflineEventStorage(context)
    private val networkMonitor = NetworkConnectivityMonitor(context)

    init {
        // Set up the HTTP client
        val httpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(createLoggingInterceptor())
            .build()

        // Set up Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(ApiService::class.java)

        println("🌐 Network Manager initialized with base URL: $baseUrl")

        // Start monitoring network connectivity
        networkMonitor.startMonitoring(this)

        // Send any pending events from app startup
        sendPendingEvents()
    }

    /**
     * Called when network becomes available
     */
    override fun onNetworkAvailable() {
        println("🚀 Internet is back! Attempting to send pending events...")
        sendPendingEvents()
    }

    /**
     * Called when network is lost
     */
    override fun onNetworkLost() {
        println("📴 Internet connection lost - events will be stored offline")
    }

    /**
     * Send any events that were stored offline
     */
    private fun sendPendingEvents() {
        val pendingEvents = offlineStorage.getPendingEvents()
        if (pendingEvents.isNotEmpty()) {
            println("📤 Found ${pendingEvents.size} pending offline events, attempting to send...")

            pendingEvents.forEach { event ->
                sendEventDirect(event, object : EventCallback<EventResponse> {
                    override fun onSuccess(data: EventResponse?) {
                        offlineStorage.removeEvent(event)
                        println("✅ Sent pending event: ${event.event_type}")
                    }

                    override fun onError(error: String) {
                        println("❌ Failed to send pending event: ${event.event_type} - keeping in storage for later retry")
                        // DON'T store it again - it's already in storage!
                    }
                })
            }
        } else {
            println("📭 No pending events to send")
        }
    }

    /**
     * Send event directly without offline storage (for retry attempts)
     */
    private fun sendEventDirect(eventRequest: EventRequest, callback: EventCallback<EventResponse>) {
        val call = apiService.sendEvent(eventRequest)

        call.enqueue(object : Callback<EventResponse> {
            override fun onResponse(call: Call<EventResponse>, response: Response<EventResponse>) {
                if (response.isSuccessful) {
                    val eventResponse = response.body()
                    callback.onSuccess(eventResponse)
                } else {
                    val errorMsg = "Failed to send event: ${response.code()} ${response.message()}"
                    callback.onError(errorMsg)
                }
            }

            override fun onFailure(call: Call<EventResponse>, t: Throwable) {
                val errorMsg = "Network error: ${t.message}"
                callback.onError(errorMsg)
            }
        })
    }

    /**
     * Send an event to the API (asynchronously)
     */
    fun sendEvent(eventRequest: EventRequest, callback: EventCallback<EventResponse>) {
        println("📤 Sending event: ${eventRequest.event_type}")

        // Check if network is available first
        if (!networkMonitor.isNetworkCurrentlyAvailable()) {
            println("📴 No internet connection - storing event offline")
            offlineStorage.storeEvent(eventRequest)
            callback.onError("No internet connection - event stored offline")
            return
        }

        val call = apiService.sendEvent(eventRequest)

        call.enqueue(object : Callback<EventResponse> {
            override fun onResponse(call: Call<EventResponse>, response: Response<EventResponse>) {
                if (response.isSuccessful) {
                    val eventResponse = response.body()
                    println("✅ Event sent successfully: ${eventResponse?.message}")
                    callback.onSuccess(eventResponse)
                } else {
                    val errorMsg = "Failed to send event: ${response.code()} ${response.message()}"
                    println("❌ $errorMsg")

                    // Store offline for retry later
                    offlineStorage.storeEvent(eventRequest)
                    callback.onError(errorMsg)
                }
            }

            override fun onFailure(call: Call<EventResponse>, t: Throwable) {
                val errorMsg = "Network error: ${t.message}"
                println("❌ $errorMsg")

                // Store offline for retry later
                offlineStorage.storeEvent(eventRequest)
                callback.onError(errorMsg)
            }
        })
    }

    /**
     * Test if the API is working
     */
    fun healthCheck(callback: EventCallback<Map<String, String>>) {
        println("🔍 Performing health check...")

        val call = apiService.healthCheck()
        call.enqueue(object : Callback<Map<String, String>> {
            override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                if (response.isSuccessful) {
                    println("✅ API is healthy: ${response.body()}")
                    callback.onSuccess(response.body())
                } else {
                    val errorMsg = "Health check failed: ${response.code()}"
                    println("❌ $errorMsg")
                    callback.onError(errorMsg)
                }
            }

            override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                val errorMsg = "Health check failed: ${t.message}"
                println("❌ $errorMsg")
                callback.onError(errorMsg)
            }
        })
    }

    /**
     * Create a logging interceptor to see HTTP requests/responses
     */
    private fun createLoggingInterceptor(): HttpLoggingInterceptor {
        val interceptor = HttpLoggingInterceptor { message ->
            println("🌐 HTTP: $message")
        }
        interceptor.level = HttpLoggingInterceptor.Level.BODY
        return interceptor
    }

    /**
     * Clean up when done (call this in your app's onDestroy)
     */
    fun cleanup() {
        networkMonitor.stopMonitoring()
    }

    /**
     * Manually trigger retry of pending events (useful for testing)
     */
    fun retryPendingEvents() {
        println("🔄 Manually triggering retry of pending events...")
        sendPendingEvents()
    }
}

/**
 * Simple callback interface for async operations
 */
interface EventCallback<T> {
    fun onSuccess(data: T?)
    fun onError(error: String)
}