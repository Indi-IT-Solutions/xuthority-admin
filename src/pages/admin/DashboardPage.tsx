import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Star, TrendingUp } from 'lucide-react';
import { StatsCard, TimeFilter, ReviewsTable } from '@/components/common';
import { UserGrowthChart, ReviewsChart } from '@/components/charts';

const DashboardPage = () => {
  const [activeFilter, setActiveFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: 'Total Users',
      value: '10,340',
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
    },
    {
      title: 'Total Vendors',
      value: '234',
      icon: Package,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
    },
    {
      title: 'Total Reviews',
      value: '15,256',
      icon: Star,
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
    },
  ];

  // Sample reviews data matching the image
  const sampleReviews = [
    {
      id: 1,
      reviewer: {
        name: 'Regina Pacheco',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2496d1c?w=100&h=100&fit=crop&crop=face'
      },
      product: 'Freshbook',
      review: 'Super intuitive and easy to manage invoices...',
      rating: 5,
      date: 'Jul 10, 2025',
      status: 'Published' as const
    },
    {
      id: 2,
      reviewer: {
        name: 'Dave Stewart',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      product: 'ZenHR',
      review: 'A bit clunky on mobile, but great on desktop.',
      rating: 4,
      date: 'Jul 05, 2025',
      status: 'Pending' as const
    },
    {
      id: 3,
      reviewer: {
        name: 'Daniel King',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      product: 'Notion',
      review: 'Fast onboarding, excellent support team.',
      rating: 2,
      date: 'Jun 27, 2025',
      status: 'Dispute' as const
    },
    {
      id: 4,
      reviewer: {
        name: 'Dorothy Miller',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      product: 'Build Smart',
      review: 'Buggy interface. Support didn\'t help.',
      rating: 4,
      date: 'Jun 18, 2025',
      status: 'Published' as const
    },
    {
      id: 5,
      reviewer: {
        name: 'Laila Faheem',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
      },
      product: 'ZenHR',
      review: 'A bit clunky on mobile, but great on desktop.',
      rating: 3,
      date: 'Jun 16, 2025',
      status: 'Pending' as const
    }
  ];

  // Action handlers for reviews
  const handleSeeAllReviews = () => {
    console.log('Navigate to all reviews');
  };

  const handleViewDetails = (reviewId: number) => {
    console.log('View details for review:', reviewId);
    // Navigate to review details page or open modal
  };

  const handleDeleteReview = (reviewId: number) => {
    console.log('Delete review:', reviewId);
    // Show confirmation dialog and delete review
  };

  const handleApproveReview = (reviewId: number) => {
    console.log('Approve review:', reviewId);
    // Update review status to Published
  };

  const handleRejectReview = (reviewId: number) => {
    console.log('Reject review:', reviewId);
    // Update review status to Rejected
  };

  const handleResolveDispute = (reviewId: number) => {
    console.log('Resolve dispute for review:', reviewId);
    // Update review status to Published/Resolved
  };

  const handleSelectedReviewsChange = (selectedIds: number[]) => {
    setSelectedReviews(selectedIds);
    console.log('Selected reviews:', selectedIds);
    // You can perform bulk actions on selected reviews here
  };

  const handleBulkDelete = (selectedIds: number[]) => {
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
        <UserGrowthChart activeFilter={activeFilter} />
        <ReviewsChart activeFilter={activeFilter} />
      </div>



      {/* Recent Reviews Table */}
      <ReviewsTable 
        reviews={sampleReviews} 
        onSeeAll={handleSeeAllReviews}
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