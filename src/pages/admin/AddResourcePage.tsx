import React, { useState, useRef } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/FormInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageIcon, X, ArrowLeft } from 'lucide-react';
import { useCreateBlog, useResourceCategories } from '@/hooks/useBlog';
import { FileUploadService } from '@/services/fileUpload';
import useAdminStore from '@/store/useAdminStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

// Zod schema for form validation (matching backend blog schema)
const addResourceSchema = z.object({
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
    .instanceof(File, { message: 'Banner image is required' })
    .refine((file) => file && file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => file && file.type.startsWith('image/'), 'File must be an image'),
  thumbnailFile: z
    .instanceof(File, { message: 'Thumbnail image is required' })
    .refine((file) => file && file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => file && file.type.startsWith('image/'), 'File must be an image')
});

type AddResourceFormData = z.infer<typeof addResourceSchema>;

const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAdminStore();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null);
  const [selectedThumb, setSelectedThumb] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Banner required resolution (min and max bounds)
  const BANNER_MIN_WIDTH = 1200;
  const BANNER_MIN_HEIGHT = 600;
  const BANNER_MAX_WIDTH = 3840;
  const BANNER_MAX_HEIGHT = 2160;

  // Thumbnail required resolution (min and max bounds)
  const THUMB_MIN_WIDTH = 300;
  const THUMB_MIN_HEIGHT = 300;
  const THUMB_MAX_WIDTH = 2000;
  const THUMB_MAX_HEIGHT = 2000;

  // API hooks
  const createBlogMutation = useCreateBlog();
  const { data: resourceCategories } = useResourceCategories();

  // Combined loading state for disabling form
  const isFormDisabled = isFileUploading || createBlogMutation.isPending;

  // Form setup
  const methods = useForm<AddResourceFormData>({
    resolver: zodResolver(addResourceSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      title: '',
      resourceType: '',
      contentType: '',
      description: '',
      videoLink: '',
    },
  });

  const { handleSubmit, setValue, reset, register, control, trigger, formState: { isSubmitting, errors } } = methods;

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

  // Banner upload handlers
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

    // Validate image resolution
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
    setValue('bannerFile', file as any);
    setBannerPreview(URL.createObjectURL(file));
    await trigger('bannerFile');
  };

  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBannerSelect(file);
    }
  };

  const handleUploadBannerClick = () => {
    bannerInputRef.current?.click();
  };

  // Thumbnail handlers
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

    // Validate image resolution
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
    setValue('thumbnailFile', file as any);
    setThumbPreview(URL.createObjectURL(file));
    await trigger('thumbnailFile');
  };

  const handleThumbInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleThumbSelect(file);
    }
  };

  const handleUploadThumbClick = () => {
    thumbInputRef.current?.click();
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleBannerSelect(file);
    }
  };

  const handleRemoveBanner = () => {
    setSelectedBanner(null);
    setBannerPreview(null);
    setValue('bannerFile', undefined as any);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = '';
    }
  };

  const handleRemoveThumb = () => {
    setSelectedThumb(null);
    setThumbPreview(null);
    setValue('thumbnailFile', undefined as any);
    if (thumbInputRef.current) {
      thumbInputRef.current.value = '';
    }
  };

  // Form submission
  const onSubmit = async (data: AddResourceFormData) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a resource');
        return;
      }

      // Defensive: get the array of categories, whether from backend or fallback
      const categoriesArray = Array.isArray(resourceCategories?.data)
        ? resourceCategories.data
        : Array.isArray(resourceCategories)
          ? resourceCategories
          : RESOURCE_TYPE_OPTIONS;

      // Find the resource category ID based on the selected resource type
      // For backend categories, match by slug; for fallback, match by value
      const resourceCategory = categoriesArray.find(
        (cat: any) =>
          (cat.slug && cat.slug === data.resourceType) ||
          (cat.value && cat.value === data.resourceType)
      );
      console.log('resourceCategory', data.resourceType);

      if (!resourceCategory) {
        // Try to print available categories for debugging
        if (Array.isArray(resourceCategories?.data)) {
          console.error('Available categories:', resourceCategories.data.map((cat: any) => ({ name: cat.name, slug: cat.slug })));
        } else if (Array.isArray(resourceCategories)) {
          console.error('Available categories:', resourceCategories.map((cat: any) => ({ name: cat.name, slug: cat.slug })));
        } else {
          console.error('Available categories:', RESOURCE_TYPE_OPTIONS.map((cat) => ({ name: cat.label, slug: cat.value })));
        }
        console.error('Selected resource type:', data.resourceType);
        toast.error(`Resource category not found. Please select a valid resource type.`);
        return;
      }

      // Validate required images
      if (!data.bannerFile) {
        toast.error('Banner image is required');
        return;
      }
      if (!data.thumbnailFile) {
        toast.error('Thumbnail image is required');
        return;
      }

      // Upload images (banner & thumbnail)
      setIsFileUploading(true);
      const [bannerRes, thumbRes] = await Promise.all([
        FileUploadService.uploadFile(data.bannerFile as any),
        FileUploadService.uploadFile(data.thumbnailFile as any)
      ]);
      setIsFileUploading(false);
      
      if (!bannerRes.success) {
        throw new Error(bannerRes.error?.message || 'Failed to upload banner');
      }
      if (!thumbRes.success) {
        throw new Error(thumbRes.error?.message || 'Failed to upload thumbnail');
      }

      const mediaUrl = FileUploadService.getFileUrl(bannerRes.data);
      const thumbnailUrl = FileUploadService.getFileUrl(thumbRes.data);

      // Create blog data
      const blogData = {
        title: data.title.trim(),
        description: data.description.trim(),
        authorName: user.firstName + ' ' + user.lastName,
        designation: user.role || 'Admin',
        mediaUrl,
        thumbnailUrl,
        watchUrl: data.videoLink?.trim() || undefined,
        tag: data.contentType,
        resourceCategoryId: resourceCategory._id || resourceCategory.value || resourceCategory.slug,
        status: 'active' as const
      };

      await createBlogMutation.mutateAsync(blogData);
      
      // Navigate back to resource center
      toast.dismiss();
      toast.success('Resource created successfully');
      navigate('/resource-center');
    } catch (error: any) {
      console.error('Failed to create resource:', error);
      toast.error(error.message || 'Failed to create resource');
      setIsFileUploading(false); // Reset file upload state on error
    }
  };

  const handleGoBack = () => {
    navigate('/resource-center');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
         
          <span onClick={()=>navigate('/resource-center')} className='cursor-pointer'  >Resource Center</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Add Resource</span>
          </div>
          <Button
            type="submit"
            form="add-resource-form"
            disabled={isFormDisabled}
            loading={isFileUploading || createBlogMutation.isPending }
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium"
          >
           Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-4">
        <FormProvider {...methods}>
          <form id="add-resource-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Resource Details Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">Resource Details</h2>
              <div className="mb-8 min-w-full">
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  Upload Banner Image <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden h-48 sm:h-[500px] text-center transition-colors bg-gray-50 ",
                    !isFormDisabled && "cursor-pointer",
                    isFormDisabled && "opacity-50 cursor-not-allowed",
                    !isFormDisabled && isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300',
                    !isFormDisabled && !isDragActive && 'hover:border-gray-400 hover:bg-gray-100',
                    (errors as any).bannerFile && 'border-red-500 bg-red-50'
                  )}
                  onDragOver={!isFormDisabled ? handleDragOver : undefined}
                  onDragLeave={!isFormDisabled ? handleDragLeave : undefined}
                  onDrop={!isFormDisabled ? handleDrop : undefined}
                  onClick={!isFormDisabled ? handleUploadBannerClick : undefined}
                >
                  {bannerPreview ? (
                            <img 
        className="w-full overflow-hidden h-48 sm:h-[500px]" 
        src={bannerPreview} />
      
                    
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
                {(errors as any).bannerFile && (
                  <p className="mt-2 text-sm text-red-600">{(errors as any).bannerFile?.message}</p>
                )}
              </div>
            <div className='flex flex-col lg:flex-row gap-4 '>
                {/* Upload Banner Section */}
            
         {/* Thumbnail Upload */}
         <div className="lg:mb-8 ">
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  Upload Thumbnail Image <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl min-w-full max-w-[400px] md:w-[400px] h-[234px] text-center transition-colors bg-gray-50  overflow-hidden",
                    !isFormDisabled && "cursor-pointer",
                    isFormDisabled && "opacity-50 cursor-not-allowed",
                    (errors as any).thumbnailFile && 'border-red-500 bg-red-50'
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
                {(errors as any).thumbnailFile && (
                  <p className="mt-2 text-sm text-red-600">{(errors as any).thumbnailFile?.message}</p>
                )}
              </div>
                      {/* Form Fields Row */}
                      <div className="grid grid-cols-4 gap-6 lg:mb-8  py-10 w-full ">
                {/* Title */}
                <div className='col-span-4  '>
                  <Label className="text-base font-medium text-gray-900 mb-3 ">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('title')}
                    placeholder="Enter title"
                    disabled={isFormDisabled}
                    className={cn(
                      "rounded-full h-14",
                      errors.title && "border-red-500"
                    )}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
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
                    render={({ field }) => {
                      // Defensive: get the array of categories, whether from backend or fallback
                      const categoriesArray = Array.isArray(resourceCategories?.data)
                        ? resourceCategories.data
                        : Array.isArray(resourceCategories)
                          ? resourceCategories
                          : RESOURCE_TYPE_OPTIONS;
                      return (
                        <Select
                          onValueChange={async (value) => {
                            field.onChange(value);
                            await trigger('resourceType');
                          }}
                          value={field.value}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger className={cn(
                            "h-14 rounded-full border-gray-300",
                            errors.resourceType && "border-red-500"
                          )}>
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Use backend categories if available, fallback to hardcoded */}
                            {categoriesArray.map((option: any) => (
                              <SelectItem 
                                key={option.slug || option.value}
                                value={option.slug || option.value}
                              >
                                {option.name || option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.resourceType && (
                    <p className="mt-2 text-sm text-red-600">{errors.resourceType.message}</p>
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
                        onValueChange={async (value) => {
                          field.onChange(value);
                          await trigger('contentType');
                        }}
                        value={field.value}
                        disabled={isFormDisabled}
                      >
                        <SelectTrigger className={cn(
                          "h-14 rounded-full border-gray-300",
                          errors.contentType && "border-red-500"
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
                  {errors.contentType && (
                    <p className="mt-2 text-sm text-red-600">{errors.contentType.message}</p>
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
                    errors.description && "border-red-500"
                  )}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
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
                    errors.videoLink && "border-red-500"
                  )}
                />
                {errors.videoLink && (
                  <p className="mt-2 text-sm text-red-600">{errors.videoLink.message}</p>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddResourcePage; 