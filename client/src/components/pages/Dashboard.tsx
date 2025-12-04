// pages/Dashboard.tsx
import { useState, useEffect } from 'react'; // ADD useEffect
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import Sidebar from './SideBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Key,
  Save,
  Loader2,
  Menu,
  Shield,
  Bell,
  Globe,
  Palette,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/notes/stats');
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch user settings - ADD THIS
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await api.get('/auth/settings');
      return response.data;
    },
    enabled: !!user,
  });

  // Apply dark mode when settings change - ADD THIS
  useEffect(() => {
    if (settingsData?.data?.darkMode !== undefined) {
      if (settingsData.data.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settingsData]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
  });

  // Initialize profile form when user data is available - ADD THIS
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailAddress: user.emailAddress || '',
      });
    }
  }, [user]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Settings form state - Initialize with defaults
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
    pushNotifications: true,
    soundEnabled: true,
  });

  // Initialize settings form when settings data is available - ADD THIS
  useEffect(() => {
    if (settingsData?.data) {
      setSettingsForm({
        emailNotifications: settingsData.data.emailNotifications ?? true,
        darkMode: settingsData.data.darkMode ?? false,
        language: settingsData.data.language ?? 'en',
        timezone: settingsData.data.timezone ?? 'UTC',
        pushNotifications: settingsData.data.pushNotifications ?? true,
        soundEnabled: settingsData.data.soundEnabled ?? true,
      });
    }
  }, [settingsData]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/auth/password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    },
  });

  // Update settings mutation - FIXED
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/auth/settings', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      
      // Apply dark mode immediately
      if (data.data?.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to update settings');
    },
  });

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    updatePasswordMutation.mutate(passwordForm);
  };

  // Handle settings update
  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsForm);
  };

  // Stats
  const stats = statsData?.data || {
    totalNotes: 0,
    activeNotes: 0,
    deletedNotes: 0,
    recentNotes: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-orange-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-orange-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your profile, settings, and view your note statistics.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Notes</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalNotes}</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Notes</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.activeNotes}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Trash</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.deletedNotes}</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recent Notes</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.recentNotes}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-5 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
                <Palette className="h-4 w-4" />
                <span className="hidden lg:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
                <Bell className="h-4 w-4" />
                <span className="hidden lg:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Update your personal information and profile details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          First Name
                        </label>
                        <Input
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          placeholder="Kibet"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name
                        </label>
                        <Input
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          placeholder="Dennis"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profileForm.emailAddress}
                        onChange={(e) => setProfileForm({...profileForm, emailAddress: e.target.value})}
                        placeholder="kibet@example.com"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Key className="h-5 w-5" />
                    Password & Security
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Change your password and manage security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        placeholder="Enter current password"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        placeholder="Enter new password"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        placeholder="Confirm new password"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={updatePasswordMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        {updatePasswordMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Key className="h-4 w-4 mr-2" />
                        )}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Palette className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Customize your application preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSettingsUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Dark Mode</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Switch between light and dark theme
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.darkMode}
                            onChange={(e) => setSettingsForm({...settingsForm, darkMode: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:peer-checked:bg-orange-700"></div>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Language
                        </label>
                        <select
                          value={settingsForm.language}
                          onChange={(e) => setSettingsForm({...settingsForm, language: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Timezone
                        </label>
                        <select
                          value={settingsForm.timezone}
                          onChange={(e) => setSettingsForm({...settingsForm, timezone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST</option>
                          <option value="PST">PST</option>
                          <option value="CET">CET</option>
                          <option value="GMT">GMT</option>
                          <option value="CST">CST</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Push Notifications</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Receive push notifications in the browser
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.pushNotifications}
                            onChange={(e) => setSettingsForm({...settingsForm, pushNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:peer-checked:bg-orange-700"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">Sound Enabled</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Enable sound notifications
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.soundEnabled}
                            onChange={(e) => setSettingsForm({...settingsForm, soundEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:peer-checked:bg-orange-700"></div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={updateSettingsMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        {updateSettingsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Preferences
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Receive updates and notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.emailNotifications}
                          onChange={(e) => setSettingsForm({...settingsForm, emailNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 dark:peer-checked:bg-orange-700"></div>
                      </label>
                    </div>

                    <div className="pt-6">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-4">Notification Types</h3>
                      <div className="space-y-3">
                        {[
                          { id: 'new_note', label: 'New note created', default: true },
                          { id: 'note_updated', label: 'Note updated', default: true },
                          { id: 'trash_cleared', label: 'Trash cleared', default: false },
                          { id: 'weekly_summary', label: 'Weekly summary', default: true },
                          { id: 'security_alerts', label: 'Security alerts', default: true },
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                            <input
                              type="checkbox"
                              defaultChecked={item.default}
                              className="h-4 w-4 text-orange-600 dark:text-orange-500 rounded border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-600 dark:bg-gray-700"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="bg-white dark:bg-gray-800 border-orange-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                    <Globe className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage your account and data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h3 className="font-medium text-red-800 dark:text-red-400 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-800 dark:hover:text-red-300"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete all your notes? This action cannot be undone.')) {
                              toast.info('This feature is coming soon');
                            }
                          }}
                        >
                          Delete All Notes
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-800 dark:hover:text-red-300"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to permanently delete your account? All data will be lost.')) {
                              toast.info('This feature is coming soon');
                            }
                          }}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => {
                          if (window.confirm('Export all your notes as JSON?')) {
                            toast.info('Export feature coming soon');
                          }
                        }}
                      >
                        Export All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}