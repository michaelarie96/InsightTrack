# InsightTrack Analytics SDK

[![JitPack](https://jitpack.io/v/michaelarie96/InsightTrack.svg)](https://jitpack.io/#michaelarie96/InsightTrack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Complete Analytics SDK Ecosystem** - Track user behavior, sessions, events, and crashes with enterprise-grade analytics infrastructure

InsightTrack is a comprehensive analytics solution that provides developers with a powerful Android SDK, robust backend API, and intuitive admin dashboard to track and analyze user behavior in mobile applications.

## 🚀 Quick Start (5 Minutes)

### 1. Add to Your App

**In your app's `build.gradle`:**
```kotlin
dependencies {
    implementation 'com.github.michaelarie96:InsightTrack:v1.0.6'
}
```

### 2. Initialize (One Time Setup)

**Create or edit your Application class:**
```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        InsightTrackSDK.Builder.with(this)
            .setApiKey("your-api-key")  // Get this from the InsightTrack team
            .useProduction("insighttrack-dashboard.app")  // Demo server (not deployed)
            .build()
    }
}
```


### 3. Track Events (Anywhere in Your App)

```kotlin
// ✨ Super simple - just describe what happened
InsightTrackSDK.getInstance().trackEvent("User shared a photo")

// 📝 Simple with category
InsightTrackSDK.getInstance().trackEvent("button_click", "User tapped the like button")

// 🏢 Advanced (for complex apps)
InsightTrackSDK.getInstance().trackPurchase("order_123", 29.99)
```

**That's it!** Your app is now tracking user behavior. 

---

## 📖 Common Examples

### Basic User Actions (Custom Tracking)
```kotlin
// ✨ Simple custom events - describe anything that happens in your app
InsightTrackSDK.getInstance().trackEvent("User opened settings menu")
InsightTrackSDK.getInstance().trackEvent("User completed tutorial")
InsightTrackSDK.getInstance().trackEvent("User subscribed to premium")

// 📝 Custom events with categories - organize your tracking
InsightTrackSDK.getInstance().trackEvent("video_action", "User played intro video")
InsightTrackSDK.getInstance().trackEvent("social_share", "User shared on Instagram")
InsightTrackSDK.getInstance().trackEvent("tutorial_step", "User completed step 3")
```

### E-commerce Tracking (Built-in Methods)
```kotlin
// 🛍️ Use our specialized e-commerce tracking
InsightTrackSDK.getInstance().trackProductView("iphone15", "iPhone 15", 999.0, "Electronics")
InsightTrackSDK.getInstance().trackAddToCart("iphone15", "iPhone 15", 999.0, 1)
InsightTrackSDK.getInstance().trackCheckout()
InsightTrackSDK.getInstance().trackPurchase("order_456", 999.0)
```

### User Journey (Built-in Methods)
```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 👤 Use built-in user tracking
        InsightTrackSDK.getInstance().setUserId("user_12345")
        InsightTrackSDK.getInstance().trackLogin("email")
        InsightTrackSDK.getInstance().trackScreenView("MainActivity")
        
        // 🎯 Use built-in action tracking  
        findViewById<Button>(R.id.shareButton).setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("share_button")
            InsightTrackSDK.getInstance().trackFeatureUsed("social_sharing")
            // Your button logic here
        }
    }
}
```

---

## 🎯 What You Get

- **📊 Real-time Analytics Dashboard** - See user behavior instantly
- **📱 Screen Tracking** - Know which screens users visit most
- **💰 E-commerce Insights** - Track purchases and conversions
- **💥 Crash Reporting** - Automatically detect and report crashes
- **🌐 Offline Support** - Events saved when offline, sent when online
- **🔒 Privacy Focused** - GDPR compliant, no personal data required

---

## 🛠️ Advanced Features

### User Identification
```kotlin
// Set user ID after login
InsightTrackSDK.getInstance().setUserId("user_12345")

// Track login/logout
InsightTrackSDK.getInstance().trackLogin("email")
InsightTrackSDK.getInstance().trackLogout()
```

### Detailed E-commerce
```kotlin
// Track complete purchase flow
InsightTrackSDK.getInstance().trackProductView("laptop_pro", "MacBook Pro", 2399.0, "Computers")
InsightTrackSDK.getInstance().trackAddToCart("laptop_pro", "MacBook Pro", 2399.0, 1)
InsightTrackSDK.getInstance().trackCheckout()
InsightTrackSDK.getInstance().trackPurchase("order_789", 2399.0, itemsList)
```

### Custom Properties
```kotlin
// Add custom data to any event
InsightTrackSDK.getInstance().trackEvent("level_completed", mapOf(
    "level" to 5,
    "score" to 1250,
    "time_spent" to 120,
    "difficulty" to "hard"
))
```

### Error Tracking
```kotlin
// Automatic crash reporting (set up in Application class)
try {
    riskyOperation()
} catch (exception: Exception) {
    InsightTrackSDK.getInstance().logCrash(exception)
}
```

---

## 🔧 Configuration Options

### Development vs Production
```kotlin
// For development (local testing)
InsightTrackSDK.Builder.with(this)
    .setApiKey("test-key")
    .useLocalDevelopment(5001)  // Your local server port
    .build()

// For production
InsightTrackSDK.Builder.with(this)
    .setApiKey("your-production-key")
    .useProduction("insighttrack-dashboard.app")  // Demo server (not deployed)
    .build()
```

### All Configuration Options
```kotlin
InsightTrackSDK.Builder.with(this)
    .setApiKey("your-api-key")                    // Required
    .useProduction("insighttrack-dashboard.app")  // Demo server (not deployed)
    .useLocalDevelopment(5001)                    // OR local development
    .build()
```

---

## 📋 Requirements

- **Minimum Android**: API 26 (Android 8.0)
- **Permissions**: Internet access (automatically added)
- **Size**: < 500KB added to your app

---

## 🆘 Troubleshooting

### "SDK not initialized" Error
```kotlin
// Make sure you call this in your Application class onCreate():
InsightTrackSDK.Builder.with(this).setApiKey("your-key").build()
```

### Events Not Showing Up
1. **Check internet connection** - Events are queued offline and sent when online
2. **Verify API key** - Make sure you're using the correct key
3. **Check logs** - Look for "📊 Event tracked" messages in Android Studio

### Testing During Development
```kotlin
// Add this button to test your integration:
findViewById<Button>(R.id.testButton).setOnClickListener {
    InsightTrackSDK.getInstance().trackEvent("Test button clicked - analytics working!")
}
```

### Local Development Setup

If you want to test with a local server (HTTP), you'll need to allow cleartext traffic:

**1. Create network security config**
Create file: `app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
    </domain-config>
</network-security-config>
```

**2. Add to AndroidManifest.xml**
```xml
<application
    android:name=".MyApplication"
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

**Note**: This is only needed for development with HTTP. Production apps using HTTPS don't need this configuration.


---

## 🤝 Need Help?

- **📧 Email**: michael.arie@s.afeka.ac.il

---

## 📄 License

MIT License - use in any project, commercial or personal.
