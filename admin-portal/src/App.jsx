import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import ApiTest from './components/ApiTest';

function App() {
  const [showApiTest, setShowApiTest] = useState(true); // Start with test visible

  return (
    <div className="App flex">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        {showApiTest ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">🔧 Setup & Testing</h1>
              <button 
                onClick={() => setShowApiTest(false)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✅ Continue to Dashboard
              </button>
            </div>
            <ApiTest />
          </div>
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  );
}

export default App;