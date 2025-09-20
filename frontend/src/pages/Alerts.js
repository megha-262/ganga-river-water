import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Filter, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { apiService } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.alerts.getAll();
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
      // Use mock data for development
      setAlerts([
        {
          _id: '1',
          locationId: { name: 'Haridwar', city: 'Haridwar', state: 'Uttarakhand' },
          severity: 'critical',
          parameter: 'Dissolved Oxygen',
          value: 2.1,
          unit: 'mg/L',
          threshold: 4.0,
          message: 'Dissolved oxygen levels critically low, immediate attention required',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          _id: '2',
          locationId: { name: 'Rishikesh', city: 'Rishikesh', state: 'Uttarakhand' },
          severity: 'high',
          parameter: 'BOD',
          value: 8.5,
          unit: 'mg/L',
          threshold: 6.0,
          message: 'Biochemical oxygen demand exceeds acceptable limits',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          _id: '3',
          locationId: { name: 'Kanpur', city: 'Kanpur', state: 'Uttar Pradesh' },
          severity: 'medium',
          parameter: 'pH',
          value: 8.8,
          unit: '',
          threshold: 8.5,
          message: 'pH levels slightly elevated above normal range',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesSearch = searchTerm === '' || 
        alert.locationId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.parameter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'severity') {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      }
      return 0;
    });

  // Get alert counts by severity
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Water Quality Alerts</h1>
          <p className="text-gray-600">Monitor and manage water quality alerts across all monitoring locations</p>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{alertCounts.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Critical</p>
                <p className="text-2xl font-semibold text-red-600">{alertCounts.critical || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">High</p>
                <p className="text-2xl font-semibold text-orange-600">{alertCounts.high || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Info className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Medium</p>
                <p className="text-2xl font-semibold text-yellow-600">{alertCounts.medium || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low</p>
                <p className="text-2xl font-semibold text-green-600">{alertCounts.low || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestamp">Sort by Time</option>
                <option value="severity">Sort by Severity</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-600">
                {searchTerm || filterSeverity !== 'all' 
                  ? 'Try adjusting your filters or search terms'
                  : 'All monitoring locations are within normal parameters'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={alert._id || index}
                  className={`border-l-4 p-6 ${getAlertBorderColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {alert.locationId?.name || 'Unknown Location'}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>
                            <strong>{alert.parameter}:</strong> {alert.value} {alert.unit}
                            {alert.threshold && ` (Threshold: ${alert.threshold} ${alert.unit})`}
                          </span>
                          <span>
                            <strong>Location:</strong> {alert.locationId?.city}, {alert.locationId?.state}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">{formatTimestamp(alert.timestamp)}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        alert.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status || 'active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;