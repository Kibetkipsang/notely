import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuthStore from '../stores/useAuthStore';
import { 
  PenLine, Trash2, User, LogOut, Bell, Settings, FileText, 
  Star, Pin, Clock, CheckCircle, Info
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type ActivityType = {
  id: string;
  type: string;
  action: string;
  targetType: string;
  targetId?: string;
  title: string;
  message?: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
};

type ActivitiesResponse = {
  success: boolean;
  data: ActivityType[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const Header = () => {
  const user = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);
  const navigate = useNavigate();
  
  // Local state for immediate UI updates
  const [localActivities, setLocalActivities] = useState<ActivityType[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🔴 FIXED: Safe activities fetch - handles 401 gracefully
  const { data: activitiesResponse, refetch: refetchActivities, isLoading: activitiesLoading } = useQuery<ActivitiesResponse>({
    queryKey: ['activities', user?.id], // Include user.id in query key
    queryFn: async () => {
      // 🚨 Don't fetch if no user
      if (!user?.id) {
        console.log('No user, skipping activities fetch');
        return {
          success: false,
          data: [],
          unreadCount: 0,
          message: 'User not authenticated'
        };
      }
      
      try {
        const response = await api.get('/activities', { 
          params: { limit: 10 } 
        });
        return response.data;
      } catch (error: any) {
        // 🚨 Handle 401 gracefully - don't throw error
        if (error.response?.status === 401) {
          console.log('Not authenticated for activities');
          return {
            success: false,
            data: [],
            unreadCount: 0,
            message: 'Authentication required'
          };
        }
        
        console.error('Error fetching activities:', error);
        return {
          success: false,
          data: [],
          unreadCount: 0,
          message: error?.response?.data?.message || 'Failed to fetch activities'
        };
      }
    },
    enabled: !!user?.id, // 🚨 CRITICAL: Only enable if user exists
    retry: false, // 🚨 Don't retry on error
    refetchOnWindowFocus: false, // 🚨 Disable auto-refresh on focus
    staleTime: 60000, // 1 minute
  });

  // 🔴 FIXED: Safe mutation for marking all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch('/activities/read-all');
      return response.data;
    },
    onSuccess: () => {
      // Update local state immediately
      const updatedActivities = localActivities.map(activity => ({
        ...activity,
        read: true
      }));
      setLocalActivities(updatedActivities);
      setLocalUnreadCount(0);
      toast.success('All notifications marked as read');
    },
    onError: (error: any) => {
      console.error('Error marking all as read:', error);
      // 🚨 Don't show toast for 401 - user might be logged out
      if (error.response?.status !== 401) {
        toast.error(error?.response?.data?.message || 'Failed to mark all as read');
      }
    }
  });

  // 🔴 FIXED: Safe mutation for marking single activity as read
  const markAsReadMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const response = await api.patch(`/activities/${activityId}/read`);
      return response.data;
    },
    onSuccess: (_, activityId) => {
      // Update local state immediately
      const updatedActivities = localActivities.map(activity => 
        activity.id === activityId ? { ...activity, read: true } : activity
      );
      setLocalActivities(updatedActivities);
      setLocalUnreadCount(prev => Math.max(0, prev - 1));
    },
    onError: (error: any) => {
      console.error('Error marking as read:', error);
      // 🚨 Don't show toast for 401
      if (error.response?.status !== 401) {
        toast.error(error?.response?.data?.message || 'Failed to mark as read');
      }
    }
  });

  // Initialize local state with fetched data
  useEffect(() => {
    if (activitiesResponse?.data) {
      setLocalActivities(activitiesResponse.data);
      setLocalUnreadCount(activitiesResponse.unreadCount || 0);
    } else {
      // 🚨 Reset if no data or error
      setLocalActivities([]);
      setLocalUnreadCount(0);
    }
  }, [activitiesResponse]);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.emailAddress) {
      return user.emailAddress.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = () => {
    clearUser();
    navigate('/auth');
  };

  const handleMarkAllAsRead = () => {
    // 🚨 Only mark as read if we have activities
    if (localActivities.length > 0) {
      markAllAsReadMutation.mutate();
    }
    setIsDropdownOpen(false);
  };

  const handleMarkAsRead = (activityId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markAsReadMutation.mutate(activityId);
  };

  const handleActivityClick = (activity: ActivityType) => {
    // Mark as read when clicked if not already read
    if (!activity.read) {
      handleMarkAsRead(activity.id);
    }
    
    // Navigate based on activity type or target
    if (activity.targetType === 'note' && activity.targetId) {
      navigate(`/notes/${activity.targetId}`);
    } else if (activity.type.includes('note_')) {
      navigate('/notes');
    }
    
    // Close dropdown after click
    setIsDropdownOpen(false);
  };

  const getActivityIcon = (type: string, action: string) => {
    // Note activities
    if (type === 'note_created') {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    if (type === 'note_updated') {
      if (action === 'pinned') return <Pin className="h-4 w-4 text-orange-600" />;
      if (action === 'favorited') return <Star className="h-4 w-4 text-yellow-600" />;
      return <PenLine className="h-4 w-4 text-blue-600" />;
    }
    if (type === 'note_deleted') {
      return <Trash2 className="h-4 w-4 text-red-600" />;
    }
    if (type === 'note_restored') {
      return <Clock className="h-4 w-4 text-green-600" />;
    }
    if (type === 'note_permanently_deleted') {
      return <Trash2 className="h-4 w-4 text-red-700" />;
    }
    
    // System activities
    if (type === 'trash_emptied') {
      return <Trash2 className="h-4 w-4 text-gray-600" />;
    }
    if (type === 'system') {
      return <Info className="h-4 w-4 text-gray-600" />;
    }
    
    // Default
    return <Bell className="h-4 w-4 text-gray-600" />;
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
    if (open && user?.id) {
      // Refetch when dropdown opens to get latest data
      refetchActivities();
    }
  };

  // Get activity display content
  const getActivityContent = (activity: ActivityType) => {
    if (activity.message) {
      return activity.message;
    }
    
    // Fallback content based on activity type
    if (activity.type === 'note_created') {
      return 'New note created';
    }
    if (activity.type === 'note_updated') {
      if (activity.action === 'pinned') return 'Note pinned for quick access';
      if (activity.action === 'favorited') return 'Note added to favorites';
      return 'Note content updated';
    }
    if (activity.type === 'note_deleted') {
      return 'Note moved to trash';
    }
    if (activity.type === 'note_restored') {
      return 'Note restored from trash';
    }
    
    return '';
  };

  const unreadCount = localUnreadCount;
  const hasActivities = localActivities.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm transition-all group-hover:shadow-md group-hover:scale-105">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Notely
          </span>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {/* Desktop Navigation - only show if user is logged in */}
          {user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex text-gray-700 hover:text-orange-500 hover:bg-orange-50"
              >
                <PenLine className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notes')}
                className="hidden sm:flex text-gray-700 hover:text-orange-500 hover:bg-orange-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Notes
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/trash')}
                className="hidden sm:flex text-gray-700 hover:text-orange-500 hover:bg-orange-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Trash
              </Button>
            </>
          )}

          {/* Notifications Dropdown - only show if user is logged in */}
          {user && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-full hover:bg-orange-50 transition-all"
                  disabled={markAllAsReadMutation.isPending || activitiesLoading}
                >
                  {activitiesLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                  ) : (
                    <>
                      <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-orange-600' : 'text-gray-700'}`} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-xs font-bold text-white border-2 border-white shadow-sm animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-80 bg-white border-orange-200 shadow-xl animate-in slide-in-from-top-2 duration-200"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-4 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all"
                      >
                        {markAllAsReadMutation.isPending ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasActivities 
                      ? `${localActivities.length} recent activit${localActivities.length !== 1 ? 'ies' : 'y'}`
                      : 'No recent activity'
                    }
                    {unreadCount > 0 && ` • ${unreadCount} unread`}
                  </p>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {hasActivities ? (
                    localActivities.map((activity: ActivityType) => (
                      <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className={`flex items-start gap-3 p-3 cursor-pointer transition-all hover:bg-orange-50 active:bg-orange-100 ${
                          !activity.read ? 'bg-orange-50/50' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {getActivityIcon(activity.type, activity.action)}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            {!activity.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(activity.id, e)}
                                disabled={markAsReadMutation.isPending}
                                className="flex-shrink-0 text-xs text-orange-600 hover:text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Mark as read"
                              >
                                {markAsReadMutation.isPending && markAsReadMutation.variables === activity.id ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                                ) : (
                                  '✓'
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {getActivityContent(activity)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!activity.read && (
                          <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <Bell className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm text-gray-500">
                        {activitiesLoading ? 'Loading activities...' : 'No recent activity'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Your activities will appear here
                      </p>
                    </div>
                  )}
                </div>
                
                {hasActivities && activitiesResponse?.pagination?.hasNextPage && (
                  <div className="p-2 border-t border-orange-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigate('/activities');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <FileText className="h-3 w-3 mr-2" />
                      View all activities
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Dropdown / Auth Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-orange-50 border border-orange-100 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white border-orange-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="h-12 w-12 border-2 border-orange-100">
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.emailAddress}
                    </p>
                    {unreadCount > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs text-orange-600 font-medium">
                          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-orange-100" />
                
                {/* Menu Items */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')}
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:text-orange-500 focus:bg-orange-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard?tab=profile')}
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:text-orange-500 focus:bg-orange-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard?tab=settings')}
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:text-orange-500 focus:bg-orange-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-orange-100 sm:hidden" />
                
                {/* Mobile-only menu items */}
                <DropdownMenuItem 
                  onClick={() => navigate('/notes')} 
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:text-orange-500 focus:bg-orange-50 sm:hidden"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Notes</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/trash')} 
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:text-orange-500 focus:bg-orange-50 sm:hidden"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Trash</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-orange-100" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/auth?tab=login')}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth?tab=register')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md transition-all"
              >
                Sign Up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};