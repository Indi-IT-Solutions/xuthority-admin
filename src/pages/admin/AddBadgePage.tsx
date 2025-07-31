import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateBadge } from "@/hooks/useBadges";
import { FileUploadService } from "@/services/fileUpload";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const AddBadgePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active" as "active" | "inactive",
    icon: "",
    colorCode: "#3B82F6"
  });
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  
  // Create badge mutation
  const createBadgeMutation = useCreateBadge();
  
  // Combined loading state for disabling form
  const isFormDisabled = isFileUploading || createBadgeMutation.isPending;

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

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let badgeData = { ...formData };

      // Upload image if selected
      if (selectedFile) {
        setIsFileUploading(true);
        const uploadResponse = await FileUploadService.uploadFile(selectedFile);
        setIsFileUploading(false);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Failed to upload image');
        }
        
        const imageUrl = FileUploadService.getFileUrl(uploadResponse.data);
        badgeData.icon = imageUrl;
      }

      // If no image is uploaded and no emoji is provided, use default
      if (!badgeData.icon) {
        badgeData.icon = "🏆";
      }

      await createBadgeMutation.mutateAsync(badgeData);
      
      navigate("/badges");
    } catch (error) {
      console.error("Error creating badge:", error);
      setIsFileUploading(false);
    }
  };

  const handleCancel = () => {
    navigate("/badges");
  };

  return (
    <div className="">
      {/* Header with breadcrumb and create button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center text-sm text-gray-600">
          <button
            onClick={() => navigate("/badges")}
            className="hover:text-gray-900 transition-colors"
          >
            Badges
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Add Badge</span>
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isFormDisabled}
          loading={isFileUploading || createBadgeMutation.isPending }
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full"
        >
         Create
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Badge Image Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl overflow-hidden p-2" style={{background:formData.colorCode || '#E2E2E2'}}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Badge preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : formData.icon && formData.icon.startsWith('http') ? (
                <img
                  src={formData.icon}
                  alt="Badge icon"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{formData.icon || "🏆"}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Badge Image
              </h3>
              <button
                type="button"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium cursor-pointer"
                onClick={handleUploadAreaClick}
                disabled={isFormDisabled}
              >
                Upload image
              </button>
            </div>
          </div>
          
          {/* Upload Area */}
          <div
            className={cn(
              "hidden border-2 border-dashed rounded-2xl h-32 text-center transition-colors bg-gray-50 max-w-md overflow-hidden",
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
                  <p className="text-gray-600 font-medium text-sm">Upload Badge Image</p>
                  <p className="text-gray-500 text-xs">Drag and drop or click to select</p>
                  <p className='text-red-500 text-xs'>Max file size 5MB (Optional)</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
            className="w-full"
            placeholder="Enter badge name"
            disabled={isFormDisabled}
            required
          />
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
            className="w-full min-h-[120px] resize-none"
            placeholder="Enter badge description"
            disabled={isFormDisabled}
            required
          />
        </div>

        {/* Badge Color */}
        <div className="space-y-2">
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
              required
            />
            <Input
              type="text"
              value={formData.colorCode}
              onChange={(e) => handleInputChange("colorCode", e.target.value)}
              className="w-32"
              placeholder="#3B82F6"
              disabled={isFormDisabled}
              required
            />
          </div>
        </div>

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

export default AddBadgePage; 