// components/AIWritingAssistant.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Wand2, Bot, Zap, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/axios';

interface AIWritingAssistantProps {
  noteId?: string;
  currentContent?: string;
  onContentGenerated: (content: string) => void;
}

export default function AIWritingAssistant({ 
  noteId, 
  currentContent, 
  onContentGenerated 
}: AIWritingAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('improve');

  const aiPrompts = {
    improve: [
      "Make this more concise",
      "Expand on this idea",
      "Rewrite more professionally",
      "Simplify for better understanding",
      "Add bullet points"
    ],
    create: [
      "Meeting notes template",
      "Project plan outline",
      "Brainstorming session",
      "Learning objectives",
      "To-do list structure"
    ],
    analyze: [
      "Extract key points",
      "Identify action items",
      "Find contradictions",
      "Summarize main ideas",
      "Generate questions"
    ]
  };

  const handleGenerate = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/ai/generate', {
        prompt: finalPrompt,
        noteId
      });

      if (response.data.success) {
        onContentGenerated(response.data.data.content);
        toast.success('Content generated successfully!');
        setPrompt('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
    handleGenerate(quickPrompt);
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-600">
          <Sparkles className="h-5 w-5" />
          AI Writing Assistant
        </CardTitle>
        <CardDescription>
          Let AI help you write, improve, or expand your notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="improve" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Improve
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Analyze
            </TabsTrigger>
          </TabsList>

          <TabsContent value="improve" className="space-y-3">
            <p className="text-sm text-gray-600">Improve your existing content:</p>
            <div className="flex flex-wrap gap-2">
              {aiPrompts.improve.map((p, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(p)}
                  disabled={generating}
                  className="text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-3">
            <p className="text-sm text-gray-600">Create new content:</p>
            <div className="flex flex-wrap gap-2">
              {aiPrompts.create.map((p, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(p)}
                  disabled={generating}
                  className="text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-3">
            <p className="text-sm text-gray-600">Analyze your content:</p>
            <div className="flex flex-wrap gap-2">
              {aiPrompts.analyze.map((p, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(p)}
                  disabled={generating}
                  className="text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Textarea
            placeholder="Or write your own custom prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px]"
            disabled={generating}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {currentContent ? 'AI will improve your existing note' : 'AI will create new content'}
            </p>
            <Button
              onClick={() => handleGenerate()}
              disabled={generating || !prompt.trim()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}