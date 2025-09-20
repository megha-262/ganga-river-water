import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

const Breadcrumb = ({ items = [], className = '' }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', href: '/', icon: Home }];
    
    const routeMap = {
      'alerts': 'Alerts',
      'forecasting': 'Forecasting', 
      'emergency': 'Emergency Response',
      'about': 'About',
      'location': 'Location Details'
    };
    
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        href: path,
        isActive: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();
  
  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs if only one item
  }
  
  return (
    <nav className={clsx('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={item.href || index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1 flex-shrink-0" />
              )}
              
              {isLast || item.isActive ? (
                <span className={clsx(
                  'flex items-center font-medium',
                  isLast ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {Icon && <Icon className="h-4 w-4 mr-1 flex-shrink-0" />}
                  <span className="truncate max-w-32 sm:max-w-none">{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1 flex-shrink-0" />}
                  <span className="truncate max-w-32 sm:max-w-none">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;