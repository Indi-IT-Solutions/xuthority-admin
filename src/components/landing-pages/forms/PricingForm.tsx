import { FormField } from "./FormField";

interface PricingFormProps {
  register: any;
  errors: any;
}

export const PricingForm: React.FC<PricingFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="title"
        label="Title"
        placeholder="Enter pricing section title..."
        register={register}
        error={errors?.title}
      />
    </>
  );
}; 