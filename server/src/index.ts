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
} from '../src/controllers/notes';
import { authenticate } from './middlewares/checkUser'

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
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })
);


// Routes

// Auth routes
app.post('/auth/register', register);
app.post('/auth/login', login);
app.post('/auth/logout', logout);

// Notes routes - FIXED: Consistent naming
app.post('/notes/create', authenticate, createNote); 
app.get('/notes/stats', authenticate, getNoteStats);
app.get('/notes/search', authenticate, searchNotes);
app.get('/notes/trash', authenticate, getDeletedNotes);
app.delete('/notes/trash/empty', authenticate, emptyTrash); 
app.post('/notes/:id/restore', authenticate, restoreNote);
app.get('/notes/:id', authenticate, getNote);
app.put('/notes/:id', authenticate, updateNote); 
app.patch('/notes/:id/soft-delete', authenticate, softDeleteNote); 
app.delete('/notes/:id', authenticate, deleteNotePermanently);
app.get('/notes', authenticate, getAllNotes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - ADD THIS
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
});