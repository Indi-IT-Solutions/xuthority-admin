import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { useResetPassword, useVerifyResetToken } from "@/hooks/useAdminAuth";
import { ASSETS } from "@/config/constants";

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be no more than 128 characters" })
    .regex(/(?=.*[a-z])/, { message: "Password must contain at least one lowercase letter" })
    .regex(/(?=.*[A-Z])/, { message: "Password must contain at least one uppercase letter" })
    .regex(/(?=.*\d)/, { message: "Password must contain at least one number" }),
  confirmNewPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [password, setPassword] = useState('');
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [tokenVerificationLoading, setTokenVerificationLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    adminId: string;
    firstName: string;
    lastName: string;
    email: string;
    expiresAt: string;
  } | null>(null);

  // Get token from URL parameters
  const token = searchParams.get('token');
  
  const verifyTokenMutation = useVerifyResetToken();
  const resetPasswordMutation = useResetPassword();

  // Verify token on page load
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    // Verify the token with the backend
    verifyTokenMutation.mutateAsync({ token })
      .then((data) => {
        setIsTokenVerified(true);
        setUserInfo(data);
        setTokenVerificationLoading(false);
      })
      .catch((error) => {
        console.error('Token verification failed:', error);
        setTokenVerificationLoading(false);
        // Redirect after showing error message
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      });
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  // Watch the password field for real-time validation
  const watchedPassword = watch('newPassword', '');
  
  useEffect(() => {
    setPassword(watchedPassword || '');
  }, [watchedPassword]);

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (!token) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });
      
      // Success and navigation are handled by the mutation hook
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error('Reset password error:', error);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  // Show loading state while verifying token
  if (tokenVerificationLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Geometric Shapes */}
          <img
            src={ASSETS.SVG.HOME_BG}
            alt="Xuthority background"
            className="h-full w-full object-cover"
          />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Reset Token
              </h2>
              <p className="text-sm text-gray-600">
                Please wait while we verify your reset token...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token verification failed
  if (!isTokenVerified) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4">
           <img
            src={ASSETS.SVG.HOME_BG}
            alt="Xuthority background"
            className="h-full w-full object-cover"
          />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            Link Expired or Invalid
          </h1>
          <p className="text-lg text-gray-600">
            Please request a new reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 ">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100">
        {/* Geometric Shapes */}
        <img
          src={ASSETS.SVG.HOME_BG}
          alt="Xuthority background"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 ">
        <div className="bg-white  rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col  gap-2 justify-center items-center">
       <img
            src={ASSETS.LOGOS.SMALL}
            alt="Xuthority Logo"
            className="h-16 w-16"
          />
  <div  className="text-2xltext-center mt-2">
  <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600">
            Create a strong, unique password to keep your account secure and prevent unauthorized access.
            </p>
          </div>
          </div>
       </div>
       

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={passwordVisibility.password ? "text" : "password"}
                  placeholder="Enter Password"
                  {...register("newPassword")}
                  className="rounded-full h-12 px-4 pr-12"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={() => togglePasswordVisibility('password')}
                  disabled={resetPasswordMutation.isPending}
                >
                  {passwordVisibility.password ? (
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
              <PasswordRequirementsChecker password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmNewPassword"
                  type={passwordVisibility.confirmPassword ? "text" : "password"}
                  placeholder="Enter Confirm Password"
                  {...register("confirmNewPassword")}
                  className="rounded-full h-12 px-4 pr-12"
                  disabled={resetPasswordMutation.isPending}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={resetPasswordMutation.isPending}
                >
                  {passwordVisibility.confirmPassword ? (
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full"
                disabled={resetPasswordMutation.isPending}
                loading={resetPasswordMutation.isPending}
              >
                Reset Password
              </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                disabled={resetPasswordMutation.isPending}
              >
                Back to <span className="text-red-500">Login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 