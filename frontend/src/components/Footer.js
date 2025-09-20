import React from 'react';
import { Droplets, Github, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Droplets className="w-8 h-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold">Ganga Monitor</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Real-time water quality monitoring system for the Ganga River, 
              providing transparent data to protect and preserve one of the world's 
              most sacred rivers.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/alerts" className="text-gray-300 hover:text-white transition-colors">
                  Alerts
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@gangamonitor.org</span>
              </li>
              <li className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>New Delhi, India</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-400">Data Sources</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>Central Pollution Control Board</li>
                <li>National Mission for Clean Ganga</li>
                <li>State Pollution Control Boards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Ganga Water Quality Monitoring System. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Data Usage Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;