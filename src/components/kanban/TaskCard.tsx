import { useState, useMemo, useEffect } from 'react';
import { Card, Button } from '@/components';
import type { Task } from '@/types';
import { Trash2, Edit2, Calendar, AlertCircle, Clock } from 'lucide-react';
import {
  cn,
  getDeadlineStatus,
  getDeadlineStatusClass,
  formatDateTime,
  deadlineUpdateSignal,
} from '@/lib';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

const priorityColors: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
  HIGH: 'bg-red-100 text-red-800 border-red-300',
};

export default function TaskCard({ task, onDelete, onEditTask }: TaskCardProps) {
  const [signalCurrentTime, setSignalCurrentTime] = useState<number | undefined>(undefined); // Timestamp from signal
  // Subscribe to deadline update signals + periodic timer
  useEffect(() => {
    if (!task.dueDate || task.status === 'DONE') {
      return;
    }

    // Subscribe to immediate updates from notifications
    const unsubscribe = deadlineUpdateSignal.subscribe((payload) => {
      setSignalCurrentTime(payload.currentTime);
    });

    // Periodically trigger re-render for relative time updates (e.g., "1 hour left")
    const interval = setInterval(() => {
      setSignalCurrentTime((prev) => prev ?? Date.now());
    }, 10000); // 10 seconds for faster UI updates

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [task.dueDate, task.status]);

  // Memoized deadline status - re-compute when time updates
  const deadlineStatus = useMemo(() => {
    const status = getDeadlineStatus(task.dueDate, task.status, signalCurrentTime);
    return status;
  }, [task.dueDate, task.status, signalCurrentTime]);

  const { isOverdue, isDueSoon, isUrgent } = deadlineStatus;

  // Memoized deadline status class
  const deadlineStatusClass = useMemo(
    () => getDeadlineStatusClass(isOverdue, isUrgent, isDueSoon),
    [isOverdue, isUrgent, isDueSoon]
  );

  return (
    <>
      <Card className="prose prose-sm bg-background border-2 border-border shadow-shadow hover:shadow-md transition-shadow p-4">
        {/* Task Title */}
        <h3 className="font-bold text-foreground mb-2 break-words text-sm leading-snug">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && task.description !== '<p></p>' && (
          <div
            className="min-h-0 max-h-30 truncate"
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="space-y-2 mb-3">
            {/* Main Due Date Display */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-base text-xs font-medium border-2 transition-all',
                deadlineStatusClass
              )}
            >
              {isOverdue ? (
                <AlertCircle className="size-4 flex-shrink-0" />
              ) : (
                <Calendar className="size-4 flex-shrink-0" />
              )}
              <span className="flex-1">
                {isOverdue ? 'Overdue' : isDueSoon ? 'Due Today/Tomorrow' : 'Due'}:{' '}
                {formatDateTime(task.dueDate)}
              </span>
            </div>

            {/* Urgent Warning - Within 1 Hour */}
            {isUrgent && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-base text-xs font-semibold border-2 bg-red-100 border-red-400 text-red-800 animate-pulse">
                <Clock className="size-4 flex-shrink-0" />
                <span>Deadline in less than 1 hour!</span>
              </div>
            )}
          </div>
        )}

        {/* Task Meta */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority Badge */}
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded border',
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onEditTask?.(task)}
              variant="neutral"
              size="icon"
              className="size-8 p-0 hover:bg-blue-100"
            >
              <Edit2 className="size-3" />
            </Button>
            <Button
              onClick={() => onDelete(task.id)}
              variant="neutral"
              size="icon"
              className="size-8 p-0 hover:bg-red-100"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
