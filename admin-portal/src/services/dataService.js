import { analyticsAPI } from './api';
import { mockDataService } from './mockDataService';

/**
 * Data service that can switch between real API and mock data
 */
class DataService {
  constructor() {
    // Default to demo mode for presentation
    this.isDemoMode = true;
  }

  /**
   * Switch between demo mode (mock data) and live mode (real API)
   */
  setDemoMode(enabled) {
    this.isDemoMode = enabled;
    console.log(`📊 Data service switched to: ${enabled ? 'DEMO MODE' : 'LIVE MODE'}`);
  }

  /**
   * Get current mode
   */
  getDemoMode() {
    return this.isDemoMode;
  }

  /**
   * Get the current data service (real API or mock)
   */
  getCurrentService() {
    return this.isDemoMode ? mockDataService : analyticsAPI;
  }

  /**
   * Get event statistics
   */
  async getEventStats(packageName) {
    try {
      const service = this.getCurrentService();
      const result = await service.getEventStats(packageName);
      
      return {
        ...result,
        _metadata: {
          source: this.isDemoMode ? 'demo' : 'live',
          timestamp: new Date().toISOString(),
          package_name: packageName
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching event stats (${this.isDemoMode ? 'demo' : 'live'} mode):`, error);
      throw error;
    }
  }

  /**
   * Get recent events
   */
  async getEvents(packageName, limit = 100) {
    try {
      const service = this.getCurrentService();
      const result = await service.getEvents(packageName, limit);
      
      return {
        ...result,
        _metadata: {
          source: this.isDemoMode ? 'demo' : 'live',
          timestamp: new Date().toISOString(),
          limit: limit
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching events (${this.isDemoMode ? 'demo' : 'live'} mode):`, error);
      throw error;
    }
  }

  /**
   * Get user statistics (only available in demo mode for now)
   */
  async getUserStats(packageName) {
    try {
      if (this.isDemoMode) {
        return await mockDataService.getUserStats(packageName);
      } else {
        // In live mode, return basic info since we don't have user endpoints yet
        return {
          total_users: 'N/A',
          active_users: 'N/A',
          note: 'User analytics coming soon in live mode'
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching user stats:`, error);
      throw error;
    }
  }

  /**
   * Get session statistics (only available in demo mode for now)
   */
  async getSessionStats(packageName) {
    try {
      if (this.isDemoMode) {
        return await mockDataService.getSessionStats(packageName);
      } else {
        return {
          total_sessions: 'N/A',
          average_session_duration: 'N/A',
          note: 'Session analytics coming soon in live mode'
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching session stats:`, error);
      throw error;
    }
  }

  /**
   * Get crash reports (only available in demo mode for now)
   */
  async getCrashReports(packageName) {
    try {
      if (this.isDemoMode) {
        return await mockDataService.getCrashReports(packageName);
      } else {
        return {
          total_crashes: 'N/A',
          crash_rate: 'N/A',
          recent_crashes: [],
          note: 'Crash reporting coming soon in live mode'
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching crash reports:`, error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const service = this.getCurrentService();
      return await service.healthCheck();
    } catch (error) {
      console.error(`❌ Health check failed (${this.isDemoMode ? 'demo' : 'live'} mode):`, error);
      throw error;
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      const service = this.getCurrentService();
      return await service.testConnection();
    } catch (error) {
      console.error(`❌ Connection test failed:`, error);
      return false;
    }
  }

  /**
   * Get all dashboard data at once
   */
  async getDashboardData(packageName) {
    try {
      console.log(`📊 Fetching dashboard data in ${this.isDemoMode ? 'DEMO' : 'LIVE'} mode...`);
      
      // Fetch all data in parallel
      const [eventStats, events, userStats, sessionStats, crashReports] = await Promise.all([
        this.getEventStats(packageName),
        this.getEvents(packageName, 50),
        this.getUserStats(packageName),
        this.getSessionStats(packageName),
        this.getCrashReports(packageName)
      ]);

      return {
        eventStats,
        events,
        userStats,
        sessionStats,
        crashReports,
        metadata: {
          mode: this.isDemoMode ? 'demo' : 'live',
          package: packageName,
          loadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching dashboard data:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const dataService = new DataService();
export default dataService;