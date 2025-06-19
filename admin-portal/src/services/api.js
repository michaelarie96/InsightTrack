import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001'; // For local development
// const API_BASE_URL = 'https://your-analytics-api.vercel.app'; // For production

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

/**
 * Analytics API Service
 */
export const analyticsAPI = {
  
  // Health check - test if API is working
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // ===== EVENTS API =====
  
  // Get events for a specific package
  async getEvents(packageName, limit = 100) {
    try {
      const response = await apiClient.get(`/analytics/events/${packageName}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  },

  // Get event statistics for dashboard
  async getEventStats(packageName) {
    try {
      const response = await apiClient.get(`/analytics/events/${packageName}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch event statistics: ${error.message}`);
    }
  },

  // ===== USERS API =====
  
  // Get users for a specific package
  async getUsers(packageName, limit = 100) {
    try {
      const response = await apiClient.get(`/analytics/users/${packageName}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  // Get user statistics for dashboard
  async getUserStats(packageName) {
    try {
      const response = await apiClient.get(`/analytics/users/${packageName}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user statistics: ${error.message}`);
    }
  },

  // ===== SESSIONS API =====
  
  // Get sessions for a specific package
  async getSessions(packageName, limit = 100) {
    try {
      const response = await apiClient.get(`/analytics/sessions/${packageName}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }
  },

  // Get session statistics for dashboard
  async getSessionStats(packageName) {
    try {
      const response = await apiClient.get(`/analytics/sessions/${packageName}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch session statistics: ${error.message}`);
    }
  },

  // ===== CRASHES API =====
  
  // Get crash reports for a specific package
  async getCrashes(packageName, limit = 50) {
    try {
      const response = await apiClient.get(`/analytics/crashes/${packageName}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch crash reports: ${error.message}`);
    }
  },

  // Get crash statistics for dashboard
  async getCrashStats(packageName) {
    try {
      const response = await apiClient.get(`/analytics/crashes/${packageName}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch crash statistics: ${error.message}`);
    }
  },

  // ===== UTILITY METHODS =====

  // Get all packages (need to add this endpoint to backend later)
  async getPackages() {
    // For now, returning a default package
    // TODO: Add a real endpoint to get all packages
    return ['com.example.androidapi'];
  },

  // Test data connection
  async testConnection() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('🔴 Cannot connect to API:', error.message);
      return false;
    }
  }
};

export default analyticsAPI;