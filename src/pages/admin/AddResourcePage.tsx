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
  mediaFile: z
    .instanceof(File, { message: 'Banner/Thumbnail image is required' })
    .refine((file) => {
      return file && file.size <= 5 * 1024 * 1024; // 5MB
    }, 'File size must be less than 5MB')
    .refine((file) => {
      return file && file.type.startsWith('image/');
    }, 'File must be an image')
});

type AddResourceFormData = z.infer<typeof addResourceSchema>;

const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAdminStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);

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

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    // Check file size before calling FileUploadService
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
    
    // Trigger validation for the mediaFile field
    await trigger('mediaFile');
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValue('mediaFile', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submission
  const onSubmit = async (data: AddResourceFormData) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a resource');
        return;
      }

      // Find the resource category ID based on the selected resource type
      const resourceCategory = resourceCategories?.find(
        cat => cat.slug === data.resourceType
      );
      console.log('resourceCategory', data.resourceType)

      if (!resourceCategory) {
        console.error('Available categories:', resourceCategories?.data?.map(cat => ({name: cat.name, slug: cat.slug})));
        console.error('Selected resource type:', data.resourceType);
        toast.error(`Resource category not found. Please select a valid resource type.`);
        return;
      }

      // Validate required image file
      if (!data.mediaFile) {
        toast.error('Banner/Thumbnail image is required');
        return;
      }

      if (data.mediaFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Upload banner/thumbnail image (required)
      setIsFileUploading(true);
      const uploadResponse = await FileUploadService.uploadFile(data.mediaFile);
      setIsFileUploading(false);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error?.message || 'Failed to upload image');
      }
      const mediaUrl = FileUploadService.getFileUrl(uploadResponse.data);

      // Create blog data
      const blogData = {
        title: data.title.trim(),
        description: data.description.trim(),
        authorName: user.firstName + ' ' + user.lastName,
        designation: user.role || 'Admin',
        mediaUrl: mediaUrl,
        watchUrl: data.videoLink?.trim() || undefined,
        tag: data.contentType,
        resourceCategoryId: resourceCategory._id,
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
            <span>Resource Center</span>
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

              {/* Upload Banner/Thumbnail Section */}
              <div className="mb-8">
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  Upload Banner/Thumbnail Image <span className="text-red-500">*</span>
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
                    errors.mediaFile && 'border-red-500 bg-red-50'
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
                      {/* <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute  -top-2 -right-2 z-10 rounded-full h-8 w-8 p-0 bg-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button> */}
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
                {errors.mediaFile && (
                  <p className="mt-2 text-sm text-red-600">{errors.mediaFile.message}</p>
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
                      errors.title && "border-red-500"
                    )}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
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
                          {(resourceCategories?.data || RESOURCE_TYPE_OPTIONS).map((option) => (
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
                  {errors.resourceType && (
                    <p className="mt-2 text-sm text-red-600">{errors.resourceType.message}</p>
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