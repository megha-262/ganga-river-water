import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on water quality status
const createCustomIcon = (status) => {
  const colors = {
    excellent: '#10b981', // green
    good: '#3b82f6',      // blue
    fair: '#f59e0b',      // yellow
    poor: '#ef4444',      // red
    unknown: '#6b7280',   // gray
  };

  const color = colors[status] || colors.unknown;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
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

const WaterQualityMap = ({ locations = [], waterQualityData = [] }) => {
  const mapRef = useRef();

  // Create a map of location ID to water quality data
  const qualityMap = waterQualityData.reduce((acc, reading) => {
    const locationId = reading.locationId?._id || reading.locationId;
    acc[locationId] = reading;
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

  const formatParameter = (param) => {
    if (!param) return 'N/A';
    return `${param.value} ${param.unit}`;
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
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

        {locations.map((location) => {
          const reading = qualityMap[location._id];
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
              icon={createCustomIcon(status)}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-64 max-w-80">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 truncate">
                    {location.city}, {location.state}
                  </p>
                  
                  {reading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <span className={`text-sm font-semibold capitalize ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">WQI:</span>
                        <span className="text-sm">{reading.waterQualityIndex}</span>
                      </div>
                      
                      <div className="border-t pt-2 mt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Parameters:</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="truncate">DO: {formatParameter(reading.parameters?.dissolvedOxygen)}</div>
                          <div className="truncate">BOD: {formatParameter(reading.parameters?.biochemicalOxygenDemand)}</div>
                          <div className="truncate">pH: {formatParameter(reading.parameters?.ph)}</div>
                          <div className="truncate">Turbidity: {formatParameter(reading.parameters?.turbidity)}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        River Km: {location.riverKm}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <p>No recent data available</p>
                      <div className="text-xs text-gray-400 mt-1">
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