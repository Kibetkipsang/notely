import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    navigate('/dashboard');
  };

  const handleEdit = () => {
    if (note && note.id) {
      navigate(`/edit/${note.id}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Note not found</h2>
            <p className="text-muted-foreground">The note you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button
              onClick={handleBack}
              variant="outline"
              className="gap-2 border-orange-400 text-gray-700"
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
    <div className="min-h-screen bg-gradient-subtle">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 border-orange-400 text-gray-700 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="gap-2 hover:bg-primary hover:text-white border-orange-400 text-gray-700 transition-all"
              disabled={deleteNoteMutation.isPending}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="gap-2 hover:bg-destructive hover:text-white border-red-300 text-red-600 transition-all"
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

        <Card className="border-border shadow-medium bg-card">
          <CardHeader className="space-y-4">
            <CardTitle className="text-3xl font-display font-bold text-foreground">
              {note.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
            </CardDescription>
            {note.synopsis && (
              <div className="rounded-lg bg-muted/50 p-4 border border-border">
                <p className="text-sm font-medium text-muted-foreground italic">
                  {note.synopsis}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-display font-bold text-foreground mt-8 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-display font-bold text-foreground mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-display font-bold text-foreground mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-foreground mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary-dark underline underline-offset-4 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono border border-border">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-1 text-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}