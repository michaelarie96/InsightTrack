import React, { useState, useEffect, useCallback } from "react";
import {
  StatLineChart,
  DistributionPieChart,
  HorizontalBarChart,
} from "./ChartComponents";
import ModeToggle, { ModeInfoCard } from "./components/ModeToggle";
import { dataService } from "./services/dataService";

const Dashboard = ({ currentUser, allowDemoMode = true }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage] = useState("com.example.androidapi");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCrash, setSelectedCrash] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(allowDemoMode); // start in demo mode for presentation

  // Fetch data when component loads or mode changes
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For users without demo mode access, force live mode
      const actualMode = allowDemoMode ? isDemoMode : false;

      console.log(
        `📊 Fetching dashboard data for ${currentUser.name} (${
          currentUser.package
        }) in ${actualMode ? "DEMO" : "LIVE"} mode...`
      );

      dataService.setDemoMode(actualMode);

      const data = await dataService.getDashboardData(currentUser.package);
      setDashboardData(data);

      console.log("✅ Dashboard data loaded successfully!");
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser.package, currentUser.name, isDemoMode, allowDemoMode]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    // When switching to a user without demo mode access, force live mode
    if (!allowDemoMode && isDemoMode) {
      setIsDemoMode(false);
    }
  }, [allowDemoMode, isDemoMode]);

  const handleModeChange = (newDemoMode) => {
    setIsDemoMode(newDemoMode);
    console.log(`🔄 Switching to ${newDemoMode ? "DEMO" : "LIVE"} mode...`);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const BLUE_COLOR = "#3b82f6";
  const GREEN_COLOR = "#10b981";
  const RED_COLOR = "#ef4444";

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
          title: "Total Users",
          value: userStats?.total_users?.toLocaleString() || "0",
          change: "+12.5% from last month",
          icon: "👤",
          isPositive: true,
        },
        {
          title: "Active Users",
          value: userStats?.active_users?.toLocaleString() || "0",
          change: "+8.2% from last month",
          icon: "👥",
          isPositive: true,
        },
        {
          title: "Avg. Session",
          value: sessionStats?.average_session_duration || "0s",
          change: "-2.3% from last month",
          icon: "⏱️",
          isPositive: false,
        },
        {
          title: "Total Events",
          value: eventStats?.total_events?.toLocaleString() || "0",
          change: "+24.5% from last month",
          icon: "📊",
          isPositive: true,
        },
        {
          title: "Crash Rate",
          value: crashReports?.crash_rate || "0%",
          change: "-12.7% from last month",
          icon: "⚠️",
          isPositive: true,
        },
      ];
    } else {
      // Live mode - use real data
      return [
        {
          title: "Total Users",
          value: userStats?.total_users?.toLocaleString() || "0",
          change: "Real-time data",
          icon: "👤",
          isPositive: true,
        },
        {
          title: "Active Users",
          value: userStats?.active_users?.toLocaleString() || "0",
          change: "Last 30 days",
          icon: "👥",
          isPositive: true,
        },
        {
          title: "Avg. Session",
          value: sessionStats?.average_session_duration || "0s",
          change: "Real sessions",
          icon: "⏱️",
          isPositive: true,
        },
        {
          title: "Total Events",
          value: eventStats?.total_events?.toLocaleString() || "0",
          change: "Live tracking",
          icon: "📊",
          isPositive: true,
        },
        {
          title: "Crash Rate",
          value: crashReports?.crash_rate || "0%",
          change: "Current period",
          icon: "⚠️",
          isPositive: true,
        },
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

  /**
   * Get trend indicator for displaying arrows
   */
  const getTrendIndicator = (trend) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "decreasing":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Analytics Dashboard
          </h1>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
            <p className="text-sm text-gray-500 mt-1">
              {isDemoMode ? "Loading demo data..." : "Connecting to API..."}
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
          <h1 className="text-2xl font-semibold text-gray-800">
            Analytics Dashboard
          </h1>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-4">❌</span>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Failed to load dashboard
              </h3>
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
            <h1 className="text-2xl font-semibold text-gray-800">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Package: {dashboardData?.metadata?.package || selectedPackage}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {allowDemoMode && (
              <ModeToggle
                isDemoMode={isDemoMode}
                onModeChange={handleModeChange}
                disabled={loading}
              />
            )}
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
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {metric.value}
                  </p>
                </div>
                <span className="text-xl">{metric.icon}</span>
              </div>
              <p
                className={`text-xs mt-2 ${
                  metric.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* User Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              📈 User Growth Trends
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Daily new user acquisition patterns"
                : "Real user growth from your analytics API"}
            </p>
            <div className="h-64">
              {(() => {
                const userData = dashboardData?.userStats?.user_growth;

                if (userData && userData.length > 0) {
                  return (
                    <StatLineChart
                      data={userData}
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
                      description={
                        isDemoMode
                          ? "Demo data loading..."
                          : "Real data will appear when users register through your Android app"
                      }
                    />
                  );
                }
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              🔄 User Retention Analysis
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Percentage of users returning over time"
                : "Real user retention patterns from your app"}
            </p>
            <div className="h-64">
              {(() => {
                const retentionData = dashboardData?.userStats?.user_retention;

                if (retentionData && retentionData.length > 0) {
                  return (
                    <StatLineChart
                      data={retentionData}
                      dataKey="retention"
                      xAxis="day"
                      color={GREEN_COLOR}
                    />
                  );
                } else {
                  return (
                    <EmptyChartState
                      icon="🔄"
                      title="No Retention Data Yet"
                      description="Need more historical user data for retention analysis"
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Crash Analytics Section - NEW ENHANCED SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              💥 Daily Crash Trends
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Crash frequency over time showing stability patterns"
                : "Real crash trends from your app usage"}
            </p>
            <div className="h-64">
              {(() => {
                const crashTrends =
                  dashboardData?.crashReports?.daily_crash_trends;

                if (crashTrends && crashTrends.length > 0) {
                  return (
                    <StatLineChart
                      data={crashTrends}
                      dataKey="crashes"
                      xAxis="date"
                      color={RED_COLOR}
                    />
                  );
                } else {
                  return (
                    <EmptyChartState
                      icon="💥"
                      title="No Crash Trends Yet"
                      description={
                        isDemoMode
                          ? "Demo crash patterns loading..."
                          : "Crash trends will appear as your app is used"
                      }
                    />
                  );
                }
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              📱 Device Crash Patterns
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Which devices experience crashes most frequently"
                : "Real device-specific crash analysis"}
            </p>
            <div className="h-64">
              {(() => {
                const devicePatterns =
                  dashboardData?.crashReports?.device_crash_patterns;

                if (devicePatterns && devicePatterns.length > 0) {
                  return (
                    <HorizontalBarChart
                      data={devicePatterns}
                      color={RED_COLOR}
                      dataKey="value"
                      categoryKey="name"
                    />
                  );
                } else {
                  return (
                    <EmptyChartState
                      icon="📱"
                      title="No Device Patterns Yet"
                      description="Device crash analysis will appear with more crash data"
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Top Events and Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">🎯 Top Events</h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Most frequent user interactions"
                : "Real user interactions from your Android app"}
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
                      title="No Events Yet"
                      description={
                        isDemoMode
                          ? "Demo events loading..."
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
              🌍 Geographic Distribution
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Users by country worldwide"
                : "Real geographic distribution via IP detection"}
            </p>
            <div className="h-64">
              {(() => {
                const geoData =
                  dashboardData?.userStats?.geographic_distribution;

                if (geoData && geoData.length > 0) {
                  return (
                    <DistributionPieChart
                      data={geoData}
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
              })()}
            </div>
          </div>
        </div>

        {/* Session Duration and Crash Impact Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              ⏱️ Session Duration Distribution
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Distribution of session lengths"
                : "Real session duration patterns from your app"}
            </p>
            <div className="h-64">
              {(() => {
                const sessionData =
                  dashboardData?.sessionStats?.session_duration_distribution;

                if (sessionData && sessionData.length > 0) {
                  return (
                    <DistributionPieChart
                      data={sessionData}
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
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              🎯 Top Crashes by Impact
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Most critical crashes ranked by severity"
                : "Real crash prioritization for debugging"}
            </p>
            <div className="h-64">
              {(() => {
                const topCrashes =
                  dashboardData?.crashReports?.top_crashes_by_impact;

                if (topCrashes && topCrashes.length > 0) {
                  return (
                    <HorizontalBarChart
                      data={topCrashes}
                      color="#f59e0b"
                      dataKey="value"
                      categoryKey="name"
                    />
                  );
                } else {
                  return (
                    <EmptyChartState
                      icon="🎯"
                      title="No Crash Impact Data"
                      description="Crash impact analysis will appear with more crash reports"
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>

        {/* Recent Activity and Enhanced Crash Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              📱 Recent Activity
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Latest user interactions and events"
                : "Real-time events from your app"}
            </p>
            <div className="overflow-x-auto max-h-64">
              {(() => {
                const recentEvents = dashboardData?.events?.events;

                return recentEvents && recentEvents.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Event
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Properties
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentEvents.slice(0, 8).map((event, index) => (
                        <tr
                          key={event._id || index}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {event.full_date}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-800 font-medium">
                            {event.event_type}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {event.user_display}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500 text-xs">
                            {event.properties_preview}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {event.time_only}
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
                          ? "Demo events would appear here"
                          : "Open your Android app and interact with it!"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">
              💥 Enhanced Crash Reports
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isDemoMode
                ? "Recent crashes with trend indicators"
                : "Real crash reports with trend analysis"}
            </p>
            <div className="overflow-x-auto max-h-64">
              {(() => {
                const crashes = dashboardData?.crashReports?.recent_crashes;

                return crashes && crashes.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Error
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Device
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Count
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Trend
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Seen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {crashes.slice(0, 5).map((crash, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedCrash(crash)}
                        >
                          <td className="px-3 py-2 text-sm text-red-600">
                            {crash.error}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-800">
                            {crash.device}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-800">
                            {crash.count}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {getTrendIndicator(crash.trend)}
                            <span
                              className={`ml-1 ${
                                crash.trend === "increasing"
                                  ? "text-red-600"
                                  : crash.trend === "decreasing"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {crash.trend}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500">
                            {crash.lastSeen}
                          </td>
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
                          ? "Demo crash data would appear here"
                          : "Your app is running smoothly!"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Data Source Indicator */}
        <div
          className={`p-4 rounded-lg border-2 ${
            isDemoMode
              ? "bg-blue-50 border-blue-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <div className="flex items-center">
            <span className={`text-xl mr-3`}>{isDemoMode ? "📊" : "✅"}</span>
            <div>
              <h3
                className={`font-medium ${
                  isDemoMode ? "text-blue-800" : "text-green-800"
                }`}
              >
                {isDemoMode
                  ? "Demo Mode - Professional Analytics Showcase"
                  : "Live Mode - Real Analytics Data"}
              </h3>
              <p
                className={`text-sm ${
                  isDemoMode ? "text-blue-600" : "text-green-600"
                }`}
              >
                {isDemoMode
                  ? "Demonstrating comprehensive analytics capabilities with realistic data patterns including user growth, retention analysis, crash trends, and device insights"
                  : `Connected to live API • Last updated: ${new Date().toLocaleTimeString()} • Showing real data from your Android app including enhanced crash analytics and user retention`}
              </p>
            </div>
          </div>
        </div>
        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  📱 Event Details
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Event Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    📊 Event Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Event Type:</span>{" "}
                      {selectedEvent.event_type}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>{" "}
                      {selectedEvent.user_id || "Anonymous"}
                    </div>
                    <div>
                      <span className="font-medium">Full Timestamp:</span>{" "}
                      {selectedEvent.timestamp}
                    </div>
                    <div>
                      <span className="font-medium">Session ID:</span>{" "}
                      {selectedEvent.session_id || "No session"}
                    </div>
                  </div>
                </div>

                {/* Properties */}
                {selectedEvent.properties &&
                  Object.keys(selectedEvent.properties).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        🎯 Event Properties
                      </h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedEvent.properties).map(
                          ([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium w-32">• {key}:</span>
                              <span className="text-gray-600">
                                {JSON.stringify(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Device Info */}
                {selectedEvent.device_info &&
                  Object.keys(selectedEvent.device_info).length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        📱 Device Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedEvent.device_info).map(
                          ([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium w-32">• {key}:</span>
                              <span className="text-gray-600">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Crash Details Modal */}
        {selectedCrash && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  💥 Crash Report Details
                </h3>
                <button
                  onClick={() => setSelectedCrash(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Crash Overview */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-3">
                    🚨 Error Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Error Type:</span>{" "}
                      <code className="bg-red-100 px-2 py-1 rounded">
                        {selectedCrash.error}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Device:</span>{" "}
                      {selectedCrash.device}
                    </div>
                    <div>
                      <span className="font-medium">Occurrences:</span>{" "}
                      <span className="font-bold text-red-600">
                        {selectedCrash.count}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Last Seen:</span>{" "}
                      {selectedCrash.lastSeen}
                    </div>
                    <div>
                      <span className="font-medium">Trend:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedCrash.trend === "increasing"
                            ? "bg-red-100 text-red-800"
                            : selectedCrash.trend === "decreasing"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getTrendIndicator(selectedCrash.trend)}{" "}
                        {selectedCrash.trend}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Error Message */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    📝 Error Message
                  </h4>
                  <div className="bg-white p-3 rounded border text-sm font-mono">
                    {selectedCrash.message || selectedCrash.error}
                  </div>
                </div>

                {/* Stack Trace (if available) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    🔍 Stack Trace
                  </h4>
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-x-auto max-h-64">
                    {selectedCrash.stack_trace ||
                      "Stack trace not available for demo data"}
                  </div>
                </div>

                {/* Impact Analysis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">
                      📊 Impact Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        Users Affected:{" "}
                        <span className="font-bold">
                          {selectedCrash.users_affected || "Unknown"}
                        </span>
                      </div>
                      <div>
                        Impact Score:{" "}
                        <span className="font-bold">
                          {selectedCrash.impact_score || "Calculating..."}
                        </span>
                      </div>
                      <div>
                        Severity:{" "}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            selectedCrash.count > 100
                              ? "bg-red-100 text-red-800"
                              : selectedCrash.count > 50
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedCrash.count > 100
                            ? "Critical"
                            : selectedCrash.count > 50
                            ? "High"
                            : "Medium"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      🛠️ Debugging Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        First Occurrence:{" "}
                        <span className="font-mono">
                          {selectedCrash.first_seen || "Unknown"}
                        </span>
                      </div>
                      <div>
                        Platform: <span className="font-mono">Android</span>
                      </div>
                      <div>
                        Crash ID:{" "}
                        <span className="font-mono text-xs">
                          {selectedCrash.crash_id ||
                            "demo_crash_" +
                              Math.random().toString(36).substr(2, 9)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedCrash(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Error: ${selectedCrash.error}\nDevice: ${selectedCrash.device}\nCount: ${selectedCrash.count}`
                    );
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  📋 Copy Details
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
