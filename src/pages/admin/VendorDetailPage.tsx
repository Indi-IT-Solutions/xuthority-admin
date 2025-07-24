import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, Star, HelpCircle, Package, LinkedinIcon } from "lucide-react";
import { TwitterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedLoader } from "@/components/common";
import { useVendorDetails, useVendorProfileStats, useVendorProducts, useBlockVendor, useUnblockVendor } from "@/hooks/useVendors";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { ProductsTable, Pagination } from "@/components/common";

const VendorDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | null;
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

  if (isLoading) {
    return <EnhancedLoader loadingText="Loading vendor details..." minDisplayTime={800} />;
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

  const handleBlockVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'block',
      vendorId: vendor._id,
      vendorName: vendor.companyName || `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleUnblockVendor = () => {
    setConfirmModal({
      isOpen: true,
      type: 'unblock',
      vendorId: vendor._id,
      vendorName: vendor.companyName || `${vendor.firstName} ${vendor.lastName}`,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.vendorId || !confirmModal.type) return;

    try {
      if (confirmModal.type === 'block') {
        await blockVendorMutation.mutateAsync(confirmModal.vendorId);
      } else {
        await unblockVendorMutation.mutateAsync(confirmModal.vendorId);
      }
    } catch (error) {
      console.error('Error performing vendor action:', error);
    }

    setConfirmModal({ isOpen: false, type: null, vendorId: null, vendorName: null });
  };

  // Product handlers
  const handleViewProductDetails = (productId: string) => {
    console.log("View product details:", productId);
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
          <span className="text-gray-800 font-medium">Approved Vendors Details</span>
        </div>
        
        <Button
          onClick={isBlocked ? handleUnblockVendor : handleBlockVendor}
          variant={'destructive'}
          className="rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
          size="sm"
        >
          {isBlocked ? 'Unblock Vendor' : 'Block Vendor'}
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Side - Company Logo & Social */}
       <div className="flex flex-col gap-4 lg:gap-6">
       <div className="w-full sm:w-88 h-40 sm:h-48 lg:h-56 bg-gray-900 flex items-center justify-center relative rounded-xl lg:rounded-2xl overflow-hidden">
            {vendor.companyAvatar ? (
              <img 
                src={vendor.companyAvatar} 
                alt={vendor.companyName || 'Company Logo'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-white text-6xl font-bold">
                {vendor.companyName?.charAt(0)?.toUpperCase() || vendor.firstName?.charAt(0)?.toUpperCase() || '?'}
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
                     className="w-12 h-12  bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                   >
                    <LinkedinIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                   </a>
                 )}
                 {vendor.socialLinks?.twitter && (
                   <a
                     href={vendor.socialLinks.twitter.startsWith('http') ? vendor.socialLinks.twitter : `https://x.com/${vendor.socialLinks.twitter}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-12 h-12  bg-black rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                   >
                     <TwitterIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
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
                <p className="text-sm sm:text-base text-gray-900 font-medium">{vendor.companyName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Email</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.companyEmail || vendor.email}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Industry</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.industry || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Website</label>
                {vendor.companyWebsiteUrl ? (
                  <a 
                    href={vendor.companyWebsiteUrl.startsWith('http') ? vendor.companyWebsiteUrl : `https://${vendor.companyWebsiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span className="truncate">{vendor.companyWebsiteUrl}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm sm:text-base text-gray-900">N/A</p>
                )}
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Company Size</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.companySize || 'N/A'}</p>
              </div>

              {/* Row 2: HQ Location, Founded Year, Owner Name, Owner Email, Owner Region */}
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">HQ Location</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.hqLocation || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Founded Year</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.yearFounded || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Name</label>
                <p className="text-sm sm:text-base text-gray-900">{`${vendor.firstName} ${vendor.lastName}`}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Email</label>
                <p className="text-sm sm:text-base text-gray-900 truncate">{vendor.email}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-500 block mb-1">Owner Region</label>
                <p className="text-sm sm:text-base text-gray-900">{vendor.region || 'N/A'}</p>
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
  {/* Review Summary and Badges Section */}
  {!isStatsLoading && vendorStatsResponse?.success && (
    <div className="flex flex-col lg:flex-row mt-6 lg:mt-8 gap-6 lg:gap-8">
      {/* Review Summary */}
      <div className="flex flex-col gap-4 lg:w-[350px] flex-shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Review Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Total Reviews */}
            <div className="bg-yellow-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mx-auto" strokeWidth={2} />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {vendorStatsResponse.data.totalReviews || 0}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Total Reviews</div>
            </div>

            {/* Average Rating */}
            <div className="bg-blue-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mx-auto" strokeWidth={2} />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {vendorStatsResponse.data.averageRating || '0.0'}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Average Rating</div>
            </div>

            {/* Disputes */}
            <div className="bg-pink-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
                <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mx-auto" strokeWidth={2} />
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-black mb-1 sm:mb-2">
                {String(vendorStatsResponse.data.disputes || 0).padStart(2, '0')}
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-black font-medium">Dispute</div>
            </div>

            {/* Total Products */}
            <div className="bg-green-50 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
              <div className="mb-3 sm:mb-4">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black mx-auto" strokeWidth={2} />
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
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {badge.icon || badge.name.charAt(0)}
                      </span>
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
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {badge.icon || badge.name.charAt(0)}
                    </span>
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

      {/* Products Section */}
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
            <div className="text-center">
              <EnhancedLoader loadingText="Loading products..." minDisplayTime={800} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Product List</h3>
              <p className="text-gray-500 text-sm sm:text-base">No products found for this vendor</p>
            </div>
          </div>
        )}
      </div>
      
       </div>

     
  
        {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(isOpen) => !isOpen && setConfirmModal({ isOpen: false, type: null, vendorId: null, vendorName: null })}
        onConfirm={handleConfirmAction}
        title={`${confirmModal.type === 'block' ? 'Block' : 'Unblock'} Vendor`}
        description={`Are you sure you want to ${confirmModal.type === 'block' ? 'block' : 'unblock'} "${confirmModal.vendorName}"? ${confirmModal.type === 'block' ? 'This vendor will no longer be able to access their account.' : 'This vendor will regain access to their account.'}`}
        confirmText={confirmModal.type === 'block' ? 'Block' : 'Unblock'}
        cancelText="Cancel"
        isLoading={blockVendorMutation.isPending || unblockVendorMutation.isPending}
        confirmVariant={confirmModal.type === 'block' ? 'destructive' : 'default'}
      />
    </div>
  );
};

export default VendorDetailPage; 