import React from 'react';

/**
 * Mode Toggle Component - Switch between Demo and Live data
 */
const ModeToggle = ({ isDemoMode, onModeChange, disabled = false }) => {
  
  return (
    <div className="flex items-center space-x-4">
      {/* Mode Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-blue-500' : 'bg-green-500'}`}></div>
        <span className="text-sm font-medium text-gray-700">
          {isDemoMode ? 'Demo Mode' : 'Live Mode'}
        </span>
      </div>
      
      {/* Toggle Switch */}
      <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
        <input
          type="checkbox"
          className="sr-only"
          checked={!isDemoMode}
          onChange={(e) => onModeChange(!e.target.checked)}
          disabled={disabled}
        />
        <div 
          className={`${
            isDemoMode ? 'bg-blue-500' : 'bg-green-500'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && onModeChange(!isDemoMode)}
        >
          <span
            className={`${
              isDemoMode ? 'translate-x-1' : 'translate-x-6'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </div>
      </div>
      
      {/* Mode Labels */}
      <div className="flex items-center space-x-3 text-sm">
        <span className={`${isDemoMode ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
          📊 Demo
        </span>
        <span className={`${!isDemoMode ? 'font-semibold text-green-600' : 'text-gray-500'}`}>
          🟢 Live
        </span>
      </div>
    </div>
  );
};

/**
 * Mode Info Card - Explains what each mode shows
 */
export const ModeInfoCard = ({ isDemoMode }) => {
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isDemoMode 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">
          {isDemoMode ? '📊' : '🟢'}
        </span>
        <div>
          <h3 className={`font-semibold ${
            isDemoMode ? 'text-blue-800' : 'text-green-800'
          }`}>
            {isDemoMode ? 'Demo Mode - Rich Sample Data' : 'Live Mode - Real API Data'}
          </h3>
          <p className={`text-sm mt-1 ${
            isDemoMode ? 'text-blue-600' : 'text-green-600'
          }`}>
            {isDemoMode 
              ? 'Showing realistic data that demonstrates full platform capabilities. Perfect for presentations and demos.'
              : 'Showing actual data from your analytics API. This reflects real usage from your Android apps.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeToggle;