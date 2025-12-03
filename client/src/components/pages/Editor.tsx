import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { useNotes } from '../../stores/useNotes'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notes, createNote, updateNote, getNoteById } = useNotes(); 
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // If editing, fetch the note
    if (isEditMode && id) {
      const fetchNote = async () => {
        setLoading(true);
        try {
          // Use getNoteById from useNotes hook
          const note = getNoteById(id);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSynopsis(note.synopsis || '');
          } else {
            toast.error('Note not found');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching note:', error);
          toast.error('Failed to load note');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
  }, [user, navigate, id, isEditMode]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && id) {
        await updateNote(id, {
          title: title.trim(),
          content: content.trim(),
          synopsis: synopsis.trim() || undefined,
        });
        toast.success('Note updated successfully!');
        navigate('/dashboard');
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          synopsis: synopsis.trim() || undefined,
        });
        toast.success('Note created successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
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
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary hover:opacity-90 text-white font-medium shadow-soft hover:shadow-medium transition-all"
          >
            {saving ? (
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="text-lg font-medium border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                disabled={saving}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSynopsis(e.target.value)}
                rows={2}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                disabled={saving}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                rows={16}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 font-sans text-sm"
                disabled={saving}
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
            disabled={saving}
            className="border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            {saving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </main>
    </div>
  );
}