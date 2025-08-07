package com.insighttrack.analytics.storage

import android.content.Context
import android.content.SharedPreferences
import com.insighttrack.analytics.models.EventRequest
import com.insighttrack.analytics.models.SessionRequest
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Offline storage for events AND sessions when network is unavailable
 */
class OfflineEventStorage(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("analytics_offline_events", Context.MODE_PRIVATE)
    private val gson = Gson()
    private val eventsKey = "pending_events"
    private val sessionsKey = "pending_sessions"

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
     * Store a session for later sending
     */
    fun storeSession(session: SessionRequest) {
        val existingSessions = getPendingSessions().toMutableList()
        existingSessions.add(session)

        val sessionsJson = gson.toJson(existingSessions)
        prefs.edit().putString(sessionsKey, sessionsJson).apply()

        println("💾 Stored session offline: ${session.action} ${session.session_id} (Total pending: ${existingSessions.size})")
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
     * Get all sessions waiting to be sent
     */
    fun getPendingSessions(): List<SessionRequest> {
        val sessionsJson = prefs.getString(sessionsKey, null) ?: return emptyList()

        return try {
            val type = object : TypeToken<List<SessionRequest>>() {}.type
            gson.fromJson(sessionsJson, type) ?: emptyList()
        } catch (e: Exception) {
            println("❌ Error reading offline sessions: ${e.message}")
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
     * Remove successfully sent sessions
     */
    fun clearPendingSessions() {
        prefs.edit().remove(sessionsKey).apply()
        println("🗑️ Cleared all pending offline sessions")
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
     * Remove a specific session after successful send
     */
    fun removeSession(session: SessionRequest) {
        val sessions = getPendingSessions().toMutableList()
        sessions.removeAll { it.timestamp == session.timestamp && it.session_id == session.session_id && it.action == session.action }

        val sessionsJson = gson.toJson(sessions)
        prefs.edit().putString(sessionsKey, sessionsJson).apply()

        println("✅ Removed sent session: ${session.action} ${session.session_id}")
    }

    /**
     * Get count of pending events
     */
    fun getPendingCount(): Int {
        return getPendingEvents().size
    }

    /**
     * Get count of pending sessions
     */
    fun getPendingSessionsCount(): Int {
        return getPendingSessions().size
    }

    /**
     * Get total pending items (events + sessions)
     */
    fun getTotalPendingCount(): Int {
        return getPendingCount() + getPendingSessionsCount()
    }

    /**
     * Clear all corrupted data
     */
    fun clearCorruptedEvents() {
        val events = getPendingEvents().toMutableList()
        val validEvents = events.filter { event ->
            !event.user_id.isNullOrEmpty() &&
                    !event.event_type.isNullOrEmpty() &&
                    !event.package_name.isNullOrEmpty()
        }

        val sessions = getPendingSessions().toMutableList()
        val validSessions = sessions.filter { session ->
            !session.session_id.isNullOrEmpty() &&
                    !session.package_name.isNullOrEmpty() &&
                    !session.action.isNullOrEmpty()
        }

        val removedEvents = events.size - validEvents.size
        val removedSessions = sessions.size - validSessions.size

        if (removedEvents > 0 || removedSessions > 0) {
            val eventsJson = gson.toJson(validEvents)
            val sessionsJson = gson.toJson(validSessions)

            prefs.edit()
                .putString(eventsKey, eventsJson)
                .putString(sessionsKey, sessionsJson)
                .apply()

            println("🧹 Removed $removedEvents corrupted events and $removedSessions corrupted sessions")
        } else {
            println("✅ No corrupted data found")
        }
    }
}