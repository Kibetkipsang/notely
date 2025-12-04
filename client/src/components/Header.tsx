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
import { PenLine, Trash2, User, LogOut, Bell, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/axios';

export const Header = () => {
  const user = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Mock notifications data - replace with real API
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // TODO: Replace with actual notifications API
      // const response = await api.get('/notifications');
      // return response.data;
      
      // Mock data for now
      return {
        unreadCount: 3,
        notifications: [
          { id: 1, message: 'New note pinned', read: false, time: '2 min ago' },
          { id: 2, message: 'Note updated', read: false, time: '1 hour ago' },
          { id: 3, message: 'Welcome to Notely!', read: true, time: '1 day ago' },
        ]
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (notifications?.unreadCount) {
      setNotificationCount(notifications.unreadCount);
    }
  }, [notifications]);

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
    // TODO: Implement mark all as read API
    setNotificationCount(0);
  };

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
          {/* Desktop Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex text-gray-700 hover:text-orange-500 hover:bg-orange-50"
          >
            <PenLine className="mr-2 h-4 w-4" />
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

          {/* Notifications Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-full hover:bg-orange-50"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-xs font-bold text-white border-2 border-white shadow-sm">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-80 bg-white border-orange-200 shadow-lg">
                <div className="p-4 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {notificationCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {notificationCount > 0 
                      ? `${notificationCount} unread notification${notificationCount !== 1 ? 's' : ''}`
                      : 'No new notifications'
                    }
                  </p>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications?.notifications?.length > 0 ? (
                    notifications.notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-orange-50 transition-colors border-l-2 ${
                          notification.read 
                            ? 'border-l-transparent' 
                            : 'border-l-orange-500 bg-orange-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2 w-2 rounded-full ${
                            notification.read ? 'bg-gray-300' : 'bg-orange-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                // TODO: Mark as read API
                              }}
                            >
                              <div className="h-3 w-3 rounded-full border border-orange-300" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <Bell className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No notifications yet
                      </p>
                    </div>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => navigate('/notifications')}
                  className="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>View all notifications</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-orange-50 border border-orange-100"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white border-orange-200 shadow-lg">
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
                    {notificationCount > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-orange-600 font-medium">
                          {notificationCount} new notification{notificationCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-orange-100" />
                
                {/* Menu Items */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/profile')}
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard/settings')}
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {/* Mobile-only menu items */}
                <DropdownMenuItem 
                  onClick={() => navigate('/dashboard')} 
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 sm:hidden"
                >
                  <PenLine className="mr-2 h-4 w-4" />
                  <span>Notes</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate('/trash')} 
                  className="cursor-pointer text-gray-700 hover:text-orange-500 hover:bg-orange-50 sm:hidden"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Trash</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-orange-100 sm:hidden" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md"
            >
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};