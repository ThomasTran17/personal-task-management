import { useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger, KanbanColumn } from '@/components';
import { useDeleteTaskMutation } from '@/api';
import type { TaskStatus } from '@/types';
import type { Task } from '@/types/task';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { sortTasksByDeadline } from '@/lib';
import {
  usePeriodicDeadlineCheck,
  useBrowserNotifications,
  useTitleBadge,
  useDragAndDrop,
} from '@/hooks';

interface KanbanBoardProps {
  tasks: readonly Task[];
  _isLoading?: boolean;
  _error?: FetchBaseQueryError | SerializedError;
  filterStatus: TaskStatus | 'all';
  onFilterStatusChange: (status: TaskStatus | 'all') => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

const COLUMNS = [
  { status: 'TODO' as TaskStatus, label: 'TO DO', bgColor: 'bg-red-100' },
  { status: 'IN_PROGRESS' as TaskStatus, label: 'IN PROGRESS', bgColor: 'bg-yellow-100' },
  { status: 'DONE' as TaskStatus, label: 'DONE', bgColor: 'bg-green-100' },
] as const;

export default function KanbanBoard({
  tasks,
  _isLoading = false,
  _error,
  filterStatus,
  onFilterStatusChange,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  // RTK Query hooks for mutations
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

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      const tasksByStatus = tasks.filter((task) => task.status === status);

      if (status === 'TODO' || status === 'IN_PROGRESS') {
        return sortTasksByDeadline(tasksByStatus);
      }
      return tasksByStatus;
    },
    [tasks]
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
                  const task = tasks.find((t) => t.id === id);
                  if (task) {
                    onDeleteTask?.(task);
                  }
                }}
                isFiltered={filterStatus !== 'all'}
                draggedTaskId={dragState.draggedTaskId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEditTask={onEditTask}
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
