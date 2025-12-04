// controllers/notes.controller.ts
import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ActivityService, ActivityData } from '../services/activity.service';

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
       
      };
    }
  }
}


const prisma = new PrismaClient();



// Create Note
export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, synopsis } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        title,
        content,
        synopsis,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            emailAddress: true,
          },
        },
      },
    });

    // Create activity for note creation
    await ActivityService.createActivity(userId, {
      type: 'note_created',
      action: 'created',
      targetType: 'note',
      targetId: note.id,
      title: `Created: ${title}`,
      message: 'New note created successfully',
      data: { 
        noteId: note.id, 
        preview: content ? content.substring(0, 100) + '...' : '' 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create note',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


// Get Single Note
export const getNote = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,      // ADD THIS
        isFavorite: true,    // ADD THIS
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!note) {
      res.status(404).json({
        success: false,
        error: 'Note not found or you do not have permission',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note',
    });
  }
};

// Get All Notes (with pagination)
export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    console.log('=== BACKEND: GET ALL NOTES ===');
    console.log('Request user:', req.user);
    console.log('User ID from req.user?.id:', userId);
    
    if (!userId) {
      console.log('ERROR: No user ID found in request');
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId,
      isDeleted: false,
    };
    
    console.log('Prisma where clause:', JSON.stringify(whereClause, null, 2));

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { synopsis: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.note.count({
      where: whereClause,
    });
    
    console.log('Total notes found in DB:', total);

    // Get notes - ADD isPinned and isFavorite to select
    const notes = await prisma.note.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,      // ADD THIS
        isFavorite: true,    // ADD THIS
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned notes first
        { updatedAt: 'desc' }, // Then by recency
      ],
      skip,
      take: limit,
    });
    
    console.log('Notes retrieved:', notes.length);
    if (notes.length > 0) {
      console.log('First note:', notes[0]);
    }

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
    
    console.log('Response sent successfully');
    
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes',
    });
  }
};

// Update Note
export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, synopsis } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found or you do not have permission',
      });
      return;
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(synopsis !== undefined && { synopsis }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity for note update
    await ActivityService.createActivity(userId, {
      type: 'note_updated',
      action: 'updated',
      targetType: 'note',
      targetId: id,
      title: `Updated: ${updatedNote.title}`,
      message: 'Note content updated',
      data: { 
        noteId: id,
        changes: { title: !!title, content: !!content, synopsis: synopsis !== undefined }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note',
    });
  }
};
// Soft Delete Note
export const softDeleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found or already deleted',
      });
      return;
    }

    // Soft delete (mark as deleted)
    await prisma.note.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create activity for moving to trash
    await ActivityService.createActivity(userId, {
      type: 'note_deleted',
      action: 'deleted',
      targetType: 'note',
      targetId: id,
      title: `Moved to trash: ${existingNote.title}`,
      message: 'Note moved to trash',
      data: { 
        noteId: id,
        deletedAt: new Date().toISOString()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Note moved to trash successfully',
    });
  } catch (error) {
    console.error('Soft delete note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to move note to trash',
    });
  }
};


// Get Deleted Notes (Trash)
export const getDeletedNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await prisma.note.count({
      where: {
        userId,
        isDeleted: true,
      },
    });

    const notes = await prisma.note.findMany({
      where: {
        userId,
        isDeleted: true,
      },
      select: {
        id: true,
        title: true,
        synopsis: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      orderBy: {
        deletedAt: 'desc',
      },
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get deleted notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deleted notes',
    });
  }
};

// Restore Note from Trash
export const restoreNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: true,
      },
      select: {
        id: true,
        title: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found in trash',
      });
      return;
    }

    await prisma.note.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    });

    // Create activity for restoring from trash
    await ActivityService.createActivity(userId, {
      type: 'note_restored',
      action: 'restored',
      targetType: 'note',
      targetId: id,
      title: `Restored: ${existingNote.title}`,
      message: 'Note restored from trash',
      data: { 
        noteId: id,
        restoredAt: new Date().toISOString()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Note restored successfully',
    });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore note',
    });
  }
};
// Permanently Delete Note
export const deleteNotePermanently = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        title: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found',
      });
      return;
    }

    // Create activity before deletion (for audit trail)
    await ActivityService.createActivity(userId, {
      type: 'note_permanently_deleted',
      action: 'permanently_deleted',
      targetType: 'note',
      targetId: id,
      title: `Permanently deleted: ${existingNote.title}`,
      message: 'Note permanently deleted',
      data: { 
        noteId: id,
        deletedAt: new Date().toISOString()
      }
    });

    // Permanently delete
    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Note permanently deleted',
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note permanently',
    });
  }
};

// Empty Trash (Delete all deleted notes permanently)
export const emptyTrash = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get notes before deletion for activity
    const notesToDelete = await prisma.note.findMany({
      where: {
        userId,
        isDeleted: true,
      },
      select: {
        id: true,
        title: true,
      }
    });

    // Delete all soft-deleted notes for the user
    const result = await prisma.note.deleteMany({
      where: {
        userId,
        isDeleted: true,
      },
    });

    // Create activity for emptying trash
    if (notesToDelete.length > 0) {
      await ActivityService.createActivity(userId, {
        type: 'trash_emptied',
        action: 'emptied',
        targetType: 'system',
        title: 'Trash emptied',
        message: `Permanently deleted ${result.count} notes from trash`,
        data: { 
          count: result.count,
          noteIds: notesToDelete.map(note => note.id),
          deletedAt: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.count} notes from trash`,
      count: result.count,
    });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to empty trash',
    });
  }
};

// Search Notes
export const searchNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { query } = req.query;
    const includeDeleted = req.query.includeDeleted === 'true';

    if (!query || typeof query !== 'string') {
       res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
      return
    }

    const notes = await prisma.note.findMany({
      where: {
        userId,
        isDeleted: includeDeleted ? undefined : false,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { synopsis: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Limit results
    });

    res.status(200).json({
      success: true,
      data: notes,
      count: notes.length,
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search notes',
    });
  }
};

// Get Note Statistics
export const getNoteStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const [totalNotes, activeNotes, deletedNotes, recentNotes] = await Promise.all([
      // Total notes (including deleted)
      prisma.note.count({ where: { userId } }),
      
      // Active notes
      prisma.note.count({ where: { userId, isDeleted: false } }),
      
      // Deleted notes
      prisma.note.count({ where: { userId, isDeleted: true } }),
      
      // Recent notes (last 7 days)
      prisma.note.count({
        where: {
          userId,
          isDeleted: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        activeNotes,
        deletedNotes,
        recentNotes,
      },
    });
  } catch (error) {
    console.error('Get note stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note statistics',
    });
  }
};

export const togglePinNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (typeof isPinned !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'isPinned must be a boolean value',
      });
      return;
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        isPinned: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found or you do not have permission',
      });
      return;
    }

    // Update pin status with pinnedAt timestamp
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        isPinned,
        pinnedAt: isPinned ? new Date() : null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,
        isFavorite: true,
        pinnedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity for pin/unpin
    await ActivityService.createActivity(userId, {
      type: 'note_updated',
      action: isPinned ? 'pinned' : 'unpinned',
      targetType: 'note',
      targetId: id,
      title: isPinned ? `Pinned: ${updatedNote.title}` : `Unpinned: ${updatedNote.title}`,
      message: isPinned ? 'Note pinned for quick access' : 'Note removed from pinned',
      data: { 
        noteId: id,
        previousState: { isPinned: existingNote.isPinned }
      }
    });

    res.status(200).json({
      success: true,
      message: isPinned ? 'Note pinned successfully' : 'Note unpinned successfully',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pin status',
    });
  }
};
// Toggle Favorite Status
export const toggleFavoriteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (typeof isFavorite !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'isFavorite must be a boolean value',
      });
      return;
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        isFavorite: true,
      }
    });

    if (!existingNote) {
      res.status(404).json({
        success: false,
        error: 'Note not found or you do not have permission',
      });
      return;
    }

    // Update favorite status with favoritedAt timestamp
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        isFavorite,
        favoritedAt: isFavorite ? new Date() : null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,
        isFavorite: true,
        favoritedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create activity for favorite/unfavorite
    await ActivityService.createActivity(userId, {
      type: 'note_updated',
      action: isFavorite ? 'favorited' : 'unfavorited',
      targetType: 'note',
      targetId: id,
      title: isFavorite ? `Favorited: ${updatedNote.title}` : `Unfavorited: ${updatedNote.title}`,
      message: isFavorite ? 'Note added to favorites' : 'Note removed from favorites',
      data: { 
        noteId: id,
        previousState: { isFavorite: existingNote.isFavorite }
      }
    });

    res.status(200).json({
      success: true,
      message: isFavorite ? 'Note added to favorites' : 'Note removed from favorites',
      data: updatedNote,
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update favorite status',
    });
  }
};

// Get Favorite Notes
export const getFavoriteNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build where clause for favorite notes
    const whereClause: any = {
      userId,
      isDeleted: false,
      isFavorite: true,
    };

    // Get total count for pagination
    const total = await prisma.note.count({
      where: whereClause,
    });

    // Get favorite notes
    const notes = await prisma.note.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { isPinned: 'desc' }, // Pinned favorites first
        { updatedAt: 'desc' }, // Then by recency
      ],
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get favorite notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorite notes',
    });
  }
};

// Get Pinned Notes
export const getPinnedNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build where clause for pinned notes
    const whereClause: any = {
      userId,
      isDeleted: false,
      isPinned: true,
    };

    // Get total count for pagination
    const total = await prisma.note.count({
      where: whereClause,
    });

    // Get pinned notes
    const notes = await prisma.note.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
        isPinned: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Get pinned notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pinned notes',
    });
  }
};