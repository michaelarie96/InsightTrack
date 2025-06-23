import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import ApiTest from './components/ApiTest';

const AVAILABLE_USERS = [
  {
    id: 'demo_admin',
    name: 'Demo Admin',
    package: 'com.example.androidapi',
    appType: 'Test App',
    icon: '🧪',
    description: 'Original demo app with comprehensive test events and analytics features'
  },
  {
    id: 'ecommerce_manager', 
    name: 'E-commerce Manager',
    package: 'com.insighttrack.ecommerce',
    appType: 'Shopping App',
    icon: '🛒',
    description: 'E-commerce demo app with product browsing, cart management, and purchase tracking'
  }
];

function App() {
  const [showApiTest, setShowApiTest] = useState(false);
  const [currentUser, setCurrentUser] = useState(AVAILABLE_USERS[0]); // Start with demo admin

  const handleUserChange = (newUser) => {
    setCurrentUser(newUser);
    console.log(`👤 Switching to ${newUser.name} (${newUser.package})`);
  };

  const allowDemoMode = currentUser.id === 'demo_admin';

  return (
    <div className="App flex">
      <Sidebar 
        currentUser={currentUser}
        onUserChange={handleUserChange}
        availableUsers={AVAILABLE_USERS}
      />
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
          <Dashboard currentUser={currentUser} allowDemoMode={allowDemoMode} />
        )}
      </div>
    </div>
  );
}

export default App;