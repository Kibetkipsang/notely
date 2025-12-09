import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { login, register, logout } from './controllers/auth'; 
import {
  createNote,
  getNote,
  getAllNotes,
  updateNote,
  softDeleteNote,
  getDeletedNotes,
  restoreNote,
  deleteNotePermanently,
  emptyTrash,
  searchNotes,
  getNoteStats,
  togglePinNote,        // ADD THIS
  toggleFavoriteNote,   // ADD THIS
  toggleBookmarkNote,   // ADD THIS
  getFavoriteNotes,     // ADD THIS
  getPinnedNotes,       // ADD THIS
  getBookmarkedNotes ,   // ADD THIS
  deleteAllNotes,
  softDeleteAllNotes
} from './controllers/notes'; 
import {
  getActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  getUnreadCount,
  deleteActivity,
  clearAllActivities,
} from './controllers/activities';
import { getUserProfile, updatePassword, updateUserProfile, updateUserSettings,getUserSettings, deleteAccount } from './controllers/auth';
import { authenticate } from './middlewares/checkUser'
import { upload, uploadAvatar } from './controllers/users';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174",],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);

// Routes

// Auth routes
app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/auth/logout', logout);
app.get('/auth/profile', authenticate, getUserProfile);
app.put('/auth/profile', authenticate, updateUserProfile);
app.put('/auth/password', authenticate, updatePassword);
app.get('/auth/settings', authenticate, getUserSettings);
app.put('/auth/settings', authenticate, updateUserSettings);
app.delete('/auth/account', authenticate, deleteAccount);
app.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// Notes routes
app.post('/notes/create', authenticate, createNote); 
app.get('/notes/stats', authenticate, getNoteStats);
app.get('/notes/search', authenticate, searchNotes);
app.get('/notes/trash', authenticate, getDeletedNotes);
app.delete('/notes/trash/empty', authenticate, emptyTrash); 
app.get('/notes/favorites', authenticate, getFavoriteNotes);
app.get('/notes/pinned', authenticate, getPinnedNotes);
app.get('/notes/bookmarks', authenticate, getBookmarkedNotes); // NEW
app.patch('/notes/:id/pin', authenticate, togglePinNote);
app.patch('/notes/:id/favorite', authenticate, toggleFavoriteNote);
app.patch('/notes/:id/bookmark', authenticate, toggleBookmarkNote); // NEW
app.post('/notes/:id/restore', authenticate, restoreNote);
app.get('/notes/:id', authenticate, getNote);
app.put('/notes/:id', authenticate, updateNote); 
app.patch('/notes/:id/soft-delete', authenticate, softDeleteNote); 
app.delete('/notes/all', authenticate, deleteAllNotes);
app.delete('/notes/:id', authenticate, deleteNotePermanently);
app.get('/notes', authenticate, getAllNotes);
app.post('/notes/all/trash', authenticate, softDeleteAllNotes);

// Activities Routes
app.get('/activities', authenticate, getActivities);
app.get('/activities/unread-count', authenticate, getUnreadCount);
app.patch('/activities/:id/read', authenticate, markActivityAsRead);
app.patch('/activities/read-all', authenticate, markAllActivitiesAsRead);
app.delete('/activities/:id', authenticate, deleteActivity);
app.delete('/activities', authenticate, clearAllActivities);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log available routes
  console.log('\n📋 Available Routes:');
  console.log('=====================');
  console.log('POST   /auth/register');
  console.log('POST   /auth/login');
  console.log('POST   /auth/logout');
  console.log('GET    /auth/profile');
  console.log('PUT    /auth/profile');
  console.log('PUT    /auth/password');
  console.log('GET    /auth/settings');
  console.log('PUT    /auth/settings');
  console.log('DELETE /auth/account');
  console.log('---------------------');
  console.log('POST   /notes/create');
  console.log('GET    /notes');
  console.log('GET    /notes/favorites');
  console.log('GET    /notes/pinned');
  console.log('GET    /notes/bookmarks');     // NEW
  console.log('GET    /notes/:id');
  console.log('PUT    /notes/:id');
  console.log('PATCH  /notes/:id/pin');
  console.log('PATCH  /notes/:id/favorite');
  console.log('PATCH  /notes/:id/bookmark');  // NEW
  console.log('PATCH  /notes/:id/soft-delete');
  console.log('DELETE /notes/:id');
  console.log('GET    /notes/trash');
  console.log('DELETE /notes/trash/empty');
  console.log('POST   /notes/:id/restore');
  console.log('GET    /notes/search');
  console.log('GET    /notes/stats');
  console.log('---------------------');
  console.log('GET    /activities');
  console.log('GET    /activities/unread-count');
  console.log('PATCH  /activities/:id/read');
  console.log('PATCH  /activities/read-all');
  console.log('DELETE /activities/:id');
  console.log('DELETE /activities');
  console.log('---------------------');
  console.log('GET    /health');
});