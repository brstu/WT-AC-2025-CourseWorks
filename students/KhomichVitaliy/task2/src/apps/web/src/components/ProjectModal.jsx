import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#3b82f6'),
});

const ProjectModal = ({ isOpen, onClose, project }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      color: '#3b82f6',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create project');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['project', project?.id]);
      toast.success('Project updated successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update project');
    },
  });

  const onSubmit = async (data) => {
    if (project) {
      await updateMutation.mutateAsync({ id: project.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      reset(project || {
        name: '',
        description: '',
        color: '#3b82f6',
      });
    }
  }, [isOpen, project, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create Project'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className="input"
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
            placeholder="Enter project description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              {...register('color')}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              {...register('color')}
              className="input flex-1"
              placeholder="#3b82f6"
            />
          </div>
          {errors.color && (
            <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
          )}
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
            {isSubmitting ? 'Saving...' : project ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;