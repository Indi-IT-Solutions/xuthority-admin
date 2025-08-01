import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'auth' | 'permission' | 'notFound' | 'server' | 'unknown';
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message or properties
    let errorType: State['errorType'] = 'unknown';
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorType = 'permission';
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorType = 'notFound';
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorType = 'auth';
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      errorType = 'server';
    } else if (error.message.includes('Network') || error.message.includes('fetch')) {
      errorType = 'network';
    }

    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console for debugging
    console.group('Error Boundary Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    });
  };

  handleGoHome = () => {
    window.location.href = '/admin/dashboard';
  };

  handleGoBack = () => {
    window.history.back();
  };

  getErrorContent = () => {
    const { errorType, error } = this.state;

    const errorConfigs = {
      permission: {
        icon: Shield,
        title: 'Access Denied',
        message: 'You don\'t have permission to access this resource.',
        description: 'Please contact your administrator if you believe this is an error.',
        actions: [
          { label: 'Go Back', onClick: this.handleGoBack, variant: 'outline' as const },
          { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'default' as const }
        ]
      },
      auth: {
        icon: Shield,
        title: 'Authentication Required',
        message: 'You need to be logged in to access this resource.',
        description: 'Please log in to continue.',
        actions: [
          { label: 'Go Back', onClick: this.handleGoBack, variant: 'outline' as const },
          { label: 'Login', onClick: () => window.location.href = '/admin/login', variant: 'default' as const }
        ]
      },
      notFound: {
        icon: AlertTriangle,
        title: 'Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist.',
        description: 'Check the URL or navigate to a different page.',
        actions: [
          { label: 'Go Back', onClick: this.handleGoBack, variant: 'outline' as const },
          { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'default' as const }
        ]
      },
      server: {
        icon: Bug,
        title: 'Server Error',
        message: 'Something went wrong on our end.',
        description: 'We\'re working to fix this issue. Please try again later.',
        actions: [
          { label: 'Try Again', onClick: this.handleRetry, variant: 'default' as const },
          { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'outline' as const }
        ]
      },
      network: {
        icon: Zap,
        title: 'Network Error',
        message: 'Unable to connect to the server.',
        description: 'Please check your internet connection and try again.',
        actions: [
          { label: 'Try Again', onClick: this.handleRetry, variant: 'default' as const },
          { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'outline' as const }
        ]
      },
      unknown: {
        icon: AlertTriangle,
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred.',
        description: 'Please try refreshing the page or contact support if the problem persists.',
        actions: [
          { label: 'Try Again', onClick: this.handleRetry, variant: 'default' as const },
          { label: 'Go to Dashboard', onClick: this.handleGoHome, variant: 'outline' as const }
        ]
      }
    };

    const config = errorConfigs[errorType];
    const IconComponent = config.icon;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <IconComponent className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 font-medium">
              {config.message}
            </p>
            <p className="text-sm text-gray-500">
              {config.description}
            </p>
            
            {/* Error details for developers */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {config.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  className="flex-1"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default error UI
      return this.getErrorContent();
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 