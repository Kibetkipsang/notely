import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useNotes } from '../../stores/useNotes'; 
import NoteCard from './NoteCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    notes,
    loading,
    error,
    getAllNotes,
    softDeleteNote,
    refreshNotes,
    clearError,
  } = useNotes();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      getAllNotes({ page: 1, limit: 10 });
    }
  }, [user, navigate]);

  // FIXED: Properly filter active notes
  const activeNotes = notes.filter((note) => {
    // Check both naming conventions
    if (note.isDeleted !== undefined) return !note.isDeleted;
    if (note.isDeleted !== undefined) return !note.isDeleted;
    return true; // If property doesn't exist, assume it's active
  });

  // Handle error display if needed
  useEffect(() => {
    if (error) {
      console.error('Notes error:', error);
    }
  }, [error]);

  const handleCreateNote = () => {
    navigate('/notes/create');
  };

  const handleRefresh = () => {
    refreshNotes({ page: 1, limit: 10 });
  };

  const handleDeleteNote = async (id: string) => {
    await softDeleteNote(id);
  };

  // Debug: Add this to see what's happening
  useEffect(() => {
    if (notes.length > 0) {
      console.log('First note properties:', {
        id: notes[0].id,
        title: notes[0].title,
        isDeleted: notes[0].isDeleted,
        is_deleted: notes[0].isDeleted,
        content: notes[0].content?.substring(0, 50) + '...',
      });
    }
  }, [notes, loading, error]);

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
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                  <button 
                    onClick={clearError}
                    className="ml-2 text-xs underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="font-medium bg-gradient-subtle border border-orange-400 text-gray-700"
            >
              {loading ? (
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

        {loading && notes.length === 0 ? (
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
            {loading && notes.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Updating...</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => handleDeleteNote(note.id)}
                  onEdit={() => navigate(`/edit/${note.id}`)}
                  onView={() => navigate(`/notes/${note.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}