import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { FileUploadService } from '@/services/fileUpload';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  mode: 'add' | 'edit';
  collectionName: string;
  collectionConfig: any;
  initialData?: any;
  isLoading?: boolean;
}

// Create dynamic schema based on collection type
const createSchema = (collectionName: string) => {
  const baseSchema: any = {
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').trim().nonempty(),
  };

  // Add collection-specific fields
  const lowerCollectionName = collectionName.toLowerCase();
  
  if (lowerCollectionName.includes('integration')) {
    baseSchema.link = z.union([
      z.string().trim().nonempty(),
      z.string().url('Link must be a valid URL')
    ]).optional();
  }
  
  if (lowerCollectionName.includes('industry')) {
    baseSchema.description = z.string().optional();
    baseSchema.category = z.enum(['solution', 'software'], {
      required_error: 'Please select a category',
    });
  }

  return z.object(baseSchema);
};

type FormData = z.infer<ReturnType<typeof createSchema>>;

const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  collectionName,
  collectionConfig,
  initialData,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Create schema for current collection
  const schema = createSchema(collectionName);
  
  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange', // This will show errors as user types
    defaultValues: {
      name: '',
      description: '',
      category: undefined,
      link: '',
    },
  });

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || undefined,
        link: initialData.link || '',
      });
      setPreviewUrl(initialData.image || '');
      setSelectedFile(null);
    } else {
      // Always reset to empty values for add mode
      reset({
        name: '',
        description: '',
        category: undefined,
        link: '',
      });
      setPreviewUrl('');
      setSelectedFile(null);
    }
  }, [mode, initialData, reset, isOpen]);

  // Reset form when modal opens in add mode
  useEffect(() => {
    if (isOpen && mode === 'add') {
      reset({
        name: '',
        description: '',
        category: undefined,
        link: '',
      });
      setSelectedFile(null);
      setPreviewUrl('');
    }
  }, [isOpen, mode, reset]);

  // Watch form values for debugging
  const formValues = watch();
  
  // Debug: Log errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    const validation = FileUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle upload area click
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const onFormSubmit = async (data: FormData) => {
    try {
      let imageUrl = initialData?.image;
      
      // Upload file if selected for integrations
      if (collectionName.toLowerCase().includes('integration') && selectedFile) {
        setIsUploading(true);
        const uploadResponse = await FileUploadService.uploadFile(selectedFile);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Failed to upload image');
        }
        
        imageUrl = FileUploadService.getFileUrl(uploadResponse.data);
      }
      
      // When editing, only send the fields that can be updated
      let dataToSubmit: any;
      if (mode === 'edit') {
        // Only send fields that are editable
        dataToSubmit = {
          name: data.name,
          ...(data.description !== undefined && { description: data.description }),
          ...(data.category !== undefined && { category: data.category }),
          ...(imageUrl !== undefined && { image: imageUrl }),
          ...(data.link && { link: data.link })
        };
      } else {
        dataToSubmit = {
          ...data,
          ...(imageUrl && { image: imageUrl })
        };
      }
      
      onSubmit(dataToSubmit);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle modal close for Dialog onOpenChange
  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      // Reset form to default values when modal closes
      reset({
        name: '',
        description: '',
        category: undefined,
        link: '',
      });
      setSelectedFile(null);
      setPreviewUrl('');
      onClose();
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (!isLoading) {
      // Reset form to default values when canceling
      reset({
        name: '',
        description: '',
        category: undefined,
        link: '',
      });
      setSelectedFile(null);
      setPreviewUrl('');
      onClose();
    }
  };

  const modalTitle = mode === 'add' ? `Add a New ${collectionName}` : `Edit ${collectionName}`;
  const submitButtonText = mode === 'add' ? 'Add Now' : 'Update Now';
  
  const getDescription = () => {
    switch (collectionName.toLowerCase()) {
      case 'software':
        return 'Elevate your presence by listing your software. Share key features, collect verified reviews, and help users discover your solution.';
      case 'solution':
        return 'Showcase your solution to help users find the perfect fit for their needs. Highlight key benefits and features.';
      case 'user role':
        return 'Define user roles to categorize who can benefit from various software solutions. Help users identify relevant tools.';
      case 'industry':
        return 'Add industry categories to help users find software solutions specific to their business sector.';
      case 'language':
        return 'Add programming languages or spoken languages to help categorize and filter software solutions.';
      case 'integration':
        return 'Connect your software with third-party tools to enhance functionality and offer users a seamless experience.';
      case 'market segment':
        return 'Define market segments to help users find software tailored to their specific business size or type.';
      default:
        return `Add a new ${collectionName.toLowerCase()} to expand the available options for users.`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">
            {modalTitle}
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Upload Logo/Image Field (for integrations) */}
          {collectionName.toLowerCase().includes('integration') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload logo/ Image
              </label>
              <div 
                className="relative w-full max-w-xs p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                onClick={handleUploadAreaClick}
              >
                {previewUrl || (initialData?.image && mode === 'edit') ? (
                  <div className="relative">
                    <img
                      src={previewUrl || initialData?.image}
                      alt="Integration logo"
                      className="w-full h-32 mx-auto object-contain rounded-lg"
                    />
                    
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Upload logo/image</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleFileInputChange}
                  disabled={isLoading || isUploading}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {collectionName} Name
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder={`Enter ${collectionName.toLowerCase()} name`}
                  className={`w-full px-4 py-3 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading || isUploading}
                  autoFocus={!collectionName.toLowerCase().includes('integration')}
                />
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{String(errors.name?.message)}</p>
            )}
          </div>

          {/* Integration Link Field (for integrations) */}
          {collectionName.toLowerCase().includes('integration') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Integration Link
              </label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="url"
                    placeholder="Enter integration link"
                    className={`w-full px-4 py-3 border rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base ${
                      errors.link ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading || isUploading}
                  />
                )}
              />
              {errors.link && (
                <p className="mt-1 text-sm text-red-600">{String(errors.link?.message)}</p>
              )}
            </div>
          )}

          {/* Description Field (for industries only) */}
          {collectionName.toLowerCase().includes('industry') && (
            <div>
              <label className="block text-base text-gray-900 mb-3">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder={`Enter ${collectionName.toLowerCase()} description`}
                    className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    disabled={isLoading || isUploading}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{String(errors.description?.message)}</p>
              )}
            </div>
          )}

          {/* Category Field (for industries only) */}
          {collectionName.toLowerCase().includes('industry') && (
            <div>
              <label className="block text-base text-gray-900 mb-3">
                Category
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading || isUploading}
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base h-14">
                      <SelectValue placeholder={`Select ${collectionName.toLowerCase()} category`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solution">Solution</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{String(errors.category?.message)}</p>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isUploading}
              className="flex-1 py-3 px-6 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-full font-medium text-base h-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              loading={isLoading || isUploading}
              className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-base h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditModal; 