import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LocationCard = ({ location, waterQualityData = [] }) => {
  const navigate = useNavigate();

  // Safety check for location
  if (!location) {
    return null;
  }

  // Find the latest reading for this location
  const latestReading = waterQualityData.find(
    reading => reading.locationId?._id === location._id || reading.locationId === location._id
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatParameter = (param) => {
    if (!param) return 'N/A';
    return `${param.value} ${param.unit}`;
  };

  const handleCardClick = () => {
    navigate(`/location/${location._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {location.name || 'Unknown Location'}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{location.city || 'Unknown'}, {location.state || 'Unknown'}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            River Km: {location.riverKm || 'N/A'}
          </p>
        </div>
        
        {latestReading && (
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(latestReading.overallStatus)}`}>
              {latestReading.overallStatus}
            </span>
            {getTrendIcon(latestReading.trend)}
          </div>
        )}
      </div>

      {latestReading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Water Quality Index</span>
            <span className="text-lg font-bold text-blue-600">
              {latestReading.waterQualityIndex}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">DO:</span>
              <span className="ml-1 font-medium">
                {formatParameter(latestReading.parameters?.dissolvedOxygen)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">BOD:</span>
              <span className="ml-1 font-medium">
                {formatParameter(latestReading.parameters?.biochemicalOxygenDemand)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">pH:</span>
              <span className="ml-1 font-medium">
                {formatParameter(latestReading.parameters?.ph)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Turbidity:</span>
              <span className="ml-1 font-medium">
                {formatParameter(latestReading.parameters?.turbidity)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(latestReading.timestamp).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No recent data available</p>
          <p className="text-xs text-gray-400 mt-1">Click to view location details</p>
        </div>
      )}
    </div>
  );
};

export default LocationCard;