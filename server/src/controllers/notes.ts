// controllers/notes.controller.ts
import { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
        isDeleted: false, // Only fetch non-deleted notes
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
export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      userId,
      isDeleted: false,
    };

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

    // Get notes
    const notes = await prisma.note.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        synopsis: true,
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
    console.error('Get all notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes',
    });
  }
};

// Update Note
export const updateNote = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const { title, content, synopsis } = req.body;
    const userId = req.user?.id;

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
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
export const softDeleteNote = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: false, // Only soft delete if not already deleted
      },
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
export const restoreNote = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
        isDeleted: true, // Only restore if it's in trash
      },
    });

    if (!existingNote) {
       res.status(404).json({
        success: false,
        error: 'Note not found in trash',
      });
      return
    }

    await prisma.note.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
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

    // Verify note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNote) {
       res.status(404).json({
        success: false,
        error: 'Note not found',
      });
      return
    }

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

    // Delete all soft-deleted notes for the user
    const result = await prisma.note.deleteMany({
      where: {
        userId,
        isDeleted: true,
      },
    });

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