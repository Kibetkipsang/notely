import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios'; // or your API client
import NoteCard from './NoteCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner'; // or your toast library

// Define types
type NoteType = {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  userId: string;
};

type NoteFilterType = {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // React Query for fetching notes
  const {
    data: notesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notes', { page: 1, limit: 10 }],
    queryFn: async () => {
      const response = await api.get('/notes', {
        params: { page: 1, limit: 10 }
      });
      return response.data;
    },
    enabled: !!user, // Only fetch when user exists
  });

  // Mutation for soft deleting a note
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notes/${id}/soft-delete`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note moved to trash');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete note');
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Extract notes from response
  const notes = notesData?.data || [];
  const pagination = notesData?.pagination;

  // Filter active notes
  const activeNotes = notes.filter((note: NoteType) => !note.isDeleted);

  // Handlers
  const handleCreateNote = () => {
    navigate('/notes/create');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to move this note to trash?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  // If loading and no data yet
  if (isLoading && !notesData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              My Notes
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">
                {activeNotes.length} {activeNotes.length === 1 ? 'note' : 'notes'}
              </p>
              {isError && (
                <div className="text-red-500 text-sm">
                  {error?.message || 'Failed to load notes'}
                  <button 
                    onClick={() => refetch()}
                    className="ml-2 text-xs underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="font-medium bg-gradient-subtle border border-orange-400 text-gray-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh
            </Button>
            <Button
              onClick={handleCreateNote}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-medium shadow-soft hover:shadow-medium transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Note
            </Button>
          </div>
        </div>

        {isLoading && notes.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex items-center justify-center rounded-3xl bg-gradient-primary text-white shadow-soft">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              No notes yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start capturing your ideas and thoughts. Create your first note to get started.
            </p>
            <Button
              onClick={handleCreateNote}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white font-medium shadow-soft hover:shadow-medium transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Note
            </Button>
          </div>
        ) : (
          <>
            {isLoading && notes.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Updating...</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeNotes.map((note: NoteType) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => handleDeleteNote(note.id)}
                  onEdit={() => navigate(`/edit/${note.id}`)}
                  onView={() => navigate(`/notes/${note.id}`)}
                  isDeleting={deleteNoteMutation.isPending && deleteNoteMutation.variables === note.id}
                />
              ))}
            </div>

            {/* Pagination (if needed) */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="mx-4 flex items-center">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}