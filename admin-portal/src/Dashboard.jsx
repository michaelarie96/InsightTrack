import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { StatLineChart, DistributionPieChart, HorizontalBarChart } from './ChartComponents';

// Main Dashboard Component
const Dashboard = () => {
  // User Growth Chart Data
  const userGrowthData = [
    { month: 'Jan', users: 4000 },
    { month: 'Feb', users: 4300 },
    { month: 'Mar', users: 4500 },
    { month: 'Apr', users: 4800 },
    { month: 'May', users: 5200 },
    { month: 'Jun', users: 5600 },
    { month: 'Jul', users: 6000 },
  ];
  
  // User Retention Chart Data
  const userRetentionData = [
    { day: 'Day 1', retention: 100 },
    { day: 'Day 3', retention: 68 },
    { day: 'Day 7', retention: 56 },
    { day: 'Day 14', retention: 45 },
    { day: 'Day 30', retention: 30 },
    { day: 'Day 60', retention: 23 },
    { day: 'Day 90', retention: 17 },
  ];
  
  // Session Duration Data
  const sessionDurationData = [
    { name: '<1 min', value: 15 },
    { name: '1-5 mins', value: 30 },
    { name: '5-15 mins', value: 25 },
    { name: '15-30 mins', value: 18 },
    { name: '>30 mins', value: 12 },
  ];
  
  // Geographic Distribution Data
  const geographicDistributionData = [
    { name: 'United States', value: 34.5 },
    { name: 'India', value: 14.9 },
    { name: 'Germany', value: 8.6 },
    { name: 'Japan', value: 6.2 },
    { name: 'Other', value: 28.3 },
  ];
  
  // Top Events Data
  const topEventsData = [
    { name: 'Login', value: 4000 },
    { name: 'Search', value: 3000 },
    { name: 'View Product', value: 2000 },
    { name: 'Add to Cart', value: 1500 },
    { name: 'Checkout', value: 1000 },
    { name: 'Purchase', value: 800 },
  ];
  
  // Crash Reports Data
  const crashReportsData = [
    { error: 'NullPointerException', device: 'Samsung Galaxy S21', count: 24, lastSeen: '2 hours ago' },
    { error: 'IndexOutOfBoundsException', device: 'Google Pixel 6', count: 17, lastSeen: '5 hours ago' },
    { error: 'NetworkOnMainThreadException', device: 'Xiaomi Mi 11', count: 13, lastSeen: '8 hours ago' },
    { error: 'IllegalStateException', device: 'OnePlus 9', count: 11, lastSeen: '12 hours ago' },
    { error: 'OutOfMemoryError', device: 'Samsung Galaxy A52', count: 7, lastSeen: '1 day ago' },
  ];
  
  // Recent Activity Log Data
  const recentActivityData = [
    { userId: 'u_57928', event: 'Login', device: 'Samsung Galaxy S21', location: 'United States', time: '2 minutes ago' },
    { userId: 'u_23451', event: 'Product View', device: 'Google Pixel 6', location: 'Canada', time: '5 minutes ago' },
    { userId: 'u_89023', event: 'Purchase', device: 'Xiaomi Mi 11', location: 'India', time: '8 minutes ago' },
    { userId: 'u_34512', event: 'App Launch', device: 'OnePlus 9', location: 'Germany', time: '12 minutes ago' },
    { userId: 'u_67890', event: 'Search', device: 'Samsung Galaxy A52', location: 'Brazil', time: '15 minutes ago' },
    { userId: 'u_12345', event: 'Settings Changed', device: 'Google Pixel 5', location: 'United Kingdom', time: '20 minutes ago' },
    { userId: 'u_78901', event: 'Logout', device: 'Xiaomi Redmi Note 10', location: 'Japan', time: '25 minutes ago' },
    { userId: 'u_23456', event: 'Profile Updated', device: 'Samsung Galaxy S22', location: 'Australia', time: '30 minutes ago' },
    { userId: 'u_45678', event: 'Account Created', device: 'OnePlus 10 Pro', location: 'France', time: '35 minutes ago' },
    { userId: 'u_90123', event: 'Password Reset', device: 'Google Pixel 4a', location: 'Spain', time: '40 minutes ago' },
  ];

  // Summary metrics
  const metrics = [
    {
      title: 'Total Users',
      value: '24,521',
      change: '+12.5% from last month',
      icon: '👤',
      isPositive: true
    },
    {
      title: 'Active Users',
      value: '18,432',
      change: '+8.2% from last month',
      icon: '👤',
      isPositive: true
    },
    {
      title: 'Avg. Session',
      value: '18m 26s',
      change: '-2.3% from last month',
      icon: '⏱️',
      isPositive: false
    },
    {
      title: 'Total Events',
      value: '342,611',
      change: '+24.5% from last month',
      icon: '📊',
      isPositive: true
    },
    {
      title: 'Crash Rate',
      value: '0.82%',
      change: '-12.7% from last month',
      icon: '⚠️',
      isPositive: true
    }
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const BLUE_COLOR = '#3b82f6';
  const RED_COLOR = '#ef4444';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
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

        {/* User Growth and Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">User Growth</h2>
            <p className="text-sm text-gray-500 mb-4">New user acquisition over time</p>
            <div className="h-64">
              <StatLineChart 
                data={userGrowthData} 
                dataKey="users" 
                xAxis="month" 
                color={BLUE_COLOR} 
              />
            </div>
          </div>

          {/* User Retention Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">User Retention</h2>
            <p className="text-sm text-gray-500 mb-4">Percentage of users who return after first use</p>
            <div className="h-64">
              <StatLineChart 
                data={userRetentionData} 
                dataKey="retention" 
                xAxis="day" 
                color={BLUE_COLOR} 
              />
            </div>
          </div>
        </div>

        {/* Session Duration and Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Duration Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">Session Duration</h2>
            <p className="text-sm text-gray-500 mb-4">Distribution of session lengths</p>
            <div className="h-64">
              <DistributionPieChart 
                data={sessionDurationData} 
                colors={COLORS} 
                dataKey="value" 
                nameKey="name" 
              />
            </div>
          </div>

          {/* Geographic Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">Geographic Distribution</h2>
            <p className="text-sm text-gray-500 mb-4">Users by country</p>
            <div className="h-64">
              <DistributionPieChart 
                data={geographicDistributionData} 
                colors={COLORS} 
                dataKey="value" 
                nameKey="name" 
              />
            </div>
          </div>
        </div>

        {/* Top Events and Crash Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Events Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">Top Events</h2>
            <p className="text-sm text-gray-500 mb-4">Most frequent user actions</p>
            <div className="h-64">
              <HorizontalBarChart 
                data={topEventsData} 
                color={BLUE_COLOR} 
                dataKey="value" 
                categoryKey="name" 
              />
            </div>
          </div>

          {/* Crash Reports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800">Crash Reports</h2>
            <p className="text-sm text-gray-500 mb-4">Recent app crashes and errors</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {crashReportsData.map((report, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600">{report.error}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{report.device}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{report.count}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{report.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-800">Recent Activity Log</h2>
          <p className="text-sm text-gray-500 mb-4">Latest app usage and events</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivityData.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{activity.userId}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{activity.event}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{activity.device}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-800">{activity.location}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;