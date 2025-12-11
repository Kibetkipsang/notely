// components/AIChatAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Send, Bot, User, Sparkles, X, 
  HelpCircle, BookOpen, Zap, Search, FolderTree,
  Copy, ThumbsUp, ThumbsDown, RefreshCw,
  MessageSquare, Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  helpful?: boolean;
}

interface SuggestionCategory {
  title: string;
  icon: React.ReactNode;
  questions: string[];
}

interface AIChatAssistantProps {
  onClose?: () => void;
}

export default function AIChatAssistant({ onClose }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m NotelyAI, your personal assistant for the Notely app. I can help you with organizing notes, writing tips, productivity hacks, and more! How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [activeSuggestionTab, setActiveSuggestionTab] = useState('tips');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (callback: () => Promise<void>) => {
    setIsTyping(true);
    await callback();
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    await simulateTyping(async () => {
      setLoading(true);
      try {
        const response = await api.post('/ai/chat', {
          message: input,
          chatId
        });

        if (response.data.success) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.data.data.response,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          if (!chatId && response.data.data.chatId) {
            setChatId(response.data.data.chatId);
          }
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'Failed to send message';
        toast.error(errorMsg);
        
        // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `I'm having trouble connecting right now. Please try again in a moment. (Error: ${errorMsg})`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && !isTyping) {
        handleSend();
      }
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    // Small delay to show the question in input before sending
    setTimeout(() => handleSend(), 300);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleRateResponse = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    toast.success(`Thank you for your feedback!`);
    
    // Optional: Send feedback to backend
    // api.post('/ai/feedback', { messageId, helpful });
  };

  const handleClearChat = () => {
    if (confirm('Clear this conversation? Your chat history will be reset.')) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Chat cleared! How can I help you with Notely today?',
          timestamp: new Date()
        }
      ]);
      setChatId(null);
      toast.success('Chat cleared');
    }
  };

  const handleCloseChat = () => {
    if (onClose) {
      onClose(); // Call parent's close function
    } else {
      setIsOpen(false); // Fallback to internal state
    }
  };

  const handleMinimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const suggestionCategories: SuggestionCategory[] = [
    {
      title: 'Tips & Tricks',
      icon: <Zap className="h-4 w-4" />,
      questions: [
        "Best way to organize notes?",
        "How to use tags effectively?",
        "Keyboard shortcuts in Notely",
        "Tips for faster note-taking"
      ]
    },
    {
      title: 'Features',
      icon: <BookOpen className="h-4 w-4" />,
      questions: [
        "How do templates work?",
        "Explain the AI writing assistant",
        "What are smart folders?",
        "How to collaborate on notes?"
      ]
    },
    {
      title: 'Troubleshooting',
      icon: <HelpCircle className="h-4 w-4" />,
      questions: [
        "Why is my note not syncing?",
        "How to recover deleted notes?",
        "Trouble with AI features?",
        "Formatting issues in notes"
      ]
    },
    {
      title: 'Organization',
      icon: <FolderTree className="h-4 w-4" />,
      questions: [
        "Create a study notes system",
        "Organize work projects",
        "Manage meeting notes",
        "Personal journal structure"
      ]
    }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Notification badge for new features */}
        <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full animate-pulse">
          Try AI Assistant!
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 group"
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </div>
    );
  }

  // Minimized state - shows only a small chat header
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-10 duration-300">
        <Card className="w-80 shadow-xl border-2 border-orange-200">
          <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">NotelyAI Assistant</CardTitle>
                  <CardDescription>Click to expand chat</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimizeChat}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600"
                  title="Expand chat"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseChat}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-[32rem] shadow-2xl z-50 animate-in slide-in-from-bottom-10 duration-300">
      <Card className="border-2 border-orange-200 h-[70vh] max-h-[70vh] flex flex-col">
        
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`group flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                        : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`relative rounded-2xl px-4 py-3 max-w-[85%] shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${message.role === 'user' ? 'text-orange-200' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopyMessage(message.content)}
                              title="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 p-0 ${message.helpful === true ? 'text-green-600' : 'text-gray-400'}`}
                              onClick={() => handleRateResponse(message.id, true)}
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 p-0 ${message.helpful === false ? 'text-red-600' : 'text-gray-400'}`}
                              onClick={() => handleRateResponse(message.id, false)}
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-200">
                      <Bot className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Suggestions Tabs */}
          <div className="border-t p-4 flex-shrink-0">
            <Tabs value={activeSuggestionTab} onValueChange={setActiveSuggestionTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                {suggestionCategories.map((cat) => (
                  <TabsTrigger 
                    key={cat.title} 
                    value={cat.title.toLowerCase().replace(/[^a-z]/g, '')}
                    className="text-xs"
                  >
                    {cat.icon}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {suggestionCategories.map((cat) => (
                <TabsContent 
                  key={cat.title} 
                  value={cat.title.toLowerCase().replace(/[^a-z]/g, '')}
                  className="mt-0"
                >
                  <p className="text-xs font-medium text-gray-700 mb-2">{cat.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.questions.map((question, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(question)}
                        disabled={loading || isTyping}
                        className="text-xs h-auto min-h-7 py-1 px-2 text-left hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-all"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>

        <CardFooter className="pt-0 border-t bg-gradient-to-r from-orange-50/50 to-white flex-shrink-0">
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Ask about notes, organization, or features..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isTyping}
                className="pr-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
              />
              {input && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setInput('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={handleSend}
                disabled={loading || isTyping || !input.trim()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                {loading || isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseChat}
                className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}