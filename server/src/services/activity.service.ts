
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ActivityData = {
  type: string;
  action: string;
  targetType: string;
  targetId?: string;
  title: string;
  message?: string;
  data?: any;
};

export class ActivityService {
  static async createActivity(userId: string, data: ActivityData) {
    return prisma.activity.create({
      data: {
        userId,
        ...data,
        data: data.data ? JSON.stringify(data.data) : null
      },
      select: {
        id: true,
        type: true,
        action: true,
        title: true,
        message: true,
        read: true,
        createdAt: true,
      }
    });
  }
  
  static async getUserActivities(userId: string, options: { 
    limit?: number; 
    unreadOnly?: boolean;
    page?: number;
  } = {}) {
    const whereClause: any = { userId };
    
    if (options.unreadOnly) {
      whereClause.read = false;
    }
    
    const limit = options.limit || 20;
    const page = options.page || 1;
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          action: true,
          targetType: true,
          targetId: true,
          title: true,
          message: true,
          data: true,
          read: true,
          createdAt: true,
          readAt: true,
        }
      }),
      prisma.activity.count({ where: whereClause })
    ]);
    
    // Parse JSON data
    const parsedActivities = activities.map(activity => ({
      ...activity,
      data: activity.data ? JSON.parse(activity.data) : null
    }));
    
    return {
      activities: parsedActivities,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
  
  static async markAsRead(userId: string, activityId: string) {
    return prisma.activity.updateMany({
      where: { id: activityId, userId },
      data: { 
        read: true,
        readAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  static async markAllAsRead(userId: string) {
    return prisma.activity.updateMany({
      where: { 
        userId, 
        read: false 
      },
      data: { 
        read: true,
        readAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  static async getUnreadCount(userId: string) {
    return prisma.activity.count({
      where: { 
        userId, 
        read: false 
      }
    });
  }
  
  static async deleteActivity(userId: string, activityId: string) {
    return prisma.activity.deleteMany({
      where: { id: activityId, userId }
    });
  }
  
  static async deleteAllActivities(userId: string) {
    return prisma.activity.deleteMany({
      where: { userId }
    });
  }
}