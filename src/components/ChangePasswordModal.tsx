import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useChangePassword } from '@/hooks/useAdminAuth';

// Validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be no more than 128 characters')
    .regex(/(?=.*[a-z])/, 'New password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'New password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'New password must contain at least one number'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Confirm password doesn't match",
  path: ["confirmNewPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Password requirements checker component
const PasswordRequirementsChecker = ({ password }: { password: string }) => {
  const requirements = [
    {
      label: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      label: 'One uppercase letter (A-Z)',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: 'One lowercase letter (a-z)',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      label: 'One number (0-9)',
      test: (pwd: string) => /\d/.test(pwd),
    },
  ];

  return (
    <div className="text-xs text-gray-500 mt-2 space-y-1">
      <p className="font-medium mb-2">Password must contain:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const isValid = req.test(password);
          return (
            <li key={index} className="flex items-center gap-2">
              {isValid ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-gray-400" />
              )}
              <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [newPassword, setNewPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  });

  // Watch the new password field for real-time validation
  const watchedNewPassword = watch('newPassword', '');
  
  useEffect(() => {
    setNewPassword(watchedNewPassword || '');
  }, [watchedNewPassword]);

  const changePasswordMutation = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      // Reset form and close modal on success
      reset();
      setNewPassword('');
      onOpenChange(false);
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('current password') || error.message?.includes('incorrect')) {
        setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Failed to change password. Please try again.',
        });
      }
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleClose = () => {
    reset();
    setNewPassword('');
    setPasswordVisibility({ current: false, new: false, confirm: false });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Change Password?
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Update your password to keep your account secure. Enter your current password, choose a new one, and confirm the change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
              Old Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={passwordVisibility.current ? "text" : "password"}
                placeholder="Enter Password"
                {...register("currentPassword")}
                className={`rounded-full h-12 px-4 pr-12 ${errors.currentPassword ? "border-red-500" : ""}`}
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                onClick={() => togglePasswordVisibility('current')}
                disabled={changePasswordMutation.isPending}
              >
                {passwordVisibility.current ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={passwordVisibility.new ? "text" : "password"}
                placeholder="Enter New Password"
                {...register("newPassword")}
                className={`rounded-full h-12 px-4 pr-12 ${errors.newPassword ? "border-red-500" : ""}`}
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                onClick={() => togglePasswordVisibility('new')}
                disabled={changePasswordMutation.isPending}
              >
                {passwordVisibility.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
            )}
            {/* Dynamic Password Requirements Checker */}
            <PasswordRequirementsChecker password={newPassword} />
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={passwordVisibility.confirm ? "text" : "password"}
                placeholder="Enter Confirm New Password"
                {...register("confirmNewPassword")}
                className={`rounded-full h-12 px-4 pr-12 ${errors.confirmNewPassword ? "border-red-500" : ""}`}
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={changePasswordMutation.isPending}
              >
                {passwordVisibility.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-xs">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              loading={changePasswordMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full !min-w-44"
            >
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 