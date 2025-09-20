import React from 'react';
import { cn } from '../../utils/cn';

const Skeleton = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

export default Skeleton;