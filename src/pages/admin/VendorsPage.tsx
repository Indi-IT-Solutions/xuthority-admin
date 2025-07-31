import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { VendorsTable, Pagination, VendorFilter, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { VendorFilters } from "@/components/common/VendorFilter";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  useVendors, 
  useVerifyVendor, 
  useApproveVendor,
  useRejectVendor,
  useBlockVendor, 
  useUnblockVendor, 
  useDeleteVendor, 
  useBulkDeleteVendors 
} from "@/hooks/useVendors";
import { TransformedVendor } from "@/services/vendorService";
// import { EnhancedLoader } from "@/components/common";

const VendorsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState<VendorFilters>({
    dateFilter: null,
    dateFrom: undefined,
    dateTo: undefined,
    appliedAt: undefined,
  });

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'block' | 'unblock' | 'delete' | null;
    vendorId: string | null;
    vendorName: string | null;
  }>({
    isOpen: false,
    type: null,
    vendorId: null,
    vendorName: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Prepare API parameters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      status: activeTab === "approved" ? 'approved,blocked' as const : 'pending' as const,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    // Add date filtering
    if (filters.dateFilter && filters.dateFilter !== 'custom') {
      params.period = filters.dateFilter;
    } else if (filters.dateFilter === 'custom') {
      if (filters.dateFrom) {
        params.dateFrom = new Date(filters.dateFrom).toISOString();
      }
      if (filters.dateTo) {
        params.dateTo = new Date(filters.dateTo).toISOString();
      }
    }

    // Include appliedAt timestamp to force new API calls even with same filters
    if (filters.appliedAt) {
      params.appliedAt = filters.appliedAt;
    }

    console.log('API Params being sent:', params);
    console.log('Current filters:', filters);
    return params;
  }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, filters]);

  // Fetch vendors from API
  const { data: vendorsData, isLoading, error, refetch } = useVendors(apiParams);

  // Mutation hooks
  const verifyVendorMutation = useVerifyVendor();
  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();
  const blockVendorMutation = useBlockVendor();
  const unblockVendorMutation = useUnblockVendor();
  const deleteVendorMutation = useDeleteVendor();
  const bulkDeleteMutation = useBulkDeleteVendors();

  // Get vendors and pagination from API response
  const vendors = vendorsData?.vendors || [];
  const pagination = vendorsData?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };


  // Use only API data - no fallback to sample data
  const displayVendors = vendors;
  const totalVendors = pagination.total;

  // Reset to first page when tab or search changes
  const handleTabChange = (tab: "approved" | "pending") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to page 1 when search query changes (debounced)
    // Note: Page reset will happen when debouncedSearchQuery updates
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: VendorFilters) => {
    setFilters(newFilters);
  };

  // Reset to page 1 when debounced search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters]);

  // Action handlers
  const handleViewDetails = (vendorId: string) => {
    const vendor = displayVendors.find(v => v._id === vendorId || v.id.toString() === vendorId);
    console.log('vendor', vendor)
    if (vendor && vendor.slug) {
      navigate(`/vendors/${vendor.slug}`);
    } else {
      console.error("Vendor not found or missing slug:", vendorId);
    }
  };

  // Helper function to get vendor name
  const getVendorName = (vendorId: string) => {
    const vendor = displayVendors.find(v => v._id === vendorId || v.id.toString() === vendorId);
    return vendor ? vendor.company.name : 'Unknown Vendor';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'approve' | 'reject' | 'block' | 'unblock' | 'delete', vendorId: string) => {
    const vendorName = getVendorName(vendorId);
    setConfirmModal({
      isOpen: true,
      type,
      vendorId,
      vendorName,
    });
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      vendorId: null,
      vendorName: null,
    });
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (!confirmModal.vendorId || !confirmModal.type) return;

    switch (confirmModal.type) {
      case 'approve':
        approveVendorMutation.mutate(confirmModal.vendorId);
        break;
      case 'reject':
        rejectVendorMutation.mutate({ vendorId: confirmModal.vendorId });
        break;
      case 'block':
        blockVendorMutation.mutate(confirmModal.vendorId);
        break;
      case 'unblock':
        unblockVendorMutation.mutate(confirmModal.vendorId);
        break;
      case 'delete':
        deleteVendorMutation.mutate(confirmModal.vendorId);
        break;
    }
    closeConfirmModal();
  };

  const handleBlockVendor = (vendorId: string) => {
    openConfirmModal('block', vendorId);
  };

  const handleUnblockVendor = (vendorId: string) => {
    openConfirmModal('unblock', vendorId);
  };

  const handleApproveVendor = (vendorId: string) => {
    openConfirmModal('approve', vendorId);
  };

  const handleRejectVendor = (vendorId: string) => {
    openConfirmModal('reject', vendorId);
  };

  const handleDeleteVendor = (vendorId: string) => {
    openConfirmModal('delete', vendorId);
  };

  const handleSelectedVendorsChange = (selectedIds: string[]) => {
    setSelectedVendors(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    console.log("Bulk delete vendors:", selectedIds);
    const vendorCount = selectedIds.length;
    const confirmed = confirm(
      `Are you sure you want to delete ${vendorCount} selected vendor${
        vendorCount > 1 ? "s" : ""
      }?`
    );

    if (confirmed) {
      // Perform bulk delete operation
      selectedIds.forEach((id) => handleDeleteVendor(id));
      setSelectedVendors([]);
      alert(
        `Successfully deleted ${vendorCount} vendor${
          vendorCount > 1 ? "s" : ""
        }.`
      );
    }
  };

  // Helper functions for confirmation modal
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'approve':
        return 'Approve Vendor';
      case 'reject':
        return 'Reject & Delete Vendor';
      case 'block':
        return 'Block Vendor';
      case 'unblock':
        return 'Unblock Vendor';
      case 'delete':
        return 'Delete Vendor';
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    const vendorName = confirmModal.vendorName || 'this vendor';
    switch (confirmModal.type) {
      case 'approve':
        return `Are you sure you want to approve "${vendorName}"? This will move them to the approved vendors list.`;
      case 'reject':
        return `Are you sure you want to reject and permanently delete "${vendorName}"? This action cannot be undone and the vendor will be completely removed from the database.`;
      case 'block':
        return `Are you sure you want to block "${vendorName}"? They will no longer be able to access their account.`;
      case 'unblock':
        return `Are you sure you want to unblock "${vendorName}"? They will regain access to their account.`;
      case 'delete':
        return `Are you sure you want to permanently delete "${vendorName}"? This action cannot be undone.`;
      default:
        return 'Are you sure you want to proceed with this action?';
    }
  };

  const getConfirmationButtonText = () => {
    switch (confirmModal.type) {
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject & Delete';
      case 'block':
        return 'Block';
      case 'unblock':
        return 'Unblock';
      case 'delete':
        return 'Delete';
      default:
        return 'Confirm';
    }
  };

  const getIsLoading = () => {
    switch (confirmModal.type) {
      case 'approve':
        return approveVendorMutation.isPending;
      case 'reject':
        return rejectVendorMutation.isPending;
      case 'block':
        return blockVendorMutation.isPending;
      case 'unblock':
        return unblockVendorMutation.isPending;
      case 'delete':
        return deleteVendorMutation.isPending;
      default:
        return false;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Vendors
        </h1>
        {/* Filters */}
        <VendorFilter
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />
      </div>
      <div className="flex justify-between items-center gap-4 my-4">
        <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit">
          {["approved", "pending"].map((filter: "approved" | "pending") => (
            <button
              key={filter}
              onClick={() => handleTabChange(filter)}
              className={`px-3 py-2 md:px-6 md:py-2 text-xs h-12 md:text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
                activeTab === filter
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {filter} Vendors
            </button>
          ))}
        </div>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3  top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
            <Input
              type="text"
              placeholder="Start searching here..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all  sm:w-96"
            />
          </div>
        </div>
      </div>

              {/* Loading State */}
        {isLoading && <TableSkeleton rows={10} />}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 text-center mb-4">
              <p className="text-lg font-medium">Failed to load vendors</p>
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
        {!isLoading && !error && displayVendors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v4a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery.trim() 
                  ? `No vendors match your search "${searchQuery}"`
                  : `No ${activeTab === 'approved' ? 'approved' : 'pending'} vendors at the moment`
                }
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && displayVendors.length > 0 && (
          <>
            <VendorsTable
              vendors={displayVendors}
              onViewDetails={handleViewDetails}
              onBlockVendor={handleBlockVendor}
              onUnblockVendor={handleUnblockVendor}
              onApproveVendor={handleApproveVendor}
              onRejectVendor={handleRejectVendor}
              onDeleteVendor={handleDeleteVendor}
              onSelectedVendorsChange={handleSelectedVendorsChange}
              onBulkDelete={handleBulkDelete}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalVendors}
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
          confirmVariant={confirmModal.type === 'reject' || confirmModal.type === 'delete' || confirmModal.type === 'block' ? 'destructive' : 'default'}
          isLoading={getIsLoading()}
        />
    </div>
  );
};

export default VendorsPage;
