// services/groqService.ts
import Groq from 'groq-sdk';
import { PrismaClient } from '@prisma/client';
import { NOTELY_COMPLETE_KNOWLEDGE, generateSystemPrompt, findRelevantKnowledge } from './notelyKnowledge';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});
const prisma = new PrismaClient();

export class GroqService {
  
  private static async trackUsage(
    userId: string, 
    endpoint: string, 
    tokens: number, 
    metadata?: any
  ) {
    try {
      const costPerToken = 0.0000001; // Groq is very cheap/free
      const cost = tokens * costPerToken;
      
      await prisma.aIUsage.create({
        data: {
          userId,
          endpoint,
          tokens,
          cost,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
    } catch (error) {
      console.error('Usage tracking error:', error);
    }
  }

  // Clean chat history helper method
  private static cleanChatHistory(chatHistory: any[]): any[] {
    if (!Array.isArray(chatHistory)) {
      console.warn('chatHistory is not an array:', chatHistory);
      return [];
    }
    
    console.log('=== DEBUG: Cleaning chatHistory ===');
    console.log('Original length:', chatHistory.length);
    
    const cleaned = chatHistory
      .filter((msg, index) => {
        // Filter out invalid messages
        if (!msg || typeof msg !== 'object') {
          console.warn(`Removing invalid chat history item at index ${index}:`, msg);
          return false;
        }
        
        // Must have content
        if (!msg.content || typeof msg.content !== 'string' || msg.content.trim().length === 0) {
          console.warn(`Removing empty content message at index ${index}`);
          return false;
        }
        
        return true;
      })
      .map((msg, index) => {
        // Ensure valid role
        const validRoles = ['system', 'user', 'assistant'] as const;
        let role = msg.role;
        
        if (!role || !validRoles.includes(role as any)) {
          console.warn(`Invalid role "${role}" at index ${index}, defaulting to 'user'`);
          role = 'user';
        }
        
        // Return cleaned message
        return {
          role: role as 'system' | 'user' | 'assistant',
          content: msg.content.trim()
        };
      })
      .slice(-10); // Keep only last 10 messages to avoid token limits
    
    console.log('Cleaned length:', cleaned.length);
    cleaned.forEach((msg, i) => {
      console.log(`Cleaned ${i}: role="${msg.role}", preview: "${msg.content.substring(0, 50)}..."`);
    });
    
    return cleaned;
  }

  // AI Writing Assistant for Notes
  static async generateNoteContent(prompt: string, context?: string, userId?: string) {
    try {
      const writingSystemPrompt = `You are Notely's AI Writing Assistant. Help users create, improve, and organize notes.
      
## NOTELY WRITING FEATURES YOU CAN USE:
${NOTELY_COMPLETE_KNOWLEDGE.coreFeatures.aiFeatures.map(f => `• ${f}`).join('\n')}

## MARKDOWN SUPPORT:
${NOTELY_COMPLETE_KNOWLEDGE.markdownGuide.basics.slice(0, 4).map(m => `• ${m}`).join('\n')}

## GUIDELINES:
1. Focus on practical, actionable content
2. Use Markdown formatting for better readability
3. Include headings, lists, and bullet points when appropriate
4. Keep responses clear and well-structured
5. Reference Notely features when relevant
`;

      const fullPrompt = context 
        ? `**User's Existing Note Context:**\n${context}\n\n**User Request:** ${prompt}\n\nPlease help with this writing task:`
        : `**User Request:** ${prompt}\n\nCreate helpful note content about this topic:`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: writingSystemPrompt
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800, // Increased for better quality
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || Math.ceil(content.length / 4);

      if (userId) {
        await this.trackUsage(userId, 'generate', tokens, {
          promptLength: prompt.length,
          contextLength: context?.length || 0,
          responseLength: content.length,
          model: 'llama-3.3-70b-versatile'
        });
      }

      return this.formatWritingResponse(content);
    } catch (error) {
      console.error('Groq generation error:', error);
      throw error;
    }
  }

  // AI Chat Assistant with Notely Knowledge
  static async chatWithAssistant(message: string, chatHistory: any[] = [], userId?: string) {
    try {
      // Generate context-aware system prompt
      const systemPrompt = generateSystemPrompt(message);
      
      // Clean and validate chat history
      const cleanedHistory = this.cleanChatHistory(chatHistory);
      
      // Create messages array
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt
        },
        ...cleanedHistory,
        {
          role: 'user' as const,
          content: message
        }
      ];

      // Add debug logging to see what's being sent
      console.log('=== DEBUG: Sending to Groq ===');
      messages.forEach((msg, index) => {
        console.log(`Message ${index}:`, {
          role: msg.role,
          contentLength: msg.content?.length,
          preview: msg.content?.substring(0, 50)
        });
      });
      console.log('=== END DEBUG ===');

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || Math.ceil(response.length / 4);

      if (userId) {
        await this.trackUsage(userId, 'chat', tokens, {
          messageLength: message.length,
          chatHistoryLength: cleanedHistory.length,
          responseLength: response.length,
          model: 'llama-3.3-70b-versatile'
        });
      }

      return {
        response: this.formatChatResponse(response, message),
        tokenUsage: { total_tokens: tokens }
      };
    } catch (error) {
      console.error('Groq chat error:', error);
      throw error;
    }
  }

  // Summarize existing notes
  static async summarizeNotes(notes: string[], userId?: string) {
    try {
      const notesText = notes.join('\n\n---\n\n');
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Notely's Summarization Assistant. Create concise summaries of notes.
            
## NOTELY SUMMARY GUIDELINES:
• Extract key points and action items
• Use bullet points for clarity
• Include relevant tags suggestions
• Highlight main themes
• Keep under 200 words unless multiple notes
• Format with Markdown for readability`
          },
          {
            role: 'user',
            content: `Please summarize these ${notes.length} Notely notes:\n\n${notesText}\n\nFocus on actionable insights and key takeaways.`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        temperature: 0.5,
      });

      const summary = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || Math.ceil(summary.length / 4);

      if (userId) {
        await this.trackUsage(userId, 'summarize', tokens, {
          noteCount: notes.length,
          totalCharacters: notesText.length,
          summaryLength: summary.length,
          model: 'llama-3.3-70b-versatile'
        });
      }

      return summary;
    } catch (error) {
      console.error('Groq summarization error:', error);
      throw error;
    }
  }

  // Generate tags/keywords from note content
  static async generateTags(content: string, userId?: string) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Notely's Tag Generator. Extract relevant tags from note content.
            
## NOTELY TAGGING SYSTEM:
• Use # for tags (e.g., #meeting-notes, #project-ideas)
• Suggest 3-5 most relevant tags
• Include both specific and general tags
• Prioritize actionable tags (#todo, #follow-up)
• Consider context and category tags
• Return ONLY comma-separated tags, nothing else`
          },
          {
            role: 'user',
            content: `Extract tags from this Notely note content:\n\n${content.substring(0, 2000)}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 100,
        temperature: 0.3,
      });

      const tagsText = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || Math.ceil(tagsText.length / 4);
      
      // Parse and clean tags
      const tags = tagsText.split(',')
        .map(tag => {
          // Remove any non-tag text and clean up
          let cleanTag = tag.trim()
            .replace(/^#+/, '') // Remove leading #
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .trim()
            .toLowerCase();
          
          // Convert to kebab-case for consistency
          cleanTag = cleanTag
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
            
          return cleanTag ? `#${cleanTag}` : '';
        })
        .filter(tag => tag && tag.length > 2 && tag.length < 30)
        .slice(0, 5);

      if (userId) {
        await this.trackUsage(userId, 'tags', tokens, {
          contentLength: content.length,
          tagsGenerated: tags.length,
          model: 'llama-3.3-70b-versatile'
        });
      }

      return tags;
    } catch (error) {
      console.error('Groq tag generation error:', error);
      return [];
    }
  }

  // Get Notely-specific suggestions based on content
  static async getNotelySuggestions(content: string, userId?: string) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are Notely's Suggestion Engine. Provide Notely-specific recommendations.
            
## KNOW NOTELY FEATURES:
${Object.entries(NOTELY_COMPLETE_KNOWLEDGE.coreFeatures)
  .map(([category, features]) => `### ${category.toUpperCase()}:\n${features.map(f => `• ${f}`).join('\n')}`)
  .join('\n\n')}

## SUGGESTION FORMAT:
• Mention specific Notely features by name
• Include keyboard shortcuts when relevant
• Suggest templates if applicable
• Recommend organization strategies
• Keep suggestions actionable`
          },
          {
            role: 'user',
            content: `Based on this Notely note content, suggest features or improvements:\n\n${content.substring(0, 1500)}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.6,
      });

      const suggestions = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || Math.ceil(suggestions.length / 4);

      if (userId) {
        await this.trackUsage(userId, 'suggestions', tokens, {
          contentLength: content.length,
          suggestionLength: suggestions.length,
          model: 'llama-3.3-70b-versatile'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Groq suggestions error:', error);
      return '';
    }
  }

  // Get user's AI usage statistics
  static async getUserUsageStats(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todayUsage, totalUsage, usageByEndpoint] = await Promise.all([
        prisma.aIUsage.aggregate({
          where: {
            userId,
            createdAt: { gte: today }
          },
          _sum: { tokens: true, cost: true }
        }),
        
        prisma.aIUsage.aggregate({
          where: { userId },
          _sum: { tokens: true, cost: true },
          _count: true
        }),
        
        prisma.aIUsage.groupBy({
          by: ['endpoint'],
          where: { userId },
          _sum: { tokens: true, cost: true },
          _count: true
        })
      ]);

      return {
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
    } catch (error) {
      console.error('Usage stats error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private static formatChatResponse(response: string, originalQuery: string): string {
    let formatted = response;
    
    // Add emoji to lists for better readability
    formatted = formatted
      .replace(/\n1\. /g, '\n1️⃣ ')
      .replace(/\n2\. /g, '\n2️⃣ ')
      .replace(/\n3\. /g, '\n3️⃣ ')
      .replace(/\n4\. /g, '\n4️⃣ ')
      .replace(/\n5\. /g, '\n5️⃣ ')
      .replace(/\n• /g, '\n• ');

    // Add "Pro Tip" styling
    if (formatted.toLowerCase().includes('pro tip') || formatted.toLowerCase().includes('tip:')) {
      formatted = formatted.replace(
        /(pro tip|tip):/gi, 
        '\n\n---\n\n**💡 $1:**'
      );
    }

    // Add Notely feature references if not already there
    const relevantKnowledge = findRelevantKnowledge(originalQuery);
    if (relevantKnowledge.faqs.length > 0 && !formatted.includes('Notely')) {
      formatted += `\n\n📚 *Based on Notely's ${relevantKnowledge.faqs.length} related features*`;
    }

    // Ensure proper Markdown formatting
    if (!formatted.includes('\n\n') && formatted.length > 150) {
      formatted = formatted.replace(/(\.\s)(?=[A-Z])/g, '$1\n\n');
    }

    return formatted;
  }

  private static formatWritingResponse(response: string): string {
    let formatted = response;
    
    // Ensure proper Markdown structure for notes
    if (!formatted.includes('#')) {
      // Add a header if missing
      const lines = formatted.split('\n');
      if (lines.length > 3) {
        formatted = `# Content\n\n${formatted}`;
      }
    }

    // Convert simple lists to bullet points
    formatted = formatted.replace(/(\d+)\.\s/g, '$1. ');
    
    // Add horizontal rules for sections
    if (formatted.split('\n').length > 15) {
      formatted = formatted.replace(/\n([A-Z][^\.]+:)\n/g, '\n\n---\n\n**$1**\n\n');
    }

    return formatted;
  }

  // Check if query is about Notely features
  private static isNotelyRelated(query: string): boolean {
    const notelyKeywords = [
      'notely', 'note', 'organiz', 'tag', 'folder', 'ai assistant',
      'markdown', 'sync', 'backup', 'export', 'import', 'template',
      'collaborat', 'share', 'search', 'shortcut', 'keyboard',
      'mobile', 'web', 'desktop', 'app', 'feature'
    ];
    
    const lowercaseQuery = query.toLowerCase();
    return notelyKeywords.some(keyword => lowercaseQuery.includes(keyword));
  }
}