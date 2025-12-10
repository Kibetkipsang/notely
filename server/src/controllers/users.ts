import cloudinary from "../config/cloudinary";
import multer from 'multer';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

// Use multer memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<public_id>.<format>
    const parts = url.split('/');
    const filename = parts[parts.length - 1]; // Get the filename with extension
    const publicIdWithExtension = filename.split('.')[0]; // Remove extension
    const folder = 'avatars';
    
    // Return full public_id with folder
    return `${folder}/${publicIdWithExtension}`;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Get current user to delete old avatar if exists
    const currentUser = await client.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });

    // Delete old avatar from Cloudinary if exists
    if (currentUser?.avatarUrl) {
      const oldPublicId = extractPublicIdFromUrl(currentUser.avatarUrl);
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log(`Deleted old avatar: ${oldPublicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting old avatar from Cloudinary:', cloudinaryError);
          // Continue with upload even if deletion fails
        }
      }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { 
        folder: 'avatars', 
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      },
      async (error, result) => {
        if (error || !result) {
          console.error(error);
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        }

        // Save URL in database - REMOVED role from select
        const updatedUser = await client.user.update({
          where: { id: userId },
          data: { avatarUrl: result.secure_url },
          select: { 
            id: true, 
            avatarUrl: true,
            firstName: true,
            lastName: true,
            emailAddress: true,
            userName: true, // Added userName since it's in your UserType
            // REMOVED: role: true
          },
        });

        res.status(200).json({ 
          success: true, 
          message: 'Avatar updated successfully', 
          data: updatedUser 
        });
      }
    );

    // Pipe file buffer to Cloudinary
    if (req.file && req.file.buffer) {
      (result as any).end(req.file.buffer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};

// Delete avatar
export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Get current user to check if they have an avatar
    const currentUser = await client.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });

    // Delete from Cloudinary if avatar exists
    if (currentUser?.avatarUrl) {
      const publicId = extractPublicIdFromUrl(currentUser.avatarUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted avatar from Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
          console.error('Error deleting avatar from Cloudinary:', cloudinaryError);
          // Continue with database update even if Cloudinary deletion fails
        }
      }
    }

    // Update user to remove avatarUrl from database - REMOVED role from select
    const updatedUser = await client.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { 
        id: true, 
        avatarUrl: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        userName: true, // Added userName since it's in your UserType
        // REMOVED: role: true
      },
    });

    res.status(200).json({ 
      success: true, 
      message: 'Avatar removed successfully',
      data: updatedUser 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to remove avatar' });
  }
};