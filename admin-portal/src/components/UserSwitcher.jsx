import React from 'react';

/**
 * User Switcher Component - Switch between different app packages
 */
const UserSwitcher = ({ currentUser, onUserChange, availableUsers }) => {
  
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Select Analytics Dashboard</h3>
        
        <div className="flex flex-wrap gap-3">
          {availableUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserChange(user)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                currentUser.id === user.id
                  ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{user.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.appType}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Current Selection Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentUser.icon}</span>
            <div>
              <h4 className="font-medium text-gray-800">{currentUser.name}</h4>
              <p className="text-sm text-gray-600">{currentUser.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Package:</strong> {currentUser.package}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSwitcher;