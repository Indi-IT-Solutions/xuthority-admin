import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Star, TrendingUp } from 'lucide-react';
import { StatsCard, TimeFilter, ReviewsTable, DashboardContentSkeleton } from '@/components/common';
import { UserGrowthChart, ReviewsChart } from '@/components/charts';
import { useAnalytics } from '@/hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  // Convert filter to lowercase for API
  const period = useMemo(() => {
    return activeFilter.toLowerCase() as 'weekly' | 'monthly' | 'yearly';
  }, [activeFilter]);

  // Fetch analytics data with time filtering
  const { data: analyticsData, isLoading, error } = useAnalytics(period);

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
    
    return analyticsData.recentReviews.map((review, index) => ({
      id: index + 1, // Use index as ID since ReviewsTable expects number
      _id: review._id, // MongoDB ID for API calls
      reviewer: {
        id: review.reviewer._id || review.reviewer.id || '',
        firstName: review.reviewer.firstName || '',
        lastName: review.reviewer.lastName || '',
        email: review.reviewer.email || '',
        avatar: review.reviewer.avatar || '',
        slug: review.reviewer.slug,
        companyName: review.reviewer.companyName,
        isVerified: review.reviewer.isVerified
      },
      product: {
        id: review.product._id || review.product.id || '',
        name: review.product.name || 'Unknown Product',
        slug: review.product.slug || '',
        logo: review.product.logoUrl || review.product.logo,
        totalReviews: review.product.totalReviews,
        avgRating: review.product.avgRating,
        userId: review.product.userId ? {
          id: review.product.userId._id || review.product.userId.id || '',
          firstName: review.product.userId.firstName || '',
          lastName: review.product.userId.lastName || '',
          email: review.product.userId.email || '',
          avatar: review.product.userId.avatar || '',
          slug: review.product.userId.slug,
          companyName: review.product.userId.companyName
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
              review.status === 'dispute' ? 'Disputed' : 'Rejected') as 'Published' | 'Pending' | 'Disputed'
    }));
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
    console.log('Delete review:', reviewId);
    // Show confirmation dialog and delete review
  };

  const handleApproveReview = (reviewId: string) => {
    console.log('Approve review:', reviewId);
    // Update review status to Published
  };

  const handleRejectReview = (reviewId: string) => {
    console.log('Reject review:', reviewId);
    // Update review status to Rejected
  };

  const handleResolveDispute = (reviewId: string) => {
    console.log('Resolve dispute for review:', reviewId);
    // Update review status to Published/Resolved
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
        <div className="flex justify-start sm:justify-end">
          <TimeFilter 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
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
    </div>
  );
};

export default DashboardPage; 