import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const AlertsOverview = ({ alerts = [] }) => {
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBorderColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityText = (severity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  // Sort alerts by severity and timestamp
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Get alert counts by severity
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No active alerts</p>
          <p className="text-sm text-gray-500 mt-1">All monitoring locations are within normal parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <div className="flex space-x-2">
          {alertCounts.critical && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {alertCounts.critical} Critical
            </span>
          )}
          {alertCounts.high && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {alertCounts.high} High
            </span>
          )}
          {alertCounts.medium && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {alertCounts.medium} Medium
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedAlerts.slice(0, 10).map((alert, index) => (
          <div
            key={alert._id || index}
            className={`border-l-4 p-4 rounded-r-lg ${getAlertBorderColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.locationId?.name || 'Unknown Location'}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                    {getSeverityText(alert.severity)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {alert.parameter}: {alert.value} {alert.unit}
                    {alert.threshold && ` (Threshold: ${alert.threshold} ${alert.unit})`}
                  </span>
                  <span>{formatTimestamp(alert.timestamp)}</span>
                </div>
                {alert.locationId?.city && (
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.locationId.city}, {alert.locationId.state}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {alerts.length} alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsOverview;