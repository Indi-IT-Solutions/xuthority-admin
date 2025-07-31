import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useBlog, useDeleteBlog } from '@/hooks/useBlog';
import { Blog } from '@/services/blogService';
import { NotFoundPage, EmptyState } from '@/components/common';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  console.log('ResourceDetailPage mounted with ID:', id);

  // Fetch the main resource/blog
  const { 
    data: resourceResponse, 
    isLoading: resourceLoading, 
    error: resourceError,
    refetch: refetchResource
  } = useBlog(id || '');

  // Extract the actual resource data from the response
  const resource = resourceResponse?.data;

  // Debug: Log the resource data
  console.log('Resource Detail Page Debug:', {
    id,
    resourceResponse,
    resource,
    resourceLoading,
    resourceError
  });

  // State for confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | null;
  }>({
    isOpen: false,
    type: null,
  });

  // Delete mutation
  const deleteBlogMutation = useDeleteBlog();

  const handleEdit = () => {
    if (resource?._id) {
      navigate(`/resource-center/edit/${resource._id}`);
    }
  };

  const handleDelete = () => {
    setConfirmModal({ isOpen: true, type: 'delete' });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null });
  };

  const handleConfirmDelete = async () => {
    if (!resource?._id) return;

    try {
      await deleteBlogMutation.mutateAsync(resource._id);
      toast.success('Resource deleted successfully!');
      navigate('/resource-center');
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete resource');
    } finally {
      closeConfirmModal();
    }
  };

  const handleWatchNow = () => {
    if (resource?.watchUrl) {
      try {
        window.open(resource.watchUrl, '_blank');
      } catch (error) {
        console.error('Failed to open watch URL:', error);
        // Fallback: try to navigate to the URL
        window.location.href = resource.watchUrl;
      }
    }
  };

  // Handle missing id parameter
  if (!id) {
    return (
      <NotFoundPage 
        title="Resource not found"
        description="The resource URL is invalid or incomplete."
        buttonText="Browse Resources"
        navigateTo="/resource-center"
        containerHeight="min-h-screen"
      />
    );
  }

  // Handle resource loading error
  if (resourceError) {
    return (
      <NotFoundPage 
        title="Failed to load resource"
        description="Something went wrong while loading the resource. Please try again."
        buttonText="Go Back to Resources"
        navigateTo="/resource-center"
        containerHeight="min-h-screen"
        showBackButton={false}
      />
    );
  }

  // Debug: Show loading state info
  console.log('Render state:', { resourceLoading, resource, resourceError });

  // Handle resource not found
  if (!resourceLoading && !resource) {
    return (
      <NotFoundPage 
        title="Resource not found"
        description="The resource you're looking for doesn't exist or has been removed."
        buttonText="Browse Resources"
        navigateTo="/resource-center"
        containerHeight="min-h-screen"
      />
    );
  }

  // Debug: Show raw data if resource exists but doesn't have expected structure
  if (resource && (!resource.title || !resource.description)) {
    console.log('Resource has unexpected structure:', resource);
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Resource Data (Debug)</h1>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(resource, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (resourceLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 py-16">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Header */}
      <div className="w-full lg:max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span 
              className="text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => navigate('/resource-center')}
            >
              Resource Center
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">
              {resource?.resourceCategoryId?.name || 'Resource'} Details
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-blue-100 hover:bg-blue-100/50"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-red-100 hover:bg-red-100/50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden h-48 sm:h-[500px]" 
        style={{ 
          backgroundImage: resource.mediaUrl ? `url(${resource.mediaUrl})` : 'none', 
          backgroundSize: 'cover', 
          backgroundPosition: 'top',
        }}
      />
      
      {/* Main Content Section */}
      <div className="w-full lg:max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="inline-flex">
            <div className="text-red-600 py-1 text-lg font-semibold rounded">
              On Demand
            </div>
          </div>

          {/* Content Title */}
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {resource.title}
          </h2>

          {/* Description */}
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              {resource.description}
            </p>

            {/* Watch Now Button */}
            <div className="pt-4">
              {resource.watchUrl && (
                <Button
                  onClick={handleWatchNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Watch Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

            {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={closeConfirmModal}
        onConfirm={handleConfirmDelete}
        title="Delete Resource"
        description={`Are you sure you want to delete "${resource?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={deleteBlogMutation.isPending}
      />
    </div>
  );
};

export default ResourceDetailPage; 