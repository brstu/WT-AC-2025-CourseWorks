import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuesAPI, projectsAPI, usersAPI, labelsAPI } from '../api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional(),
  labelIds: z.array(z.string()).default([]),
});

const IssueModal = ({ isOpen, onClose, issue }) => {
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getProjects({ limit: 100 }),
    select: (data) => data.projects,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getUsers({ limit: 100 }),
    select: (data) => data.users,
  });

  const { data: labels } = useQuery({
    queryKey: ['labels'],
    queryFn: () => labelsAPI.getLabels(),
    select: (data) => data.labels,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: issue || {
      status: 'TODO',
      priority: 'MEDIUM',
      labelIds: [],
    },
  });

  const selectedLabels = watch('labelIds') || [];

  const createMutation = useMutation({
    mutationFn: (data) => issuesAPI.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success('Issue created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create issue');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => issuesAPI.updateIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      queryClient.invalidateQueries(['issue', issue?.id]);
      toast.success('Issue updated successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update issue');
    },
  });

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate || undefined,
      assigneeId: data.assigneeId || undefined,
    };

    if (issue) {
      await updateMutation.mutateAsync({ id: issue.id, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
  };

  const handleLabelToggle = (labelId) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    setValue('labelIds', newLabels);
  };

  React.useEffect(() => {
    if (isOpen) {
      reset(issue || {
        title: '',
        description: '',
        projectId: '',
        assigneeId: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        labelIds: [],
      });
    }
  }, [isOpen, issue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={issue ? 'Edit Issue' : 'Create Issue'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            {...register('title')}
            className="input"
            placeholder="Enter issue title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="input"
            placeholder="Enter issue description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project *
            </label>
            <select
              {...register('projectId')}
              className="input"
              disabled={!!issue}
            >
              <option value="">Select project</option>
              {projects?.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              {...register('assigneeId')}
              className="input"
            >
              <option value="">Unassigned</option>
              {users?.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="input"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="input"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="datetime-local"
            {...register('dueDate')}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {labels?.map(label => (
              <button
                key={label.id}
                type="button"
                onClick={() => handleLabelToggle(label.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedLabels.includes(label.id)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={{
                  borderColor: selectedLabels.includes(label.id) ? label.color : 'transparent',
                  borderWidth: '2px',
                }}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : issue ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueModal;