/**
 * Mock Data Service - Rich demo data for presentation
 * This simulates what the analytics platform would look like with lots of data and variety
 * Used for demo purposes only, does not connect to a real API
 */

// Simulate API delay
const simulateDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockDataService = {
  /**
   * Get mock event statistics
   */
  async getEventStats(packageName) {
    await simulateDelay();

    return {
      package_name: packageName,
      total_events: 342611,
      top_events: [
        { name: "Login", value: 4000 },
        { name: "Search", value: 3000 },
        { name: "Product View", value: 2000 },
        { name: "Add to Cart", value: 1500 },
        { name: "Checkout", value: 1000 },
        { name: "Purchase", value: 800 },
        { name: "Button Click", value: 600 },
        { name: "Feature Used", value: 400 },
      ],
      daily_events: [
        { date: "2024-01-15", events: 1200 },
        { date: "2024-01-16", events: 1350 },
        { date: "2024-01-17", events: 1100 },
        { date: "2024-01-18", events: 1480 },
        { date: "2024-01-19", events: 1620 },
        { date: "2024-01-20", events: 1580 },
        { date: "2024-01-21", events: 1200 },
        { date: "2024-01-22", events: 1750 },
        { date: "2024-01-23", events: 1890 },
        { date: "2024-01-24", events: 1650 },
      ],
    };
  },

  /**
   * Get mock recent events
   */
  async getEvents(packageName, limit = 100) {
    await simulateDelay();

    const eventTypes = [
      "login",
      "product_view",
      "add_to_cart",
      "purchase",
      "search",
      "button_click",
      "logout",
      "settings_changed",
    ];
    const userIds = [
      "u_57928",
      "u_23451",
      "u_89023",
      "u_34512",
      "u_67890",
      "u_12345",
      "u_78901",
      "u_23456",
      "u_45678",
      "u_90123",
    ];

    const events = [];
    const now = new Date();

    for (let i = 0; i < Math.min(limit, 50); i++) {
      const eventTime = new Date(now.getTime() - i * 2 * 60 * 1000); // Events every 2 minutes
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const eventType =
        eventTypes[Math.floor(Math.random() * eventTypes.length)];

      // Create rich properties based on event type
      let properties = {};
      switch (eventType) {
        case "product_view":
          properties = {
            product_id: "demo_product_" + (i % 5),
            product_name: [
              "iPhone 15",
              "Samsung Galaxy S24",
              "MacBook Pro",
              "AirPods Pro",
              "iPad Air",
            ][i % 5],
            price: [799.99, 699.99, 1299.99, 249.99, 599.99][i % 5],
            category: "Electronics",
          };
          break;
        case "add_to_cart":
          properties = {
            product_id: "demo_product_" + (i % 3),
            quantity: Math.floor(Math.random() * 3) + 1,
            price: [799.99, 699.99, 1299.99][i % 3],
          };
          break;
        case "search":
          properties = {
            query: ["iPhone", "laptop", "headphones", "tablet"][
              Math.floor(Math.random() * 4)
            ],
            results_count: Math.floor(Math.random() * 20) + 5,
          };
          break;
        case "button_click":
          properties = {
            button_id: ["share_button", "like_button", "cart_button"][
              Math.floor(Math.random() * 3)
            ],
          };
          break;
        default:
          properties = {
            demo_mode: true,
            action: "user_interaction",
          };
      }

      // Create properties preview
      const propItems = Object.entries(properties).slice(0, 2);
      const propPreview = propItems.map(([k, v]) => `${k}: ${v}`).join(", ");

      events.push({
        _id: `mock_event_${i}`,
        event_type: eventType,
        user_id: userId,
        timestamp: eventTime.toISOString(),

        // Add the new fields that backend now provides
        full_date: eventTime.toISOString().split("T")[0], // YYYY-MM-DD
        time_only: eventTime.toTimeString().slice(0, 5), // HH:MM
        user_display:
          userId.length > 8 ? userId.substring(0, 8) + "..." : userId,
        properties_preview:
          propPreview.length > 40
            ? propPreview.substring(0, 40) + "..."
            : propPreview,

        properties: properties,
        device_info: {
          model: [
            "Samsung Galaxy S21",
            "Google Pixel 6",
            "Xiaomi Mi 11",
            "OnePlus 9",
          ][Math.floor(Math.random() * 4)],
          os_version: ["13", "12", "11"][Math.floor(Math.random() * 3)],
        },
      });
    }

    return {
      package_name: packageName,
      events: events,
      count: events.length,
    };
  },

  /**
   * Get mock user analytics with enhanced growth and retention data
   */
  async getUserStats(packageName) {
    await simulateDelay();

    return {
      package_name: packageName,
      total_users: 24521,
      active_users: 18432,
      new_users_today: 342,

      // Enhanced user growth over last 30 days (daily new users)
      user_growth: [
        { date: "2024-01-01", users: 89, month: "Jan" },
        { date: "2024-01-02", users: 124, month: "Jan" },
        { date: "2024-01-03", users: 156, month: "Jan" },
        { date: "2024-01-04", users: 134, month: "Jan" },
        { date: "2024-01-05", users: 98, month: "Jan" },
        { date: "2024-01-06", users: 67, month: "Jan" }, // Weekend dip
        { date: "2024-01-07", users: 73, month: "Jan" },
        { date: "2024-01-08", users: 142, month: "Jan" }, // Monday spike
        { date: "2024-01-09", users: 167, month: "Jan" },
        { date: "2024-01-10", users: 189, month: "Jan" },
        { date: "2024-01-11", users: 203, month: "Jan" },
        { date: "2024-01-12", users: 178, month: "Jan" },
        { date: "2024-01-13", users: 156, month: "Jan" },
        { date: "2024-01-14", users: 134, month: "Jan" },
        { date: "2024-01-15", users: 298, month: "Jan" }, // Fictional marketing campaign
        { date: "2024-01-16", users: 342, month: "Jan" },
        { date: "2024-01-17", users: 387, month: "Jan" },
        { date: "2024-01-18", users: 356, month: "Jan" },
        { date: "2024-01-19", users: 289, month: "Jan" },
        { date: "2024-01-20", users: 234, month: "Jan" },
        { date: "2024-01-21", users: 198, month: "Jan" },
        { date: "2024-01-22", users: 267, month: "Jan" },
        { date: "2024-01-23", users: 289, month: "Jan" },
        { date: "2024-01-24", users: 312, month: "Jan" },
      ],

      // User retention analysis (realistic retention curve)
      user_retention: [
        { day: "Day 1", retention: 100.0 }, // Everyone starts at 100%
        { day: "Day 3", retention: 68.4 }, // Typical 3-day retention
        { day: "Day 7", retention: 45.2 }, // Week retention
        { day: "Day 14", retention: 32.8 }, // Two week retention
        { day: "Day 30", retention: 22.1 }, // Monthly retention
      ],

      // Geographic distribution (enhanced with more countries)
      geographic_distribution: [
        { name: "United States", value: 34.5 },
        { name: "India", value: 14.9 },
        { name: "Germany", value: 8.6 },
        { name: "Japan", value: 6.2 },
        { name: "United Kingdom", value: 5.8 },
        { name: "Brazil", value: 4.3 },
        { name: "Canada", value: 3.7 },
        { name: "France", value: 3.2 },
        { name: "Australia", value: 2.9 },
        { name: "Other", value: 15.9 },
      ],
    };
  },

  /**
   * Get mock session analytics
   */
  async getSessionStats(packageName) {
    await simulateDelay();

    return {
      package_name: packageName,
      total_sessions: 89234,
      average_session_duration: "18m 26s",
      session_duration_distribution: [
        { name: "<1 min", value: 15 },
        { name: "1-5 mins", value: 30 },
        { name: "5-15 mins", value: 25 },
        { name: "15-30 mins", value: 18 },
        { name: ">30 mins", value: 12 },
      ],
    };
  },

  /**
   * Get mock crash reports with enhanced analytics
   */
  async getCrashReports(packageName) {
    await simulateDelay();

    return {
      package_name: packageName,
      total_crashes: 1247,
      total_crash_types: 12,
      crash_rate: "2.34%",

      // Daily crash trends over 30 days
      daily_crash_trends: [
        { date: "2024-01-01", crashes: 45 },
        { date: "2024-01-02", crashes: 52 },
        { date: "2024-01-03", crashes: 38 },
        { date: "2024-01-04", crashes: 41 },
        { date: "2024-01-05", crashes: 67 }, // Spike after weekend
        { date: "2024-01-06", crashes: 33 },
        { date: "2024-01-07", crashes: 29 },
        { date: "2024-01-08", crashes: 44 },
        { date: "2024-01-09", crashes: 38 },
        { date: "2024-01-10", crashes: 35 },
        { date: "2024-01-11", crashes: 42 },
        { date: "2024-01-12", crashes: 89 }, // Major spike (new release)
        { date: "2024-01-13", crashes: 76 },
        { date: "2024-01-14", crashes: 54 },
        { date: "2024-01-15", crashes: 31 }, // Hotfix deployed
        { date: "2024-01-16", crashes: 28 },
        { date: "2024-01-17", crashes: 24 },
        { date: "2024-01-18", crashes: 26 },
        { date: "2024-01-19", crashes: 22 },
        { date: "2024-01-20", crashes: 19 },
        { date: "2024-01-21", crashes: 17 },
        { date: "2024-01-22", crashes: 21 },
        { date: "2024-01-23", crashes: 18 },
        { date: "2024-01-24", crashes: 15 },
      ],

      // Crash rate trends (percentage)
      crash_rate_trends: [
        { date: "2024-01-01", crash_rate: 3.2 },
        { date: "2024-01-02", crash_rate: 3.8 },
        { date: "2024-01-03", crash_rate: 2.9 },
        { date: "2024-01-04", crash_rate: 3.1 },
        { date: "2024-01-05", crash_rate: 4.7 },
        { date: "2024-01-06", crash_rate: 2.4 },
        { date: "2024-01-07", crash_rate: 2.1 },
        { date: "2024-01-08", crash_rate: 3.2 },
        { date: "2024-01-09", crash_rate: 2.8 },
        { date: "2024-01-10", crash_rate: 2.6 },
        { date: "2024-01-11", crash_rate: 3.1 },
        { date: "2024-01-12", crash_rate: 6.4 }, // Peak crash rate
        { date: "2024-01-13", crash_rate: 5.5 },
        { date: "2024-01-14", crash_rate: 3.9 },
        { date: "2024-01-15", crash_rate: 2.2 }, // Recovery
        { date: "2024-01-16", crash_rate: 2.0 },
        { date: "2024-01-17", crash_rate: 1.7 },
        { date: "2024-01-18", crash_rate: 1.9 },
        { date: "2024-01-19", crash_rate: 1.6 },
        { date: "2024-01-20", crash_rate: 1.4 },
        { date: "2024-01-21", crash_rate: 1.2 },
        { date: "2024-01-22", crash_rate: 1.5 },
        { date: "2024-01-23", crash_rate: 1.3 },
        { date: "2024-01-24", crash_rate: 1.1 },
      ],

      // Device crash patterns
      device_crash_patterns: [
        { name: "Samsung Galaxy S21", value: 234, unique_types: 8 },
        { name: "Google Pixel 6", value: 189, unique_types: 6 },
        { name: "Xiaomi Mi 11", value: 156, unique_types: 7 },
        { name: "OnePlus 9", value: 134, unique_types: 5 },
        { name: "Samsung Galaxy A52", value: 98, unique_types: 4 },
        { name: "Google Pixel 5", value: 87, unique_types: 6 },
        { name: "Huawei P40", value: 76, unique_types: 3 },
        { name: "iPhone 13", value: 23, unique_types: 2 }, // Much lower crash rate
      ],

      // Top crashes by impact (frequency × users affected)
      top_crashes_by_impact: [
        {
          name: "NullPointerException in UserProfile...",
          value: 324,
          users_affected: 89,
          impact_score: 28836,
        },
        {
          name: "IndexOutOfBoundsException in ProductList...",
          value: 187,
          users_affected: 62,
          impact_score: 11594,
        },
        {
          name: "NetworkOnMainThreadException...",
          value: 145,
          users_affected: 78,
          impact_score: 11310,
        },
        {
          name: "IllegalStateException in PaymentFlow...",
          value: 98,
          users_affected: 45,
          impact_score: 4410,
        },
        {
          name: "OutOfMemoryError in ImageLoader...",
          value: 76,
          users_affected: 34,
          impact_score: 2584,
        },
        {
          name: "SQLiteException in DatabaseHelper...",
          value: 54,
          users_affected: 23,
          impact_score: 1242,
        },
        {
          name: "SecurityException in LocationService...",
          value: 43,
          users_affected: 19,
          impact_score: 817,
        },
      ],

      // Recent crashes with trend indicators and enhanced details
      recent_crashes: [
        {
          error: "NullPointerException",
          message:
            "Attempt to invoke virtual method on null object reference in UserProfile.updateAvatar()",
          full_message:
            "java.lang.NullPointerException: Attempt to invoke virtual method 'java.lang.String com.example.User.getAvatarUrl()' on a null object reference at com.example.UserProfile.updateAvatar(UserProfile.java:156)",
          stack_trace:
            "java.lang.NullPointerException: Attempt to invoke virtual method\n    at com.example.UserProfile.updateAvatar(UserProfile.java:156)\n    at com.example.ProfileActivity.onAvatarClick(ProfileActivity.java:89)\n    at com.example.ProfileActivity.lambda$onCreate$0(ProfileActivity.java:45)\n    at com.example.ProfileActivity$$Lambda$1.onClick(Unknown Source:2)\n    at android.view.View.performClick(View.java:7825)",
          device: "Samsung Galaxy S21",
          count: 324,
          lastSeen: "12 minutes ago",
          first_seen: "2024-01-15T10:30:00Z",
          trend: "decreasing",
          crash_id: "crash_001",
          users_affected: 89,
          impact_score: 28836,
          occurrences: [
            {
              timestamp: "2024-01-24T14:30:00Z",
              user_id: "u_12345",
              session_id: "session_abc",
            },
            {
              timestamp: "2024-01-24T13:15:00Z",
              user_id: "u_67890",
              session_id: "session_def",
            },
          ],
        },
        {
          error: "IndexOutOfBoundsException",
          message:
            "Index 5 out of bounds for length 3 in ProductList.getItem()",
          full_message:
            "java.lang.IndexOutOfBoundsException: Index 5 out of bounds for length 3 at java.util.ArrayList.get(ArrayList.java:427) at com.example.ProductList.getItem(ProductList.java:78)",
          stack_trace:
            "java.lang.IndexOutOfBoundsException: Index 5 out of bounds for length 3\n    at java.util.ArrayList.get(ArrayList.java:427)\n    at com.example.ProductList.getItem(ProductList.java:78)\n    at com.example.ShoppingActivity.onProductClick(ShoppingActivity.java:123)",
          device: "Google Pixel 6",
          count: 187,
          lastSeen: "34 minutes ago",
          first_seen: "2024-01-18T09:15:00Z",
          trend: "stable",
          crash_id: "crash_002",
          users_affected: 62,
          impact_score: 11594,
          occurrences: [],
        },
        {
          error: "NetworkOnMainThreadException",
          message: "Network operation attempted on main thread",
          full_message:
            "android.os.NetworkOnMainThreadException: Network operation attempted on main thread. Move network calls to background thread.",
          stack_trace:
            "android.os.NetworkOnMainThreadException\n    at android.os.StrictMode$AndroidBlockGuardPolicy.onNetwork(StrictMode.java:1605)\n    at com.example.ApiClient.syncCall(ApiClient.java:45)\n    at com.example.LoginActivity.onLoginClick(LoginActivity.java:89)",
          device: "Xiaomi Mi 11",
          count: 145,
          lastSeen: "1 hour ago",
          first_seen: "2024-01-20T16:45:00Z",
          trend: "decreasing",
          crash_id: "crash_003",
          users_affected: 78,
          impact_score: 11310,
          occurrences: [],
        },
      ],
    };
  },

  /**
   * Health check - always returns success for mock data
   */
  async healthCheck() {
    await simulateDelay(200);
    return { status: "healthy", service: "mock-analytics-api", mode: "demo" };
  },

  /**
   * Test connection - always returns true for mock data
   */
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error("Mock service error:", error.message);
      return false;
    }
  },
};

export default mockDataService;
