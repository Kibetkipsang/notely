import cloudinary from "../config/cloudinary";
import multer from 'multer';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

// Use multer memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'avatars', resource_type: 'image' },
      async (error, result) => {
        if (error || !result) {
          console.error(error);
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        }

        // Save URL in database
        const updatedUser = await client.user.update({
          where: { id: userId },
          data: { avatarUrl: result.secure_url },
          select: { id: true, avatarUrl: true },
        });

        res.status(200).json({ success: true, message: 'Avatar updated', data: updatedUser });
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
