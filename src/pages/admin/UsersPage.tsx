import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { UsersTable, Pagination, UserFilter } from "@/components/common";
import { Input } from "@/components/ui/input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  useUsers, 
  useBlockUser, 
  useUnblockUser, 
  useDeleteUser, 
  useVerifyUser,
  useBulkDeleteUsers 
} from "@/hooks/useUsers";
import { TransformedUser } from "@/services/userService";
import { UserFilters } from "@/components/common/UserFilter";

const UsersPage = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState<UserFilters>({
    dateFilter: null,
    dateFrom: undefined,
    dateTo: undefined,
    status: undefined,
    loginType: undefined,
    isVerified: undefined,
    appliedAt: undefined,
  });

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | 'delete' | 'verify' | null;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Prepare API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      role: 'user', // Only get regular users (not vendors)
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    // Add status filtering
    if (filters.status) {
      params.status = filters.status;
    }

    // Add login type filtering
    if (filters.loginType) {
      params.loginType = filters.loginType;
    }

    // Add verification filtering
    if (filters.isVerified !== undefined) {
      params.isVerified = filters.isVerified;
    }

    // Add date filtering
    console.log('🐛 DEBUG - Current filters.dateFilter:', filters.dateFilter);
    console.log('🐛 DEBUG - Full filters object:', filters);
    
    if (filters.dateFilter && filters.dateFilter !== 'custom') {
      console.log('🐛 DEBUG - Using period filter:', filters.dateFilter);
      params.period = filters.dateFilter;
    } else if (filters.dateFilter === 'custom') {
      console.log('🐛 DEBUG - Using custom date range');
      if (filters.dateFrom) {
        params.dateFrom = new Date(filters.dateFrom).toISOString();
        console.log('🐛 DEBUG - Original dateFrom:', filters.dateFrom);
        console.log('🐛 DEBUG - Converted dateFrom:', params.dateFrom);
      }
      if (filters.dateTo) {
        // Set dateTo to end of the selected day to capture the full day
        const endDate = new Date(filters.dateTo);
        endDate.setUTCHours(23, 59, 59, 999);
        params.dateTo = endDate.toISOString();
        console.log('🐛 DEBUG - Original dateTo:', filters.dateTo);
        console.log('🐛 DEBUG - Converted dateTo:', params.dateTo);
      }
    } else {
      console.log('🐛 DEBUG - No date filtering applied');
    }

    // Include appliedAt timestamp to force new API calls even with same filters
    if (filters.appliedAt) {
      params.appliedAt = filters.appliedAt;
    }

    console.log('API Params being sent:', params);
    console.log('Current filters:', filters);
    return params;
  }, [currentPage, itemsPerPage, debouncedSearchQuery, filters]);

  // Fetch users from API
  const { data: usersData, isLoading, error, refetch } = useUsers(apiParams);

  // Mutation hooks
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const deleteUserMutation = useDeleteUser();
  const verifyUserMutation = useVerifyUser();
  const bulkDeleteMutation = useBulkDeleteUsers();

  // Get users and pagination from API response
  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };

  // Use only API data - no fallback to sample data
  const displayUsers = users;
  const totalUsers = pagination.total;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  // Reset to page 1 when debounced search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters]);

  // Action handlers
  const handleViewDetails = (userId: string) => {
    const user = displayUsers.find(u => u._id === userId);
    if (user && user.slug) {
      navigate(`/users/${user.slug}`);
    } else {
      console.error('User slug not found for userId:', userId);
    }
  };

  // Helper function to get user name
  const getUserName = (userId: string) => {
    const user = displayUsers.find(u => u._id === userId);
    return user ? user.userDetails.name : 'Unknown User';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'block' | 'unblock' | 'delete' | 'verify', userId: string) => {
    const userName = getUserName(userId);
    setConfirmModal({
      isOpen: true,
      type,
      userId,
      userName,
    });
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      userId: null,
      userName: null,
    });
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (!confirmModal.userId || !confirmModal.type) return;

    switch (confirmModal.type) {
      case 'block':
        blockUserMutation.mutate(confirmModal.userId);
        break;
      case 'unblock':
        unblockUserMutation.mutate(confirmModal.userId);
        break;
      case 'delete':
        deleteUserMutation.mutate(confirmModal.userId);
        break;
      case 'verify':
        verifyUserMutation.mutate(confirmModal.userId);
        break;
    }
    closeConfirmModal();
  };

  const handleBlockUser = (userId: string) => {
    openConfirmModal('block', userId);
  };

  const handleUnblockUser = (userId: string) => {
    openConfirmModal('unblock', userId);
  };

  const handleDeleteUser = (userId: string) => {
    openConfirmModal('delete', userId);
  };

  const handleVerifyUser = (userId: string) => {
    openConfirmModal('verify', userId);
  };

  const handleSelectedUsersChange = (selectedIds: string[]) => {
    setSelectedUsers(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log("Bulk delete users:", selectedIds);
    const userCount = selectedIds.length;
    const confirmed = confirm(
      `Are you sure you want to delete ${userCount} selected user${
        userCount > 1 ? "s" : ""
      }?`
    );

    if (confirmed) {
      bulkDeleteMutation.mutate(selectedIds);
      setSelectedUsers([]);
    }
  };

  // Helper functions for confirmation modal
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'block':
        return 'Block User';
      case 'unblock':
        return 'Unblock User';
      case 'delete':
        return 'Delete User';
      case 'verify':
        return 'Verify User';
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    const userName = confirmModal.userName || 'this user';
    switch (confirmModal.type) {
      case 'block':
        return `Are you sure you want to block "${userName}"? They will no longer be able to access their account.`;
      case 'unblock':
        return `Are you sure you want to unblock "${userName}"? They will regain access to their account.`;
      case 'delete':
        return `Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`;
      case 'verify':
        return `Are you sure you want to verify "${userName}"? This will mark their account as verified.`;
      default:
        return 'Are you sure you want to proceed with this action?';
    }
  };

  const getConfirmationButtonText = () => {
    switch (confirmModal.type) {
      case 'block':
        return 'Block User';
      case 'unblock':
        return 'Unblock User';
      case 'delete':
        return 'Delete User';
      case 'verify':
        return 'Verify User';
      default:
        return 'Confirm';
    }
  };

  const getIsLoading = () => {
    switch (confirmModal.type) {
      case 'block':
        return blockUserMutation.isPending;
      case 'unblock':
        return unblockUserMutation.isPending;
      case 'delete':
        return deleteUserMutation.isPending;
      case 'verify':
        return verifyUserMutation.isPending;
      default:
        return false;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Users Management
        </h1>
        <div className="flex justify-between items-center gap-4 my-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
          <Input
            type="text"
            placeholder="Start searching here..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border h-12 border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:w-96"
          />
        </div>
         {/* Filters */}
         <UserFilter
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>
      </div>
      
 

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading users...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load users</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery.trim() 
                ? `No users match your search "${searchQuery}"`
                : 'No users available at the moment'
              }
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && displayUsers.length > 0 && (
        <>
          <UsersTable
            users={displayUsers}
            onViewDetails={handleViewDetails}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onDeleteUser={handleDeleteUser}
            onVerifyUser={handleVerifyUser}
            onSelectedUsersChange={handleSelectedUsersChange}
            onBulkDelete={handleBulkDelete}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalUsers}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={getConfirmationTitle()}
        description={getConfirmationDescription()}
        confirmText={getConfirmationButtonText()}
        confirmVariant={confirmModal.type === 'delete' || confirmModal.type === 'block' ? 'destructive' : 'default'}
        isLoading={getIsLoading()}
      />
    </div>
  );
};

export default UsersPage; 