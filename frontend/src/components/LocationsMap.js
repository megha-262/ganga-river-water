import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Droplets, Calendar, Info } from 'lucide-react';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for monitoring locations
const createLocationIcon = (riverKm) => {
  // Color based on river distance (source to delta)
  let color = '#3b82f6'; // blue
  if (riverKm < 500) color = '#10b981'; // green (upper reaches)
  else if (riverKm < 1000) color = '#3b82f6'; // blue (middle reaches)
  else if (riverKm < 1500) color = '#f59e0b'; // yellow (lower middle)
  else color = '#ef4444'; // red (delta region)

  return L.divIcon({
    className: 'custom-location-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background-color: ${color};
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">
          ${riverKm}km
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to fit map bounds to all locations
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(location => 
        location.coordinates && 
        location.coordinates.latitude && 
        location.coordinates.longitude
      );

      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(
          validLocations.map(location => [
            location.coordinates.latitude,
            location.coordinates.longitude
          ])
        );
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [locations, map]);

  return null;
};

// Component to draw the Ganga river path
const RiverPath = ({ locations }) => {
  if (!locations || locations.length < 2) return null;

  // Sort locations by river kilometer to create the path
  const sortedLocations = [...locations]
    .filter(loc => loc.coordinates && loc.coordinates.latitude && loc.coordinates.longitude)
    .sort((a, b) => a.riverKm - b.riverKm);

  const pathCoordinates = sortedLocations.map(location => [
    location.coordinates.latitude,
    location.coordinates.longitude
  ]);

  return (
    <Polyline
      positions={pathCoordinates}
      pathOptions={{
        color: '#2563eb',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 5'
      }}
    />
  );
};

const LocationsMap = ({ locations = [], selectedLocation = null, onLocationSelect = null }) => {
  const mapRef = useRef();
  const [mapReady, setMapReady] = useState(false);

  // Default center (Haridwar, Uttarakhand - source region)
  const defaultCenter = [29.9457, 78.1642];
  const defaultZoom = 6;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocationColor = (riverKm) => {
    if (riverKm < 500) return 'text-green-600';
    else if (riverKm < 1000) return 'text-blue-600';
    else if (riverKm < 1500) return 'text-yellow-600';
    else return 'text-red-600';
  };

  const getLocationRegion = (riverKm) => {
    if (riverKm < 500) return 'Upper Ganga';
    else if (riverKm < 1000) return 'Middle Ganga';
    else if (riverKm < 1500) return 'Lower Middle Ganga';
    else return 'Delta Region';
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds to show all locations */}
        {mapReady && <FitBounds locations={locations} />}
        
        {/* Draw river path */}
        <RiverPath locations={locations} />
        
        {/* Location markers */}
        {locations.map((location) => {
          if (!location.coordinates || !location.coordinates.latitude || !location.coordinates.longitude) {
            return null;
          }

          return (
            <Marker
              key={location._id}
              position={[location.coordinates.latitude, location.coordinates.longitude]}
              icon={createLocationIcon(location.riverKm)}
              eventHandlers={{
                click: () => {
                  if (onLocationSelect) {
                    onLocationSelect(location);
                  }
                }
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(location.riverKm)} bg-gray-100`}>
                      {getLocationRegion(location.riverKm)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Distance from source:</span>
                      <span className="text-gray-700">{location.riverKm} km</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Coordinates:</span>
                      <span className="text-gray-700">
                        {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Monitoring since:</span>
                      <span className="text-gray-700">{formatDate(location.installationDate)}</span>
                    </div>
                    
                    {location.description && (
                      <div className="flex items-start gap-2 mt-3 pt-2 border-t border-gray-200">
                        <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                        <p className="text-gray-600 text-sm leading-relaxed">{location.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => window.open(`/location/${location._id}`, '_blank')}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Detailed Data
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">River Regions</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Upper Ganga (0-500km)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Middle Ganga (500-1000km)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Lower Middle (1000-1500km)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Delta Region (1500km+)</span>
          </div>
        </div>
      </div>
      
      {/* Location count indicator */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900">
            {locations.length} Monitoring Locations
          </span>
        </div>
      </div>
    </div>
  );
};

export default LocationsMap;