import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Trash2, 
  User, 
  Settings, 
  LogOut,
  Plus,
  ChevronRight,
  BookOpen,
  Archive,
  Star,
  Folder
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUser } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const navItems = [
    {
      name: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      name: 'All Notes',
      icon: <FileText className="h-5 w-5" />,
      path: '/notes',
      active: location.pathname === '/notes',
    },
    {
      name: 'Favorites',
      icon: <Star className="h-5 w-5" />,
      path: '/favorites',
      active: location.pathname === '/favorites',
    },
    {
      name: 'Notebooks',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/notebooks',
      active: location.pathname === '/notebooks',
    },
    {
      name: 'Categories',
      icon: <Folder className="h-5 w-5" />,
      path: '/categories',
      active: location.pathname === '/categories',
    },
    {
      name: 'Trash',
      icon: <Trash2 className="h-5 w-5" />,
      path: '/trash',
      active: location.pathname === '/trash',
    },
    {
      name: 'Archive',
      icon: <Archive className="h-5 w-5" />,
      path: '/archive',
      active: location.pathname === '/archive',
    },
  ];

  const userItems = [
    {
      name: 'Profile',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
      active: location.pathname === '/profile',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
      active: location.pathname === '/settings',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {!isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Starts below header */}
      <div className={`
        fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white
        border-r border-orange-200 z-40 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isExpanded ? 'w-64' : 'w-16'}
        flex flex-col
      `}>
        {/* Navigation area - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Profile section - Only on desktop expanded */}
          {isExpanded && user && (
            <div className="px-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {user.firstName?.[0] || user.userName?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse/Expand button - Top right corner */}
          <div className="px-4 mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto flex items-center justify-center p-2 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <ChevronRight className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) onClose?.();
                    }}
                    className={`
                      w-full justify-start px-3 py-2.5 rounded-lg
                      ${item.active 
                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                        : 'text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                      }
                      transition-all duration-200
                      ${!isExpanded ? 'justify-center px-2' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${item.active ? 'text-white' : 'text-gray-600'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* New Note Button */}
          <div className="px-3 mt-6">
            <Button
              onClick={() => {
                navigate('/notes/create');
                if (window.innerWidth < 1024) onClose?.();
              }}
              className={`
                w-full bg-gradient-to-r from-orange-500 to-orange-600 
                hover:from-orange-600 hover:to-orange-700
                text-white font-medium shadow-sm hover:shadow-md
                transition-all duration-200
                ${!isExpanded ? 'justify-center px-2' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5" />
                {isExpanded && <span>New Note</span>}
              </div>
            </Button>
          </div>

          {/* User section */}
          <div className="px-3 mt-8">
            <ul className="space-y-1">
              {userItems.map((item) => (
                <li key={item.name}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) onClose?.();
                    }}
                    className={`
                      w-full justify-start px-3 py-2.5 rounded-lg
                      ${item.active 
                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                        : 'text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                      }
                      transition-all duration-200
                      ${!isExpanded ? 'justify-center px-2' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${item.active ? 'text-white' : 'text-gray-600'}`}>
                        {item.icon}
                      </div>
                      {isExpanded && (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Logout button - Fixed at bottom */}
        <div className="p-4 border-t border-orange-200 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`
              w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 
              px-3 py-2.5 rounded-lg transition-all duration-200
              ${!isExpanded ? 'justify-center px-2' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              {isExpanded && <span className="font-medium">Logout</span>}
            </div>
          </Button>
        </div>
      </div>
    </>
  );
}