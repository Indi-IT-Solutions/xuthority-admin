import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Trash2, ExternalLink, Calendar, User2, Briefcase, Building2, Building2Icon, Check, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EnhancedLoader, ReviewCardSkeleton } from "@/components/common";
import { useReview, useDeleteReview, useApproveReview, useRejectReview } from "@/hooks/useReviews";
import { useDisputeByReviewId, useResolveDispute } from "@/hooks/useDisputes";
import { AdminAuthService } from "@/services/adminAuthService";
import useAdminStore from "@/store/useAdminStore";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import MediaPreviewModal from "@/components/ui/MediaPreviewModal";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/utils/getInitials";
import { getUserDisplayName, getUserInitials } from "@/utils/userHelpers";
import StarRating from "@/components/ui/StarRating";
import { getAssetPath } from "@/config/assets";

interface SubRating {
  label: string;
  value: number;
  maxValue: number;
}

const ReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isLoggedIn } = useAdminStore();

  // Debug authentication
  console.log('🔐 Admin Auth Debug:', {
    isLoggedIn,
    hasUser: !!user,
    hasToken: !!token,
    tokenFromStorage: !!AdminAuthService.getToken(),
    userRole: user?.role
  });

  const [confirmActionState, setConfirmActionState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'resolve' | 'delete' | null;
  }>({
    isOpen: false,
    type: null,
  });

  const [previewState, setPreviewState] = useState({
    isOpen: false,
    currentIndex: 0,
  });

  const { data: review, isLoading, error } = useReview(id || '');
  console.log('review', review)
  const { data: dispute, isLoading: disputeLoading } = useDisputeByReviewId(review?._id || '', !!review && review.status === 'dispute');
  const deleteReviewMutation = useDeleteReview();
  const approveReviewMutation = useApproveReview();
  const rejectReviewMutation = useRejectReview();
  const resolveDisputeMutation = useResolveDispute(id);

  if (isLoading) {
    return <ReviewCardSkeleton />;
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Review Not Found</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">The review you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/reviews')} className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteReview = () => {
    setConfirmActionState({ isOpen: true, type: 'delete' });
  };



  const handleApproveReview = () => {
    setConfirmActionState({ isOpen: true, type: 'approve' });
  };

  const handleRejectReview = () => {
    setConfirmActionState({ isOpen: true, type: 'reject' });
  };

  const handleResolveDispute = () => {
    setConfirmActionState({ isOpen: true, type: 'resolve' });
  };

  const handleConfirmAction = () => {
    if (!confirmActionState.type) return;

    if (confirmActionState.type === 'approve') {
      approveReviewMutation.mutate(review._id, {
        onSuccess: () => {
          setConfirmActionState({ isOpen: false, type: null });
        }
      });
    } else if (confirmActionState.type === 'reject') {
      rejectReviewMutation.mutate(review._id, {
        onSuccess: () => {
          setConfirmActionState({ isOpen: false, type: null });
        }
      });
    } else if (confirmActionState.type === 'resolve' && dispute) {
      resolveDisputeMutation.mutate(dispute._id, {
        onSuccess: () => {
          setConfirmActionState({ isOpen: false, type: null });
        }
      });
    } else if (confirmActionState.type === 'delete') {
      deleteReviewMutation.mutate(review._id, {
        onSuccess: () => {
          setConfirmActionState({ isOpen: false, type: null });
          navigate('/reviews');
        }
      });
    }
  };

  const closeConfirmAction = () => {
    setConfirmActionState({ isOpen: false, type: null });
  };

  const openPreview = (index: number = 0) => {
    setPreviewState({ isOpen: true, currentIndex: index });
  };

  const closePreview = () => {
    setPreviewState({ isOpen: false, currentIndex: 0 });
  };

  // Attachment URLs for preview modal
  // Backend uses metaData for attachments on ProductReview
  const attachmentUrls = ((review as any)?.metaData?.attachments || [])
    .map((attachment: any) => attachment?.fileUrl)
    .filter(Boolean);

  const goToNext = () => {
    const total = attachmentUrls.length;
    if (total === 0) return;
    setPreviewState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % total,
    }));
  };

  const goToPrevious = () => {
    const total = attachmentUrls.length;
    if (total === 0) return;
    setPreviewState(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + total) % total,
    }));
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { className: 'bg-green-100 text-green-800', label: 'Published' };
      case 'pending':
        return { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'dispute':
        return { className: 'bg-red-100 text-red-800', label: 'Disputed' };
      default:
        return { className: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const statusBadge = getStatusBadge(review.status);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  // Get dispute reason display text
  const getDisputeReasonText = (reason: string) => {
    const reasonMap: Record<string, string> = {
      'false-or-misleading-information': 'False or Misleading Information',
      'spam-or-fake-review': 'Spam or Fake Review',
      'inappropriate-content': 'Inappropriate Content',
      'conflict-of-interest': 'Conflict of Interest',
      'other': 'Other'
    };
    return reasonMap[reason] || reason;
  };

  // Get reviewer display name
  const reviewerName = getUserDisplayName(review.reviewer);
  
  // Get reviewer email
  const reviewerEmail = review.reviewer?.email || '';

  // Format review date
  const reviewDate = formatDate(review.submittedAt || review.createdAt);

  // Get product rating info
  const productRating = review.product?.avgRating || 0;
  const productTotalReviews = review.product?.totalReviews || 0;

  // Sub-ratings data from API
  const subRatings: SubRating[] = [];
  if (review.subRatings) {
    const subRatingLabels = {
      easeOfUse: 'Ease of Use',
      customerSupport: 'Customer Support', 
      features: 'Features',
      pricing: 'Pricing',
      technicalSupport: 'Technical Support'
    };

    Object.entries(subRatingLabels).forEach(([key, label]) => {
      const value = review.subRatings[key] || 0;
      subRatings.push({
        label,
        value,
        maxValue: 7
      });
    });
  }

  // Get verification method
  const getVerificationMethod = () => {
    if (review.verification?.verificationType) {
      const typeMap = {
        'company_email': 'Company Email',
        'linkedin': 'LinkedIn',
        'vendor_invite': 'Vendor Invite',
        'screenshot': 'Screenshot'
      };
      return typeMap[review.verification.verificationType] || review.verification.verificationType;
    }
    return 'Not Verified';
  };

  // Check review status
  const isPending = review.status === 'pending';
  const isDisputed = review.status === 'dispute';
console.log('isDisputed', dispute)
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Breadcrumb */}
      
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center text-xs sm:text-sm text-gray-600">
        <button 
            onClick={() => navigate('/reviews')}
            className="hover:text-gray-800 transition-colors cursor-pointer"
          >
            Reviews
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-none">
            {reviewerName}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
          {isPending && (
            <>
              <Button
                onClick={handleRejectReview}
                variant="destructive"
                className="rounded-full text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white h-10"
                size="sm"
                disabled={rejectReviewMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
              
              <Button
                onClick={handleApproveReview}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto h-10"
                size="sm"
                disabled={approveReviewMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </>
          )}

          {isDisputed && dispute && (
            <>
              <Button
                onClick={handleDeleteReview}
                variant="destructive"
                className="rounded-full text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto h-10 bg-red-600 hover:bg-red-500 text-white"
                size="sm"
                disabled={deleteReviewMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Review
              </Button>
              
              <Button
                onClick={handleResolveDispute}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto h-10"
                size="sm"
                disabled={resolveDisputeMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" />
                Resolve
              </Button>
            </>
          )}
          
          {!isPending && !isDisputed && (
            <Button
              onClick={handleDeleteReview}
              variant={'destructive'}
              className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 w-full sm:w-auto h-10"
              size="sm"
              disabled={deleteReviewMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Review
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ">
        {/* Header Section - Reviewer Info */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 sm:gap-4">
          {/* Reviewer Info */}
          <div className="flex items-center col-span-2 space-x-3 sm:space-x-4 lg:border-r lg:border-gray-200 lg:pr-4 pb-4 lg:pb-0 border-b lg:border-b-0 border-gray-200">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <AvatarImage 
                src={review.reviewer?.avatar || ''} 
                alt={review.reviewer?.firstName || 'Reviewer'}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm sm:text-lg font-semibold">
                {getUserInitials(review.reviewer)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {reviewerName}
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm truncate">{reviewerEmail}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center col-span-2 space-x-3 sm:space-x-4 lg:border-r lg:border-gray-200 lg:pr-4 pb-4 lg:pb-0 border-b lg:border-b-0 border-gray-200">
            <div className="text-gray-400 bg-gray-100 p-2 rounded-full flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-gray-900">Date</span>
              <span className="text-xs sm:text-sm text-gray-600">{reviewDate}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center col-span-2 space-x-3 sm:space-x-4 lg:border-r lg:border-gray-200 lg:pr-4 pb-4 lg:pb-0 border-b lg:border-b-0 border-gray-200">
            <div className="text-gray-400 bg-gray-100 p-2 rounded-full flex-shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                ({productTotalReviews}) {review.overallRating} out of 5
              </span>
              <div className="mt-1">
                <StarRating rating={review.overallRating} />
              </div>
            </div>
          </div>

          {/* Status - Full width on mobile, spans 2 columns on large screens */}
          <div className="flex justify-start items-center lg:col-span-2">
            <Badge className={`${statusBadge.className} px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-full`}>
              {statusBadge.label}
            </Badge>
          </div>
        </div>

 <hr className="mb-4 sm:mb-6 mt-6 sm:mt-8"/>
        {/* Product Section */}
        <div className=" ">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Product</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Product Logo */}
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 rounded-md text-white flex-shrink-0 flex  justify-center items-center" style={{backgroundColor: review.product?.brandColors || '#6366f1'}}>
                <AvatarImage src={review.product?.logoUrl} alt={review.product?.name} className="object-cover h-12 w-12 rounded-md"/>
                <AvatarFallback>
                  {review.product?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              {/* Product Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight capitalize truncate">
                  {review.product?.name || 'Unknown Product'}
                </span>
                <div className="flex items-center mt-1">
                  <StarRating rating={productRating} />
                  <span className="text-sm sm:text-md font-medium text-gray-900 ml-2 truncate">
                    ({productTotalReviews}) {productRating} out of 5
                  </span>
                </div>
              </div>
            </div>
            
            {/* Details - Stack vertically on smaller screens */}
            <div className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-md mt-3 sm:mt-0 sm:min-w-0 sm:flex-1">
              {review.reviewer?.title && (
                <div className="flex items-center gap-1 min-w-0">
                  <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 font-semibold flex-shrink-0">Title:</span>
                  <span className="text-gray-500 truncate">{review.reviewer.title}</span>
                </div>
              )}
              {review.reviewer?.industry && (
                <div className="flex items-center gap-1 min-w-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 font-semibold flex-shrink-0">Industry:</span>
                  <span className="text-gray-500 truncate">{typeof review.reviewer.industry === 'object' ? review.reviewer.industry?.name : review.reviewer.industry}</span>
                </div>
              )}
              {review.reviewer?.companySize && (
                <div className="flex items-center gap-1 min-w-0">
                  <Building2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 font-semibold flex-shrink-0">Company Size:</span>
                  <span className="text-gray-500 truncate">{review.reviewer.companySize}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <hr className="mb-4 sm:mb-6 mt-6 sm:mt-8"/>
        {/* What's Included */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Rating Review</h3>
        </div>

        {/* Review Content */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
            "{review.title}"
          </h3>
          <div className="mb-2">
            <StarRating rating={review.overallRating} size="lg"/>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {review.content}
          </p>
        </div>

        {/* Sub Ratings - only show if there are sub ratings */}
        {subRatings.length > 0 && subRatings.some(rating => rating.value > 0) && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Sub Ratings</h3>
            <div className="flex flex-wrap gap-3 sm:gap-6">
              {subRatings.map((rating, index) => (
                <div key={index} className="flex items-center bg-blue-100/50 rounded-full p-2 flex-row-reverse gap-2">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-blue-500`}>
                    {rating.value === 0 ? 'N/A' : rating.value}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600">{rating.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Method */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Verification Method</h3>
          <Badge className="px-3 py-2 text-xs sm:text-sm font-medium bg-blue-100/50 h-8 sm:h-10 text-gray-600">
            {getVerificationMethod()}
          </Badge>

        </div>

      {/* Show screenshot if verificationType is screenshot */}
      {review.verification?.verificationType === "screenshot" && review.verification?.verificationData?.screenshot && (
    <div className="mt-4 relative inline-block">
      <img
        src={review.verification?.verificationData.screenshot}
        alt="Verification Screenshot"
        className="max-w-xs rounded border border-gray-200 shadow h-40 w-40 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => openPreview(0)}
      />
      {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg opacity-80" />
      </div> */}
    </div>
  )}
  {/* LinkedIn Verification */}
  {review.verification?.verificationType === "linkedin" && review.verification?.verificationData && (
  <div className="mt-4 flex  gap-2 items-center">
    <div className="flex items-center gap-2">
      {/* <a
        // href={review.verification.verificationData.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 underline break-all"
      > */}
     <img src={getAssetPath('icons/linkedin.svg')} alt="LinkedIn" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10" />

      {/* </a> */}
    </div>
 <div  className="text-sm">
 <div>
      <span className="font-semibold">Name:</span>{" "}
      {review.verification.verificationData.firstName} {review.verification.verificationData.lastName}
    </div>
    <div>
      <span className="font-semibold">Email:</span>{" "}
      {review.verification.verificationData.email}
    </div>
    </div>
  
  </div>
)}
  {/* Company Email Verification */}
  {review.verification?.verificationType === "company_email" && review.verification?.verificationData && (
  <div className="mt-4 flex flex-col gap-2 text-sm">
   {review?.verification?.verificationData?.companyName && <div>
      <span className="font-semibold">Company Name:</span>{" "}
      {review.verification.verificationData.companyName}
    </div>}
    <div>
      <span className="font-semibold">Company Email:</span>{" "}
      {review.verification.verificationData.companyEmail}
    </div>
  </div>
)}
    {(attachmentUrls.length > 0) && <div className="flex flex-col gap-2 mt-4">
      <div className="flex flex-col">
        <span className="font-semibold">Attachments:</span>
      </div>
  <div className="flex gap-2">
  {(attachmentUrls || []).map((url:string,index:number)=>(
    <div className="inline-block" key={index}>
      <img src={url}
        alt="Verification Screenshot"
        className="max-w-xs rounded border border-gray-200 shadow h-40 w-50 cursor-pointer hover:opacity-90 transition-opacity object-cover"
        onClick={() => openPreview(index)}
      />
 
      </div>
  ))}
  </div>
    </div>}
        {/* Dispute Section - Only show if review is disputed and dispute data is available */}
        {isDisputed && dispute && (
          <div className="mt-6 sm:mt-8 p-0 sm:p-0 bg-white border-none rounded-none">
            <h3 className="text-base font-semibold mb-4 text-black">Dispute</h3>
            
            <div className="flex items-start gap-3 mb-2">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage 
                  src={""} 
                  alt={`${dispute.vendor.firstName} ${dispute.vendor.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-base font-semibold">
                  {dispute.vendor.firstName?.charAt(0)}{dispute.vendor.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] text-black leading-tight">
                  {dispute.vendor.firstName} {dispute.vendor.lastName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {dispute.vendor.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1 mt-2">
              <span className="font-medium text-[15px] text-black">
                {getDisputeReasonText(dispute.reason)}
              </span>
              <Badge className="bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded">
                {dispute.status === 'active' ? 'Active' : 'Resolved'}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {formatDate(dispute.createdAt)}
            </div>

            <div className="text-[13px] text-gray-700 leading-relaxed">
              {/* Only show the description if it's not the default for this reason */}
              {dispute.reason === 'false-or-misleading-information' ? (
                <>
                  <div>
                    The review contains inaccurate or misleading statements that do not reflect the actual functionality, features, or performance of the product. This may include:
                  </div>
                  <ul className="mt-2 list-disc list-inside text-[13px] text-gray-700 space-y-0.5">
                    <li>Claims that misrepresent the product's capabilities or limitations.</li>
                    <li>Statements that conflict with verified specifications or documentation.</li>
                  </ul>
                </>
              ) : (
                <p>{dispute.description}</p>
              )}
            </div>
            {dispute?.explanations?.length>0 && (
        <div className='mt-4'>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Explanation</h3>
          <div className="mt-2 flex justify-between items-start text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-20 gap-4">
            <p className="0">
              {dispute?.explanations[0]?.content}
            </p>
           
          </div>
        </div>
      )}
          </div>
        )}
      </div>

      {/* Approve/Reject/Resolve/Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmActionState.isOpen}
        onOpenChange={closeConfirmAction}
        onConfirm={handleConfirmAction}
        title={
          confirmActionState.type === 'approve' ? 'Approve Review' : 
          confirmActionState.type === 'reject' ? 'Reject Review' : 
          confirmActionState.type === 'resolve' ? 'Resolve Dispute' :
          'Delete Review'
        }
        description={
          confirmActionState.type === 'approve' 
            ? `Are you sure you want to approve "${review.title}"? This will make the review visible to all users.`
            : confirmActionState.type === 'reject'
            ? `Are you sure you want to reject "${review.title}"? This will prevent the review from being published.`
            : confirmActionState.type === 'resolve'
            ? `Are you sure you want to resolve this dispute? This will approve the review and make it visible to all users.`
            : `Are you sure you want to delete "${review.title}"? This action cannot be undone.`
        }
        confirmText={
          confirmActionState.type === 'approve' ? 'Approve' : 
          confirmActionState.type === 'reject' ? 'Reject' : 
          confirmActionState.type === 'resolve' ? 'Resolve' :
          'Delete'
        }
        cancelText="Cancel"
        confirmVariant={confirmActionState.type === 'reject' || confirmActionState.type === 'delete' ? 'destructive' : 'default'}
        isLoading={
          confirmActionState.type === 'approve' 
            ? approveReviewMutation.isPending 
            : confirmActionState.type === 'reject'
            ? rejectReviewMutation.isPending
            : confirmActionState.type === 'resolve'
            ? resolveDisputeMutation.isPending
            : deleteReviewMutation.isPending
        }
      />

      {/* Media Preview Modal for attachments */}
      {previewState.isOpen && attachmentUrls.length > 0 && (
        <MediaPreviewModal
          isOpen={previewState.isOpen}
          mediaUrls={attachmentUrls}
          currentIndex={previewState.currentIndex}
          onClose={closePreview}
          onNext={goToNext}
          onPrevious={goToPrevious}
        />
      )}
    </div>
  );
};

export default ReviewDetailPage; 