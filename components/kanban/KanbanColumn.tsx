'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types/task';
import TaskCardDraggable from '@/components/kanban/TaskCardDraggable';
import EmptyColumnState from '@/components/kanban/EmptyColumnState';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  bgColor: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  isFiltered?: boolean;
  draggedTaskId?: string | null;
  onDragStart: (taskId: string, status: TaskStatus) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (status: TaskStatus, e: React.DragEvent<HTMLDivElement>) => void;
}

export default function KanbanColumn({
  status,
  label,
  bgColor,
  tasks,
  onDeleteTask,
  isFiltered = false,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${bgColor} border-2 border-border rounded-t-lg p-4 font-bold text-foreground`}>
        <div className="flex items-center justify-between">
          <span className="text-lg">{label}</span>
          <span className="bg-foreground text-background px-3 py-1 rounded-full text-sm font-bold">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container - Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(status, e)}
        className={`flex-1 bg-secondary-background border-2 border-t-0 border-border rounded-b-lg p-4 overflow-y-auto transition-all duration-200 ${
          draggedTaskId ? 'ring-2 ring-offset-2 ring-main' : ''
        } ${isFiltered ? 'grid grid-cols-3 gap-3 auto-rows-max' : 'space-y-3'}`}
      >
        {tasks.length === 0 ? (
          <EmptyColumnState status={status} isFiltered={isFiltered} />
        ) : (
          tasks.map((task) => (
            <TaskCardDraggable
              key={task.id}
              task={task}
              status={status}
              onDelete={onDeleteTask}
              isDragging={draggedTaskId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
