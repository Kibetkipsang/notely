import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firstName: string;
        lastName: string;
        userName: string;
        emailAddress: string;
      };
      file?: Express.Multer.File;      // single file
      files?: Express.Multer.File[];   // multiple files
    }
  }
}
