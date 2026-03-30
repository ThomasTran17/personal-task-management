import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateTask } from '@/store/slices/taskSlice';
import type { TaskStatus } from '@/types/task';
import { toast } from 'sonner';

interface DragState {
  draggedTaskId: string | null;
  sourceStatus: TaskStatus | null;
}

/**
 * Hook for managing drag and drop state in Kanban board
 * Handles task movement between columns
 */
export const useDragAndDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    draggedTaskId: null,
    sourceStatus: null,
  });

  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  // Handle drag start
  const handleDragStart = (taskId: string, status: TaskStatus) => {
    setDragState({
      draggedTaskId: taskId,
      sourceStatus: status,
    });
  };

  // Handle drag over (required for drop)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (targetStatus: TaskStatus, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!dragState.draggedTaskId || !dragState.sourceStatus) {
      return;
    }

    // Find the task
    const task = tasks.find((t) => t.id === dragState.draggedTaskId);
    if (!task) {
      return;
    }

    // Update task status if dropped on different column
    if (dragState.sourceStatus !== targetStatus) {
      dispatch(updateTask({ id: dragState.draggedTaskId, updates: { status: targetStatus } }));
      toast.success(`Task moved to ${targetStatus}`, {
        description: `"${task.title}" is now in ${targetStatus} column`,
        duration: 3000,
      });
    }

    // Reset drag state
    setDragState({
      draggedTaskId: null,
      sourceStatus: null,
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragState({
      draggedTaskId: null,
      sourceStatus: null,
    });
  };

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
