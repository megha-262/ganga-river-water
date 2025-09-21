import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Droplets, AlertTriangle, MapPin, Info, LifeBuoy, TrendingUp, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Droplets },
    { name: 'Chatbot', href: '/chatbot', icon: MessageCircle },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Forecasting', href: '/forecasting', icon: TrendingUp },
    { name: 'Emergency', href: '/emergency', icon: LifeBuoy }, // New Emergency link
    { name: 'About', href: '/about', icon: Info },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-[1001] bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:from-blue-700 group-hover:to-cyan-700 transition-all duration-300">
                <Droplets className="w-6 h-6 text-white group-hover:animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Ganga Monitor</h1>
                <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-300">Water Quality Tracking</p>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${
                    isActive(item.href) 
                      ? 'text-white' 
                      : 'group-hover:scale-110 group-hover:text-white'
                  }`} />
                  <span className="relative z-10">{item.name}</span>
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-105"
            >
              {isOpen ? (
                <X className="block h-6 w-6 transition-transform duration-300 hover:rotate-90" />
              ) : (
                <Menu className="block h-6 w-6 transition-transform duration-300 hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive(item.href) 
                      ? 'text-white' 
                      : 'group-hover:scale-110 group-hover:text-white'
                  }`} />
                  <span className="relative z-10">{item.name}</span>
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;