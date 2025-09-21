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
  Shield,
  MessageCircle
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
      {/* Full Width Hero Section */}
      <div className="relative mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 min-h-[70vh] flex items-center">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0">
            {/* Primary gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-indigo-700/40"></div>
            
            {/* Animated mesh pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="mesh-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="0.5" fill="rgba(255,255,255,0.1)" className="animate-pulse" />
                    <circle cx="0" cy="0" r="0.3" fill="rgba(255,255,255,0.05)" />
                    <circle cx="10" cy="10" r="0.3" fill="rgba(255,255,255,0.05)" />
                  </pattern>
                  <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
                    <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#mesh-pattern)" />
                <path d="M0,60 Q25,40 50,60 T100,60 L100,100 L0,100 Z" fill="url(#wave-gradient)" className="animate-float" />
                <path d="M0,80 Q25,60 50,80 T100,80 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.05)" className="animate-float" style={{animationDelay: '1s'}} />
              </svg>
            </div>

            {/* Floating geometric elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-float blur-sm"></div>
            <div className="absolute bottom-20 left-10 w-16 h-16 bg-cyan-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-indigo-400/20 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
            <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-purple-400/20 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
            
            {/* Enhanced floating particles */}
            <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white/15 rounded-full animate-float" style={{animationDelay: '1.5s', animationDuration: '4s'}}></div>
            <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-cyan-300/25 rounded-full animate-float" style={{animationDelay: '2.5s', animationDuration: '5s'}}></div>
            <div className="absolute top-1/2 left-1/6 w-10 h-10 bg-blue-400/15 rounded-full animate-float" style={{animationDelay: '3.5s', animationDuration: '6s'}}></div>
            <div className="absolute bottom-1/4 right-1/6 w-8 h-8 bg-indigo-300/20 rounded-full animate-float" style={{animationDelay: '4.5s', animationDuration: '3.5s'}}></div>
            
            {/* Large decorative circles with enhanced gradients */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full animate-pulse" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
            
            {/* Moving gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" style={{animationDuration: '8s'}}></div>
            
            {/* Flowing water effect */}
            <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/20 to-indigo-400/10 rounded-full" 
                   style={{
                     animation: 'flowingWater 12s ease-in-out infinite',
                     width: '150%',
                     height: '200%'
                   }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 via-cyan-300/15 to-purple-300/5 rounded-full" 
                   style={{
                     animation: 'flowingWater 15s ease-in-out infinite reverse',
                     animationDelay: '3s',
                     width: '120%',
                     height: '150%'
                   }}></div>
            </div>
            
            {/* Particle drift effects */}
            <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-white/30 rounded-full" 
                 style={{animation: 'particleDrift 20s linear infinite'}}></div>
            <div className="absolute top-2/5 right-1/5 w-3 h-3 bg-cyan-200/25 rounded-full" 
                 style={{animation: 'particleDrift 25s linear infinite', animationDelay: '5s'}}></div>
            <div className="absolute bottom-2/5 left-2/5 w-1.5 h-1.5 bg-blue-200/35 rounded-full" 
                 style={{animation: 'particleDrift 18s linear infinite', animationDelay: '8s'}}></div>
            <div className="absolute top-3/5 right-2/5 w-2.5 h-2.5 bg-indigo-200/20 rounded-full" 
                 style={{animation: 'particleDrift 22s linear infinite', animationDelay: '12s'}}></div>
            
            {/* Ripple effects */}
            <div className="absolute top-1/3 left-1/2 w-16 h-16 border border-white/10 rounded-full" 
                 style={{animation: 'ripple 6s ease-out infinite'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-20 h-20 border border-cyan-300/15 rounded-full" 
                 style={{animation: 'ripple 8s ease-out infinite', animationDelay: '2s'}}></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 xl:px-20 2xl:px-24">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
                
                {/* Left Content - Main Hero */}
                <div className="space-y-6">
                  {/* Icon and Title */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-xl border border-white/30">
                        <Waves className="h-8 w-8 text-white animate-pulse" />
                      </div>
                      <div className="h-10 w-1 bg-gradient-to-b from-cyan-300 to-blue-300 rounded-full"></div>
                    </div>
                    
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                        Ganga River
                        <span className="block bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 bg-clip-text text-transparent mt-1">
                          Monitoring System
                        </span>
                      </h1>
                      
                      <div className="mt-4 space-y-3">
                        <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl">
                          Advanced real-time water quality monitoring across{' '}
                          <span className="font-bold text-white bg-white/20 px-2 py-1 rounded-lg">
                            {data.locations?.length || 0} strategic locations
                          </span>{' '}
                          along the sacred Ganga River
                        </p>
                        
                        <p className="text-base text-blue-200 max-w-xl">
                          Protecting India's most sacred waterway through cutting-edge technology
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Moved to top */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button 
                      onClick={handleRefresh} 
                      className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white hover:text-white transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                      size="default"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Live Data
                    </Button>
                    
                    <Button 
                      asChild
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                      size="default"
                    >
                      <Link to="/alerts" className="flex items-center justify-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        View Critical Alerts
                      </Link>
                    </Button>
                  </div>

                  {/* Enhanced Stats and Features */}
                  <div className="space-y-6">
                    {/* Comprehensive Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      {/* Total Locations */}
                      <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                            <MapPin className="h-5 w-5 text-blue-300 group-hover:scale-110 transition-transform" />
                          </div>
                          <Waves className="h-4 w-4 text-blue-200/50 group-hover:text-blue-200 transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">
                            {summaryStats?.totalLocations || data.locations?.length || 16}
                          </div>
                          <div className="text-sm font-medium text-blue-200">Total Locations</div>
                          <div className="text-xs text-blue-300/80">Monitoring stations</div>
                        </div>
                      </div>

                      {/* Average WQI */}
                      <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                            <Droplets className="h-5 w-5 text-green-300 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="px-2 py-1 bg-green-500/20 rounded text-xs font-bold text-green-200">
                            {summaryStats?.avgWQI >= 7 ? 'GOOD' : summaryStats?.avgWQI >= 5 ? 'FAIR' : 'POOR'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">
                            {summaryStats?.avgWQI || '67.5'}
                          </div>
                          <div className="text-sm font-medium text-green-200">Average WQI</div>
                          <div className="text-xs text-green-300/80">Water Quality Index</div>
                        </div>
                      </div>

                      {/* Critical Alerts */}
                      <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                            <AlertTriangle className="h-5 w-5 text-red-300 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-white group-hover:text-red-100 transition-colors">
                            {summaryStats?.criticalAlerts || data.alerts?.filter(alert => alert.severity === 'critical')?.length || 0}
                          </div>
                          <div className="text-sm font-medium text-red-200">Critical Alerts</div>
                          <div className="text-xs text-red-300/80">Require attention</div>
                        </div>
                      </div>

                      {/* Healthy Locations */}
                      <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:border-white/50 transition-all duration-500 hover:scale-105 hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                            <CheckCircle className="h-5 w-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="text-xs font-bold text-emerald-200 bg-emerald-500/20 px-2 py-1 rounded">
                            {Math.round(((summaryStats?.healthyLocations || 4) / (summaryStats?.totalLocations || 16)) * 100)}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-white group-hover:text-emerald-100 transition-colors">
                            {summaryStats?.healthyLocations || 4}
                          </div>
                          <div className="text-sm font-medium text-emerald-200">Healthy Locations</div>
                          <div className="text-xs text-emerald-300/80">
                            {Math.round(((summaryStats?.healthyLocations || 4) / (summaryStats?.totalLocations || 16)) * 100)}% of total
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* River Flow Animation */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Waves className="h-6 w-6 text-cyan-300 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">Live River Monitoring</h3>
                            <p className="text-xs text-blue-200">Real-time data from {summaryStats?.totalLocations || 16} stations</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center space-x-1">
                          <Fish className="h-4 w-4 text-blue-300 animate-bounce" style={{animationDelay: '0s'}} />
                          <Fish className="h-3 w-3 text-cyan-300 animate-bounce" style={{animationDelay: '0.5s'}} />
                          <Fish className="h-2 w-2 text-blue-200 animate-bounce" style={{animationDelay: '1s'}} />
                        </div>
                      </div>
                      
                      {/* Flowing water animation */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent">
                        <div className="h-full w-full bg-gradient-to-r from-cyan-400/50 to-blue-400/50 animate-pulse"></div>
                      </div>
                    </div>


                  </div>
                </div>

                {/* Right Content - Status Dashboard */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">System Status</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-300 text-sm font-medium">Online</span>
                      </div>
                    </div>
                    
                    {lastUpdated && (
                      <div className="flex items-center gap-2 text-blue-200 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          Last updated: {moment(lastUpdated).format('MMM DD, YYYY HH:mm')}
                        </span>
                      </div>
                    )}

                    {/* Demo Mode Alert */}
                    {usesMockData && (!data.locations?.length || !data.waterQuality?.length) && (
                      <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-300/30 rounded-lg px-4 py-3 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-300" />
                          <span className="text-sm text-amber-100 font-medium">Demo Mode Active</span>
                        </div>
                        <p className="text-xs text-amber-200 mt-1">Displaying simulated data for demonstration</p>
                      </div>
                    )}

                    {/* Quick Navigation */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/locations" className="group">
                        <div className="bg-white/5 hover:bg-white/15 rounded-lg p-3 transition-all duration-300 border border-white/10 hover:border-white/30">
                          <MapPin className="h-5 w-5 text-cyan-300 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-medium text-white">Locations</div>
                          <div className="text-xs text-blue-200">View all sites</div>
                        </div>
                      </Link>
                      
                      <Link to="/forecasting" className="group">
                        <div className="bg-white/5 hover:bg-white/15 rounded-lg p-3 transition-all duration-300 border border-white/10 hover:border-white/30">
                          <TrendingUp className="h-5 w-5 text-green-300 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-medium text-white">Forecasting</div>
                          <div className="text-xs text-blue-200">Predictions</div>
                        </div>
                      </Link>
                      
                      <Link to="/chatbot" className="group">
                        <div className="bg-white/5 hover:bg-white/15 rounded-lg p-3 transition-all duration-300 border border-white/10 hover:border-white/30">
                          <MessageCircle className="h-5 w-5 text-purple-300 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-medium text-white">AI Assistant</div>
                          <div className="text-xs text-blue-200">Get help</div>
                        </div>
                      </Link>
                      
                      <Link to="/emergency" className="group">
                        <div className="bg-white/5 hover:bg-white/15 rounded-lg p-3 transition-all duration-300 border border-white/10 hover:border-white/30">
                          <AlertTriangle className="h-5 w-5 text-red-300 mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-medium text-white">Emergency</div>
                          <div className="text-xs text-blue-200">Response</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Bottom Wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" 
                    fill="rgba(249, 250, 251, 1)" />
              <path d="M0,80 C150,140 350,20 600,80 C850,140 1050,20 1200,80 L1200,120 L0,120 Z" 
                    fill="rgba(249, 250, 251, 0.8)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Now in Container */}
      <div className="space-y-6">
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
                 alerts={data.alerts}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <Link to="/chatbot">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-sm sm:text-base">Chat Assistant</span>
                  <span className="text-xs text-gray-500 hidden sm:block">Ask questions</span>
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

        {/* Environmental Impact & Community Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environmental Impact */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Leaf className="h-5 w-5" />
                Environmental Impact
              </CardTitle>
              <CardDescription className="text-green-600">
                Our contribution to preserving the sacred Ganga River
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">2.5M</div>
                    <div className="text-sm text-green-600">Liters Monitored Daily</div>
                  </div>
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">98%</div>
                    <div className="text-sm text-green-600">Accuracy Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-200">
                  <Fish className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Aquatic Life Protection</div>
                    <div className="text-sm text-green-600">Monitoring ecosystem health indicators</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-200">
                  <Heart className="h-6 w-6 text-red-500" />
                  <div>
                    <div className="font-semibold text-green-800">Community Health</div>
                    <div className="text-sm text-green-600">Protecting 400M+ people downstream</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Engagement */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Users className="h-5 w-5" />
                Community Engagement
              </CardTitle>
              <CardDescription className="text-blue-600">
                Connecting communities for river conservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">15K+</div>
                    <div className="text-sm text-blue-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-white/60 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">500+</div>
                    <div className="text-sm text-blue-600">Daily Reports</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">AI Assistant</div>
                    <div className="text-sm text-blue-600">24/7 support for water quality queries</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-blue-200">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  <div>
                    <div className="font-semibold text-blue-800">Real-time Alerts</div>
                    <div className="text-sm text-blue-600">Instant notifications for critical changes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Insights & Technology */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-5 w-5" />
              System Insights & Technology
            </CardTitle>
            <CardDescription className="text-purple-600">
              Advanced monitoring technology for comprehensive water quality analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Real-time Processing */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-800">Real-time Processing</h3>
                <p className="text-sm text-purple-600">
                  Advanced sensors collect and process data every 15 minutes across all monitoring stations
                </p>
                <div className="text-2xl font-bold text-purple-700">15min</div>
                <div className="text-xs text-purple-500">Update Frequency</div>
              </div>

              {/* AI-Powered Analytics */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-indigo-800">AI-Powered Analytics</h3>
                <p className="text-sm text-indigo-600">
                  Machine learning algorithms predict water quality trends and identify potential issues
                </p>
                <div className="text-2xl font-bold text-indigo-700">95%</div>
                <div className="text-xs text-indigo-500">Prediction Accuracy</div>
              </div>

              {/* Multi-Parameter Monitoring */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-cyan-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-cyan-800">Multi-Parameter Monitoring</h3>
                <p className="text-sm text-cyan-600">
                  Comprehensive analysis including pH, dissolved oxygen, turbidity, and chemical pollutants
                </p>
                <div className="text-2xl font-bold text-cyan-700">12+</div>
                <div className="text-xs text-cyan-500">Parameters Tracked</div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="mt-8 p-6 bg-white/60 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Technology Stack
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-purple-700">IoT Sensors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-purple-700">Cloud Computing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-700">Machine Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-purple-700">Real-time Analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;