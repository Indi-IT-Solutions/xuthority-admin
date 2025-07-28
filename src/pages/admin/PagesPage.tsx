import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import PagesTable from "@/components/common/PagesTable";
import { Pagination } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { usePages, useDeletePage, useBulkDeletePages, Page } from "@/hooks/usePages";

// Interface for table component compatibility
interface TablePage {
  _id: string;
  name: string;
  lastUpdatedDate: string;
  slug: string;
  status: 'active' | 'inactive';
}

const PagesPage = () => {
  const navigate = useNavigate();
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'bulk-delete' | null;
    pageId: string | null;
    pageName: string | null;
    selectedIds?: string[];
  }>({
    isOpen: false,
    type: null,
    pageId: null,
    pageName: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API parameters for pages
  const apiParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
    sortBy: 'updatedAt',
    sortOrder: 'asc' as const,
  }), [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Fetch pages data
  const { data: pagesData, isLoading, error, refetch } = usePages(apiParams);

  // Mutation hooks
  const deletePage = useDeletePage();
  const bulkDeletePages = useBulkDeletePages();

  // Transform API data for table component
  const transformedPages: TablePage[] = useMemo(() => {
    if (!pagesData?.data?.pages) return [];
    
    return pagesData.data.pages.map((page: Page) => ({
      _id: page._id,
      name: page.name,
      lastUpdatedDate: page.updatedAt,
      slug: page.slug,
      status: page.status
    }));
  }, [pagesData?.data?.pages]);

  // Pagination info from API
  const pagination = pagesData?.meta?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };

  // Debug pagination data
  console.log('Pagination data:', {
    apiPagination: pagesData?.meta?.pagination,
    fallbackPagination: {
      page: currentPage,
      limit: itemsPerPage,
      total: 0,
      totalPages: 1
    },
    finalPagination: pagination,
    currentPage,
    itemsPerPage,
    totalRecords: pagesData?.data?.pages?.length || 0
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to get page name
  const getPageName = (pageId: string) => {
    const page = transformedPages.find(p => p._id === pageId);
    return page ? page.name : 'Unknown Page';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'delete' | 'bulk-delete', pageId?: string, selectedIds?: string[]) => {
    if (type === 'delete' && pageId) {
      const pageName = getPageName(pageId);
      setConfirmModal({
        isOpen: true,
        type,
        pageId,
        pageName,
      });
    } else if (type === 'bulk-delete' && selectedIds) {
      setConfirmModal({
        isOpen: true,
        type,
        pageId: null,
        pageName: null,
        selectedIds,
      });
    }
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      pageId: null,
      pageName: null,
    });
  };

  // Confirmation handler
  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.pageId) {
      deletePage.mutate(confirmModal.pageId);
    } else if (confirmModal.type === 'bulk-delete' && confirmModal.selectedIds) {
      bulkDeletePages.mutate(confirmModal.selectedIds);
      setSelectedPages([]);
    }
    closeConfirmModal();
  };

  // Action handlers
  const handleViewDetails = (page: any) => {
    console.log('page', page)
    // Handle both cases: when called with page object or pageId
    let pageData;
    if (typeof page === 'string') {
      // Called with pageId
      pageData = transformedPages.find(p => p._id === page);
    } else if (page && page._id) {
      // Called with page object
      pageData = page;
    }
    
    if (pageData && pageData.slug) {
      // Check for specific pages that should navigate to /view
      const specificPages = ['about-us', 'terms-conditions', 'privacy-policy'];
      
      if (specificPages.includes(pageData.slug)) {
        navigate(`/pages/view/${pageData.slug}`);
      } else {
        navigate(`/pages/${pageData.slug}`);
      }
    }
  };

  const handleEditPage = (pageId: string) => {
    console.log('Edit page:', pageId);
    // Navigate to edit page
  };

  const handleDeletePage = (pageId: string) => {
    openConfirmModal('delete', pageId);
  };

  const handleSelectedPagesChange = (selectedIds: string[]) => {
    setSelectedPages(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    openConfirmModal('bulk-delete', undefined, selectedIds);
  };

  // Get confirmation modal content
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'delete':
        return 'Delete Page';
      case 'bulk-delete':
        return 'Delete Pages';
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    switch (confirmModal.type) {
      case 'delete':
        return `Are you sure you want to delete "${confirmModal.pageName}"? This action cannot be undone.`;
      case 'bulk-delete':
        const count = confirmModal.selectedIds?.length || 0;
        return `Are you sure you want to delete ${count} selected page${count > 1 ? 's' : ''}? This action cannot be undone.`;
      default:
        return 'This action cannot be undone.';
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Pages
        </h1>
      
      </div>


      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading pages...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load pages</p>
            <p className="text-sm mt-1">{(error as any)?.message}</p>
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
      {!isLoading && !error && transformedPages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pages found
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery.trim() 
                ? `No pages match your search "${searchQuery}"`
                : 'No pages available at the moment'
              }
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && transformedPages.length > 0 && (
        <>
          <PagesTable
            pages={transformedPages}
            onViewDetails={handleViewDetails}
            onSelectedPagesChange={handleSelectedPagesChange}
            onBulkDelete={handleBulkDelete}
          />

          {/* Pagination */}
          {(() => {
            const shouldShowPagination = pagination.totalPages > 1 || pagination.total > itemsPerPage;
            console.log('Pagination visibility check:', {
              totalPages: pagination.totalPages,
              total: pagination.total,
              itemsPerPage,
              shouldShowPagination
            });
            return shouldShowPagination;
          })() && (
            <Pagination
              currentPage={currentPage}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={getConfirmationTitle()}
        description={getConfirmationDescription()}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={confirmModal.type === 'delete' ? deletePage.isPending : bulkDeletePages.isPending}
      />
    </div>
  );
};

export default PagesPage; 