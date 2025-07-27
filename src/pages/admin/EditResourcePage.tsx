import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon } from 'lucide-react';
import { useResourceCategories } from '@/hooks/useResourceCategories';
import { BlogService } from '@/services/blogService';
import { FileUploadService } from '@/services/fileUpload';
import useAdminStore from '@/store/useAdminStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EnhancedLoader from '@/components/common/EnhancedLoader';
import { queryClient } from '@/lib/queryClient';

// Resource Type options (matching backend resource categories)
const RESOURCE_TYPE_OPTIONS = [
  { value: 'webinars', label: 'Webinars' },
  { value: 'xuthority-edge', label: 'XUTHORITY Edge' },
  { value: 'guides-and-tips', label: 'Guides and Tips' },
  { value: 'success-hub', label: 'Success Hub' },
  { value: 'case-studies', label: 'Case Studies' },
  { value: 'white-papers', label: 'White Papers' }
];

// Content Type options (matching backend validation)
const CONTENT_TYPE_OPTIONS = [
  { value: 'On Demand', label: 'On Demand' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'EBook', label: 'EBook' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' }
];

// Zod schema for form validation (modified for edit - mediaFile is optional for updates)
const editResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .refine((val) => val.length > 0, 'Title cannot be empty'),
    resourceType: z
    .string()
    .min(1, 'Resource type is required')
    .refine((val) => val.length > 0, 'Please select a resource type'),
  contentType: z
    .string()
    .min(1, 'Content type is required')  
    .refine((val) => val.length > 0, 'Please select a content type'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters')
    .refine((val) => val.length > 0, 'Description cannot be empty'),
  videoLink: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL'),
  mediaFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true; // Optional for edits
      return file.size <= 5 * 1024 * 1024; // 5MB
    }, 'File size must be less than 5MB')
    .refine((file) => {
      if (!file) return true; // Optional for edits
      return file.type.startsWith('image/');
    }, 'File must be an image')
});

type EditResourceFormData = z.infer<typeof editResourceSchema>;

const EditResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Fetch existing resource data
  const { data: resourceData, isLoading: isLoadingResource, error: resourceError } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      if (!id) throw new Error('Resource ID is required');
      const response = await BlogService.getBlogById(id);
      return response.data;
    },
    enabled: !!id
  });

  // Fetch resource categories
  const { categories: resourceCategories } = useResourceCategories();

  // Update mutation
  const updateResourceMutation = useMutation({
    mutationFn: async (data: EditResourceFormData) => {
      if (!id) throw new Error('Resource ID is required');
      
      let mediaUrl = currentImageUrl; // Keep existing image by default

      // Handle file upload if new file is selected
      if (data.mediaFile) {
        if (data.mediaFile.size > 5 * 1024 * 1024) {
          toast.error('File size must be less than 5MB');
          return;
        }

        setIsFileUploading(true);
        const uploadResponse = await FileUploadService.uploadFile(data.mediaFile);
        setIsFileUploading(false);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Failed to upload image');
        }
        mediaUrl = FileUploadService.getFileUrl(uploadResponse.data);
      }

      // Find resource category
      const resourceCategory = resourceCategories?.find(cat => cat.slug === data.resourceType) ||
                              RESOURCE_TYPE_OPTIONS.find(opt => opt.value === data.resourceType);
      
      if (!resourceCategory) {
        throw new Error('Invalid resource type selected');
      }

      // Create update data
      const updateData = {
        title: data.title.trim(),
        description: data.description.trim(),
        authorName: user.firstName + ' ' + user.lastName,
        designation: user.role || 'Admin',
        mediaUrl: mediaUrl,
        watchUrl: data.videoLink?.trim() || undefined,
        tag: data.contentType,
        resourceCategoryId: ('_id' in resourceCategory) ? resourceCategory._id : resourceCategory.value,
        status: 'active' as const
      };

      const response = await BlogService.updateBlog(id, updateData);
      return response;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Resource updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
      navigate('/resource-center');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update resource';
      toast.error(errorMessage);
      setIsFileUploading(false);
    }
  });

  // Combined loading state for disabling form
  const isFormDisabled = isFileUploading || updateResourceMutation.isPending;

  // Form setup
  const methods = useForm<EditResourceFormData>({
    resolver: zodResolver(editResourceSchema),
    mode: 'onTouched', // Only validate after user interaction
    defaultValues: {
      title: '',
      resourceType: '',
      contentType: '',
      description: '',
      videoLink: '',
    },
  });

  const { handleSubmit, setValue, reset, getValues, register, control, trigger, formState: { isSubmitting, errors, touchedFields, isSubmitted }, clearErrors } = methods;

  // Helper function to determine when to show error styling
  const shouldShowError = (fieldName: keyof EditResourceFormData) => {
    return errors[fieldName] && (touchedFields[fieldName] || isSubmitted);
  };

  // Memoize the form reset data to prevent unnecessary re-renders
  const formResetData = useMemo(() => {
    if (!resourceData) return null;

    // Find the resource type slug from the category
    const resourceCategory = resourceData.resourceCategoryId;
    let resourceTypeSlug = '';
    
    if (resourceCategory && typeof resourceCategory === 'object' && 'slug' in resourceCategory) {
      resourceTypeSlug = resourceCategory.slug;
    } else if (resourceCategories && typeof resourceCategory === 'string') {
      const category = resourceCategories.find(cat => cat._id === resourceCategory);
      resourceTypeSlug = category?.slug || '';
    }

    return {
      title: resourceData.title || '',
      resourceType: resourceTypeSlug,
      contentType: resourceData.tag || '',
      description: resourceData.description || '',
      videoLink: resourceData.watchUrl || ''
    };
  }, [resourceData, resourceCategories]);

  // Memoize the reset function to prevent it from changing on every render
  const resetForm = useCallback((data: any) => {
    reset(data);
    clearErrors();
  }, [reset, clearErrors]);

  // Pre-populate form when resource data is loaded
  useEffect(() => {
    if (resourceData && formResetData) {
      // Set current image URL for preview
      if (resourceData.mediaUrl && currentImageUrl !== resourceData.mediaUrl) {
        setCurrentImageUrl(resourceData.mediaUrl);
        setPreviewUrl(resourceData.mediaUrl);
      }
      
      // Only reset if the form data has actually changed
      const currentValues = getValues();
      const hasChanged = Object.keys(formResetData).some(key => 
        currentValues[key as keyof typeof currentValues] !== formResetData[key as keyof typeof formResetData]
      );
      
      if (hasChanged) {
        resetForm(formResetData);
      }
    }
  }, [resourceData, formResetData, resetForm, currentImageUrl, getValues]);


  // File upload handlers (same as AddResourcePage)
  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validation = FileUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setValue('mediaFile', file);
    setPreviewUrl(URL.createObjectURL(file));
    
    trigger('mediaFile');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: EditResourceFormData) => {
    try {
      // Trigger validation for all fields before submission
      const isValid = await trigger();
      if (!isValid) {
        return; // Stop submission if validation fails
      }
      
      await updateResourceMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/resource-center');
  };

  // Loading state
  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EnhancedLoader loadingText="Loading resource data..." />
      </div>
    );
  }

  // Error state
  if (resourceError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Resource</h2>
          <p className="text-gray-600 mb-4">Unable to load the resource data.</p>
          <Button onClick={() => navigate('/resource-center')}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  if (!resourceData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
          <p className="text-gray-600 mb-4">The resource you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/resource-center')}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
            <span>Resource Center</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Edit Resource</span>
          </div>
          <Button
            type="submit"
            form="edit-resource-form"
            disabled={isFormDisabled}
            loading={isFileUploading || updateResourceMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium"
          >
            Update
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-4">
        <FormProvider {...methods}>
          <form id="edit-resource-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Resource Details Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">Resource Details</h2>

              {/* Upload Banner/Thumbnail Section */}
              <div className="mb-8">
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  Upload Banner/Thumbnail Image 
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl h-46 text-center transition-colors bg-gray-50 max-w-md overflow-hidden",
                    !isFormDisabled && "cursor-pointer",
                    isFormDisabled && "opacity-50 cursor-not-allowed",
                    !isFormDisabled && isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300',
                    !isFormDisabled && !isDragActive && 'hover:border-gray-400 hover:bg-gray-100',
                    shouldShowError('mediaFile') && 'border-red-500 bg-red-50'
                  )}
                  onDragOver={!isFormDisabled ? handleDragOver : undefined}
                  onDragLeave={!isFormDisabled ? handleDragLeave : undefined}
                  onDrop={!isFormDisabled ? handleDrop : undefined}
                  onClick={!isFormDisabled ? handleUploadAreaClick : undefined}
                >
                  {previewUrl ? (
                    <div className="relative h-46">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                   
                  
                    </div>
                  ) : (
                    <div className="space-y-4 flex flex-col justify-center items-center h-46">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium text-lg">Upload Banner/Thumbnail</p>
                        <p className="text-gray-600 font-medium text-xs">Drag and drop an image here, or click to select</p>
                        <p className='text-red-500 text-xs'> Max file size 5MB allowed </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isFormDisabled}
                    className="hidden"
                  />
                </div>
                {shouldShowError('mediaFile') && (
                  <p className="mt-2 text-sm text-red-600">{errors.mediaFile?.message}</p>
                )}
              </div>

              {/* Form Fields Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Title */}
                <div>
                  <Label className="text-base font-medium text-gray-900 mb-3 block">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('title')}
                    placeholder="Enter title"
                    disabled={isFormDisabled}
                    className={cn(
                      "rounded-full h-14",
                      shouldShowError('title') && "border-red-500"
                    )}
                  />
                  {shouldShowError('title') && (
                    <p className="mt-2 text-sm text-red-600">{errors.title?.message}</p>
                  )}
                </div>

                {/* Resource Type */}
                <div>
                  <Label className="text-base font-medium text-gray-900 mb-3 block">
                    Resource Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="resourceType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          trigger('resourceType');
                        }}
                        value={field.value}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger className={cn(
                          "h-14 rounded-full border-gray-300",
                          shouldShowError('resourceType') && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Use backend categories if available, fallback to hardcoded */}
                          {(resourceCategories || RESOURCE_TYPE_OPTIONS).map((option) => (
                            <SelectItem 
                              key={option.slug || option.value} 
                              value={option.slug || option.value}
                            >
                              {option.name || option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {shouldShowError('resourceType') && (
                    <p className="mt-2 text-sm text-red-600">{errors.resourceType?.message}</p>
                  )}
                </div>

                {/* Content Type */}
                <div>
                  <Label className="text-base font-medium text-gray-900 mb-3 block">
                    Content Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="contentType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          trigger('contentType');
                        }}
                        value={field.value}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger className={cn(
                          "h-14 rounded-full border-gray-300",
                          shouldShowError('contentType') && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {shouldShowError('contentType') && (
                    <p className="mt-2 text-sm text-red-600">{errors.contentType?.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register('description')}
                  placeholder="Enter description here..."
                  rows={6}
                  disabled={isFormDisabled}
                  className={cn(
                    "rounded-lg max-h-[400px] min-h-[200px] resize-none",
                    shouldShowError('description') && "border-red-500"
                  )}
                />
                {shouldShowError('description') && (
                  <p className="mt-2 text-sm text-red-600">{errors.description?.message}</p>
                )}
              </div>

              {/* Video Link */}
              <div>
                <Label className="text-base font-medium text-gray-900 mb-3 block">
                  Video Link <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  {...register('videoLink')}
                  placeholder="add video link"
                  type="url"
                  disabled={isFormDisabled}
                  className={cn(
                    "rounded-full h-14",
                    shouldShowError('videoLink') && "border-red-500"
                  )}
                />
                {shouldShowError('videoLink') && (
                  <p className="mt-2 text-sm text-red-600">{errors.videoLink?.message}</p>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EditResourcePage; 