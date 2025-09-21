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
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-48">
          <div className="flex items-center gap-2 mb-3">
            {isHistorical ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700">Historical Data</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700">Forecast Data</span>
              </div>
            )}
          </div>
          
          <div className="text-sm font-medium text-gray-800 mb-2">
            {data.fullDate}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">WQI:</span>
              <span className="font-semibold text-lg">{data.waterQualityIndex}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <Badge 
                variant={data.overallStatus}
                className="text-xs font-medium"
              >
                {data.overallStatus?.charAt(0).toUpperCase() + data.overallStatus?.slice(1)}
              </Badge>
            </div>
            
            {selectedParameter && data[selectedParameter] && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600">{selectedParam?.label}:</span>
                <span className="font-medium">
                  {data[selectedParameter]} {selectedParam?.unit}
                </span>
              </div>
            )}
            
            {!isHistorical && data.confidence && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confidence:</span>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    color: getConfidenceColor(data.confidence),
                    backgroundColor: `${getConfidenceColor(data.confidence)}20`
                  }}
                >
                  {data.confidence?.charAt(0).toUpperCase() + data.confidence?.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component for better visualization
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    const isHistorical = payload.dataType === 'historical';
    const isToday = payload.isToday;
    
    if (isHistorical) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={isToday ? 6 : 4}
          fill={isToday ? "#ef4444" : selectedParam.color}
          stroke="#fff"
          strokeWidth={isToday ? 3 : 2}
          className={isToday ? "animate-pulse" : ""}
        />
      );
    } else {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="#8b5cf6"
          stroke="#fff"
          strokeWidth={2}
          opacity={0.8}
        />
      );
    }
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Water Quality Trend Analysis
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {locationName} - 10 Days Historical + 3 Days Forecast
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
        
        {/* Enhanced Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 rounded"></div>
            <span className="text-sm font-medium">Historical Data (10 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500 rounded border-dashed border border-purple-300"></div>
            <span className="text-sm font-medium">Forecast Data (3 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-red-400 rounded"></div>
            <span className="text-sm font-medium">Transition Point</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 relative">
          {/* Background sections for better visual separation */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-blue-50 opacity-30 rounded-l-lg"></div>
            <div className="w-px bg-red-300"></div>
            <div className="flex-1 bg-purple-50 opacity-30 rounded-r-lg"></div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fontSize: 11 }}
                label={{ 
                  value: selectedParam.unit ? `${selectedParam.label} (${selectedParam.unit})` : selectedParam.label, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Historical data area */}
              <Area
                type="monotone"
                dataKey={selectedParameter}
                stroke={selectedParam.color}
                fill={selectedParam.color}
                fillOpacity={0.1}
                strokeWidth={0}
                dot={false}
                connectNulls={false}
              />
              
              {/* Historical data line */}
              <Line
                type="monotone"
                dataKey={selectedParameter}
                stroke={selectedParam.color}
                strokeWidth={3}
                dot={<CustomDot />}
                connectNulls={false}
                name="Historical"
              />
              
              {/* Forecast data area */}
              <Area
                type="monotone"
                dataKey={selectedParameter}
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.05}
                strokeWidth={0}
                dot={false}
                connectNulls={false}
              />
              
              {/* Forecast data line */}
              <Line
                type="monotone"
                dataKey={selectedParameter}
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={<CustomDot />}
                connectNulls={false}
                name="Forecast"
              />
              
              {/* Reference line for today */}
              <ReferenceLine 
                x={data.chartData[data.todayIndex]?.date} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ 
                  value: "Today", 
                  position: "topLeft",
                  style: { 
                    fill: "#ef4444", 
                    fontWeight: "bold",
                    fontSize: "12px"
                  }
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.summary.historicalDays}
            </div>
            <div className="text-sm text-gray-600 font-medium">Historical Days</div>
            <div className="text-xs text-gray-500 mt-1">Past data points</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {data.summary.forecastDays}
            </div>
            <div className="text-sm text-gray-600 font-medium">Forecast Days</div>
            <div className="text-xs text-gray-500 mt-1">Predicted values</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.summary.dataAvailable.historical}
            </div>
            <div className="text-sm text-gray-600 font-medium">Historical Readings</div>
            <div className="text-xs text-gray-500 mt-1">Available data</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {data.summary.dataAvailable.forecast}
            </div>
            <div className="text-sm text-gray-600 font-medium">Forecast Points</div>
            <div className="text-xs text-gray-500 mt-1">Predicted points</div>
          </div>
        </div>
        
        {/* Data Quality Indicator */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Data Quality:</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">
                {Math.round((data.summary.dataAvailable.historical / data.summary.historicalDays) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedDataChart;