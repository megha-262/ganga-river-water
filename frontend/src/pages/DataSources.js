import React from 'react';
import { Database, Satellite, Beaker, MapPin, ExternalLink, CheckCircle } from 'lucide-react';

const DataSources = () => {
  const dataSources = [
    {
      name: "Central Pollution Control Board (CPCB)",
      type: "Government Agency",
      description: "Primary source for water quality monitoring data across India",
      url: "https://cpcb.nic.in/",
      icon: Database,
      parameters: ["pH", "Dissolved Oxygen", "BOD", "Turbidity", "Fecal Coliform"],
      coverage: "National",
      frequency: "Daily"
    },
    {
      name: "National Water Quality Monitoring Programme",
      type: "Government Initiative",
      description: "Comprehensive water quality assessment program",
      url: "https://nwmp.cpcb.gov.in/",
      icon: Beaker,
      parameters: ["Chemical Parameters", "Physical Parameters", "Biological Parameters"],
      coverage: "River Systems",
      frequency: "Monthly"
    },
    {
      name: "Ganga Action Plan Monitoring",
      type: "Specialized Program",
      description: "Dedicated monitoring for Ganga river restoration",
      url: "https://nmcg.nic.in/",
      icon: MapPin,
      parameters: ["Water Quality Index", "Pollution Load", "Flow Data"],
      coverage: "Ganga Basin",
      frequency: "Real-time"
    },
    {
      name: "Satellite Remote Sensing",
      type: "Technology",
      description: "Earth observation data for water quality assessment",
      url: "https://www.isro.gov.in/",
      icon: Satellite,
      parameters: ["Surface Temperature", "Turbidity", "Chlorophyll", "Suspended Sediments"],
      coverage: "Regional",
      frequency: "Weekly"
    }
  ];

  const qualityStandards = [
    { parameter: "pH", range: "6.5 - 8.5", unit: "", standard: "IS 10500:2012" },
    { parameter: "Dissolved Oxygen", range: "> 5.0", unit: "mg/L", standard: "CPCB Guidelines" },
    { parameter: "BOD", range: "< 3.0", unit: "mg/L", standard: "CPCB Class C" },
    { parameter: "Turbidity", range: "< 10", unit: "NTU", standard: "WHO Guidelines" },
    { parameter: "Fecal Coliform", range: "< 500", unit: "MPN/100ml", standard: "CPCB Class C" },
    { parameter: "Nitrate", range: "< 45", unit: "mg/L", standard: "IS 10500:2012" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Sources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform aggregates data from multiple reliable sources to provide comprehensive water quality monitoring for the Ganga river system.
          </p>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {dataSources.map((source, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-4">
                    <source.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{source.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{source.type}</p>
                  </div>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              
              <p className="text-gray-600 mb-4">{source.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Coverage:</span>
                  <span className="text-sm text-gray-600">{source.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Frequency:</span>
                  <span className="text-sm text-gray-600">{source.frequency}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">Parameters:</span>
                  <div className="flex flex-wrap gap-2">
                    {source.parameters.map((param, paramIndex) => (
                      <span
                        key={paramIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Standards */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Water Quality Standards</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Our monitoring system uses established national and international standards to assess water quality parameters.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Acceptable Range</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Unit</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Standard</th>
                </tr>
              </thead>
              <tbody>
                {qualityStandards.map((standard, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{standard.parameter}</td>
                    <td className="py-3 px-4 text-gray-600">{standard.range}</td>
                    <td className="py-3 px-4 text-gray-600">{standard.unit}</td>
                    <td className="py-3 px-4 text-sm text-blue-600">{standard.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Quality Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <Database className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Data Quality & Reliability</h3>
              <p className="text-blue-800 mb-4">
                All data sources are validated and cross-referenced to ensure accuracy. Our platform implements quality control measures including:
              </p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Automated data validation and anomaly detection</li>
                <li>Regular calibration of monitoring equipment</li>
                <li>Cross-validation with multiple data sources</li>
                <li>Expert review of unusual readings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSources;