import { useState, useRef, useEffect } from 'react'; // Added useEffect
import { api } from '../../axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  Loader2, 
  User, 
  CheckCircle,
  XCircle,
  Image,
  Trash2,
  UserCircle,
  X,
  Camera
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AvatarUploadProps {
  currentAvatar?: string | null; // Make it explicitly nullable
  onAvatarUpdate: (url: string | null) => void;
  className?: string;
  userId?: string;
}

export default function AvatarUpload({ 
  currentAvatar, 
  onAvatarUpdate,
  className,
  userId 
}: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [displayedAvatar, setDisplayedAvatar] = useState<string | null | undefined>(currentAvatar);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update displayed avatar when currentAvatar prop changes
  useEffect(() => {
    setDisplayedAvatar(currentAvatar);
  }, [currentAvatar]);

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
    formData.append('avatar', file);

    try {
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
        const newAvatarUrl = res.data.data.avatarUrl;
        // Update both local state and parent
        setDisplayedAvatar(newAvatarUrl);
        onAvatarUpdate(newAvatarUrl);
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

  const handleDeleteAvatar = async () => {
  setDeleting(true);
  try {
    console.log('🔄 Calling DELETE /avatar endpoint...');
    
    // ✅ ADD THIS: Call the backend DELETE endpoint
    const response = await api.delete('/avatar');
    
    console.log('✅ Backend response:', response.data);
    
    if (response.data.success) {
      // First update local state immediately for instant feedback
      setDisplayedAvatar(null);
      
      // Then notify parent
      onAvatarUpdate(null);
      
      toast.success('Avatar removed successfully');
      
      // Reset file selection if any
      setFile(null);
      setPreview(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      throw new Error(response.data.message || 'Delete failed');
    }
  } catch (err: any) {
    console.error('❌ Delete error:', err);
    console.error('❌ Error details:', err.response?.data);
    
    // Revert local state if error occurs
    setDisplayedAvatar(currentAvatar);
    
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to remove avatar. Please try again.';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setDeleting(false);
    setShowDeleteDialog(false);
  }
};

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Check if we should show an existing avatar (not null/undefined and no file selected)
  const hasExistingAvatar = displayedAvatar && !file;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-4 border-gray-100 shadow-lg transition-all duration-300 group-hover:shadow-xl">
            <AvatarImage 
              src={preview || displayedAvatar || undefined} // Use empty string if no avatar
              alt="Avatar"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-orange-50 to-orange-100">
              <UserCircle className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-orange-400" />
            </AvatarFallback>
          </Avatar>
          
          {/* Camera overlay button - always show when not uploading */}
          {!uploading && (
            <button
              onClick={triggerFileInput}
              disabled={uploading || deleting}
              className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors shadow-lg z-10"
              title="Change avatar"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          
          {/* Delete button for existing avatar */}
          {hasExistingAvatar && !uploading && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
              title="Remove avatar"
            >
              {deleting ? (
                <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
              ) : (
                <X className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </button>
          )}
          
          {/* Upload Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-xs md:text-sm font-medium">Uploading...</p>
                {uploadProgress > 0 && (
                  <p className="text-white text-xs mt-1">{uploadProgress}%</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {hasExistingAvatar 
              ? 'Current profile picture' 
              : 'Upload your profile picture'}
          </p>
          {hasExistingAvatar && (
            <p className="text-xs text-gray-400 mt-1">
              Click the camera icon to change or the X to remove
            </p>
          )}
        </div>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || deleting}
      />

      {/* File Preview & Actions */}
      <div className="space-y-4 w-full">
        {file ? (
          <>
            {/* File Preview Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Image className="w-8 h-8 text-orange-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="mt-3">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Uploading...</p>
                    <p className="text-xs font-medium text-orange-600">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Buttons - COLUMN LAYOUT */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
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
              
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="w-full"
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Different File
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Main Upload Button (when no file selected) */}
            <Button
              onClick={triggerFileInput}
              disabled={uploading || deleting}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Upload New Photo
            </Button>

            {/* Remove Avatar Button (only when there's an existing avatar) */}
            {hasExistingAvatar && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Current Avatar
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 w-full">
            <p className="text-sm text-red-600 flex items-start">
              <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg w-full">
        <p className="font-medium text-gray-700 mb-2">Guidelines:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <p className="flex items-center">
            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
            Supported: JPEG, PNG, GIF, WebP
          </p>
          <p className="flex items-center">
            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
            Max size: 5MB
          </p>
          <p className="flex items-center">
            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
            Square images work best
          </p>
          <p className="flex items-center">
            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
            Recommended: 400×400 pixels
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Remove Profile Picture
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg my-4">
            <Avatar className="w-20 h-20">
              {displayedAvatar ? (
                <AvatarImage src={displayedAvatar} alt="Current avatar" />
              ) : (
                <AvatarFallback className="bg-gray-200">
                  <User className="w-10 h-10 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              disabled={deleting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              disabled={deleting}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white order-1 sm:order-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Picture
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}