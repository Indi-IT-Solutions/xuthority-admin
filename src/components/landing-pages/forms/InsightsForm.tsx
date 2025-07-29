import { FormField } from "./FormField";

interface InsightsFormProps {
  register: any;
  errors: any;
}

export const InsightsForm: React.FC<InsightsFormProps> = ({ register, errors }) => {
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
        rows={5}
        register={register}
        error={errors?.subtext}
      />
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold mb-6">Add Button</h3>
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