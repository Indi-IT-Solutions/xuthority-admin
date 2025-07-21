import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import useUserStore from '@/store/useUserStore';
import { AuthService } from '@/services/auth';
import LottieLoader from '@/components/LottieLoader';
import { useToast } from '@/hooks/useToast';
import useUIStore from '@/store/useUIStore';
import { useReviewStore } from '@/store/useReviewStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useUserStore();
  const { postLoginAction, clearPostLoginAction } = useUIStore();
  const { setSelectedSoftware, setCurrentStep } = useReviewStore();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const provider = searchParams.get('provider');

        if (error) {
          setError(`Authentication failed: ${error}`);
          toast.auth.error(`Authentication failed: ${error}`);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          toast.auth.error('No authentication token received');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        // First, clear all existing data
        localStorage.clear();
        queryClient.removeQueries();
        queryClient.clear();
        localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');

        // Store the token
        AuthService.tokenStorage.setToken(token);

        // Fetch user profile with the token
        const profileResponse = await AuthService.getProfile();
        
        if (!profileResponse.success || !profileResponse.data) {
          throw new Error(profileResponse.error?.message || 'Failed to fetch user profile');
        }

        // Login the user with the fetched data
        const success = await loginWithToken(profileResponse.data.user, token);
        
        if (success) {
          // Set fresh query data
          queryClient.setQueryData(['user'], profileResponse.data.user);
          queryClient.setQueryData(['profile'], profileResponse.data.user);
          
          toast.dismiss();
          toast.auth.success(`Login successful!`);
          
          // Execute post-login action if exists
          if (postLoginAction?.type === 'navigate-to-write-review') {
            setSelectedSoftware(postLoginAction.payload.software);
            setCurrentStep(postLoginAction.payload.currentStep);
            clearPostLoginAction();
            navigate('/write-review');
          } else {
            // Redirect to dashboard or home
            navigate('/');
          }
        } else {
          throw new Error('Failed to login user');
        }

      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        toast.auth.error(err.message || 'Authentication failed');
        
        // Clear any stored tokens and cache
        localStorage.clear();
        queryClient.removeQueries();
        queryClient.clear();
        localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, queryClient, loginWithToken]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center min-h-[100dvh] text-lg font-semibold">
    <LottieLoader />
  </div>
  );
};

export default AuthCallback; 