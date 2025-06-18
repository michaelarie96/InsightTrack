package com.example.androidapi.analytics.storage

import android.content.Context
import android.content.SharedPreferences
import com.example.androidapi.analytics.models.EventRequest
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Offline storage for events when network is unavailable
 */
class OfflineEventStorage(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("analytics_offline_events", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val eventsKey = "pending_events"

    /**
     * Store an event for later sending
     */
    fun storeEvent(event: EventRequest) {
        val existingEvents = getPendingEvents().toMutableList()
        existingEvents.add(event)

        val eventsJson = gson.toJson(existingEvents)
        prefs.edit().putString(eventsKey, eventsJson).apply()

        println("💾 Stored event offline: ${event.event_type} (Total pending: ${existingEvents.size})")
    }

    /**
     * Get all events waiting to be sent
     */
    fun getPendingEvents(): List<EventRequest> {
        val eventsJson = prefs.getString(eventsKey, null) ?: return emptyList()

        return try {
            val type = object : TypeToken<List<EventRequest>>() {}.type
            gson.fromJson(eventsJson, type) ?: emptyList()
        } catch (e: Exception) {
            println("❌ Error reading offline events: ${e.message}")
            emptyList()
        }
    }

    /**
     * Remove successfully sent events
     */
    fun clearPendingEvents() {
        prefs.edit().remove(eventsKey).apply()
        println("🗑️ Cleared all pending offline events")
    }

    /**
     * Remove a specific event after successful send
     */
    fun removeEvent(event: EventRequest) {
        val events = getPendingEvents().toMutableList()
        events.removeAll { it.timestamp == event.timestamp && it.event_type == event.event_type }

        val eventsJson = gson.toJson(events)
        prefs.edit().putString(eventsKey, eventsJson).apply()

        println("✅ Removed sent event: ${event.event_type}")
    }

    /**
     * Get count of pending events
     */
    fun getPendingCount(): Int {
        return getPendingEvents().size
    }
}