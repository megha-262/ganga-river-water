import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Eye,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Heart,
  Leaf,
  Fish,
  Waves,
  Users,
  Shield
} from 'lucide-react';

// New UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { Badge } from '../components/ui';
import { Alert, AlertTitle, AlertDescription } from '../components/ui';
import { Skeleton } from '../components/ui';

// Existing Components (updated imports)
import { WaterQualityMap, WaterQualityChart, CombinedDataChart } from '../components/charts';
import { AlertsOverview, LocationCard, LocationStatus, LoadingSpinner, SkeletonDashboard } from '../components/common';
import AlertsSummaryWidget from '../components/AlertsSummaryWidget';

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
  const [activeTab, setActiveTab] = useState('overview');

  // Water Quality Thresholds
  const waterQualityThresholds = {
    excellent: { min: 9, max: 10, color: 'green', variant: 'excellent' },
    good: { min: 7, max: 8.9, color: 'blue', variant: 'good' },
    fair: { min: 5, max: 6.9, color: 'yellow', variant: 'fair' },
    poor: { min: 3, max: 4.9, color: 'orange', variant: 'poor' },
    critical: { min: 0, max: 2.9, color: 'red', variant: 'critical' }
  };

  const getWaterQualityStatus = (wqi) => {
    if (wqi >= 9) return waterQualityThresholds.excellent;
    if (wqi >= 7) return waterQualityThresholds.good;
    if (wqi >= 5) return waterQualityThresholds.fair;
    if (wqi >= 3) return waterQualityThresholds.poor;
    return waterQualityThresholds.critical;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data first
      try {
        console.log('Attempting to fetch real API data...');
        const [locations, latestReadings, alerts, summary] = await Promise.all([
          apiService.locations.getAll(),
          apiService.waterQuality.getLatest(),
          apiService.alerts.getAll({ type: 'current' }),
          apiService.alerts.getSummary(),
        ]);

        console.log('API data fetched successfully:', {
          locations: locations?.data?.length || 0,
          latestReadings: latestReadings?.data?.length || 0,
          alerts: alerts?.data?.length || 0,
          summary: summary?.data
        });

        setData({
          locations: locations.data || [],
          waterQuality: latestReadings.data || [],
          alerts: alerts.data || [],
          summary: summary.data || null,
        });
        setUsesMockData(false);
        setLastUpdated(new Date());
      } catch (apiError) {
        console.warn('API fetch failed, falling back to mock data:', apiError.message);
        
        // Only use mock data if API is truly unavailable
        const apiAvailable = await isApiAvailable();
        if (!apiAvailable) {
          console.log('API confirmed unavailable, using mock data');
          setData(mockData);
          setUsesMockData(true);
          setLastUpdated(new Date());
        } else {
          // API is available but specific endpoints failed
          throw apiError;
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      // Fallback to mock data only if there's a real error
        setData({
          locations: mockData.locations || [],
          waterQuality: mockData.waterQuality || [],
          alerts: mockData.alerts || [],
          summary: mockData.summary || null
        });
        setUsesMockData(true);
        setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!data || !data.locations || !data.waterQuality || !data.alerts) return null;
    
    const totalLocations = data.locations.length;
    const avgWQI = data.waterQuality.length > 0 
      ? data.waterQuality.reduce((sum, reading) => sum + (reading.waterQualityIndex || reading.wqi || 0), 0) / data.waterQuality.length 
      : 0;
    const criticalAlerts = data.alerts.filter(alert => alert.level >= 4 || alert.severity === 'critical').length;
    const healthyLocations = data.waterQuality.filter(reading => (reading.waterQualityIndex || reading.wqi || 0) >= 70).length;

    return {
      totalLocations,
      avgWQI: avgWQI.toFixed(1),
      criticalAlerts,
      healthyLocations,
      healthPercentage: totalLocations > 0 ? ((healthyLocations / totalLocations) * 100).toFixed(0) : '0'
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error && !usesMockData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {error}. Please try refreshing the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30"></div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="wave-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)" className="animate-pulse" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#wave-pattern)" />
            <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.1)" className="animate-float" />
          </svg>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-6 left-6 w-12 h-12 bg-cyan-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-indigo-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>

        {/* Content */}
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Waves className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Ganga River
                    <span className="block bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                      Monitoring Dashboard
                    </span>
                  </h1>
                </div>
              </div>
              
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl leading-relaxed">
                Real-time water quality monitoring across{' '}
                <span className="font-semibold text-white">{data.locations?.length || 0} locations</span>{' '}
                along the sacred Ganga River
              </p>

              {lastUpdated && (
                <div className="flex items-center gap-2 text-blue-200">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Last updated: {moment(lastUpdated).format('MMM DD, YYYY HH:mm')}
                  </span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Activity className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-white font-medium">Live Monitoring</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Shield className="h-4 w-4 text-blue-300" />
                  <span className="text-sm text-white font-medium">24/7 Protection</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  <Heart className="h-4 w-4 text-red-300" />
                  <span className="text-sm text-white font-medium">Sacred Waters</span>
                </div>
              </div>
            </div>

            {/* Right Content - Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
              {usesMockData && (!data.locations?.length || !data.waterQuality?.length) && (
                <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-300/30 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    <span className="text-sm text-amber-100 font-medium">Demo Mode</span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleRefresh} 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Data
              </Button>
              
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 transition-all duration-300 hover:scale-105 shadow-lg"
                size="lg"
              >
                <Link to="/alerts">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  View Alerts
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="rgba(255,255,255,0.1)"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="rgba(255,255,255,0.1)"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="rgba(255,255,255,0.1)"></path>
          </svg>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Locations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.totalLocations}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Monitoring stations</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Average WQI</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.avgWQI}</p>
                  <Badge variant={getWaterQualityStatus(summaryStats.avgWQI).variant} size="sm" className="hidden sm:inline-flex">
                    {getWaterQualityStatus(summaryStats.avgWQI).color.toUpperCase()}
                  </Badge>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Droplets className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Critical Alerts</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.criticalAlerts}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Require attention</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Healthy Locations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{summaryStats.healthyLocations}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{summaryStats.healthPercentage}% of total</p>
                </div>
                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Water Quality Map
            </CardTitle>
            <CardDescription>
              Interactive map showing real-time water quality across monitoring locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WaterQualityMap 
               locations={data.locations} 
               waterQualityData={data.waterQuality}
               className="h-64 sm:h-96 rounded-lg"
             />
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <AlertsSummaryWidget />
      </div>

      {/* 13-Day Combined Data Chart */}
      {data.locations && data.locations.length > 0 && (
        <CombinedDataChart 
          locationId={data.locations[0]._id} 
          locationName={data.locations[0].name}
        />
      )}

      {/* Water Quality Trends - Centered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <BarChart3 className="h-5 w-5" />
            Water Quality Trends
          </CardTitle>
          <CardDescription className="text-center">
            Historical water quality index trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WaterQualityChart data={data.waterQuality} />
        </CardContent>
      </Card>

      {/* Location Status - 2 Column Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Location Status
          </CardTitle>
          <CardDescription>
            Current status of all monitoring locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationStatus />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/alerts">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm sm:text-base">View All Alerts</span>
                <span className="text-xs text-gray-500 hidden sm:block">Manage notifications</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/forecasting">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm sm:text-base">Water Quality Forecast</span>
                <span className="text-xs text-gray-500 hidden sm:block">Predictive analysis</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2" asChild>
              <Link to="/emergency">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm sm:text-base">Emergency Response</span>
                <span className="text-xs text-gray-500 hidden sm:block">Crisis management</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;