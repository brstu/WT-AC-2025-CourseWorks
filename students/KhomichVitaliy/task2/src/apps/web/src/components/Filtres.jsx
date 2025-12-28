import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI, usersAPI, labelsAPI } from '../api';

const Filters = ({ onFilter, initialFilters = {} }) => {
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getProjects(),
    select: (data) => data.projects,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getUsers(),
    select: (data) => data.users,
  });

  const { data: labels } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsAPI.getLabels(),
    select: (data) => data.labels,
  });

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: initialFilters,
  });

  const onSubmit = (data) => {
    onFilter(data);
  };

  const handleReset = () => {
    reset();
    onFilter({});
  };

  const hasFilters = Object.values(watch()).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              {...register('search')}
              className="input"
              placeholder="Search issues..."
            />
          </div>

          {/* Проект */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              {...register('projectId')}
              className="input"
            >
              <option value="">All Projects</option>
              {projects?.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          {/* Приоритет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="input"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Исполнитель */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              {...register('assigneeId')}
              className="input"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users?.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username}
                </option>
              ))}
            </select>
          </div>

          {/* Метки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Labels
            </label>
            <select
              {...register('labelIds')}
              className="input"
              multiple
              size={3}
            >
              {labels?.map(label => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Кнопки фильтров */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {hasFilters ? 'Filters applied' : 'No filters applied'}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              disabled={!hasFilters}
            >
              Clear Filters
            </button>
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Filters;