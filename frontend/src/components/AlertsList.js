import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui';
import { Button } from './ui';
import {
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import AlertCard from './AlertCard';

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch only active alerts without filters
      const response = await apiService.alerts.getAll({ status: 'active' });
      
      // Handle the response structure properly
      if (response && response.data) {
        // The API returns alerts directly in response.data array
        const alertsData = Array.isArray(response.data) ? response.data : [];
        setAlerts(alertsData);
      } else {
        setAlerts([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
      setAlerts([]); // Ensure alerts is always an array
    } finally {
      setLoading(false);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>


      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Alerts List */}
      <div>
        {!alerts || alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No alerts found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {(alerts || []).map((alert) => (
              <AlertCard
                key={alert._id}
                alert={alert}
              />
            ))}
          </>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && alerts.length > 0 && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default AlertsList;