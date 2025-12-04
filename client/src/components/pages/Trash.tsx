// pages/Trash.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import Sidebar from './SideBar';
import NoteCard from './NoteCard';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, RotateCcw, Delete, Menu } from 'lucide-react';
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
};

export default function Trash() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  // Fetch deleted notes
  const { data: notesData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trash'],
    queryFn: async () => {
      const response = await api.get('/notes/trash', {
        params: { page: 1, limit: 50 }
      });
      return response.data;
    },
    enabled: !!user,
  });

  // Restore note mutation
  const restoreNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/notes/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note restored');
      setSelectedNotes([]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to restore note');
    },
  });

  // Permanently delete note mutation
  const deletePermanentlyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Note permanently deleted');
      setSelectedNotes([]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete note');
    },
  });

  // Empty trash mutation
  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/notes/trash/empty');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Trash emptied');
      setSelectedNotes([]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to empty trash');
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
  const handleSelectNote = (id: string) => {
    setSelectedNotes(prev => 
      prev.includes(id) 
        ? prev.filter(noteId => noteId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map((note: NoteType) => note.id));
    }
  };

  const handleRestoreSelected = () => {
    if (selectedNotes.length === 0) return;
    
    if (window.confirm(`Restore ${selectedNotes.length} note(s)?`)) {
      selectedNotes.forEach(id => {
        restoreNoteMutation.mutate(id);
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotes.length === 0) return;
    
    if (window.confirm(`Permanently delete ${selectedNotes.length} note(s)? This action cannot be undone.`)) {
      selectedNotes.forEach(id => {
        deletePermanentlyMutation.mutate(id);
      });
    }
  };

  const handleEmptyTrash = () => {
    if (notes.length === 0) return;
    
    if (window.confirm(`Empty trash? This will permanently delete ${notes.length} note(s). This action cannot be undone.`)) {
      emptyTrashMutation.mutate();
    }
  };

  const handleRestoreNote = (id: string) => {
    restoreNoteMutation.mutate(id);
  };

  const handleDeletePermanently = (id: string) => {
    if (window.confirm('Permanently delete this note? This action cannot be undone.')) {
      deletePermanentlyMutation.mutate(id);
    }
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
            <h1 className="text-xl font-bold text-gray-800">Trash</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Trash
              </h1>
              <p className="text-gray-600">
                {notes.length} deleted {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
            
            <div className="flex gap-3">
              {selectedNotes.length > 0 && (
                <>
                  <Button
                    onClick={handleRestoreSelected}
                    disabled={restoreNoteMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore Selected ({selectedNotes.length})
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={deletePermanentlyMutation.isPending}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Delete className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                </>
              )}
              
              {notes.length > 0 && (
                <Button
                  onClick={handleEmptyTrash}
                  disabled={emptyTrashMutation.isPending}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Empty Trash
                </Button>
              )}
            </div>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden mb-6">
            <div className="flex flex-col gap-3">
              {selectedNotes.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleRestoreSelected}
                    disabled={restoreNoteMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
                    size="sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore ({selectedNotes.length})
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={deletePermanentlyMutation.isPending}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600"
                    size="sm"
                  >
                    <Delete className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
              
              {notes.length > 0 && (
                <Button
                  onClick={handleEmptyTrash}
                  disabled={emptyTrashMutation.isPending}
                  variant="outline"
                  className="w-full border-red-300 text-red-600"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Empty Trash
                </Button>
              )}
            </div>
          </div>

          {/* Selection controls */}
          {notes.length > 0 && (
            <div className="mb-6 p-4 bg-white border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotes.length === notes.length && notes.length > 0}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">
                    {selectedNotes.length === 0 
                      ? 'Select notes' 
                      : `${selectedNotes.length} of ${notes.length} selected`
                    }
                  </span>
                </div>
                
                {selectedNotes.length > 0 && (
                  <button
                    onClick={() => setSelectedNotes([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes list */}
          {isLoading && notes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex items-center justify-center rounded-3xl bg-gray-100 p-6">
                <Trash2 className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Trash is empty
              </h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                Deleted notes will appear here. They are automatically deleted after 30 days.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note: NoteType) => (
                <div key={note.id} className="relative">
                  <input
                    type="checkbox"
                    checked={selectedNotes.includes(note.id)}
                    onChange={() => handleSelectNote(note.id)}
                    className="absolute top-4 left-4 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 z-10"
                  />
                  
                  <NoteCard
                    note={note}
                    onDelete={() => handleDeletePermanently(note.id)}
                    onEdit={() => {}}
                    onView={() => navigate(`/notes/${note.id}`)}
                    isDeleting={deletePermanentlyMutation.isPending && deletePermanentlyMutation.variables === note.id}
                  />
                  
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => handleRestoreNote(note.id)}
                      disabled={restoreNoteMutation.isPending && restoreNoteMutation.variables === note.id}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      {restoreNoteMutation.isPending && restoreNoteMutation.variables === note.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleDeletePermanently(note.id)}
                      disabled={deletePermanentlyMutation.isPending && deletePermanentlyMutation.variables === note.id}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {deletePermanentlyMutation.isPending && deletePermanentlyMutation.variables === note.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Delete className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error?.message || 'Failed to load trash'}</p>
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