import { Button } from "@/components/ui/button";
import { FormFactory } from "../forms/FormFactory";
import { SectionInfo } from "../types";

interface FormContainerProps {
  sectionInfo: SectionInfo;
  register: any;
  errors: any;
  selectedSection: string;
  isSubmitting: boolean;
  onSubmit: (data: any) => void;
  setValue?: any;
  watch?: any;
  isLoading?: boolean;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  sectionInfo,
  register,
  errors,
  selectedSection,
  isSubmitting,
  onSubmit,
  setValue,
  watch,
  isLoading,
}) => {
  return (
    <div className="col-span-12 md:col-span-8 lg:col-span-9">
      <div className="">
        {/* Form Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-3 text-gray-900">{sectionInfo.title}</h2>
          <p className="text-base text-gray-600">
            {sectionInfo.description}
          </p>
        </div>

        {/* Form */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
        <form onSubmit={onSubmit} className="space-y-8">
          <FormFactory
            sectionId={selectedSection}
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
          
          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-full font-medium text-xl w-full transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save & Update"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}; 