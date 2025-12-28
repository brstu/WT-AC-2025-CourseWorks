import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesAPI } from '../api';
import { toast } from 'react-hot-toast';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const statusColumns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-200 dark:bg-gray-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-200 dark:bg-blue-900' },
  { id: 'DONE', title: 'Done', color: 'bg-green-200 dark:bg-green-900' },
  { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-200 dark:bg-red-900' },
];

const KanbanBoard = ({ issues, onEdit, onDelete }) => {
  const [activeId, setActiveId] = React.useState(null);
  const [items, setItems] = React.useState({});
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => issuesAPI.updateIssueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['issues']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update issue status');
    },
  });

  React.useEffect(() => {
    const grouped = issues.reduce((acc, issue) => {
      if (!acc[issue.status]) {
        acc[issue.status] = [];
      }
      acc[issue.status].push(issue);
      return acc;
    }, {});

    statusColumns.forEach(({ id }) => {
      if (!grouped[id]) {
        grouped[id] = [];
      }
    });

    setItems(grouped);
  }, [issues]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const activeStatus = Object.keys(items).find((status) =>
        items[status].some((item) => item.id === activeId)
      );
      const overStatus = overId;

      if (activeStatus && overStatus && activeStatus !== overStatus) {
        const activeItem = items[activeStatus].find((item) => item.id === activeId);
        
        if (activeItem) {
          await updateStatusMutation.mutateAsync({
            id: activeId,
            status: overStatus,
          });
        }
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId !== overId) {
      const activeStatus = Object.keys(items).find((status) =>
        items[status].some((item) => item.id === activeId)
      );
      const overStatus = overId;

      if (activeStatus && overStatus && activeStatus !== overStatus) {
        setItems((prevItems) => {
          const activeItems = prevItems[activeStatus];
          const overItems = prevItems[overStatus];
          
          const activeIndex = activeItems.findIndex((item) => item.id === activeId);
          const overIndex = overItems.findIndex((item) => item.id === overId);

          if (activeIndex !== -1) {
            const [removed] = activeItems.splice(activeIndex, 1);
            overItems.splice(overIndex >= 0 ? overIndex : overItems.length, 0, removed);
            
            return {
              ...prevItems,
              [activeStatus]: activeItems,
              [overStatus]: overItems,
            };
          }

          return prevItems;
        });
      }
    }
  };

  const getTaskById = (id) => {
    for (const status in items) {
      const task = items[status].find((item) => item.id === id);
      if (task) return task;
    }
    return null;
  };

  const activeTask = activeId ? getTaskById(activeId) : null;

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className={`${column.color} rounded-t-lg p-3`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {items[column.id]?.length || 0}
                  </span>
                </div>
              </div>
              
              <SortableContext
                items={items[column.id]?.map((item) => item.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={column.id}
                  items={items[column.id] || []}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard
              issue={activeTask}
              isDragging
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;