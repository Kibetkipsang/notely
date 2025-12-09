import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical, 
  Loader2, 
  Star, 
  Pin, 
  Bookmark,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface NoteType {
  id: string;
  title: string;
  content: string;
  synopsis?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted: boolean;
  userId: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  bookmarkedAt?: Date | string;
  tags?: string[];
  category?: string;
  wordCount?: number;
}

export interface NoteCardProps {
  note: NoteType;
  onDelete?: (id: string) => Promise<void> | void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => Promise<void> | void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => Promise<void> | void;
  onToggleBookmark?: (id: string, isBookmarked: boolean) => Promise<void> | void;
  isDeleting?: boolean;
  showPinButton?: boolean;
  showFavoriteButton?: boolean;
  showBookmarkButton?: boolean;
  compact?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function NoteCard({ 
  note, 
  onDelete, 
  onEdit, 
  onView, 
  onTogglePin,
  onToggleFavorite,
  onToggleBookmark,
  isDeleting = false,
  showPinButton = true,
  showFavoriteButton = true,
  showBookmarkButton = true,
  compact = false,
  isLoading = false,
  className = ''
}: NoteCardProps) {
  const [isPinning, setIsPinning] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleTogglePin = async () => {
    if (!onTogglePin) return;
    
    setIsPinning(true);
    try {
      await onTogglePin(note.id, note.isPinned || false);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    } finally {
      setIsPinning(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return;
    
    setIsFavoriting(true);
    try {
      await onToggleFavorite(note.id, note.isFavorite || false);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!onToggleBookmark) return;
    
    setIsBookmarking(true);
    try {
      await onToggleBookmark(note.id, note.isBookmarked || false);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const truncateText = (text: string, maxLength: number = compact ? 80 : 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getWordCountText = () => {
    if (note.wordCount) {
      return `${note.wordCount} ${note.wordCount === 1 ? 'word' : 'words'}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="pb-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-1/3" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group transition-all duration-200",
        "border border-gray-200 hover:border-orange-300 hover:shadow-md",
        "bg-white hover:bg-orange-50/50",
        note.isPinned && "border-l-3 border-l-orange-500",
        note.isBookmarked && "border-r-3 border-r-blue-500",
        compact && "max-w-sm",
        className
      )}
      aria-label={`Note: ${note.title}`}
    >
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between gap-2">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle 
                className={cn(
                  "text-lg font-semibold text-gray-900 truncate",
                  compact && "text-base"
                )}
                title={note.title}
              >
                {note.title}
              </CardTitle>
              {note.category && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-300"
                >
                  {note.category}
                </Badge>
              )}
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {note.isPinned && (
                  <Pin className="h-3 w-3 text-orange-500" aria-label="Pinned" />
                )}
                {note.isFavorite && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" aria-label="Favorite" />
                )}
                {note.isBookmarked && (
                  <Bookmark className="h-3 w-3 fill-blue-500 text-blue-600" aria-label="Bookmarked" />
                )}
              </div>
              
              {/* Tags */}
              {note.tags && note.tags.length > 0 && !compact && (
                <div className="flex gap-1 flex-wrap">
                  {note.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs px-1.5 py-0.5 text-gray-500">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Pin Button */}
            {showPinButton && onTogglePin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePin}
                disabled={isPinning || isDeleting}
                className={cn(
                  "h-8 w-8 hover:bg-orange-100",
                  note.isPinned && "bg-orange-50"
                )}
                aria-label={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {isPinning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pin className={cn(
                    "h-4 w-4",
                    note.isPinned ? "text-orange-600 fill-orange-600" : "text-gray-400"
                  )} />
                )}
              </Button>
            )}

            {/* Favorite Button */}
            {showFavoriteButton && onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isFavoriting || isDeleting}
                className={cn(
                  "h-8 w-8 hover:bg-yellow-100",
                  note.isFavorite && "bg-yellow-50"
                )}
                aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavoriting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Star className={cn(
                    "h-4 w-4",
                    note.isFavorite ? "text-yellow-600 fill-yellow-600" : "text-gray-400"
                  )} />
                )}
              </Button>
            )}

            {/* Bookmark Button */}
            {showBookmarkButton && onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleBookmark}
                disabled={isBookmarking || isDeleting}
                className={cn(
                  "h-8 w-8 hover:bg-blue-100",
                  note.isBookmarked && "bg-blue-50"
                )}
                aria-label={note.isBookmarked ? "Remove bookmark" : "Bookmark note"}
              >
                {isBookmarking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={cn(
                    "h-4 w-4",
                    note.isBookmarked ? "text-blue-600 fill-blue-600" : "text-gray-400"
                  )} />
                )}
              </Button>
            )}

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(note.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(note.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Note
                  </DropdownMenuItem>
                )}
                
                {(onTogglePin || onToggleFavorite || onToggleBookmark) && (
                  <>
                    <DropdownMenuSeparator />
                    {onTogglePin && (
                      <DropdownMenuItem onClick={handleTogglePin}>
                        <Pin className="mr-2 h-4 w-4" />
                        {note.isPinned ? "Unpin Note" : "Pin Note"}
                      </DropdownMenuItem>
                    )}
                    {onToggleFavorite && (
                      <DropdownMenuItem onClick={handleToggleFavorite}>
                        <Star className="mr-2 h-4 w-4" />
                        {note.isFavorite ? "Remove Favorite" : "Add to Favorites"}
                      </DropdownMenuItem>
                    )}
                    {onToggleBookmark && (
                      <DropdownMenuItem onClick={handleToggleBookmark}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        {note.isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Note
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Synopsis */}
        {note.synopsis && !compact && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {note.synopsis}
          </p>
        )}
      </CardHeader>

      {/* Content */}
      {!compact && (
        <CardContent className="pb-3">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {truncateText(note.content)}
          </p>
        </CardContent>
      )}

      {/* Footer */}
      <CardFooter className={cn(
        "flex justify-between items-center pt-3 border-t border-gray-100",
        compact && "pt-2"
      )}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span title={`Updated: ${formatDate(note.updatedAt)}`}>
                {formatTimeAgo(note.updatedAt)}
              </span>
            </div>
            
            {getWordCountText() && (
              <>
                <span className="text-gray-300">•</span>
                <span>{getWordCountText()}</span>
              </>
            )}
          </div>
          
          {/* Status Badges */}
          <div className="flex gap-1">
            {note.isPinned && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                Pinned
              </Badge>
            )}
            {note.isFavorite && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                Favorite
              </Badge>
            )}
            {note.isBookmarked && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Bookmarked
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={() => onView(note.id)}
              className="border-orange-200 hover:bg-orange-50 text-white bg-orange-500 hover:text-orange-700"
            >
              <Eye className={cn("h-4 w-4", !compact && "mr-2")} />
              {!compact && "View"}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={() => onEdit(note.id)}
              className="border-gray-200 hover:bg-gray-50 text-white bg-orange-500 hover:text-gray-700"
            >
              <Edit className={cn("h-4 w-4", !compact && "mr-2")} />
              {!compact && "Edit"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}