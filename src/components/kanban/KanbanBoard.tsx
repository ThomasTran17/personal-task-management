import { useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger, KanbanColumn } from '@/components';
import { useGetTasksQuery, useDeleteTaskMutation } from '@/api';
import type { TaskStatus, TaskPriority } from '@/types';
import { sortTasksByDeadline } from '@/lib';
import {
  usePeriodicDeadlineCheck,
  useBrowserNotifications,
  useTitleBadge,
  useDragAndDrop,
} from '@/hooks';

interface KanbanBoardProps {
  searchQuery: string;
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';
  onFilterStatusChange: (status: TaskStatus | 'all') => void;
}

const COLUMNS = [
  { status: 'TODO' as TaskStatus, label: 'TO DO', bgColor: 'bg-red-100' },
  { status: 'IN_PROGRESS' as TaskStatus, label: 'IN PROGRESS', bgColor: 'bg-yellow-100' },
  { status: 'DONE' as TaskStatus, label: 'DONE', bgColor: 'bg-green-100' },
] as const;

export default function KanbanBoard({
  searchQuery,
  filterStatus,
  filterPriority,
  onFilterStatusChange,
}: KanbanBoardProps) {
  // RTK Query hooks for data fetching
  const { data: tasks = [] } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();

  // Drag and drop hook
  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useDragAndDrop();

  // Setup periodic deadline check (toast notifications)
  usePeriodicDeadlineCheck();

  // Setup browser notifications (web push)
  useBrowserNotifications();

  // Setup title badge with deadline count
  useTitleBadge();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter by title (case-insensitive)
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      const tasksByStatus = filteredTasks.filter((task) => task.status === status);
      // Sort by deadline for todo and in-progress, keep as-is for done
      if (status === 'TODO' || status === 'IN_PROGRESS') {
        return sortTasksByDeadline(tasksByStatus);
      }
      return tasksByStatus;
    },
    [filteredTasks]
  );

  return (
    <div className="w-full min-h-screen bg-background pb-24 lg:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Grid View */}
        <div
          className="hidden lg:grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${filterStatus === 'all' ? 3 : 1}, minmax(0, 1fr))`,
          }}
        >
          {COLUMNS.map((column) => {
            // Hide columns if specific status is filtered
            if (filterStatus !== 'all' && column.status !== filterStatus) {
              return null;
            }

            return (
              <KanbanColumn
                key={column.status}
                status={column.status}
                label={column.label}
                bgColor={column.bgColor}
                tasks={getTasksByStatus(column.status)}
                onDeleteTask={(id: string) => {
                  void deleteTask(id);
                }}
                isFiltered={filterStatus !== 'all'}
                draggedTaskId={dragState.draggedTaskId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            );
          })}
        </div>

        {/* Mobile Tabs View */}
        <div className="lg:hidden">
          <Tabs
            value={filterStatus === 'all' ? 'TODO' : filterStatus}
            onValueChange={(value) => onFilterStatusChange(value as TaskStatus)}
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {COLUMNS.map((column) => (
                <TabsTrigger key={column.status} value={column.status}>
                  {column.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {COLUMNS.map((column) => (
              <TabsContent key={column.status} value={column.status} className="mt-0">
                <KanbanColumn
                  status={column.status}
                  label={column.label}
                  bgColor={column.bgColor}
                  tasks={getTasksByStatus(column.status)}
                  onDeleteTask={(id: string) => {
                    void deleteTask(id);
                  }}
                  draggedTaskId={dragState.draggedTaskId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
