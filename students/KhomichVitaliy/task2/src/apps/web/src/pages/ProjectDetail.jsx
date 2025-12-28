import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { projectsAPI, issuesAPI } from '../api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import IssueModal from '../components/IssueModal';
import KanbanBoard from '../components/KanbanBoard';

const ProjectDetail = () => {
  const { id } = useParams();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getProject(id),
    enabled: !!id,
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', { projectId: id }],
    queryFn: () => issuesAPI.getIssues({ projectId: id }),
    enabled: !!id,
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (issueId) => issuesAPI.deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success('Issue deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete issue');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsAPI.deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted successfully');
      window.location.href = '/projects';
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    },
  });

  const handleDeleteProject = () => {
    if (window.confirm(`Are you sure you want to delete project "${project?.project?.name}"? This will also delete all issues in this project.`)) {
      deleteProjectMutation.mutate();
    }
  };

  const handleDeleteIssue = (issueId, title) => {
    if (window.confirm(`Are you sure you want to delete issue "${title}"?`)) {
      deleteIssueMutation.mutate(issueId);
    }
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setIsIssueModalOpen(true);
  };

  if (projectLoading || issuesLoading) {
    return <LoadingSpinner />;
  }

  if (!project?.project) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Project not found
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/projects" className="mt-6 btn-primary inline-flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  const projectData = project.project;
  const projectIssues = issues?.issues || [];

  // Статистика по статусам
  const statusStats = {
    TODO: projectIssues.filter(issue => issue.status === 'TODO').length,
    IN_PROGRESS: projectIssues.filter(issue => issue.status === 'IN_PROGRESS').length,
    DONE: projectIssues.filter(issue => issue.status === 'DONE').length,
    BLOCKED: projectIssues.filter(issue => issue.status === 'BLOCKED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4">
            <Link to="/projects" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: projectData.color }}
                />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectData.name}
                </h1>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {projectData.description || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Created {format(new Date(projectData.createdAt), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <UsersIcon className="h-4 w-4 mr-2" />
              {projectData.creator.name || 'Unknown'}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              {projectIssues.length} issues
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingIssue(null);
              setIsIssueModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Issue
          </button>
          <button
            onClick={handleDeleteProject}
            className="btn-danger flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete Project
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To Do</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statusStats.TODO}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">📝</span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statusStats.IN_PROGRESS}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">⚡</span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Done</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statusStats.DONE}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-semibold">✅</span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {statusStats.BLOCKED}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 font-semibold">🚧</span>
            </div>
          </div>
        </div>
      </div>

      {/* Канбан доска */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Project Board
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop issues to change their status
          </div>
        </div>

        {projectIssues.length > 0 ? (
          <KanbanBoard
            issues={projectIssues}
            onEdit={handleEditIssue}
            onDelete={handleDeleteIssue}
          />
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
              📋
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No issues yet
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Create your first issue to get started
            </p>
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="mt-6 btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Issue
            </button>
          </div>
        )}
      </div>

      {/* Список задач (табличный вид) */}
      {projectIssues.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Issues ({projectIssues.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projectIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/issues/${issue.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {issue.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {issue.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge status-${issue.status.toLowerCase().replace('_', '-')}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`priority-badge priority-${issue.priority.toLowerCase()}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {issue.assignee ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {issue.assignee.name?.charAt(0) || 'U'}
                          </div>
                          <span className="ml-2 text-sm">
                            {issue.assignee.name || issue.assignee.username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {issue.dueDate ? (
                        <span className="text-sm">
                          {format(new Date(issue.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditIssue(issue)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(issue.id, issue.title)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setEditingIssue(null);
        }}
        issue={editingIssue}
      />
    </div>
  );
};

export default ProjectDetail;