import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Download,
  Zap,
  Target,
  Waves,
  MessageCircle
} from 'lucide-react';
import { LoadingSpinner } from '../components/common';
import { apiService } from '../services/api';
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Forecasting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDays, setSelectedDays] = useState(3); // Default to 3 days
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

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
      
      // Handle both single forecast objects and arrays
      const forecastsData = forecastsResponse?.data;
      if (Array.isArray(forecastsData)) {
        setForecasts(forecastsData);
      } else if (forecastsData && typeof forecastsData === 'object') {
        // Single forecast object - wrap it in an array
        setForecasts([forecastsData]);
      } else {
        console.warn('No valid forecasts data received:', forecastsData);
        setForecasts([]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching forecasting data:', err);
      setError('Failed to load forecasting data. Please try again.');
      setForecasts([]); // Ensure forecasts is reset to empty array on error
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

  // Prepare chart data for WQI trends
  const prepareWQIChartData = (forecasts) => {
    if (!Array.isArray(forecasts) || forecasts.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const datasets = forecasts.map((forecast, index) => {
      const data = forecast.predictions?.slice(0, selectedDays).map(p => p.predictedWQI) || [];
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ];
      
      return {
        label: forecast.locationId?.name || `Location ${index + 1}`,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      };
    });

    // Generate dynamic labels based on selected days
    const labels = Array.from({ length: selectedDays }, (_, i) => `Day ${i + 1}`);

    return {
      labels: labels,
      datasets: datasets
    };
  };

  // Prepare parameter comparison chart data
  const prepareParameterChartData = (forecasts, parameter) => {
    if (!Array.isArray(forecasts) || forecasts.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const datasets = forecasts.map((forecast, index) => {
      const data = forecast.predictions?.slice(0, selectedDays).map(p => p.parameters?.[parameter]?.predicted || 0) || [];
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ];
      
      return {
        label: forecast.locationId?.name || `Location ${index + 1}`,
        data: data,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      };
    });

    // Generate dynamic labels based on selected days
    const labels = Array.from({ length: selectedDays }, (_, i) => `Day ${i + 1}`);

    return {
      labels: labels,
      datasets: datasets
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
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
                  Predictive analysis for the next {selectedDays} {selectedDays === 1 ? 'day' : 'days'}
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
                onClick={() => navigate('/chatbot')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask About Forecasts
              </button>
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
                Forecast Days
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

      {/* Forecasts Visualization */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {forecasts.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-blue-200 p-12 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-1/2 -right-8 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute -bottom-6 left-1/3 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Forecasts Available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Generate AI-powered forecasts to see stunning water quality predictions and trends for your selected locations.
              </p>
              <button
                onClick={() => generateNewForecast()}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-2" />
                Generate AI Forecasts
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* WQI Trend Chart */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Water Quality Index Trends</h3>
                      <p className="text-blue-100">3-Day forecast comparison across locations</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <Line data={prepareWQIChartData(forecasts)} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Parameter Comparison Chart */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Dissolved Oxygen Forecast</h3>
                      <p className="text-emerald-100">Critical parameter analysis</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <Bar data={prepareParameterChartData(forecasts, 'dissolvedOxygen')} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Forecast Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.isArray(forecasts) && forecasts.map((forecast, index) => (
                <div key={forecast._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
                  {/* Animated Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full transform -translate-x-6 translate-y-6"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <Waves className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {forecast.locationId?.name || 'Unknown Location'}
                          </h3>
                          <p className="text-purple-100">
                            {forecast.locationId?.city || 'Unknown City'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-100 text-sm">Generated</p>
                        <p className="text-white font-semibold">
                          {moment(forecast.generatedAt).format('MMM DD')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Forecast Data */}
                  <div className="p-6">
                    <div className={`grid gap-4 mb-6 ${selectedDays === 1 ? 'grid-cols-1' : selectedDays === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                      {forecast.predictions && forecast.predictions.slice(0, selectedDays).map((prediction, dayIndex) => (
                        <div key={dayIndex} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{dayIndex + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {moment(forecast.generatedAt).add(dayIndex + 1, 'days').format('MMM DD')}
                              </span>
                            </div>
                          </div>
                          
                          {prediction.predictedWQI && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">WQI Score</span>
                                <span className="text-lg font-bold text-gray-900">{prediction.predictedWQI}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-1000 ${
                                    prediction.predictedWQI >= 80 ? 'bg-green-500' :
                                    prediction.predictedWQI >= 60 ? 'bg-yellow-500' :
                                    prediction.predictedWQI >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${prediction.predictedWQI}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            {Object.entries(prediction.parameters || {}).slice(0, 3).map(([param, value]) => {
                              const status = getParameterStatus(value.predicted, param);
                              return (
                                <div key={param} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 capitalize truncate">
                                    {param.replace(/([A-Z])/g, ' $1').trim().substring(0, 12)}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <span className="font-semibold text-gray-900">
                                      {value.predicted?.toFixed(1)}
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${
                                      status === 'excellent' ? 'bg-green-500' :
                                      status === 'good' ? 'bg-blue-500' :
                                      status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => generateNewForecast(forecast.locationId?._id)}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                        Update Forecast
                      </button>
                      <button 
                        onClick={() => navigate(`/location/${forecast.locationId?._id}`)}
                        className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2 inline" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;