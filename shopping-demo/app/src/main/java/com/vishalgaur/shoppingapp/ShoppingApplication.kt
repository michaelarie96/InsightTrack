package com.vishalgaur.shoppingapp

import android.app.Application
import com.insighttrack.analytics.InsightTrackSDK
import com.vishalgaur.shoppingapp.data.source.repository.AuthRepoInterface
import com.vishalgaur.shoppingapp.data.source.repository.ProductsRepoInterface

class ShoppingApplication : Application() {
	val authRepository: AuthRepoInterface
		get() = ServiceLocator.provideAuthRepository(this)

	val productsRepository: ProductsRepoInterface
		get() = ServiceLocator.provideProductsRepository(this)

	override fun onCreate() {
		super.onCreate()

		// Initialize InsightTrack Analytics SDK
		InsightTrackSDK.Builder.with(this)
			.setApiKey("shopping-demo-key")  // Demo API key
			.useProduction("insighttrack-analytics-api.vercel.app")  // Your production API
			.build()
	}
}