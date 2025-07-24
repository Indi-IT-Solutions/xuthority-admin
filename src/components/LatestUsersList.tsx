import React from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EnhancedLoader } from '@/components/common';
import { getInitials } from '@/utils/getInitials';

interface LatestUsersListProps {
  limit?: number;
  showTitle?: boolean;
}

const LatestUsersList: React.FC<LatestUsersListProps> = ({ 
  limit = 10, 
  showTitle = true 
}) => {
  // Fetch latest users with the specified parameters
  const { data: usersData, isLoading, error } = useUsers({
    page: 1,              // First page
    limit,                // Number of users to fetch
    sortBy: 'createdAt',  // Sort by creation date
    sortOrder: 'desc',    // Descending order (newest first)
    role: 'user',         // Only regular users (not vendors)
  });

  if (isLoading) {
    return <EnhancedLoader loadingText="Loading latest users..." minDisplayTime={800} />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-500 mb-2">Failed to load users</div>
        <div className="text-sm text-gray-500">{error.message}</div>
      </div>
    );
  }

  const users = usersData?.users || [];

  if (users.length === 0) {
    return (
      <div className="text-center p-6">
        <div className="text-gray-500">No users found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {showTitle && (
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Latest Users ({users.length})
        </h2>
      )}
      
      <div className="space-y-4">
        {users.map((user) => (
          <div 
            key={user._id} 
            className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {/* User Avatar */}
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage 
                src={user.userDetails.avatar} 
                alt={user.userDetails.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {getInitials(user.userDetails.name)}
              </AvatarFallback>
            </Avatar>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.userDetails.name}
                </h3>
                <Badge className={`${getStatusColor(user.status)} border-0 text-xs`}>
                  {user.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">
                {user.userDetails.email}
              </p>
              <p className="text-xs text-gray-500">
                Joined: {formatDate(user.joinedOn)}
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-4 text-center">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {user.reviewPosted}
                </div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-600">
                  {user.approved}
                </div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-yellow-600">
                  {user.pending}
                </div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show total if there are more users */}
      {usersData?.pagination && usersData.pagination.total > limit && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Showing {users.length} of {usersData.pagination.total} total users
          </p>
        </div>
      )}
    </div>
  );
};

export default LatestUsersList; 