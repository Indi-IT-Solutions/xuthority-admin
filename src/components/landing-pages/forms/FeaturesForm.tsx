import { FormField } from "./FormField";

interface FeaturesFormProps {
  register: any;
  errors: any;
}

export const FeaturesForm: React.FC<FeaturesFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="title"
        label="Title"
        placeholder="Enter title..."
        register={register}
        error={errors?.title}
      />
      <FormField
        id="subtitle"
        label="Subtitle"
        placeholder="Enter subtitle (optional)..."
        register={register}
        error={errors?.subtitle}
      />
    </>
  );
}; 