import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetBadge, useUpdateBadge } from "@/hooks/useBadges";
import { TransformedBadge } from "@/services/badgeService";
import { FileUploadService } from "@/services/fileUpload";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/getInitials";
import toast from "react-hot-toast";

// Zod schema for badge form validation
const badgeFormSchema = z.object({
  title: z.string().min(1, "Badge name is required").min(3, "Badge name must be at least 3 characters"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color code format"),
  status: z.enum(["active", "inactive"]),
  icon: z.string().optional(),
});

type BadgeFormData = z.infer<typeof badgeFormSchema>;

const EditBadgePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm<BadgeFormData>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      icon: "",
      colorCode: "#3B82F6",
    },
  });
  
  // Watch form values
  const formData = watch();
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  
  // Fetch badge data
  const { data: badge, isLoading, error } = useGetBadge(id || "");
  const updateBadgeMutation = useUpdateBadge();
  
  // Combined loading state for disabling form
  const isFormDisabled = isFileUploading || updateBadgeMutation.isPending;

  // Update form data when badge data is loaded
  useEffect(() => {
    if (badge) {
      reset({
        title: badge.title,
        description: badge.description,
        status: badge.status,
        icon: badge.icon,
        colorCode: badge.colorCode || "#3B82F6"
      });
    }
  }, [badge, reset]);

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    // Check file size before calling FileUploadService
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const validation = FileUploadService.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadAreaClick = () => {
    if (!isFormDisabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: keyof BadgeFormData, value: string | boolean) => {
    // Special handling for color to ensure minimum brightness
    if (field === 'colorCode' && typeof value === 'string') {
      const adjustedColor = ensureMinimumBrightness(value, 0.7);
      setValue(field, adjustedColor as any);
      return;
    }
    
    setValue(field, value as any);
    clearErrors(field);
  };

  // Function to ensure minimum brightness (70%)
  const ensureMinimumBrightness = (hexColor: string, minBrightness: number = 0.7): string => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Convert RGB to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const l = (max + min) / 2;
    
    // If lightness is already above minimum, return original color
    if (l >= minBrightness) {
      return hexColor;
    }
    
    // Calculate HSL values
    let h = 0;
    let s = 0;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case rNorm:
          h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
          break;
        case gNorm:
          h = ((bNorm - rNorm) / d + 2) / 6;
          break;
        case bNorm:
          h = ((rNorm - gNorm) / d + 4) / 6;
          break;
      }
    }
    
    // Convert back to RGB with new lightness
    const hslToRgb = (h: number, s: number, l: number): string => {
      let r: number, g: number, b: number;
      
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      
      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      return '#' + toHex(r) + toHex(g) + toHex(b);
    };
    
    return hslToRgb(h, s, minBrightness);
  };

  const onSubmit = async (data: BadgeFormData) => {
    // Validate that badge image is provided
    if (!selectedFile && !data.icon) {
      setError("icon", { message: "Badge image is required. Please upload an image." });
      toast.error("Badge image is required. Please upload an image.");
      return;
    }
    
    if (!id) return;

    try {
      let updatedFormData = { ...data };

      // Upload new image if selected
      if (selectedFile) {
        setIsFileUploading(true);
        const uploadResponse = await FileUploadService.uploadFile(selectedFile);
        setIsFileUploading(false);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Failed to upload image');
        }
        
        const imageUrl = FileUploadService.getFileUrl(uploadResponse.data);
        updatedFormData.icon = imageUrl;
      }

      await updateBadgeMutation.mutateAsync({
        badgeId: id,
        badgeData: updatedFormData
      });
      
      navigate("/badges");
    } catch (error) {
      console.error("Error updating badge:", error);
      setIsFileUploading(false);
    }
  };

  const handleCancel = () => {
    navigate("/badges");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading badge...</div>
      </div>
    );
  }

  if (error || !badge) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-center mb-4">
          <p className="text-lg font-medium">Failed to load badge</p>
          <p className="text-sm mt-1">{(error as any)?.message}</p>
        </div>
        <Button onClick={() => navigate("/badges")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Badges
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with breadcrumb and update button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center text-sm text-gray-600">
          <button
            onClick={() => navigate("/badges")}
            className="hover:text-gray-900 transition-colors"
          >
            Badges
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Edit Badge</span>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={isFormDisabled}
          loading={isFileUploading || updateBadgeMutation.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full"
        >
          Update
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Badge Image Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20" style={{background:formData.colorCode || '#E2E2E2'}}>
              <AvatarImage 
                src={previewUrl || (formData.icon && formData.icon.startsWith('http') ? formData.icon : '')}
                alt="Badge preview"
                className="object-contain p-2"
              />
              <AvatarFallback 
                className="text-white text-2xl font-semibold"
                style={{background:formData.colorCode || '#E2E2E2'}}
              >
                {formData.title ? getInitials(formData.title) : formData.icon || '🏆'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Your Badge image <span className="text-red-500">*</span>
              </h3>
              <button
                type="button"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium cursor-pointer"
                onClick={handleUploadAreaClick}
                disabled={isFormDisabled}
              >
                Change image
              </button>
              {errors.icon && (
                <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
              )}
            </div>
          </div>
          
          {/* Upload Area */}
          <div
            className={cn(
              " hidden border-2 border-dashed rounded-2xl h-32 text-center transition-colors bg-gray-50 max-w-md overflow-hidden",
              !isFormDisabled && "cursor-pointer",
              isFormDisabled && "opacity-50 cursor-not-allowed",
              !isFormDisabled && isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300',
              !isFormDisabled && !isDragActive && 'hover:border-gray-400 hover:bg-gray-100'
            )}
            onDragOver={!isFormDisabled ? handleDragOver : undefined}
            onDragLeave={!isFormDisabled ? handleDragLeave : undefined}
            onDrop={!isFormDisabled ? handleDrop : undefined}
            onClick={!isFormDisabled ? handleUploadAreaClick : undefined}
          >
            {previewUrl ? (
              <div className="relative h-32">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="h-full w-full rounded-lg object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 z-10 rounded-full h-6 w-6 p-0 bg-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  disabled={isFormDisabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col justify-center items-center h-32">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 font-medium text-sm">Upload New Badge Image</p>
                  <p className="text-gray-500 text-xs">Drag and drop or click to select</p>
                  <p className="text-gray-500 text-xs">Supports: JPEG, PNG, GIF, WebP, SVG</p>
                  <p className='text-red-500 text-xs'>Max file size 5MB (Required)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              onChange={handleFileInputChange}
              disabled={isFormDisabled}
              className="hidden"
            />
          </div>
        </div>

        {/* Badge Name */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-900">
            Badge Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full mt-2 ${errors.title ? "border-red-500" : ""}`}
            placeholder="Enter badge name"
            disabled={isFormDisabled}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-900">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={`w-full min-h-[120px] resize-none mt-2 ${errors.description ? "border-red-500" : ""}`}
            placeholder="Enter badge description"
            disabled={isFormDisabled}
            maxLength={500}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Badge Color */}
        {/* <div className="space-y-2">
          <Label htmlFor="colorCode" className="text-sm font-medium text-gray-900">
            Badge Color <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-3">
            <Input
              id="colorCode"
              type="color"
              value={formData.colorCode}
              onChange={(e) => handleInputChange("colorCode", e.target.value)}
              className="w-20 h-10 p-1 cursor-pointer"
              disabled={isFormDisabled}
            />
            <Input
              type="text"
              value={formData.colorCode}
              onChange={(e) => handleInputChange("colorCode", e.target.value)}
              className="w-32"
              placeholder="#3B82F6"
              disabled={isFormDisabled}
            />
          </div>
          {errors.colorCode && (
            <p className="mt-1 text-sm text-red-600">{errors.colorCode.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Dark colors will be automatically brightened to ensure 70% minimum brightness for better visibility.
          </p>
        </div> */}

        {/* Active/Inactive Status */}
        <div className="flex items-center space-x-3">
          <Switch
            checked={formData.status === "active"}
            onCheckedChange={(checked) => 
              handleInputChange("status", checked ? "active" : "inactive")
            }
            disabled={isFormDisabled}
          />
          <Label className="text-sm font-medium text-gray-900">
            Active/Inactive Status
          </Label>
        </div>

        {/* Hidden submit button for form submission */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
};

export default EditBadgePage; 