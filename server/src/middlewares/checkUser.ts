// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define user interface
interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
}


export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 Auth middleware starting...');

    // Get token from cookies or Authorization header
    let token = req.cookies?.authToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('📥 Token extracted from Authorization header');
      }
    }

    if (!token) {
      console.log('❌ No auth token found');
      res.status(401).json({ 
        success: false, 
        error: 'Please log in to access this resource' 
      });
      return;
    }

    console.log('🔍 Verifying token...');
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as AuthenticatedUser;
    console.log(`✅ Token verified for user: ${decoded.emailAddress} (ID: ${decoded.id})`);

    // Check if user exists and is NOT deleted
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
        isDeleted: false  // CRITICAL: Exclude deleted users
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
        isDeleted: true,
        deletedAt: true,
        scheduledForDeletion: true,
      }
    });

    if (!user) {
      console.log('❌ User not found or account deleted');
      res.clearCookie('authToken');
      res.status(401).json({ 
        success: false, 
        error: 'Account not found or has been deleted' 
      });
      return;
    }

    // Check if account is scheduled for deletion
    if (user.scheduledForDeletion) {
      const now = new Date();
      if (user.scheduledForDeletion <= now) {
        console.log('🗑️ Account scheduled for deletion - executing now...');
        
        // Perform deletion since schedule date has passed
        await deleteUserAccount(user.id);
        
        res.clearCookie('authToken');
        res.status(401).json({ 
          success: false, 
          error: 'Your account has been deleted as scheduled' 
        });
        return;
      } else {
        console.log(`⚠️ Account scheduled for deletion on: ${user.scheduledForDeletion.toISOString()}`);
        // User can still access but we might want to show a warning
      }
    }

    // Double-check if account is marked as deleted (shouldn't happen with isDeleted filter)
    if (user.isDeleted) {
      console.log('❌ Account is marked as deleted');
      res.clearCookie('authToken');
      res.status(401).json({ 
        success: false, 
        error: 'Your account has been deleted' 
      });
      return;
    }

    // Attach user to request object (only non-sensitive fields)
    req.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      emailAddress: user.emailAddress,
    };

    console.log(`✅ Authentication successful for: ${user.emailAddress}`);
    next();

  } catch (error: any) {
    console.error('🔥 Authentication error:', error.message);

    // Clear invalid/expired token cookie
    res.clearCookie('authToken');

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        error: 'Your session has expired. Please log in again.' 
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid session. Please log in again.' 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed. Please try again.' 
    });
  }
};

// Helper function to delete user account
async function deleteUserAccount(userId: string): Promise<void> {
  try {
    console.log(`Starting account deletion for user: ${userId}`);
    
    // First, delete user settings
    await prisma.userSettings.deleteMany({
      where: { userId }
    });
    
    console.log('✅ User settings deleted');

    // Soft delete the user (anonymize data)
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        emailAddress: `deleted_${userId}@deleted.com`,
        firstName: 'Deleted',
        lastName: 'User',
        userName: `deleted_${Date.now()}`,
        avatarUrl: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        scheduledForDeletion: null,
      }
    });

    console.log('✅ User account anonymized and marked as deleted');
  } catch (error) {
    console.error('❌ Failed to delete user account:', error);
    throw error;
  }
}

// Optional: Middleware to check account status (for specific routes)
export const checkAccountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'User not authenticated' 
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        isDeleted: true,
        deletedAt: true,
        scheduledForDeletion: true,
      }
    });

    if (!user) {
      res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
      return;
    }

    // You can add account status to request if needed
    // req.accountStatus = user;

    // If account is scheduled for deletion, add warning header
    if (user.scheduledForDeletion) {
      const daysLeft = Math.ceil((user.scheduledForDeletion.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      res.setHeader('X-Account-Status', `scheduled-for-deletion:${daysLeft} days`);
    }

    next();
  } catch (error) {
    console.error('Account status check error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check account status' 
    });
  }
};

// Export types for use in other files
export type { AuthenticatedUser };