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
    <nav className={clsx('flex items-center space-x-1 text-sm bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-200/50', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={item.href || index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
              )}
              
              {isLast || item.isActive ? (
                <span className={clsx(
                  'flex items-center font-semibold',
                  isLast ? 'text-gray-700 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent' : 'text-gray-500'
                )}>
                  {Icon && <Icon className={clsx('h-4 w-4 mr-2 flex-shrink-0', isLast ? 'text-blue-600' : '')} />}
                  <span className="truncate max-w-[150px] sm:max-w-none">{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 rounded-md px-2 py-1 group"
                >
                  {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />}
                  <span className="truncate max-w-[100px] sm:max-w-none font-medium">{item.label}</span>
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