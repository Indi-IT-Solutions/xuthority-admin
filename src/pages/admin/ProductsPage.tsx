import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import ProductsTable from '@/components/common/ProductsTable';
import { Pagination, TableSkeleton } from '@/components/common';
import VendorFilter, { VendorFilters } from '@/components/common/VendorFilter';
import { useApproveProduct, useRejectProduct } from '@/hooks/useAdminProducts';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Textarea } from '@/components/ui/textarea';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState<VendorFilters>({
    dateFilter: null,
    dateFrom: undefined,
    dateTo: undefined,
    appliedAt: undefined,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchQuery,
      status: activeTab === 'approved' ? 'published' : 'pending,update_pending',
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
      appliedAt: filters.appliedAt,
    };

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

    return params;
  }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, filters]);

  const { data, isLoading, error, refetch } = useAdminProducts(apiParams);
  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 };

  useEffect(() => { setCurrentPage(1); }, [debouncedSearchQuery, activeTab, filters]);

  const handleTabChange = (tab: 'approved' | 'pending') => {
    setActiveTab(tab);
    setCurrentPage(1);
    refetch();
  };

  const handleFilterChange = (newFilters: VendorFilters) => {
    setFilters(newFilters);
  };

  // Approve/Reject handlers
  const approveMutation = useApproveProduct();
  const rejectMutation = useRejectProduct();
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveProductId, setApproveProductId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectProductId, setRejectProductId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApproveProduct = (productId: string) => {
    setApproveProductId(productId);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveProductId) return;
    try {
      await approveMutation.mutateAsync(approveProductId);
      setApproveModalOpen(false);
      setApproveProductId(null);
      refetch();
    } catch {}
  };

  const handleOpenReject = (productId: string) => {
    setRejectProductId(productId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectProductId) return;
    try {
      await rejectMutation.mutateAsync({ productId: rejectProductId, reason: rejectReason.trim() || undefined });
      setRejectModalOpen(false);
      setRejectProductId(null);
      setRejectReason('');
      refetch();
    } catch {}
  };
  // Product handlers
  const handleViewProductDetails = (slug: string) => {
    window.location.assign(`/admin/products/${slug}`);
  };
  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product:", productId);
    // Implement delete product functionality
  };

  return (
    <div className="">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Products</h1>
      </div>
      <div className="flex justify-between items-center gap-4 my-4">
        <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit">
          {['approved', 'pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleTabChange(filter as 'approved' | 'pending')}
              className={`px-3 py-2 md:px-6 md:py-2 text-xs h-12 md:text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
                activeTab === filter ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter} Products
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3  top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all  sm:w-96"
            />
          </div>
          <VendorFilter onFilterChange={handleFilterChange} currentFilters={filters} />
        </div>
      </div>

      {isLoading && <TableSkeleton rows={10} />}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load products</p>
            <p className="text-sm mt-1">{(error as any).message}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Try Again</button>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <ProductsTable 
            products={products as any}
            onViewDetails={handleViewProductDetails}
            onApproveProduct={handleApproveProduct}
            onRejectProduct={handleOpenReject}
          />
          <Pagination
            currentPage={currentPage}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <ConfirmationModal
            isOpen={approveModalOpen}
            onOpenChange={setApproveModalOpen}
            onConfirm={handleConfirmApprove}
            title="Approve Product"
            description="Are you sure you want to approve this product?."
            confirmText="Approve"
            confirmVariant="default"
            isLoading={approveMutation.isPending}
          />

          <ConfirmationModal
            isOpen={rejectModalOpen}
            onOpenChange={setRejectModalOpen}
            onConfirm={handleConfirmReject}
            title="Reject Product"
            description="Are you sure you want to reject this product?."
            confirmText="Reject"
            confirmVariant="destructive"
            isLoading={rejectMutation.isPending}
            body={
             <div>
              <label >Reason (Optional)</label>
               <Textarea
                placeholder="Add a brief reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full mt-2"
                maxLength={200}
              />
             </div>
            }
          />
        </>
      )}
    </div>
  );
};

export default ProductsPage;