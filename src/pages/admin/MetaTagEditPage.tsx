import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "react-hot-toast";
import { useMetaTagById, useUpdateMetaTag, useCreateMetaTag } from "@/hooks/useMetaTags";
import { FormInput } from "@/components/ui/FormInput";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { MetaTagEditSkeleton } from "@/components/common";

// Zod schema for form validation
const metaTagSchema = z.object({
  pageName: z
    .string()
    .trim()
    .min(1, 'Page name is required')
    .min(2, 'Page name must be at least 2 characters long')
    .max(100, 'Page name cannot exceed 100 characters'),
  metaTitle: z
    .string()
    .trim()
    .min(1, 'Meta title is required')
    .min(3, 'Meta title must be at least 3 characters long')
    .max(60, 'Meta title cannot exceed 60 characters'),
  metaDescription: z
    .string()
    .trim()
    .min(1, 'Meta description is required')
    .min(10, 'Meta description must be at least 10 characters long')
    .max(160, 'Meta description cannot exceed 160 characters')
});

type FormData = z.infer<typeof metaTagSchema>;

const MetaTagEditPage = () => {
  const { metaTagId } = useParams<{ metaTagId: string }>();
  const navigate = useNavigate();
  const isEditMode = metaTagId !== 'add';

  // Initialize react-hook-form with validation
  const methods = useForm<FormData>({
    defaultValues: {
      pageName: '',
      metaTitle: '',
      metaDescription: ''
    },
    resolver: zodResolver(metaTagSchema),
    mode: 'onBlur' // Validate on blur for better UX
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = methods;

  // Fetch meta tag data if in edit mode
  const { data: metaTagData, isLoading: isLoadingMetaTag } = useMetaTagById(metaTagId || '');

  // Mutation hooks
  const updateMetaTag = useUpdateMetaTag();
  const createMetaTag = useCreateMetaTag();

  // Watch form values for character count
  const metaTitle = watch('metaTitle');
  const metaDescription = watch('metaDescription');

  // Update form data when meta tag data is loaded
  useEffect(() => {
    if (metaTagData?.data && isEditMode) {
      setValue('pageName', metaTagData.data.pageName);
      setValue('metaTitle', metaTagData.data.metaTitle);
      setValue('metaDescription', metaTagData.data.metaDescription);
    }
  }, [metaTagData?.data, isEditMode, setValue]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Ensure all required fields are present (validation should handle this, but TypeScript needs assurance)
      const submitData = {
        pageName: data.pageName,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription
      };

      if (isEditMode && metaTagId) {
        await updateMetaTag.mutateAsync({
          metaTagId,
          data: submitData
        });
      } else {
        await createMetaTag.mutateAsync(submitData);
      }
      
      navigate('/metatags');
    } catch (error) {
      console.error('Error saving meta tag:', error);
      // Error handling is already done in the hooks with toast notifications
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/metatags');
  };

  if (isLoadingMetaTag && isEditMode) {
    return <MetaTagEditSkeleton />;
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <button 
            onClick={handleBack}
            className="hover:text-blue-600 transition-colors cursor-pointer flex items-center"
          >
            Meta Tags
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">
            Edit Meta Tags
          </span>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={updateMetaTag.isPending}
          loading={updateMetaTag.isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full cursor-pointer"
        >
          Update
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Page Name */}
            <FormInput
              name="pageName"
              label="Page Name"
              type="text"
              placeholder="Enter page name"
            />

            {/* Meta Title */}
            <div className="space-y-2">
              <FormInput
                name="metaTitle"
                label="Meta Title"
                type="text"
                placeholder="Enter meta title"
                maxLength={60}
              />
              <p className="text-xs text-gray-500">
                {metaTitle?.length || 0}/60 characters
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <FormTextarea
                name="metaDescription"
                label="Meta Description"
                placeholder="Enter meta description"
                maxLength={160}
              />
              <p className="text-xs text-gray-500">
                {metaDescription?.length || 0}/160 characters
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default MetaTagEditPage; 