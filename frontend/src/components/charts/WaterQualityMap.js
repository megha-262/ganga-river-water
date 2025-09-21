import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ganga River path coordinates with water quality data (from source to mouth)
const gangaRiverSegments = [
  // Excellent quality (WQI 80-100) - Green
  {
    path: [
      [30.0668, 79.0193], // Gangotri (source) - WQI 94
      [30.1588, 78.9312], // Uttarkashi
      [30.0869, 78.2676], // Tehri
      [29.9457, 78.1642], // Haridwar - WQI 94
    ],
    color: '#10b981', // Green
    quality: 'excellent',
    wqi: 94
  },
  // Good quality (WQI 60-79) - Yellow-Green
  {
    path: [
      [29.9457, 78.1642], // Haridwar
      [29.8543, 77.8880], // Roorkee
      [29.3803, 77.7064], // Muzaffarnagar
      [28.9845, 77.7064], // Meerut
      [28.6692, 77.4538], // Ghaziabad
      [28.6139, 77.2090], // Delhi
      [27.8974, 78.0880], // Aligarh
      [27.1767, 78.0081], // Agra
      [26.8467, 80.9462], // Lucknow
      [26.4499, 80.3319], // Kanpur - WQI 67
    ],
    color: '#84cc16', // Lime green
    quality: 'good',
    wqi: 67
  },
  // Fair quality (WQI 40-59) - Orange
  {
    path: [
      [26.4499, 80.3319], // Kanpur
      [25.4358, 81.8463], // Allahabad (Prayagraj) - WQI 67
      [25.3176, 82.9739], // Varanasi - WQI 67
      [25.5941, 85.1376], // Patna - WQI 61
      [25.2048, 87.4501], // Bhagalpur - WQI 56
    ],
    color: '#f59e0b', // Amber
    quality: 'fair',
    wqi: 61
  },
  // Poor quality (WQI 20-39) - Red-Orange
  {
    path: [
      [25.2048, 87.4501], // Bhagalpur
      [24.7914, 87.3119], // Rajmahal - WQI 56
      [24.8318, 87.9118], // Farakka - WQI 56
      [23.5041, 88.1955], // Murshidabad - WQI 56
      [22.9868, 88.1955], // Nabadwip
      [22.5726, 88.3639], // Kolkata - WQI 56
      [21.8045, 88.1955], // Sundarbans (mouth) - WQI 50
    ],
    color: '#ef4444', // Red
    quality: 'poor',
    wqi: 53
  }
];

// Custom marker icons based on water quality status
// Enhanced custom icon creation with better status indicators
const createCustomIcon = (status, hasAlert = false) => {
  const getIconConfig = (status) => {
    switch (status) {
      case 'excellent':
        return { color: '#10b981', bgColor: '#d1fae5', borderColor: '#059669' };
      case 'good':
        return { color: '#3b82f6', bgColor: '#dbeafe', borderColor: '#2563eb' };
      case 'fair':
        return { color: '#f59e0b', bgColor: '#fef3c7', borderColor: '#d97706' };
      case 'poor':
        return { color: '#ef4444', bgColor: '#fee2e2', borderColor: '#dc2626' };
      default:
        return { color: '#6b7280', bgColor: '#f3f4f6', borderColor: '#4b5563' };
    }
  };

  const config = getIconConfig(status);
  const alertIndicator = hasAlert ? `
    <div style="
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border: 1px solid white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    "></div>
  ` : '';

  const iconHtml = `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      background: ${config.bgColor};
      border: 2px solid ${config.borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: ${config.color};
        border-radius: 50%;
      "></div>
      ${alertIndicator}
    </div>
    <style>
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    </style>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      // Filter out locations without valid coordinates
      const validLocations = locations.filter(location => 
        location.coordinates && 
        location.coordinates.coordinates && 
        Array.isArray(location.coordinates.coordinates) && 
        location.coordinates.coordinates.length >= 2
      );

      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map(location => [
            location.coordinates.coordinates[1], // latitude
            location.coordinates.coordinates[0]  // longitude
          ])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [locations, map]);

  return null;
};

const WaterQualityMap = ({ locations = [], waterQualityData = [], alerts = [] }) => {
  const mapRef = useRef();

  // Create a map of location ID to water quality data
  const qualityMap = waterQualityData.reduce((acc, reading) => {
    const locationId = reading.locationId?._id || reading.locationId;
    acc[locationId] = reading;
    return acc;
  }, {});

  // Create a map of location ID to alerts
  const alertMap = alerts.reduce((acc, alert) => {
    const locationId = alert.locationId?._id || alert.locationId;
    if (!acc[locationId]) acc[locationId] = [];
    acc[locationId].push(alert);
    return acc;
  }, {});

  // Default center (Haridwar, Uttarakhand)
  const defaultCenter = [29.9457, 78.1642];
  const defaultZoom = 6;

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'excellent': return `${baseClasses} bg-green-100 text-green-800`;
      case 'good': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'fair': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'poor': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatParameter = (param) => {
    if (!param) return 'N/A';
    return `${param.value} ${param.unit}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 relative">
      {/* Enhanced Color Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">Water Quality Index</div>
        <div className="space-y-1">
          {gangaRiverSegments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-1 rounded"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-xs text-gray-600 capitalize">
                {segment.quality} ({segment.wqi})
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-xs text-gray-600">Alert Active</span>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds locations={locations} />

        {/* Ganga River Path with Pollution-based Colors */}
        {gangaRiverSegments.map((segment, index) => (
          <Polyline
            key={index}
            positions={segment.path}
            pathOptions={{
              color: segment.color,
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-gray-800 mb-2">
                  River Segment Quality
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={getStatusBadge(segment.quality)}>
                      {segment.quality.charAt(0).toUpperCase() + segment.quality.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average WQI:</span>
                    <span className="font-medium">{segment.wqi}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}

        {locations.map((location) => {
          const reading = qualityMap[location._id];
          const locationAlerts = alertMap[location._id] || [];
          const hasActiveAlert = locationAlerts.some(alert => alert.status === 'active');
          const status = reading?.overallStatus || 'unknown';
          const coordinates = location.coordinates?.coordinates;
          
          // Skip if coordinates are not available
          if (!coordinates || coordinates.length < 2) {
            return null;
          }
          
          return (
            <Marker
              key={location._id}
              position={[coordinates[1], coordinates[0]]} // [lat, lng]
              icon={createCustomIcon(status, hasActiveAlert)}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-64 max-w-80">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words text-center">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 break-words text-center">
                    {location.city}, {location.state}
                  </p>
                  
                  {/* Alert Section */}
                  {hasActiveAlert && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-800">Active Alert</span>
                      </div>
                      <div className="text-xs text-red-700">
                        {locationAlerts.filter(alert => alert.status === 'active').length} pollution alert(s)
                      </div>
                    </div>
                  )}
                  
                  {reading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className={getStatusBadge(status)}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">WQI:</span>
                        <span className="text-sm font-semibold">{reading.waterQualityIndex}</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Parameters:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="break-words">
                            <span className="font-medium">DO:</span> {formatParameter(reading.parameters?.dissolvedOxygen)}
                          </div>
                          <div className="break-words">
                            <span className="font-medium">BOD:</span> {formatParameter(reading.parameters?.biochemicalOxygenDemand)}
                          </div>
                          <div className="break-words">
                            <span className="font-medium">pH:</span> {formatParameter(reading.parameters?.ph)}
                          </div>
                          <div className="break-words">
                            <span className="font-medium">Turbidity:</span> {formatParameter(reading.parameters?.turbidity)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        <div>River Km: {location.riverKm}</div>
                        <div>Last Updated: {formatTimestamp(reading.timestamp)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <p className="font-medium">No recent data available</p>
                        <p className="text-xs mt-1">Monitoring station may be offline</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        River Km: {location.riverKm}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default WaterQualityMap;