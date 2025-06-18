# InsightTrack Analytics API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API-Live-green)](https://insighttrack-analytics-api.vercel.app/health)
[![JitPack](https://jitpack.io/v/yourusername/insighttrack-analytics.svg)](https://jitpack.io/#yourusername/insighttrack-analytics)
[![Documentation](https://img.shields.io/badge/docs-live-blue)](https://yourusername.github.io/insighttrack-analytics/)

> **Complete Analytics SDK Ecosystem** - Track user behavior, sessions, events, and crashes with enterprise-grade analytics infrastructure

InsightTrack is a comprehensive analytics solution that provides developers with a powerful Android SDK, robust backend API, and intuitive admin dashboard to track and analyze user behavior in mobile applications.

## 🚀 Live Demo

- **🌐 Admin Portal**: `https://[your-admin-portal].vercel.app` *(Coming Soon)*
- **📊 API Documentation**: `https://[your-api-domain].vercel.app/apidocs` *(Coming Soon)*
- **📱 Example App**: `[Download APK from releases]` *(Coming Soon)*

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Android SDK](#-android-sdk)
- [Backend API](#-backend-api)
- [Admin Portal](#-admin-portal)
- [Documentation](#-documentation)
- [Examples](#-examples)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 📱 Android SDK
- **🔧 Easy Integration** - Single line initialization
- **📊 Comprehensive Tracking** - Users, sessions, events, crashes
- **🌐 Smart Offline Support** - Queue events when offline, sync when online
- **⚡ High Performance** - Minimal battery and memory impact
- **🎯 Real-time Analytics** - Instant data collection and transmission
- **🔒 Privacy Focused** - GDPR compliant data handling

### 🖥️ Backend API
- **🔌 RESTful Architecture** - Clean, documented API endpoints
- **🗄️ MongoDB Integration** - Scalable NoSQL data storage
- **🔗 Multi-tenant Support** - Package-based data isolation
- **📈 Real-time Analytics** - Live data aggregation and statistics
- **🌍 Cloud Deployment** - Deployed on Vercel with global CDN
- **📝 Swagger Documentation** - Interactive API documentation

### 📊 Admin Dashboard
- **📈 Rich Visualizations** - Charts, graphs, and metrics
- **👥 User Analytics** - Active users, retention, geographic distribution
- **🎯 Event Tracking** - Custom and predefined event monitoring
- **💥 Crash Reporting** - Detailed crash analysis and stack traces
- **📱 Session Analytics** - Duration, frequency, and behavior patterns
- **🕐 Real-time Updates** - Live data streaming and updates

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Mobile Apps"
        A[Android App 1]
        B[Android App 2]
        C[Android App N]
    end
    
    subgraph "InsightTrack SDK"
        D[Analytics SDK]
        E[Offline Storage]
        F[Network Manager]
    end
    
    subgraph "Backend Infrastructure"
        G[Flask API Server]
        H[MongoDB Atlas]
        I[Swagger Docs]
    end
    
    subgraph "Admin Interface"
        J[React Dashboard]
        K[Charts & Analytics]
        L[Real-time Updates]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    F --> G
    G --> H
    G --> I
    J --> G
    J --> K
    J --> L
```

## 🚀 Quick Start

### 1. Add SDK to Your Android Project

Add to your app's `build.gradle`:

```kotlin
dependencies {
    implementation 'com.github.yourusername:insighttrack-analytics:1.0.0'
}
```

### 2. Initialize in Application Class

```kotlin
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        InsightTrackSDK.Builder.with(this)
            .setApiKey("your-api-key")
            .useProduction("insighttrack-analytics-api.vercel.app")
            .build()
    }
}
```

### 3. Start Tracking Events

```kotlin
// Track user actions
InsightTrackSDK.getInstance().trackLogin("email")
InsightTrackSDK.getInstance().trackScreenView("HomeScreen")
InsightTrackSDK.getInstance().trackPurchase("order_123", 29.99)

// Track custom events
InsightTrackSDK.getInstance().trackEvent("custom_action", mapOf(
    "feature" to "premium",
    "value" to 42
))
```

That's it! Your app is now sending analytics data to InsightTrack.

## 📱 Android SDK

### Installation

#### Option 1: JitPack (Recommended)
```kotlin
// In project build.gradle
allprojects {
    repositories {
        maven { url 'https://jitpack.io' }
    }
}

// In app build.gradle
dependencies {
    implementation 'com.github.yourusername:insighttrack-analytics:1.0.0'
}
```

#### Option 2: Local Development
```kotlin
// Clone the repository and include as module
implementation project(':analytics')
```

### Configuration

```kotlin
class YourApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        InsightTrackSDK.Builder.with(this)
            .setApiKey("your-api-key")                    // Required
            .useProduction("your-domain.com")             // Production API
            // OR
            .useLocalDevelopment(5001)                    // Local development
            .build()
    }
}
```

### Core Features

#### User Tracking
```kotlin
// Set user identifier
InsightTrackSDK.getInstance().setUserId("user_12345")

// Track user actions
InsightTrackSDK.getInstance().trackLogin("google")
InsightTrackSDK.getInstance().trackLogout()
InsightTrackSDK.getInstance().trackProfileUpdated()
```

#### Event Tracking
```kotlin
// Predefined events
InsightTrackSDK.getInstance().trackScreenView("ProductScreen")
InsightTrackSDK.getInstance().trackButtonClick("checkout_btn")
InsightTrackSDK.getInstance().trackFeatureUsed("premium_search")

// Custom events with properties
InsightTrackSDK.getInstance().trackEvent("video_played", mapOf(
    "video_id" to "abc123",
    "duration" to 120,
    "quality" to "HD"
))
```

#### E-commerce Tracking
```kotlin
// Product interactions
InsightTrackSDK.getInstance().trackProductView(
    productId = "phone_001",
    productName = "Smartphone Pro",
    price = 699.99,
    category = "Electronics"
)

// Purchase tracking
InsightTrackSDK.getInstance().trackPurchase(
    orderId = "order_12345",
    total = 699.99,
    items = listOf(
        mapOf(
            "product_id" to "phone_001",
            "quantity" to 1,
            "price" to 699.99
        )
    )
)
```

#### Session Management
```kotlin
// Automatic session tracking (handled by lifecycle callbacks)
// Manual session control
InsightTrackSDK.getInstance().startSession()
InsightTrackSDK.getInstance().endSession()
```

#### Crash Reporting
```kotlin
// Automatic crash reporting (set up in Application class)
// Manual error logging
try {
    riskyOperation()
} catch (exception: Exception) {
    InsightTrackSDK.getInstance().logCrash(exception)
}

// Custom error logging
InsightTrackSDK.getInstance().logError("validation_error", "Invalid email format")
```

### Offline Support

The SDK automatically handles offline scenarios:

- **📴 Offline Queueing**: Events are stored locally when offline
- **🔄 Auto Retry**: Automatic retry when connection is restored
- **💾 Persistent Storage**: Events survive app restarts
- **🧹 Smart Cleanup**: Automatic cleanup of corrupted events

## 🔧 Backend API

### Architecture

The backend API is built with Flask and deployed on Vercel with MongoDB Atlas for data storage.

#### Project Structure
```
backend/
├── app.py                          # Main Flask application
├── routes.py                       # Route registration
├── mongodb_connection_manager.py   # Database connection
├── controllers/
│   ├── events.py                  # Event tracking endpoints
│   ├── users.py                   # User management
│   ├── sessions.py                # Session analytics
│   └── crashes.py                 # Crash reporting
├── requirements.txt               # Dependencies
└── vercel.json                    # Deployment config
```

### API Endpoints

#### Events API
```http
POST   /analytics/events                   # Log new event
GET    /analytics/events/{package}         # Get events for package
GET    /analytics/events/{package}/stats   # Event statistics
```

#### Users API
```http
POST   /analytics/users                    # Register user
GET    /analytics/users/{package}          # Get users for package
GET    /analytics/users/{package}/active   # Get active users
GET    /analytics/users/{package}/by-country # Geographic distribution
```

#### Sessions API
```http
POST   /analytics/sessions                 # Start/end session
GET    /analytics/sessions/{package}       # Get session data
GET    /analytics/sessions/{package}/stats # Session statistics
```

#### Health & Documentation
```http
GET    /health                            # API health check
GET    /apidocs                           # Swagger documentation
```

### Example Requests

#### Logging an Event
```bash
curl -X POST https://[your-api-domain].vercel.app/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "package_name": "com.example.myapp",
    "event_type": "button_click",
    "user_id": "user_123",
    "timestamp": 1640995200000,
    "properties": {
      "button_id": "checkout",
      "screen": "product_page"
    }
  }'
```

#### Getting Event Statistics
```bash
curl https://[your-api-domain].vercel.app/analytics/events/com.example.myapp/stats
```

### Database Schema

#### Events Collection
```javascript
{
  "_id": "uuid",
  "event_type": "button_click",
  "user_id": "user_123",
  "session_id": "session_456",
  "timestamp": ISODate("2023-01-01T12:00:00Z"),
  "properties": {
    "button_id": "checkout",
    "value": 29.99
  },
  "device_info": {
    "model": "Pixel 6",
    "os_version": "13"
  },
  "created_at": ISODate("2023-01-01T12:00:01Z")
}
```

### Environment Variables

```bash
# Database Configuration
DB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=insighttrack_analytics

# API Configuration
SECRET_KEY=your-secret-key
API_VERSION=v1
```

## 📊 Admin Portal

### Features

#### Dashboard Overview
- **📈 Key Metrics**: Total users, active users, session duration, events, crash rate
- **📊 User Analytics**: Growth charts, retention analysis, geographic distribution
- **🎯 Event Analytics**: Top events, event frequency, custom event tracking
- **💥 Crash Reports**: Error tracking, stack traces, device information
- **📱 Session Analytics**: Duration distribution, activity patterns

#### Real-time Features
- **🔄 Live Updates**: Real-time data refresh
- **📅 Date Filtering**: Custom date ranges and period selection
- **🔍 Search & Filter**: Advanced filtering options
- **📊 Export Options**: CSV, PDF report generation

### Technology Stack
- **⚛️ React 18** - Modern UI framework
- **🎨 Tailwind CSS** - Utility-first styling
- **📊 Recharts** - Beautiful, responsive charts
- **🌐 Axios** - HTTP client for API communication
- **⚡ Vite** - Fast build tooling

### Running Locally

```bash
# Navigate to admin portal
cd admin-portal

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_BASE_URL=http://localhost:5001" > .env

# Start development server
npm run dev
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

### Available Documentation
- **🚀 This README** - Complete setup and integration guide
- **📖 Code Examples** - See the Examples section below
- **🔌 API Endpoints** - Documented in the Backend API section

### Interactive Documentation
- **📊 [Swagger API Docs]()** - In the Future?
- **🎮 [SDK Playground]()** - In the Future?

## 💻 Examples

### Basic Integration Example

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Track screen view
        InsightTrackSDK.getInstance().trackScreenView("MainActivity")
        
        // Track user interactions
        findViewById<Button>(R.id.button).setOnClickListener {
            InsightTrackSDK.getInstance().trackButtonClick("main_action")
            
            // Your button logic here
        }
    }
}
```

### E-commerce Integration

```kotlin
class ProductActivity : AppCompatActivity() {
    
    private val product = Product(
        id = "prod_123",
        name = "Wireless Headphones",
        price = 199.99,
        category = "Electronics"
    )
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Track product view
        InsightTrackSDK.getInstance().trackProductView(
            product.id,
            product.name,
            product.price,
            product.category
        )
        
        addToCartButton.setOnClickListener {
            // Track add to cart
            InsightTrackSDK.getInstance().trackAddToCart(
                product.id,
                product.name,
                product.price,
                quantity = 1
            )
            
            // Add to cart logic
        }
    }
}
```

### Custom Event Tracking

```kotlin
class GameActivity : AppCompatActivity() {
    
    private fun onLevelCompleted(level: Int, score: Int, timeSpent: Long) {
        // Track custom game event
        InsightTrackSDK.getInstance().trackEvent("level_completed", mapOf(
            "level" to level,
            "score" to score,
            "time_spent_seconds" to timeSpent / 1000,
            "difficulty" to "hard",
            "power_ups_used" to 3
        ))
    }
    
    private fun onInAppPurchase(item: String, price: Double) {
        // Track in-app purchase
        InsightTrackSDK.getInstance().trackPurchase(
            orderId = "iap_${System.currentTimeMillis()}",
            total = price,
            items = listOf(mapOf(
                "product_id" to item,
                "price" to price,
                "currency" to "USD",
                "type" to "in_app_purchase"
            ))
        )
    }
}
```

## 🚀 Deployment

### Backend Deployment (Vercel)

1. **Setup MongoDB Atlas**
   ```bash
   # Create cluster at https://cloud.mongodb.com
   # Get connection string
   # Configure network access and database user
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Navigate to backend directory
   cd backend
   
   # Deploy
   vercel --prod
   
   # Set environment variables in Vercel dashboard
   ```

3. **Environment Variables**
   ```bash
   DB_CONNECTION_STRING=mongodb+srv://...
   DB_NAME=insighttrack_analytics
   SECRET_KEY=your-production-secret
   ```

### Admin Portal Deployment

1. **Build and Deploy**
   ```bash
   cd admin-portal
   npm run build
   vercel --prod
   ```

2. **Environment Configuration**
   ```bash
   VITE_API_BASE_URL=https://[your-api-domain].vercel.app
   ```

### Android SDK Publishing (JitPack)

1. **Tag Release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **JitPack automatically builds from GitHub tags**
   - Visit [jitpack.io](https://jitpack.io)
   - Enter your repository URL
   - Build is triggered automatically

## 🧪 Testing

### Android SDK Tests
```bash
cd android-api
./gradlew test
./gradlew connectedAndroidTest
```

### Backend API Tests
```bash
cd backend
python -m pytest tests/
```

### Admin Portal Tests
```bash
cd admin-portal
npm test
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/insighttrack-analytics.git
   cd insighttrack-analytics
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Android Setup**
   ```bash
   cd android-api
   ./gradlew build
   ```

4. **Frontend Setup**
   ```bash
   cd admin-portal
   npm install
   npm run dev
   ```

### Code Style
- **Kotlin**: Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- **Python**: Follow [PEP 8](https://pep8.org/)
- **JavaScript**: Follow [Airbnb Style Guide](https://github.com/airbnb/javascript)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** - Cloud database hosting
- **Vercel** - Deployment and hosting platform
- **JitPack** - Android library distribution
- **Recharts** - React charting library
- **Retrofit** - Android networking library

- This project was developed as part of the Android Seminar course taught by Guy Isakov in the Afeka College of Engineering

## 📞 Support

- **📧 Email**: michaelarie96@gmail.com

---

<div align="center">

**[⭐ Star this repository](https://github.com/yourusername/insighttrack-analytics) | [🍴 Fork](https://github.com/yourusername/insighttrack-analytics/fork) | [📖 Documentation](https://yourusername.github.io/insighttrack-analytics/)**

Made with ❤️ by the InsightTrack team

</div>
