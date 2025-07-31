import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Plus, ChevronRight } from "lucide-react";
import CollectionTable from "@/components/common/CollectionTable";
import { Pagination, AddEditModal, CollectionTableSkeleton } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  useCollectionItems, 
  useCreateCollectionItem,
  useUpdateCollectionItem,
  useDeleteCollectionItem, 
  useBulkDeleteCollectionItems,
  CollectionService
} from "@/hooks/useCollections";

const PageDetailsPage = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'bulk-delete' | null;
    itemId: string | null;
    itemName: string | null;
    selectedIds?: string[];
  }>({
    isOpen: false,
    type: null,
    itemId: null,
    itemName: null,
  });

  // Add/Edit modal states
  const [addEditModal, setAddEditModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    item: any;
  }>({
    isOpen: false,
    mode: 'add',
    item: null,
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get collection configuration
  const collectionConfig = useMemo(() => {
    if (!pageSlug) return null;
    try {
      return CollectionService.getCollectionConfig(pageSlug);
    } catch (error) {
      console.error('Unknown collection:', pageSlug);
      return null;
    }
  }, [pageSlug]);

  // API parameters for collection items
  const apiParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery,
    sortBy: 'updatedAt',
    sortOrder: 'desc' as const,
  }), [currentPage, itemsPerPage, debouncedSearchQuery]);

  // Fetch collection data
  const { data: collectionData, isLoading, error, refetch } = useCollectionItems(
    pageSlug || '', 
    apiParams
  );



  // Mutation hooks
  const createItem = useCreateCollectionItem(pageSlug || '');
  const updateItem = useUpdateCollectionItem(pageSlug || '');
  const deleteItem = useDeleteCollectionItem(pageSlug || '');
  const bulkDeleteItems = useBulkDeleteCollectionItems(pageSlug || '');

  // Get collection items from API response
  const collectionItems = useMemo(() => {
    if (!collectionData?.data || !collectionConfig) {
      return [];
    }
    
    // The API response structure should be:
    // { success: true, data: [...items], meta: { pagination: {...} } }
    const items = Array.isArray(collectionData.data) ? collectionData.data : [];
    
    return items;
  }, [collectionData?.data, collectionConfig]);

  // Pagination info from API
  const pagination = useMemo(() => {
    const apiPagination = collectionData?.meta?.pagination;
    if (!apiPagination) {
      return {
        page: currentPage,
        limit: itemsPerPage,
        total: 0,
        totalPages: 1
      };
    }
    
    // Transform backend pagination format to frontend format
    return {
      page: apiPagination.currentPage || currentPage,
      limit: apiPagination.itemsPerPage || itemsPerPage,
      total: apiPagination.totalItems || 0,
      totalPages: apiPagination.totalPages || 1,
      hasNextPage: Boolean((apiPagination as any).hasNextPage || apiPagination.hasNext),
      hasPrevPage: Boolean((apiPagination as any).hasPrevPage || apiPagination.hasPrev)
    };
  }, [collectionData?.meta?.pagination, currentPage, itemsPerPage]);

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to get item name
  const getItemName = (itemId: string) => {
    const item = collectionItems.find(i => i._id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  // Helper function to open confirmation modal
  const openConfirmModal = (type: 'delete' | 'bulk-delete', itemId?: string, selectedIds?: string[]) => {
    if (type === 'delete' && itemId) {
      const itemName = getItemName(itemId);
      setConfirmModal({
        isOpen: true,
        type,
        itemId,
        itemName,
      });
    } else if (type === 'bulk-delete' && selectedIds) {
      setConfirmModal({
        isOpen: true,
        type,
        itemId: null,
        itemName: null,
        selectedIds,
      });
    }
  };

  // Helper function to close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      itemId: null,
      itemName: null,
    });
  };

  // Helper function to open add modal
  const openAddModal = () => {
    setAddEditModal({
      isOpen: true,
      mode: 'add',
      item: null,
    });
  };

  // Helper function to open edit modal
  const openEditModal = (item: any) => {
    console.log('✏️ Opening edit modal for item:', item);
    setAddEditModal({
      isOpen: true,
      mode: 'edit',
      item,
    });
  };

  // Helper function to close add/edit modal
  const closeAddEditModal = () => {
    setAddEditModal({
      isOpen: false,
      mode: 'add',
      item: null,
    });
  };

  // Handle add/edit form submission
  const handleAddEditSubmit = async (formData: any) => {
    try {
      if (addEditModal.mode === 'add') {
        await createItem.mutateAsync(formData);
      } else {
        await updateItem.mutateAsync({ 
          itemId: addEditModal.item._id, 
          data: formData 
        });
      }
      closeAddEditModal();
      refetch();
    } catch (error) {
      console.error('Error saving item:', error);
      // Error handling is already done in the hooks with toast notifications
    }
  };



  // Confirmation handler
  const handleConfirmAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.itemId) {
      deleteItem.mutate(confirmModal.itemId);
    } else if (confirmModal.type === 'bulk-delete' && confirmModal.selectedIds) {
      bulkDeleteItems.mutate(confirmModal.selectedIds);
      setSelectedItems([]);
    }
    closeConfirmModal();
  };

  // Action handlers
  const handleViewDetails = (itemId: string) => {
    console.log('🔍 View details for item:', itemId);
    // You can implement a modal or navigate to item details
  };

  const handleEditItem = (itemId: string) => {
    console.log('Edit item:', itemId);
    // Navigate to edit form or open modal
  };

  const handleDeleteItem = (itemId: string) => {
    openConfirmModal('delete', itemId);
  };

  const handleAddNew = () => {
    console.log('Add new item');
    // Navigate to create form or open modal
  };

  const handleSelectedItemsChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };

  const handleBulkDelete = (selectedIds: string[]) => {
    openConfirmModal('bulk-delete', undefined, selectedIds);
  };

  // Get confirmation modal content
  const getConfirmationTitle = () => {
    switch (confirmModal.type) {
      case 'delete':
        return `Delete ${collectionConfig?.name}`;
      case 'bulk-delete':
        return `Delete ${collectionConfig?.name}s`;
      default:
        return 'Confirm Action';
    }
  };

  const getConfirmationDescription = () => {
    switch (confirmModal.type) {
      case 'delete':
        return `Are you sure you want to delete "${confirmModal.itemName}"? This action cannot be undone.`;
      case 'bulk-delete':
        const count = confirmModal.selectedIds?.length || 0;
        return `Are you sure you want to delete ${count} selected ${collectionConfig?.name.toLowerCase()}${count > 1 ? 's' : ''}? This action cannot be undone.`;
      default:
        return 'This action cannot be undone.';
    }
  };

  // Show error if collection config not found
  if (!collectionConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-center mb-4">
          <p className="text-lg font-medium">Collection not found</p>
          <p className="text-sm mt-1">The page "{pageSlug}" does not have a valid collection configuration.</p>
        </div>
        <button 
          onClick={() => navigate('/pages')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Pages
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button 
          onClick={() => navigate('/pages')}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          Pages
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{collectionConfig.name}s</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          {collectionConfig.name}s
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
    
          
          {/* Add Button */}
          <Button onClick={openAddModal} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 rounded-full text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add {collectionConfig.name}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <CollectionTableSkeleton />}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load {collectionConfig.name.toLowerCase()}s</p>
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
      {!isLoading && !error && collectionItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {collectionConfig.name.toLowerCase()}s found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery.trim() 
                ? `No ${collectionConfig.name.toLowerCase()}s match your search "${searchQuery}"`
                : `No ${collectionConfig.name.toLowerCase()}s available at the moment`
              }
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add First {collectionConfig.name}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && collectionItems.length > 0 && (
        <>
          <CollectionTable
            items={collectionItems}
            config={collectionConfig}
            onViewDetails={handleViewDetails}
            onEditItem={openEditModal}
            onDeleteItem={(itemId) => {
              console.log('🗑️ Delete item clicked:', itemId);
              openConfirmModal('delete', itemId);
            }}
            onSelectedItemsChange={setSelectedItems}
            onBulkDelete={(selectedIds) => openConfirmModal('bulk-delete', undefined, selectedIds)}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
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
        isLoading={confirmModal.type === 'delete' ? deleteItem.isPending : bulkDeleteItems.isPending}
      />

      {/* Add/Edit Modal */}
      <AddEditModal
        isOpen={addEditModal.isOpen}
        onClose={closeAddEditModal}
        onSubmit={handleAddEditSubmit}
        mode={addEditModal.mode}
        collectionName={collectionConfig?.name || ''}
        collectionConfig={collectionConfig}
        initialData={addEditModal.item}
        isLoading={createItem.isPending || updateItem.isPending}
      />
    </div>
  );
};

export default PageDetailsPage; 