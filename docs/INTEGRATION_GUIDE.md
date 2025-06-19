# InsightTrack Analytics - Integration Guide

[![JitPack](https://jitpack.io/v/michaelarie96/InsightTrack.svg)](https://jitpack.io/#michaelarie96/InsightTrack)

> **5-Minute Integration** - Add powerful analytics to your Android app

## Quick Setup

### 1. Add Repository

**In your project-level `build.gradle.kts`:**

```kotlin
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

### 2. Add Dependency

**In your app-level `build.gradle.kts`:**

```kotlin
dependencies {
    implementation 'com.github.yourusername:insighttrack-analytics:v1.0.4'
}
```

### 3. Initialize SDK

**In your Application class:**

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        InsightTrackSDK.Builder.with(this)
            .setApiKey("your-api-key")
            .useProduction("your-api-domain.com")
            .build()
    }
}
```

**Don't forget to add the Application class to your `AndroidManifest.xml`:**

```xml
<application
    android:name=".MyApplication"
    ...>
```

### 4. Track Events

**In your activities:**

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Track screen view
        InsightTrackSDK.getInstance().trackScreenView("MainActivity")
        
        // Track user actions
        button.setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("main_button")
        }
    }
}
```

### 5. Development vs Production

**For Development (HTTP endpoints):**
```kotlin
// Add network security config for local testing
// See troubleshooting section below
InsightTrackSDK.Builder.with(this)
    .setApiKey("test-key")
    .useLocalDevelopment(5001)
    .build()
```

**For Production (HTTPS endpoints):**
```kotlin
// No special configuration needed - HTTPS works automatically
InsightTrackSDK.Builder.with(this)
    .setApiKey("your-production-key")
    .useProduction("your-analytics-api.vercel.app")
    .build()
```

## API Reference

### Core Methods

```kotlin
// User tracking
InsightTrackSDK.getInstance().setUserId("user_123")
InsightTrackSDK.getInstance().trackLogin("email")
InsightTrackSDK.getInstance().trackLogout()

// Event tracking
InsightTrackSDK.getInstance().trackEvent("custom_event", mapOf(
    "property" to "value"
))

// Screen tracking
InsightTrackSDK.getInstance().trackScreenView("ScreenName")

// E-commerce
InsightTrackSDK.getInstance().trackPurchase("order_123", 29.99)
```

### Configuration Options

```kotlin
InsightTrackSDK.Builder.with(context)
    .setApiKey("your-api-key")                    // Required
    .useProduction("your-domain.com")             // Production server
    .useLocalDevelopment(5001)                    // Local development
    .build()
```

## Requirements

- **Minimum SDK**: API 26 (Android 8.0)
- **Target SDK**: API 35
- **Permissions**: `INTERNET`, `ACCESS_NETWORK_STATE` (automatically added)

## Features

- ✅ **Offline Support** - Events queued when offline, sent when online
- ✅ **Automatic Session Tracking** - No manual session management needed
- ✅ **Crash Reporting** - Automatic crash detection and reporting
- ✅ **Easy Integration** - Single line initialization
- ✅ **Lightweight** - Minimal impact on app performance

## Troubleshooting

### Build Errors

**JitPack not found:**
```
Make sure you added the JitPack repository to your project-level settings.gradle.kts
```

**Import errors:**
```
Check that you're using the correct version tag (v1.0.3)
Verify: implementation("com.github.michaelarie96:InsightTrack:v1.0.3")
```

### Runtime Issues

**SDK not initialized:**
```
Make sure you call InsightTrackSDK.Builder.with(context).build() 
in your Application onCreate() method
```

**No events being sent:**
```
Check your API key and network connection
Events are stored offline and will be sent when connection is restored
```

### Development Setup

**Testing with local servers (HTTP):**

If you're testing with a local development server, you'll need to allow HTTP connections:

1. Create `app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">10.0.2.2</domain>
        <domain includeSubdomains="false">localhost</domain>
    </domain-config>
</network-security-config>
```

2. Add to your `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

**Note**: This is only needed for development with HTTP. Production apps using HTTPS don't need this configuration.

## Support

- 📧 **Email**: michaelarie96@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/insighttrack-analytics/issues)
- 📖 **Documentation**: [Full Documentation](https://github.com/yourusername/insighttrack-analytics)

---

**Made with ❤️ by the InsightTrack team**
