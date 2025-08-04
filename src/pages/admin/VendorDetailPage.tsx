import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, Star, HelpCircle, Package, LinkedinIcon } from "lucide-react";
import { TwitterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedLoader, VendorDetailSkeleton } from "@/components/common";
import { useVendorDetails, useVendorProfileStats, useVendorProducts, useBlockVendor, useUnblockVendor, useApproveVendor, useRejectVendor } from "@/hooks/useVendors";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ProductsTable, Pagination } from "@/components/common";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAssetPath } from "@/config/assets";
import { getUserInitials } from "@/utils/userHelpers";

const VendorDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | 'approve' | 'reject' | null;
    vendorId: string | null;
    vendorName: string | null;
  }>({
    isOpen: false,
    type: null,
    vendorId: null,
    vendorName: null,
  });

  // Products pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: vendorResponse, isLoading, error } = useVendorDetails(slug || '');
  const { data: vendorStatsResponse, isLoading: isStatsLoading } = useVendorProfileStats(slug || '');
  
  // Get vendor products with pagination
  const { data: vendorProductsResponse, isLoading: isProductsLoading } = useVendorProducts(
    vendorResponse?.data?._id || '', 
    {
      page: currentPage,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  );

  const blockVendorMutation = useBlockVendor();
  const unblockVendorMutation = useUnblockVendor();
  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();

  // Show skeleton for main vendor details loading
  if (isLoading) {
    return <VendorDetailSkeleton />;
  }

  if (error || !vendorResponse?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/vendors')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  const vendor = vendorResponse.data;
  const isBlocked = vendor.status === 'blocked';
  const isPending = vendor.status === 'pending';

  const handleBlockVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'block',
      vendorId: vendor._id,
      vendorName: `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleUnblockVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'unblock',
      vendorId: vendor._id,
      vendorName: `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleApproveVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      vendorId: vendor._id,
      vendorName: `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleRejectVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      vendorId: vendor._id,
      vendorName: `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.vendorId || !confirmModal.type) return;

    try {
      if (confirmModal.type === 'block') {
        await blockVendorMutation.mutateAsync(confirmModal.vendorId);
        
        // Invalidate vendor detail queries for immediate UI update
        await queryClient.invalidateQueries({ queryKey: ['vendor-details', slug] });
        await queryClient.invalidateQueries({ queryKey: ['vendor-profile-stats', slug] });
        
      } else if (confirmModal.type === 'unblock') {
        await unblockVendorMutation.mutateAsync(confirmModal.vendorId);
        
        // Invalidate vendor detail queries for immediate UI update
        await queryClient.invalidateQueries({ queryKey: ['vendor-details', slug] });
        await queryClient.invalidateQueries({ queryKey: ['vendor-profile-stats', slug] });
      } else if (confirmModal.type === 'approve') {
        await approveVendorMutation.mutateAsync(confirmModal.vendorId);
        
        // Invalidate vendor detail queries for immediate UI update
        await queryClient.invalidateQueries({ queryKey: ['vendor-details', slug] });
        await queryClient.invalidateQueries({ queryKey: ['vendor-profile-stats', slug] });
        await queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
        
      } else if (confirmModal.type === 'reject') {
        await rejectVendorMutation.mutateAsync({ vendorId: confirmModal.vendorId });
        
        // Navigate back to vendors list after successful rejection
        navigate('/vendors');
        return; // Early return to avoid closing modal since we're navigating away
      }
    } catch (error) {
      console.error('Error performing vendor action:', error);
    }

    setConfirmModal({ isOpen: false, type: null, vendorId: null, vendorName: null });
  };

  // Product handlers
  const handleViewProductDetails = (slug: string) => {
    console.log("View product details:", slug);
    window.open(`https://xuthority.com/product-details/${slug}`);
    // You can navigate to product detail page or open a modal
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product:", productId);
    // Implement delete product functionality
  };

  const handleSelectedProductsChange = (selectedIds: string[]) => {
    setSelectedProducts(selectedIds);
  };

  const handleBulkDeleteProducts = (selectedIds: string[]) => {
    console.log("Bulk delete products:", selectedIds);
    // Implement bulk delete functionality
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          <button 
            onClick={() => navigate('/vendors')}
            className="hover:text-gray-800 transition-colors cursor-pointer"
          >
            Vendors
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">
            {isPending ? 'Pending Vendor Details' : 'Approved Vendors Details'}
          </span>
        </div>
        
        {/* Action Buttons based on status */}
        <div className="flex items-center flex-row-reverse gap-2">
          {isPending ? (
            <>
              <Button
                onClick={handleApproveVendor}
                variant={'default'}
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 text-white"
              >
                Approve Vendor
              </Button>
              <Button
                onClick={handleRejectVendor}
                variant={'destructive'}
                className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Reject Vendor
              </Button>
            </>
          ) : (
            <Button
              onClick={isBlocked ? handleUnblockVendor : handleBlockVendor}
              variant={'destructive'}
              className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
            >
              {isBlocked ? 'Unblock Vendor' : 'Block Vendor'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Side - Company Logo & Social */}
       <div className="flex flex-col gap-4 lg:gap-6">
       <div className="w-full sm:w-88 h-40 sm:h-48 lg:h-56 bg-gray-900 flex items-center justify-center relative rounded-xl lg:rounded-2xl overflow-hidden">
            {vendor.avatar ? (
              <img 
                src={vendor.avatar} 
                alt={'Company Logo'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-white text-6xl font-bold">
                {getUserInitials(vendor as any) || '?'}
              </div>
            )}
          </div>
                                 {/* Social Accounts */}
             <div className="w-full sm:w-80">
             <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Social Accounts</h2>
               <div className="flex gap-3 sm:gap-4">
                 {vendor.socialLinks?.linkedin && (
                   <a
                     href={vendor.socialLinks.linkedin.startsWith('http') ? vendor.socialLinks.linkedin : `https://linkedin.com/in/${vendor.socialLinks.linkedin}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-12 h-12   rounded-lg flex items-center justify-center  transition-colors"
                   >
                    <img src={getAssetPath('icons/linkedin.svg')} alt='linkedin' className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-white" />
                   </a>
                 )}
                 {vendor.socialLinks?.twitter && (
                   <a
                     href={vendor.socialLinks.twitter.startsWith('http') ? vendor.socialLinks.twitter : `https://x.com/${vendor.socialLinks.twitter}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-12 h-12 rounded-lg flex items-center justify-center  transition-colors"
                   >
                     <img src={getAssetPath('icons/twitter.svg')} alt='twitter' className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-white" />
                   </a>
                 )}
                 {(!vendor.socialLinks?.linkedin && !vendor.socialLinks?.twitter) && (
                   <p className="text-gray-500 text-sm">No social accounts available</p>
                 )}
               </div>
             </div>
       </div>

          {/* Right Side - Company Details */}
          <div className="flex-1 p-0 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {/* Row 1: Company Name, Company Email, Industry, Company Website, Company Size */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Name</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg font-medium"
                  title={vendor.companyName || 'N/A'}
                >
                  {vendor.companyName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Email</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.companyEmail || vendor.email}
                >
                  {vendor.companyEmail || vendor.email}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Industry</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={typeof vendor.industry === 'object' ? vendor.industry?.name : vendor.industry || 'N/A'}
                >
                  {typeof vendor.industry === 'object' ? vendor.industry?.name : vendor.industry || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Website</label>
                {vendor.companyWebsiteUrl ? (
                  <a
                    href={vendor.companyWebsiteUrl.startsWith('http') ? vendor.companyWebsiteUrl : `https://${vendor.companyWebsiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span
                      className="line-clamp-2 break-words"
                      title={vendor.companyWebsiteUrl}
                    >
                      {vendor.companyWebsiteUrl}
                    </span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-gray-900">N/A</p>
                )}
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Size</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.companySize || 'N/A'}
                >
                  {vendor.companySize || 'N/A'}
                </p>
              </div>

              {/* Row 2: HQ Location, Founded Year, Owner Name, Owner Email, Owner Region */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">HQ Location</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.hqLocation || 'N/A'}
                >
                  {vendor.hqLocation || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Founded Year</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.yearFounded || 'N/A'}
                >
                  {vendor.yearFounded || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Name</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={`${vendor.firstName} ${vendor.lastName}`}
                >
                  {`${vendor.firstName} ${vendor.lastName}`}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Email</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.email}
                >
                  {vendor.email}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Region</label>
                <p
                  className="line-clamp-2 break-words text-xs sm:text-sm md:text-base lg:text-base xl:text-lg"
                  title={vendor.region || 'N/A'}
                >
                  {vendor.region || 'N/A'}
                </p>
              </div>

              {/* Row 3: Joined On, Followers, Following, Empty, Status */}
              <div>
                <label className="text-sm text-gray-500 block mb-1">Joined On</label>
                <p className="text-gray-900">{formatDate(vendor.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Followers</label>
                <p className="text-sm sm:text-base text-gray-900">{formatCount(vendor.followersCount || 0)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Following</label>
                <p className="text-sm sm:text-base text-gray-900">{formatCount(vendor.followingCount || 0)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Status</label>
                <Badge className={`${getStatusColor(vendor.status)} border-0 text-xs sm:text-sm`}>
                  {getStatusText(vendor.status)}
                </Badge>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
              <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Description</label>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">
                {vendor.companyDescription || vendor.description || 'No company description available.'}
              </p>
            </div>
          
          </div>
           </div>
        </div>
  {/* Review Summary and Badges Section - Only show for approved/active vendors */}
  {!isPending && isStatsLoading && (
    <div className="flex flex-col lg:flex-row mt-6 lg:mt-8 gap-6 lg:gap-8">
      {/* Review Summary skeleton */}
      <div className="flex flex-col gap-4 lg:w-[350px] flex-shrink-0">
        <div className="h-7 bg-gray-200 rounded w-32 mb-4 lg:mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 bg-gray-200 rounded mx-auto" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-12 mx-auto mb-1 sm:mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Achievements skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-[300px]">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0 p-3 sm:p-0">
              <div className="sm:grid sm:grid-cols-3">
                <div className="px-3 sm:px-4 py-4 flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
                <div className="px-3 sm:px-4 py-4 flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="px-3 sm:px-4 py-4 flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {!isPending && !isStatsLoading && vendorStatsResponse?.success && (
    <div className="flex flex-col lg:flex-row mt-6 lg:mt-8 gap-6 lg:gap-8">
      {/* Review Summary */}
      <div className="flex flex-col gap-4 lg:w-[350px] flex-shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Review Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Total Reviews */}
            <div className="bg-yellow-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
              <img src={getAssetPath('icons/review.svg')} alt="review" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-black mx-auto" />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {vendorStatsResponse.data.totalReviews || 0}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Total Reviews</div>
            </div>

            {/* Average Rating */}
            <div className="bg-blue-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
              <img src={getAssetPath('icons/star.svg')} alt="Dispute" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-black mx-auto" />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {vendorStatsResponse.data.averageRating || '0.0'}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Average Rating</div>
            </div>

            {/* Disputes */}
            <div className="bg-pink-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
            <img src={getAssetPath('icons/dispute.svg')} alt="Dispute" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-black mx-auto" />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {String(vendorStatsResponse.data.disputes || 0).padStart(2, '0')}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Dispute</div>
            </div>

            {/* Total Products */}
            <div className="bg-green-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
              <img src={getAssetPath('icons/product.svg')} alt="product" className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-black mx-auto" />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {vendorStatsResponse.data.totalProducts || 0}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Total Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges & Achievements</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-[300px]">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-3 text-sm font-medium text-gray-700">Badge Icon</div>
            <div className="px-4 py-3 text-sm font-medium text-gray-700">Badge Name</div>
            <div className="px-4 py-3 text-sm font-medium text-gray-700">Earned Date</div>
          </div>
          {(vendorStatsResponse.data.badges || []).length > 0 ? (
            (vendorStatsResponse.data.badges || []).slice(0, 4).map((badge) => (
              <div key={badge.id} className="sm:grid sm:grid-cols-3 border-b border-gray-200 last:border-b-0 p-3 sm:p-0">
                {/* Mobile Layout */}
                <div className="flex items-center justify-between sm:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden p-2" style={{background:badge.colorCode}}>
                      {badge.icon && badge.icon.startsWith('http') ? (
                        <img 
                          src={badge.icon} 
                          alt={badge.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {badge.icon || badge.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">{badge.name}</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })}
                  </span>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden sm:flex px-3 sm:px-4 py-4 items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden p-2" style={{background:badge.colorCode}}>
                    {badge.icon && badge.icon.startsWith('http') ? (
                      <img 
                        src={badge.icon} 
                        alt={badge.name}
                        className="w-full h-full object-contain "
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {badge.icon || badge.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex px-3 sm:px-4 py-4 items-center">
                  <span className="text-gray-900">{badge.name}</span>
                </div>
                <div className="hidden sm:flex px-3 sm:px-4 py-4 items-center">
                  <span className="text-gray-600">
                    {new Date(badge.earnedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4  text-center text-gray-500 flex-1 flex items-center justify-center">
              No badges earned yet
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {/* Products Section - Only show for approved/active vendors */}
      {!isPending && (
        <div className="mt-6 lg:mt-8">
          {!isProductsLoading && vendorProductsResponse?.success ? (
          <>
            <ProductsTable
              products={vendorProductsResponse.data.products}
              onViewDetails={handleViewProductDetails}
              onDeleteProduct={handleDeleteProduct}
              onSelectedProductsChange={handleSelectedProductsChange}
              onBulkDelete={handleBulkDeleteProducts}
            />
            
            {/* Pagination */}
            {vendorProductsResponse.data.pagination.totalPages > 1 && (
              <div className="mt-4 sm:mt-6 flex justify-center">
                <Pagination
                  currentPage={vendorProductsResponse.data.pagination.page}
                  totalItems={vendorProductsResponse.data.pagination.total}
                  itemsPerPage={vendorProductsResponse.data.pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : isProductsLoading ? (
          <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-48" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v4a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-500">
                  No products available for this vendor at the moment
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
      
       </div>

     
  
        {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(isOpen) => !isOpen && setConfirmModal({ isOpen: false, type: null, vendorId: null, vendorName: null })}
        onConfirm={handleConfirmAction}
        title={`${confirmModal.type === 'block' ? 'Block' : confirmModal.type === 'unblock' ? 'Unblock' : confirmModal.type === 'approve' ? 'Approve' : 'Reject'} Vendor`}
        description={`Are you sure you want to ${confirmModal.type === 'block' ? 'block' : confirmModal.type === 'unblock' ? 'unblock' : confirmModal.type === 'approve' ? 'approve' : 'reject'} "${confirmModal.vendorName}"? ${
          confirmModal.type === 'block' 
            ? 'This vendor will no longer be able to access their account.' 
            : confirmModal.type === 'unblock' 
            ? 'This vendor will regain access to their account.'
            : confirmModal.type === 'approve'
            ? 'This vendor will be activated and able to access their account.'
            : 'This vendor will be permanently deleted from the system.'
        }`}
        confirmText={confirmModal.type === 'block' ? 'Block' : confirmModal.type === 'unblock' ? 'Unblock' : confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        isLoading={blockVendorMutation.isPending || unblockVendorMutation.isPending || approveVendorMutation.isPending || rejectVendorMutation.isPending}
        confirmVariant={confirmModal.type === 'block' || confirmModal.type === 'reject' ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default VendorDetailPage; 