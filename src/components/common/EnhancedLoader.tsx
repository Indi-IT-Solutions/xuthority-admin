import React from 'react';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';
import LottieLoader from './LottiLoader';
import { cn } from '@/lib/utils';

interface EnhancedLoaderProps {
  isLoading?: boolean;
  minDisplayTime?: number;
  className?: string;
  children?: React.ReactNode;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'fullscreen' | 'inline' | 'overlay';
  showText?: boolean;
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
  xl: { width: 120, height: 120 },
};

const EnhancedLoader: React.FC<EnhancedLoaderProps> = ({
  isLoading = true,
  minDisplayTime = 800,
  className = '',
  children,
  loadingText = '',
  size = 'lg',
  variant = 'fullscreen',
  showText = false,
}) => {
  const shouldShowLoader = useMinimumLoadingTime(isLoading, {
    minDisplayTime,
    enabled: true,
  });

  // If not loading and minimum time has passed, show children
  if (!shouldShowLoader && children) {
    return <>{children}</>;
  }

  // If not loading and no children, show nothing
  if (!shouldShowLoader) {
    return null;
  }

  const loaderStyle = sizeMap[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fadeIn">
      <LottieLoader style={loaderStyle} />
      {showText && loadingText && (
        <div className="text-center space-y-2 hidden">
          <p className="text-gray-600 font-medium text-sm md:text-base animate-pulse">
            {loadingText}
          </p>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );

  // Fullscreen loader (default for route loading)
  if (variant === 'fullscreen') {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        className
      )}>
        {loaderContent}
      </div>
    );
  }

  // Overlay loader (covers parent container)
  if (variant === 'overlay') {
    return (
      <div className={cn(
        'absolute inset-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        className
      )}>
        {loaderContent}
      </div>
    );
  }

  // Inline loader (fits within content flow)
  return (
    <div className={cn(
      'w-full flex items-center justify-center py-8 px-4',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      {loaderContent}
    </div>
  );
};

// Default fullscreen loader for route transitions
export const RouteLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <EnhancedLoader
    variant="fullscreen"
    size="lg"
    showText={true}
    loadingText={text}
    minDisplayTime={600}
  />
);

// Suspense fallback with minimum display time
export const SuspenseLoader: React.FC<{ text?: string; minTime?: number }> = ({ 
  text = 'Loading...', 
  minTime = 800 
}) => (
  <EnhancedLoader
    variant="fullscreen"
    size="lg"
    showText={true}
    loadingText={text}
    minDisplayTime={minTime}
  />
);

export default EnhancedLoader; 