package com.example.androidapi

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.insighttrack.analytics.InsightTrackSDK
import com.insighttrack.analytics.storage.OfflineEventStorage

class MainActivity : AppCompatActivity() {

    // Sample product data
    private val product = mapOf(
        "id" to "product_1",
        "name" to "Smartphone",
        "price" to 699.99,
        "category" to "Electronics"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Set user ID (typically after login)
        val userId = "u_" + (10000..99999).random()
        InsightTrackSDK.getInstance().setUserId(userId)

        // Set up button click listeners for different analytics events
        setupButtonListeners()
    }

    private fun setupButtonListeners() {
        // Login button
        findViewById<Button>(R.id.login_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackLogin("email")
            InsightTrackSDK.getInstance().trackButtonClick("login_button")
        }

        // Feature button
        findViewById<Button>(R.id.feature_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackFeatureUsed("premium_feature")
        }

        // View product button
        findViewById<Button>(R.id.view_product_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackProductView(
                product["id"] as String,
                product["name"] as String,
                product["price"] as Double,
                product["category"] as String
            )
        }

        // Add to cart button
        findViewById<Button>(R.id.add_to_cart_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackAddToCart(
                product["id"] as String,
                product["name"] as String,
                product["price"] as Double,
                1
            )
        }

        // Checkout button
        findViewById<Button>(R.id.checkout_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackCheckout()
        }

        // Purchase button
        findViewById<Button>(R.id.purchase_button)?.setOnClickListener {
            val orderId = "order_" + System.currentTimeMillis()

            val items = listOf(
                mapOf(
                    "product_id" to product["id"],
                    "product_name" to product["name"],
                    "price" to product["price"],
                    "quantity" to 1
                )
            )

            InsightTrackSDK.getInstance().trackPurchase(
                orderId,
                product["price"] as Double,
                items
            )
        }

        // Search button
        findViewById<Button>(R.id.search_button)?.setOnClickListener {
            val query = findViewById<TextView>(R.id.search_input)?.text?.toString() ?: "smartphone"
            InsightTrackSDK.getInstance().trackSearch(query, 5)
        }

        // Settings button
        findViewById<Button>(R.id.settings_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackSettingsChanged("notifications", true)
        }

        // Profile button
        findViewById<Button>(R.id.profile_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackProfileUpdated()
        }

        // Logout button
        findViewById<Button>(R.id.logout_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackLogout()
        }

        // Crash button
        findViewById<Button>(R.id.crash_button)?.setOnClickListener {
            try {
                // Simulate a crash
                val list = listOf<String>()
                val item = list[10] // This will throw IndexOutOfBoundsException
            } catch (e: Exception) {
                InsightTrackSDK.getInstance().logCrash(e)
            }
        }

        // Custom event button
        findViewById<Button>(R.id.custom_event_button)?.setOnClickListener {
            InsightTrackSDK.getInstance().trackEvent(
                "custom_action",
                mapOf(
                    "action_name" to "special_feature",
                    "value" to 42
                )
            )
        }

        // Manual retry button for testing offline events
        findViewById<Button>(R.id.retry_offline_button)?.setOnClickListener {
            println("🔄 Manual retry button clicked")
            InsightTrackSDK.getInstance().retryOfflineEvents()
        }

        // Clear corrupted offline events button
        findViewById<Button>(R.id.clear_offline_button)?.setOnClickListener {
            println("🧹 Clear offline button clicked")
            // Clear corrupted events through the SDK
            val offlineStorage = OfflineEventStorage(this)
            offlineStorage.clearCorruptedEvents()
        }
    }
}