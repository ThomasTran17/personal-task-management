'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditTaskDialog from './EditTaskDialog';
import { Task } from '@/types/task';
import { Trash2, Edit2, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteDialogOpen(false);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isDueSoon = task.dueDate && !isOverdue && (new Date(task.dueDate).getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <>
      <Card className="bg-background border-2 border-border shadow-shadow hover:shadow-md transition-shadow p-4">
        {/* Task Title */}
        <h3 className="font-bold text-foreground mb-3 break-words text-sm leading-snug">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-foreground/60 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div
            className={cn(
              'flex items-center gap-2 mb-3 px-2 py-1 rounded text-xs font-medium',
              isOverdue
                ? 'bg-red-100 text-red-800 border border-red-300'
                : isDueSoon
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-green-100 text-green-800 border border-green-300'
            )}
          >
            {isOverdue ? (
              <AlertCircle className="size-3.5" />
            ) : (
              <Calendar className="size-3.5" />
            )}
            <span>
              {isOverdue ? 'Overdue' : isDueSoon ? 'Due Today/Tomorrow' : 'Due'}: {formatDate(task.dueDate)}
            </span>
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
            {task.priority.toUpperCase()}
          </span>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              variant="neutral"
              size="icon"
              className="size-8 p-0 hover:bg-blue-100"
            >
              <Edit2 className="size-3" />
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="neutral"
              size="icon"
              className="size-8 p-0 hover:bg-red-100"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
