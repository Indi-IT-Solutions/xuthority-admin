import React, { useState, useRef } from 'react';
import { useFormContext, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { FormField } from '@/components/landing-pages-shared/forms/FormField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUploadService } from '@/services/fileUpload';
import toast from 'react-hot-toast';
import { useLandingPageSection, useUpdateLandingPageSection } from '../../hooks/useLandingPageSection';

// Schema for testimonials section
export const testimonialsSchema = z.object({
  heading: z.string().min(1, "Heading is required").trim().max(200),
  testimonials: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Testimonial text is required").trim().max(500),
    userImage: z.string().optional(),
    userName: z.string().min(1, "User name is required").trim().max(70),
  })).min(1, "At least one testimonial is required")
});

interface TestimonialData {
  id: string;
  text: string;
  userImage?: string;
  userImageFile?: File;
  userName: string;
}

interface TestimonialItemProps {
  testimonial: TestimonialData;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  onImageChange: (index: number, file: File | null) => void;
}

const TestimonialItem: React.FC<TestimonialItemProps> = ({ 
  testimonial, 
  index, 
  onRemove, 
  canRemove,
  onImageChange 
}) => {
  const { register, watch, formState: { errors } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const error = errors?.testimonials?.[index];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Pass file to parent component
    onImageChange(index, file);
  };

  // Clean up preview URL when component unmounts or image changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const testimonialImage = watch(`testimonials.${index}.userImage`);

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Testimonial {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <FormField
        id={`testimonials.${index}.text`}
        label=""
        placeholder="Write text here..."
        register={register}
        error={error?.text}
        type="textarea"
        rows={4}
        maxLength={500}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">User Image</label>
          <div className="flex items-center gap-4">
            <div 
              onClick={handleImageClick}
              className="cursor-pointer"
            >
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={previewUrl || testimonialImage} 
                  alt="User" 
                />
                <AvatarFallback className="bg-gray-200">
                  <Upload className="w-6 h-6 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </div>
            <button
              type="button"
              onClick={handleImageClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium underline cursor-pointer"
            >
              {previewUrl || testimonialImage ? 'Change User Image' : 'Upload User Image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <FormField
          id={`testimonials.${index}.userName`}
          label="User Name"
          placeholder="Enter user name"
          register={register}
          error={error?.userName}
          maxLength={70}
        />
      </div>
    </div>
  );
};

interface TestimonialsFormContentProps {
  onImageChange: (index: number, file: File | null) => void;
}

const TestimonialsFormContent: React.FC<TestimonialsFormContentProps> = ({ onImageChange: onImageChangeFromParent }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const watchedTestimonials = watch('testimonials');
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});
  
  const testimonials = React.useMemo(() => {
    if (!watchedTestimonials || !Array.isArray(watchedTestimonials) || watchedTestimonials.length === 0) {
      return [{ 
        id: '1', 
        text: 'XUTHORITY has transformed the way we manage customer feedback. With real-time tracking, seamless response management, and automation features, we can easily build trust and strengthen our reputation. The intuitive dashboard makes navigating reviews effortless, saving us valuable time.',
        userImage: '',
        userName: 'Alice'
      }];
    }
    return watchedTestimonials;
  }, [watchedTestimonials]);

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now().toString(),
      text: '',
      userImage: '',
      userName: '',
    };
    setValue('testimonials', [...testimonials, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_: any, i: number) => i !== index);
    setValue('testimonials', updatedTestimonials);
    // Remove pending file if exists
    setPendingFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    // Notify parent
    onImageChangeFromParent(index, null);
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (file) {
      setPendingFiles(prev => ({ ...prev, [index]: file }));
    } else {
      setPendingFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
    }
    // Pass to parent component
    onImageChangeFromParent(index, file);
  };

  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Write heading..."
        register={register}
        error={errors?.heading}
        maxLength={200}
      />

      <div className="space-y-6">
        {testimonials.map((testimonial: TestimonialData, index: number) => (
          <TestimonialItem
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
            onRemove={() => removeTestimonial(index)}
            canRemove={testimonials.length > 1}
            onImageChange={handleImageChange}
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addTestimonial}
          className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More
        </Button>
      </div>

      {errors?.testimonials && typeof errors.testimonials === 'object' && 'message' in errors.testimonials && (
        <p className="text-sm text-red-500 mt-1">{String(errors.testimonials.message)}</p>
      )}
    </>
  );
};

interface TestimonialsSectionProps {
  pageType: 'user' | 'vendor' | 'about';
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ pageType }) => {
  const { data: sectionData, isLoading } = useLandingPageSection(pageType, 'testimonials');
  const updateSection = useUpdateLandingPageSection();
  const [pendingFiles, setPendingFiles] = useState<Record<number, File>>({});

  const methods = useForm({
    resolver: zodResolver(testimonialsSchema),
    defaultValues: sectionData || {},
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form when section data is loaded
  React.useEffect(() => {
    if (sectionData && Object.keys(sectionData).length > 0) {
      reset(sectionData);
    }
  }, [sectionData, reset]);

  const onSubmit = async (data: any) => {
    try {
      // Upload images first if any
      const uploadPromises: Promise<{ index: number; url: string }>[] = [];
      
      for (const [index, file] of Object.entries(pendingFiles)) {
        uploadPromises.push(
          FileUploadService.uploadFile(file)
            .then(response => ({
              index: parseInt(index),
              url: FileUploadService.getFileUrl(response.data)
            }))
            .catch(error => {
              console.error(`Failed to upload image for testimonial ${index}:`, error);
              throw error;
            })
        );
      }
      
      let updatedData = data;
      
      if (uploadPromises.length > 0) {
        const toastId = toast.loading('Uploading images...');
        
        try {
          const uploadResults = await Promise.all(uploadPromises);
          
          // Update form data with uploaded URLs
          const updatedTestimonials = data.testimonials.map((testimonial: any, index: number) => {
            const uploadResult = uploadResults.find(r => r.index === index);
            return {
              ...testimonial,
              userImage: uploadResult ? uploadResult.url : testimonial.userImage
            };
          });
          
          updatedData = {
            ...data,
            testimonials: updatedTestimonials
          };
          
          toast.dismiss(toastId);
          // toast.success('Images uploaded successfully');
        } catch (error) {
          toast.dismiss(toastId);
          toast.error('Failed to upload images');
          throw error;
        }
      }
      
      console.log('Submitting testimonials data:', updatedData);
      
      await updateSection.mutateAsync({
        pageType,
        sectionName: 'testimonials',
        data: updatedData,
      });
      
      // Clear pending files after successful submission
      setPendingFiles({});
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (file) {
      setPendingFiles(prev => ({ ...prev, [index]: file }));
    } else {
      setPendingFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[index];
        return newFiles;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3 text-gray-900">Testimonials</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage user testimonials to showcase real experiences and build trust.</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          <TestimonialsFormContent onImageChange={handleImageChange} />

          <div className="flex justify-center pt-6 sm:pt-8">
            <Button
              type="submit"
              disabled={isSubmitting || updateSection.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full font-medium text-lg sm:text-xl w-full transition-colors"
            >
              {isSubmitting || updateSection.isPending ? "Saving..." : "Save & Update"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};