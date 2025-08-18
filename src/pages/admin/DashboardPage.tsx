import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Star, TrendingUp } from 'lucide-react';
import { StatsCard, TimeFilter, ReviewsTable, DashboardContentSkeleton } from '@/components/common';
import { UserGrowthChart, ReviewsChart } from '@/components/charts';
import { useAnalytics } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { 
  useApproveReview,
  useRejectReview,
  useDeleteReview,
  useResolveDispute
} from '@/hooks/useReviews';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  // Conve  // Confirmation modal states
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

  // Mutations
  const approveReviewMutation = useApproveReview();
  const rejectReviewMutation = useRejectReview();
  const deleteReviewMutation = useDeleteReview();
  const resolveDisputeMutation = useResolveDispute();
  // Convert filter to lowercase for API
  const period = useMemo(() => {
    return activeFilter.toLowerCase() as 'weekly' | 'monthly' | 'yearly';
  }, [activeFilter]);

  // Fetch analytics data with time filtering
  const { data: analyticsData, isLoading, error, refetch } = useAnalytics(period);

  // Format stats data for the UI
  const stats = useMemo(() => {
    if (!analyticsData?.stats) return [];
    
    return [
      {
        title: 'Total Users',
        value: analyticsData.stats.totalUsers.toLocaleString(),
        icon: Users,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
      },
      {
        title: 'Total Vendors',
        value: analyticsData.stats.totalVendors.toLocaleString(),
        icon: Package,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
      },
      {
        title: 'Total Reviews',
        value: analyticsData.stats.totalReviews.toLocaleString(),
        icon: Star,
        iconColor: 'text-yellow-600',
        iconBgColor: 'bg-yellow-100',
      },
    ];
  }, [analyticsData?.stats]);

  // Format recent reviews data for the UI
  const recentReviews = useMemo(() => {
    if (!analyticsData?.recentReviews) return [];
    
    return analyticsData.recentReviews.map((review: any, index: number) => {
      const [firstName = '', ...restLast] = (review.reviewer?.firstName && review.reviewer?.lastName)
        ? [review.reviewer.firstName, review.reviewer.lastName]
        : (review.reviewer?.name ? review.reviewer.name.split(' ') : ['','']);
      const lastName = restLast.join(' ');
      const vendor = review.product?.userId || {};

      return {
        id: index + 1,
        _id: review._id,
        reviewer: {
          id: vendor?._id || vendor?.id || '',
          firstName,
          lastName,
          email: review.reviewer?.email || '',
          avatar: review.reviewer?.avatar || '',
          slug: review.reviewer?.slug,
          companyName: review.reviewer?.companyName,
          isVerified: review.reviewer?.isVerified
        },
        product: {
          id: review.product?._id || review.product?.id || '',
          name: review.product?.name || 'Unknown Product',
          slug: review.product?.slug || '',
          logo: review.product?.logoUrl,
          totalReviews: review.product?.totalReviews,
          avgRating: review.product?.avgRating,
          userId: vendor?._id || vendor?.id ? {
            id: vendor._id || vendor.id || '',
            firstName: vendor.firstName || '',
            lastName: vendor.lastName || '',
            email: vendor.email || '',
            avatar: vendor.avatar || '',
            slug: vendor.slug,
            companyName: vendor.companyName
          } : {
            id: '',
            firstName: 'Unknown',
            lastName: 'Vendor',
            email: '',
            avatar: '',
            slug: '',
            companyName: ''
          }
        },
        review: review.content || '',
        rating: review.overallRating || 0,
        comments: review.totalReplies || 0,
        date: new Date(review.submittedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }),
        status: (review.status === 'approved' ? 'Published' : 
                review.status === 'pending' ? 'Pending' : 
                review.status === 'dispute' ? 'Disputed' : 'Rejected') as 'Published' | 'Pending' | 'Disputed',
        helpfulVotes: { count: review.helpfulVotes?.count || 0 }
      };
    });
  }, [analyticsData?.recentReviews]);

  // Action handlers for reviews
  const handleSeeAllReviews = () => {
    console.log('Navigate to all reviews');
  };

  const handleViewDetails = (reviewId: string) => {
    console.log('View details for review:', reviewId);
    navigate(`/reviews/${reviewId}`);
    // Navigate to review details page or open modal
  };

  const handleDeleteReview = (reviewId: string) => {
    openConfirmModal('delete', reviewId);
  };

  const handleApproveReview = (reviewId: string) => {
    openConfirmModal('approve', reviewId);
  };

  const handleRejectReview = (reviewId: string) => {
    openConfirmModal('reject', reviewId);
  };

  const handleResolveDispute = (reviewId: string) => {
    openConfirmModal('resolve', reviewId);
  };

  const handleSelectedReviewsChange = (selectedIds: string[]) => {
    setSelectedReviews(selectedIds.map(id => parseInt(id) || 0));
    console.log('Selected reviews:', selectedIds);
    // You can perform bulk actions on selected reviews here
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log('Bulk delete reviews:', selectedIds);
    
    // Show confirmation dialog
    const reviewCount = selectedIds.length;
    const confirmed = confirm(
      `Are you sure you want to delete ${reviewCount} selected review${reviewCount > 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (confirmed) {
      // Perform bulk delete operation
      // In a real app, you would make an API call here
      selectedIds.forEach(id => {
        console.log(`Deleting review with ID: ${id}`);
        // handleDeleteReview(id); // or bulk API call
      });
      
      // Reset selection after successful deletion
      setSelectedReviews([]);
      
      // Show success message
      alert(`Successfully deleted ${reviewCount} review${reviewCount > 1 ? 's' : ''}.`);
      
      // In a real app, you would also:
      // 1. Refresh the reviews list
      // 2. Show a toast notification
      // 3. Update the total review count
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
  // Helper function to get review title
  const getReviewTitle = (reviewId: string) => {
    const review = recentReviews.find((r: any) => r._id === reviewId);
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

  const onSuccess = () => {
    closeConfirmModal();
    // Refresh dashboard analytics and recent reviews after action
    refetch();
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (!confirmModal.reviewId || !confirmModal.type) return;

    switch (confirmModal.type) {
      case 'approve':
        approveReviewMutation.mutate(confirmModal.reviewId, { onSuccess });
        break;
      case 'reject':
        rejectReviewMutation.mutate(confirmModal.reviewId, { onSuccess });
        break;
      case 'delete':
        deleteReviewMutation.mutate(confirmModal.reviewId, { onSuccess });
        break;
      case 'resolve':
        resolveDisputeMutation.mutate(confirmModal.reviewId, { onSuccess });
        break;
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

  // Show loading state
  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load dashboard data
          </h3>
          <p className="text-gray-600">
            {error.message || 'An error occurred while fetching analytics data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Welcome to the Xuthority admin dashboard. Here's an overview of your platform.
          </p>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>

      {/* Charts */}
      <div>
      <div className="flex justify-start sm:justify-end">
          <TimeFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <UserGrowthChart 
          activeFilter={activeFilter} 
          data={analyticsData?.charts?.userGrowth || []}
        />
        <ReviewsChart 
          activeFilter={activeFilter} 
          data={analyticsData?.charts?.reviewTrends || []}
        />
      </div>

      {/* Recent Reviews Table */}
      <ReviewsTable 
        reviews={recentReviews} 
        onViewDetails={handleViewDetails}
        onDeleteReview={handleDeleteReview}
        onApproveReview={handleApproveReview}
        onRejectReview={handleRejectReview}
        onResolveDispute={handleResolveDispute}
        onSelectedReviewsChange={handleSelectedReviewsChange}
        onBulkDelete={handleBulkDelete}
      />
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

export default DashboardPage; 