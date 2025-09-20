import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Droplets,
  BarChart3,
  Thermometer,
  Eye,
  Waves,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WaterQualityChart } from '../components/charts';
import { LoadingSpinner } from '../components/common';
import { apiService } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [waterQualityData, setWaterQualityData] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState('waterQualityIndex');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

      // Fetch combined data (10 days historical + 3 days forecast)
      try {
        const combinedResponse = await apiService.waterQuality.getCombined(id);
        setWaterQualityData(combinedResponse.data.historical || []);
        
        // Set forecasts from combined data if available
        if (combinedResponse.data.forecast && combinedResponse.data.forecast.length > 0) {
          setForecasts([{
            locationId: foundLocation,
            predictions: combinedResponse.data.forecast,
            generatedAt: new Date().toISOString()
          }]);
        }
      } catch (combinedError) {
        console.warn('Combined endpoint failed, falling back to separate calls:', combinedError);
        
        // Fallback to separate API calls with explicit 10 days parameter
        const waterQualityResponse = await apiService.waterQuality.getByLocation(id, { days: 10 });
        setWaterQualityData(waterQualityResponse.data || []);

        // Fetch forecasts for this location
        const forecastResponse = await apiService.forecasts.getLatest(id);
        setForecasts(forecastResponse.data ? [forecastResponse.data] : []);
      }

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

  // Prepare forecast trend chart data
  const prepareForecastTrendData = () => {
    if (!forecasts.length || !forecasts[0].predictions) return null;

    const predictions = forecasts[0].predictions.slice(0, 3);
    const labels = predictions.map(p => {
      const date = new Date(p.timestamp || p.date);
      return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Predicted WQI',
          data: predictions.map(p => p.predictedWQI),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Dissolved Oxygen',
          data: predictions.map(p => p.parameters?.dissolvedOxygen?.value || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Prepare parameter comparison chart using actual water quality data
  const prepareParameterComparisonData = () => {
    if (!waterQualityData.length) return null;

    // Get the last 7 days of data for comparison
    const recentData = waterQualityData.slice(0, 7);
    const labels = recentData.map(d => {
      const date = new Date(d.timestamp || d.date);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }).reverse();

    return {
      labels,
      datasets: [
        {
          label: 'Dissolved Oxygen (mg/L)',
          data: recentData.map(d => d.dissolvedOxygen || 0).reverse(),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'pH Level',
          data: recentData.map(d => d.ph || 0).reverse(),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'BOD (mg/L)',
          data: recentData.map(d => d.biochemicalOxygenDemand || 0).reverse(),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
        },
        {
          label: 'Turbidity (NTU)',
          data: recentData.map(d => d.turbidity || 0).reverse(),
          backgroundColor: 'rgba(139, 69, 19, 0.8)',
          borderColor: 'rgba(139, 69, 19, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Prepare WQI distribution chart
  const prepareWQIDistributionData = () => {
    if (!waterQualityData.length) return null;

    const recentData = waterQualityData.slice(0, 30);
    const excellent = recentData.filter(d => d.waterQualityIndex >= 90).length;
    const good = recentData.filter(d => d.waterQualityIndex >= 70 && d.waterQualityIndex < 90).length;
    const moderate = recentData.filter(d => d.waterQualityIndex >= 50 && d.waterQualityIndex < 70).length;
    const poor = recentData.filter(d => d.waterQualityIndex < 50).length;

    return {
      labels: ['Excellent', 'Good', 'Moderate', 'Poor'],
      datasets: [{
        data: [excellent, good, moderate, poor],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  // Get trend indicator
  const getTrendIndicator = (current, previous) => {
    if (!previous) return { icon: Minus, color: 'text-gray-400', text: 'No data' };
    const diff = current - previous;
    if (diff > 0) return { icon: ArrowUp, color: 'text-green-500', text: `+${diff.toFixed(1)}` };
    if (diff < 0) return { icon: ArrowDown, color: 'text-red-500', text: `${diff.toFixed(1)}` };
    return { icon: Minus, color: 'text-gray-400', text: 'No change' };
  };

  // Pagination helper functions
  const totalPages = Math.ceil(waterQualityData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = waterQualityData.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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

        {/* Enhanced Current Water Quality Parameters */}
        {latestReading && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Current Water Quality Parameters</h2>
                  <p className="text-emerald-100">Real-time monitoring data and analysis</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(parameters).map(([key, param]) => {
                const parameterIcons = {
                  dissolvedOxygen: Droplets,
                  ph: Target,
                  biochemicalOxygenDemand: Activity,
                  turbidity: Eye,
                  nitrate: Waves,
                  fecalColiform: AlertTriangle,
                  temperature: Thermometer
                };
                
                const IconComponent = parameterIcons[key] || BarChart3;
                const paramStatus = param?.status || 'good';
                
                return (
                  <div key={key} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
                    <div className={`p-4 ${
                      paramStatus === 'excellent' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      paramStatus === 'good' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      paramStatus === 'fair' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}>
                      <div className="flex items-center justify-between text-white">
                        <IconComponent className="w-6 h-6" />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20`}>
                          {paramStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-600 capitalize mb-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {formatParameter(param)}
                        </div>
                        {param?.unit && (
                          <div className="text-sm text-gray-500">{param.unit}</div>
                        )}
                      </div>
                      
                      {/* Parameter Range Indicator */}
                      {param?.value && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Poor</span>
                            <span>Excellent</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                paramStatus === 'excellent' ? 'bg-green-500' :
                                paramStatus === 'good' ? 'bg-blue-500' :
                                paramStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, Math.max(10, 
                                  paramStatus === 'excellent' ? 90 :
                                  paramStatus === 'good' ? 70 :
                                  paramStatus === 'fair' ? 50 : 30
                                ))}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Trend Indicator */}
                      {waterQualityData.length > 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">24h Trend</span>
                            {(() => {
                              const current = param?.value;
                              const previous = waterQualityData[1]?.parameters?.[key]?.value;
                              const trend = getTrendIndicator(current, previous);
                              const TrendIcon = trend.icon;
                              return (
                                <div className="flex items-center space-x-1">
                                  <TrendIcon className={`w-3 h-3 ${trend.color}`} />
                                  <span className={`text-xs font-medium ${trend.color}`}>
                                    {trend.text}
                                  </span>
                                </div>
                              );
                            })()} 
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-indigo-100">Comprehensive data analysis and insights</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Historical Trends Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Historical Trends</h3>
                </div>
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
              <div className="h-100">
                <WaterQualityChart
                  data={waterQualityData}
                  parameter={selectedParameter}
                  title={getParameterTitle(selectedParameter)}
                />
              </div>
            </div>

            {/* Parameter Correlation Matrix */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Parameter Correlation</h3>
              </div>
              <div className="h-80">
                {prepareParameterComparisonData() && (
                  <Bar 
                    data={prepareParameterComparisonData()} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: true,
                          position: 'top'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Parameter Values'
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Additional Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WQI Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">WQI Distribution</h3>
              </div>
              <div className="h-48">
                {prepareWQIDistributionData() && (
                  <Doughnut 
                    data={prepareWQIDistributionData()} 
                    options={doughnutOptions} 
                  />
                )}
              </div>
            </div>

            {/* Data Quality Metrics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Data Quality</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Completeness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">95%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sensor Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">98%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Update Frequency</span>
                  <span className="text-sm font-medium text-green-600">Real-time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Calibration</span>
                  <span className="text-sm font-medium text-gray-900">2 days ago</span>
                </div>
              </div>
            </div>

            {/* Environmental Factors */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Environmental</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <span className="text-sm font-medium text-gray-900">24°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weather</span>
                  <span className="text-sm font-medium text-gray-900">Partly Cloudy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rainfall (24h)</span>
                  <span className="text-sm font-medium text-blue-600">2.5mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flow Rate</span>
                  <span className="text-sm font-medium text-gray-900">1.2 m³/s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pollution Index</span>
                  <span className="text-sm font-medium text-yellow-600">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Forecasts Section */}
        {forecasts.length > 0 && forecasts[0].predictions && (
          <div className="mb-8 space-y-8">
            {/* Forecast Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">3-Day Water Quality Forecast</h2>
                    <p className="text-blue-100">AI-powered predictions and trend analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Model Accuracy</div>
                  <div className="text-2xl font-bold">{forecasts[0].modelInfo?.accuracy || 75}%</div>
                </div>
              </div>
            </div>

            {/* Forecast Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* WQI Trend Chart */}
              {prepareForecastTrendData() && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-white" />
                      <h3 className="text-lg font-semibold text-white">WQI Trend Forecast</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-64">
                      <Line data={prepareForecastTrendData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}

              {/* Parameter Comparison Chart */}
              {prepareParameterComparisonData() && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-6 h-6 text-white" />
                      <h3 className="text-lg font-semibold text-white">Parameter Comparison</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-64">
                      <Bar data={prepareParameterComparisonData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Forecast Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {forecasts[0].predictions.slice(0, 3).map((prediction, index) => {
                const forecastDate = new Date(prediction.timestamp || prediction.date);
                const wqi = prediction.predictedWQI || 
                  Math.round((prediction.parameters?.dissolvedOxygen?.value || 0) * 10 + 
                             (prediction.parameters?.ph?.value || 0) * 5);
                
                const previousWqi = index > 0 ? forecasts[0].predictions[index - 1].predictedWQI : null;
                const trend = getTrendIndicator(wqi, previousWqi);
                const TrendIcon = trend.icon;
                
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-300">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                          <Waves className="w-6 h-6" />
                          <div>
                            <div className="font-semibold">
                              {forecastDate.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-purple-100">Day {index + 1}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{wqi}</div>
                          <div className="text-xs text-purple-100">WQI Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      {/* WQI Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            prediction.predictedStatus === 'excellent' ? 'bg-green-100 text-green-800' :
                            prediction.predictedStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                            prediction.predictedStatus === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {prediction.predictedStatus || 'good'}
                          </span>
                          <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                        </div>
                      </div>

                      {/* Parameters Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {prediction.parameters?.dissolvedOxygen && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Droplets className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">DO</span>
                            </div>
                            <div className="text-lg font-bold text-green-900">
                              {prediction.parameters.dissolvedOxygen.value?.toFixed(1)}
                            </div>
                            <div className="text-xs text-green-600">mg/L</div>
                          </div>
                        )}
                        
                        {prediction.parameters?.ph && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-700">pH</span>
                            </div>
                            <div className="text-lg font-bold text-blue-900">
                              {prediction.parameters.ph.value?.toFixed(1)}
                            </div>
                            <div className="text-xs text-blue-600">Level</div>
                          </div>
                        )}
                        
                        {prediction.parameters?.biochemicalOxygenDemand && (
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Activity className="w-4 h-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-700">BOD</span>
                            </div>
                            <div className="text-lg font-bold text-yellow-900">
                              {prediction.parameters.biochemicalOxygenDemand.value?.toFixed(1)}
                            </div>
                            <div className="text-xs text-yellow-600">mg/L</div>
                          </div>
                        )}

                        {prediction.expectedWeather?.temperature && (
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Thermometer className="w-4 h-4 text-red-600" />
                              <span className="text-xs font-medium text-red-700">Temp</span>
                            </div>
                            <div className="text-lg font-bold text-red-900">
                              {prediction.expectedWeather.temperature}°
                            </div>
                            <div className="text-xs text-red-600">Celsius</div>
                          </div>
                        )}
                      </div>

                      {/* Confidence Indicator */}
                      {prediction.parameters?.dissolvedOxygen?.confidence && (
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Prediction Confidence</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.round(prediction.parameters.dissolvedOxygen.confidence * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {Math.round(prediction.parameters.dissolvedOxygen.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* WQI Distribution Chart */}
              {prepareWQIDistributionData() && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-6 h-6 text-white" />
                      <h3 className="text-lg font-semibold text-white">WQI Distribution (Last 30 Days)</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-64">
                      <Doughnut data={prepareWQIDistributionData()} options={doughnutOptions} />
                    </div>
                  </div>
                </div>
              )}

              {/* Forecast Alerts */}
              {forecasts[0].forecastAlerts && forecasts[0].forecastAlerts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-white" />
                      <h3 className="text-lg font-semibold text-white">Forecast Alerts</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {forecasts[0].forecastAlerts.map((alert, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}>
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                              alert.severity === 'high' ? 'text-red-500' :
                              alert.severity === 'medium' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium text-gray-900">{alert.parameter}</div>
                              <div className="text-sm text-gray-600">{alert.message}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Day {alert.dayOffset} • {alert.severity} priority
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Recent Data Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-600 to-gray-600 px-6 py-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recent Readings</h2>
                <p className="text-slate-200">Water quality measurements with pagination</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Date & Time</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>WQI</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4" />
                      <span>DO</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>BOD</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>pH</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Trend</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentData.map((reading, index) => {
                  const globalIndex = startIndex + index;
                  const previousReading = waterQualityData[globalIndex + 1];
                  const wqiTrend = previousReading ? 
                    getTrendIndicator(reading.waterQualityIndex, previousReading.waterQualityIndex) : 
                    { icon: Minus, color: 'text-gray-400', text: 'N/A' };
                  const TrendIcon = wqiTrend.icon;
                  
                  return (
                    <tr key={reading._id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(reading.timestamp).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(reading.timestamp).toLocaleTimeString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            reading.waterQualityIndex >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                            reading.waterQualityIndex >= 60 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            reading.waterQualityIndex >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {reading.waterQualityIndex}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(reading.overallStatus)}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            reading.overallStatus === 'excellent' ? 'bg-green-500' :
                            reading.overallStatus === 'good' ? 'bg-blue-500' :
                            reading.overallStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          {reading.overallStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatParameter(reading.parameters?.dissolvedOxygen)}
                        </div>
                        <div className="text-xs text-gray-500">mg/L</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatParameter(reading.parameters?.biochemicalOxygenDemand)}
                        </div>
                        <div className="text-xs text-gray-500">mg/L</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatParameter(reading.parameters?.ph)}
                        </div>
                        <div className="text-xs text-gray-500">units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <TrendIcon className={`w-4 h-4 ${wqiTrend.color}`} />
                          <span className={`text-xs font-medium ${wqiTrend.color}`}>
                            {wqiTrend.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, waterQualityData.length)} of {waterQualityData.length} readings
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">Page</span>
                  <span className="text-sm font-medium text-gray-900">{currentPage}</span>
                  <span className="text-sm text-gray-600">of</span>
                  <span className="text-sm font-medium text-gray-900">{totalPages}</span>
                </div>
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;