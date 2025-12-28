import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { issuesAPI, commentsAPI } from '../api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import IssueModal from '../components/IssueModal';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesAPI.getIssue(id),
    enabled: !!id,
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsAPI.getComments(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => issuesAPI.deleteIssue(id),
    onSuccess: () => {
      toast.success('Issue deleted successfully');
      navigate('/issues');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete issue');
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (content) => commentsAPI.createComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', id]);
      setComment('');
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', id]);
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete comment');
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete issue "${issue?.issue?.title}"?`)) {
      deleteMutation.mutate();
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      createCommentMutation.mutate(comment.trim());
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!issue?.issue) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Issue not found
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The issue you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/issues" className="mt-6 btn-primary inline-flex items-center">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Issues
        </Link>
      </div>
    );
  }

  const issueData = issue.issue;
  const comments = commentsData?.comments || [];

  const canEdit = user?.id === issueData.creatorId || user?.role === 'ADMIN';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/issues"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Issues
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {issueData.title}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: issueData.project.color }}
                />
                <Link
                  to={`/projects/${issueData.project.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {issueData.project.name}
                </Link>
              </div>
              <span className={`status-badge status-${issueData.status.toLowerCase().replace('_', '-')}`}>
                {issueData.status.replace('_', ' ')}
              </span>
              <span className={`priority-badge priority-${issueData.priority.toLowerCase()}`}>
                {issueData.priority}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-6">
          {/* Описание */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {issueData.description ? (
                <p className="whitespace-pre-wrap">{issueData.description}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Комментарии */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments ({comments.length})
            </h2>

            {/* Форма комментария */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="input w-full"
                    placeholder="Add a comment..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!comment.trim() || createCommentMutation.isLoading}
                      className="btn-primary flex items-center"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      {createCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Список комментариев */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {comment.author.name?.charAt(0) || comment.author.username?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author.name || comment.author.username}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        {(user?.id === comment.authorId || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Детали */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created by
                </label>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {issueData.creator.name?.charAt(0) || 'U'}
                  </div>
                  <span className="ml-2 font-medium">
                    {issueData.creator.name || issueData.creator.username}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Assignee
                </label>
                {issueData.assignee ? (
                  <div className="flex items-center mt-1">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      {issueData.assignee.name?.charAt(0) || 'U'}
                    </div>
                    <span className="ml-2 font-medium">
                      {issueData.assignee.name || issueData.assignee.username}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Unassigned
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Due Date
                </label>
                {issueData.dueDate ? (
                  <div className="flex items-center mt-1">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">
                      {format(new Date(issueData.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500 dark:text-gray-400">No due date</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {issueData.labels.length > 0 ? (
                    issueData.labels.map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color,
                        }}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {label.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No labels</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="mt-1 font-medium">
                  {format(new Date(issueData.createdAt), 'MMM d, yyyy')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="mt-1 font-medium">
                  {format(new Date(issueData.updatedAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const newStatus = issueData.status === 'TODO' ? 'IN_PROGRESS' : 
                                   issueData.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';

                  toast.success(`Status changed to ${newStatus}`);
                }}
                className="w-full btn-secondary"
              >
                Change Status
              </button>
              <button
                onClick={() => {
                  toast.info('Reassign feature coming soon');
                }}
                className="w-full btn-secondary"
              >
                Reassign
              </button>
              <button
                onClick={() => {
                  toast.info('Duplicate feature coming soon');
                }}
                className="w-full btn-secondary"
              >
                Duplicate Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        issue={issueData}
      />
    </div>
  );
};

export default IssueDetail;