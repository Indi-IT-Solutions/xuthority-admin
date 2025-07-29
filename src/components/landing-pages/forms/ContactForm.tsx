import { FormField } from "./FormField";

interface ContactFormProps {
  register: any;
  errors: any;
}

export const ContactForm: React.FC<ContactFormProps> = ({ register, errors }) => {
  return (
    <>
      <FormField
        id="title"
        label="Title"
        placeholder="Enter contact section title..."
        register={register}
        error={errors?.title}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="Enter contact email..."
        register={register}
        error={errors?.email}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="phone"
          label="Phone (Optional)"
          placeholder="Enter phone number..."
          register={register}
          error={errors?.phone}
        />
        <FormField
          id="hours"
          label="Business Hours (Optional)"
          placeholder="e.g., Mon-Fri 9AM-5PM"
          register={register}
          error={errors?.hours}
        />
      </div>
      <FormField
        id="address"
        label="Address (Optional)"
        type="textarea"
        placeholder="Enter company address..."
        rows={3}
        register={register}
        error={errors?.address}
      />
    </>
  );
}; 