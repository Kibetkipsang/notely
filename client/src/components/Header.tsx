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
import { PenLine, Trash2, User, LogOut } from 'lucide-react';

export const Header = () => {
  const user = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        <Link to="/dashboard" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm transition-all group-hover:shadow-md">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-2xl text-orange-500">
            Notely
          </span>
        </Link>


        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex text-gray-700 hover:text-orange-500"
          >
            <PenLine className="mr-2 h-4 w-4" />
            Notes
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trash')}
            className="hidden sm:flex text-gray-700 hover:text-orange-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-orange-50"
              >
                <Avatar className="h-9 w-9 border-2 border-orange-100">
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
           
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border border-orange-100">
                  <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {user?.emailAddress}
                  </p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Profile */}
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer text-gray-700 hover:text-orange-500"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              {/* Mobile-only menu items */}
              <DropdownMenuItem 
                onClick={() => navigate('/dashboard')} 
                className="cursor-pointer text-gray-700 hover:text-orange-500 sm:hidden"
              >
                <PenLine className="mr-2 h-4 w-4" />
                <span>Notes</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate('/trash')} 
                className="cursor-pointer text-gray-700 hover:text-orange-500 sm:hidden"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Trash</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};