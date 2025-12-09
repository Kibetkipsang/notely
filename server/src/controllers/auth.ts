import {type Request, type Response} from 'express'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const client = new PrismaClient();


export const register = async (req:Request, res: Response): Promise<Response | void> => {
    try{
        // get body content
        const {firstName, lastName, userName, emailAddress, password} = req.body
        if(!firstName || !lastName || !userName || !emailAddress || !password){
            return res.status(400).json({
                message: "All fields are required."
            })
        }
        // hash password
        const passwordHash = await bcrypt.hash(password, 10)
        // save user to database
        const user = await client.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                userName,
                emailAddress,
                password: passwordHash
            }
        });
        return res.status(200).json({
            message: "User created successfully."
        })
    }catch(err){
        return res.status(500).json({
            message: "Something went wrong. Please try again later."
        })
    }
}

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { identifier, password } = req.body;

    console.log('=== LOGIN START ===');
    console.log('Login attempt for:', identifier);

    // Find user by username or email
    const user = await client.user.findFirst({
      where: {
        OR: [{ userName: identifier }, { emailAddress: identifier }]
      }
    });

    if (!user) {
      console.log('User not found');
      return res.status(400).json({
        success: false,
        message: 'Wrong Login Credentials.'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({
        success: false,
        message: 'Wrong Login Credentials.'
      });
    }

    // Payload for JWT
    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      emailAddress: user.emailAddress
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: '2h' });

    console.log('Token generated (first 20 chars):', token.substring(0, 20) + '...');

    // Set cookie with proper settings for localhost
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,         
      sameSite: 'lax',        
      maxAge: 2 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('Cookie set in response');

    // Respond with payload
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: payload,
      token
    });

    console.log('=== LOGIN COMPLETE ===');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("authToken").status(200).json({
      message: "logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    const user = await client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastPasswordChange: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, emailAddress, avatarUrl } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    // Validate required fields
    if (!firstName || !lastName || !emailAddress) {
      res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Check if email is already taken by another user
    const existingUser = await client.user.findFirst({
      where: {
        emailAddress,
        id: { not: userId },
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email address is already in use',
      });
      return;
    }

    // Update user profile
    const updatedUser = await client.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        emailAddress,
        avatarUrl: avatarUrl || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    
    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({
        success: false,
        message: 'Email address is already in use',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// Update user password
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    // Validate required fields
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
      return;
    }

    // Validate new password length
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
      return;
    }

    // Get user with password
    const user = await client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await client.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
    });
  }
};

// Get user settings
export const getUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    // Get user settings or create default if not exists
    let settings = await client.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = await client.userSettings.create({
        data: {
          userId,
          emailNotifications: true,
          darkMode: false,
          language: 'en',
          timezone: 'UTC',
          pushNotifications: true,
          soundEnabled: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings',
    });
  }
};

// Update user settings
export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { 
      emailNotifications, 
      darkMode, 
      language, 
      timezone,
      pushNotifications,
      soundEnabled 
    } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    // Update or create user settings
    const settings = await client.userSettings.upsert({
      where: { userId },
      update: {
        emailNotifications: Boolean(emailNotifications),
        darkMode: Boolean(darkMode),
        language: language || 'en',
        timezone: timezone || 'UTC',
        pushNotifications: Boolean(pushNotifications),
        soundEnabled: Boolean(soundEnabled),
        updatedAt: new Date(),
      },
      create: {
        userId,
        emailNotifications: Boolean(emailNotifications),
        darkMode: Boolean(darkMode),
        language: language || 'en',
        timezone: timezone || 'UTC',
        pushNotifications: Boolean(pushNotifications),
        soundEnabled: Boolean(soundEnabled),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
    });
  }
};

// Export user data
export const exportUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    // Get all user data
    const [user, settings, notes] = await Promise.all([
      client.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          emailAddress: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      client.userSettings.findUnique({
        where: { userId },
      }),
      client.note.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          content: true,
          synopsis: true,
          isPinned: true,
          isFavorite: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      settings,
      notes: {
        count: notes.length,
        data: notes,
      },
    };

    res.status(200).json({
      success: true,
      data: exportData,
      message: 'Data exported successfully',
    });
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
    });
  }
};

// Delete user account (with confirmation)
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
      return;
    }

    // Get user with password
    const user = await client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Password is incorrect',
      });
      return;
    }

    // Permanent deletion: delete user (cascade delete notes & settings)
    await client.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};

// Cancel scheduled deletion
export const cancelAccountDeletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    const user = await client.user.findUnique({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    await client.user.update({
      where: { id: userId },
      data: {
        scheduledForDeletion: null,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Account deletion cancelled',
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel account deletion',
    });
  }
};

// Get account deletion status
export const getAccountDeletionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No user ID found',
      });
      return;
    }

    const user = await client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
        scheduledForDeletion: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get deletion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account deletion status',
    });
  }
};