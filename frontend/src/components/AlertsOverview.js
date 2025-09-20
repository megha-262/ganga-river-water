import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Badge } from './ui';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';

const AlertsOverview = () => {
  const [topAlerts, setTopAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch alerts with level 4+ and limit to 10
      const response = await apiService.alerts.getAll({
        levelMin: 4,
        limit: 10,
        status: 'active'
      });
      
      if (response && response.data) {
        // Filter for level 4+ alerts and limit to 10
        const level4PlusAlerts = response.data.filter(alert => alert.level >= 4).slice(0, 10);
        setTopAlerts(level4PlusAlerts);
      } else {
        setTopAlerts([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching top alerts:', err);
      setError(err.message || 'Failed to load top alerts');
      setTopAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 5: return 'text-red-600 bg-red-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 1: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBorderColor = (level) => {
    switch (level) {
      case 5: return 'border-red-500';
      case 4: return 'border-orange-500';
      case 3: return 'border-yellow-500';
      case 2: return 'border-blue-500';
      case 1: return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getLevelIcon = (level) => {
    const iconClass = "h-4 w-4";
    switch (level) {
      case 5: return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 4: return <AlertTriangle className={`${iconClass} text-orange-600`} />;
      case 3: return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 2: return <Info className={`${iconClass} text-blue-600`} />;
      case 1: return <CheckCircle className={`${iconClass} text-green-600`} />;
      default: return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-600 text-center">
            Error loading top alerts: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Top 10 Critical Alerts (Level 4+)
          </div>
          <Badge variant="outline" className="text-xs">
            {topAlerts.length} alerts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No critical alerts found</p>
            <p className="text-sm text-gray-400">All systems are operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topAlerts.map((alert, index) => (
              <div 
                key={alert._id || index}
                className={`border-l-4 ${getBorderColor(alert.level)} bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(alert.level)}
                    <h4 className="font-semibold text-gray-900">
                      {alert.title || `${alert.parameter} Alert`}
                    </h4>
                    <Badge className={`${getLevelColor(alert.level)} text-xs`}>
                      Level {alert.level} - {alert.levelName || getLevelName(alert.level)}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {alert.message}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(alert.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{alert.locationName || alert.locationId?.name || 'Unknown Location'}</span>
                  </div>
                  
                  {alert.thresholds && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Activity className="h-3 w-3" />
                      <span>
                        {alert.thresholds.exceeded}: {alert.thresholds.value} 
                        (Limit: {alert.thresholds.limit})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsOverview;