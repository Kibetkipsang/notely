import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import Sidebar from './SideBar';
import NoteCard from './NoteCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Menu } from 'lucide-react';
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
  bookmarked?: boolean; // ADD THIS
  bookmarkedAt?: Date; // ADD THIS
};

export default function AllNotes() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  // React Query for fetching notes
  const {
    data: notesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notes', { page, limit }],
    queryFn: async () => {
      const response = await api.get('/notes', {
        params: { page, limit }
      });
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
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['pinned'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); // ADD THIS
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
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['pinned'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); // ADD THIS
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
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); // ADD THIS
      toast.success('Note updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update note');
    },
  });

  // ADD THIS: Mutation for toggling bookmark status
  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
      const response = await api.patch(`/notes/${id}/bookmark`, { 
        bookmarked: !bookmarked 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] }); // OPTIONAL: if you want to update favorites too
      toast.success('Bookmark updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update bookmark');
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

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...activeNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Separate pinned and unpinned notes for display
  const pinnedNotes = sortedNotes.filter(note => note.isPinned);
  const unpinnedNotes = sortedNotes.filter(note => !note.isPinned);

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

  const handleTogglePin = (id: string, isPinned: boolean) => {
    togglePinMutation.mutate({ id, isPinned });
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, isFavorite });
  };

  // ADD THIS: Handler for toggling bookmark
  const handleToggleBookmark = (id: string, bookmarked: boolean) => {
    toggleBookmarkMutation.mutate({ id, bookmarked });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // If loading and no data yet
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
            <h1 className="text-xl font-bold text-gray-800">All Notes</h1>
            <Button
              onClick={handleCreateNote}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                All Notes
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {activeNotes.length} {activeNotes.length === 1 ? 'active note' : 'active notes'}
                  {pinnedNotes.length > 0 && ` • ${pinnedNotes.length} pinned`}
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-orange-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Refresh
              </Button>
              <Button
                onClick={handleCreateNote}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Note
              </Button>
            </div>
          </div>

          {isLoading && notes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : activeNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md p-6">
                <Plus className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No notes yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Start capturing your ideas and thoughts. Create your first note to get started.
              </p>
              <Button
                onClick={handleCreateNote}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Note
              </Button>
            </div>
          ) : (
            <>
              {isLoading && notes.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600 mr-2" />
                  <span className="text-gray-600">Updating...</span>
                </div>
              )}

              {/* Pinned Notes Section */}
              {pinnedNotes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Pinned Notes</h2>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                      {pinnedNotes.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pinnedNotes.map((note: NoteType) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={() => handleDeleteNote(note.id)}
                        onEdit={() => navigate(`/edit/${note.id}`)}
                        onView={() => navigate(`/notes/${note.id}`)}
                        onTogglePin={handleTogglePin}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleBookmark={handleToggleBookmark} // ADD THIS
                        isDeleting={deleteNoteMutation.isPending && deleteNoteMutation.variables === note.id}
                        showPinButton={true}
                        showFavoriteButton={true}
                        showBookmarkButton={true} // ADD THIS
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Notes Section */}
              {unpinnedNotes.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">All Notes</h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      {unpinnedNotes.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unpinnedNotes.map((note: NoteType) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={() => handleDeleteNote(note.id)}
                        onEdit={() => navigate(`/edit/${note.id}`)}
                        onView={() => navigate(`/notes/${note.id}`)}
                        onTogglePin={handleTogglePin}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleBookmark={handleToggleBookmark} // ADD THIS
                        isDeleting={deleteNoteMutation.isPending && deleteNoteMutation.variables === note.id}
                        showPinButton={true}
                        showFavoriteButton={true}
                        showBookmarkButton={true} // ADD THIS
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="border-orange-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-700">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="border-orange-300 text-gray-700 hover:border-orange-400 hover:text-orange-700"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}