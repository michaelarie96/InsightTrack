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

  /**
   * Generate metrics based on available data and mode
   */
  const getMetrics = () => {
    if (!dashboardData) return [];

    const { eventStats, userStats, sessionStats, crashReports } = dashboardData;

    if (isDemoMode) {
      // Demo mode - use rich mock data
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
      // Live mode - use real data
      return [
        {
          title: 'Total Users',
          value: userStats?.total_users?.toLocaleString() || '0',
          change: 'Real-time data',
          icon: '👤',
          isPositive: true
        },
        {
          title: 'Active Users',
          value: userStats?.active_users?.toLocaleString() || '0',
          change: 'Last 30 days',
          icon: '👥',
          isPositive: true
        },
        {
          title: 'Avg. Session',
          value: sessionStats?.average_session_duration || '0s',
          change: 'Real sessions',
          icon: '⏱️',
          isPositive: true
        },
        {
          title: 'Total Events',
          value: eventStats?.total_events?.toLocaleString() || '0',
          change: 'Live tracking',
          icon: '📊',
          isPositive: true
        },
        {
          title: 'Crash Rate',
          value: crashReports?.crash_rate || '0%',
          change: 'Current period',
          icon: '⚠️',
          isPositive: true
        }
      ];
    }
  };

  /**
   * Create empty state component for charts with no real data
   */
  const EmptyChartState = ({ icon, title, description }) => (
    <div className="h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <span className="text-4xl mb-2 block">{icon}</span>
        <p className="font-medium">{title}</p>
        <p className="text-sm mt-1">{description}</p>
        <p className="text-xs text-blue-600 mt-2">
          💡 Use your Android app to generate real data!
        </p>
      </div>
    </div>
  );

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

        {/* Charts Section */}
        {/* User Growth and Session Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'User Growth' : 'User Growth (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'New user acquisition over time' 
                : 'User growth based on real analytics data'
              }
            </p>
            <div className="h-64">
              {(() => {
                if (isDemoMode) {
                  const demoData = dashboardData?.userStats?.user_growth;
                  return (
                    <StatLineChart 
                      data={demoData} 
                      dataKey="users" 
                      xAxis="month" 
                      color={BLUE_COLOR} 
                    />
                  );
                } else {
                  // Live mode - show real data or empty state
                  const realData = dashboardData?.userStats?.user_growth;
                  
                  if (realData && realData.length > 0) {
                    return (
                      <StatLineChart 
                        data={realData} 
                        dataKey="users" 
                        xAxis="date" 
                        color={BLUE_COLOR} 
                      />
                    );
                  } else {
                    return (
                      <EmptyChartState 
                        icon="📈"
                        title="User Growth Chart"
                        description="Not enough user data yet to show growth trends"
                        isLiveMode={true}
                      />
                    );
                  }
                }
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Session Duration' : 'Session Duration (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Distribution of session lengths' 
                : 'Real session duration patterns'
              }
            </p>
            <div className="h-64">
              {(() => {
                if (isDemoMode) {
                  const demoData = dashboardData?.sessionStats?.session_duration_distribution;
                  return (
                    <DistributionPieChart 
                      data={demoData} 
                      colors={COLORS} 
                      dataKey="value" 
                      nameKey="name" 
                    />
                  );
                } else {
                  // Live mode - show real data or empty state
                  const realData = dashboardData?.sessionStats?.session_duration_distribution;
                  
                  if (realData && realData.length > 0) {
                    return (
                      <DistributionPieChart 
                        data={realData} 
                        colors={COLORS} 
                        dataKey="value" 
                        nameKey="name" 
                      />
                    );
                  } else {
                    return (
                      <EmptyChartState 
                        icon="⏱️"
                        title="Session Duration Chart"
                        description="Need more session data to show duration patterns"
                        isLiveMode={true}
                      />
                    );
                  }
                }
              })()}
            </div>
          </div>
        </div>

        {/* User Growth and Session Duration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'User Growth' : 'User Growth (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'New user acquisition over time' 
                : 'Real user growth from your analytics API'
              }
            </p>
            <div className="h-64">
              {(() => {
                if (isDemoMode) {
                  const demoData = dashboardData?.userStats?.user_growth;
                  return demoData ? (
                    <StatLineChart 
                      data={demoData} 
                      dataKey="users" 
                      xAxis="month" 
                      color={BLUE_COLOR} 
                    />
                  ) : null;
                } else {
                  // Live mode - show real data
                  const realData = dashboardData?.userStats?.user_growth;
                  
                  if (realData && realData.length > 0) {
                    return (
                      <StatLineChart 
                        data={realData} 
                        dataKey="users" 
                        xAxis="date" 
                        color={BLUE_COLOR} 
                      />
                    );
                  } else {
                    return (
                      <EmptyChartState 
                        icon="📈"
                        title="No User Growth Data Yet"
                        description="Real data will appear here when users register through your Android app"
                      />
                    );
                  }
                }
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Session Duration' : 'Session Duration (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Distribution of session lengths' 
                : 'Real session duration patterns from your app'
              }
            </p>
            <div className="h-64">
              {(() => {
                if (isDemoMode) {
                  const demoData = dashboardData?.sessionStats?.session_duration_distribution;
                  return demoData ? (
                    <DistributionPieChart 
                      data={demoData} 
                      colors={COLORS} 
                      dataKey="value" 
                      nameKey="name" 
                    />
                  ) : null;
                } else {
                  // Live mode - show real data
                  const realData = dashboardData?.sessionStats?.session_duration_distribution;
                  
                  if (realData && realData.length > 0) {
                    return (
                      <DistributionPieChart 
                        data={realData} 
                        colors={COLORS} 
                        dataKey="value" 
                        nameKey="name" 
                      />
                    );
                  } else {
                    return (
                      <EmptyChartState 
                        icon="⏱️"
                        title="No Session Data Yet"
                        description="Real session patterns will appear when users use your Android app"
                      />
                    );
                  }
                }
              })()}
            </div>
          </div>
        </div>

        {/* Top Events and Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Top Events' : 'Top Events (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Most frequent user actions' 
                : 'Real user interactions from your Android app'
              }
            </p>
            <div className="h-64">
              {(() => {
                const eventsData = dashboardData?.eventStats?.top_events;
                
                if (eventsData && eventsData.length > 0) {
                  return (
                    <HorizontalBarChart 
                      data={eventsData} 
                      color={BLUE_COLOR} 
                      dataKey="value" 
                      categoryKey="name" 
                    />
                  );
                } else {
                  return (
                    <EmptyChartState 
                      icon="🎯"
                      title={isDemoMode ? "Demo Events Chart" : "No Events Yet"}
                      description={isDemoMode 
                        ? "Demo events visualization" 
                        : "Real events will appear when you interact with your Android app"
                      }
                    />
                  );
                }
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Geographic Distribution' : 'User Distribution (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Users by country' 
                : 'Real geographic distribution of your users'
              }
            </p>
            <div className="h-64">
              {(() => {
                if (isDemoMode) {
                  const demoData = dashboardData?.userStats?.geographic_distribution;
                  return demoData ? (
                    <DistributionPieChart 
                      data={demoData} 
                      colors={COLORS} 
                      dataKey="value" 
                      nameKey="name" 
                    />
                  ) : null;
                } else {
                  // Live mode - show real geographic data
                  const realData = dashboardData?.userStats?.geographic_distribution;
                  
                  if (realData && realData.length > 0) {
                    return (
                      <DistributionPieChart 
                        data={realData} 
                        colors={COLORS} 
                        dataKey="value" 
                        nameKey="name" 
                      />
                    );
                  } else {
                    return (
                      <EmptyChartState 
                        icon="🌍"
                        title="No Geographic Data Yet"
                        description="Real user location data will appear when users register"
                      />
                    );
                  }
                }
              })()}
            </div>
          </div>
        </div>

        {/* Recent Activity and Crash Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Recent Activity' : 'Recent Events (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Latest user interactions' 
                : 'Real-time events from your app'
              }
            </p>
            <div className="overflow-x-auto max-h-64">
              {(() => {
                const recentEvents = dashboardData?.events?.events;
                
                return recentEvents && recentEvents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentEvents.slice(0, 8).map((event, index) => (
                        <tr key={event._id || index}>
                          <td className="px-3 py-2 text-sm text-gray-800">{event.event_type}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anonymous'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📱</span>
                      <p>No recent activity</p>
                      <p className="text-sm">
                        {isDemoMode 
                          ? 'Demo events would appear here' 
                          : 'Open your Android app and interact with it!'
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              {isDemoMode ? 'Crash Reports' : 'Crash Reports (Live Data)'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode 
                ? 'Recent app crashes and errors' 
                : 'Real crash reports from your app'
              }
            </p>
            <div className="overflow-x-auto max-h-64">
              {(() => {
                const crashes = dashboardData?.crashReports?.recent_crashes;
                
                return crashes && crashes.length > 0 ? (
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
                      {crashes.slice(0, 5).map((crash, index) => (
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
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">✅</span>
                      <p>No crashes reported</p>
                      <p className="text-sm">
                        {isDemoMode 
                          ? 'Demo crash data would appear here' 
                          : 'Your app is running smoothly!'
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Data Source Indicator */}
        <div className={`p-4 rounded-lg border-2 ${
          isDemoMode 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            <span className={`text-xl mr-3 ${isDemoMode ? '📊' : '✅'}`}>
              {isDemoMode ? '📊' : '✅'}
            </span>
            <div>
              <h3 className={`font-medium ${
                isDemoMode ? 'text-blue-800' : 'text-green-800'
              }`}>
                {isDemoMode 
                  ? 'Demo Mode - Rich Sample Data' 
                  : 'Live Mode - Real Analytics Data'
                }
              </h3>
              <p className={`text-sm ${
                isDemoMode ? 'text-blue-600' : 'text-green-600'
              }`}>
                {isDemoMode 
                  ? 'Showing comprehensive analytics capabilities with realistic demo data'
                  : `Connected to live API • Last updated: ${new Date().toLocaleTimeString()} • Showing real data from your Android app`
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;