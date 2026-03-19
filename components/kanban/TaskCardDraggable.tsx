'use client';

import { Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';

interface TaskCardDraggableProps {
  task: Task;
  status: TaskStatus;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  onDragStart: (taskId: string, status: TaskStatus) => void;
  onDragEnd: () => void;
}

/**
 * Draggable task card wrapper with visual feedback
 * Provides drag start/end events for Kanban board
 */
export default function TaskCardDraggable({
  task,
  status,
  onDelete,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: TaskCardDraggableProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id, status)}
      onDragEnd={onDragEnd}
      className={`transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } cursor-move hover:shadow-lg`}
    >
      <TaskCard task={task} onDelete={onDelete} />
    </div>
  );
}
