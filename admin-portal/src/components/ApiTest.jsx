import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const ApiTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testResults, setTestResults] = useState([]);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    const results = [];
    
    try {
      // Test 1: Health Check
      results.push({ test: 'Health Check', status: 'testing' });
      setTestResults([...results]);
      
      await analyticsAPI.healthCheck();
      results[0].status = 'success';
      results[0].message = 'API is healthy!';
      
      // Test 2: Get Event Stats
      results.push({ test: 'Event Statistics', status: 'testing' });
      setTestResults([...results]);
      
      const stats = await analyticsAPI.getEventStats('com.example.androidapi');
      results[1].status = 'success';
      results[1].message = `Found ${stats.total_events} events`;
      results[1].data = stats;
      
      setEventData(stats);
      setConnectionStatus('connected');
      
    } catch (error) {
      const lastTest = results[results.length - 1];
      if (lastTest && lastTest.status === 'testing') {
        lastTest.status = 'error';
        lastTest.message = error.message;
      }
      setConnectionStatus('error');
    }
    
    setTestResults(results);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'testing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4">🔧 API Connection Test</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Connection Status:</h3>
        <div className={`p-3 rounded-lg ${
          connectionStatus === 'connected' ? 'bg-green-50 text-green-800' :
          connectionStatus === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {connectionStatus === 'connected' && '🟢 Connected to Analytics API'}
          {connectionStatus === 'error' && '🔴 Cannot connect to Analytics API'}
          {connectionStatus === 'testing' && '🟡 Testing connection...'}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
              <span className="mr-2">{getStatusIcon(result.status)}</span>
              <span className="font-medium mr-2">{result.test}:</span>
              <span className={getStatusColor(result.status)}>
                {result.message || 'Running...'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {eventData && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">📊 Real Data Preview:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Total Events:</strong> {eventData.total_events}</p>
            <p><strong>Package:</strong> {eventData.package_name}</p>
            {eventData.top_events && eventData.top_events.length > 0 && (
              <div className="mt-2">
                <strong>Top Events:</strong>
                <ul className="ml-4 mt-1">
                  {eventData.top_events.slice(0, 3).map((event, index) => (
                    <li key={index}>• {event.name}: {event.value} times</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={testApiConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🔄 Test Again
      </button>
    </div>
  );
};

export default ApiTest;