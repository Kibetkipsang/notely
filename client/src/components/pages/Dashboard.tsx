// pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import useAuthStore from '../../stores/useAuthStore';
import Sidebar from './SideBar';
import { DeleteConfirmationModal } from './DeleteModal';
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
  Globe,
  FileText,
  BarChart3,
  Calendar,
  AlertTriangle,
  Trash2,
  Settings
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'account' | 'notes'>('notes');

  // Fetch user stats
  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => (await api.get('/notes/stats')).data,
    enabled: !!user,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
  });

  // Initialize profile form
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => (await api.put('/auth/profile', data)).data,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => (await api.put('/auth/password', data)).data,
    onSuccess: () => {
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    },
  });

  // Delete all notes mutation
  const deleteAllNotesMutation = useMutation({
    mutationFn: async () => (await api.delete('/notes/all')).data,
    onSuccess: (data) => {
      toast.success(data.message || 'All notes deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete notes');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await api.delete('/auth/account', { data: { password, immediate: true } });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Account deletion initiated');
      setDeleteModalOpen(false);
      setTimeout(() => {
        clearUser();
        localStorage.removeItem('user');
        navigate('/auth');
        toast.info('You have been logged out. Account deletion will complete shortly.');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete account');
    },
  });

  // Handlers
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

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

  const handleDeleteAllNotes = () => {
    setDeleteType('notes');
    setDeleteModalOpen(true);
  };

  const handleDeleteAccount = () => {
    setDeleteType('account');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (password?: string) => {
    if (deleteType === 'notes') {
      await deleteAllNotesMutation.mutateAsync();
    } else if (deleteType === 'account' && password) {
      await deleteAccountMutation.mutateAsync(password);
    }
  };

  const stats = statsData?.data || {
    totalNotes: 0,
    activeNotes: 0,
    deletedNotes: 0,
    recentNotes: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-orange-200 bg-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-orange-100 rounded-lg"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <main className="p-4 lg:p-8">
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Manage your profile, security, and view your note statistics.
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Notes</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalNotes}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Notes</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.activeNotes}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Trash</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.deletedNotes}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Recent Notes</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.recentNotes}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 lg:grid-cols-3 bg-gray-100">
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white">
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your personal information and profile details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          placeholder="Kibet"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          placeholder="Dennis"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profileForm.emailAddress}
                        onChange={(e) => setProfileForm({ ...profileForm, emailAddress: e.target.value })}
                        placeholder="kibet@example.com"
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
              <Card className="bg-white border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Key className="h-5 w-5" />
                    Password & Security
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Change your password and manage security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
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

            {/* Account Tab */}
<TabsContent value="account">
  <Card className="bg-white border-orange-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-gray-800">
        <Globe className="h-5 w-5" />
        Account Management
      </CardTitle>
      <CardDescription className="text-gray-600">
        Manage your account and data.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Delete All Notes */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Delete All Notes</h3>
          </div>
          <p className="text-sm text-yellow-600 mb-4">
            This will permanently delete ALL your notes. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteAllNotes}
            disabled={deleteAllNotesMutation.isPending}
          >
            {deleteAllNotesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete All Notes
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800">Delete Account</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Delete Account
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>

          </Tabs>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={deleteType === 'account' ? 'Delete Account' : 'Delete All Notes'}
        description={
          deleteType === 'account'
            ? 'This will permanently delete your account and all associated data. This action cannot be undone.'
            : 'This will permanently delete ALL your notes. This action cannot be undone.'
        }
        type={deleteType}
        isPending={
          deleteType === 'account' ? deleteAccountMutation.isPending : deleteAllNotesMutation.isPending
        }
      />
    </div>
  );
}
