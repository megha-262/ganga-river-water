import React from 'react';
import { Award, Users, Code, Heart, ExternalLink, Trophy, Star } from 'lucide-react';

const Credits = () => {
  const teamMembers = [
    {
      name: "Development Team",
      role: "Full Stack Development",
      description: "Built the complete monitoring platform with real-time data visualization",
      icon: Code,
      contributions: ["Frontend React Application", "Backend API Development", "Database Design", "Real-time Data Processing"]
    },
    {
      name: "Data Science Team",
      role: "ML & Analytics",
      description: "Developed prediction models and water quality analysis algorithms",
      icon: Star,
      contributions: ["Water Quality Prediction Models", "Anomaly Detection", "Data Analysis", "Forecasting Algorithms"]
    },
    {
      name: "Environmental Experts",
      role: "Domain Knowledge",
      description: "Provided expertise on water quality parameters and environmental standards",
      icon: Award,
      contributions: ["Parameter Validation", "Quality Standards", "Environmental Guidelines", "Research Insights"]
    }
  ];

  const technologies = [
    { name: "React.js", description: "Frontend framework for interactive user interface", url: "https://reactjs.org/" },
    { name: "Node.js", description: "Backend runtime for server-side development", url: "https://nodejs.org/" },
    { name: "MongoDB", description: "Database for storing water quality data", url: "https://mongodb.com/" },
    { name: "Leaflet", description: "Interactive mapping library for location visualization", url: "https://leafletjs.com/" },
    { name: "Chart.js", description: "Data visualization library for charts and graphs", url: "https://chartjs.org/" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework for styling", url: "https://tailwindcss.com/" },
    { name: "Express.js", description: "Web framework for Node.js backend", url: "https://expressjs.com/" },
    { name: "Python", description: "Machine learning and data processing", url: "https://python.org/" }
  ];

  const acknowledgments = [
    {
      organization: "Central Pollution Control Board (CPCB)",
      contribution: "Water quality monitoring data and standards",
      url: "https://cpcb.nic.in/"
    },
    {
      organization: "National Mission for Clean Ganga (NMCG)",
      contribution: "Ganga river restoration data and guidelines",
      url: "https://nmcg.nic.in/"
    },
    {
      organization: "Indian Space Research Organisation (ISRO)",
      contribution: "Satellite data for remote sensing applications",
      url: "https://www.isro.gov.in/"
    },
    {
      organization: "OpenStreetMap Community",
      contribution: "Open-source mapping data and tiles",
      url: "https://openstreetmap.org/"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Credits & Acknowledgments</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This project was made possible through the collaborative efforts of dedicated individuals and organizations committed to environmental monitoring and protection.
          </p>
        </div>

        {/* Hackathon Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white mb-12 text-center">
          <div className="flex justify-center mb-4">
            <Award className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Hackathon Project</h2>
          <p className="text-xl mb-4">
            Ganga Water Quality Monitoring Platform
          </p>
          <p className="text-blue-100">
            Developed as part of an environmental technology hackathon to address water quality challenges in the Ganga river system.
          </p>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Development Team</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-4">
                    <member.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-blue-600">{member.role}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{member.description}</p>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Contributions:</h4>
                  <ul className="space-y-1">
                    {member.contributions.map((contribution, contribIndex) => (
                      <li key={contribIndex} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {contribution}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies Used */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <Code className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Technologies & Tools</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center">
                  <a
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 flex items-center justify-center">
                      {tech.name}
                      <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acknowledgments */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <Heart className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Special Acknowledgments</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {acknowledgments.map((ack, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ack.organization}</h3>
                    <p className="text-gray-600 mb-3">{ack.contribution}</p>
                  </div>
                  <a
                    href={ack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors ml-4"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Built with Purpose</h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            This platform represents our commitment to environmental protection and sustainable development. 
            We believe that technology can play a crucial role in preserving our natural resources for future generations.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            © 2024 Ganga Water Quality Monitoring Platform. Built for the community, by the community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credits;