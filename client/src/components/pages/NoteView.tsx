import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function NoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch note details
  const { data: note, isLoading, error } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) throw new Error('No note ID provided');
      const response = await api.get(`/notes/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!user,
    retry: false,
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.patch(`/notes/${noteId}/soft-delete`);
    },
    onSuccess: () => {
      toast.success('Note moved to trash');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete note');
    },
  });

  const handleDelete = async () => {
    if (!note || !id) return;
    
    if (window.confirm('Are you sure you want to move this note to trash?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleBack = () => {
    navigate('/notes');
  };

  const handleEdit = () => {
    if (note && note.id) {
      navigate(`/edit/${note.id}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  // Error state
  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Note not found</h2>
            <p className="text-gray-600">The note you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button
              onClick={handleBack}
              variant="outline"
              className="gap-2 border-orange-400 text-gray-700 hover:border-orange-500 hover:text-orange-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <main className="w-full px-4 py-8 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header with buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2 border-orange-300 text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="gap-2 border-orange-300 text-gray-700 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all w-full sm:w-auto"
                disabled={deleteNoteMutation.isPending}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="gap-2 border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all w-full sm:w-auto"
                disabled={deleteNoteMutation.isPending}
              >
                {deleteNoteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {/* Note Card - Full width with proper padding */}
          <Card className="border border-gray-200 bg-white shadow-xl w-full">
            <CardHeader className="space-y-4 border-b border-gray-100 pb-6 px-6 sm:px-8">
              <CardTitle className="text-3xl lg:text-4xl font-bold text-gray-800 break-words">
                {note.title}
              </CardTitle>
              <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-600">
                <span>Last updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
              </CardDescription>
              {note.synopsis && (
                <div className="rounded-lg bg-orange-50 p-4 border border-orange-200 mt-4">
                  <p className="text-sm font-medium text-orange-800 italic">
                    {note.synopsis}
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="text-gray-800 whitespace-pre-wrap break-words text-base leading-relaxed">
                {note.content}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}