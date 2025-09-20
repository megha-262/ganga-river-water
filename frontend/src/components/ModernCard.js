import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Avatar from './Avatar';

const ModernCard = ({ 
  title,
  subtitle,
  value,
  trend,
  trendValue,
  avatar,
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  gradient = false,
  hoverable = true
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200',
    danger: 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div 
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${hoverable ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
        rounded-2xl shadow-lg transition-all duration-300 ease-out
        group relative overflow-hidden
        ${className}
      `}
      onClick={onClick}
    >
      {/* Gradient overlay for glass effect */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      )}
      
      {/* Header with avatar and title */}
      {(avatar || title || subtitle) && (
        <div className="mb-4">
          {avatar && (
            <div className="flex justify-center mb-3">
              <Avatar 
                type={avatar.type}
                name={avatar.name}
                image={avatar.image}
                status={avatar.status}
                location={avatar.location}
                size="md"
              />
            </div>
          )}
          <div className="text-center">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 break-words">
                {subtitle}
              </p>
            )}
          </div>
          {onClick && (
            <div className="flex justify-end mt-2">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          )}
        </div>
      )}

      {/* Value and trend */}
      {(value || trend) && (
        <div className="text-center mb-4">
          {value && (
            <div className="text-3xl font-bold text-gray-900 break-words mb-2">
              {value}
            </div>
          )}
          
          {trend && (
            <div className={`flex items-center justify-center space-x-1 ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              {trendValue && (
                <span className="text-sm font-medium break-words">
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom content */}
      {children && (
        <div className="relative z-10 min-w-0 overflow-hidden">
          {children}
        </div>
      )}

      {/* Hover effect overlay */}
      {hoverable && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default ModernCard;