import React, { useState } from 'react';
import { Star, MoreHorizontal, Eye, Trash2, Check, X, ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getUserDisplayName, getUserInitials } from '@/utils/userHelpers';

interface Review {
  id: number;
  _id: string; // MongoDB ID for API calls
  reviewer: {
    id: string;
    firstName: string;
    lastName: string; 
    email: string;
    avatar: string;
    slug?: string;
    companyName?: string;
    isVerified?: boolean;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    totalReviews?: number;
    avgRating?: number;
    userId: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar: string;
      slug?: string;
      companyName?: string;
    };
  };
  review: string;
  rating: number;
  comments: number;
  date: string;
  status: 'Published' | 'Pending' | 'Disputed';
}

interface ReviewsTableProps {
  reviews: Review[];
  onViewDetails?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onApproveReview?: (reviewId: string) => void;
  onRejectReview?: (reviewId: string) => void;
  onResolveDispute?: (reviewId: string) => void;
  onSelectedReviewsChange?: (selectedIds: string[]) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
}

interface ActionMenuProps {
  review: Review;
  onViewDetails?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onApproveReview?: (reviewId: string) => void;
  onRejectReview?: (reviewId: string) => void;
  onResolveDispute?: (reviewId: string) => void;
}

const ActionMenu = ({ 
  review, 
  onViewDetails, 
  onDeleteReview, 
  onApproveReview, 
  onRejectReview, 
  onResolveDispute 
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const getActions = () => {
    switch (review.status) {
      case 'Published':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review._id)
          },
          {
            label: 'Delete Review',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => onDeleteReview?.(review._id)
          }
        ];
      case 'Pending':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review._id)
          },
          {
            label: 'Approve',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onApproveReview?.(review._id)
          },
          {
            label: 'Reject',
            icon: X,
            color: 'text-red-600',
            onClick: () => onRejectReview?.(review._id)
          }
        ];
      case 'Disputed':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review._id)
          },
          {
            label: 'Resolve',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onResolveDispute?.(review._id)
          },
          {
            label: 'Delete',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => onDeleteReview?.(review._id)
          }
        ];
      default:
        return [];
    }
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const dropdownHeight = 200; // Approximate height for review actions
      
      let top = rect.bottom + 4; // 4px margin, using viewport coordinates
      let left = rect.right - dropdownWidth; // Align right edge
      
      // Adjust if dropdown would go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if off-screen
      if (left < 10) {
        left = rect.left; // Align to left edge of button
      }
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }
      
      // Adjust vertical position if off-screen
      if (top + dropdownHeight > viewportHeight - 10) {
        top = rect.top - dropdownHeight - 4; // Show above button
      }
      
      setDropdownPosition({ top, left });
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown on scroll
  React.useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        setIsOpen(false);
      };

      const handleResize = () => {
        if (isOpen) {
          updateDropdownPosition();
        }
      };

      // Add scroll listeners to both window and potential scroll containers
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {getActions().map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${action.color} cursor-pointer`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Status badge component
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Published':
      return 'inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap';
    case 'Pending':
      return 'inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap';
    case 'Disputed':
      return 'inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full whitespace-nowrap';
    default:
      return 'inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full whitespace-nowrap';
  }
};

const ReviewsTable = ({
  reviews,
  onViewDetails,
  onDeleteReview,
  onApproveReview,
  onRejectReview,
  onResolveDispute,
  onSelectedReviewsChange,
  onBulkDelete
}: ReviewsTableProps) => {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  const isAllSelected = reviews.length > 0 && selectedReviews.length === reviews.length;
  const isIndeterminate = selectedReviews.length > 0 && selectedReviews.length < reviews.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedReviews([]);
      onSelectedReviewsChange?.([]);
    } else {
      // Select all
      const allIds = reviews.map(review => review._id);
      setSelectedReviews(allIds);
      onSelectedReviewsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectReview = (reviewId: string) => {
    const newSelection = selectedReviews.includes(reviewId)
      ? selectedReviews.filter(id => id !== reviewId)
      : [...selectedReviews, reviewId];
    
    setSelectedReviews(newSelection);
    onSelectedReviewsChange?.(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedReviews.length > 0 && onBulkDelete) {
      onBulkDelete(selectedReviews);
      setSelectedReviews([]);
      onSelectedReviewsChange?.([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-xs md:text-sm font-medium text-blue-800">
            {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
          </span>
          {/* <button
            onClick={handleBulkDelete}
            className="px-3 py-1 md:px-4 md:py-2 bg-red-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 md:space-x-2"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            <span>Delete Selected</span>
          </button> */}
        </div>
      )}
    
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh] relative">
        {reviews.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-sm text-gray-500">
                No reviews available at the moment
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[1400px]">
            {/* Table Header */}
            <thead className="bg-gray-100 rounded-b-2xl">
              <tr>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[120px]">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    {/* <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    /> */}
                    <span>S. No.</span>
                  </div>
                </th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[200px]">Reviewer Details</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[200px]">Vendor Details</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[200px]">Product</th>

                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[300px]">Review</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Comments</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Rating</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {reviews.map((review, index) => (
                  <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* S. No. with checkbox */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <div className="flex items-center space-x-2 md:space-x-3">
                        {/* <input 
                          type="checkbox" 
                          checked={selectedReviews.includes(review._id)}
                          onChange={() => handleSelectReview(review._id)}
                          className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        /> */}
                        <span className="text-xs md:text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                      </div>
                    </td>
        
                    {/* Reviewer Details */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.open(`/public-profile/${review.reviewer.slug}`, '_blank')}>
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage 
                            src={review.reviewer?.avatar || ''} 
                            alt={review.reviewer?.firstName || 'Reviewer'}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                            {getUserInitials(review.reviewer)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName(review.reviewer) || 'Unknown Reviewer'}
                            </span>
                            
                          </div>
                         
                        </div>
                      </div>
                    </td>
        
        
                    {/* Vendor Details */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.open(`/public-profile/${review.product?.userId?.slug}`, '_blank')}>
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage 
                            src={review.product?.userId?.avatar || ''} 
                            alt={review.product?.userId?.firstName || 'Owner'}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-semibold">
                            {getUserInitials(review.product?.userId)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName(review.product?.userId)  || 'Unknown Owner'}
                            </span>
                         
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {review.product?.userId?.email || 'No email'}
                          </div>
                      
                        </div>
                      </div>
                    </td>

                                    {/* Product Details */}
                                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.open(`/product-detail/${review.product?.slug}`, '_blank')}>
                      
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {review.product?.name || 'Unknown Product'}
                            </span>
                          </div>
                          
                        </div>
                      </div>
                    </td>
        
        
                    {/* Review */}
                    <td className="py-3 px-3 md:py-4 md:px-6 max-w-xs">
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-3">
                        {review.review || 'No review content'}
                      </p>
                    </td>
        
                    {/* Comments */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <span className="text-xs md:text-sm text-gray-900 font-medium">{review.comments || 0}</span>
                    </td>
        
                    {/* Rating */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs md:text-sm font-medium">{review.rating || 0}/5</span>
                      </div>
                    </td>
        
                    {/* Date */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{review.date || 'Unknown'}</span>
                    </td>
        
                    {/* Status */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <span className={getStatusBadge(review.status)}>
                        {review.status}
                      </span>
                    </td>
        
                    {/* Actions */}
                    <td className="py-3 px-3 md:py-4 md:px-6">
                      <ActionMenu 
                        review={review}
                        onViewDetails={onViewDetails}
                        onDeleteReview={onDeleteReview}
                        onApproveReview={onApproveReview}
                        onRejectReview={onRejectReview}
                        onResolveDispute={onResolveDispute}
                      />
                                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReviewsTable; 