import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, Star, HelpCircle, User as UserIcon, TwitterIcon, LinkedinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedLoader } from "@/components/common";
import { useUserDetailsBySlug, useUserProfileStatsBySlug, useUserReviewsBySlug, useBlockUser, useUnblockUser } from "@/hooks/useUsers";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

const UserDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | null;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null,
  });

  // Reviews state
  const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
  const [activeReviewTab, setActiveReviewTab] = useState<'all' | 'approved' | 'pending' | 'disputed'>('all');

  const { data: userResponse, isLoading, error } = useUserDetailsBySlug(slug || '');
  const { data: userStatsResponse, isLoading: isStatsLoading } = useUserProfileStatsBySlug(slug || '');
  
  // Get user reviews with pagination and filtering
  const { data: userReviewsResponse, isLoading: isReviewsLoading } = useUserReviewsBySlug(
    slug || '', 
    {
      page: currentReviewsPage,
      limit: 5,
      status: activeReviewTab,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  );

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  if (isLoading) {
    return <EnhancedLoader loadingText="Loading user details..." minDisplayTime={800} />;
  }

  if (error || !userResponse?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const user = userResponse.data;
  const isBlocked = user.status === 'blocked';

  const handleBlockUser = () => {
    setConfirmModal({
      isOpen: true,
      type: 'block',
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  const handleUnblockUser = () => {
    setConfirmModal({
      isOpen: true,
      type: 'unblock',
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.userId || !confirmModal.type) return;

    try {
      if (confirmModal.type === 'block') {
        await blockUserMutation.mutateAsync(confirmModal.userId);
      } else {
        await unblockUserMutation.mutateAsync(confirmModal.userId);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }

    setConfirmModal({ isOpen: false, type: null, userId: null, userName: null });
  };

  const handleReviewTabChange = (tab: 'all' | 'approved' | 'pending' | 'disputed') => {
    setActiveReviewTab(tab);
    setCurrentReviewsPage(1);
  };

  const handleReviewPageChange = (page: number) => {
    setCurrentReviewsPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  };

  const getLoginTypeText = (authProvider: string) => {
    switch (authProvider) {
      case 'google':
        return 'Google';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <button 
            onClick={() => navigate('/users')}
            className="hover:text-gray-800 transition-colors"
          >
            Users Management
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">User Details</span>
        </div>
        
        <Button
          onClick={isBlocked ? handleUnblockUser : handleBlockUser}
          variant={'destructive'}
          className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
          size="sm"
        >
          {isBlocked ? 'Unblock User' : 'Block User'}
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Side - User Avatar & Social */}
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="w-full sm:w-88 h-40 sm:h-48 lg:h-56 bg-gray-900 flex items-center justify-center relative rounded-xl lg:rounded-2xl overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.firstName} ${user.lastName}`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-white text-6xl font-bold">
                  {user.firstName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            
            {/* Social Accounts */}
            <div className="w-full sm:w-80">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Social Accounts</h2>
              <div className="flex gap-3 sm:gap-4">
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin.startsWith('http') ? user.socialLinks.linkedin : `https://linkedin.com/in/${user.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12  bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                  >
           <LinkedinIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </a>
                )}
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter.startsWith('http') ? user.socialLinks.twitter : `https://x.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12  bg-black rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                  >
                 <TwitterIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  </a>
                )}
                {(!user.socialLinks?.linkedin && !user.socialLinks?.twitter) && (
                  <p className="text-gray-500 text-sm">No social accounts available</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - User Details */}
          <div className="flex-1 p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {/* Row 1: Name, Owner Email, Owner Region, Title, Joined On */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Name</label>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{`${user.firstName} ${user.lastName}`}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Email</label>
                <p className="text-sm sm:text-base text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Region</label>
                <p className="text-sm sm:text-base text-gray-900">{user.region || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Title</label>
                <p className="text-sm sm:text-base text-gray-900">{user.title || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Joined On</label>
                <p className="text-sm sm:text-base text-gray-900">{formatDate(user.createdAt)}</p>
              </div>

              {/* Row 2: Company Name, Industry, Company Size, Last Activity, Status */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Name</label>
                <p className="text-sm sm:text-base text-gray-900">{user.companyName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Industry</label>
                <p className="text-sm sm:text-base text-gray-900">{user.industry || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Size</label>
                <p className="text-sm sm:text-base text-gray-900">{user.companySize || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Last Activity</label>
                <p className="text-sm sm:text-base text-gray-900">{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Status</label>
                <Badge className={`${getStatusColor(user.status)} border-0 text-xs sm:text-sm`}>
                  {getStatusText(user.status)}
                </Badge>
              </div>

              {/* Row 3: Review Posted, Approved, Pending, Disputed, Login Type */}
              {!isStatsLoading && userStatsResponse?.success && (
                <>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 block mb-1">Review Posted</label>
                    <p className="text-sm sm:text-base text-gray-900">{userStatsResponse.data.totalReviews || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 block mb-1">Approved</label>
                    <p className="text-sm sm:text-base text-gray-900">{userStatsResponse.data.approved || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 block mb-1">Pending</label>
                    <p className="text-sm sm:text-base text-gray-900">{userStatsResponse.data.pending || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm text-gray-500 block mb-1">Disputed</label>
                    <p className="text-sm sm:text-base text-gray-900">{userStatsResponse.data.disputed || 0}</p>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Login Type</label>
                <p className="text-sm sm:text-base text-gray-900">{getLoginTypeText(user.authProvider || 'email')}</p>
              </div>

              {/* Row 4: Followers, Following */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Followers</label>
                <p className="text-sm sm:text-base text-gray-900">{formatCount(user.followersCount || 0)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Following</label>
                <p className="text-sm sm:text-base text-gray-900">{formatCount(user.followingCount || 0)}</p>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Description</label>
                <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">
                  {user.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 lg:mt-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Reviews</h2>
          
          {/* Review Tabs */}
          <div className="flex justify-between items-center gap-4 my-4">
        <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit">
          {[
              { key: 'all', label: 'All' },
              { key: 'approved', label: 'Approved' },
              { key: 'pending', label: 'Pending' },
              { key: 'disputed', label: 'Disputed' }
            ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleReviewTabChange(tab.key as any)}
              className={`px-3 py-2 md:px-6 md:py-2 text-xs h-10 md:text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
                activeReviewTab === tab.key
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>
         

          {/* Reviews Content */}
          {isReviewsLoading ? (
            <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 min-h-[300px]">
              <div className="text-center">
                <EnhancedLoader loadingText="Loading reviews..." minDisplayTime={800} />
              </div>
            </div>
          ) : userReviewsResponse?.success && userReviewsResponse.data.reviews.length > 0 ? (
            <div className="space-y-4 min-h-[300px]">
              {userReviewsResponse.data.reviews.map((review, index) => (
                <div key={review._id || index} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  {/* Review Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold">
                        {review.product?.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.product?.name || 'Product'}</h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.overallRating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({review.overallRating || 0})</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{formatDate(review.submittedAt || review.createdAt)}</p>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-3">"{review.title}"</h4>
                  )}

                  {/* Review Content */}
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {review.content || review.review || 'No review content available.'}
                  </p>
                </div>
              ))}

              {/* Reviews Pagination */}
              {userReviewsResponse.data.pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewPageChange(currentReviewsPage - 1)}
                      disabled={currentReviewsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {currentReviewsPage} of {userReviewsResponse.data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewPageChange(currentReviewsPage + 1)}
                      disabled={currentReviewsPage === userReviewsResponse.data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 min-h-[300px] flex justify-center items-center">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No Reviews Found</h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  {activeReviewTab === 'all' 
                    ? 'This user has not written any reviews yet.'
                    : `This user has no ${activeReviewTab} reviews.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(isOpen) => !isOpen && setConfirmModal({ isOpen: false, type: null, userId: null, userName: null })}
        onConfirm={handleConfirmAction}
        title={`${confirmModal.type === 'block' ? 'Block' : 'Unblock'} User`}
        description={`Are you sure you want to ${confirmModal.type === 'block' ? 'block' : 'unblock'} "${confirmModal.userName}"? ${confirmModal.type === 'block' ? 'This user will no longer be able to access their account.' : 'This user will regain access to their account.'}`}
        confirmText={confirmModal.type === 'block' ? 'Block' : 'Unblock'}
        cancelText="Cancel"
        isLoading={blockUserMutation.isPending || unblockUserMutation.isPending}
        confirmVariant={confirmModal.type === 'block' ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default UserDetailPage; 