// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('=== AUTH MIDDLEWARE START ===');
    console.log('Cookies received:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);

    // Get token from cookies or Authorization header
    let token = req.cookies?.authToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('No authToken cookie or Authorization header found');
      res.status(401).json({ success: false, error: 'Unauthorized - Please log in first' });
      return;
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      firstName: string;
      lastName: string;
      userName: string;
      emailAddress: string;
    };

    console.log('Token decoded successfully for user ID:', decoded.id);

    // Verify user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
      }
    });

    if (!user) {
      console.log('User not found in database');
      res.status(401).json({ success: false, error: 'Unauthorized - User not found' });
      return;
    }

    // Attach user to request object
    req.user = user;

    console.log('Authentication successful for user:', user.emailAddress);
    next();

  } catch (error: any) {
    console.error('Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, error: 'Unauthorized - Token expired' });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ success: false, error: 'Unauthorized - Invalid token' });
      return;
    }

    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};
