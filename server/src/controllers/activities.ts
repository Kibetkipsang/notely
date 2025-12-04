
import { type Request, type Response } from 'express';
import { ActivityService } from '../services/activity.service';

// Get user activities
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await ActivityService.getUserActivities(userId, {
      page,
      limit,
      unreadOnly
    });

    const unreadCount = await ActivityService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: result.activities,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
    });
  }
};

// Mark activity as read
export const markActivityAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const result = await ActivityService.markAsRead(userId, id);
    
    if (result.count === 0) {
      res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
      return;
    }

    const unreadCount = await ActivityService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      message: 'Activity marked as read',
      unreadCount,
    });
  } catch (error) {
    console.error('Mark activity as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark activity as read',
    });
  }
};

// Mark all activities as read
export const markAllActivitiesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const result = await ActivityService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `Marked ${result.count} activities as read`,
      count: result.count,
    });
  } catch (error) {
    console.error('Mark all activities as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all activities as read',
    });
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const unreadCount = await ActivityService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
};

// Delete activity
export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const result = await ActivityService.deleteActivity(userId, id);
    
    if (result.count === 0) {
      res.status(404).json({
        success: false,
        error: 'Activity not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete activity',
    });
  }
};

// Clear all activities
export const clearAllActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Unauthorized - No user ID found' 
      });
      return;
    }

    const result = await ActivityService.deleteAllActivities(userId);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.count} activities`,
      count: result.count,
    });
  } catch (error) {
    console.error('Clear all activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear all activities',
    });
  }
};