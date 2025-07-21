import { useState } from 'react';
import { Star, MoreHorizontal, Eye, Trash2, Check, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';
import StarRating from './StartRating';

interface Review {
  id: number;
  reviewer: {
    name: string;
    avatar: string;
  };
  product: string;
  review: string;
  rating: number;
  date: string;
  status: 'Published' | 'Pending' | 'Dispute';
}

interface ReviewsTableProps {
  reviews: Review[];
  onSeeAll?: () => void;
  onViewDetails?: (reviewId: number) => void;
  onDeleteReview?: (reviewId: number) => void;
  onApproveReview?: (reviewId: number) => void;
  onRejectReview?: (reviewId: number) => void;
  onResolveDispute?: (reviewId: number) => void;
  onSelectedReviewsChange?: (selectedIds: number[]) => void;
  onBulkDelete?: (selectedIds: number[]) => void;
}

interface ActionMenuProps {
  review: Review;
  onViewDetails?: (reviewId: number) => void;
  onDeleteReview?: (reviewId: number) => void;
  onApproveReview?: (reviewId: number) => void;
  onRejectReview?: (reviewId: number) => void;
  onResolveDispute?: (reviewId: number) => void;
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

  const getActions = () => {
    switch (review.status) {
      case 'Published':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review.id)
          },
          {
            label: 'Delete Review',
            icon: Trash2,
            color: 'text-red-600',
            onClick: () => onDeleteReview?.(review.id)
          }
        ];
      case 'Pending':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review.id)
          },
          {
            label: 'Approve',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onApproveReview?.(review.id)
          },
          {
            label: 'Reject',
            icon: X,
            color: 'text-red-600',
            onClick: () => onRejectReview?.(review.id)
          }
        ];
      case 'Dispute':
        return [
          {
            label: 'View Details',
            icon: Eye,
            color: 'text-blue-600',
            onClick: () => onViewDetails?.(review.id)
          },
          {
            label: 'Resolve',
            icon: Check,
            color: 'text-green-600',
            onClick: () => onResolveDispute?.(review.id)
          },
          {
            label: 'Delete',
            icon: X,
            color: 'text-red-600',
            onClick: () => onDeleteReview?.(review.id)
          }
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 md:p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer    "
      >
        <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Icon className={`w-4 h-4 mr-3 ${action.color}`} />
                  <span className="text-gray-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const ReviewsTable = ({ 
  reviews, 
  onSeeAll, 
  onViewDetails, 
  onDeleteReview, 
  onApproveReview, 
  onRejectReview, 
  onResolveDispute,
  onSelectedReviewsChange,
  onBulkDelete 
}: ReviewsTableProps) => {
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium";
    
    switch (status) {
      case 'Published':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'Dispute':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const renderStars = (rating: number) => {
    return <StarRating rating={rating} />
  };

  // Check if all reviews are selected
  const isAllSelected = reviews.length > 0 && selectedReviews.length === reviews.length;
  
  // Check if some reviews are selected (for indeterminate state)
  const isIndeterminate = selectedReviews.length > 0 && selectedReviews.length < reviews.length;

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedReviews([]);
      onSelectedReviewsChange?.([]);
    } else {
      // Select all
      const allIds = reviews.map(review => review.id);
      setSelectedReviews(allIds);
      onSelectedReviewsChange?.(allIds);
    }
  };

  // Handle individual checkbox
  const handleSelectReview = (reviewId: number) => {
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex  justify-between gap-3 p-4 md:p-6 ">
        <div className="flex items-center gap-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Recent Reviews</h3>
          
         
        </div>

 
        <button 
          onClick={onSeeAll}
          className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors self-start sm:self-auto cursor-pointer"
        >
          See All
        </button>
      </div>
    {/* Bulk Delete Button */}
 {selectedReviews.length > 0 && (
<div className='flex items-center gap-2 self-end w-full justify-end  px-4 md:px-6 mb-4 '>

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              Delete ({selectedReviews.length})
            </button>
            </div>
          )}

      {/* Table */}
      <div className="overflow-auto gap-3 mx-4 md:mx-6  rounded-2xl ">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead className="bg-gray-100 rounded-b-2xl ">
            <tr>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600 min-w-[80px]">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>S. No.</span>
                </div>
              </th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Reviewer</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Products</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Review</th>
              <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Ratings</th>
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
                    <input 
                      type="checkbox" 
                      checked={selectedReviews.includes(review.id)}
                      onChange={() => handleSelectReview(review.id)}
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      #{index + 1}
                    </span>
                  </div>
                </td>

                {/* Reviewer */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                      <AvatarImage 
                        src={review.reviewer.avatar} 
                        alt={review.reviewer.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs md:text-sm font-semibold">
                        {getInitials(review.reviewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                      {review.reviewer.name}
                    </span>
                  </div>
                </td>

                {/* Products */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-900">{review.product}</span>
                </td>

                {/* Review */}
                <td className="py-3 px-3 md:py-4 md:px-6 max-w-xs">
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    "{review.review}"
                  </p>
                </td>

                {/* Ratings */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </td>

                {/* Date */}
                <td className="py-3 px-3 md:py-4 md:px-6">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">{review.date}</span>
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
      </div>
    </div>
  );
};

export default ReviewsTable; 