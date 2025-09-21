import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { Badge } from './ui';
import {
  Bell,
  Info,
  AlertTriangle,
  AlertCircle,
  Zap,
  Skull,
  TrendingUp,
  Eye,
  MapPin,
  RefreshCw,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { apiService } from '../services/api';

const AlertsSummaryWidget = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    resolved: 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newAlertsCount, setNewAlertsCount] = useState(0);

  const fetchRecentAlerts = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await apiService.alerts.getRecentAlerts(5);
      
      // The API service extracts response.data, so response is the data object with data array
      const alertsData = response.data || [];
      
      // Check for new alerts
      if (alerts.length > 0 && alertsData.length > alerts.length) {
        setNewAlertsCount(alertsData.length - alerts.length);
        // Show notification for new critical alerts
        const newCriticalAlerts = alertsData.slice(0, alertsData.length - alerts.length)
          .filter(alert => alert.level >= 4);
        
        if (newCriticalAlerts.length > 0 && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Critical Water Quality Alert!', {
              body: `${newCriticalAlerts.length} new critical alert(s) detected`,
              icon: '/favicon.ico',
              tag: 'water-quality-alert'
            });
          }
        }
      }
      
      setAlerts(alertsData);
      
      // Calculate stats
      const activeAlerts = alertsData.filter(alert => alert.status === 'active');
      const criticalAlerts = alertsData.filter(alert => alert.level >= 4);
      const resolvedAlerts = alertsData.filter(alert => alert.status === 'resolved');
      
      setStats({
        total: alertsData.length,
        active: activeAlerts.length,
        critical: criticalAlerts.length,
        resolved: resolvedAlerts.length
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [alerts.length]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchRecentAlerts(true);
    
    let interval;
    if (autoRefresh && isOnline) {
      interval = setInterval(() => {
        fetchRecentAlerts(false);
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchRecentAlerts, autoRefresh, isOnline]);

  // Clear new alerts count after a delay
  useEffect(() => {
    if (newAlertsCount > 0) {
      const timer = setTimeout(() => {
        setNewAlertsCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newAlertsCount]);

  const getAlertIcon = (level) => {
    switch (level) {
      case 1: return Info;
      case 2: return Bell;
      case 3: return AlertTriangle;
      case 4: return AlertCircle;
      case 5: return Skull;
      default: return Info;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 1: return 'text-blue-500';
      case 2: return 'text-yellow-500';
      case 3: return 'text-orange-500';
      case 4: return 'text-red-500';
      case 5: return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  const getAlertBadgeColor = (level) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertLevelName = (level) => {
    switch (level) {
      case 1: return 'Info';
      case 2: return 'Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Critical';
      default: return 'Unknown';
    }
  };

  const handleManualRefresh = () => {
    fetchRecentAlerts(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      {/* New alerts indicator */}
      {newAlertsCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse z-10">
          {newAlertsCount}
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
            {stats.critical > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {stats.critical} Critical
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Connection status */}
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" title="Online" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" title="Offline" />
            )}
            
            {/* Manual refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Auto-refresh toggle */}
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8 px-2 text-xs"
            >
              Auto
            </Button>
          </div>
        </CardTitle>
        
        {/* Last updated info */}
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            You're offline. Data may not be current.
          </div>
        )}

        {/* Enhanced Quick Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Alert Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Total</span>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                {stats.total}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm text-blue-600">Active</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.active}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-sm text-red-600">Critical</span>
              <Badge variant="secondary" className={`bg-red-100 text-red-800 ${stats.critical > 0 ? 'animate-pulse' : ''}`}>
                {stats.critical}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm text-green-600">Resolved</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.resolved}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent Alerts List */}
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent alerts</p>
            <p className="text-xs text-gray-400 mt-1">Water quality is within normal parameters</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {(alerts || []).slice(0, 10).map((alert, index) => {
              const IconComponent = getAlertIcon(alert.level);
              const isNew = index < newAlertsCount;
              const isCritical = alert.level >= 4;
              
              return (
                <div 
                  key={alert._id} 
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-all duration-300 ${
                    isNew ? 'border-blue-300 bg-blue-50 animate-pulse' : 
                    isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`mt-0.5 ${getAlertColor(alert.level)} ${isCritical ? 'animate-pulse' : ''}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                        {isNew && <span className="text-blue-600 text-xs ml-1">(New)</span>}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`${getAlertBadgeColor(alert.level)} text-xs ${isCritical ? 'animate-pulse' : ''}`}
                      >
                        {getAlertLevelName(alert.level)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {alert.message || alert.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location?.name || 'Unknown Location'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                      {alert.status === 'active' && (
                        <>
                          <span>•</span>
                          <span className="text-red-500 font-medium">Active</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/alerts" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View All Alerts
              {stats.active > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {stats.active} Active
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsSummaryWidget;