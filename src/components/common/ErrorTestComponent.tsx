import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ErrorTestComponent: React.FC = () => {
  const triggerJavaScriptError = () => {
    throw new Error('This is a test JavaScript error');
  };

  const triggerPromiseRejection = () => {
    Promise.reject(new Error('This is a test promise rejection'));
  };

  const triggerNetworkError = () => {
    fetch('/api/nonexistent-endpoint')
      .then(response => response.json())
      .catch(error => {
        console.error('Network error:', error);
      });
  };

  const trigger403Error = () => {
    throw new Error('403 Forbidden: Access denied');
  };

  const trigger404Error = () => {
    throw new Error('404 Not Found: Resource not found');
  };

  const trigger500Error = () => {
    throw new Error('500 Internal Server Error: Server error');
  };

  const triggerAuthError = () => {
    throw new Error('401 Unauthorized: Authentication required');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Error Handling Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Click the buttons below to test different types of error handling:
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={triggerJavaScriptError}
            variant="destructive"
            className="w-full"
          >
            Trigger JavaScript Error
          </Button>
          
          <Button
            onClick={triggerPromiseRejection}
            variant="destructive"
            className="w-full"
          >
            Trigger Promise Rejection
          </Button>
          
          <Button
            onClick={triggerNetworkError}
            variant="outline"
            className="w-full"
          >
            Trigger Network Error
          </Button>
          
          <Button
            onClick={trigger403Error}
            variant="outline"
            className="w-full"
          >
            Trigger 403 Error
          </Button>
          
          <Button
            onClick={trigger404Error}
            variant="outline"
            className="w-full"
          >
            Trigger 404 Error
          </Button>
          
          <Button
            onClick={trigger500Error}
            variant="outline"
            className="w-full"
          >
            Trigger 500 Error
          </Button>
          
          <Button
            onClick={triggerAuthError}
            variant="outline"
            className="w-full"
          >
            Trigger Auth Error
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>JavaScript Error:</strong> Tests ErrorBoundary component error handling</li>
            <li>• <strong>Promise Rejection:</strong> Tests GlobalErrorHandler unhandled promise handling</li>
            <li>• <strong>Network Error:</strong> Tests network error handling</li>
            <li>• <strong>HTTP Errors:</strong> Tests different HTTP status code error handling</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorTestComponent; 