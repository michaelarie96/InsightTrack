package com.insighttrack.analytics.network

import com.insighttrack.analytics.models.EventRequest
import com.insighttrack.analytics.models.EventResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/**
 * Defines all the "addresses" where we can send requests
 */
interface ApiService {

    /**
     * Send an event to the analytics API
     */
    @POST("analytics/events")
    fun sendEvent(@Body eventRequest: EventRequest): Call<EventResponse>

    /**
     * Get events for a specific package
     */
    @GET("analytics/events/{package_name}")
    fun getEvents(@Path("package_name") packageName: String): Call<Any>

    /**
     * Health check endpoint to test if API is working
     */
    @GET("health")
    fun healthCheck(): Call<Map<String, String>>
}