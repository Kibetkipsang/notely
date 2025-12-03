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
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);

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
    enabled: isEditMode && !!id && !!user, // Only fetch if editing and user is authenticated
    retry: false,
  });

  // Handle fetch errors (e.g., note not found)
  useEffect(() => {
    if (fetchError) {
      console.error('Error fetching note:', fetchError);
      toast.error('Failed to load note');
      setShouldRedirect(true);
    }
  }, [fetchError]);

  // Redirect after error
  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]);

  // Update form when note data loads
  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setSynopsis(noteData.synopsis || '');
    }
  }, [noteData]);

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
    navigate('/dashboard');
  };

  const isSaving = createNoteMutation.isPending || updateNoteMutation.isPending;

  // Show loading state
  if (isEditMode && isLoadingNote) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show redirect message if needed
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Check if user is still loading (to prevent premature redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2 border-orange-400 text-gray-700"
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-primary hover:opacity-90 text-white font-medium shadow-soft hover:shadow-medium transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>

        <Card className="border border-gray-200 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis" className="text-base font-semibold text-gray-700">
                Synopsis <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="synopsis"
                placeholder="Brief summary of your note..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={2}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-base font-semibold text-gray-700">
                Content
              </Label>
              <Textarea
                id="content"
                placeholder="Write your note content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 font-sans text-sm"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500">
                Tip: Keep your notes organized and focused.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick action buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isSaving}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </main>
    </div>
  );
}