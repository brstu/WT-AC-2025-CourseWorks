import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, items, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {items.map((issue) => (
          <KanbanCard
            key={issue.id}
            issue={issue}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No issues</p>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;