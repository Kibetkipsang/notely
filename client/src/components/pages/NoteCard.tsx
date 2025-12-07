import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, MoreVertical, Loader2, Star, Pin, PinOff, StarOff, Bookmark, BookmarkX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

// Update the NoteType interface to include bookmark fields
interface NoteType {
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
  bookmarked?: boolean;
  bookmarkedAt?: Date | string;
}

interface NoteCardProps {
  note: NoteType;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
  onToggleBookmark?: (id: string, bookmarked: boolean) => void; // NEW
  isDeleting?: boolean;
  showPinButton?: boolean;
  showFavoriteButton?: boolean;
  showBookmarkButton?: boolean; // NEW
}

export default function NoteCard({ 
  note, 
  onDelete, 
  onEdit, 
  onView, 
  onTogglePin,
  onToggleFavorite,
  onToggleBookmark, // NEW
  isDeleting = false,
  showPinButton = true,
  showFavoriteButton = true,
  showBookmarkButton = true // NEW
}: NoteCardProps) {
  const [isPinning, setIsPinning] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false); // NEW
  
  const handleDelete = () => {
    if (!isDeleting) {
      onDelete(note.id);
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

  // NEW: Handle bookmark toggle
  const handleToggleBookmark = async () => {
    if (!onToggleBookmark) return;
    
    setIsBookmarking(true);
    try {
      await onToggleBookmark(note.id, note.bookmarked || false);
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
  
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={`
      group hover:shadow-medium rounded-md transition-all duration-200 animate-fade-in 
      border-orange-200 hover:border-orange-400 bg-white hover:bg-orange-50
      ${note.isPinned ? 'border-l-4 border-l-orange-500' : ''}
      ${note.bookmarked ? 'border-r-4 border-r-blue-500' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-800 group-hover:text-orange-600 transition-colors duration-200">
              {note.isPinned && (
                <Pin className="inline-block h-4 w-4 mr-2 text-orange-500" />
              )}
              {note.bookmarked && (
                <Bookmark className="inline-block h-4 w-4 mr-2 text-blue-500" />
              )}
              {note.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {/* Pin button */}
            {showPinButton && onTogglePin && (
              <button
                onClick={handleTogglePin}
                disabled={isPinning || isDeleting}
                className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {isPinning ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : note.isPinned ? (
                  <Pin className="h-4 w-4 text-orange-600" />
                ) : (
                  <PinOff className="h-4 w-4 text-gray-400 hover:text-orange-500" />
                )}
              </button>
            )}
            
            {/* Favorite button */}
            {showFavoriteButton && onToggleFavorite && (
              <button
                onClick={handleToggleFavorite}
                disabled={isFavoriting || isDeleting}
                className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavoriting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                ) : note.isFavorite ? (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                )}
              </button>
            )}
            
            {/* Bookmark button - NEW */}
            {showBookmarkButton && onToggleBookmark && (
              <button
                onClick={handleToggleBookmark}
                disabled={isBookmarking || isDeleting}
                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={note.bookmarked ? "Remove bookmark" : "Bookmark note"}
              >
                {isBookmarking ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : note.bookmarked ? (
                  <Bookmark className="h-4 w-4 fill-blue-500 text-blue-600" />
                ) : (
                  <BookmarkX className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                )}
              </button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-100"
                  disabled={isDeleting || isPinning || isFavoriting || isBookmarking}
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-orange-200 bg-white">
                <DropdownMenuItem 
                  onClick={() => onView(note.id)}
                  className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                >
                  <Eye className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">View</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onEdit(note.id)}
                  className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                >
                  <Edit className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Edit</span>
                </DropdownMenuItem>
                
                {/* Pin option in dropdown */}
                {showPinButton && onTogglePin && (
                  <DropdownMenuItem 
                    onClick={handleTogglePin}
                    disabled={isPinning}
                    className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                  >
                    {isPinning ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-500" />
                    ) : note.isPinned ? (
                      <PinOff className="mr-2 h-4 w-4 text-orange-600" />
                    ) : (
                      <Pin className="mr-2 h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-gray-700">
                      {note.isPinned ? 'Unpin Note' : 'Pin Note'}
                    </span>
                  </DropdownMenuItem>
                )}
                
                {/* Favorite option in dropdown */}
                {showFavoriteButton && onToggleFavorite && (
                  <DropdownMenuItem 
                    onClick={handleToggleFavorite}
                    disabled={isFavoriting}
                    className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
                  >
                    {isFavoriting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-yellow-500" />
                    ) : note.isFavorite ? (
                      <StarOff className="mr-2 h-4 w-4 text-yellow-500" />
                    ) : (
                      <Star className="mr-2 h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-gray-700">
                      {note.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    </span>
                  </DropdownMenuItem>
                )}
                
                {/* Bookmark option in dropdown - NEW */}
                {showBookmarkButton && onToggleBookmark && (
                  <DropdownMenuItem 
                    onClick={handleToggleBookmark}
                    disabled={isBookmarking}
                    className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {isBookmarking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                    ) : note.bookmarked ? (
                      <BookmarkX className="mr-2 h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="mr-2 h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-gray-700">
                      {note.bookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
                    </span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-red-600">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="text-red-600">Delete</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {note.synopsis && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">
            {note.synopsis}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-black text-sm line-clamp-3 font-light">
          {truncateText(note.content, 150)}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-3 border-t border-orange-100">
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-xs text-orange-600 font-medium whitespace-nowrap">
      Updated {formatDate(note.updatedAt)}
    </span>
    {(note.isPinned || note.isFavorite || note.bookmarked) && (
      <div className="flex gap-1 flex-wrap">
        {note.isPinned && (
          <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
            Pinned
          </span>
        )}
        {note.isFavorite && (
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full whitespace-nowrap">
            Favorite
          </span>
        )}
        {note.bookmarked && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
            Bookmarked
          </span>
        )}
      </div>
    )}
  </div>
  <div className="flex gap-1 shrink-0 ml-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onView(note.id)}
      className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white border-orange-200 hover:text-white"
      disabled={isDeleting || isPinning || isFavoriting || isBookmarking}
    >
      View
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onEdit(note.id)}
      className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white border-orange-200 hover:text-white"
      disabled={isDeleting || isPinning || isFavoriting || isBookmarking}
    >
      Edit
    </Button>
  </div>
</CardFooter>
    </Card>
  );
}