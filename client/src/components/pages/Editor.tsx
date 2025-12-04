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
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <main className="w-full px-4 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2 border-orange-300 text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 transition-all w-full sm:w-auto"
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
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

          {/* Editor Card */}
          <Card className="border border-gray-200 bg-white shadow-xl w-full">
            <CardContent className="p-6 sm:p-8 space-y-8">
              {/* Title */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-semibold text-gray-800">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg py-3 px-4"
                  disabled={isSaving}
                />
              </div>

              {/* Synopsis */}
              <div className="space-y-3">
                <Label htmlFor="synopsis" className="text-base font-semibold text-gray-800">
                  Synopsis <span className="text-gray-500 font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="synopsis"
                  placeholder="Brief summary of your note..."
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={2}
                  className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg resize-none py-3 px-4"
                  disabled={isSaving}
                />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-base font-semibold text-gray-800">
                  Content
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg font-sans text-base py-3 px-4 min-h-[400px]"
                  disabled={isSaving}
                />
                <p className="text-sm text-gray-500">
                  Tip: Keep your notes organized and focused.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSaving}
              className="border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}