// // controllers/settings.controller.ts
// import { type Request, type Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Get user settings
// export const getUserSettings = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.id;

//     if (!userId) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const settings = await prisma.userSettings.findUnique({
//       where: { userId },
//       select: {
//         emailNotifications: true,
//         darkMode: true,
//         language: true,
//         timezone: true,
//         pushNotifications: true,
//         soundEnabled: true,
//       },
//     });

//     // If no settings exist, create default ones
//     if (!settings) {
//       const defaultSettings = await prisma.userSettings.create({
//         data: {
//           userId,
//           emailNotifications: true,
//           darkMode: false,
//           language: 'en',
//           timezone: 'UTC',
//           pushNotifications: true,
//           soundEnabled: true,
//         },
//         select: {
//           emailNotifications: true,
//           darkMode: true,
//           language: true,
//           timezone: true,
//           pushNotifications: true,
//           soundEnabled: true,
//         },
//       });
      
//       res.status(200).json({
//         success: true,
//         data: defaultSettings,
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       data: settings,
//     });
//   } catch (error) {
//     console.error('Get user settings error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch user settings',
//     });
//   }
// };

// // Update user settings
// export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.id;
//     const {
//       emailNotifications,
//       darkMode,
//       language,
//       timezone,
//       pushNotifications,
//       soundEnabled,
//     } = req.body;

//     if (!userId) {
//       res.status(401).json({ error: 'Unauthorized' });
//       return;
//     }

//     const updatedSettings = await prisma.userSettings.upsert({
//       where: { userId },
//       update: {
//         emailNotifications,
//         darkMode,
//         language,
//         timezone,
//         pushNotifications,
//         soundEnabled,
//         updatedAt: new Date(),
//       },
//       create: {
//         userId,
//         emailNotifications: emailNotifications ?? true,
//         darkMode: darkMode ?? false,
//         language: language ?? 'en',
//         timezone: timezone ?? 'UTC',
//         pushNotifications: pushNotifications ?? true,
//         soundEnabled: soundEnabled ?? true,
//       },
//       select: {
//         emailNotifications: true,
//         darkMode: true,
//         language: true,
//         timezone: true,
//         pushNotifications: true,
//         soundEnabled: true,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Settings updated successfully',
//       data: updatedSettings,
//     });
//   } catch (error) {
//     console.error('Update user settings error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update user settings',
//     });
//   }
// };