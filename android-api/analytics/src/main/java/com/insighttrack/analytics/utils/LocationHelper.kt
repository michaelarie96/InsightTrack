package com.insighttrack.analytics.utils

import android.content.Context
import java.util.*

/**
 * Location helper for analytics - uses device locale only (as fallback)
 */
class LocationHelper(private val context: Context) {

    /**
     * Get user's country for analytics purposes
     * Uses device locale (language/region settings) - no permissions needed
     */
    fun getUserCountry(): String {
        return try {
            val locale = Locale.getDefault()
            val country = locale.displayCountry

            if (country.isNotBlank()) {
                println("✅ Locale-based country detected: $country")
                country
            } else {
                println("⚠️ Could not detect country from locale")
                "Unknown"
            }
        } catch (e: Exception) {
            println("⚠️ Locale detection failed: ${e.message}")
            "Unknown"
        }
    }

    /**
     * Get capabilities info for logging
     */
    fun getLocationCapabilities(): Map<String, String> {
        return mapOf(
            "detection_method" to "locale_only",
            "locale_country" to (Locale.getDefault().country ?: "unknown"),
            "locale_language" to (Locale.getDefault().language ?: "unknown")
        )
    }
}