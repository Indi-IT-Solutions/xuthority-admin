import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import MetaTagsTable from "@/components/common/MetaTagsTable";
import { Pagination, TableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useMetaTags, useDeleteMetaTag, useBulkDeleteMetaTags, MetaTag } from "@/hooks/useMetaTags";

// Interface for table component compatibility
interface TableMetaTag {
  _id: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdatedDate: string;
  status: 'active' | 'inactive';
}

const MetaTagsPage = () => {
  const navigate = useNavigate();
  const [selectedMetaTags, setSelectedMetaTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'bulk-delete' | null;
    metaTagId: string | null;
    metaTagName: string | null;
    selectedIds?: string[];
  }>({
    isOpen: false,
    type: null,
    metaTagId: null,
    metaTagName: null,
  });

  // Debounce search query to avoid excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API parameters for meta tags
  const apiParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
    sortBy: 'updatedAt',
    sortOrder: 'asc' as const,
  }), [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Fetch meta tags data
  const { data: metaTagsData, isLoading, error, refetch } = useMetaTags(apiParams);

  // Mutation hooks
  const deleteMetaTag = useDeleteMetaTag();
  const bulkDeleteMetaTags = useBulkDeleteMetaTags();

  // Transform API data for table component
  const transformedMetaTags: TableMetaTag[] = useMemo(() => {
    if (!metaTagsData?.data?.metaTags) return [];
    
    return metaTagsData.data.metaTags.map((metaTag: MetaTag) => ({
      _id: metaTag._id,
      pageName: metaTag.pageName,
      metaTitle: metaTag.metaTitle,
      metaDescription: metaTag.metaDescription,
      lastUpdatedDate: metaTag.updatedAt,
      status: metaTag.status
    }));
  }, [metaTagsData?.data?.metaTags]);

  // Pagination info from API
  const pagination = metaTagsData?.meta?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle view details
  const handleViewDetails = (metaTag: TableMetaTag | string) => {
    if (typeof metaTag === 'string') {
      // Handle string case (meta tag ID)
      console.log('View details for meta tag ID:', metaTag);
    } else {
      // Handle object case (full meta tag)
      console.log('View details for meta tag:', metaTag);
      // Navigate to edit page or open modal
      navigate(`/metatags/${metaTag._id}/edit`);
    }
  };

  // Handle selected meta tags change
  const handleSelectedMetaTagsChange = (selectedIds: string[]) => {
    setSelectedMetaTags(selectedIds);
  };

  // Handle bulk delete
  const handleBulkDelete = (selectedIds: string[]) => {
    setConfirmModal({
      isOpen: true,
      type: 'bulk-delete',
      metaTagId: null,
      metaTagName: null,
      selectedIds,
    });
  };

  // Handle delete
  const handleDelete = (metaTagId: string) => {
    const metaTag = transformedMetaTags.find(mt => mt._id === metaTagId);
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      metaTagId,
      metaTagName: metaTag?.pageName || 'Unknown',
    });
  };

  // Handle confirmation action
  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.metaTagId) {
      deleteMetaTag.mutate(confirmModal.metaTagId);
    } else if (confirmModal.type === 'bulk-delete' && confirmModal.selectedIds) {
      bulkDeleteMetaTags.mutate(confirmModal.selectedIds);
      setSelectedMetaTags([]);
    }
    closeConfirmModal();
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      metaTagId: null,
      metaTagName: null,
    });
  };

  // Get confirmation modal content
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'delete':
        return 'Delete Meta Tag';
      case 'bulk-delete':
        return 'Delete Meta Tags';
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    switch (confirmModal.type) {
      case 'delete':
        return `Are you sure you want to delete the meta tag for "${confirmModal.metaTagName}"? This action cannot be undone.`;
      case 'bulk-delete':
        const count = confirmModal.selectedIds?.length || 0;
        return `Are you sure you want to delete ${count} selected meta tag${count > 1 ? 's' : ''}? This action cannot be undone.`;
      default:
        return 'This action cannot be undone.';
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Meta Tags
        </h1>
        
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} />}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load meta tags</p>
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
      {!isLoading && !error && transformedMetaTags.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meta tags found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery.trim() 
                ? `No meta tags match your search "${searchQuery}"`
                : 'No meta tags available at the moment'
              }
            </p>
            <Button onClick={() => navigate('/metatags/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Meta Tag
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && transformedMetaTags.length > 0 && (
        <>
          <MetaTagsTable
            metaTags={transformedMetaTags}
            onViewDetails={handleViewDetails}
            onSelectedMetaTagsChange={handleSelectedMetaTagsChange}
            onBulkDelete={handleBulkDelete}
          />

          {/* Pagination */}
          {(() => {
            const shouldShowPagination = pagination.totalPages > 1 || pagination.total > itemsPerPage;
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
        isLoading={confirmModal.type === 'delete' ? deleteMetaTag.isPending : bulkDeleteMetaTags.isPending}
      />
    </div>
  );
};

export default MetaTagsPage; 