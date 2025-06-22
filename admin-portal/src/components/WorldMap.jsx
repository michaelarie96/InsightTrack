import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from 'react-simple-maps';

/**
 * Interactive World Map Component - FIXED VERSION
 * Shows user distribution by country with color-coded intensity
 */
const WorldMap = ({ data, title = "Geographic Distribution" }) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapLoadedRef = useRef(false);

  // Use a working geography data source
  const geoUrl = "https://unpkg.com/world-atlas@1/world/110m.json";
  
  // 🔧 FIX: Pre-process data into a lookup map for faster, more reliable matching
  const countryDataMap = useMemo(() => {
    console.log('🔄 Creating country data map from:', data);
    
    if (!data || !Array.isArray(data)) {
      console.log('❌ No data provided to WorldMap');
      return new Map();
    }

    const map = new Map();
    
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

    // Process each country in our data
    data.forEach(country => {
      if (!country.name || country.name === 'Unknown') return;
      
      const countryName = country.name;
      const userCount = country.value || 0;
      
      // Store under original name
      map.set(countryName.toLowerCase(), userCount);
      
      // Store under mapped names if they exist
      Object.entries(countryMappings).forEach(([key, value]) => {
        if (key.toLowerCase() === countryName.toLowerCase()) {
          map.set(value.toLowerCase(), userCount);
        }
        if (value.toLowerCase() === countryName.toLowerCase()) {
          map.set(key.toLowerCase(), userCount);
        }
      });
      
      console.log(`📊 Mapped "${countryName}" → ${userCount} users`);
    });
    
    console.log(`✅ Country data map created with ${map.size} entries`);
    return map;
  }, [data]);

  // 🔧 FIX: Simplified and more reliable country lookup
  const getUserCountForCountry = (countryName) => {
    if (!countryName || countryName === 'Unknown' || countryDataMap.size === 0) {
      return 0;
    }

    // Try exact match first
    const exact = countryDataMap.get(countryName.toLowerCase());
    if (exact !== undefined) {
      console.log(`✅ Found exact match: ${countryName} → ${exact} users`);
      return exact;
    }

    // Try partial matching
    for (const [mapKey, userCount] of countryDataMap.entries()) {
      if (mapKey.includes(countryName.toLowerCase()) || 
          countryName.toLowerCase().includes(mapKey)) {
        console.log(`✅ Found partial match: ${countryName} → ${userCount} users`);
        return userCount;
      }
    }

    console.log(`❌ No match found for: ${countryName}`);
    return 0;
  };

  // 🔧 FIX: Calculate max users for color scaling from the map
  const maxUsers = useMemo(() => {
    if (countryDataMap.size === 0) return 1;
    const max = Math.max(...countryDataMap.values());
    console.log(`📊 Maximum user count: ${max}`);
    return max;
  }, [countryDataMap]);

  /**
   * Get color intensity for a country based on user count
   */
  const getCountryColor = (countryName) => {
    const userCount = getUserCountForCountry(countryName);
    
    if (userCount === 0) {
      return '#e2e8f0'; // Light gray for no users
    }

    // Normalize to 0-1 scale
    const intensity = Math.min(userCount / maxUsers, 1);

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
    const selectedColor = colors[colorIndex];
    
    // Debug: Log color selection for first few countries
    if (userCount > 0) {
      console.log(`🎨 Color for ${countryName}: ${userCount} users (${(intensity * 100).toFixed(1)}% intensity) → ${selectedColor}`);
    }
    
    return selectedColor;
  };

  /**
   * Handle mouse hover over country
   */
  const handleMouseEnter = (event, geo) => {
    const countryName = geo.properties.NAME_EN || 
                        geo.properties.NAME || 
                        geo.properties.ADMIN || 
                        geo.properties.NAME_LONG ||
                        'Unknown';
    
    const userCount = getUserCountForCountry(countryName);
    
    console.log(`🖱️ Hover: ${countryName} → ${userCount} users`);
    
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

  // Calculate statistics for summary
  const totalUsers = data ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  const totalCountries = data ? data.filter(item => item.value > 0).length : 0;
  const topCountry = data && data.length > 0 ? data.reduce((max, country) => 
    country.value > max.value ? country : max
  ) : null;

  // Debug log when data changes
  useEffect(() => {
    console.log('🗺️ WorldMap data updated:', {
      dataLength: data?.length || 0,
      totalUsers,
      totalCountries,
      topCountry: topCountry?.name,
      mapSize: countryDataMap.size
    });
  }, [data, totalUsers, totalCountries, topCountry, countryDataMap.size]);

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
            <span>🏆 Top: {topCountry.name} ({topCountry.value.toLocaleString()})</span>
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
              // Set map loaded only once
              if (geographies.length > 0 && !mapLoadedRef.current) {
                console.log('🌍 Geographies loaded:', geographies.length, 'countries');
                mapLoadedRef.current = true;
                setTimeout(() => {
                  console.log('✅ Map successfully loaded!');
                  setMapLoaded(true);
                }, 0);
              }

              return geographies.map((geo) => {
                const countryName = geo.properties.NAME_EN || 
                                  geo.properties.NAME || 
                                  geo.properties.ADMIN || 
                                  geo.properties.NAME_LONG ||
                                  'Unknown';
                
                const fillColor = getCountryColor(countryName);
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
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

      {/* Color Legend and Top Countries */}
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

        {/* Top Countries List */}
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