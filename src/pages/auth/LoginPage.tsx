import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useAdminAuth";
import { ASSETS } from "@/config/constants";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      navigate("/dashboard");
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100">
        {/* Geometric Shapes */}
        <img
          src={ASSETS.SVG.HOME_BG}
          alt="Xuthority background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 min-h-[50vh]  overflow-y-auto">
          {/* Logo */}
       <div className="flex flex-col  gap-2 justify-center items-center">
       <img
            src={ASSETS.LOGOS.SMALL}
            alt="Xuthority Logo"
            className="h-16 w-16"
          />
  <div  className="text-2xl font-bold text-black text-center mt-2">
       <span className="text-red-500">Hello,</span> Welcome Back!
                   </div>
                   <div className="text-gray-500 text-center text-xs sm:text-sm mb-4">
                   Kindly fill in your login details to proceed.
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
                    className="rounded-full h-14 flex-1 px-5 py-3"
                    disabled={loginMutation.isPending}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Enter Password"
                      {...register("password")}
                      className="rounded-full h-14 flex-1 px-5 py-3"
                      disabled={loginMutation.isPending}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      disabled={loginMutation.isPending}
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
<div className="flex justify-end">
<button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-right text-gray-500 hover:underline cursor-pointer"
                  disabled={loginMutation.isPending}
                >
                  Forgot Password?
                </button>
</div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full"
                  disabled={loginMutation.isPending}
                  loading={loginMutation.isPending}
                >
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
