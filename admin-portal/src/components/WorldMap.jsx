import React, { useState, useEffect, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from 'react-simple-maps';

/**
 * Interactive World Map Component - Final Fixed Version
 * Shows user distribution by country with color-coded intensity (like Firebase Analytics)
 */
const WorldMap = ({ data, title = "Geographic Distribution" }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapLoadedRef = useRef(false);

  // Use a working geography data source from unpkg.com
  const geoUrl = "https://unpkg.com/world-atlas@1/world/110m.json";
  
  // Debug logging
  useEffect(() => {
    console.log('🗺️ WorldMap component mounted');
    console.log('📊 Data received:', data);
    console.log('🌐 Geography URL:', geoUrl);
  }, [data]);

  /**
   * Get user count for a specific country
   * Handles common country name variations and undefined values
   */
  const getUserCountForCountry = (countryName) => {
    if (!data || !Array.isArray(data) || !countryName || countryName === 'Unknown') return 0;
    
    // Common country name mappings for better matching
    const countryMappings = {
      'United States of America': 'United States',
      'USA': 'United States',
      'US': 'United States',
      'UK': 'United Kingdom',
      'Britain': 'United Kingdom',
      'Russia': 'Russian Federation',
      'South Korea': 'Korea, Republic of',
      'North Korea': 'Korea, Democratic People\'s Republic of',
      'Iran': 'Iran, Islamic Republic of',
      'Syria': 'Syrian Arab Republic',
      'Venezuela': 'Venezuela, Bolivarian Republic of',
      'Bolivia': 'Bolivia, Plurinational State of',
      'Tanzania': 'United Republic of Tanzania',
      'Macedonia': 'North Macedonia',
      'Czech Republic': 'Czechia',
      'Congo': 'Democratic Republic of the Congo'
    };

    // Try exact match first
    let country = data.find(item => 
      item.name && item.name.toLowerCase() === countryName.toLowerCase()
    );

    if (country) {
      return country.value;
    }

    // Try mapped name
    const mappedName = countryMappings[countryName];
    if (mappedName) {
      country = data.find(item => 
        item.name && item.name.toLowerCase() === mappedName.toLowerCase()
      );
      if (country) {
        return country.value;
      }
    }

    // Try partial match
    country = data.find(item => 
      item.name && (
        item.name.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(item.name.toLowerCase())
      )
    );
    
    if (country) {
      return country.value;
    }

    return 0;
  };

  /**
   * Get color intensity for a country based on user count
   * Uses a gradient from light to dark blue (like Firebase)
   */
  const getCountryColor = (countryName) => {
    const userCount = getUserCountForCountry(countryName);
    
    if (userCount === 0) {
      return '#e2e8f0'; // Light gray with better contrast against blue ocean
    }

    // Find the maximum user count for scaling
    const maxUsers = data && data.length > 0 ? Math.max(...data.map(item => item.value)) : 1;
    const intensity = Math.min(userCount / maxUsers, 1); // Normalize to 0-1

    // Firebase-like blue gradient colors
    const colors = [
      '#dbeafe', // Very light blue (lowest)
      '#bfdbfe', // Light blue
      '#93c5fd', // Medium light blue
      '#60a5fa', // Medium blue
      '#3b82f6', // Blue
      '#2563eb', // Dark blue
      '#1d4ed8', // Darker blue
      '#1e40af'  // Darkest blue (highest)
    ];

    // Map intensity to color index
    const colorIndex = Math.floor(intensity * (colors.length - 1));
    return colors[colorIndex];
  };

  /**
   * Handle mouse hover over country
   */
  const handleMouseEnter = (event, geo) => {
    // Use the same country name logic as in the map rendering
    const countryName = geo.properties.NAME_EN || 
                        geo.properties.NAME || 
                        geo.properties.ADMIN || 
                        geo.properties.NAME_LONG ||
                        geo.properties.COUNTRY ||
                        'Unknown';
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
   * Calculate statistics for summary
   */
  const totalUsers = data ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  const totalCountries = data ? data.filter(item => item.value > 0).length : 0;
  const topCountry = data && data.length > 0 ? data.reduce((max, country) => 
    country.value > max.value ? country : max
  ) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Map Title and Summary */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          🌍 {title}
        </h3>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>👥 {totalUsers.toLocaleString()} total users</span>
          <span>🌎 {totalCountries} countries</span>
          {topCountry && (
            <span>🏆 Top: {topCountry.name}</span>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-blue-50 rounded-lg overflow-hidden border border-gray-200">
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading world map...</p>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🗺️</span>
              <p className="text-sm text-gray-600 mb-2">Map temporarily unavailable</p>
              <p className="text-xs text-gray-500">Showing data below</p>
            </div>
          </div>
        )}

        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 250,
            center: [0, 0]
          }}
          width={1200}
          height={600}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Background sphere (ocean) */}
          <Sphere stroke="#cbd5e1" strokeWidth={0.5} fill="#e0f2fe" />
          
          {/* Grid lines */}
          <Graticule stroke="#cbd5e1" strokeWidth={0.3} />
          
          {/* Countries */}
          <Geographies 
            geography={geoUrl}
            onError={(error) => {
              console.error('❌ Map loading error:', error);
              setMapError(true);
            }}
          >
            {({ geographies }) => {
              // Set map loaded only once using ref to prevent setState during render
              if (geographies.length > 0 && !mapLoadedRef.current) {
                console.log('🌍 Geographies loaded:', geographies.length, 'countries');
                mapLoadedRef.current = true;
                // Use setTimeout to update state after render completes
                setTimeout(() => {
                  console.log('✅ Map successfully loaded!');
                  setMapLoaded(true);
                }, 0);
              }

              return geographies.map((geo) => {
                // Debug: Let's see what properties are available (only once)
                if (geographies.indexOf(geo) === 0 && !mapLoadedRef.current) {
                  console.log('🗺️ First geography properties:', Object.keys(geo.properties));
                  console.log('🗺️ Sample geo object:', geo.properties);
                }
                
                // Try different possible property names for country
                const countryName = geo.properties.NAME_EN || 
                                  geo.properties.NAME || 
                                  geo.properties.ADMIN || 
                                  geo.properties.NAME_LONG ||
                                  geo.properties.COUNTRY ||
                                  'Unknown';
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(countryName)}
                    stroke="#ffffff"
                    strokeWidth={0.7}
                    onMouseEnter={(event) => handleMouseEnter(event, geo)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      hover: {
                        fill: '#1e40af', // Dark blue on hover
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
              });
            }}
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {showTooltip && mapLoaded && (
          <div
            className="fixed bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium z-50 pointer-events-none shadow-md"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px'
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>

      {/* Color Legend and Top Countries Fallback */}
      <div className="mt-4 flex-shrink-0">
        {/* Color Legend */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-300 border border-gray-400 rounded"></div>
              <span>No users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-4 bg-blue-100 rounded-sm"></div>
                <div className="w-3 h-4 bg-blue-300 rounded-sm"></div>
                <div className="w-3 h-4 bg-blue-500 rounded-sm"></div>
                <div className="w-3 h-4 bg-blue-700 rounded-sm"></div>
              </div>
              <span>Low → High user density</span>
            </div>
          </div>
        </div>

        {/* Top Countries (fallback when map fails or additional info) */}
        {data && data.length > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Top Countries:</div>
            <div className="flex flex-wrap gap-2">
              {data.slice(0, 5).map((country) => (
                <div 
                  key={country.name}
                  className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded text-xs"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCountryColor(country.name) }}
                  ></div>
                  <span className="font-medium">{country.name}</span>
                  <span className="text-gray-600">({country.value.toLocaleString()})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {(!data || data.length === 0) && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <span className="text-2xl mb-2 block">🌍</span>
            <p className="text-sm text-gray-600">No geographic data available</p>
            <p className="text-xs text-blue-600 mt-1">
              💡 Data will appear when users register through your Android app
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;