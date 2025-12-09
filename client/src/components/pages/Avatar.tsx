import { useState } from 'react';
import { api } from '../../axios'; 
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui/button';

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }: { currentAvatar?: string, onAvatarUpdate: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'avatar_preset'); // your unsigned preset
    // Optionally, add folder: formData.append('folder', 'avatars');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const imageUrl = data.secure_url;
      onAvatarUpdate(imageUrl); // send to backend
      toast.success('Avatar uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {currentAvatar && (
        <img src={currentAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
      )}
      <Input type="file" accept="image/*" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Avatar'}
      </Button>
    </div>
  );
}
