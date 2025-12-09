import { useState, useRef } from 'react';
import { api } from '../../axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  Loader2, 
  User, 
  CheckCircle,
  XCircle,
  Image
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate: (url: string) => void;
  className?: string;
}

export default function AvatarUpload({ 
  currentAvatar, 
  onAvatarUpdate,
  className 
}: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadProgress(0);
    
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      setPreview(null);
      return;
    }

    const selectedFile = e.target.files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.');
      toast.error('Invalid file type');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      toast.error('File too large');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', file); // Changed from 'file' to 'avatar' to match backend

    try {
      // Using axios progress tracking
      const res = await api.post('/avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (res.data.success) {
        onAvatarUpdate(res.data.data.avatarUrl);
        toast.success('Avatar updated successfully!');
        
        // Reset form
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-gray-100 shadow-lg">
            <AvatarImage 
              src={preview || currentAvatar} 
              alt="Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
              <User className="w-16 h-16 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          {/* Upload Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Click below to upload a new avatar
        </p>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* File Selection UI */}
      {!file ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={triggerFileInput}
        >
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Click to select an image</p>
          <p className="text-sm text-gray-400">
            PNG, JPG, GIF, WebP up to 5MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview Card */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Image className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            {uploading && uploadProgress > 0 && (
              <div className="mt-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-right mt-1 text-gray-500">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          onClick={triggerFileInput}
          variant="outline"
          className="flex-1"
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose File
        </Button>
        
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Upload Avatar
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended dimensions: 400x400 pixels</p>
      </div>
    </div>
  );
}