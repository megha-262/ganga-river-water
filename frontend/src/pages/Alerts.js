import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Button } from '../components/ui';
import { Badge } from '../components/ui';
import {
  Info,
  AlertTriangle,
  AlertCircle,
  Zap,
  Skull,
  Bell,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import AlertsOverview from '../components/AlertsOverview';
import AlertsList from '../components/AlertsList';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  const alertLevels = [
    { level: 1, label: 'Level 1 - Info', icon: Info, color: 'bg-blue-100 text-blue-800' },
    { level: 2, label: 'Level 2 - Low', icon: AlertTriangle, color: 'bg-green-100 text-green-800' },
    { level: 3, label: 'Level 3 - Medium', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
    { level: 4, label: 'Level 4 - High', icon: AlertCircle, color: 'bg-orange-100 text-orange-800' },
    { level: 5, label: 'Level 5 - Critical', icon: Skull, color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Water Quality Alerts
            </h1>
            <p className="text-gray-600">
              Monitor and manage water quality alerts across all monitoring locations. 
              Our 5-level alert system helps you prioritize responses based on severity.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/chatbot" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Ask About Alerts
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Level Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Alert Levels
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {alertLevels.map((level) => {
              const IconComponent = level.icon;
              return (
                <Badge
                  key={level.level}
                  variant="secondary"
                  className={`${level.color} flex items-center gap-1 px-3 py-1`}
                >
                  <IconComponent className="h-4 w-4" />
                  {level.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => handleTabChange('overview')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => handleTabChange('all')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                All Alerts
              </button>
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <AlertsOverview />}
        {activeTab === 'all' && <AlertsList />}
      </div>
    </div>
  );
};

export default Alerts;