import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import BadgesTable from "@/components/common/BadgesTable";
import BadgeRequestsTable from "@/components/common/BadgeRequestsTable";
import BadgeRequestDetailsDialog from "@/components/BadgeRequestDetailsDialog";
import { Pagination, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  useBadges, 
  useBadgeRequests,
  useBadgeRequestDetails,
  useUpdateBadgeStatus,
  useDeleteBadge,
  useApproveBadgeRequest,
  useRejectBadgeRequest
} from "@/hooks/useBadges";
import { BadgeParams, BadgeRequestParams } from "@/services/badgeService";

const BadgesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"list" | "request">("list");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Badge Request Details Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'approve' | 'reject' | null;
    badgeId: string | null;
    badgeName: string | null;
  }>({
    isOpen: false,
    type: null,
    badgeId: null,
    badgeName: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Prepare API parameters for badges
  const badgeParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  }), [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Prepare API parameters for badge requests
  const requestParams = useMemo((): BadgeRequestParams => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
    status: 'requested', // Only get pending badge requests
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  }), [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Fetch badges or badge requests based on active tab
  const { data: badgesData, isLoading: isBadgesLoading, error: badgesError, refetch: refetchBadges } = useBadges(
    activeTab === 'list' ? badgeParams : { page: 1, limit: 1 } // Minimal params when not active
  );
  
  const { data: requestsData, isLoading: isRequestsLoading, error: requestsError, refetch: refetchRequests } = useBadgeRequests(
    activeTab === 'request' ? requestParams : { page: 1, limit: 1 } // Minimal params when not active
  );

  // Mutation hooks
  const updateBadgeStatusMutation = useUpdateBadgeStatus();
  const deleteBadgeMutation = useDeleteBadge();
  const approveBadgeRequestMutation = useApproveBadgeRequest();
  const rejectBadgeRequestMutation = useRejectBadgeRequest();

  // Badge request details hook
  const { data: badgeRequestDetails, isLoading: isDetailsLoading } = useBadgeRequestDetails(
    selectedRequestId || ''
  );

  // Get current data based on active tab
  const isLoading = activeTab === 'list' ? isBadgesLoading : isRequestsLoading;
  const error = activeTab === 'list' ? badgesError : requestsError;
  const currentData = activeTab === 'list' ? badgesData : requestsData;
  const displayItems = currentData?.data?.[activeTab === 'list' ? 'badges' : 'badgeRequests'] || [];
  const pagination = currentData?.data?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };
console.log('currentData?.data', currentData?.data)
  // Reset to first page when tab or search changes
  const handleTabChange = (tab: "list" | "request") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when debounced search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Helper function to get badge/request name
  const getItemName = (itemId: string) => {
    const item = displayItems.find((item: any) => item._id === itemId);
    return item ? (activeTab === 'list' ? item.title : item.badge?.title || 'Unknown Badge') : 'Unknown Item';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'delete' | 'approve' | 'reject', itemId: string) => {
    const itemName = getItemName(itemId);
    setConfirmModal({
      isOpen: true,
      type,
      badgeId: itemId,
      badgeName: itemName,
    });
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      badgeId: null,
      badgeName: null,
    });
  };

  // Helper function to close details dialog
  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedRequestId(null);
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (!confirmModal.badgeId || !confirmModal.type) return;

    switch (confirmModal.type) {
      case 'delete':
        deleteBadgeMutation.mutate(confirmModal.badgeId);
        break;
      case 'approve':
        approveBadgeRequestMutation.mutate(confirmModal.badgeId, {
          onSuccess: () => {
            closeDetailsDialog();
          }
        });
        break;
      case 'reject':
        rejectBadgeRequestMutation.mutate({ requestId: confirmModal.badgeId }, {
          onSuccess: () => {
            closeDetailsDialog();
          }
        });
        break;
    }
    closeConfirmModal();
  };

  // Action handlers for badges
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDetailsDialogOpen(true);
  };

  const handleEditBadge = (badgeId: string) => {
    navigate(`/badges/edit/${badgeId}`);
  };

  const handleDeleteBadge = (badgeId: string) => {
    openConfirmModal('delete', badgeId);
  };

  const handleToggleStatus = (badgeId: string, status: 'active' | 'inactive') => {
    updateBadgeStatusMutation.mutate({ badgeId, status });
  };

  const handleSelectedBadgesChange = (selectedIds: string[]) => {
    setSelectedBadges(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log("Bulk delete badges:", selectedIds);
    const badgeCount = selectedIds.length;
    const confirmed = confirm(
      `Are you sure you want to delete ${badgeCount} selected badge${
        badgeCount > 1 ? "s" : ""
      }?`
    );

    if (confirmed) {
      selectedIds.forEach((id) => handleDeleteBadge(id));
      setSelectedBadges([]);
    }
  };

  // Badge request handlers
  const handleApproveRequest = (requestId: string) => {
    openConfirmModal('approve', requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    openConfirmModal('reject', requestId);
  };

  // Get confirmation modal content
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'delete':
        return 'Delete Badge';
      case 'approve':
        return 'Approve Badge Request';
      case 'reject':
        return 'Reject Badge Request';
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    switch (confirmModal.type) {
      case 'delete':
        return `Are you sure you want to delete "${confirmModal.badgeName}"? This action cannot be undone.`;
      case 'approve':
        return `Are you sure you want to approve the badge request for "${confirmModal.badgeName}"?`;
      case 'reject':
        return `Are you sure you want to reject the badge request for "${confirmModal.badgeName}"?`;
      default:
        return 'This action cannot be undone.';
    }
  };

  const getConfirmationButtonText = () => {
    switch (confirmModal.type) {
      case 'delete':
        return 'Delete';
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      default:
        return 'Confirm';
    }
  };

  const getIsLoading = () => {
    switch (confirmModal.type) {
      case 'delete':
        return deleteBadgeMutation.isPending;
      case 'approve':
        return approveBadgeRequestMutation.isPending;
      case 'reject':
        return rejectBadgeRequestMutation.isPending;
      default:
        return false;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Badges
        </h1>
        {/* {activeTab === 'list' && (
          <Button 
            onClick={() => navigate('/badges/add')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer rounded-full"
          >
            <Plus className="w-4 h-4" />
            Add Badge
          </Button>
        )} */}
      </div>

      {/* Tabs and Search */}
      <div className="flex justify-between items-center gap-4 my-4">
        <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit">
          {[
            { key: "list", label: "Badges List" },
            { key: "request", label: "Badges Request" }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleTabChange(filter.key as "list" | "request")}
              className={`px-3 py-2 md:px-6 md:py-2 text-xs h-12 md:text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === filter.key
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Input
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
          <Input
            type="text"
            placeholder="Start searching here..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:w-96"
          />
        </div> */}
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} />}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load {activeTab === 'list' ? 'badges' : 'badge requests'}</p>
            <p className="text-sm mt-1">{(error as any)?.message}</p>
          </div>
          <button 
            onClick={() => activeTab === 'list' ? refetchBadges() : refetchRequests()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'list' ? 'badges' : 'badge requests'} found
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery.trim() 
                ? `No ${activeTab === 'list' ? 'badges' : 'badge requests'} match your search "${searchQuery}"`
                : `No ${activeTab === 'list' ? 'badges' : 'badge requests'} available at the moment`
              }
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && displayItems.length > 0 && (
        <>
          {activeTab === 'list' ? (
            <BadgesTable
              badges={displayItems}
              onViewDetails={handleViewDetails}
              onEditBadge={handleEditBadge}
              onDeleteBadge={handleDeleteBadge}
              onToggleStatus={handleToggleStatus}
              onSelectedBadgesChange={handleSelectedBadgesChange}
              onBulkDelete={handleBulkDelete}
            />
          ) : (
            <BadgeRequestsTable
              badgeRequests={displayItems}
              onViewDetails={handleViewDetails}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={pagination.total}
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
        confirmVariant={confirmModal.type === 'reject' || confirmModal.type === 'delete' ? 'destructive' : 'default'}
        isLoading={getIsLoading()}
      />

      {/* Badge Request Details Dialog */}
      <BadgeRequestDetailsDialog
        isOpen={detailsDialogOpen}
        onOpenChange={closeDetailsDialog}
        badgeRequest={badgeRequestDetails}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        isApprovePending={approveBadgeRequestMutation.isPending}
        isRejectPending={rejectBadgeRequestMutation.isPending}
        isLoading={isDetailsLoading}
      />
    </div>
  );
};

export default BadgesPage; 