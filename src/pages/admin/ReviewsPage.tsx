import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { ReviewsTable, Pagination, ReviewFilter, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { ReviewFilters } from "@/components/common/ReviewFilter";
import { 
  useReviews,
  useAdminReviews,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
  useResolveDispute,
  useBulkDeleteReviews
} from "@/hooks/useReviews";

const ReviewsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "published" | "pending" | "disputed">("all");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState<ReviewFilters>({
    dateFilter: null,
    dateFrom: undefined,
    dateTo: undefined,
    rating: null,
    appliedAt: undefined,
  });

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'delete' | 'resolve' | null;
    reviewId: string | null;
    reviewTitle: string | null;
  }>({
    isOpen: false,
    type: null,
    reviewId: null,
    reviewTitle: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Prepare API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    // Map tab to backend status
    const statusMap: Record<string, string> = {
      all: 'all',
      published: 'approved',
      pending: 'pending',
      disputed: 'dispute',
    };
    params.status = statusMap[activeTab] || activeTab;

    // Add rating filtering
    if (filters.rating !== null && filters.rating !== undefined) {
      params.rating = filters.rating;
    }

    // Add date filtering
    if (filters.dateFilter && filters.dateFilter !== 'custom') {
      params.period = filters.dateFilter;
    } else if (filters.dateFilter === 'custom') {
      if (filters.dateFrom) {
        params.dateFrom = new Date(filters.dateFrom).toISOString();
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setUTCHours(23, 59, 59, 999);
        params.dateTo = endDate.toISOString();
      }
    }

    if (filters.appliedAt) {
      params.appliedAt = filters.appliedAt;
    }

    return params;
  }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, filters]);

  // Fetch reviews from API using admin method that properly handles "all" status
  const { data: reviewsData, isLoading, error, refetch } = useAdminReviews(apiParams);

  // Mutation hooks
  const approveReviewMutation = useApproveReview();
  const rejectReviewMutation = useRejectReview();
  const deleteReviewMutation = useDeleteReview();
  const resolveDisputeMutation = useResolveDispute();
  const bulkDeleteMutation = useBulkDeleteReviews();

  // Get reviews and pagination from API response
  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };

  // Use only API data
  const displayReviews = reviews;
  const totalReviews = pagination.total;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab: "all" | "published" | "pending" | "disputed") => {
    setActiveTab(tab);
    setSelectedReviews([]); // Clear selection when changing tabs
  };

  // Action handlers
  const handleViewDetails = (reviewId: string) => {
    console.log('View details for review:', reviewId);
    // Navigate to review details page
    navigate(`/reviews/${reviewId}`);
  };

  // Helper function to get review title
  const getReviewTitle = (reviewId: string) => {
    const review = displayReviews.find(r => r._id === reviewId);
    return review ? `${review.reviewer.firstName}'s review` : 'Unknown Review';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'approve' | 'reject' | 'delete' | 'resolve', reviewId: string) => {
    const reviewTitle = getReviewTitle(reviewId);
    setConfirmModal({
      isOpen: true,
      type,
      reviewId,
      reviewTitle,
    });
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      reviewId: null,
      reviewTitle: null,
    });
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (!confirmModal.reviewId || !confirmModal.type) return;

    switch (confirmModal.type) {
      case 'approve':
        approveReviewMutation.mutate(confirmModal.reviewId);
        break;
      case 'reject':
        rejectReviewMutation.mutate(confirmModal.reviewId);
        break;
      case 'delete':
        deleteReviewMutation.mutate(confirmModal.reviewId);
        break;
      case 'resolve':
        resolveDisputeMutation.mutate(confirmModal.reviewId);
        break;
    }
    closeConfirmModal();
  };

  const handleApproveReview = (reviewId: string) => {
    openConfirmModal('approve', reviewId);
  };

  const handleRejectReview = (reviewId: string) => {
    openConfirmModal('reject', reviewId);
  };

  const handleDeleteReview = (reviewId: string) => {
    openConfirmModal('delete', reviewId);
  };

  const handleResolveDispute = (reviewId: string) => {
    openConfirmModal('resolve', reviewId);
  };

  const handleSelectedReviewsChange = (selectedIds: string[]) => {
    setSelectedReviews(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log("Bulk delete reviews:", selectedIds);
    const reviewCount = selectedIds.length;
    const confirmed = confirm(
      `Are you sure you want to delete ${reviewCount} selected review${
        reviewCount > 1 ? "s" : ""
      }?`
    );

    if (confirmed) {
      bulkDeleteMutation.mutate(selectedIds);
      setSelectedReviews([]);
    }
  };

  // Confirmation modal content
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'approve':
        return 'Approve Review';
      case 'reject':
        return 'Reject Review';
      case 'delete':
        return 'Delete Review';
      case 'resolve':
        return 'Resolve Dispute';
      default:
        return '';
    }
  };

  const getConfirmationDescription = () => {
    const action = confirmModal.type;
    const title = confirmModal.reviewTitle;
    
    switch (action) {
      case 'approve':
        return `Are you sure you want to approve ${title}? This action will make the review visible to all users.`;
      case 'reject':
        return `Are you sure you want to reject ${title}? This action will prevent the review from being published.`;
      case 'delete':
        return `Are you sure you want to delete ${title}? This action cannot be undone.`;
      case 'resolve':
        return `Are you sure you want to resolve the dispute for ${title}? This will change the status to resolved.`;
      default:
        return '';
    }
  };

  const getConfirmationButtonText = () => {
    switch (confirmModal.type) {
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      case 'delete':
        return 'Delete';
      case 'resolve':
        return 'Resolve';
      default:
        return 'Confirm';
    }
  };

  const getIsLoading = () => {
    switch (confirmModal.type) {
      case 'approve':
        return approveReviewMutation.isPending;
      case 'reject':
        return rejectReviewMutation.isPending;
      case 'delete':
        return deleteReviewMutation.isPending;
      case 'resolve':
        return resolveDisputeMutation.isPending;
      default:
        return false;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Reviews
        </h1>
        {/* Filters */}
        <ReviewFilter
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>

      <div className="flex justify-between items-center gap-4 my-4">
        {/* Tabs */}
        <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit">
          {[
            { key: "all", label: "All" },
            { key: "published", label: "Published" },
            { key: "pending", label: "Pending" },
            { key: "disputed", label: "Disputed" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`px-3 py-2 md:px-6 md:py-2 text-xs h-12 md:text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* //Search Input */}
        <div className="relative flex max-w-md ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
          <Input
            type="text"
            placeholder="Start searching here..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 border h-12 border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:w-96"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} />}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load reviews</p>
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
      {!isLoading && !error && displayReviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery.trim() 
                ? `No reviews match your search "${searchQuery}"`
                : `No ${activeTab === 'all' ? '' : activeTab} reviews available at the moment`
              }
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && displayReviews.length > 0 && (
        <>
          <ReviewsTable
            reviews={displayReviews}
            onViewDetails={handleViewDetails}
            onApproveReview={handleApproveReview}
            onRejectReview={handleRejectReview}
            onDeleteReview={handleDeleteReview}
            onResolveDispute={handleResolveDispute}
            onSelectedReviewsChange={handleSelectedReviewsChange}
            onBulkDelete={handleBulkDelete}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalReviews}
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
        confirmVariant={confirmModal.type === 'delete' || confirmModal.type === 'reject' ? 'destructive' : 'default'}
        isLoading={getIsLoading()}
      />
    </div>
  );
};

export default ReviewsPage; 