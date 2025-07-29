import { FormField } from "./FormField";

interface MainCtaFormProps {
  register: any;
  errors: any;
}

export const MainCtaForm: React.FC<MainCtaFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder="Enter heading..."
        register={register}
        error={errors?.heading}
      />
      <FormField
        id="subheading"
        label="Subheading"
        type="textarea"
        placeholder="Enter subheading..."
        rows={3}
        register={register}
        error={errors?.subheading}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="primaryButtonText"
          label="Primary Button Text"
          placeholder="Enter primary button text..."
          register={register}
          error={errors?.primaryButtonText}
        />
        <FormField
          id="primaryButtonLink"
          label="Primary Button Link"
          placeholder="Enter primary button link..."
          register={register}
          error={errors?.primaryButtonLink}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="secondaryButtonText"
          label="Secondary Button Text (Optional)"
          placeholder="Enter secondary button text..."
          register={register}
          error={errors?.secondaryButtonText}
        />
        <FormField
          id="secondaryButtonLink"
          label="Secondary Button Link (Optional)"
          placeholder="Enter secondary button link..."
          register={register}
          error={errors?.secondaryButtonLink}
        />
      </div>
    </>
  );
}; 