import React from 'react';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';

function App() {
  return (
    <div className="App flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;