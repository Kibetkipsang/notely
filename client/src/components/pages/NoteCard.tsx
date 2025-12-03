import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, MoreVertical, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Update the NoteType import or define it locally
interface NoteType {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  userId: string;
}

interface NoteCardProps {
  note: NoteType;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  isDeleting?: boolean; // Add this prop
}

export default function NoteCard({ 
  note, 
  onDelete, 
  onEdit, 
  onView, 
  isDeleting = false // Default to false
}: NoteCardProps) {
  
  const handleDelete = () => {
    if (!isDeleting) {
      onDelete(note.id);
    }
  };
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-200 animate-fade-in border-border/50 hover:border-primary/30 bg-gradient-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-1 text-foreground">
            {note.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border bg-card">
              <DropdownMenuItem 
                onClick={() => onView(note.id)}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">View</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEdit(note.id)}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
              >
                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-destructive">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="text-destructive">Delete</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {note.synopsis && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {note.synopsis}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-foreground/80 text-sm line-clamp-3 font-light">
          {truncateText(note.content, 150)}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          Updated {formatDate(note.updatedAt)}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(note.id)}
            className="h-8 text-xs hover:bg-primary/10 hover:text-primary border-border"
            disabled={isDeleting}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note.id)}
            className="h-8 text-xs hover:bg-primary/10 hover:text-primary border-border"
            disabled={isDeleting}
          >
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}