import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from 'react-simple-maps';

/**
 * Interactive World Map Component
 * Shows user distribution by country with color-coded intensity
 */
const WorldMap = ({ data, title = "Geographic Distribution" }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  // World map data URL
  const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

  /**
   * Get user count for a specific country
   */
  const getUserCountForCountry = (countryName) => {
    if (!data || !Array.isArray(data)) return 0;
    
    const country = data.find(item => 
      item.name.toLowerCase() === countryName.toLowerCase() ||
      item.name.toLowerCase().includes(countryName.toLowerCase()) ||
      countryName.toLowerCase().includes(item.name.toLowerCase())
    );
    
    return country ? country.value : 0;
  };

  /**
   * Get color for a country based on whether it has users
   */
  const getCountryColor = (countryName) => {
    const userCount = getUserCountForCountry(countryName);
    
    if (userCount === 0) {
      return '#f1f5f9'; // Light gray for no users
    }
    
    // Color palette for countries with users
    const countryColors = [
      '#3b82f6', // Blue
      '#10b981', // Green  
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Orange
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#14b8a6', // Teal
      '#eab308', // Yellow
      '#dc2626', // Red variant
      '#7c3aed', // Violet
      '#059669', // Emerald
      '#0891b2', // Sky
      '#65a30d', // Green variant
      '#ea580c', // Orange variant
      '#be185d', // Pink variant
      '#4338ca'  // Blue variant
    ];
    
    // Find the index of this country in our data array
    const countryIndex = data ? data.findIndex(item => 
      item.name.toLowerCase() === countryName.toLowerCase() ||
      item.name.toLowerCase().includes(countryName.toLowerCase()) ||
      countryName.toLowerCase().includes(item.name.toLowerCase())
    ) : -1;
    
    // If country found in data, use its index to pick a color
    if (countryIndex >= 0) {
      return countryColors[countryIndex % countryColors.length];
    }
    
    // Fallback: hash the country name to get consistent color
    let hash = 0;
    for (let i = 0; i < countryName.length; i++) {
      hash = countryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % countryColors.length;
    
    return countryColors[colorIndex];
  };

  /**
   * Handle mouse hover over country
   */
  const handleMouseEnter = (event, geo) => {
    const countryName = geo.properties.NAME;
    const userCount = getUserCountForCountry(countryName);
    
    setTooltipContent(`${countryName}: ${userCount.toLocaleString()} users`);
    setShowTooltip(true);
  };

  /**
   * Handle mouse move to update tooltip position
   */
  const handleMouseMove = (event) => {
    setTooltipPosition({
      x: event.clientX + 10,
      y: event.clientY - 30
    });
  };

  /**
   * Handle mouse leave country
   */
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  /**
   * Calculate total users for summary
   */
  const totalUsers = data ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  const totalCountries = data ? data.filter(item => item.value > 0).length : 0;

  return (
    <div className="relative">
      {/* Map Title and Summary */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          🌍 {title}
        </h3>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>👥 {totalUsers.toLocaleString()} total users</span>
          <span>🌎 {totalCountries} countries</span>
        </div>
      </div>

      {/* World Map */}
      <div className="relative bg-blue-50 rounded-lg overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20]
          }}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
        >
          {/* Background sphere (ocean) */}
          <Sphere stroke="#e0e7ff" strokeWidth={0.5} fill="#f0f9ff" />
          
          {/* Grid lines */}
          <Graticule stroke="#e0e7ff" strokeWidth={0.3} />
          
          {/* Countries */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.NAME;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(countryName)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    onMouseEnter={(event) => handleMouseEnter(event, geo)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      hover: {
                        fill: '#2563eb', // Blue on hover
                        outline: 'none',
                        cursor: 'pointer',
                        strokeWidth: 1,
                      },
                      pressed: {
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium z-50 pointer-events-none shadow-lg"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%)'
            }}
          >
            {tooltipContent}
            {/* Tooltip arrow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"
              style={{ marginTop: '-4px' }}
            />
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span>No users</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-4 bg-blue-500 rounded-sm"></div>
              <div className="w-3 h-4 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-4 bg-amber-500 rounded-sm"></div>
              <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-3 h-4 bg-purple-500 rounded-sm"></div>
            </div>
            <span>Countries with users</span>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="text-center text-gray-500">
            <span className="text-4xl mb-2 block">🌍</span>
            <p className="font-medium">No Geographic Data</p>
            <p className="text-sm">User location data will appear when users register</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;