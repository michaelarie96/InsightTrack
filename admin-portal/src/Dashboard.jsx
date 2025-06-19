import React, { useState, useEffect, useCallback } from 'react';
import { StatLineChart, DistributionPieChart, HorizontalBarChart } from './ChartComponents';
import ModeToggle, { ModeInfoCard } from './components/ModeToggle';
import { dataService } from './services/dataService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage] = useState('com.example.androidapi');
  const [isDemoMode, setIsDemoMode] = useState(true); // start in demo mode for presentation

  // Fetch data when component loads or mode changes
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📊 Fetching dashboard data in ${isDemoMode ? 'DEMO' : 'LIVE'} mode...`);
      
      dataService.setDemoMode(isDemoMode);
      
      const data = await dataService.getDashboardData(selectedPackage);
      setDashboardData(data);
      
      console.log('✅ Dashboard data loaded successfully!');
      
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPackage, isDemoMode]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  const handleModeChange = (newDemoMode) => {
    setIsDemoMode(newDemoMode);
    console.log(`🔄 Switching to ${newDemoMode ? 'DEMO' : 'LIVE'} mode...`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const BLUE_COLOR = '#3b82f6';

  const getMetrics = () => {
    if (!dashboardData) return [];

    const { eventStats, events, userStats, sessionStats, crashReports } = dashboardData;

    if (isDemoMode) {
      return [
        {
          title: 'Total Users',
          value: userStats?.total_users?.toLocaleString() || '0',
          change: '+12.5% from last month',
          icon: '👤',
          isPositive: true
        },
        {
          title: 'Active Users', 
          value: userStats?.active_users?.toLocaleString() || '0',
          change: '+8.2% from last month',
          icon: '👥',
          isPositive: true
        },
        {
          title: 'Avg. Session',
          value: sessionStats?.average_session_duration || '0s',
          change: '-2.3% from last month',
          icon: '⏱️',
          isPositive: false
        },
        {
          title: 'Total Events',
          value: eventStats?.total_events?.toLocaleString() || '0',
          change: '+24.5% from last month',
          icon: '📊',
          isPositive: true
        },
        {
          title: 'Crash Rate',
          value: crashReports?.crash_rate || '0%',
          change: '-12.7% from last month',
          icon: '⚠️',
          isPositive: true
        }
      ];
    } else {
      // Live mode metrics
      return [
        {
          title: 'Total Events',
          value: eventStats?.total_events?.toLocaleString() || '0',
          change: 'Real-time data',
          icon: '📊',
          isPositive: true
        },
        {
          title: 'Top Event',
          value: eventStats?.top_events?.[0]?.name || 'No events',
          change: `${eventStats?.top_events?.[0]?.value || 0} times`,
          icon: '🎯',
          isPositive: true
        },
        {
          title: 'Package',
          value: eventStats?.package_name || selectedPackage,
          change: 'Active package',
          icon: '📱',
          isPositive: true
        },
        {
          title: 'Recent Events',
          value: events?.events?.length?.toString() || '0',
          change: 'in latest batch',
          icon: '⏱️',
          isPositive: true
        },
        {
          title: 'API Status',
          value: 'Connected',
          change: 'Live API data',
          icon: '✅',
          isPositive: true
        }
      ];
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
            <p className="text-sm text-gray-500 mt-1">
              {isDemoMode ? 'Loading demo data...' : 'Connecting to API...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-4">❌</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">Failed to load dashboard</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchDashboardData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Mode Toggle */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600">Package: {dashboardData?.metadata?.package || selectedPackage}</p>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle 
              isDemoMode={isDemoMode}
              onModeChange={handleModeChange}
              disabled={loading}
            />
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Mode Info Card */}
        <ModeInfoCard isDemoMode={isDemoMode} />
      </header>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</p>
                </div>
                <span className="text-xl">{metric.icon}</span>
              </div>
              <p className={`text-xs mt-2 ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section - Different content based on mode */}
        {isDemoMode ? (
          // Demo Mode - Show all rich charts
          <>
            {/* User Growth and Retention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">User Growth</h2>
                <p className="text-sm text-gray-500 mb-4">New user acquisition over time</p>
                <div className="h-64">
                  {dashboardData?.userStats?.user_growth && (
                    <StatLineChart 
                      data={dashboardData.userStats.user_growth} 
                      dataKey="users" 
                      xAxis="month" 
                      color={BLUE_COLOR} 
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">User Retention</h2>
                <p className="text-sm text-gray-500 mb-4">Percentage of users who return after first use</p>
                <div className="h-64">
                  {dashboardData?.userStats?.user_retention && (
                    <StatLineChart 
                      data={dashboardData.userStats.user_retention} 
                      dataKey="retention" 
                      xAxis="day" 
                      color={BLUE_COLOR} 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Session Duration and Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Session Duration</h2>
                <p className="text-sm text-gray-500 mb-4">Distribution of session lengths</p>
                <div className="h-64">
                  {dashboardData?.sessionStats?.session_duration_distribution && (
                    <DistributionPieChart 
                      data={dashboardData.sessionStats.session_duration_distribution} 
                      colors={COLORS} 
                      dataKey="value" 
                      nameKey="name" 
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Geographic Distribution</h2>
                <p className="text-sm text-gray-500 mb-4">Users by country</p>
                <div className="h-64">
                  {dashboardData?.userStats?.geographic_distribution && (
                    <DistributionPieChart 
                      data={dashboardData.userStats.geographic_distribution} 
                      colors={COLORS} 
                      dataKey="value" 
                      nameKey="name" 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Top Events and Crash Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Top Events</h2>
                <p className="text-sm text-gray-500 mb-4">Most frequent user actions</p>
                <div className="h-64">
                  {dashboardData?.eventStats?.top_events && (
                    <HorizontalBarChart 
                      data={dashboardData.eventStats.top_events} 
                      color={BLUE_COLOR} 
                      dataKey="value" 
                      categoryKey="name" 
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Crash Reports</h2>
                <p className="text-sm text-gray-500 mb-4">Recent app crashes and errors</p>
                <div className="overflow-x-auto">
                  {dashboardData?.crashReports?.recent_crashes?.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.crashReports.recent_crashes.map((crash, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-red-600">{crash.error}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{crash.device}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{crash.count}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{crash.lastSeen}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <p>No crash data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Live Mode - Show only available data
          <>
            {/* Daily Events Chart (if available) */}
            {dashboardData?.eventStats?.daily_events && dashboardData.eventStats.daily_events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Daily Events</h2>
                <p className="text-sm text-gray-500 mb-4">Event activity over time (Real API Data)</p>
                <div className="h-64">
                  <StatLineChart 
                    data={dashboardData.eventStats.daily_events} 
                    dataKey="events" 
                    xAxis="date" 
                    color={BLUE_COLOR} 
                  />
                </div>
              </div>
            )}

            {/* Top Events and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Top Events</h2>
                <p className="text-sm text-gray-500 mb-4">Most frequent user actions (Real API Data)</p>
                {dashboardData?.eventStats?.top_events && dashboardData.eventStats.top_events.length > 0 ? (
                  <div className="h-64">
                    <HorizontalBarChart 
                      data={dashboardData.eventStats.top_events} 
                      color={BLUE_COLOR} 
                      dataKey="value" 
                      categoryKey="name" 
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📊</span>
                      <p>No events data available</p>
                      <p className="text-sm">Generate some events in your Android app!</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-800">Recent Events</h2>
                <p className="text-sm text-gray-500 mb-4">Latest events from your app (Real API Data)</p>
                <div className="overflow-x-auto">
                  {dashboardData?.events?.events && dashboardData.events.events.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.events.events.slice(0, 8).map((event, index) => (
                          <tr key={event._id || index}>
                            <td className="px-3 py-2 text-sm text-gray-800">{event.event_type}</td>
                            <td className="px-3 py-2 text-sm text-gray-800">{event.user_id || 'Anonymous'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <span className="text-4xl mb-2 block">📱</span>
                        <p>No recent events</p>
                        <p className="text-sm">Open your Android app and interact with it!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live API Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-green-500 text-xl mr-3">✅</span>
                <div>
                  <h3 className="font-medium text-green-800">Connected to Live Analytics API</h3>
                  <p className="text-green-600 text-sm">
                    Showing real data from your backend • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;