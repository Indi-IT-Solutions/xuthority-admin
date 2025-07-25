import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from './label';
import { Textarea } from './textarea';


interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ name, label, ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="w-full">
      <Label htmlFor={name} className={error ? 'text-red-500' : ''}>
        {label}
      </Label>
      <Textarea
        id={name}
        {...register(name)}
        {...props}
        className={`mt-2 resize-none rounded-xl min-h-40 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-2">{error.message?.toString()}</p>
      )}
    </div>
  );
}; 