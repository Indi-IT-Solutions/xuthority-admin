import { HeroForm } from "./HeroForm";
import { CategoriesForm } from "./CategoriesForm";
import { CtaForm } from "./CtaForm";
import { InsightsForm } from "./InsightsForm";
import { TestimonialsForm } from "./TestimonialsForm";
import { PopularForm } from "./PopularForm";
import { FeaturesForm } from "./FeaturesForm";
import { PricingForm } from "./PricingForm";
import { MainCtaForm } from "./MainCtaForm";
import { MissionForm } from "./MissionForm";
import { ValuesForm } from "./ValuesForm";
import { TeamForm } from "./TeamForm";
import { ContactForm } from "./ContactForm";
import { TrustedTechForm } from "./TrustedTechForm";
import { ReachBuyersForm } from "./ReachBuyersForm";

interface FormFactoryProps {
  sectionId: string;
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}

export const FormFactory: React.FC<FormFactoryProps> = ({ sectionId, register, errors, setValue, watch }) => {
  switch (sectionId) {
    case "hero":
      return <HeroForm register={register} errors={errors} />;
    case "categories":
      return <CategoriesForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "review-cta":
      return <CtaForm register={register} errors={errors} isReviewCta={true} />;
    case "vendor-cta":
      return <CtaForm register={register} errors={errors} isReviewCta={false} />;
    case "insights":
      return <InsightsForm register={register} errors={errors} />;
    case "testimonials":
      return <TestimonialsForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "popular":
      return <PopularForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "features":
      return <FeaturesForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "pricing":
      return <PricingForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "cta":
      return <MainCtaForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "mission":
      return <MissionForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "values":
      return <ValuesForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "team":
      return <TeamForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "contact":
      return <ContactForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "trusted-tech":
      return <TrustedTechForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "reach-buyers":
      return <ReachBuyersForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    case "mission-support":
      return <MissionForm register={register} errors={errors} setValue={setValue} watch={watch} />;
    default:
      return <div>Please select a section to edit.</div>;
  }
}; 