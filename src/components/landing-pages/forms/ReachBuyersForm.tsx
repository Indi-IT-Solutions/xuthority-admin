import { FormField } from "./FormField";

interface ReachBuyersFormProps {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}

export const ReachBuyersForm: React.FC<ReachBuyersFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Write heading..."
        register={register}
        error={errors?.heading}
      />
      
      <FormField
        id="subtext"
        label="Subtext"
        type="textarea"
        placeholder="Enter subtext here..."
        rows={4}
        register={register}
        error={errors?.subtext}
      />
      
      {/* Add Button Section */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-semibold">Add Button</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="buttonText"
            label="Button Text"
            placeholder="Enter button text..."
            register={register}
            error={errors?.buttonText}
          />
          
          <FormField
            id="buttonLink"
            label="Button Link"
            placeholder="Enter button redirection link..."
            register={register}
            error={errors?.buttonLink}
          />
        </div>
      </div>
    </>
  );
};