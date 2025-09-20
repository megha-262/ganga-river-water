import React from 'react';
import { Droplets, MapPin, TrendingUp, Shield, Users, Globe } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      title: 'Real-time Monitoring',
      description: 'Continuous monitoring of water quality parameters including dissolved oxygen, BOD, pH, turbidity, and more across multiple locations along the Ganga River.'
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-600" />,
      title: 'Geographic Coverage',
      description: 'Comprehensive monitoring network covering key locations from Haridwar to Kolkata, providing insights into water quality variations along the river.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: 'Predictive Analytics',
      description: '3-day forecasting system using advanced algorithms to predict water quality trends and potential pollution events.'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'Alert System',
      description: 'Automated alert system that notifies stakeholders when water quality parameters exceed safe thresholds, enabling rapid response.'
    },
    {
      icon: <Users className="w-8 h-8 text-yellow-600" />,
      title: 'Community Impact',
      description: 'Supporting millions of people who depend on the Ganga River for drinking water, agriculture, and livelihood by ensuring water quality transparency.'
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-600" />,
      title: 'Environmental Protection',
      description: 'Contributing to the preservation of one of the world\'s most sacred rivers through data-driven environmental monitoring and protection.'
    }
  ];

  const parameters = [
    {
      name: 'Dissolved Oxygen (DO)',
      description: 'Essential for aquatic life, indicates the health of the river ecosystem',
      unit: 'mg/L',
      threshold: '> 4.0 mg/L for healthy aquatic life'
    },
    {
      name: 'Biochemical Oxygen Demand (BOD)',
      description: 'Measures organic pollution and oxygen consumption by microorganisms',
      unit: 'mg/L',
      threshold: '< 6.0 mg/L for acceptable water quality'
    },
    {
      name: 'pH Level',
      description: 'Indicates acidity or alkalinity of water, affects aquatic life',
      unit: 'pH units',
      threshold: '6.5 - 8.5 for optimal conditions'
    },
    {
      name: 'Turbidity',
      description: 'Measures water clarity and suspended particles',
      unit: 'NTU',
      threshold: '< 10 NTU for clear water'
    },
    {
      name: 'Nitrate',
      description: 'Indicates agricultural runoff and potential eutrophication',
      unit: 'mg/L',
      threshold: '< 10 mg/L to prevent algal blooms'
    },
    {
      name: 'Fecal Coliform',
      description: 'Indicates bacterial contamination and health risks',
      unit: 'CFU/100mL',
      threshold: '< 1000 CFU/100mL for safe contact'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ganga Water Quality Monitoring System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive real-time monitoring system dedicated to tracking and preserving the water quality 
            of the sacred Ganga River, supporting environmental protection and public health.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-8 mb-16 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              To provide transparent, accurate, and real-time water quality data for the Ganga River, 
              empowering communities, researchers, and policymakers with the information needed to 
              protect and restore one of the world's most important river systems.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Water Quality Parameters */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Monitored Parameters</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Healthy Range
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parameters.map((param, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{param.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{param.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{param.unit}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{param.threshold}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React.js for dynamic user interface</li>
                <li>• Tailwind CSS for responsive design</li>
                <li>• Chart.js for data visualization</li>
                <li>• Leaflet for interactive maps</li>
                <li>• Axios for API communication</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Node.js with Express.js framework</li>
                <li>• MongoDB for data storage</li>
                <li>• Mongoose for data modeling</li>
                <li>• RESTful API architecture</li>
                <li>• Real-time data processing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500 km</div>
              <p className="text-gray-600">River length monitored</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">400M+</div>
              <p className="text-gray-600">People benefited</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <p className="text-gray-600">Continuous monitoring</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join us in our mission to protect the Ganga River. Whether you're a researcher, 
            policymaker, or concerned citizen, your involvement can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Access API Documentation
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Download Data Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;