import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Save, ArrowLeft, Loader2, Sparkles, 
  Tag, X, Wand2, Brain, FileText, Eye, EyeOff,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Bold, Italic, Link, Code, Quote, Undo, Redo,
  Maximize2, Minimize2, Type, HelpCircle, Zap,
  BookOpen, CheckSquare, Table, Image, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import AI Components
import AIWritingAssistant from '../ai/aiWritingAssistant';
import AIChatAssistant from '../ai/aiChatAssistant';

// Define types locally
type NoteFormData = {
  title: string;
  content: string;
  synopsis?: string;
};

type NoteType = {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  userId: string;
};

// Markdown examples for quick insertion
const markdownExamples = [
  { name: 'Heading 1', icon: <Heading1 className="h-3 w-3" />, code: '# Heading 1' },
  { name: 'Heading 2', icon: <Heading2 className="h-3 w-3" />, code: '## Heading 2' },
  { name: 'Heading 3', icon: <Heading3 className="h-3 w-3" />, code: '### Heading 3' },
  { name: 'Bold', icon: <Bold className="h-3 w-3" />, code: '**bold text**' },
  { name: 'Italic', icon: <Italic className="h-3 w-3" />, code: '*italic text*' },
  { name: 'Bullet List', icon: <List className="h-3 w-3" />, code: '- List item' },
  { name: 'Numbered List', icon: <ListOrdered className="h-3 w-3" />, code: '1. First item' },
  { name: 'Link', icon: <Link className="h-3 w-3" />, code: '[text](https://example.com)' },
  { name: 'Code', icon: <Code className="h-3 w-3" />, code: '`inline code`' },
  { name: 'Quote', icon: <Quote className="h-3 w-3" />, code: '> Blockquote' },
  { name: 'Checkbox', icon: <CheckSquare className="h-3 w-3" />, code: '- [ ] Task' },
  { name: 'Table', icon: <Table className="h-3 w-3" />, code: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |' },
  { name: 'Image', icon: <Image className="h-3 w-3" />, code: '![alt](image.jpg)' },
  { name: 'Tag', icon: <Hash className="h-3 w-3" />, code: '#tag-name' },
];

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentHistory, setContentHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeEditorTab, setActiveEditorTab] = useState('write');

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch note if in edit mode
  const { data: noteData, isLoading: isLoadingNote, error: fetchError } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/notes/${id}`);
      return response.data.data as NoteType;
    },
    enabled: isEditMode && !!id && !!user,
    retry: false,
  });

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      console.error('Error fetching note:', fetchError);
      toast.error('Failed to load note');
      navigate('/dashboard');
    }
  }, [fetchError, navigate]);

  // Update form when note data loads
  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setSynopsis(noteData.synopsis || '');
      // Initialize history with initial content
      setContentHistory([noteData.content]);
      setHistoryIndex(0);
    }
  }, [noteData]);

  // Save content to history on change
  useEffect(() => {
    const saveToHistory = () => {
      if (content !== contentHistory[historyIndex]) {
        const newHistory = contentHistory.slice(0, historyIndex + 1);
        newHistory.push(content);
        setContentHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    };
    
    // Debounce history saving
    const timeoutId = setTimeout(saveToHistory, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, contentHistory, historyIndex]);

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: NoteFormData) => {
      const response = await api.post('/notes/create', noteData);
      return response.data.data;
    },
    onSuccess: () => {
      toast.success('Note created successfully!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create note');
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, noteData }: { id: string; noteData: NoteFormData }) => {
      const response = await api.put(`/notes/${id}`, noteData);
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success('Note updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.setQueryData(['note', id], data);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update note');
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    const noteData: NoteFormData = {
      title: title.trim(),
      content: content.trim(),
      synopsis: synopsis.trim() || undefined,
    };

    if (isEditMode && id) {
      updateNoteMutation.mutate({ id, noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const handleBack = () => {
    if (content.trim() && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate('/dashboard');
  };

  // AI Functions
  const handleGenerateTags = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const response = await api.post('/ai/tags', { content });
      if (response.data.success) {
        const tags = response.data.data.tags;
        setAiSuggestions(tags);
        toast.success(`Generated ${tags.length} tags`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate tags');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleGenerateSynopsis = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsGeneratingSynopsis(true);
    try {
      const response = await api.post('/ai/summarize', {
        noteIds: [id || 'current']
      });
      if (response.data.success) {
        setSynopsis(response.data.data.summary);
        toast.success('Synopsis generated!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate synopsis');
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };

  const handleAIContentGenerated = (generatedContent: string) => {
    setAiGeneratedContent(generatedContent);
    toast.success('Content generated! Click "Insert AI Content" to add it to your note.');
  };

  const handleInsertAIContent = () => {
    if (aiGeneratedContent) {
      if (content.trim()) {
        // Append AI content with separator
        setContent(prev => prev + '\n\n---\n\n' + aiGeneratedContent);
      } else {
        // Set AI content as main content
        setContent(aiGeneratedContent);
      }
      toast.success('AI content inserted!');
      setAiGeneratedContent('');
    }
  };

  const handleQuickTitle = () => {
    if (content.trim()) {
      // Generate title from first few words of content
      const words = content.trim().split(/\s+/).slice(0, 6);
      setTitle(words.join(' '));
      toast.success('Title suggested from content');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + suggestion);
    toast.success('Suggestion added to note');
  };

  // Markdown editing functions
  const insertMarkdown = (markdown: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = markdown;
    if (selectedText) {
      // Wrap selected text with markdown
      if (markdown === '**bold text**') newText = `**${selectedText}**`;
      else if (markdown === '*italic text*') newText = `*${selectedText}*`;
      else if (markdown === '`inline code`') newText = `\`${selectedText}\``;
      else if (markdown === '[text](https://example.com)') newText = `[${selectedText}](https://example.com)`;
      else if (markdown === '![alt](image.jpg)') newText = `![${selectedText}](image.jpg)`;
      else if (markdown === '#tag-name') newText = `#${selectedText.replace(/\s+/g, '-')}`;
      else newText = selectedText + '\n' + markdown;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // Focus back on textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setContent(contentHistory[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < contentHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setContent(contentHistory[historyIndex + 1]);
    }
  };

  // Format markdown for preview
  const formatMarkdownPreview = (text: string) => {
    // Simple markdown formatting for preview
    let formatted = text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 hover:underline" target="_blank">$1</a>')
      .replace(/#([a-zA-Z0-9_-]+)/g, '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-1">#$1</span>')
      .replace(/\n/g, '<br>');

    // Wrap lists
    formatted = formatted.replace(/(<li class="ml-4">.*<\/li>)+/g, '<ul class="list-disc pl-6 my-2">$&</ul>');
    
    return formatted;
  };

  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

  // Show loading state
  if (isEditMode && isLoadingNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white to-orange-50 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <main className={`w-full px-4 py-8 lg:px-8 ${isFullscreen ? 'h-full overflow-auto' : ''}`}>
        <div className={`mx-auto w-full ${isFullscreen ? 'max-w-full h-full' : 'max-w-6xl'}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2 border-orange-300 text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 transition-all"
                disabled={isSaving}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="text-sm text-gray-500">
                {isEditMode ? 'Editing note' : 'Creating new note'}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-1"
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="gap-1"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
                <Button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  variant={showAIAssistant ? "default" : "outline"}
                  className={`gap-2 border-orange-300 ${
                    showAIAssistant 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  } transition-all`}
                  disabled={isSaving}
                >
                  <Sparkles className="h-4 w-4" />
                  {showAIAssistant ? 'Hide AI' : 'Show AI'}
                </Button>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update Note' : 'Create Note'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Editor Column */}
            <div className={`${showAIAssistant ? 'lg:w-2/3' : 'w-full'}`}>
              {/* Editor Card */}
              <Card className="border border-gray-200 bg-white shadow-xl w-full h-full">
                <CardContent className="p-6 sm:p-8 space-y-8">
                  {/* Title with Quick Suggestions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-base font-semibold text-gray-800">
                        Title
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleQuickTitle}
                          disabled={!content.trim()}
                          className="text-xs text-orange-600 hover:text-orange-700"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Suggest from content
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTitle('Untitled Note')}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title for your note..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg font-medium border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg py-3 px-4"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Synopsis with AI Generation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="synopsis" className="text-base font-semibold text-gray-800">
                        Synopsis <span className="text-gray-500 font-normal">(Brief summary)</span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateSynopsis}
                        disabled={isGeneratingSynopsis || !content.trim()}
                        className="text-xs text-orange-600 hover:text-orange-700"
                      >
                        {isGeneratingSynopsis ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        AI Summary
                      </Button>
                    </div>
                    <Textarea
                      id="synopsis"
                      placeholder="What's this note about? AI can help generate a summary..."
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      rows={2}
                      className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg resize-none py-3 px-4"
                      disabled={isSaving}
                    />
                  </div>

                  {/* Content Editor with Tabs */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label htmlFor="content" className="text-base font-semibold text-gray-800">
                        Content
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleGenerateTags}
                          disabled={isGeneratingTags || !content.trim()}
                          className="text-xs text-orange-600 hover:text-orange-700"
                        >
                          {isGeneratingTags ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Tag className="h-3 w-3 mr-1" />
                          )}
                          AI Tags
                        </Button>
                        <div className="flex items-center gap-1 border-l pl-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className="h-7 w-7"
                            title="Undo"
                          >
                            <Undo className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRedo}
                            disabled={historyIndex >= contentHistory.length - 1}
                            className="h-7 w-7"
                            title="Redo"
                          >
                            <Redo className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Generated Content Preview */}
                    {aiGeneratedContent && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-orange-800 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Generated Content Preview
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleInsertAIContent}
                              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs h-7"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Insert into Note
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAiGeneratedContent('')}
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                          {aiGeneratedContent.substring(0, 300)}...
                        </div>
                      </div>
                    )}
                    
                    {/* Editor/Preview Tabs */}
                    <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab} className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <TabsList>
                          <TabsTrigger value="write" className="flex items-center gap-1">
                            <Type className="h-3 w-3" />
                            Write
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Preview
                          </TabsTrigger>
                        </TabsList>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <head>
                                      <title>Notely Markdown Guide</title>
                                      <style>
                                        body { font-family: system-ui; padding: 2rem; }
                                        .markdown-example { background: #f9f9f9; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
                                        code { background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
                                      </style>
                                    </head>
                                    <body>
                                      <h1>Notely Markdown Guide</h1>
                                      <p>Quick reference for formatting your notes:</p>
                                      ${markdownExamples.map(ex => `
                                        <div class="markdown-example">
                                          <strong>${ex.name}:</strong><br>
                                          <code>${ex.code}</code>
                                        </div>
                                      `).join('')}
                                    </body>
                                  </html>
                                `);
                                win.document.close();
                              }
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Markdown Guide
                          </Button>
                        </div>
                      </div>
                      
                      <TabsContent value="write" className="mt-0">
                        {/* Markdown Toolbar */}
                        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-lg border">
                          {markdownExamples.slice(0, 8).map((example, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown(example.code)}
                              className="h-7 px-2 text-xs"
                              title={example.name}
                            >
                              {example.icon}
                            </Button>
                          ))}
                          <div className="border-l pl-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const moreExamples = markdownExamples.slice(8);
                                toast.info(
                                  <div>
                                    <p className="font-semibold mb-2">More Markdown Examples:</p>
                                    <div className="space-y-1">
                                      {moreExamples.map((ex, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{ex.code}</code>
                                          <span className="text-xs text-gray-600">{ex.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>,
                                  { duration: 5000 }
                                );
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              More...
                            </Button>
                          </div>
                        </div>
                        
                        <Textarea
                          id="content"
                          spellCheck='true'
                          placeholder="Start writing your note here... Use markdown for formatting, or click the buttons above for quick formatting."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={isFullscreen ? 30 : 20}
                          className="border-t-0 rounded-t-none border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 font-mono text-sm py-3 px-4 min-h-[400px] resize-y"
                          disabled={isSaving}
                        />
                      </TabsContent>
                      
                      <TabsContent value="preview" className="mt-0">
                        <div 
                          className="border border-gray-300 rounded-lg p-4 min-h-[400px] overflow-y-auto bg-white prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdownPreview(content) || '<p class="text-gray-400 italic">Nothing to preview yet. Start writing in the Write tab!</p>' }}
                        />
                      </TabsContent>
                    </Tabs>
                    
                    {/* AI Suggestions */}
                    {aiSuggestions.length > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-orange-800 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            AI Suggested Tags
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                              {aiSuggestions.length} found
                            </span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const tagsText = aiSuggestions.map(tag => `#${tag.replace(/\s+/g, '-')}`).join(' ');
                                setContent(prev => prev + (prev ? '\n\n' : '') + tagsText);
                                toast.success('All tags added to note');
                              }}
                              className="text-xs h-7"
                            >
                              Add All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAiSuggestions([])}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions.map((tag, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(`#${tag.replace(/\s+/g, '-')}`)}
                              className="text-xs bg-white hover:bg-orange-50 border-orange-300 text-orange-700 group"
                            >
                              {tag}
                              <span className="ml-1 opacity-0 group-hover:opacity-100">+</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <span>{content.length} characters</span>
                        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{(content.match(/\n/g) || []).length + 1} lines</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>Markdown supported</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Writing Assistant Column */}
            {showAIAssistant && (
              <div className="lg:w-1/3">
                <Card className="border border-orange-200 bg-gradient-to-b from-white to-orange-50 shadow-xl sticky top-8">
                  <CardContent className="p-6">
                    <AIWritingAssistant
                      noteId={id}
                      currentContent={content}
                      onContentGenerated={handleAIContentGenerated}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
              className="border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Note' : 'Create Note'}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Floating AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
}