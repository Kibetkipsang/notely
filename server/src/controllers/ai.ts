// controllers/aiController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GroqService } from '../services/aiServices'; // Fixed import path

const client = new PrismaClient();

// Update the types to match Gemini's format
interface ChatMessage {
  role: 'user' | 'model' | 'assistant'; // Include both possibilities
  content: string;
}

export const generateNoteContent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { prompt, noteId } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Get context from existing note if noteId provided
    let context = '';
    if (noteId) {
      const existingNote = await client.note.findUnique({
        where: { id: noteId, userId },
        select: { content: true }
      });
      context = existingNote?.content || '';
    }

    // Call GeminiService
    const aiContent = await GroqService.generateNoteContent(prompt, context, userId);

    res.status(200).json({
      success: true,
      data: {
        content: aiContent,
        prompt,
        noteId: noteId || null
      }
    });
  } catch (error: any) {
    console.error('Generate content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate content'
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { message, chatId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get or create chat
    let chat = chatId ? await client.aIChat.findUnique({
      where: { id: chatId, userId }
    }) : null;

    if (!chat) {
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      chat = await client.aIChat.create({
        data: {
          userId,
          title
        }
      });
    }

    // Get chat history
    const chatMessages = await client.aIMessage.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true }
    });

    // Convert to format GeminiService expects
    const chatHistory = chatMessages.map(msg => ({
      role: msg.role, // This is 'user' or 'assistant' from DB
      content: msg.content
    }));

    // Call GeminiService
    const aiResponse = await GroqService.chatWithAssistant(message, chatHistory, userId);

    // Save messages
    await client.$transaction([
      client.aIMessage.create({
        data: {
          chatId: chat.id,
          role: 'user',
          content: message
        }
      }),
      client.aIMessage.create({
        data: {
          chatId: chat.id,
          role: 'model', // Changed from 'assistant' for Gemini
          content: aiResponse.response
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse.response,
        chatId: chat.id,
        tokenUsage: aiResponse.tokenUsage
      }
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat'
    });
  }
};

export const getUserChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const chats = await client.aIChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error: any) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chats'
    });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Verify chat belongs to user
    const chat = await client.aIChat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chat history'
    });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Verify chat belongs to user
    const chat = await client.aIChat.findFirst({
      where: { id: chatId, userId }
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    await client.aIChat.delete({
      where: { id: chatId }
    });

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete chat'
    });
  }
};

export const summarizeNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({ success: false, message: 'Note IDs array is required' });
    }

    // Get notes content
    const notes = await client.note.findMany({
      where: {
        id: { in: noteIds },
        userId,
        isDeleted: false
      },
      select: { content: true, title: true }
    });

    const notesContent = notes.map(note => note.content).filter(Boolean);
    
    if (notesContent.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid notes found' });
    }

    // Call GeminiService
    const summary = await GroqService.summarizeNotes(notesContent, userId);

    res.status(200).json({
      success: true,
      data: { 
        summary, 
        noteCount: notesContent.length,
        noteTitles: notes.map(note => note.title)
      }
    });
  } catch (error: any) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to summarize notes'
    });
  }
};

export const generateTags = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Call GeminiService
    const tags = await GroqService.generateTags(content, userId);

    res.status(200).json({
      success: true,
      data: { tags }
    });
  } catch (error: any) {
    console.error('Generate tags error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate tags'
    });
  }
};

export const getAIUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Get usage stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsage, totalUsage, usageByEndpoint] = await Promise.all([
      // Today's usage
      client.aIUsage.aggregate({
        where: {
          userId,
          createdAt: { gte: today }
        },
        _sum: { tokens: true, cost: true }
      }),
      
      // Total usage
      client.aIUsage.aggregate({
        where: { userId },
        _sum: { tokens: true, cost: true },
        _count: true
      }),
      
      // Usage by endpoint
      client.aIUsage.groupBy({
        by: ['endpoint'],
        where: { userId },
        _sum: { tokens: true, cost: true },
        _count: true
      })
    ]);

    const stats = {
      today: {
        tokens: todayUsage._sum.tokens || 0,
        cost: todayUsage._sum.cost || 0
      },
      total: {
        count: totalUsage._count || 0,
        tokens: totalUsage._sum.tokens || 0,
        cost: totalUsage._sum.cost || 0
      },
      byEndpoint: usageByEndpoint.map(item => ({
        endpoint: item.endpoint,
        count: item._count,
        tokens: item._sum.tokens || 0,
        cost: item._sum.cost || 0
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get AI usage stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get usage statistics'
    });
  }
};