package com.insighttrack.ecommerce.data

import com.insighttrack.analytics.InsightTrackSDK

/**
 * Shopping Cart Manager (Singleton)
 *
 * Manages the user's shopping cart and tracks cart operations
 */
object CartManager {

    private val _cartItems = mutableListOf<CartItem>()

    // Read-only access to cart items
    val cartItems: List<CartItem> get() = _cartItems.toList()

    // Number of different items in cart
    val itemCount: Int get() = _cartItems.size

    // Calculate total cart value
    val totalPrice: Double get() = _cartItems.sumOf { it.totalPrice }

    // Total quantity of all products in cart
    val totalQuantity: Int get() = _cartItems.sumOf { it.quantity }


    fun addProduct(product: Product, quantity: Int = 1) {
        val existingItem = _cartItems.find { it.product.id == product.id }

        if (existingItem != null) {
            // Product already in cart - increase quantity
            existingItem.quantity += quantity

            println("📦 Updated cart: ${product.name} (now ${existingItem.quantity} items)")

            // Track event
            InsightTrackSDK.getInstance().trackEvent("cart_item_updated", mapOf(
                "product_id" to product.id,
                "product_name" to product.name,
                "new_quantity" to existingItem.quantity,
                "added_quantity" to quantity,
                "product_price" to product.price,
                "cart_total" to totalPrice
            ))

        } else {
            // New product - add to cart
            _cartItems.add(CartItem(product, quantity))

            println("🛒 Added to cart: ${product.name} (quantity: $quantity)")

            // Track event
            InsightTrackSDK.getInstance().trackAddToCart(
                product.id,
                product.name,
                product.price,
                quantity,
                additionalProperties = mapOf(
                    "product_category" to product.category,
                    "cart_items_count" to itemCount,
                    "cart_total" to totalPrice,
                    "source_screen" to "product_list",
                    "item_total" to (product.price * quantity)
                )
            )

        }
    }

    fun removeProduct(productId: String) {
        val item = _cartItems.find { it.product.id == productId }

        if (item != null) {
            _cartItems.remove(item)

            println("🗑️ Removed from cart: ${item.product.name}")

            // Track event
            InsightTrackSDK.getInstance().trackEvent("cart_item_removed", mapOf(
                "product_id" to item.product.id,
                "product_name" to item.product.name,
                "removed_quantity" to item.quantity,
                "removed_value" to item.totalPrice,
                "cart_items_remaining" to itemCount,
                "cart_total" to totalPrice
            ))
        }
    }

    fun updateQuantity(productId: String, newQuantity: Int) {
        if (newQuantity <= 0) {
            removeProduct(productId)
            return
        }

        val item = _cartItems.find { it.product.id == productId }
        if (item != null) {
            val oldQuantity = item.quantity
            item.quantity = newQuantity

            println("📝 Updated quantity: ${item.product.name} ($oldQuantity → $newQuantity)")

            // Track event
            InsightTrackSDK.getInstance().trackEvent("cart_quantity_changed", mapOf(
                "product_id" to item.product.id,
                "product_name" to item.product.name,
                "old_quantity" to oldQuantity,
                "new_quantity" to newQuantity,
                "cart_total" to totalPrice
            ))
        }
    }

    fun clearCart() {
        val itemCount = _cartItems.size
        val totalValue = totalPrice

        _cartItems.clear()

        println("🧹 Cart cleared ($itemCount items, $$totalValue)")

        // Track event
        InsightTrackSDK.getInstance().trackEvent("cart_cleared", mapOf(
            "items_count" to itemCount,
            "total_value" to totalValue
        ))
    }

    fun isEmpty(): Boolean = _cartItems.isEmpty()

    fun getCartSummary(): Map<String, Any> {
        return mapOf(
            "items_count" to itemCount,
            "total_quantity" to totalQuantity,
            "total_price" to totalPrice,
            "items" to _cartItems.map { cartItem ->
                mapOf(
                    "product_id" to cartItem.product.id,
                    "product_name" to cartItem.product.name,
                    "quantity" to cartItem.quantity,
                    "unit_price" to cartItem.product.price,
                    "total_price" to cartItem.totalPrice
                )
            }
        )
    }
}