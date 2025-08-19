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
import { ResourceEditSkeleton } from '@/components/common';
import { queryClient } from '@/lib/queryClient';

// Resource Type options (matching backend resource categories)
const RESOURCE_TYPE_OPTIONS = [
  { value: 'webinars', label: 'Webinars' },
  { value: 'xuthority-edge', label: 'XUTHORITY Edge' },
  { value: 'guides-and-tips', label: 'Guides and Tips' },
  { value: 'success-hub', label: 'Success Hub' },
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
  bannerFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'File size must be less than 5MB')
    .refine((file) => {
      if (!file) return true;
      return file.type.startsWith('image/');
    }, 'File must be an image'),
  thumbnailFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024;
    }, 'File size must be less than 5MB')
    .refine((file) => {
      if (!file) return true;
      return file.type.startsWith('image/');
    }, 'File must be an image')
});

type EditResourceFormData = z.infer<typeof editResourceSchema>;

const EditResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminStore();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [selectedThumb, setSelectedThumb] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const [currentThumbUrl, setCurrentThumbUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Dimensions
  const BANNER_MIN_WIDTH = 1200;
  const BANNER_MIN_HEIGHT = 600;
  const BANNER_MAX_WIDTH = 3840;
  const BANNER_MAX_HEIGHT = 2160;
  const THUMB_MIN_WIDTH = 300;
  const THUMB_MIN_HEIGHT = 300;
  const THUMB_MAX_WIDTH = 2000;
  const THUMB_MAX_HEIGHT = 2000;

  // Fetch existing resource data
  const { data: resourceData, isLoading: isLoadingResource, error: resourceError, refetch } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      if (!id) throw new Error('Resource ID is required');
      const response = await BlogService.getBlogById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Fetch resource categories
  const { categories: resourceCategories } = useResourceCategories();

  // Update mutation
  const updateResourceMutation = useMutation({
    mutationFn: async (data: EditResourceFormData) => {
      if (!id) throw new Error('Resource ID is required');
      
      let mediaUrl = currentBannerUrl; // Keep existing banner by default
      let thumbnailUrl = currentThumbUrl; // Keep existing thumbnail by default

      // Upload changed files
      setIsFileUploading(true);
      try {
        if (data.bannerFile) {
          const uploadResponse = await FileUploadService.uploadFile(data.bannerFile);
          if (!uploadResponse.success) throw new Error(uploadResponse.error?.message || 'Failed to upload banner');
          mediaUrl = FileUploadService.getFileUrl(uploadResponse.data);
        }
        if (data.thumbnailFile) {
          const uploadResponse = await FileUploadService.uploadFile(data.thumbnailFile);
          if (!uploadResponse.success) throw new Error(uploadResponse.error?.message || 'Failed to upload thumbnail');
          thumbnailUrl = FileUploadService.getFileUrl(uploadResponse.data);
        }
      } finally {
        setIsFileUploading(false);
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
        mediaUrl: mediaUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
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
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-with-fallback'] });
      queryClient.invalidateQueries({ queryKey: ['resource', id] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
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

  // Utility to read image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        resolve({ width, height });
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
      img.src = objectUrl;
    });
  };

  // Upload handlers
  const handleBannerSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validation = FileUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }
    try {
      const { width, height } = await getImageDimensions(file);
      if (width < BANNER_MIN_WIDTH || height < BANNER_MIN_HEIGHT) {
        toast.error(`Banner too small. Required at least ${BANNER_MIN_WIDTH}x${BANNER_MIN_HEIGHT}px. Uploaded: ${width}x${height}px`);
        return;
      }
      if (width > BANNER_MAX_WIDTH || height > BANNER_MAX_HEIGHT) {
        toast.error(`Banner too large. Max allowed ${BANNER_MAX_WIDTH}x${BANNER_MAX_HEIGHT}px. Uploaded: ${width}x${height}px`);
        return;
      }
    } catch {
      toast.error('Unable to read image dimensions. Please try a different image.');
      return;
    }
    setSelectedBanner(file);
    setBannerPreview(URL.createObjectURL(file));
    setValue('bannerFile', file as any);
    await trigger('bannerFile');
  };

  const handleThumbSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validation = FileUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }
    try {
      const { width, height } = await getImageDimensions(file);
      if (width < THUMB_MIN_WIDTH || height < THUMB_MIN_HEIGHT) {
        toast.error(`Thumbnail too small. Required at least ${THUMB_MIN_WIDTH}x${THUMB_MIN_HEIGHT}px. Uploaded: ${width}x${height}px`);
        return;
      }
      if (width > THUMB_MAX_WIDTH || height > THUMB_MAX_HEIGHT) {
        toast.error(`Thumbnail too large. Max allowed ${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}px. Uploaded: ${width}x${height}px`);
        return;
      }
    } catch {
      toast.error('Unable to read image dimensions. Please try a different image.');
      return;
    }
    setSelectedThumb(file);
    setThumbPreview(URL.createObjectURL(file));
    setValue('thumbnailFile', file as any);
    await trigger('thumbnailFile');
  };

  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBannerSelect(file);
  };
  const handleThumbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleThumbSelect(file);
  };
  const handleUploadBannerClick = () => bannerInputRef.current?.click();
  const handleUploadThumbClick = () => thumbInputRef.current?.click();

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

    const resetData = {
      title: resourceData.title || '',
      resourceType: resourceTypeSlug,
      contentType: resourceData.tag || '',
      description: resourceData.description || '',
      videoLink: resourceData.watchUrl || ''
    };

    return resetData;
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
      if (resourceData.mediaUrl && currentBannerUrl !== resourceData.mediaUrl) {
        setCurrentBannerUrl(resourceData.mediaUrl);
        setBannerPreview(resourceData.mediaUrl);
      }
      if (resourceData.thumbnailUrl && currentThumbUrl !== resourceData.thumbnailUrl) {
        setCurrentThumbUrl(resourceData.thumbnailUrl);
        setThumbPreview(resourceData.thumbnailUrl);
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
  }, [resourceData, formResetData, resetForm, currentBannerUrl, currentThumbUrl, getValues]);

  // Refetch data when component mounts to ensure latest data
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const onSubmit = async (data: EditResourceFormData) => {
    try {
      const isValid = await trigger();
      if (!isValid) return;
      await updateResourceMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Loading state
  if (isLoadingResource) {
    return <ResourceEditSkeleton />;
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
            <span onClick={()=>navigate('/resource-center')} className='cursor-pointer'>Resource Center</span>
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
              <div className="mb-8 min-w-full">
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  Upload Banner Image
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden h-48 sm:h-[500px] text-center transition-colors bg-gray-50 ",
                    !isFormDisabled && "cursor-pointer",
                    isFormDisabled && "opacity-50 cursor-not-allowed",
                    !isFormDisabled && isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300',
                    !isFormDisabled && !isDragActive && 'hover:border-gray-400 hover:bg-gray-100'
                  )}
                  onDragOver={!isFormDisabled ? (e) => { e.preventDefault(); setIsDragActive(true); } : undefined}
                  onDragLeave={!isFormDisabled ? (e) => { e.preventDefault(); setIsDragActive(false); } : undefined}
                  onDrop={!isFormDisabled ? (e) => { e.preventDefault(); setIsDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleBannerSelect(f); } : undefined}
                  onClick={!isFormDisabled ? handleUploadBannerClick : undefined}
                >
                  {bannerPreview ? (
                    <img className="w-full overflow-hidden h-48 sm:h-[500px]" src={bannerPreview} />
                  ) : (
                    <div className="space-y-4 flex flex-col justify-center items-center h-full">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium text-lg">Upload Banner</p>
                        <p className="text-gray-600 font-medium text-xs">Drag and drop an image here, or click to select</p>
                        <p className='text-gray-600 text-xs'>Required: min {BANNER_MIN_WIDTH}x{BANNER_MIN_HEIGHT}px, max {BANNER_MAX_WIDTH}x{BANNER_MAX_HEIGHT}px</p>
                        <p className='text-red-500 text-xs'> Max file size 5MB allowed </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*,.svg"
                    onChange={handleBannerInputChange}
                    disabled={isFormDisabled}
                    className="hidden"
                  />
                </div>
              </div>

               <div className='flex flex-col lg:flex-row gap-4 '>
                {/* Thumbnail Upload */}
                <div className="lg:mb-8 ">
                  <Label className="text-base font-medium text-gray-900 mb-4 block">
                    Upload Thumbnail Image
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-2xl min-w-full max-w-[400px] md:w-[400px] h-[234px] text-center transition-colors bg-gray-50  overflow-hidden"
                    )}
                    onClick={!isFormDisabled ? handleUploadThumbClick : undefined}
                  >
                    {thumbPreview ? (
                      <div className="relative  overflow-hidden bg-gray-100">
                        <img
                          src={thumbPreview}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover transition-transform duration-300 "
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 flex flex-col justify-center items-center w-full h-[234px]" >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium text-lg">Upload Thumbnail</p>
                          <p className="text-gray-600 font-medium text-xs">Click to select a thumbnail image</p>
                          <p className='text-gray-600 text-xs'>Required: min {THUMB_MIN_WIDTH}x{THUMB_MIN_HEIGHT}px, max {THUMB_MAX_WIDTH}x{THUMB_MAX_HEIGHT}px</p>
                          <p className='text-red-500 text-xs'> Max file size 5MB allowed </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*,.svg"
                      onChange={handleThumbInputChange}
                      disabled={isFormDisabled}
                      className="hidden"
                    />
                  </div>
                </div>
                  {/* Form Fields Row */}
              <div className="grid grid-cols-4 gap-6 lg:mb-8 py-10  w-full">
                {/* Title */}
                <div className='col-span-4  '>
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
                <div className='col-span-4 lg:col-span-2 '>
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
                <div className='col-span-4 lg:col-span-2 '>
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