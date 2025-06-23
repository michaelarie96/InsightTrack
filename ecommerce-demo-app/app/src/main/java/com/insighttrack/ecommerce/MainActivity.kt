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
import com.insighttrack.ecommerce.data.Product
import com.insighttrack.ecommerce.data.ProductCatalog

/**
 * Main Product List Screen
 *
 * This screen shows all products and handles:
 * - Product browsing with analytics tracking
 * - Search functionality with search analytics
 * - Category filtering with filter analytics
 * - Add to cart with e-commerce analytics
 * - Navigation to cart screen
 */
class MainActivity : AppCompatActivity() {

    // UI elements
    private lateinit var productsContainer: LinearLayout
    private lateinit var cartButton: Button
    private lateinit var searchInput: EditText

    // Current state
    private var currentProducts = ProductCatalog.products
    private var currentFilter = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initializeViews()

        setupClickListeners()

        displayProducts(currentProducts)

        // Track screen view analytics
        InsightTrackSDK.getInstance().trackScreenView("ProductListScreen")
        InsightTrackSDK.getInstance().trackEvent("product_list_viewed", mapOf(
            "total_products" to ProductCatalog.products.size,
            "categories_available" to ProductCatalog.getCategories().size
        ))

        println("📱 Product List Screen loaded with ${ProductCatalog.products.size} products")
    }

    override fun onResume() {
        super.onResume()
        // Update cart button count when returning from other screens
        updateCartButton()
    }

    private fun initializeViews() {
        productsContainer = findViewById(R.id.products_container)
        cartButton = findViewById(R.id.cart_button)
        searchInput = findViewById(R.id.search_input)

        updateCartButton()
    }

    private fun setupClickListeners() {

        // Cart button - navigate to cart screen
        cartButton.setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("cart_button", mapOf(
                "cart_items" to CartManager.itemCount,
                "cart_total" to CartManager.totalPrice,
                "source_screen" to "product_list"
            ))

            // TODO: Navigate to cart screen
            println("🛒 Cart button clicked - will navigate to cart screen")
        }

        // Search button
        findViewById<Button>(R.id.search_button).setOnClickListener {
            val query = searchInput.text.toString().trim()

            InsightTrackSDK.getInstance().trackButtonClick("search_button")

            if (query.isNotEmpty()) {
                performSearch(query)
            } else {
                // Empty search = show all products
                displayProducts(ProductCatalog.products)
                currentFilter = "All"
            }
        }

        // Category filter buttons
        findViewById<Button>(R.id.all_categories_button).setOnClickListener {
            filterByCategory("All")
        }

        findViewById<Button>(R.id.electronics_button).setOnClickListener {
            filterByCategory("Electronics")
        }

        findViewById<Button>(R.id.computers_button).setOnClickListener {
            filterByCategory("Computers")
        }
    }

    private fun performSearch(query: String) {
        val filteredProducts = ProductCatalog.products.filter { product ->
            product.name.contains(query, ignoreCase = true) ||
                    product.description.contains(query, ignoreCase = true) ||
                    product.category.contains(query, ignoreCase = true)
        }

        displayProducts(filteredProducts)
        currentFilter = "Search: $query"

        // Track search event
        InsightTrackSDK.getInstance().trackSearch(
            query,
            filteredProducts.size,
            additionalProperties = mapOf(
                "search_categories" to filteredProducts.map { it.category }.distinct(),
                "has_results" to (filteredProducts.isNotEmpty()),
                "source_screen" to "product_list",
                "previous_filter" to currentFilter
            )
        )

        println("🔍 Search performed: '$query' → ${filteredProducts.size} results")
    }

    private fun filterByCategory(category: String) {
        val filteredProducts = if (category == "All") {
            ProductCatalog.products
        } else {
            ProductCatalog.getByCategory(category)
        }

        displayProducts(filteredProducts)
        currentFilter = category

        // Track category filter event
        InsightTrackSDK.getInstance().trackEvent("category_filter_applied", mapOf(
            "selected_category" to category,
            "results_count" to filteredProducts.size,
            "previous_filter" to currentFilter
        ))

        println("📂 Category filter applied: '$category' → ${filteredProducts.size} products")
    }

    private fun displayProducts(products: List<Product>) {
        // Clear existing products
        productsContainer.removeAllViews()

        if (products.isEmpty()) {
            // Show "no products" message
            val noProductsText = TextView(this).apply {
                text = "😔 No products found"
                textSize = 16f
                setPadding(16, 32, 16, 32)
            }
            productsContainer.addView(noProductsText)

            // Track empty results analytics
            InsightTrackSDK.getInstance().trackEvent("empty_product_results", mapOf(
                "filter_applied" to currentFilter
            ))

            return
        }

        // Create and add product views
        products.forEach { product ->
            val productView = createProductView(product)
            productsContainer.addView(productView)
        }

        println("📦 Displayed ${products.size} products")
    }

    /**
     * Create a view for an individual product
     */
    private fun createProductView(product: Product): LinearLayout {
        // Inflate the product item layout
        val productView = LayoutInflater.from(this)
            .inflate(R.layout.product_item, null) as LinearLayout

        // Fill in product details
        productView.findViewById<TextView>(R.id.product_name).text = product.name
        productView.findViewById<TextView>(R.id.product_price).text = "$${product.price}"
        productView.findViewById<TextView>(R.id.product_category).text = product.category
        productView.findViewById<TextView>(R.id.product_description).text = product.description

        // Set up click listeners for this product
        setupProductClickListeners(productView, product)

        return productView
    }

    private fun setupProductClickListeners(productView: LinearLayout, product: Product) {

        productView.findViewById<Button>(R.id.view_product_button).setOnClickListener {

            // Track product view event
            InsightTrackSDK.getInstance().trackProductView(
                product.id,
                product.name,
                product.price,
                product.category,
                additionalProperties = mapOf(
                    "view_source" to "product_list",
                    "current_filter" to currentFilter,
                    "product_position" to getCurrentProductPosition(product),
                    "cart_items_count" to CartManager.itemCount
                )
            )

            println("👁️ Product viewed: ${product.name}")
        }

        productView.findViewById<Button>(R.id.add_to_cart_button).setOnClickListener {
            CartManager.addProduct(product, 1)
            InsightTrackSDK.getInstance().trackButtonClick("add_to_cart_button")
            updateCartButton()
        }
    }

    private fun updateCartButton() {
        val itemCount = CartManager.itemCount
        val totalPrice = CartManager.totalPrice

        cartButton.text = if (itemCount > 0) {
            "🛒 Cart ($itemCount) - $${String.format("%.2f", totalPrice)}"
        } else {
            "🛒 Cart (0)"
        }
    }

    /**
     * Get the position of a product in the current displayed list
     */
    private fun getCurrentProductPosition(product: Product): Int {
        return currentProducts.indexOf(product) + 1 // 1-based position
    }
}