import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  ClockIcon,
  TagIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const KanbanCard = ({ issue, onEdit, onDelete, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(issue);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(issue.id, issue.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-item ${isDragging ? 'shadow-lg scale-105' : ''}`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {issue.title}
          </h4>
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-500"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {issue.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {issue.assignee ? (
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                  {issue.assignee.name?.charAt(0) || 'U'}
                </div>
              </div>
            ) : (
              <UserIcon className="h-4 w-4 text-gray-400" />
            )}
            
            {issue.dueDate && (
              <div className="flex items-center text-xs text-gray-500">
                <ClockIcon className="h-3 w-3 mr-1" />
                {format(new Date(issue.dueDate), 'MMM d')}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <span className={`text-xs px-2 py-1 rounded ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>
            
            {issue.labels.length > 0 && (
              <div className="relative group">
                <TagIcon className="h-4 w-4 text-gray-400" />
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {issue.labels.map(label => label.name).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;