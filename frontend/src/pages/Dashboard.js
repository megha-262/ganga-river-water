import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Eye
} from 'lucide-react';
import WaterQualityMap from '../components/WaterQualityMap';
import WaterQualityChart from '../components/WaterQualityChart';
import AlertsOverview from '../components/AlertsOverview';
import LocationCard from '../components/LocationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService, mockData, isApiAvailable } from '../services/api';
import moment from 'moment';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    locations: [],
    latestReadings: [],
    alerts: [],
    summary: null,
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usesMockData, setUsesMockData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API is available
      const apiAvailable = await isApiAvailable();
      
      if (apiAvailable) {
        // Fetch real data from API
        const [locations, latestReadings, alerts, summary] = await Promise.all([
          apiService.locations.getAll(),
          apiService.waterQuality.getLatest(),
          apiService.alerts.getAll({ type: 'current' }),
          apiService.alerts.getSummary(),
        ]);

        setData({
          locations: locations.data || [],
          latestReadings: latestReadings.data || [],
          alerts: alerts.data || [],
          summary: summary.data || null,
        });
        setUsesMockData(false);
      } else {
        // Use mock data
        setData({
          locations: mockData.locations,
          latestReadings: mockData.waterQuality,
          alerts: mockData.alerts,
          summary: {
            total: 1,
            high: 0,
            medium: 1,
            low: 0,
            current: 1,
            forecast: 0,
            locations: 1,
          },
        });
        setUsesMockData(true);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      
      // Fallback to mock data on error
      setData({
        locations: mockData.locations,
        latestReadings: mockData.waterQuality,
        alerts: mockData.alerts,
        summary: {
          total: 1,
          high: 0,
          medium: 1,
          low: 0,
          current: 1,
          forecast: 0,
          locations: 1,
        },
      });
      setUsesMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = () => {
    if (!data.latestReadings.length) return 'unknown';
    
    const statuses = data.latestReadings.map(reading => reading.overallStatus);
    
    if (statuses.includes('poor')) return 'poor';
    if (statuses.includes('fair')) return 'fair';
    if (statuses.includes('good')) return 'good';
    return 'excellent';
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

  const overallStatus = getOverallStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ganga River Water Quality Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time monitoring and forecasting for the Ganga River ecosystem
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            {usesMockData && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Demo Mode
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {moment(lastUpdated).format('MMMM Do YYYY, h:mm:ss a')}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && !usesMockData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">
              Error loading data: {error}. Showing demo data instead.
            </p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Status</p>
              <p className={`text-2xl font-bold capitalize ${getStatusColor(overallStatus).split(' ')[0]}`}>
                {overallStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monitoring Locations</p>
              <p className="text-2xl font-bold text-gray-900">{data.locations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.summary?.total || data.alerts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">{data.latestReadings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Monitoring Locations</h2>
              <Link
                to="/locations"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View All</span>
              </Link>
            </div>
            <WaterQualityMap 
              locations={data.locations} 
              waterQualityData={data.latestReadings}
            />
          </div>
        </div>

        {/* Alerts Section */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
              <Link
                to="/alerts"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>View All</span>
              </Link>
            </div>
            <AlertsOverview alerts={data.alerts.slice(0, 5)} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Water Quality Trends</h2>
          <WaterQualityChart data={data.latestReadings} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Readings</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {data.latestReadings.map((reading) => (
              <LocationCard key={reading._id} reading={reading} />
            ))}
            {data.latestReadings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Droplets className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent readings available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">3-Day Forecast</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Next 3 days</span>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Forecast data will be displayed here</p>
          <p className="text-sm mt-2">Coming soon with advanced prediction models</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;