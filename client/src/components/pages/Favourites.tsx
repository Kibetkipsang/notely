// pages/Favorites.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import Sidebar from './SideBar';
import NoteCard from './NoteCard';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Menu } from 'lucide-react';
import { toast } from 'sonner';

type NoteType = {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  userId: string;
  isPinned?: boolean;
  isFavorite?: boolean;
};

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch favorite notes
  const { 
    data: notesData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/notes/favorites');
      console.log('Favorites API Response:', response.data); // Debug log
      return response.data;
    },
    enabled: !!user,
  });

  // Mutation for soft deleting a note
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notes/${id}/soft-delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note moved to trash');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete note');
    },
  });

  // Mutation for toggling pin status
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const response = await api.patch(`/notes/${id}/pin`, { 
        isPinned: !isPinned 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update note');
    },
  });

  // Mutation for toggling favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const response = await api.patch(`/notes/${id}/favorite`, { 
        isFavorite: !isFavorite 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update note');
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

  // Handlers
  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to move this note to trash?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleTogglePin = (id: string, isPinned: boolean) => {
    togglePinMutation.mutate({ id, isPinned });
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, isFavorite });
  };

  // Loading state
  if (isLoading && !notesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-orange-200 bg-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-orange-100 rounded-lg"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Favorites</h1>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="ghost"
              className="text-gray-700"
            >
              <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'hidden'}`} />
            </Button>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Favorites
              </h1>
              <p className="text-gray-600">
                {notes.length} {notes.length === 1 ? 'favorite note' : 'favorite notes'}
              </p>
            </div>
            
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              className="border-orange-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Refresh
            </Button>
          </div>

          {/* Mobile header info */}
          <div className="lg:hidden mb-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Favorites</h1>
              <p className="text-gray-600">
                {notes.length} {notes.length === 1 ? 'favorite note' : 'favorite notes'}
              </p>
            </div>
          </div>

          {/* Notes list */}
          {isLoading && notes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex items-center justify-center rounded-3xl bg-yellow-50 p-6 border border-yellow-200">
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Click the star icon on any note to add it to your favorites.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Go to Notes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note: NoteType) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => handleDeleteNote(note.id)}
                  onEdit={() => navigate(`/edit/${note.id}`)}
                  onView={() => navigate(`/notes/${note.id}`)}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  isDeleting={deleteNoteMutation.isPending && deleteNoteMutation.variables === note.id}
                  showPinButton={true}
                  showFavoriteButton={true}
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-20">
              <div className="mb-6 flex items-center justify-center rounded-3xl bg-red-50 p-6 border border-red-200">
                <Star className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Failed to load favorites
              </h2>
              <p className="text-red-500 mb-4">
                {error?.message || 'Failed to load favorite notes'}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-orange-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
              >
                Try Again
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}