import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Edit, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminAuthService,
  AdminUpdateProfileRequest,
} from "@/services/adminAuthService";
import useAdminStore from "@/store/useAdminStore";
import { getInitials } from "@/utils/getInitials";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { ProfileSettingsSkeleton } from "@/components/common";

// Zod validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .trim().nonempty('First name is required')
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .trim().nonempty('Last name is required')
    .max(50, "Last name must not exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, updateUser, isLoggedIn } = useAdminStore();
  const queryClient = useQueryClient();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Watch form values for display purposes
  const formValues = watch();
  const displayName =
    `${formValues.firstName} ${formValues.lastName}`.trim() || "Admin User";

  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Query to get current profile
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      console.log("📡 Making profile API call...");
      const response = await AdminAuthService.getProfile();
      console.log("📡 Profile API response:", response);
      if (response.success && response.data) {
        return response.data.admin;
      }
      throw new Error(response.message || "Failed to fetch profile");
    },
    retry: false, // Disable retries to prevent duplicate toast notifications
    enabled: isLoggedIn && AdminAuthService.isAuthenticated(), // Only run if authenticated
  });



  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profileData: AdminUpdateProfileRequest; imageFile?: File }) => {
      const response = await AdminAuthService.updateProfileWithImage(data.profileData, data.imageFile);
      if (response.success && response.data) {
        return response.data.admin;
      }
      throw new Error(response.message || "Failed to update profile");
    },
    onSuccess: (updatedAdmin) => {
      // Update local store with complete admin object
      updateUser({
        id: updatedAdmin._id || updatedAdmin.id,
        displayName: `${updatedAdmin.firstName} ${updatedAdmin.lastName}`,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        role: "admin",
        avatar: updatedAdmin.avatar, // Include updated avatar
        ...updatedAdmin, // Include any other fields from the response
      });

      // Update form with new data
      reset({
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
      });

      // Clear selected images after successful upload
      if (selectedImageFile) {
        setSelectedImageFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }

      toast.success("Profile updated successfully!");

      // Update React Query cache with the new admin data
      queryClient.setQueryData(["adminProfile"], updatedAdmin);

      // Also invalidate to ensure consistency across the app
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData) {
      reset({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
      });
    }
  }, [profileData, reset]);

  // Image handling functions
  const handleImageSelect = (file: File) => {
    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    };
    input.click();
  };

  // Form submission handler
  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Show loading toast if image is being uploaded
      if (selectedImageFile) {
        toast.loading("Uploading profile image...", { id: "profile-upload" });
      }

      await updateProfileMutation.mutateAsync({
        profileData: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
        },
        imageFile: selectedImageFile || undefined,
      });

      // Dismiss loading toast
      if (selectedImageFile) {
        toast.dismiss("profile-upload");
      }
    } catch (error) {
      // Dismiss loading toast on error
      if (selectedImageFile) {
        toast.dismiss("profile-upload");
      }
      // Error is already handled in mutation onError
      console.error("Profile update failed:", error);
    }
  };

  if (isLoading) {
    return <ProfileSettingsSkeleton />;
  }

  return (
    <div className="max-w-screen mx-auto ">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <Button
            type="submit"
            loading={isSubmitting || updateProfileMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full !min-w-44"
            disabled={isSubmitting || updateProfileMutation.isPending}
          >
            Update Profile
          </Button>
        </div>

        {/* Profile Form */}
        <Card className="border-0  bg-white shadow-md p-6">
          <CardHeader className="px-0 pb-6">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Personal details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
                          {/* Profile Picture */}
              <div className="mb-8">
            


            <div className="flex items-center mb-4 sm:mb-6">
              <div className="relative">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage
                    className="object-cover"
                    src={previewUrl || user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-sm sm:text-base">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={updateProfileMutation.isPending}
                    className="bg-blue-500 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
               
              </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  disabled={updateProfileMutation.isPending}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  disabled={updateProfileMutation.isPending}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Change Link */}
            <div className="mb-8">
            <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="text-red-600 hover:text-red-700 font-medium text-sm order-2 sm:order-1 cursor-pointer"
                disabled={updateProfileMutation.isPending}
              >
                Looking to change your password?
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
         {/* Change Password Modal */}
         <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onOpenChange={setIsChangePasswordModalOpen}
        />
    </div>
  );
};

export default ProfilePage;
