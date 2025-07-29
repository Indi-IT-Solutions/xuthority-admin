import { FormField } from "./FormField";
import { Label } from "@/components/ui/label";

interface CtaFormProps {
  register: any;
  errors: any;
  isReviewCta?: boolean;
}

export const CtaForm: React.FC<CtaFormProps> = ({ register, errors, isReviewCta = false }) => {
  const subheadingField = isReviewCta ? "subheading" : "subtext";
  const subheadingLabel = "Subtext";
  const headingPlaceholder = "Write heading...";
  const subheadingPlaceholder = "Enter subtext here...";
  const buttonTextPlaceholder = "Enter button text...";
  const buttonLinkPlaceholder = "Enter button redirection link...";
  
  return (
    <>
      <FormField
        id="heading"
        label="Heading"
        placeholder={headingPlaceholder}
        register={register}
        error={errors?.heading}
      />
      <FormField
        id={subheadingField}
        label={subheadingLabel}
        type="textarea"
        placeholder={subheadingPlaceholder}
        rows={5}
        register={register}
        error={errors?.[subheadingField]}
      />
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold mb-6">Add Button</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="buttonText"
            label="Button Text"
            placeholder={buttonTextPlaceholder}
            register={register}
            error={errors?.buttonText}
          />
          <FormField
            id="buttonLink"
            label="Button Link"
            placeholder={buttonLinkPlaceholder}
            register={register}
            error={errors?.buttonLink}
          />
        </div>
      </div>
    </>
  );
};