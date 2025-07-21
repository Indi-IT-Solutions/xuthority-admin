import { ApiService, ApiResponse } from './api';

// File upload response interface - updated to match new backend structure
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  isImage: boolean;
  isVideo: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  formattedDuration?: string;
  thumbnailUrl?: string;
  bestImageUrl?: string;
  streamingUrl?: string;
  availableQualities?: string[];
  videoMetadata?: {
    duration: number;
    fps: number;
    bitrate: number;
    format: string;
    videoCodec: string;
    audioCodec: string;
    audioChannels: number;
    audioSampleRate: number;
  };
  variants?: {
    compressed?: {
      url: string;
      size: number;
      dimensions?: { width: number; height: number };
    };
    thumbnail?: {
      url: string;
      size: number;
      dimensions?: { width: number; height: number };
    };
    high?: {
      url: string;
      size: number;
      dimensions?: { width: number; height: number };
    };
    medium?: {
      url: string;
      size: number;
      dimensions?: { width: number; height: number };
    };
    low?: {
      url: string;
      size: number;
      dimensions?: { width: number; height: number };
    };
  };
  processingInfo?: {
    compressionRatio: string;
    processedAt: string;
    processingTime: number;
    originalSize: number;
    error?: string;
  };
}

// Legacy interface for backward compatibility
export interface LegacyFileUploadResponse {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  s3Key: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// File upload request interface
export interface FileUploadRequest {
  file: File;
}

// Multiple file upload request interface
export interface MultipleFileUploadRequest {
  files: File[];
}

// File upload service class
export class FileUploadService {
  // Upload single file (backend returns single file or array based on input)
  static async uploadFile(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await ApiService.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload multiple files
  static async uploadMultipleFiles(files: File[]): Promise<ApiResponse<{ files: FileUploadResponse[]; meta: any }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    return await ApiService.post<{ files: FileUploadResponse[]; meta: any }>('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload profile image with progress
  static async uploadProfileImage(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await ApiService.uploadFile<FileUploadResponse>('/files/upload', file, onProgress);
  }

  // Upload company image
  static async uploadCompanyImage(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return await ApiService.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload media file (image or video) with progress
  static async uploadMediaFile(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    return await ApiService.uploadFile<FileUploadResponse>('/files/upload', file, onProgress);
  }

  // Get file URL from response - updated to handle new structure
  static getFileUrl(fileResponse: FileUploadResponse): string {
    // For images, prefer compressed version, fallback to original
    if (fileResponse.isImage) {
      return fileResponse.bestImageUrl || fileResponse.variants?.compressed?.url || fileResponse.url;
    }
    
    // For videos, prefer streaming URL, fallback to original
    if (fileResponse.isVideo) {
      return fileResponse.streamingUrl || fileResponse.variants?.medium?.url || fileResponse.url;
    }
    
    // For other files, return original URL
    return fileResponse.url;
  }

  // Get thumbnail URL from response
  static getThumbnailUrl(fileResponse: FileUploadResponse): string | null {
    return fileResponse.thumbnailUrl || fileResponse.variants?.thumbnail?.url || null;
  }

  // Get best quality URL for display
  static getBestQualityUrl(fileResponse: FileUploadResponse): string {
    if (fileResponse.isImage) {
      return fileResponse.bestImageUrl || fileResponse.url;
    }
    
    if (fileResponse.isVideo) {
      return fileResponse.variants?.high?.url || fileResponse.variants?.medium?.url || fileResponse.url;
    }
    
    return fileResponse.url;
  }

  // Validate image file
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'File must be an image' };
    }

    // Check file size (max 100MB - increased to match backend)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 100MB' };
    }

    // Check file type specifically - be more flexible with MIME types
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg',    // Some browsers report this
      'image/pjpeg',  // Progressive JPEG
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/bmp',    // Added BMP support
      'image/tiff',   // Added TIFF support
      'image/tif'     // Alternative TIFF extension
    ];
    
    // Also check by file extension as fallback
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return { 
        isValid: false, 
        error: 'File must be JPEG, PNG, GIF, WebP, BMP, or TIFF format' 
      };
    }

    return { isValid: true };
  }

  // Validate media file (image or video)
  static validateMediaFile(file: File): { isValid: boolean; error?: string } {
    // Check if it's an image
    if (file.type.startsWith('image/')) {
      return this.validateImageFile(file);
    }

    // Check if it's a video
    if (file.type.startsWith('video/')) {
      return this.validateVideoFile(file);
    }

    return { isValid: false, error: 'File must be an image or video' };
  }

  // Validate video file
  static validateVideoFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return { isValid: false, error: 'File must be a video' };
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Video file size must be less than 500MB' };
    }

    // Check file type specifically
    const allowedTypes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 
      'video/flv', 'video/webm', 'video/mkv', 'video/mpeg', 
      'video/mpg', 'video/3gp', 'video/quicktime'
    ];
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Video must be MP4, AVI, MOV, WMV, FLV, WebM, MKV, MPEG, MPG, or 3GP format' 
      };
    }

    return { isValid: true };
  }

  // Check if file is an image
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a video
  static isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  // Get file type category
  static getFileCategory(file: File): 'image' | 'video' | 'document' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  }

  // Debug helper - get detailed file information
  static getFileDebugInfo(file: File): {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    category: 'image' | 'video' | 'document';
    isValidImage: boolean;
    isValidVideo: boolean;
    isValidMedia: boolean;
  } {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      category: this.getFileCategory(file),
      isValidImage: this.validateImageFile(file).isValid,
      isValidVideo: this.validateVideoFile(file).isValid,
      isValidMedia: this.validateMediaFile(file).isValid,
    };
  }
}

export default FileUploadService; 