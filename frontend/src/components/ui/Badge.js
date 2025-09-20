import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-900 hover:bg-red-200",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    success: "bg-green-100 text-green-900 hover:bg-green-200",
    warning: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
    info: "bg-blue-100 text-blue-900 hover:bg-blue-200",
    excellent: "bg-green-100 text-green-900 hover:bg-green-200",
    good: "bg-blue-100 text-blue-900 hover:bg-blue-200",
    fair: "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
    poor: "bg-orange-100 text-orange-900 hover:bg-orange-200",
    critical: "bg-red-100 text-red-900 hover:bg-red-200"
  };

  const sizes = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;