import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ResourceCard from '@/components/common/ResourceCard';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useResourceDelete } from '@/hooks/useResourceDelete';
import { useResourceCategories } from '@/hooks/useResourceCategories';
import { useAdminBlogsWithFallback } from '@/hooks/useAdminBlogsWithFallback';

import { cn } from '@/lib/utils';

interface ResourceCardAuthor {
  name: string;
  title: string;
  avatar?: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'On Demand' | 'Upcoming';
  contentType: string;
  author: ResourceCardAuthor;
}

type TabType = 'All' | 'Webinars' | 'XUTHORITY Edge' | 'Guides and Tips' | 'Success Hub';

const ResourceCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { deleteState, isDeleting, openDeleteModal, closeDeleteModal, confirmDelete } = useResourceDelete();
  
  // Fetch resource categories to map tab names to category IDs
  const { categories } = useResourceCategories();
  
  // Map tab names to resource category IDs
  const getCategoryId = (tab: TabType): string | undefined => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    if (!safeCategories || safeCategories.length === 0) return undefined;
    
    const categoryMap = {
      'Webinars': 'webinars',
      'XUTHORITY Edge': 'xuthority-edge',
      'Guides and Tips': 'guides-and-tips', 
      'Success Hub': 'success-hub'
    };
    
    const targetSlug = categoryMap[tab];
    if (!targetSlug) return undefined;
    
    const category = safeCategories.find(cat => cat.slug === targetSlug);
    return category?._id;
  };
  
  // Map tabs to API filtering parameters
  const getTabParams = (tab: TabType) => {
    const baseParams = {
      limit: 10,
      page: currentPage,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const
    };

    // For 'All' tab, fetch more items to categorize and show latest 3 from each
    const allTabParams = {
      limit: 50, // Fetch more items to have enough for categorization
      page: 1, // Always get from first page for All tab to get latest items
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const
    };

    // For specific tabs, filter by resource category ID
    if (tab !== 'All') {
      const categoryId = getCategoryId(tab);
      if (categoryId) {
        return { ...baseParams, resourceCategoryId: categoryId };
      }
      // Fallback to search if no category mapping found
      return { ...baseParams, search: tab.toLowerCase() };
    }
    
    // For 'All' tab, get all content
    return allTabParams;
  };

  // Fetch blogs from API based on active tab with fallback logic
  const { blogs, pagination, isLoading, error, refetch } = useAdminBlogsWithFallback(getTabParams(activeTab));

  // Transform blog to ResourceItem format
  const transformBlogToResourceItem = (blog: any): ResourceItem => {
    // Only include valid content types
    const validContentTypes = ['On Demand', 'Upcoming', 'EBook', 'Marketing', 'Sales'];
    const contentType = validContentTypes.includes(blog.tag) ? blog.tag : '';
    
    return {
      id: blog._id,
      title: blog.title,
      description: blog.description,
      imageUrl: blog.mediaUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80',
      status: blog.status === 'active' ? 'On Demand' : 'Upcoming',
      contentType,
      author: {
        name: blog.authorName || blog.createdBy?.name || 'Unknown Author',
        title: blog.designation || 'Content Creator',
        avatar: undefined
      }
    };
  };

  // Transform all blogs to ResourceItem format (no categorization needed since API filters)
  const resourceItems = useMemo(() => {
    return blogs.map(transformBlogToResourceItem);
  }, [blogs]);

  const tabs: TabType[] = ['All', 'Webinars', 'XUTHORITY Edge', 'Guides and Tips', 'Success Hub'];

  // Handle tab change with page reset
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset to first page when changing tabs
    // For 'All' tab, pagination doesn't apply, but reset anyway for consistency
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    const blog = blogs.find(b => b._id === id);
    const title = blog?.title || 'this resource';
    openDeleteModal(id, title);
    // Note: Actual deletion and refetch happens in useResourceDelete hook
  };

  const handleResourceClick = (id: string) => {
    navigate(`/resource-center/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/resource-center/edit/${id}`);
    // Note: Data refetch happens automatically when returning due to query invalidation in EditResourcePage
  };

  const handleAddNewResource = () => {
    navigate('/resource-center/add');
  };

  // Group resources by actual category for proper categorization
  const getTabResources = () => {
    // Ensure categories is an array
    const safeCategories = Array.isArray(categories) ? categories : [];
    
    switch (activeTab) {
      case 'Webinars':
        return { webinars: resourceItems, xuthorityEdge: [], guides: [], successHub: [] };
      case 'XUTHORITY Edge':
        return { webinars: [], xuthorityEdge: resourceItems, guides: [], successHub: [] };
      case 'Guides and Tips':
        return { webinars: [], xuthorityEdge: [], guides: resourceItems, successHub: [] };
      case 'Success Hub':
        return { webinars: [], xuthorityEdge: [], guides: [], successHub: resourceItems };
      default: // 'All' tab shows latest 3 from each category based on actual resourceCategoryId
                 // Group blogs by their actual resource category slug
         const groupedByCategory = blogs.reduce((acc: any, blog: any) => {
           // Get the category slug from the blog's resourceCategoryId
           let categorySlug = '';
           if (blog.resourceCategoryId && typeof blog.resourceCategoryId === 'object' && blog.resourceCategoryId.slug) {
             categorySlug = blog.resourceCategoryId.slug;
           } else if (safeCategories.length > 0) {
             // Fallback: find category by ID if it's just a string
             const category = safeCategories.find(cat => cat._id === blog.resourceCategoryId);
             categorySlug = category?.slug || '';
           }
           
           // Debug: Log categorization
           console.log('Blog:', blog.title, 'Category Slug:', categorySlug, 'ResourceCategoryId:', blog.resourceCategoryId);
           
           if (!acc[categorySlug]) {
             acc[categorySlug] = [];
           }
           acc[categorySlug].push(transformBlogToResourceItem(blog));
           return acc;
         }, {});

         // Debug: Log grouped categories
         console.log('Grouped by category:', Object.keys(groupedByCategory), groupedByCategory);

                 // Map category slugs to our display categories and get latest 3 from each
         let webinarItems = (groupedByCategory['webinars'] || []).slice(0, 3);
         let edgeItems = (groupedByCategory['xuthority-edge'] || []).slice(0, 3);
         let guideItems = (groupedByCategory['guides-and-tips'] || []).slice(0, 3);
         let successHubItems = (groupedByCategory['success-hub'] || []).slice(0, 3);
         
         // Handle any other categories (case-studies, white-papers, etc.)
         const otherCategories = Object.keys(groupedByCategory).filter(slug => 
           !['webinars', 'xuthority-edge', 'guides-and-tips', 'success-hub'].includes(slug) && slug
         );
         
         // Add items from other categories to appropriate sections if there's room
         otherCategories.forEach(slug => {
           const items = groupedByCategory[slug].slice(0, 3);
           console.log(`Found additional category: ${slug} with ${items.length} items`);
           // Put case-studies and white-papers in guides section if there's room
           if (slug === 'case-studies' || slug === 'white-papers') {
             if (guideItems.length < 3) {
               guideItems = [...guideItems, ...items.slice(0, 3 - guideItems.length)];
             }
           }
         });
         
         return { 
           webinars: webinarItems, 
           xuthorityEdge: edgeItems, 
           guides: guideItems,
           successHub: successHubItems
         };
    }
  };

  const { webinars, xuthorityEdge, guides, successHub } = getTabResources();

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Resource Center
          </h1>
          <Button 
            onClick={handleAddNewResource}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Resource
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="bg-gray-100 p-1 rounded-full w-fit max-w-full overflow-hidden">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  disabled={isLoading}
                  className={cn(
                    'px-6 py-2 text-sm font-medium rounded-full h-12 transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 flex items-center gap-2',
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200',
                    isLoading && activeTab === tab && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {tab}
                  {isLoading && activeTab === tab && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load resources</h3>
            <p className="text-gray-600 mb-4">There was an error loading the resource center content.</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Content Sections */}
        {!isLoading && !error && (
          <div className="space-y-12">
    

            {/* Webinars Section */}
            {webinars.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'Webinars' ? activeTab : 'Webinars'}
                    {activeTab === 'All' && webinars.length > 0 && (
                      <span className="ml-2 text-lg text-gray-500">({webinars.length})</span>
                    )}
                  </h2>
                  {activeTab === 'All' && (
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer" onClick={()=>handleTabChange('Webinars')}>
                      View All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {webinars.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      {...resource}
                      onEdit={() => handleEdit(resource.id)}
                      onDelete={() => handleDelete(resource.id)}
                      onClick={() => handleResourceClick(resource.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* XUTHORITY Edge Section */}
            {xuthorityEdge.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'XUTHORITY Edge' ? activeTab : 'XUTHORITY Edge'}
                    {activeTab === 'All' && xuthorityEdge.length > 0 && (
                      <span className="ml-2 text-lg text-gray-500">({xuthorityEdge.length})</span>
                    )}
                  </h2>
                  {activeTab === 'All' && (
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer" onClick={()=>handleTabChange('XUTHORITY Edge')}>
                      View All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {xuthorityEdge.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      {...resource}
                      onEdit={() => handleEdit(resource.id)}
                      onDelete={() => handleDelete(resource.id)}
                      onClick={() => handleResourceClick(resource.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Guides and Tips Section */}
            {guides.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'Guides and Tips' ? activeTab : 'Guides and Tips'}
                    {activeTab === 'All' && guides.length > 0 && (
                      <span className="ml-2 text-lg text-gray-500">({guides.length})</span>
                    )}
                  </h2>
                  {activeTab === 'All' && (
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer" onClick={()=>handleTabChange('Guides and Tips')}>
                      View All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guides.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      {...resource}
                      onEdit={() => handleEdit(resource.id)}
                      onDelete={() => handleDelete(resource.id)}
                      onClick={() => handleResourceClick(resource.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Success Hub Section */}
            {successHub && successHub.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'Success Hub' ? activeTab : 'Success Hub'}
                    {activeTab === 'All' && successHub && successHub.length > 0 && (
                      <span className="ml-2 text-lg text-gray-500">({successHub.length})</span>
                    )}
                  </h2>
                  {activeTab === 'All' && (
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm underline cursor-pointer" onClick={()=>handleTabChange('Success Hub')}>
                      View All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {successHub.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      {...resource}
                      onEdit={() => handleEdit(resource.id)}
                      onDelete={() => handleDelete(resource.id)}
                      onClick={() => handleResourceClick(resource.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State for Success Hub when no items found */}
            {activeTab === 'Success Hub' && (!successHub || successHub.length === 0) && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Success Hub Resources Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  There are currently no resources in the Success Hub category. Check back later or add some success-related content.
                </p>
              </div>
            )}

            {/* Empty State for No Resources Found */}
            {activeTab !== 'Success Hub' && activeTab !== 'All' && resourceItems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  There are currently no resources in the {activeTab} category. Check back later or try a different category.
                </p>
              </div>
            )}

            {/* Empty State for All Tab when no resources */}
            {activeTab === 'All' && resourceItems.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  There are currently no resources available. Add some resources to get started.
                </p>
                <Button 
                  onClick={handleAddNewResource}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Resource
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls - Only show for specific tabs, not for 'All' tab */}
        {!isLoading && !error && pagination && pagination.totalPages > 1 && activeTab !== 'All' && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === pagination.totalPages || 
                         Math.abs(page - currentPage) <= 2;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  if (index > 0 && page - array[index - 1] > 1) {
                    return [
                      <span key={`ellipsis-${page}`} className="px-2 text-gray-500">...</span>,
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={currentPage === page ? "bg-blue-600 text-white" : ""}
                        disabled={isLoading}
                      >
                        {page}
                      </Button>
                    ];
                  }
                  
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={currentPage === page ? "bg-blue-600 text-white" : ""}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>
            
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={currentPage === pagination.totalPages || isLoading}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}

        {/* Pagination Info - Only show for specific tabs, not for 'All' tab */}
        {!isLoading && !error && pagination && activeTab !== 'All' && (
          <div className=" text-sm text-gray-600 mt-4">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalItems)} of {pagination.totalItems} resources
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteState.isModalOpen}
          onOpenChange={closeDeleteModal}
          onConfirm={confirmDelete}
          title="Are you sure you want to delete this resource?"
          description="This action is permanent. Deleting this resource will remove it from the Resource Center and make it inaccessible to all users."
          confirmText="Yes I'm Sure"
          cancelText="Cancel"
          confirmVariant="destructive"
          isLoading={isDeleting}
        />
      </div>
  );
};

export default ResourceCenterPage; 