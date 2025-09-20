import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Badge } from './ui';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  MapPin,
  Clock,
  TrendingUp,
  HelpCircle,
  Droplets,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const AlertCard = ({ alert }) => {
  const [showDetails, setShowDetails] = useState(false);
  const getAlertIcon = (level) => {
    switch (level) {
      case 5: return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 4: return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 3: return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 2: return <Info className="h-5 w-5 text-blue-600" />;
      case 1: return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 5: return 'destructive';
      case 4: return 'destructive';
      case 3: return 'default';
      case 2: return 'secondary';
      case 1: return 'default';
      default: return 'outline';
    }
  };

  const getAlertLabel = (level) => {
    switch (level) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'default';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getBorderColor = (level) => {
    switch (level) {
      case 5: return 'border-l-red-500';
      case 4: return 'border-l-orange-500';
      case 3: return 'border-l-yellow-500';
      case 2: return 'border-l-blue-500';
      case 1: return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const formatFullTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'PPpp');
    } catch (error) {
      return 'Unknown time';
    }
  };

  const getActionRecommendation = (level, parameter) => {
    const actions = {
      5: {
        default: "IMMEDIATE ACTION REQUIRED: Stop water usage, evacuate area if necessary, contact emergency services",
        pH: "Critical pH levels detected. Stop all water consumption immediately and contact authorities",
        temperature: "Extreme temperature detected. Avoid contact with water and alert environmental agencies",
        dissolved_oxygen: "Critically low oxygen levels. Aquatic life at severe risk - contact environmental emergency services"
      },
      4: {
        default: "HIGH PRIORITY: Restrict water usage, implement safety measures, monitor closely",
        pH: "Dangerous pH levels. Restrict water usage and implement immediate corrective measures",
        temperature: "High temperature alert. Monitor closely and reduce thermal discharge sources",
        dissolved_oxygen: "Low oxygen levels detected. Investigate pollution sources and increase monitoring"
      },
      3: {
        default: "MODERATE CONCERN: Increase monitoring frequency, prepare contingency plans",
        pH: "pH levels outside normal range. Increase monitoring and investigate potential sources",
        temperature: "Temperature elevation detected. Monitor trends and identify heat sources",
        dissolved_oxygen: "Oxygen levels declining. Monitor aquatic health and check for pollution sources"
      },
      2: {
        default: "LOW PRIORITY: Continue routine monitoring, document trends",
        pH: "Minor pH fluctuation detected. Continue monitoring and document patterns",
        temperature: "Slight temperature increase. Maintain regular monitoring schedule",
        dissolved_oxygen: "Minor oxygen level change. Continue routine monitoring"
      },
      1: {
        default: "INFORMATIONAL: Normal monitoring protocols apply",
        pH: "pH levels within acceptable range. Continue routine monitoring",
        temperature: "Temperature within normal parameters. Routine monitoring continues",
        dissolved_oxygen: "Oxygen levels stable. Continue standard monitoring protocols"
      }
    };

    const levelActions = actions[level] || actions[1];
    return levelActions[parameter?.toLowerCase()] || levelActions.default;
  };

  const getDetailedInfo = (alert) => {
    // Handle different coordinate structures
    let locationInfo = 'Coordinates not available';
    
    if (alert.locationId?.coordinates?.coordinates && Array.isArray(alert.locationId.coordinates.coordinates)) {
      // Handle GeoJSON-style coordinates: { coordinates: [lng, lat] }
      locationInfo = `Coordinates: ${alert.locationId.coordinates.coordinates.join(', ')}`;
    } else if (alert.locationId?.coordinates && Array.isArray(alert.locationId.coordinates)) {
      // Handle direct array coordinates: [lng, lat]
      locationInfo = `Coordinates: ${alert.locationId.coordinates.join(', ')}`;
    } else if (alert.location?.name) {
      // Fallback to location name if coordinates not available
      locationInfo = `Location: ${alert.location.name}${alert.location.city ? `, ${alert.location.city}` : ''}`;
    } else if (alert.locationId?.name) {
      // Alternative location name structure
      locationInfo = `Location: ${alert.locationId.name}${alert.locationId.city ? `, ${alert.locationId.city}` : ''}`;
    }
    
    return {
      technicalDetails: `Parameter: ${alert.parameter}, Value: ${alert.thresholds?.value || alert.value || 'N/A'} ${alert.thresholds?.unit || ''}, Limit: ${alert.thresholds?.limit || 'N/A'} ${alert.thresholds?.unit || ''}`,
      location: locationInfo,
      impact: getImpactAssessment(alert.level),
      nextSteps: getNextSteps(alert.level)
    };
  };

  const getImpactAssessment = (level) => {
    const impacts = {
      5: "Severe environmental and health impact. Immediate threat to aquatic life and human safety.",
      4: "High environmental impact. Significant risk to ecosystem and potential health concerns.",
      3: "Moderate environmental impact. Ecosystem stress and monitoring required.",
      2: "Low environmental impact. Minor ecosystem effects, continued observation needed.",
      1: "Minimal impact. Normal environmental conditions with routine monitoring."
    };
    return impacts[level] || impacts[1];
  };

  const getNextSteps = (level) => {
    const steps = {
      5: "1. Immediate emergency response 2. Water usage prohibition 3. Area evacuation if needed 4. Emergency services contact",
      4: "1. Restrict water usage 2. Implement safety measures 3. Increase monitoring frequency 4. Prepare response team",
      3: "1. Increase monitoring 2. Investigate sources 3. Prepare contingency plans 4. Notify stakeholders",
      2: "1. Continue monitoring 2. Document trends 3. Review protocols 4. Schedule follow-up",
      1: "1. Routine monitoring 2. Data logging 3. Regular reporting 4. Standard protocols"
    };
    return steps[level] || steps[1];
  };

  const detailedInfo = getDetailedInfo(alert);

  return (
    <Card className={`mb-4 border-l-4 ${getBorderColor(alert.level)} hover:shadow-lg transition-all duration-300 relative`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {getAlertIcon(alert.level)}
            <div>
              <CardTitle className="text-lg font-semibold">
                {alert.title || `${alert.parameter} Alert`}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {alert.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getAlertColor(alert.level)} className="text-xs font-medium">
              Level {alert.level} - {alert.levelName || getAlertLabel(alert.level)}
            </Badge>
            <button
              onMouseEnter={() => setShowDetails(true)}
              onMouseLeave={() => setShowDetails(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Time and Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <span className="font-medium text-gray-700">Time:</span>
              <span className="ml-2 text-gray-600">{formatTimestamp(alert.createdAt)}</span>
              <div className="text-xs text-gray-400">{formatFullTimestamp(alert.createdAt)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500" />
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-600">{alert.locationName || alert.locationId?.name || 'Unknown Location'}</span>
              {alert.locationId?.region && (
                <div className="text-xs text-gray-400">{alert.locationId.region}</div>
              )}
            </div>
          </div>
        </div>

        {/* Parameter Details */}
        {alert.thresholds && (
          <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg">
            <Activity className="h-4 w-4 text-orange-500" />
            <div>
              <span className="font-medium text-gray-700">Reading:</span>
              <span className="ml-2 text-gray-900 font-semibold">
                {alert.thresholds.value} {alert.thresholds.unit || ''}
              </span>
              <span className="ml-2 text-gray-500">
                (Limit: {alert.thresholds.limit} {alert.thresholds.unit || ''})
              </span>
              {alert.thresholds.exceeded && (
                <span className="ml-2 text-red-600 font-medium">⚠ Exceeded</span>
              )}
            </div>
          </div>
        )}

        {/* Action Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Droplets className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm mb-1">What to do:</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {getActionRecommendation(alert.level, alert.parameter)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Hover Details Tooltip */}
      {showDetails && (
        <div className="absolute top-0 left-full ml-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Detailed Information
          </h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Technical Details:</span>
              <p className="text-gray-600 mt-1">{detailedInfo.technicalDetails}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Location Info:</span>
              <p className="text-gray-600 mt-1">{detailedInfo.location}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Impact Assessment:</span>
              <p className="text-gray-600 mt-1">{detailedInfo.impact}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Next Steps:</span>
              <p className="text-gray-600 mt-1">{detailedInfo.nextSteps}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AlertCard;