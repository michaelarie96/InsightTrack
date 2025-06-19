/**
 * Mock Data Service - Rich demo data for presentation
 * This simulates what the analytics platform would look like with lots of data and variety
 * Used for demo purposes only, does not connect to a real API
 */

// Simulate API delay
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

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
        { name: "Feature Used", value: 400 }
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
        { date: "2024-01-24", events: 1650 }
      ]
    };
  },

  /**
   * Get mock recent events
   */
  async getEvents(packageName, limit = 100) {
    await simulateDelay();
    
    const eventTypes = ['login', 'product_view', 'add_to_cart', 'purchase', 'search', 'button_click', 'logout', 'settings_changed'];
    const userIds = ['u_57928', 'u_23451', 'u_89023', 'u_34512', 'u_67890', 'u_12345', 'u_78901', 'u_23456', 'u_45678', 'u_90123'];
    
    const events = [];
    const now = new Date();
    
    for (let i = 0; i < Math.min(limit, 50); i++) {
      const eventTime = new Date(now.getTime() - (i * 2 * 60 * 1000)); // Events every 2 minutes
      
      events.push({
        _id: `mock_event_${i}`,
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        timestamp: eventTime.toISOString(),
        properties: {
          mock_data: true,
          demo_mode: true
        },
        device_info: {
          model: ['Samsung Galaxy S21', 'Google Pixel 6', 'Xiaomi Mi 11', 'OnePlus 9'][Math.floor(Math.random() * 4)],
          os_version: ['13', '12', '11'][Math.floor(Math.random() * 3)]
        }
      });
    }
    
    return {
      package_name: packageName,
      events: events,
      count: events.length
    };
  },

  /**
   * Get mock user analytics
   */
  async getUserStats(packageName) {
    await simulateDelay();
    
    return {
      package_name: packageName,
      total_users: 24521,
      active_users: 18432,
      new_users_today: 342,
      user_growth: [
        { month: 'Jan', users: 4000 },
        { month: 'Feb', users: 4300 },
        { month: 'Mar', users: 4500 },
        { month: 'Apr', users: 4800 },
        { month: 'May', users: 5200 },
        { month: 'Jun', users: 5600 },
        { month: 'Jul', users: 6000 }
      ],
      user_retention: [
        { day: 'Day 1', retention: 100 },
        { day: 'Day 3', retention: 68 },
        { day: 'Day 7', retention: 56 },
        { day: 'Day 14', retention: 45 },
        { day: 'Day 30', retention: 30 },
        { day: 'Day 60', retention: 23 },
        { day: 'Day 90', retention: 17 }
      ],
      geographic_distribution: [
        { name: 'United States', value: 34.5 },
        { name: 'India', value: 14.9 },
        { name: 'Germany', value: 8.6 },
        { name: 'Japan', value: 6.2 },
        { name: 'Other', value: 28.3 }
      ]
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
      average_session_duration: '18m 26s',
      session_duration_distribution: [
        { name: '<1 min', value: 15 },
        { name: '1-5 mins', value: 30 },
        { name: '5-15 mins', value: 25 },
        { name: '15-30 mins', value: 18 },
        { name: '>30 mins', value: 12 }
      ]
    };
  },

  /**
   * Get mock crash reports
   */
  async getCrashReports(packageName) {
    await simulateDelay();
    
    return {
      package_name: packageName,
      total_crashes: 72,
      crash_rate: '0.82%',
      recent_crashes: [
        { error: 'NullPointerException', device: 'Samsung Galaxy S21', count: 24, lastSeen: '2 hours ago' },
        { error: 'IndexOutOfBoundsException', device: 'Google Pixel 6', count: 17, lastSeen: '5 hours ago' },
        { error: 'NetworkOnMainThreadException', device: 'Xiaomi Mi 11', count: 13, lastSeen: '8 hours ago' },
        { error: 'IllegalStateException', device: 'OnePlus 9', count: 11, lastSeen: '12 hours ago' },
        { error: 'OutOfMemoryError', device: 'Samsung Galaxy A52', count: 7, lastSeen: '1 day ago' }
      ]
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
      console.error('Mock service error:', error.message);
      return false;
    }
  }
};

export default mockDataService;