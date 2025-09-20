import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Droplets,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../ui';
import moment from 'moment';
import { apiService } from '../../services/api';

const LocationStatus = () => {
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [latestReadings, setLatestReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch locations and latest water quality readings in parallel
      const [locationsResponse, readingsResponse] = await Promise.all([
        apiService.locations.getAll(),
        apiService.waterQuality.getLatest()
      ]);

      setLocations(locationsResponse.data || []);
      setLatestReadings(readingsResponse.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching location status data:', err);
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWQIColor = (wqi) => {
    if (wqi >= 80) return 'text-green-600';
    if (wqi >= 60) return 'text-blue-600';
    if (wqi >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSensorHealthStatus = (lastUpdate) => {
    const now = moment();
    const updateTime = moment(lastUpdate);
    const minutesDiff = now.diff(updateTime, 'minutes');

    if (minutesDiff <= 15) {
      return { status: 'online', color: 'text-green-600', icon: Wifi, label: 'Online' };
    } else if (minutesDiff <= 60) {
      return { status: 'warning', color: 'text-yellow-600', icon: Wifi, label: 'Delayed' };
    } else {
      return { status: 'offline', color: 'text-red-600', icon: WifiOff, label: 'Offline' };
    }
  };

  const getParameterStatus = (parameter) => {
    if (!parameter) return { icon: XCircle, color: 'text-gray-400', label: 'No Data' };
    
    switch (parameter.status?.toLowerCase()) {
      case 'excellent':
        return { icon: CheckCircle, color: 'text-green-600', label: 'Excellent' };
      case 'good':
        return { icon: CheckCircle, color: 'text-blue-600', label: 'Good' };
      case 'fair':
        return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Fair' };
      case 'poor':
        return { icon: XCircle, color: 'text-red-600', label: 'Poor' };
      default:
        return { icon: Minus, color: 'text-gray-400', label: 'Unknown' };
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const getDataFreshness = (timestamp) => {
    const minutesDiff = moment().diff(moment(timestamp), 'minutes');
    if (minutesDiff <= 15) return { label: 'Fresh', color: 'text-green-600' };
    if (minutesDiff <= 60) return { label: 'Recent', color: 'text-yellow-600' };
    return { label: 'Stale', color: 'text-red-600' };
  };

  const toggleExpanded = (locationId) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">Loading location status...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No monitoring locations available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {locations.map((location) => {
        const reading = latestReadings.find(r => 
          r.locationId === location._id || r.locationId?._id === location._id
        );
        const sensorHealth = reading ? getSensorHealthStatus(reading.timestamp) : null;
        const dataFreshness = reading ? getDataFreshness(reading.timestamp) : null;
        const isExpanded = expandedLocation === location._id;

        return (
          <div key={location._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Main Location Card */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                {/* Location Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {location.city}, {location.state} • Km {location.riverKm}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Controls */}
                <div className="flex items-center space-x-3">
                  {/* Sensor Health */}
                  {sensorHealth && (
                    <div className="flex items-center space-x-1">
                      <sensorHealth.icon className={`w-4 h-4 ${sensorHealth.color}`} />
                      <span className={`text-xs font-medium ${sensorHealth.color}`}>
                        {sensorHealth.label}
                      </span>
                    </div>
                  )}

                  {/* WQI and Status */}
                  {reading ? (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-lg ${getWQIColor(reading.waterQualityIndex)}`}>
                          {reading.waterQualityIndex}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(reading.overallStatus)}`}
                        >
                          {reading.overallStatus?.toUpperCase()}
                        </Badge>
                      </div>
                      {dataFreshness && (
                        <p className={`text-xs ${dataFreshness.color}`}>
                          {dataFreshness.label} • {formatTimeAgo(reading.timestamp)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No Data
                    </Badge>
                  )}

                  {/* Expand Button */}
                  {reading && (
                    <button
                      onClick={() => toggleExpanded(location._id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && reading && (
              <div className="border-t border-gray-100 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Key Parameters */}
                  {reading.parameters && Object.entries(reading.parameters).map(([key, param]) => {
                    const paramStatus = getParameterStatus(param);
                    const parameterNames = {
                      dissolvedOxygen: 'Dissolved Oxygen',
                      biochemicalOxygenDemand: 'BOD',
                      ph: 'pH Level',
                      turbidity: 'Turbidity',
                      nitrate: 'Nitrate',
                      fecalColiform: 'Fecal Coliform'
                    };

                    return (
                      <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {parameterNames[key] || key}
                          </span>
                          <paramStatus.icon className={`w-4 h-4 ${paramStatus.color}`} />
                        </div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-semibold text-gray-900">
                            {param?.value || 'N/A'}
                          </span>
                          {param?.unit && (
                            <span className="text-sm text-gray-500">{param.unit}</span>
                          )}
                        </div>
                        <span className={`text-xs ${paramStatus.color}`}>
                          {paramStatus.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Last Update: {moment(reading.timestamp).format('MMM DD, HH:mm')}</span>
                      </div>
                      {reading.trend && (
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(reading.trend)}
                          <span className="capitalize">{reading.trend}</span>
                        </div>
                      )}
                    </div>
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">
            Last updated: {moment(lastRefresh).format('MMM DD, YYYY HH:mm')}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Locations</p>
              <p className="text-2xl font-bold text-blue-900">{locations.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {latestReadings.filter(r => getSensorHealthStatus(r.timestamp).status === 'online').length}
          </div>
          <div className="text-sm text-gray-600">Online</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {latestReadings.filter(r => getSensorHealthStatus(r.timestamp).status === 'warning').length}
          </div>
          <div className="text-sm text-gray-600">Warning</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {latestReadings.filter(r => getSensorHealthStatus(r.timestamp).status === 'offline').length}
          </div>
          <div className="text-sm text-gray-600">Offline</div>
        </div>
      </div>
    </div>
  );
};

export default LocationStatus;