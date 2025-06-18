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
 * Generic API response wrapper
 */
data class ApiResponse<T>(
    val success: Boolean = true,
    val data: T? = null,
    val error: String? = null
)