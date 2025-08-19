import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/useAdminAuth";
import { Link } from "react-router-dom";
import { ASSETS } from "@/config/constants";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

  export default function ForgotPasswordPage() {
  
  // Use the new authentication hooks
  const forgotPasswordMutation = useForgotPassword();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    try {
      await forgotPasswordMutation.mutateAsync({ email: data.email });
      // Close modal after successful email sent
      // closeAuthModal();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Forgot password error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100">
      {/* Geometric Shapes */}
           <img src={ASSETS.SVG.HOME_BG} alt="Xuthority background" className="h-full w-full object-cover" />
    </div>

    {/* Content */}
    <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8   overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col  gap-2 justify-center items-center">
       <img
                          src={ASSETS.LOGOS.SMALL}
            alt="Xuthority Logo"
            className="h-16 w-16"
          />
  <div  className="text-2xl font-bold text-black text-center mt-2">
       Forgot Password?
                   </div>
                   <div className="text-gray-500 text-center text-xs sm:text-sm mb-4">
                   Please enter your registered email address below to recover your password.
                   </div>
       </div>

        {/* Page Content */}
        <div className="">
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter Email Address"
            {...register("email")}
            className={`rounded-full h-14 flex-1 px-5 py-3  ${errors.email ? "border-red-500 focus-visible:border-red-500" : ""}`}
            disabled={forgotPasswordMutation.isPending}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-2">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full"
          disabled={forgotPasswordMutation.isPending}
          loading={forgotPasswordMutation.isPending}
        >
          Send Reset Link
        </Button>
        

      </div>
      <div  className={`mt-6 text-center text-sm`}>
              <Link
                to="/login"
                // disabled={forgotPasswordMutation.isPending}
                // onClick={() => setAuthModalView("login")}
                className="text-gray-900 hover:underline cursor-pointer"
              >
                Back To <span className="font-semibold text-red-500">Login</span>
              </Link>
            </div>
    </form>
    </div>
    </div>
    </div>
    </div>
  );
}