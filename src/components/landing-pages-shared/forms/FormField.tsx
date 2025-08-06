import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea";
  placeholder?: string;
  rows?: number;
  register: any;
  error?: any;
  className?: string;
  maxLength?:number;
}


export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  rows = 3,
  register,
  error,
  className = "w-full",
  maxLength
}) => {
  const inputClassName = `${className} h-14 px-5 text-base border-gray-200 rounded-full focus:border-gray-300 focus:ring-0 placeholder:text-gray-400`;
  const textareaClassName = `${className} px-5 py-4 text-base border-gray-200 rounded-3xl resize-none focus:border-gray-300 focus:ring-0 placeholder:text-gray-400`;

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 block">
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          rows={rows}
          {...register(id)}
          className={textareaClassName}
          maxLength={maxLength}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register(id)}
          className={inputClassName}
          maxLength={maxLength}
        />
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}; 