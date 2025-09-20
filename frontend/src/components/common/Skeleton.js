import React from 'react';
import { clsx } from 'clsx';

const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  children,
  ...props 
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: ''
  };

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-lg h-32',
    avatar: 'rounded-full w-10 h-10'
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div
      className={clsx(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

// Skeleton components for common use cases
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        className={index === lines - 1 ? 'w-3/4' : 'w-full'} 
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={clsx('p-4 sm:p-6 border rounded-lg bg-white', className)}>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" className="w-8 h-8 sm:w-10 sm:h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={clsx('space-y-3', className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} variant="text" className="h-5" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" className="h-4" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className = '' }) => (
  <div className={clsx('p-4 sm:p-6 border rounded-lg bg-white', className)}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-1/3 h-6" />
        <Skeleton variant="rectangular" className="w-20 h-8" />
      </div>
      <div className="h-64 sm:h-80 flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonMap = ({ className = '' }) => (
  <div className={clsx('relative bg-gray-100 rounded-lg overflow-hidden', className)}>
    <Skeleton variant="rectangular" className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-gray-400 text-sm sm:text-base">Loading map...</div>
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-4 sm:space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-64 sm:w-80 h-8" />
        <Skeleton variant="text" className="w-48 sm:w-64 h-4" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" className="w-20 h-8" />
        <Skeleton variant="rectangular" className="w-24 h-8" />
      </div>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <SkeletonMap className="h-64 sm:h-96" />
      </div>
      <div>
        <SkeletonCard />
      </div>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>
  </div>
);

export default Skeleton;