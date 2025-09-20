import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Droplets,
  BarChart3,
  Clock,
  Eye,
  Download
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';
import moment from 'moment';

const Forecasting = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDays, setSelectedDays] = useState(3);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedLocation, selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch locations
      const locationsResponse = await apiService.getLocations();
      setLocations(locationsResponse.data || []);

      // Fetch forecasts
      const forecastsResponse = selectedLocation === 'all' 
        ? await apiService.getForecasts()
        : await apiService.getForecastsForLocation(selectedLocation);
      
      setForecasts(forecastsResponse.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching forecasting data:', err);
      setError('Failed to load forecasting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewForecast = async (locationId = null) => {
    try {
      setLoading(true);
      if (locationId) {
        await apiService.generateForecast(locationId);
      } else {
        await apiService.generateAllForecasts();
      }
      await fetchData();
    } catch (err) {
      console.error('Error generating forecast:', err);
      setError('Failed to generate new forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getParameterStatus = (value, parameter) => {
    // Extract numeric value from object if needed
    let numericValue = value;
    if (typeof value === 'object' && value !== null) {
      numericValue = value.predicted !== undefined ? value.predicted : 
                    value.value !== undefined ? value.value : 
                    parseFloat(value);
    }

    const thresholds = {
      dissolvedOxygen: { good: 6, moderate: 4 },
      biochemicalOxygenDemand: { good: 3, moderate: 6 },
      nitrate: { good: 10, moderate: 20 },
      fecalColiform: { good: 500, moderate: 5000 },
      ph: { good: [6.5, 8.5], moderate: [6.0, 9.0] },
      turbidity: { good: 5, moderate: 25 }
    };

    const threshold = thresholds[parameter];
    if (!threshold || isNaN(numericValue)) return 'unknown';

    if (parameter === 'ph') {
      if (numericValue >= threshold.good[0] && numericValue <= threshold.good[1]) return 'good';
      if (numericValue >= threshold.moderate[0] && numericValue <= threshold.moderate[1]) return 'moderate';
      return 'poor';
    } else if (parameter === 'dissolvedOxygen') {
      if (numericValue >= threshold.good) return 'good';
      if (numericValue >= threshold.moderate) return 'moderate';
      return 'poor';
    } else {
      if (numericValue <= threshold.good) return 'good';
      if (numericValue <= threshold.moderate) return 'moderate';
      return 'poor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0.05) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < -0.05) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const formatParameterName = (param) => {
    const names = {
      dissolvedOxygen: 'Dissolved Oxygen',
      biochemicalOxygenDemand: 'BOD',
      nitrate: 'Nitrate',
      fecalColiform: 'Fecal Coliform',
      ph: 'pH',
      turbidity: 'Turbidity'
    };
    return names[param] || param;
  };

  const formatParameterUnit = (param) => {
    const units = {
      dissolvedOxygen: 'mg/L',
      biochemicalOxygenDemand: 'mg/L',
      nitrate: 'mg/L',
      fecalColiform: 'CFU/100ml',
      ph: '',
      turbidity: 'NTU'
    };
    return units[param] || '';
  };

  if (loading && forecasts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Water Quality Forecasting</h1>
                <p className="text-sm text-gray-500">
                  Predictive analysis for the next {selectedDays} days
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  Updated {moment(lastUpdated).fromNow()}
                </div>
              )}
              <button
                onClick={() => generateNewForecast()}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generate New Forecast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name} - {location.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Period
              </label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Forecasts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {forecasts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Forecasts Available</h3>
            <p className="text-gray-500 mb-6">
              Generate forecasts to see water quality predictions for your selected locations.
            </p>
            <button
              onClick={() => generateNewForecast()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Forecasts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecasts.map((forecast) => (
              <div key={forecast._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Forecast Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {forecast.locationId?.name || 'Unknown Location'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {forecast.locationId?.city || 'Unknown City'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Generated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {moment(forecast.generatedAt).format('MMM DD, YYYY')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Forecast Data */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {forecast.predictions && forecast.predictions.map((prediction, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            Day {index + 1}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {moment(forecast.generatedAt).add(index + 1, 'days').format('MMM DD')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(prediction.parameters || {}).map(([param, value]) => {
                            const status = getParameterStatus(value, param);
                            return (
                              <div key={param} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(status)}
                                    <span className="text-xs text-gray-600">
                                      {formatParameterName(param)}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium text-gray-900">
                                    {typeof value === 'object' && value !== null ? 
                                      (value.predicted !== undefined ? value.predicted.toFixed(2) : 
                                       value.value !== undefined ? value.value.toFixed(2) : 
                                       JSON.stringify(value)) :
                                      typeof value === 'number' ? value.toFixed(2) : value
                                    } {formatParameterUnit(param)}
                                  </span>
                                </div>
                                {typeof value === 'object' && value !== null && (value.confidence !== undefined || value.trend !== undefined) && (
                                  <div className="flex items-center justify-between text-xs text-gray-500 ml-6">
                                    {value.confidence !== undefined && (
                                      <span>Confidence: {(value.confidence * 100).toFixed(0)}%</span>
                                    )}
                                    {value.trend !== undefined && (
                                      <div className="flex items-center space-x-1">
                                        {getTrendIcon(value.trend)}
                                        <span>Trend: {value.trend > 0 ? '+' : ''}{(value.trend * 100).toFixed(1)}%</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {prediction.wqi && (
                          <div className={`mt-3 p-2 rounded-md border ${getStatusColor(getParameterStatus(prediction.wqi, 'wqi'))}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Water Quality Index</span>
                              <span className="text-sm font-bold">{prediction.wqi.toFixed(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Generate specific forecast button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => generateNewForecast(forecast.locationId?._id)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                      Update Forecast for This Location
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;