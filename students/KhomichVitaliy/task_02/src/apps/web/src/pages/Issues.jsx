import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  TableCellsIcon,
  ViewColumnsIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { issuesAPI, exportAPI } from '../api';
import { toast } from 'react-hot-toast';
import Filters from '../components/Filters';
import IssueModal from '../components/IssueModal';
import KanbanBoard from '../components/KanbanBoard';
import ExportModal from '../components/ExportModal';

const Issues = () => {
  const [filters, setFilters] = useState({});
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [view, setView] = useState('table'); // 'table' или 'kanban'
  const [editingIssue, setEditingIssue] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issuesAPI.getIssues(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => issuesAPI.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
      toast.success('Issue deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete issue');
    },
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete issue "${title}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setIsIssueModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await exportAPI.exportIssues(filters);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `issues-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const issues = data?.issues || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Issues</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage all tasks across projects
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'table'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'kanban'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-secondary flex items-center"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Import
          </button>
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
        </div>
      </div>

      <Filters onFilter={setFilters} initialFilters={filters} />

      {view === 'kanban' ? (
        <KanbanBoard 
          issues={issues}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {issues.map((issue) => (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {issue.title}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {issue.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {issue.labels.map((label) => (
                            <span
                              key={label.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: `${label.color}20`,
                                color: label.color,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: issue.project.color }}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {issue.project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge status-${issue.status.toLowerCase().replace('_', '-')}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`priority-badge priority-${issue.priority.toLowerCase()}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {issue.assignee ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {issue.assignee.name?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {issue.assignee.name || issue.assignee.username}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {issue.dueDate
                        ? new Date(issue.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(issue)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(issue.id, issue.title)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {issues.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
            <FunnelIcon className="h-full w-full" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No issues found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try adjusting your filters or create a new issue
          </p>
        </motion.div>
      )}

      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setEditingIssue(null);
        }}
        issue={editingIssue}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default Issues;