import React from 'react';
import { MapPin, User, Droplets, Building, TreePine, Factory } from 'lucide-react';

const Avatar = ({ 
  type = 'user', 
  name, 
  image, 
  size = 'md', 
  status, 
  location,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLocationIcon = (locationType) => {
    switch (locationType?.toLowerCase()) {
      case 'industrial':
        return Factory;
      case 'urban':
        return Building;
      case 'rural':
        return TreePine;
      case 'monitoring':
        return Droplets;
      default:
        return MapPin;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
        return 'ring-green-400 bg-green-50';
      case 'good':
        return 'ring-blue-400 bg-blue-50';
      case 'fair':
        return 'ring-yellow-400 bg-yellow-50';
      case 'poor':
        return 'ring-orange-400 bg-orange-50';
      case 'critical':
        return 'ring-red-400 bg-red-50';
      case 'online':
        return 'ring-green-400 bg-green-50';
      case 'offline':
        return 'ring-gray-400 bg-gray-50';
      default:
        return 'ring-blue-400 bg-blue-50';
    }
  };

  const getGradientBackground = (type, status) => {
    if (type === 'location') {
      switch (status?.toLowerCase()) {
        case 'excellent':
          return 'bg-gradient-to-br from-green-400 to-emerald-500';
        case 'good':
          return 'bg-gradient-to-br from-blue-400 to-cyan-500';
        case 'fair':
          return 'bg-gradient-to-br from-yellow-400 to-amber-500';
        case 'poor':
          return 'bg-gradient-to-br from-orange-400 to-red-500';
        case 'critical':
          return 'bg-gradient-to-br from-red-500 to-pink-600';
        default:
          return 'bg-gradient-to-br from-blue-400 to-indigo-500';
      }
    }
    return 'bg-gradient-to-br from-blue-500 to-indigo-600';
  };

  if (type === 'location') {
    const LocationIcon = getLocationIcon(location?.type);
    
    return (
      <div className={`relative ${className}`}>
        <div 
          className={`
            ${sizeClasses[size]} 
            ${getGradientBackground(type, status)}
            rounded-xl shadow-lg ring-4 ${getStatusColor(status)}
            flex items-center justify-center text-white font-semibold
            transform transition-all duration-300 hover:scale-105 hover:shadow-xl
            group cursor-pointer
          `}
        >
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <LocationIcon className="w-1/2 h-1/2" />
          )}
        </div>
        
        {/* Status indicator */}
        {status && (
          <div className={`
            absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
            ${status === 'excellent' || status === 'good' ? 'bg-green-400' : 
              status === 'fair' ? 'bg-yellow-400' : 
              status === 'poor' ? 'bg-orange-400' : 
              'bg-red-400'}
            animate-pulse
          `} />
        )}
      </div>
    );
  }

  // User avatar
  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${getGradientBackground(type, status)}
          rounded-full shadow-lg ring-4 ${getStatusColor(status)}
          flex items-center justify-center text-white font-semibold
          transform transition-all duration-300 hover:scale-105 hover:shadow-xl
          group cursor-pointer
        `}
      >
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover rounded-full"
          />
        ) : name ? (
          <span className="font-bold">{getInitials(name)}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>
      
      {/* Online status indicator */}
      {status === 'online' && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
};

export default Avatar;