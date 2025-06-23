package com.insighttrack.ecommerce

import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.insighttrack.analytics.InsightTrackSDK
import com.insighttrack.ecommerce.data.CartManager
import com.insighttrack.ecommerce.data.CartItem

/**
 * Cart Screen - Shows items in shopping cart
 *
 * This screen handles:
 * - Displaying all cart items with quantities and prices
 * - Allowing quantity changes (+ and - buttons)
 * - Removing items from cart
 * - Showing cart totals
 * - Proceeding to checkout
 * - Analytics tracking for all cart operations
 */
class CartActivity : AppCompatActivity() {

    // UI elements
    private lateinit var cartItemsContainer: LinearLayout
    private lateinit var totalItemsText: TextView
    private lateinit var totalPriceText: TextView
    private lateinit var checkoutButton: Button
    private lateinit var clearCartButton: Button
    private lateinit var emptyCartMessage: LinearLayout
    private lateinit var cartSummarySection: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cart)

        initializeViews()
        setupClickListeners()
        displayCartItems()

        // Track screen view analytics
        InsightTrackSDK.getInstance().trackScreenView("CartScreen")
        InsightTrackSDK.getInstance().trackEvent("cart_screen_viewed", mapOf(
            "cart_items_count" to CartManager.itemCount,
            "cart_total_value" to CartManager.totalPrice,
            "source" to "product_list_navigation"
        ))

        println("🛒 Cart screen loaded with ${CartManager.itemCount} items")
    }

    private fun initializeViews() {
        cartItemsContainer = findViewById(R.id.cart_items_container)
        totalItemsText = findViewById(R.id.total_items_text)
        totalPriceText = findViewById(R.id.total_price_text)
        checkoutButton = findViewById(R.id.checkout_button)
        clearCartButton = findViewById(R.id.clear_cart_button)
        cartSummarySection = findViewById(R.id.cart_summary_section)

        updateCartSummary()
    }

    private fun setupClickListeners() {

        // Back button - return to product list
        findViewById<Button>(R.id.back_button).setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("back_button", mapOf(
                "source_screen" to "cart",
                "cart_items" to CartManager.itemCount,
                "cart_abandoned" to true
            ))

            finish()
        }

        // Clear cart button - remove all items
        clearCartButton.setOnClickListener {
            if (CartManager.itemCount > 0) {
                val itemsBeforeClear = CartManager.itemCount
                val valueBeforeClear = CartManager.totalPrice

                CartManager.clearCart()

                // Refresh the display
                displayCartItems()

                println("🧹 Cart cleared: $itemsBeforeClear items, $$valueBeforeClear")
            }
        }

        // Checkout button - proceed to checkout
        checkoutButton.setOnClickListener {
            if (CartManager.itemCount > 0) {

                // Track checkout initiation
                InsightTrackSDK.getInstance().trackCheckout()

                // TODO: Navigate to checkout screen
                println("💳 Proceeding to checkout with ${CartManager.itemCount} items, $${String.format("%.2f", CartManager.totalPrice)}")

                // For now, just show a message
                println("🚧 Checkout screen not implemented yet - this would navigate to payment")

            } else {
                println("⚠️ Cannot checkout with empty cart")
            }
        }
    }

    private fun displayCartItems() {
        // Clear existing views
        cartItemsContainer.removeAllViews()

        val cartItems = CartManager.cartItems

        if (cartItems.isEmpty()) {
            showEmptyCartState()
        } else {
            showCartItemsState()

            // Create view for each cart item
            cartItems.forEach { cartItem ->
                val itemView = createCartItemView(cartItem)
                cartItemsContainer.addView(itemView)
            }
        }

        updateCartSummary()
    }

    private fun showEmptyCartState() {
        findViewById<TextView>(R.id.empty_cart_message).visibility = android.view.View.VISIBLE
        cartSummarySection.visibility = android.view.View.GONE
        checkoutButton.isEnabled = false
        clearCartButton.isEnabled = false
        checkoutButton.text = "Cart is Empty"
    }

    private fun showCartItemsState() {
        findViewById<TextView>(R.id.empty_cart_message).visibility = android.view.View.GONE
        cartSummarySection.visibility = android.view.View.VISIBLE
        checkoutButton.isEnabled = true
        clearCartButton.isEnabled = true
        checkoutButton.text = "💳 Proceed to Checkout"
    }

    private fun createCartItemView(cartItem: CartItem): LinearLayout {
        // Inflate the cart item layout
        val itemView = LayoutInflater.from(this)
            .inflate(R.layout.cart_item, null) as LinearLayout

        // Fill in item details
        itemView.findViewById<TextView>(R.id.cart_item_name).text = cartItem.product.name
        itemView.findViewById<TextView>(R.id.cart_item_category).text = cartItem.product.category
        itemView.findViewById<TextView>(R.id.cart_item_unit_price).text = "$${cartItem.product.price} each"
        itemView.findViewById<TextView>(R.id.cart_item_quantity).text = cartItem.quantity.toString()
        itemView.findViewById<TextView>(R.id.cart_item_total_price).text = "$${String.format("%.2f", cartItem.totalPrice)}"

        // Set up click listeners for this item
        setupCartItemClickListeners(itemView, cartItem)

        return itemView
    }

    /**
     * Set up click listeners for individual cart item controls
     */
    private fun setupCartItemClickListeners(itemView: LinearLayout, cartItem: CartItem) {

        // Decrease quantity button
        itemView.findViewById<Button>(R.id.decrease_quantity_button).setOnClickListener {
            val newQuantity = cartItem.quantity - 1

            if (newQuantity <= 0) {
                CartManager.removeProduct(cartItem.product.id)
            } else {
                CartManager.updateQuantity(cartItem.product.id, newQuantity)
            }

            // Refresh the display
            displayCartItems()
        }

        // Increase quantity button
        itemView.findViewById<Button>(R.id.increase_quantity_button).setOnClickListener {
            val newQuantity = cartItem.quantity + 1

            CartManager.updateQuantity(cartItem.product.id, newQuantity)

            // Refresh the display
            displayCartItems()
        }

        // Remove item button
        itemView.findViewById<Button>(R.id.remove_item_button).setOnClickListener {
            CartManager.removeProduct(cartItem.product.id)

            // Refresh the display
            displayCartItems()

            println("🗑️ Removed ${cartItem.product.name} from cart")
        }
    }

    private fun updateCartSummary() {
        totalItemsText.text = CartManager.totalQuantity.toString()
        totalPriceText.text = "$${String.format("%.2f", CartManager.totalPrice)}"

        println("📊 Cart summary updated: ${CartManager.totalQuantity} items, $${String.format("%.2f", CartManager.totalPrice)}")
    }
}