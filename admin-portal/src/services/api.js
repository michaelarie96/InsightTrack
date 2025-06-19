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

  // Get all packages (need to add this endpoint to backend)
  async getPackages() {
    // For now, returning a default package
    // Need to add a real endpoint to get all packages
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