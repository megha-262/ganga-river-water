import React, { useState, useEffect } from 'react';
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
  MapPin
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

  useEffect(() => {
    fetchRecentAlerts();
  }, []);

  const fetchRecentAlerts = async () => {
    try {
      setLoading(true);
      // Fetch recent alerts (last 10)
      const response = await apiService.alerts.getAll({
        limit: 10,
        page: 1,
        status: 'active'
      });
      
      // Handle the response structure properly
      const alertsData = (response && response.data && Array.isArray(response.data)) ? response.data : [];
      setAlerts(alertsData);
      
      // Fetch all alerts for accurate stats
      const allAlertsResponse = await apiService.alerts.getAll();
      const allAlerts = (allAlertsResponse && allAlertsResponse.data && Array.isArray(allAlertsResponse.data)) ? allAlertsResponse.data : [];
      
      // Calculate stats from all alerts
      const stats = {
        total: allAlerts.length,
        active: allAlerts.filter(alert => alert.status === 'active').length,
        critical: allAlerts.filter(alert => alert.severity === 'critical').length,
        resolved: allAlerts.filter(alert => alert.status === 'resolved').length
      };
      setStats(stats);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
      setAlerts([]); // Ensure alerts is always an array
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 1: return Info;
      case 2: return AlertTriangle;
      case 3: return AlertTriangle;
      case 4: return AlertCircle;
      case 5: return Skull;
      default: return Bell;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 1: return 'text-blue-600';
      case 2: return 'text-green-600';
      case 3: return 'text-yellow-600';
      case 4: return 'text-orange-600';
      case 5: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertBadgeColor = (level) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              {stats.total} Total
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {stats.active} Active
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {stats.critical} Critical
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {stats.resolved} Resolved
            </Badge>
          </div>
        </div>

        {/* Recent Alerts List */}
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent alerts</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {(alerts || []).slice(0, 10).map((alert, index) => {
              const IconComponent = getAlertIcon(alert.level);
              return (
                <div key={alert._id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`mt-0.5 ${getAlertColor(alert.level)}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`${getAlertBadgeColor(alert.level)} text-xs`}
                      >
                        Level {alert.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location?.name || 'Unknown Location'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
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
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsSummaryWidget;