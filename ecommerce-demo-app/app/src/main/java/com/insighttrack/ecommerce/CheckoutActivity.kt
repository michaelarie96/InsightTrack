package com.insighttrack.ecommerce

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.insighttrack.analytics.InsightTrackSDK
import com.insighttrack.ecommerce.data.CartManager
import com.insighttrack.ecommerce.data.CartItem

/**
 * Checkout Screen - Final step in the purchase process
 *
 * This screen handles:
 * - Displaying order summary with all cart items
 * - Collecting shipping and payment information
 * - Processing the purchase with analytics tracking
 * - Showing order confirmation
 * - Navigation back to shopping
 */
class CheckoutActivity : AppCompatActivity() {

    // UI elements
    private lateinit var orderItemsContainer: LinearLayout
    private lateinit var subtotalText: TextView
    private lateinit var shippingText: TextView
    private lateinit var totalText: TextView
    private lateinit var completePurchaseButton: Button

    // Form inputs
    private lateinit var nameInput: EditText
    private lateinit var addressInput: EditText
    private lateinit var cityInput: EditText
    private lateinit var zipInput: EditText
    private lateinit var cardNumberInput: EditText
    private lateinit var expiryInput: EditText
    private lateinit var cvvInput: EditText
    private lateinit var cardholderNameInput: EditText

    // Order data
    private val shippingCost = 9.99
    private var subtotal = 0.0
    private var orderTotal = 0.0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_checkout)

        initializeViews()
        setupClickListeners()
        displayOrderSummary()
        prefillDemoData()

        // Track checkout analytics
        InsightTrackSDK.getInstance().trackScreenView("CheckoutScreen")
        InsightTrackSDK.getInstance().trackEvent("checkout_started", mapOf(
            "cart_items" to CartManager.itemCount,
            "cart_total" to CartManager.totalPrice,
            "shipping_cost" to shippingCost,
            "source_screen" to "cart"
        ))

        println("💳 Checkout screen loaded with ${CartManager.itemCount} items")
    }

    private fun initializeViews() {
        // Order summary elements
        orderItemsContainer = findViewById(R.id.order_items_container)
        subtotalText = findViewById(R.id.subtotal_text)
        shippingText = findViewById(R.id.shipping_text)
        totalText = findViewById(R.id.total_text)
        completePurchaseButton = findViewById(R.id.complete_purchase_button)

        // Form inputs
        nameInput = findViewById(R.id.name_input)
        addressInput = findViewById(R.id.address_input)
        cityInput = findViewById(R.id.city_input)
        zipInput = findViewById(R.id.zip_input)
        cardNumberInput = findViewById(R.id.card_number_input)
        expiryInput = findViewById(R.id.expiry_input)
        cvvInput = findViewById(R.id.cvv_input)
        cardholderNameInput = findViewById(R.id.cardholder_name_input)

        // Set shipping cost
        shippingText.text = "$${String.format("%.2f", shippingCost)}"
    }

    private fun setupClickListeners() {
        // Back button - return to previous cart screen
        findViewById<Button>(R.id.back_button).setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("checkout_back_button", mapOf(
                "checkout_step" to "order_summary",
                "cart_items" to CartManager.itemCount
            ))

            finish()
        }

        completePurchaseButton.setOnClickListener {
            processPurchase()
        }

        setupFormAnalytics()
    }

    private fun setupFormAnalytics() {
        // Track when user starts entering shipping info
        nameInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                InsightTrackSDK.getInstance().trackEvent("checkout_shipping_started", mapOf(
                    "total_amount" to orderTotal
                ))
            }
        }

        // Track when user starts entering payment info
        cardNumberInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                InsightTrackSDK.getInstance().trackEvent("checkout_payment_started", mapOf(
                    "total_amount" to orderTotal,
                    "payment_method" to "credit_card"
                ))
            }
        }
    }

    private fun displayOrderSummary() {
        // Clear any existing views
        orderItemsContainer.removeAllViews()

        val cartItems = CartManager.cartItems
        subtotal = 0.0

        if (cartItems.isEmpty()) {
            // No items in cart - show empty message
            val emptyText = TextView(this).apply {
                text = "🛒 No items in cart"
                textSize = 16f
                setPadding(16, 32, 16, 32)
            }
            orderItemsContainer.addView(emptyText)

            // Disable purchase button
            completePurchaseButton.isEnabled = false
            completePurchaseButton.text = "Cart is Empty"

            return
        }

        // Create a view for each cart item
        cartItems.forEach { cartItem ->
            val itemView = createOrderItemView(cartItem)
            orderItemsContainer.addView(itemView)

            subtotal += cartItem.totalPrice
        }

        updateTotals()

        println("📝 Order summary displayed: ${cartItems.size} items, subtotal: $$subtotal")
    }

    /**
     * Create a view for a single order item
     */
    private fun createOrderItemView(cartItem: CartItem): LinearLayout {
        val itemView = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 12, 0, 12)
        }

        val productInfo = TextView(this).apply {
            text = "${cartItem.product.name} × ${cartItem.quantity}"
            textSize = 16f
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        val priceInfo = TextView(this).apply {
            text = "$${String.format("%.2f", cartItem.totalPrice)}"
            textSize = 16f
            setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
        }

        itemView.addView(productInfo)
        itemView.addView(priceInfo)

        return itemView
    }


    private fun updateTotals() {
        orderTotal = subtotal + shippingCost

        subtotalText.text = "$${String.format("%.2f", subtotal)}"
        totalText.text = "$${String.format("%.2f", orderTotal)}"

        completePurchaseButton.text = "💳 Complete Purchase - $${String.format("%.2f", orderTotal)}"
    }

    /**
     * Fill in demo data for testing
     */
    private fun prefillDemoData() {
        nameInput.setText("John Demo User")
        addressInput.setText("123 Demo Street")
        cityInput.setText("Demo City")
        zipInput.setText("12345")

        cardNumberInput.setText("4532123456789012")
        expiryInput.setText("12/25")
        cvvInput.setText("123")
        cardholderNameInput.setText("John Demo User")
    }

    private fun processPurchase() {
        // Validate required fields
        if (!validateForm()) {
            return
        }

        // Track checkout completion attempt
        InsightTrackSDK.getInstance().trackEvent("checkout_attempted", mapOf(
            "total_amount" to orderTotal,
            "subtotal" to subtotal,
            "shipping_cost" to shippingCost,
            "items_count" to CartManager.itemCount,
            "payment_method" to "credit_card"
        ))

        // Simulate processing delay
        completePurchaseButton.isEnabled = false
        completePurchaseButton.text = "⏳ Processing..."

        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            completePurchaseWithAnalytics()
        }, 2000) // 2 second delay
    }

    private fun completePurchaseWithAnalytics() {
        val orderId = "order_${System.currentTimeMillis()}"

        // Prepare items list for analytics
        val itemsList = CartManager.cartItems.map { cartItem ->
            mapOf(
                "product_id" to cartItem.product.id,
                "product_name" to cartItem.product.name,
                "product_category" to cartItem.product.category,
                "quantity" to cartItem.quantity,
                "unit_price" to cartItem.product.price,
                "total_price" to cartItem.totalPrice
            )
        }

        // Track the completed purchase
        InsightTrackSDK.getInstance().trackPurchase(
            orderId,
            orderTotal,
            itemsList,
            additionalProperties = mapOf(
                "subtotal" to subtotal,
                "shipping_cost" to shippingCost,
                "payment_method" to "credit_card",
                "shipping_city" to cityInput.text.toString(),
                "shipping_zip" to zipInput.text.toString(),
                "items_count" to CartManager.itemCount,
                "checkout_duration" to "estimated_2_minutes" // Demo time
            )
        )

        println("✅ Purchase completed! Order ID: $orderId, Total: $$orderTotal")

        CartManager.clearCart()

        showOrderConfirmation(orderId)
    }

    private fun validateForm(): Boolean {
        val requiredFields = listOf(
            nameInput to "Name",
            addressInput to "Address",
            cityInput to "City",
            zipInput to "ZIP Code",
            cardNumberInput to "Card Number",
            expiryInput to "Expiry Date",
            cvvInput to "CVV",
            cardholderNameInput to "Cardholder Name"
        )

        for ((field, fieldName) in requiredFields) {
            if (field.text.toString().trim().isEmpty()) {
                field.error = "$fieldName is required"
                field.requestFocus()

                // Track validation failure event
                InsightTrackSDK.getInstance().trackEvent("checkout_validation_failed", mapOf(
                    "missing_field" to fieldName,
                    "total_amount" to orderTotal
                ))

                return false
            }
        }

        if (cardNumberInput.text.toString().replace(" ", "").length < 12) {
            cardNumberInput.error = "Invalid card number"
            cardNumberInput.requestFocus()

            InsightTrackSDK.getInstance().trackEvent("checkout_validation_failed", mapOf(
                "error_type" to "invalid_card_number",
                "total_amount" to orderTotal
            ))

            return false
        }

        return true
    }

    /**
     * Show order confirmation dialog instead of new activity
     */
    private fun showOrderConfirmation(orderId: String) {
        val dialog = android.app.AlertDialog.Builder(this)
            .setTitle("🎉 Order Complete!")
            .setMessage("Thank you for your purchase!\n\nOrder ID: $orderId\nTotal: $${String.format("%.2f", orderTotal)}\n\nYour order will be shipped soon.")
            .setPositiveButton("Continue Shopping") { _, _ ->
                // Go back to main activity
                val intent = Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(intent)
                finish()
            }
            .setCancelable(false)
            .create()

        dialog.show()

        println("🎉 Order confirmation dialog shown for order: $orderId")
    }
}