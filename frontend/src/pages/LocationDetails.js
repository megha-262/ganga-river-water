import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import WaterQualityChart from '../components/WaterQualityChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const LocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState('waterQualityIndex');

  useEffect(() => {
    fetchLocationData();
  }, [id]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch location details
      const locationResponse = await apiService.locations.getAll();
      const foundLocation = locationResponse.data.find(loc => loc._id === id);
      
      if (!foundLocation) {
        setError('Location not found');
        return;
      }
      
      setLocation(foundLocation);

      // Fetch water quality data for this location
      const waterQualityResponse = await apiService.waterQuality.getByLocation(id);
      setWaterQualityData(waterQualityResponse.data || []);

      // Fetch forecasts for this location
      const forecastResponse = await apiService.forecasts.getLatest(id);
      setForecasts(forecastResponse.data ? [forecastResponse.data] : []);

    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatParameter = (param) => {
    if (!param) return 'N/A';
    return `${param.value} ${param.unit}`;
  };

  const getParameterTitle = (param) => {
    const titles = {
      waterQualityIndex: 'Water Quality Index',
      dissolvedOxygen: 'Dissolved Oxygen',
      biochemicalOxygenDemand: 'Biochemical Oxygen Demand',
      ph: 'pH Level',
      turbidity: 'Turbidity',
      nitrate: 'Nitrate',
      fecalColiform: 'Fecal Coliform',
    };
    return titles[param] || param;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const latestReading = waterQualityData[0];
  const parameters = latestReading?.parameters || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {location?.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{location?.city}, {location?.state}</span>
                  <span className="mx-2">•</span>
                  <span>River Km: {location?.riverKm}</span>
                </div>
                {latestReading && (
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(latestReading.overallStatus)}`}>
                      {latestReading.overallStatus}
                    </span>
                    <span className="text-sm text-gray-500">
                      WQI: {latestReading.waterQualityIndex}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(latestReading.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Parameters */}
        {latestReading && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Water Quality Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Dissolved Oxygen</h3>
                <p className="text-2xl font-bold text-blue-600">{formatParameter(parameters.dissolvedOxygen)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">BOD</h3>
                <p className="text-2xl font-bold text-red-600">{formatParameter(parameters.biochemicalOxygenDemand)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">pH Level</h3>
                <p className="text-2xl font-bold text-purple-600">{formatParameter(parameters.ph)}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Turbidity</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatParameter(parameters.turbidity)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Historical Trends</h2>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="waterQualityIndex">Water Quality Index</option>
              <option value="dissolvedOxygen">Dissolved Oxygen</option>
              <option value="biochemicalOxygenDemand">BOD</option>
              <option value="ph">pH Level</option>
              <option value="turbidity">Turbidity</option>
              <option value="nitrate">Nitrate</option>
              <option value="fecalColiform">Fecal Coliform</option>
            </select>
          </div>
          
          <WaterQualityChart
            data={waterQualityData}
            parameter={selectedParameter}
            title={getParameterTitle(selectedParameter)}
          />
        </div>

        {/* Forecasts */}
        {forecasts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              3-Day Forecast
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecasts.slice(0, 3).map((forecast, index) => (
                  <div key={forecast._id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {new Date(forecast.forecastDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(forecast.predictedStatus)}`}>
                        {forecast.predictedStatus}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      WQI: {forecast.predictedWQI}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {Math.round(forecast.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Data Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Readings
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WQI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BOD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      pH
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {waterQualityData.slice(0, 10).map((reading, index) => (
                    <tr key={reading._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reading.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reading.waterQualityIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(reading.overallStatus)}`}>
                          {reading.overallStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatParameter(reading.parameters?.dissolvedOxygen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatParameter(reading.parameters?.biochemicalOxygenDemand)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatParameter(reading.parameters?.ph)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;