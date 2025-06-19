package com.insighttrack.analytics.models

/**
 * Data class for sending events to the API
 */
data class EventRequest(
    val package_name: String,
    val event_type: String,
    val user_id: String?,
    val session_id: String?,
    val timestamp: Long,
    val properties: Map<String, Any> = emptyMap(),
    val device_info: Map<String, String> = emptyMap()
)

/**
 * Data class for API responses
 */
data class EventResponse(
    val message: String,
    val event_id: String?,
    val timestamp: String?
)

/**
 * Data class for user registration requests
 */
data class UserRegistrationRequest(
    val package_name: String,
    val user_id: String,
    val timestamp: Long,
    val device_info: Map<String, String> = emptyMap(),
    val country: String = "Unknown",
    val properties: Map<String, Any> = emptyMap()
)

/**
 * Data class for user registration responses
 */
data class UserRegistrationResponse(
    val message: String,
    val user_id: String,
    val action: String? = null // "created" or "updated"
)

/**
 * Data class for session tracking requests
 */
data class SessionRequest(
    val package_name: String,
    val session_id: String,
    val action: String, // "start" or "end"
    val user_id: String?,
    val timestamp: Long,
    val device_info: Map<String, String> = emptyMap()
)

/**
 * Data class for session tracking responses
 */
data class SessionResponse(
    val message: String,
    val session_id: String,
    val action: String,
    val duration_seconds: Int? = null // Only present for "end" action
)

/**
 * Data class for crash reporting requests
 */
data class CrashRequest(
    val package_name: String,
    val error_type: String,
    val error_message: String,
    val stack_trace: String,
    val user_id: String?,
    val session_id: String?,
    val timestamp: Long,
    val device_info: Map<String, String> = emptyMap()
)

/**
 * Data class for crash reporting responses
 */
data class CrashResponse(
    val message: String,
    val crash_id: String,
    val action: String, // "created" or "updated"
    val count: Int? = null // How many times this crash has occurred
)

/**
 * Generic API response wrapper
 */
data class ApiResponse<T>(
    val success: Boolean = true,
    val data: T? = null,
    val error: String? = null
)