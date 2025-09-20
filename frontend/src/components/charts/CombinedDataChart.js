import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Activity, 
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Badge } from '../ui';
import { Button } from '../ui';
import { apiService } from '../../services/api';
import moment from 'moment';

const CombinedDataChart = ({ locationId, locationName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState('waterQualityIndex');

  const parameters = [
    { key: 'waterQualityIndex', label: 'Water Quality Index', unit: '', color: '#3b82f6' },
    { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L', color: '#10b981' },
    { key: 'biochemicalOxygenDemand', label: 'BOD', unit: 'mg/L', color: '#f59e0b' },
    { key: 'nitrate', label: 'Nitrate', unit: 'mg/L', color: '#ef4444' },
    { key: 'fecalColiform', label: 'Fecal Coliform', unit: 'MPN/100ml', color: '#8b5cf6' }
  ];

  const fetchCombinedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.waterQuality.getCombined(locationId);
      
      if (response.success) {
        const combinedData = response.data;
        
        // Process historical data
        const historicalPoints = combinedData.historical.map(item => ({
          date: moment(item.timestamp).format('DD/MMM'),
          fullDate: moment(item.timestamp).format('DD/MMM/YYYY HH:mm'),
          timestamp: item.timestamp,
          dataType: 'historical',
          waterQualityIndex: item.waterQualityIndex,
          dissolvedOxygen: item.parameters.dissolvedOxygen?.value || 0,
          biochemicalOxygenDemand: item.parameters.biochemicalOxygenDemand?.value || 0,
          nitrate: item.parameters.nitrate?.value || 0,
          fecalColiform: item.parameters.fecalColiform?.value || 0,
          overallStatus: item.overallStatus
        }));

        // Process forecast data
        const forecastPoints = combinedData.forecast.map(item => ({
          date: moment(item.timestamp).format('DD/MMM'),
          fullDate: moment(item.timestamp).format('DD/MMM/YYYY HH:mm'),
          timestamp: item.timestamp,
          dataType: 'forecast',
          waterQualityIndex: item.waterQualityIndex,
          dissolvedOxygen: item.parameters.dissolvedOxygen?.value || 0,
          biochemicalOxygenDemand: item.parameters.biochemicalOxygenDemand?.value || 0,
          nitrate: item.parameters.nitrate?.value || 0,
          fecalColiform: item.parameters.fecalColiform?.value || 0,
          overallStatus: item.overallStatus,
          confidence: item.parameters.dissolvedOxygen?.confidence || 'medium',
          trend: item.parameters.dissolvedOxygen?.trend || 'stable'
        }));

        // Combine and sort by date
        const allPoints = [...historicalPoints, ...forecastPoints].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );

        setData({
          ...combinedData,
          chartData: allPoints,
          todayIndex: historicalPoints.length - 1
        });
      }
    } catch (err) {
      console.error('Error fetching combined data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchCombinedData();
    }
  }, [locationId]);

  const getStatusColor = (status) => {
    const colors = {
      excellent: '#10b981',
      good: '#3b82f6',
      fair: '#f59e0b',
      poor: '#ef4444',
      critical: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getConfidenceColor = (confidence) => {
    const colors = {
      high: '#10b981',
      medium: '#f59e0b',
      low: '#ef4444'
    };
    return colors[confidence] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isHistorical = data.dataType === 'historical';
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            {isHistorical ? (
              <Clock className="h-4 w-4 text-blue-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-purple-500" />
            )}
            <span className="font-medium">
              {isHistorical ? 'Historical' : 'Forecast'} - {data.fullDate}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>WQI:</span>
              <span className="font-medium">{data.waterQualityIndex}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge 
                variant={data.overallStatus}
                className="text-xs"
              >
                {data.overallStatus}
              </Badge>
            </div>
            
            {!isHistorical && data.confidence && (
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: getConfidenceColor(data.confidence) }}
                >
                  {data.confidence}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            13-Day Water Quality Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchCombinedData} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>13-Day Water Quality Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const selectedParam = parameters.find(p => p.key === selectedParameter);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              13-Day Water Quality Trend
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {locationName} - Historical (10 days) + Forecast (3 days)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {parameters.map(param => (
              <Button
                key={param.key}
                variant={selectedParameter === param.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedParameter(param.key)}
                className="text-xs"
              >
                {param.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm">Historical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded border-2 border-purple-300"></div>
            <span className="text-sm">Forecast Data</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ 
                  value: selectedParam.unit ? `${selectedParam.label} (${selectedParam.unit})` : selectedParam.label, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey={selectedParameter}
                stroke={selectedParam.color}
                strokeWidth={2}
                dot={(props) => {
                  const { payload } = props;
                  if (payload.dataType === 'historical') {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill={selectedParam.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                connectNulls={false}
              />
              
              {/* Forecast data line */}
              <Line
                type="monotone"
                dataKey={selectedParameter}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={(props) => {
                  const { payload } = props;
                  if (payload.dataType === 'forecast') {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#8b5cf6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                connectNulls={false}
              />
              
              {/* Reference line for today */}
              <ReferenceLine 
                x={data.chartData[data.todayIndex]?.date} 
                stroke="#ef4444" 
                strokeDasharray="2 2"
                label={{ value: "Today", position: "top" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.summary.historicalDays}
            </div>
            <div className="text-sm text-gray-600">Historical Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.summary.forecastDays}
            </div>
            <div className="text-sm text-gray-600">Forecast Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.summary.dataAvailable.historical}
            </div>
            <div className="text-sm text-gray-600">Historical Readings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.summary.dataAvailable.forecast}
            </div>
            <div className="text-sm text-gray-600">Forecast Points</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedDataChart;