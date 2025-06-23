import React from 'react';

const Sidebar = ({ currentUser, onUserChange, availableUsers }) => {
  return (
    <div className="h-screen flex-shrink-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* App Title */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-gray-800">InsightTrack</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-3 flex-shrink-0">
        <div className="space-y-1">
          <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
            <svg className="mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
        </div>
      </nav>
      
      {/* Spacer to push bottom content down */}
      <div className="flex-1"></div>
      
      {/* User Profile with User Switcher - Fixed at bottom */}
      <div className="flex-shrink-0">
        {/* User Switcher Section */}
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Switch Dashboard</p>
          <div className="space-y-2">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserChange(user)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  currentUser.id === user.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="mr-3 text-lg">{user.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.appType}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Current User Profile */}
        <div className="flex items-center px-4 py-3 bg-gray-50">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {currentUser.icon}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
            <p className="text-xs font-medium text-gray-500">{currentUser.appType}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;