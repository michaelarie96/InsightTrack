package com.insighttrack.analytics.network

import com.insighttrack.analytics.models.CrashRequest
import com.insighttrack.analytics.models.CrashResponse
import com.insighttrack.analytics.models.EventRequest
import com.insighttrack.analytics.models.EventResponse
import com.insighttrack.analytics.models.UserRegistrationRequest
import com.insighttrack.analytics.models.UserRegistrationResponse
import com.insighttrack.analytics.models.SessionRequest
import com.insighttrack.analytics.models.SessionResponse
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
     * Register a user with the analytics API
     */
    @POST("analytics/users")
    fun registerUser(@Body userRequest: UserRegistrationRequest): Call<UserRegistrationResponse>

    /**
     * Send session start/end to the analytics API
     */
    @POST("analytics/sessions")
    fun sendSession(@Body sessionRequest: SessionRequest): Call<SessionResponse>

    /**
     * Send crash report to the analytics API
     */
    @POST("analytics/crashes")
    fun sendCrash(@Body crashRequest: CrashRequest): Call<CrashResponse>

    /**
     * Health check endpoint to test if API is working
     */
    @GET("health")
    fun healthCheck(): Call<Map<String, String>>

}