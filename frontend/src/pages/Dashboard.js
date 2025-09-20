import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Eye,
  Shield,
  ShieldAlert,
  Activity,
  Users,
  Gamepad2,
  Video,
  Clock,
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Heart,
  Leaf,
  Fish,
  Waves
} from 'lucide-react';
import WaterQualityMap from '../components/WaterQualityMap';
import WaterQualityChart from '../components/WaterQualityChart';
import AlertsOverview from '../components/AlertsOverview';
import LocationCard from '../components/LocationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService, mockData, isApiAvailable } from '../services/api';
import moment from 'moment';
import ModernCard from '../components/ModernCard';
import Avatar from '../components/Avatar';
import { initScrollAnimations, staggerAnimation } from '../utils/scrollAnimations';

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
    excellent: { min: 9, max: 10, color: 'green', bgColor: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-100' },
    good: { min: 7, max: 8.9, color: 'blue', bgColor: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-100' },
    fair: { min: 5, max: 6.9, color: 'yellow', bgColor: 'bg-yellow-500', textColor: 'text-yellow-600', bgLight: 'bg-yellow-100' },
    poor: { min: 3, max: 4.9, color: 'orange', bgColor: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-100' },
    critical: { min: 0, max: 2.9, color: 'red', bgColor: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-100' }
  };

  // Mock enhanced data for demonstration
  const enhancedMockData = {
    riverHealthScore: 6.8,
    pollutedLocations: [
      { name: 'Kanpur Industrial Area', score: 2.1, pollution: 'High Industrial Waste', coordinates: [26.4499, 80.3319] },
      { name: 'Varanasi Ghats', score: 3.4, pollution: 'Sewage & Religious Activities', coordinates: [25.3176, 82.9739] },
      { name: 'Allahabad Confluence', score: 4.2, pollution: 'Urban Runoff', coordinates: [25.4358, 81.8463] },
      { name: 'Haridwar Barrage', score: 4.8, pollution: 'Agricultural Runoff', coordinates: [29.9457, 78.1642] },
      { name: 'Patna Riverfront', score: 3.9, pollution: 'Municipal Waste', coordinates: [25.5941, 85.1376] }
    ],
    crowdsourcedReports: [
      { id: 1, location: 'Rishikesh', issue: 'Plastic waste accumulation', reporter: 'Local Resident', date: '2024-01-15', status: 'verified' },
      { id: 2, location: 'Haridwar', issue: 'Oil spill observed', reporter: 'Tourist', date: '2024-01-14', status: 'investigating' },
      { id: 3, location: 'Varanasi', issue: 'Dead fish found', reporter: 'Fisherman', date: '2024-01-13', status: 'resolved' }
    ],
    localInitiatives: [
      { name: 'Ganga Action Parivar', location: 'Varanasi', participants: 1200, impact: 'Cleaned 15km riverbank' },
      { name: 'River Warriors', location: 'Rishikesh', participants: 800, impact: 'Planted 5000 trees' },
      { name: 'Clean Ganga Mission', location: 'Haridwar', participants: 2000, impact: 'Removed 10 tons waste' }
    ]
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiAvailable = await isApiAvailable();
      
      if (apiAvailable) {
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
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading) {
      initScrollAnimations();
      staggerAnimation('.animate-fade-in', 100);
    }
  }, [loading, activeTab]);

  const getHealthScoreStatus = (score) => {
    if (score >= 9) return waterQualityThresholds.excellent;
    if (score >= 7) return waterQualityThresholds.good;
    if (score >= 5) return waterQualityThresholds.fair;
    if (score >= 3) return waterQualityThresholds.poor;
    return waterQualityThresholds.critical;
  };

  const getOverallStatus = () => {
    if (!data.latestReadings.length) return 'unknown';
    const statuses = data.latestReadings.map(reading => reading.overallStatus);
    if (statuses.includes('poor')) return 'poor';
    if (statuses.includes('fair')) return 'fair';
    if (statuses.includes('good')) return 'good';
    return 'excellent';
  };

  const healthStatus = getHealthScoreStatus(enhancedMockData.riverHealthScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Beautiful Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-12 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Waves className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Ganga River Health Monitor
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Real-time water quality monitoring, forecasting, and community-driven conservation for Mother Ganga
            </p>
            
            {/* River Health Score Display */}
            <div className="flex justify-center items-center space-x-8 mb-8 scroll-scale">
              <div className="text-center animate-fade-in hover-glow">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${healthStatus.bgColor} text-white text-3xl font-bold shadow-lg`}>
                  {enhancedMockData.riverHealthScore}
                </div>
                <p className="mt-2 text-sm font-medium">Health Score</p>
                <p className="text-xs text-blue-200">Scale: 1-10</p>
              </div>
              
              <div className="text-center animate-fade-in hover-scale" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white bg-opacity-20 text-white">
                  {enhancedMockData.riverHealthScore >= 7 ? (
                    <Shield className="w-12 h-12" />
                  ) : enhancedMockData.riverHealthScore >= 5 ? (
                    <AlertCircle className="w-12 h-12" />
                  ) : (
                    <ShieldAlert className="w-12 h-12" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">
                  {enhancedMockData.riverHealthScore >= 7 ? 'Safe' : 
                   enhancedMockData.riverHealthScore >= 5 ? 'Caution' : 'Unsafe'}
                </p>
              </div>
            </div>

            {/* Quick Stats with Modern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto px-4">
              <ModernCard
                title="Monitoring Points"
                value={data.locations.length}
                variant="glass"
                size="sm"
                avatar={{
                  type: 'location',
                  name: 'Monitoring',
                  status: 'online',
                  location: { type: 'monitoring' }
                }}
                className="text-center animate-fade-in"
              />
              <ModernCard
                title="Active Alerts"
                value={data.alerts.length}
                variant="glass"
                size="sm"
                avatar={{
                  type: 'location',
                  name: 'Alerts',
                  status: data.alerts.length > 0 ? 'critical' : 'good',
                  location: { type: 'monitoring' }
                }}
                className="text-center animate-fade-in"
                style={{animationDelay: '0.1s'}}
              />
              <ModernCard
                title="Community Reports"
                value="4K+"
                variant="glass"
                size="sm"
                avatar={{
                  type: 'user',
                  name: 'Community',
                  status: 'online'
                }}
                className="text-center animate-fade-in"
                style={{animationDelay: '0.2s'}}
              />
              <ModernCard
                title="Local Initiatives"
                value="15+"
                variant="glass"
                size="sm"
                avatar={{
                  type: 'location',
                  name: 'Initiatives',
                  status: 'excellent',
                  location: { type: 'rural' }
                }}
                className="text-center animate-fade-in"
                style={{animationDelay: '0.3s'}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'health', name: 'River Health', icon: Activity },
              { id: 'alerts', name: 'Alerts & Safety', icon: AlertTriangle },
              { id: 'community', name: 'Community', icon: Users },
              { id: 'initiatives', name: 'Local Initiatives', icon: Leaf },
              { id: 'gaming', name: 'Awareness Games', icon: Gamepad2 },
              { id: 'reels', name: 'Educational Reels', icon: Video },
              { id: 'historical', name: 'Historical Data', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Color-coded Water Quality Status */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4">
                {Object.entries(waterQualityThresholds).map(([status, config], index) => (
                  <div key={status} className={`${config.bgLight} rounded-lg p-4 border-l-4 border-${config.color}-500 animate-fade-in hover-scale`} style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${config.textColor} capitalize`}>{status}</h3>
                        <p className="text-sm text-gray-600">{config.min}-{config.max}</p>
                      </div>
                      <div className={`w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center`}>
                        {status === 'excellent' && <CheckCircle className="w-5 h-5 text-white" />}
                        {status === 'good' && <CheckCircle className="w-5 h-5 text-white" />}
                        {status === 'fair' && <AlertCircle className="w-5 h-5 text-white" />}
                        {(status === 'poor' || status === 'critical') && <XCircle className="w-5 h-5 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Dashboard Content */}
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-4">
                <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="scroll-scale">
                    <WaterQualityMap locations={data.locations} waterQualityData={data.latestReadings} />
                  </div>
                  <div className="scroll-scale">
                    <AlertsOverview alerts={data.alerts} />
                  </div>
                </div>
                <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
                  <div className="scroll-scale">
                    <WaterQualityChart data={data.latestReadings} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {data.locations.map((location, index) => (
                      <div key={location._id} className="animate-fade-in" style={{animationDelay: `${0.5 + index * 0.1}s`}}>
                        <LocationCard location={location} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              {/* River Health Scoreboard */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 scroll-scale">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center animate-fade-in">
                  <Award className="w-6 h-6 mr-2 text-blue-600" />
                  River Health Scoreboard
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center animate-fade-in hover-glow">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${healthStatus.bgColor} text-white text-4xl font-bold shadow-lg mb-4`}>
                      {enhancedMockData.riverHealthScore}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Overall Health Score</h3>
                    <p className="text-gray-600">Based on multiple parameters</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Health Indicators</h4>
                    {[
                      { name: 'Water Quality', score: 7.2, icon: Droplets },
                      { name: 'Biodiversity', score: 6.8, icon: Fish },
                      { name: 'Pollution Level', score: 5.9, icon: AlertTriangle },
                      { name: 'Ecosystem Health', score: 7.1, icon: Leaf }
                    ].map((indicator) => (
                      <div key={indicator.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <indicator.icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">{indicator.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getHealthScoreStatus(indicator.score).bgColor}`}
                              style={{ width: `${indicator.score * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{indicator.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Safety Status</h4>
                    <div className={`p-4 rounded-lg ${healthStatus.bgLight} border-l-4 border-${healthStatus.color}-500`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {enhancedMockData.riverHealthScore >= 7 ? (
                          <Shield className="w-5 h-5 text-green-600" />
                        ) : enhancedMockData.riverHealthScore >= 5 ? (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-semibold ${healthStatus.textColor}`}>
                          {enhancedMockData.riverHealthScore >= 7 ? 'Safe for Activities' : 
                           enhancedMockData.riverHealthScore >= 5 ? 'Use with Caution' : 'Unsafe - Avoid Contact'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {enhancedMockData.riverHealthScore >= 7 ? 
                          'Water quality meets safety standards for most activities.' :
                          enhancedMockData.riverHealthScore >= 5 ?
                          'Water quality is moderate. Avoid direct consumption.' :
                          'Water quality is poor. Avoid all contact activities.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 5 Polluted Locations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Top 5 Most Polluted Locations
                </h3>
                <div className="space-y-4">
                  {enhancedMockData.pollutedLocations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{location.name}</h4>
                          <p className="text-sm text-gray-600">{location.pollution}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{location.score}/10</div>
                        <div className="text-xs text-gray-500">Health Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Health Graph */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">River Health Trends</h3>
                <WaterQualityChart data={data.latestReadings} />
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Crowdsourced Reporting */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Community Reports
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                    Submit Report
                  </button>
                </div>
                <div className="space-y-4">
                  {enhancedMockData.crowdsourcedReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{report.issue}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'verified' ? 'bg-green-100 text-green-800' :
                          report.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Location:</strong> {report.location}</p>
                        <p><strong>Reported by:</strong> {report.reporter}</p>
                        <p><strong>Date:</strong> {moment(report.date).format('MMM DD, YYYY')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'initiatives' && (
            <div className="space-y-6">
              {/* Local Initiatives */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-600" />
                  Local Conservation Initiatives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {enhancedMockData.localInitiatives.map((initiative, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{initiative.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{initiative.location}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Participants</span>
                          <span className="font-semibold text-green-600">{initiative.participants}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Impact:</strong> {initiative.impact}
                        </div>
                      </div>
                      <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">
                        Join Initiative
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="space-y-6">
              {/* Gaming Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-purple-600" />
                  Environmental Awareness Games
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'River Cleanup Challenge', description: 'Virtual cleanup game to learn about pollution sources', difficulty: 'Easy', points: 100 },
                    { name: 'Water Quality Detective', description: 'Identify pollution sources and their impacts', difficulty: 'Medium', points: 250 },
                    { name: 'Ecosystem Builder', description: 'Build a healthy river ecosystem', difficulty: 'Hard', points: 500 }
                  ].map((game, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{game.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          game.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {game.difficulty}
                        </span>
                        <span className="text-sm font-semibold text-purple-600">{game.points} pts</span>
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">
                        Play Game
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reels' && (
            <div className="space-y-6">
              {/* Educational Reels */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-red-600" />
                  Educational Reels & Videos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Ganga: From Source to Sea', duration: '3:45', views: '12K', category: 'Documentary' },
                    { title: 'Water Testing Made Simple', duration: '2:30', views: '8.5K', category: 'Tutorial' },
                    { title: 'Community Heroes of Ganga', duration: '4:20', views: '15K', category: 'Stories' },
                    { title: 'Pollution Impact on Wildlife', duration: '3:15', views: '9.2K', category: 'Education' },
                    { title: 'Traditional Water Conservation', duration: '5:10', views: '6.8K', category: 'Culture' },
                    { title: 'Future of Clean Rivers', duration: '4:55', views: '11K', category: 'Innovation' }
                  ].map((video, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                      <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{video.title}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{video.duration}</span>
                          <span>{video.views} views</span>
                        </div>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {video.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historical' && (
            <div className="space-y-6">
              {/* Historical Data */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Historical Data & Future Projections
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Past Data */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Past 5 Years Trends</h4>
                    <div className="space-y-3">
                      {[
                        { year: '2019', score: 5.2, trend: 'stable' },
                        { year: '2020', score: 5.8, trend: 'improving' },
                        { year: '2021', score: 6.1, trend: 'improving' },
                        { year: '2022', score: 6.5, trend: 'improving' },
                        { year: '2023', score: 6.8, trend: 'improving' }
                      ].map((data) => (
                        <div key={data.year} className="flex items-center justify-between">
                          <span className="font-medium">{data.year}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">{data.score}</span>
                            <TrendingUp className={`w-4 h-4 ${data.trend === 'improving' ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Future Projections */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Future Projections</h4>
                    <div className="space-y-3">
                      {[
                        { year: '2024', score: 7.2, confidence: 'High' },
                        { year: '2025', score: 7.6, confidence: 'High' },
                        { year: '2026', score: 8.0, confidence: 'Medium' },
                        { year: '2027', score: 8.3, confidence: 'Medium' },
                        { year: '2028', score: 8.7, confidence: 'Low' }
                      ].map((data) => (
                        <div key={data.year} className="flex items-center justify-between">
                          <span className="font-medium">{data.year}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">{data.score}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              data.confidence === 'High' ? 'bg-green-100 text-green-800' :
                              data.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {data.confidence}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <AlertsOverview alerts={data.alerts} />
              
              {/* Enhanced Alert System */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  Smart Alert System
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">Critical Alerts</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">2</p>
                    <p className="text-sm text-red-600">Immediate action required</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Warning Alerts</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">5</p>
                    <p className="text-sm text-yellow-600">Monitor closely</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Info Alerts</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                    <p className="text-sm text-blue-600">General updates</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {moment(lastUpdated).format('MMMM Do YYYY, h:mm:ss a')}
          {usesMockData && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              Demo Mode
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;