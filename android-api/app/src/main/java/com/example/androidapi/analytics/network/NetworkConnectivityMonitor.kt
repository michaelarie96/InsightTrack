package com.example.androidapi.analytics.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest

/**
 * Monitors network connectivity changes and notifies when internet becomes available
 */
class NetworkConnectivityMonitor(private val context: Context) {

    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    private var isNetworkAvailable = false
    private var networkCallbackListener: NetworkCallbackListener? = null

    /**
     * Interface to notify when network status changes
     */
    interface NetworkCallbackListener {
        fun onNetworkAvailable()
        fun onNetworkLost()
    }

    /**
     * Start monitoring network changes
     */
    fun startMonitoring(listener: NetworkCallbackListener) {
        this.networkCallbackListener = listener

        connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        checkCurrentNetworkStatus()

        // Create network request for internet connectivity
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
            .build()

        // Create callback to listen for network changes
        networkCallback = object : ConnectivityManager.NetworkCallback() {

            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                println("🌐 Network became available!")

                if (!isNetworkAvailable) {
                    isNetworkAvailable = true
                    networkCallbackListener?.onNetworkAvailable()
                }
            }

            override fun onLost(network: Network) {
                super.onLost(network)
                println("📴 Network lost!")

                if (isNetworkAvailable) {
                    isNetworkAvailable = false
                    networkCallbackListener?.onNetworkLost()
                }
            }

            override fun onCapabilitiesChanged(
                network: Network,
                networkCapabilities: NetworkCapabilities
            ) {
                super.onCapabilitiesChanged(network, networkCapabilities)

                val hasInternet = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                val isValidated = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)

                println("🔍 Network capabilities changed - Internet: $hasInternet, Validated: $isValidated")

                // Only consider network available if it has validated internet access
                val newNetworkStatus = hasInternet && isValidated

                if (newNetworkStatus != isNetworkAvailable) {
                    isNetworkAvailable = newNetworkStatus

                    if (isNetworkAvailable) {
                        networkCallbackListener?.onNetworkAvailable()
                    } else {
                        networkCallbackListener?.onNetworkLost()
                    }
                }
            }
        }

        // Register the callback
        networkCallback?.let {
            connectivityManager?.registerNetworkCallback(networkRequest, it)
            println("✅ Network monitoring started")
        }
    }

    /**
     * Stop monitoring network changes (call this when done)
     */
    fun stopMonitoring() {
        networkCallback?.let { callback ->
            connectivityManager?.unregisterNetworkCallback(callback)
            println("🔒 Network monitoring stopped")
        }
        networkCallback = null
        networkCallbackListener = null
    }

    /**
     * Check if network is currently available
     */
    fun isNetworkCurrentlyAvailable(): Boolean {
        return isNetworkAvailable
    }

    /**
     * Check current network status without callback
     */
    private fun checkCurrentNetworkStatus() {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = connectivityManager.activeNetwork
        val networkCapabilities = connectivityManager.getNetworkCapabilities(activeNetwork)

        isNetworkAvailable = networkCapabilities?.let {
            it.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                    it.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        } ?: false

        println("📊 Current network status: ${if (isNetworkAvailable) "Available" else "Not available"}")
    }
}