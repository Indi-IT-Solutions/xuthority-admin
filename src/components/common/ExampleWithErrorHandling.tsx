import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorState, ErrorBoundary } from '@/components/common';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersTable } from '@/components/common';
import { adminService } from '@/services/adminService';

// Example component demonstrating comprehensive error handling
const ExampleWithErrorHandling: React.FC = () => {
  const queryClient = useQueryClient();
  const { handleApiError, showError } = useErrorHandler();

  // Example: Fetching users with error handling
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => handleApiError(() => adminService.getUsers()),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Example: Mutation with error handling
  const blockUserMutation = useMutation({
    mutationFn: (userId: string) => 
      handleApiError(() => adminService.blockUser(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      // Error is already handled by handleApiError, but you can add custom logic
      console.log('Block user failed:', error);
    }
  });

  const unblockUserMutation = useMutation({
    mutationFn: (userId: string) => 
      handleApiError(() => adminService.unblockUser(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  // Handle user actions with error handling
  const handleBlockUser = async (userId: string) => {
    try {
      await blockUserMutation.mutateAsync(userId);
    } catch (errorDetails) {
      // Error already handled by handleApiError
      console.log('Block user error type:', errorDetails.type);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await unblockUserMutation.mutateAsync(userId);
    } catch (errorDetails) {
      // Error already handled by handleApiError
      console.log('Unblock user error type:', errorDetails.type);
    }
  };

  const handleViewDetails = (userId: string) => {
    // Navigate to user details page
    window.location.href = `/admin/users/${userId}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load users"
        message="Unable to fetch user data. This might be due to a network issue or server problem."
        onRetry={() => refetch()}
        error={error}
        showGoBack={false}
      />
    );
  }

  // Show empty state
  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No users found.</p>
            <Button onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show users table
  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            onViewDetails={handleViewDetails}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
          />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default ExampleWithErrorHandling; 