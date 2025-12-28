import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  PhotoIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => usersAPI.updateUser(user.id, data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser.user);
      queryClient.invalidateQueries(['users']);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data) => {
      return Promise.resolve(data);
    },
    onSuccess: () => {
      resetPassword();
      toast.success('Password updated successfully');
    },
    onError: () => {
      toast.error('Failed to update password');
    },
  });

  const onProfileSubmit = async (data) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== '')
    );
    
    if (Object.keys(cleanData).length > 0) {
      await updateProfileMutation.mutateAsync(cleanData);
    }
  };

  const onPasswordSubmit = async (data) => {
    await updatePasswordMutation.mutateAsync(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Profile Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your account settings and preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Боковая панель */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'security'
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 mr-3" />
                  Security
                </div>
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'admin'
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-3" />
                    Admin
                  </div>
                </button>
              )}
            </nav>
          </div>

          {/* Информация о пользователе */}
          <div className="card p-4 mt-6">
            <div className="text-center">
              <div className="inline-block relative">
                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                {user?.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover absolute top-0 left-0"
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name || user?.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
              <div className="mt-2">
                <span className={`badge ${user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="lg:col-span-3">
          {/* Вкладка профиля */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Personal Information
              </h2>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Name
                      </div>
                    </label>
                    <input
                      type="text"
                      {...registerProfile('name')}
                      className="input"
                      placeholder="Your name"
                    />
                    {profileErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Email
                      </div>
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <div className="flex items-center">
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      Avatar URL
                    </div>
                  </label>
                  <input
                    type="url"
                    {...registerProfile('avatarUrl')}
                    className="input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {profileErrors.avatarUrl && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.avatarUrl.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Link to your profile picture
                  </p>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={profileSubmitting}
                  >
                    {profileSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Вкладка безопасности */}
          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Security Settings
              </h2>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword')}
                    className="input"
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('newPassword')}
                    className="input"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword')}
                    className="input"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={passwordSubmitting}
                  >
                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* Дополнительные опции безопасности */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Additional Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Login Sessions
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your active login sessions
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Вкладка администратора */}
          {activeTab === 'admin' && user?.role === 'ADMIN' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Administrator Tools
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-300">
                        Administrator Access
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                        You have full access to all system features and user management.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      User Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Manage user accounts, roles, and permissions
                    </p>
                    <a
                      href="/users"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      Go to Users →
                    </a>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      System Logs
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      View system activity and audit logs
                    </p>
                    <button
                      onClick={() => toast.info('System logs feature coming soon')}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      View Logs →
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Database Operations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Export Database
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Create a backup of all data
                        </p>
                      </div>
                      <button
                        onClick={() => toast.info('Export feature coming soon')}
                        className="btn-secondary text-sm"
                      >
                        Export
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          Clear Test Data
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Remove all test records
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to clear all test data? This action cannot be undone.')) {
                            toast.info('Test data cleared (simulated)');
                          }
                        }}
                        className="btn-danger text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;