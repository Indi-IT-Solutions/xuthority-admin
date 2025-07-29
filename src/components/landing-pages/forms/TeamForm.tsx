import { FormField } from "./FormField";

interface TeamFormProps {
  register: any;
  errors: any;
}

export const TeamForm: React.FC<TeamFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="title"
        label="Title"
        placeholder="Enter team section title..."
        register={register}
        error={errors?.title}
      />
    </>
  );
}; 