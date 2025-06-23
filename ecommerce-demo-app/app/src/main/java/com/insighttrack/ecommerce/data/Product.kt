package com.insighttrack.ecommerce.data

/**
 * Product data class
 */
data class Product(
    val id: String,
    val name: String,
    val price: Double,
    val category: String,
    val description: String,
    val inStock: Boolean = true
)

/**
 * Shopping cart item - combines a product with quantity
 */
data class CartItem(
    val product: Product,
    var quantity: Int = 1
) {
    val totalPrice: Double
        get() = product.price * quantity
}

/**
 * Hardcoded product catalog
 */
object ProductCatalog {

    val products = listOf(
        Product(
            id = "iphone15",
            name = "iPhone 15",
            price = 799.99,
            category = "Electronics",
            description = "Latest iPhone with advanced camera"
        ),
        Product(
            id = "samsung_s24",
            name = "Samsung Galaxy S24",
            price = 699.99,
            category = "Electronics",
            description = "Premium Android smartphone"
        ),
        Product(
            id = "macbook_air",
            name = "MacBook Air M2",
            price = 1199.99,
            category = "Computers",
            description = "Lightweight laptop for everyday use"
        ),
        Product(
            id = "dell_laptop",
            name = "Dell XPS 13",
            price = 999.99,
            category = "Computers",
            description = "Compact Windows laptop"
        ),
        Product(
            id = "airpods_pro",
            name = "AirPods Pro",
            price = 249.99,
            category = "Electronics",
            description = "Wireless earbuds with noise cancellation"
        ),
        Product(
            id = "kindle",
            name = "Kindle Paperwhite",
            price = 139.99,
            category = "Books",
            description = "E-reader with backlight"
        )
    )

    fun findById(productId: String): Product? {
        return products.find { it.id == productId }
    }

    fun getByCategory(category: String): List<Product> {
        return products.filter { it.category == category }
    }

    fun getCategories(): List<String> {
        return products.map { it.category }.distinct().sorted()
    }
}