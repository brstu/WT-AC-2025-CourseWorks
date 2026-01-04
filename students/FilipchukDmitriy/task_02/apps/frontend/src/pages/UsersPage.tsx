import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { userCreateSchema, userUpdateSchema, type UserCreateFormData, type UserUpdateFormData } from '../lib/validation';
import type { UserFull, Role } from '../types';
import {
  Button,
  Input,
  Select,
  Modal,
  ConfirmModal,
  Spinner,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/ui';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFull | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserFull | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    const response = await usersApi.list();
    if (response.status === 'ok' && response.data) {
      setUsers(response.data);
    } else {
      setError(response.error || 'Не удалось загрузить пользователей');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    const response = await usersApi.delete(deletingUser.id);
    if (response.status === 'ok') {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      showToast('Пользователь удалён', 'success');
    } else {
      showToast(response.error || 'Ошибка удаления', 'error');
    }
    setIsDeleting(false);
    setDeletingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadUsers} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-gray-500 mt-1">Администрирование пользователей системы</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          title="Нет пользователей"
          description="Добавьте первого пользователя"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Удалить"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(user) => {
          setUsers((prev) => [user, ...prev]);
          setIsCreateOpen(false);
          showToast('Пользователь создан', 'success');
        }}
      />

      {/* Edit Modal */}
      <UserEditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={(updated) => {
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
          setEditingUser(null);
          showToast('Пользователь обновлён', 'success');
        }}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Удалить пользователя?"
        message={`Вы уверены, что хотите удалить пользователя "${deletingUser?.username}"? Все его данные будут удалены.`}
        confirmText="Удалить"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserFull) => void;
}

function UserCreateModal({ isOpen, onClose, onSuccess }: UserCreateModalProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
  });

  const onSubmit = async (data: UserCreateFormData) => {
    const response = await usersApi.create(data);
    if (response.status === 'ok' && response.data) {
      onSuccess(response.data);
      reset();
    } else {
      showToast(response.error || 'Ошибка создания', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый пользователь">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Имя пользователя"
          {...register('username')}
          error={errors.username?.message}
          placeholder="Минимум 3 символа"
        />
        <Input
          label="Пароль"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="Минимум 8 символов"
        />
        <Select
          label="Роль"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'user', label: 'Пользователь' },
            { value: 'admin', label: 'Администратор' },
          ]}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserFull | null;
  onSuccess: (user: UserFull) => void;
}

function UserEditModal({ isOpen, onClose, user, onSuccess }: UserEditModalProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        password: '',
        role: user.role,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UserUpdateFormData) => {
    if (!user) return;

    const payload: UserUpdateFormData = {};
    if (data.username !== user.username) payload.username = data.username;
    if (data.password) payload.password = data.password;
    if (data.role !== user.role) payload.role = data.role;

    if (Object.keys(payload).length === 0) {
      showToast('Нет изменений', 'info');
      return;
    }

    const response = await usersApi.update(user.id, payload);
    if (response.status === 'ok' && response.data) {
      onSuccess(response.data);
      reset();
    } else {
      showToast(response.error || 'Ошибка обновления', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать пользователя">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Имя пользователя"
          {...register('username')}
          error={errors.username?.message}
        />
        <Input
          label="Новый пароль (необязательно)"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="Оставьте пустым, чтобы не менять"
        />
        <Select
          label="Роль"
          {...register('role')}
          error={errors.role?.message}
          options={[
            { value: 'user', label: 'Пользователь' },
            { value: 'admin', label: 'Администратор' },
          ]}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
